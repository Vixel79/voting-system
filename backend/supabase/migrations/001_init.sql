-- THE MUSEUM — Live Voting System
-- Initial database schema

create extension if not exists "pgcrypto";

-- ENUM TYPES

create type voter_type_enum as enum ('audience', 'judge');

create type voting_state_enum as enum (
  'upcoming',
  'open',
  'closed',
  'finalized'
);

-- CANDIDATES

create table candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- VOTING CONFIGURATION

create table voting_configuration (
  id int primary key default 1,

  state voting_state_enum not null default 'upcoming',

  first_place_points int not null default 3,
  second_place_points int not null default 2,
  third_place_points int not null default 1,

  audience_weight numeric(4,3) not null default 0.400,
  judges_weight numeric(4,3) not null default 0.600,

  finalized_at timestamptz,
  revealed_at timestamptz,
  updated_at timestamptz not null default now(),

  constraint single_voting_configuration_row
    check (id = 1),

  constraint weights_sum_to_one
    check (audience_weight + judges_weight = 1.000)
);

insert into voting_configuration (id)
values (1);

-- VOTING IDENTITIES

create table voting_identities (
  id uuid primary key default gen_random_uuid(),

  device_token uuid not null unique,

  voter_type voter_type_enum not null,

  has_voted boolean not null default false,

  created_at timestamptz not null default now()
);

-- VOTES

create table votes (
  id uuid primary key default gen_random_uuid(),

  voter_type voter_type_enum not null,

  device_token uuid not null unique
    references voting_identities(device_token),

  first_place_candidate_id uuid not null
    references candidates(id),

  second_place_candidate_id uuid not null
    references candidates(id),

  third_place_candidate_id uuid not null
    references candidates(id),

  created_at timestamptz not null default now(),

  constraint distinct_candidates
    check (
      first_place_candidate_id <> second_place_candidate_id
      and first_place_candidate_id <> third_place_candidate_id
      and second_place_candidate_id <> third_place_candidate_id
    )
);

create index idx_votes_voter_type
  on votes(voter_type);

create index idx_votes_created_at
  on votes(created_at);

-- AUDIT LOGS

create table audit_logs (
  id uuid primary key default gen_random_uuid(),

  event_type text not null,

  detail jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index idx_audit_logs_event_type
  on audit_logs(event_type);

create index idx_audit_logs_created_at
  on audit_logs(created_at);

--  SNAPSHOTS

create table results_snapshot (
  id uuid primary key default gen_random_uuid(),

  is_final boolean not null default false,

  computed_at timestamptz not null default now(),

  payload jsonb not null
);

create index idx_results_snapshot_final
  on results_snapshot(is_final);

-- ROW LEVEL SECURITY

alter table candidates enable row level security;
alter table voting_configuration enable row level security;
alter table voting_identities enable row level security;
alter table votes enable row level security;
alter table audit_logs enable row level security;
alter table results_snapshot enable row level security;

-- Public candidate reads are allowed.


create policy candidates_public_read
  on candidates
  for select
  using (true);