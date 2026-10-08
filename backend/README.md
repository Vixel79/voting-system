# The Museum — Live Voting System (Backend)

Backend-only API for a live event where ~500 attendees and a small
number of judges rank competing teams. Built for **October 1, 2026**.

This README covers the backend. The frontend team owns all UI — this
document exists to give them a clean API contract.

## 1. Architecture

```
Audience QR / Judge QR (frontend)
        │
        ▼
Node.js + Express API   ◄── sole authority for validation, scoring, duplicate protection
        │
        ▼
Supabase SDK (service-role key, backend only)
        │
        ▼
PostgreSQL  ── UNIQUE constraint on votes.device_token is the final
               guard against duplicate votes, including under
               concurrent requests
        │
        ▼
Supabase Realtime  ── broadcasts "results-updated" after each vote;
                       admin/stage frontends can subscribe or just
                       re-poll GET /api/results/live
```

## 2. Voter identity model

There are exactly two voter types — `audience` and `judge` — and **no
accounts of any kind**. The only identity concept is a random
`device_token` (a UUID, issued transparently via an httpOnly cookie on
first request), which is what the database's uniqueness constraint
hangs off of. Judges are not individually identified; a judge ballot is
distinguished only by `voter_type = 'judge'`, proven by knowing the
private judge link (see section 6).

## 3. Project structure

```
src/
  config/       env loading, Supabase client (service-role, backend-only)
  controllers/  request/response glue per route group
  routes/       public routes vs admin routes (separately protected)
  services/     vote submission pipeline, results computation, judge
                access check, minimal audit log
  middleware/   device-token cookie, rate limiting, admin auth, error handling
  validators/   pure ballot-shape validation (no DB access)
  scoring/      centralized scoring config + scoring engine (pure functions)
  realtime/     broadcasts "results-updated" over a Supabase Realtime channel
tests/
  unit/         scoring + validator logic
  integration/  full request pipeline against an in-memory fake Supabase client
  concurrency/  same-device race-condition proof
  load/         autocannon script for 600+ simulated voters
supabase/
  migrations/
    001_init.sql                  original schema (historical — do not edit)
    002_simplify_voter_model.sql  follow-up: drops judge_id/judges table/
                                   paused state — apply this too
  seed/         dev seed data + runner
```

## 4. Installation

```bash
npm install
cp .env.example .env
# fill in .env — see section 5
```

## 5. Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | API port |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend-only key; never sent to any frontend |
| `SUPABASE_ANON_KEY` | For a frontend's own direct Realtime subscription, if used |
| `CORS_ORIGIN` | Your deployed frontend origin |
| `ADMIN_API_KEY` | Bearer token protecting `/api/admin/*` |
| `JUDGE_ACCESS_TOKEN` | The literal token embedded in the private Judge QR link — see section 6 |
| `VOTE_RATE_LIMIT_WINDOW_MS` / `VOTE_RATE_LIMIT_MAX` | Abuse-signal rate limit on vote endpoints |

Generate secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 6. Judge access (no accounts, no per-judge identity)

The private Judge QR encodes:
```
https://your-frontend.example/judge-vote?jt=<JUDGE_ACCESS_TOKEN value>
```
The frontend reads `jt` from the URL and either calls
`GET /api/judge-access?jt=...` to check validity before rendering the
form, and/or sends it back as `judgeToken` in the `POST /api/judge-votes`
body. The backend compares it to `JUDGE_ACCESS_TOKEN` using a
constant-time comparison — this is a shared capability (anyone with the
link can vote once per device), not a login. If the token ever leaks,
rotate `JUDGE_ACCESS_TOKEN` and reprint the QR.

## 7. Supabase setup

1. Create a Supabase project.
2. Apply migrations **in order**: `001_init.sql` then
   `002_simplify_voter_model.sql` (via `supabase db push`, or paste each
   into the SQL editor in sequence). If `001_init.sql` was already
   applied to your project from a previous version of this backend,
   just run `002_simplify_voter_model.sql` — it's a proper forward
   migration, not a full reset.
3. Copy the project URL, service-role key, and anon key into `.env`.
4. (Dev only) set `DATABASE_URL` and run `npm run seed` to load sample
   teams from `supabase/seed/seed.sql`.

**Never run the seed script against the production project after real
teams have been entered** — it truncates the voting tables.

## 8. Running locally

```bash
npm run dev      # nodemon, auto-restart
npm start        # plain node
```

Health check: `GET /health`

## 9. Voting flows

**Audience:** scan QR → frontend calls `GET /api/candidates` and
`GET /api/voting-status` → select 1st/2nd/3rd → `POST /api/votes`. A
device-token cookie is issued transparently on the first request.

**Judges:** scan the private QR → frontend optionally calls
`GET /api/judge-access?jt=...` to validate the link → select
1st/2nd/3rd → `POST /api/judge-votes` with `judgeToken` in the body.

## 10. Scoring logic (see `src/scoring/scoringService.js`)

1. Ranked points per ballot: 1st = 3, 2nd = 2, 3rd = 1 (centralized in
   `scoringConfig.js` / `voting_configuration` table).
2. Each pool (audience, judges) is normalized independently to a 0–100
   scale: `(rawPoints / (ballotCount × 3)) × 100` — this is what makes
   combining pools of very different sizes meaningful.
3. Final score: `judgesScore × 0.60 + audienceScore × 0.40`.
4. Tie-break chain: final score → judges score → 1st-place count →
   2nd-place count → flagged `needsAdminReview: true` (never resolved
   randomly).

## 11. API reference

