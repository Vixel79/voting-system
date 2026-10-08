const { supabaseAdmin } = require('../config/supabase');
const { validateBallotShape } = require('../validators/voteValidator');
const { broadcastResultsUpdated } = require('../realtime/realtimeService');

class VoteError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Fetches (or lazily creates) the voting_identities row for a given device
 * token. This is called once per request and is intentionally cheap —
 * the actual duplicate-vote race is closed by the UNIQUE constraint on
 * votes.device_token, not by this read.
 */
async function ensureVotingIdentity(deviceToken, voterType) {
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from('voting_identities')
    .select('*')
    .eq('device_token', deviceToken)
    .maybeSingle();

  if (fetchErr) throw new VoteError('Internal error validating voting session.', 500);

  if (existing) return existing;

  const { data: created, error: insertErr } = await supabaseAdmin
    .from('voting_identities')
    .insert({ device_token: deviceToken, voter_type: voterType })
    .select()
    .single();

  // A concurrent request may have created it a moment earlier — that's fine,
  // just re-fetch. Any other error is real.
  if (insertErr) {
    if (insertErr.code === '23505') {
      const { data: refetched } = await supabaseAdmin
        .from('voting_identities')
        .select('*')
        .eq('device_token', deviceToken)
        .maybeSingle();
      if (refetched) return refetched;
    }
    throw new VoteError('Internal error validating voting session.', 500);
  }

  return created;
}

async function getVotingConfiguration() {
  const { data, error } = await supabaseAdmin
    .from('voting_configuration')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw new VoteError('Internal error reading voting status.', 500);
  return data;
}

async function getActiveCandidateIds() {
  const { data, error } = await supabaseAdmin
    .from('candidates')
    .select('id')
    .eq('is_active', true);
  if (error) throw new VoteError('Internal error validating candidates.', 500);
  return new Set(data.map((c) => c.id));
}

/**
 * Full submission pipeline for BOTH audience and judge ballots. There is
 * no per-judge identity anywhere in this system — voterType plus
 * device_token is the entire identity model (spec: two voter types, no
 * accounts). Per-vote audit records are intentionally NOT written here;
 * see auditService for what is and isn't logged.
 *
 * @param {object} params
 * @param {object} params.body - { first, second, third, deviceToken }
 * @param {'audience'|'judge'} params.voterType
 * @returns {Promise<{success: true, message: string, voteId: string}>}
 * @throws {VoteError}
 */
async function submitVote({ body, voterType }) {
  // 1–2: structural + session validation
  const shapeCheck = validateBallotShape(body);
  if (!shapeCheck.valid) {
    throw new VoteError(shapeCheck.error, 400);
  }

  const { first, second, third, deviceToken } = body;

  // voting must be open
  const config = await getVotingConfiguration();
  if (config.state !== 'open') {
    throw new VoteError('Voting is currently closed.', 403);
  }

  // candidates must exist and be currently eligible
  const activeIds = await getActiveCandidateIds();
  for (const id of [first, second, third]) {
    if (!activeIds.has(id)) {
      throw new VoteError('One or more selected candidates are not available.', 400);
    }
  }

  // device/session check — lazily register the identity
  const identity = await ensureVotingIdentity(deviceToken, voterType);
  if (identity.voter_type !== voterType) {
    // A device token minted for one flow should never be replayed on the other.
    throw new VoteError('This voting session is not valid for this ballot type.', 403);
  }
  if (identity.has_voted) {
    throw new VoteError('You have already submitted your vote.', 409);
  }

  // Atomic write. The UNIQUE constraint on votes.device_token is the real
  // race-condition guard: if two requests for the same device arrive
  // simultaneously, only one INSERT can succeed — the other gets a 23505
  // (unique_violation) from Postgres and is rejected cleanly. No separate
  // "check then insert" — the constraint IS the check.
  const insertPayload = {
    voter_type: voterType,
    device_token: deviceToken,
    first_place_candidate_id: first,
    second_place_candidate_id: second,
    third_place_candidate_id: third,
  };

  const { data: vote, error: voteErr } = await supabaseAdmin
    .from('votes')
    .insert(insertPayload)
    .select('id')
    .single();

  if (voteErr) {
    if (voteErr.code === '23505') {
      throw new VoteError('You have already submitted your vote.', 409);
    }
    throw new VoteError('Unable to save your vote. Please try again.', 500);
  }

  // Mark the identity used (best-effort; the votes UNIQUE constraint is
  // still the actual source of truth even if this update lags).
  await supabaseAdmin
    .from('voting_identities')
    .update({ has_voted: true })
    .eq('device_token', deviceToken);

  // Fire-and-forget: never let a realtime hiccup fail the voter's confirmation.
  broadcastResultsUpdated({ voterType }).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Realtime broadcast failed:', err.message);
  });

  return { success: true, message: 'Your vote has been submitted successfully!', voteId: vote.id };
}

module.exports = { submitVote, ensureVotingIdentity, getVotingConfiguration, VoteError };
