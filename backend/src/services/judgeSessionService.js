const crypto = require('crypto');
const env = require('../config/env');

/**
 * Judges have no individual identity in this system — only two voter
 * types exist (audience, judge), enforced purely through device_token.
 *
 * The private Judge QR encodes:
 *   https://example.com/judge-vote?jt=<JUDGE_ACCESS_TOKEN>
 *
 * JUDGE_ACCESS_TOKEN is a single long random secret (an env var, never
 * present in any frontend bundle) that organizers embed directly in the
 * QR they print/control. This is intentionally NOT a per-judge signed
 * token — there's nothing to sign, since there's no per-judge record
 * anymore. It's a shared capability: whoever has the private link can
 * reach the judge voting flow, and each device that uses it still gets
 * exactly one vote via the same device_token uniqueness the audience
 * flow relies on.
 *
 * This still satisfies "don't just trust ?type=judge" (spec section 6):
 * the token is checked with a constant-time comparison against the
 * server-side secret, so it can't be guessed or forged by copying a
 * query parameter name.
 */
function isValidJudgeToken(token) {
  if (typeof token !== 'string' || !token) return false;

  const expected = Buffer.from(env.judgeAccessToken || '');
  const given = Buffer.from(token);

  if (expected.length === 0) return false;
  if (expected.length !== given.length) return false;

  return crypto.timingSafeEqual(expected, given);
}

module.exports = { isValidJudgeToken };
