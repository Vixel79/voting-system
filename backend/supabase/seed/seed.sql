-- Development seed data. Replace with real Museum teams before the event.
-- Safe to re-run in a dev environment (clears and reinserts).
-- Requires 001_init.sql AND 002_simplify_voter_model.sql to have been applied.

truncate table votes cascade;
truncate table voting_identities cascade;
truncate table candidates cascade;
truncate table results_snapshot cascade;
truncate table audit_logs cascade;

update voting_configuration
set state = 'upcoming', finalized_at = null, revealed_at = null
where id = 1;

insert into candidates (name, photo, is_active) values
  ('Team A', null, true),
  ('Team B', null, true),
  ('Team C', null, true),
  ('Team D', null, true);

-- No judge seed data — judges are no longer individually identified.
-- The private Judge QR link is generated from JUDGE_ACCESS_TOKEN in .env;
-- see README section "Judge voting" for how to build/print it.
