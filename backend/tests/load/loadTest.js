/**
 * Load test for the live event scenario: 600+ simultaneous voting users.
 *
 * Run against a REAL running instance (local or staging), never against
 * production during the actual event:
 *
 *   npm run start                # in one terminal
 *   BASE_URL=http://localhost:3000 npm run load:test   # in another
 *
 * This uses distinct device tokens per simulated user (each autocannon
 * connection gets its own cookie jar), which is the realistic shape of
 * event traffic — 600 different phones, not 600 retries of one device.
 * The dedicated race-condition test (tests/concurrency/raceCondition.test.js)
 * covers the "same device fires many requests" scenario separately.
 */
const autocannon = require('autocannon');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONNECTIONS = parseInt(process.env.LOAD_CONNECTIONS || '600', 10);
const DURATION = parseInt(process.env.LOAD_DURATION_SEC || '20', 10);

// NOTE: candidate IDs must exist in the target environment (seed data or real teams).
const CANDIDATE_IDS = (process.env.LOAD_CANDIDATE_IDS || '').split(',').filter(Boolean);

if (CANDIDATE_IDS.length < 3) {
  console.error(
    'Set LOAD_CANDIDATE_IDS to a comma-separated list of at least 3 real candidate UUIDs ' +
      'from the target environment before running this script.'
  );
  process.exit(1);
}

const [first, second, third] = CANDIDATE_IDS;

async function run() {
  console.log(`Load testing ${BASE_URL}/api/votes with ${CONNECTIONS} connections for ${DURATION}s...`);

  const result = await autocannon({
    url: `${BASE_URL}/api/votes`,
    connections: CONNECTIONS,
    duration: DURATION,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ first, second, third }),
  });

  console.log(autocannon.printResult(result));

  console.log('\n--- Result summary ---');
  console.log(`2xx: ${result['2xx']}`);
  console.log(`Non-2xx: ${result.non2xx}`);
  console.log(`Errors: ${result.errors}`);
  console.log(`Timeouts: ${result.timeouts}`);

  if (result.errors > 0 || result.timeouts > 0) {
    console.warn('Some requests errored/timed out — review before event day.');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