**Public**
- `GET /api/candidates`
- `GET /api/voting-status` — `{ state }`
- `GET /api/results/live` — see section 12 for what's returned at each state
- `GET /api/judge-access?jt=...` — `{ valid: boolean }`
- `POST /api/votes` — body: `{ first, second, third }`
- `POST /api/judge-votes` — body: `{ first, second, third, judgeToken }`

Success response: `{ "success": true, "message": "Your vote has been submitted successfully!" }`
Already voted: `409 { "success": false, "message": "You have already submitted your vote." }`
Voting not open: `403 { "success": false, "message": "Voting is currently closed." }`

**Admin** (require `Authorization: Bearer <ADMIN_API_KEY>`)
- `GET /api/admin/voting/status` — `{ state, audienceVotes, judgeVotes }`
- `POST /api/admin/voting/open`
- `POST /api/admin/voting/close`
- `POST /api/admin/results/reveal` — body: `{ acknowledgeTies?: boolean }`

There is no pause/resume and no judge-management endpoint — neither
exists in this model.

## 12. Voting states — close vs. reveal

```
upcoming → open → closed → finalized
```
No pausing; no skipping steps.

- **upcoming / open**: `GET /api/results/live` returns the live,
  changing standings: `{ revealed: false, isFinal: false, teams: [...] }`.
- **closed**: voting has stopped and the official result has already
  been computed and stored, but is deliberately hidden:
  `{ revealed: false, isFinal: false, message: "..." }` — no `teams`.
- **finalized** (after `POST /api/admin/results/reveal`): the stored,
  immutable result becomes public:
  `{ revealed: true, isFinal: true, teams: [...] }`.

If the stored result has unresolved ties, `reveal` responds `409` with
the tied teams and requires `{ acknowledgeTies: true }` to proceed —
ties are never broken randomly.

## 13. Duplicate protection & concurrency

Layered, in order of authority:
1. Browser cookie (httpOnly) carries a device token — zero-friction but
   not a hardware lock (disclosed, not hidden).
2. `voting_identities.device_token` and `votes.device_token` both carry
   a database `UNIQUE` constraint. Two simultaneous requests from the
   same device can both reach the server, but only one `INSERT` can
   succeed — Postgres rejects the second with `23505`, which the
   service layer turns into a clean "already voted" response. This is
   a single atomic constraint, not a separate check-then-insert.
3. Per-IP rate limiting as an abuse signal only (loose enough to never
   block legitimate shared-WiFi/NAT traffic from ~500 attendees).

`tests/concurrency/raceCondition.test.js` fires many simultaneous
requests from one simulated device and asserts exactly one vote lands.

## 14. Realtime

The Express layer broadcasts a lightweight `results-updated` event on
the `museum-results` Supabase Realtime channel after each accepted
vote. The frontend can subscribe to that channel directly (using the
anon key) and re-fetch `GET /api/results/live` on the event, or simply
poll that endpoint — either is fine; there is no custom WebSocket
server here.

## 15. Audit logging

Minimal by design — only these event types are ever written:
`state_change`, `final_result_generated`, `results_revealed`. Individual
vote submissions/rejections are **not** audit-logged (every rejection
reason is already returned directly to the voter in the API response,
and per-vote logging at 600+ ballots is noise with no operational
value). No personal information is ever logged, because none is
collected.

## 16. Testing

```bash
npm test                 # unit + integration
npm run test:unit
npm run test:integration
npm run test:concurrency # race-condition proof (standalone script)
npm run load:test        # requires a running instance + real candidate IDs, see file header
```

Integration tests run against an in-memory fake Supabase client
(`tests/helpers/fakeSupabase.js`) modeling the real `device_token`
uniqueness constraint — no live network needed to validate the request
pipeline, admin state machine, or close/reveal gating.

## 17. Deployment

Frontend and this API can be deployed separately; keep the API on any
always-on Node host (verify current free-tier sleep/spin-down and
concurrent-connection behavior before the event — don't assume).
Supabase hosts the database and Realtime regardless of where the API
runs. Run `npm run load:test` against the deployed URL before the event.

## 18. Security

- No accounts, passwords, or personal information anywhere.
- Service-role key lives only in this backend's environment.
- Admin endpoints require a bearer token, rate-limited separately.
- Input size capped (`express.json({ limit: '10kb' })`), Helmet for
  standard HTTP hardening, CORS locked to the configured frontend origin.
- Row Level Security enabled on every table as defense-in-depth (the
  backend uses the service-role key, which bypasses it by design).

## 19. Event-day checklist

- [ ] Real candidates entered (seed data replaced)
- [ ] `JUDGE_ACCESS_TOKEN` generated, embedded in the private judge QR, and not shared publicly
- [ ] `.env` secrets set on the deployed instance
- [ ] Load test run against the deployed URL at 600+ connections
- [ ] `POST /api/admin/voting/open` called before doors open
- [ ] After voting ends: `POST /api/admin/voting/close`, check `GET /api/admin/voting/status`, then `POST /api/admin/results/reveal` when ready to announce

## 20. Migration notes for teams upgrading from the previous version

If you already deployed the earlier version of this backend (the one
with per-judge identity, a `paused` state, and `/api/admin/dashboard`),
apply `002_simplify_voter_model.sql` — it safely drops `votes.judge_id`,
the `judges` table, and the `paused` enum value from a live database.
The old `/api/judge-session`, `/api/admin/dashboard`,
`/api/admin/judges/links`, `/api/admin/voting/pause`, and
`/api/admin/voting/reopen` endpoints no longer exist; update any
frontend code that called them per section 11 above.
