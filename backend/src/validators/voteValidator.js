const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

/**
 * Validates the shape and internal consistency of a ballot submission.
 * Does NOT check candidate existence/eligibility or device history —
 * those require a database round trip and live in voteService, since
 * this function must stay pure and synchronously testable.
 *
 * @returns {{ valid: boolean, error?: string }}
 */
function validateBallotShape(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Malformed request body.' };
  }

  const { first, second, third, deviceToken } = body;

  if (!isUuid(deviceToken)) {
    return { valid: false, error: 'Missing or invalid voting session.' };
  }

  for (const [label, value] of [
    ['first', first],
    ['second', second],
    ['third', third],
  ]) {
    if (!isUuid(value)) {
      return { valid: false, error: 'Please select a valid 1st, 2nd, and 3rd place.' };
    }
  }

  const ids = [first, second, third];
  const unique = new Set(ids);
  if (unique.size !== 3) {
    return { valid: false, error: 'Each candidate can only be selected once.' };
  }

  return { valid: true };
}

module.exports = { validateBallotShape, isUuid };
