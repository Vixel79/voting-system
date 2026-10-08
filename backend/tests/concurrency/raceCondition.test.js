process.env.NODE_ENV = 'test';
process.env.ADMIN_API_KEY = 'test-admin-key';
process.env.JUDGE_ACCESS_TOKEN = 'test-judge-token';

/**
 * Standalone script (not a jest test) that exercises the actual race
 * condition described in spec section 12/28: many simultaneous requests
 * carrying the SAME device token must result in exactly one accepted
 * vote and the rest rejected — enforced by the simulated UNIQUE
 * constraint on votes.device_token in the fake Supabase layer, which
 * models the real Postgres constraint in supabase/migrations/001_init.sql.
 *
 * Run directly: node tests/concurrency/raceCondition.test.js
 * (Also safe to adapt into a jest test; kept standalone so it can be
 * pointed at a real deployed instance later by swapping the request
 * layer for an HTTP client against a live URL.)
 */
const { createFakeSupabase } = require('../helpers/fakeSupabase');

async function main() {
  jest_mock_config();

  // eslint-disable-next-line global-require
  const request = require('supertest');
  // eslint-disable-next-line global-require
  const app = require('../../src/app');
  // eslint-disable-next-line global-require
  const { supabaseAdmin } = require('../../src/config/supabase');

  const A = 'a1111111-1111-1111-1111-111111111111';
  const B = 'b2222222-2222-2222-2222-222222222222';
  const C = 'c3333333-3333-3333-3333-333333333333';

  supabaseAdmin._db.candidates.push(
    { id: A, name: 'Team A', is_active: true },
    { id: B, name: 'Team B', is_active: true },
    { id: C, name: 'Team C', is_active: true }
  );

  const CONCURRENT_REQUESTS = 25;
  const agent = request.agent(app); // shares the same device-token cookie across requests

  // Prime the cookie with a single warm-up-less approach: fire all requests
  // truly concurrently from the SAME agent (same cookie jar), simulating a
  // double-tap / retry storm from one device.
  const results = await Promise.all(
    Array.from({ length: CONCURRENT_REQUESTS }, () =>
      agent.post('/api/votes').send({ first: A, second: B, third: C })
    )
  );

  const accepted = results.filter((r) => r.status === 201);
  const rejected = results.filter((r) => r.status !== 201);

  console.log(`Concurrent requests sent: ${CONCURRENT_REQUESTS}`);
  console.log(`Accepted (should be exactly 1): ${accepted.length}`);
  console.log(`Rejected (should be ${CONCURRENT_REQUESTS - 1}): ${rejected.length}`);

  const votesInDb = supabaseAdmin._db.votes.length;
  console.log(`Rows actually persisted in votes table (should be 1): ${votesInDb}`);

  if (accepted.length !== 1 || votesInDb !== 1) {
    console.error('FAIL: race condition allowed more than one vote through.');
    process.exitCode = 1;
  } else {
    console.log('PASS: exactly one vote was accepted under concurrent load.');
  }
}

function jest_mock_config() {
  // When run outside Jest (plain `node`), there is no jest.doMock, so we
  // patch the module cache directly to inject the fake Supabase client.
  const Module = require('module');
  const resolved = require.resolve('../../src/config/supabase');
  const fakeModule = new Module(resolved);
  fakeModule.exports = { supabaseAdmin: createFakeSupabase() };
  require.cache[resolved] = fakeModule;
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = { main };
