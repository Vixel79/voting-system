const { supabaseAdmin } = require('../config/supabase');
const {
  getLiveResults,
  saveSnapshot,
  getLatestFinalSnapshot,
} = require('../services/resultsService');
const { logAudit } = require('../services/auditService');
const { broadcastStateUpdated } = require('../realtime/realtimeService');

const VALID_TRANSITIONS = {
  upcoming: ['open'],
  open: ['closed'],
  closed: ['finalized'],
  finalized: [],
};

async function getCurrentConfig() {
  const { data, error } = await supabaseAdmin
    .from('voting_configuration')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) throw error;

  return data;
}

async function transitionState(nextState) {
  const current = await getCurrentConfig();
  const allowed = VALID_TRANSITIONS[current.state] || [];

  if (!allowed.includes(nextState)) {
    const err = new Error(
      `Cannot transition voting state from '${current.state}' to '${nextState}'.`
    );
    err.statusCode = 400;
    throw err;
  }

  const { error } = await supabaseAdmin
    .from('voting_configuration')
    .update({
      state: nextState,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) throw error;

  await logAudit('state_change', {
    from: current.state,
    to: nextState,
  });

  await broadcastStateUpdated(nextState);

  return current.state;
}

async function getVotingStatus(req, res, next) {
  try {
    const [config, { data: votes, error: votesErr }] = await Promise.all([
      getCurrentConfig(),
      supabaseAdmin.from('votes').select('voter_type'),
    ]);

    if (votesErr) throw votesErr;

    res.json({
      success: true,
      state: config.state,
      audienceVotes: votes.filter((v) => v.voter_type === 'audience').length,
      judgeVotes: votes.filter((v) => v.voter_type === 'judge').length,
    });
  } catch (err) {
    next(err);
  }
}

async function openVoting(req, res, next) {
  try {
    await transitionState('open');

    res.json({
      success: true,
      message: 'Voting is now open.',
      state: 'open',
    });
  } catch (err) {
    next(err);
  }
}

async function closeVoting(req, res, next) {
  try {
    await transitionState('closed');

    const results = await getLiveResults();
    const snapshot = await saveSnapshot(results, true);

    await logAudit('final_result_generated', {
      snapshotId: snapshot.id,
    });

    res.json({
      success: true,
      message:
        'Voting is closed. Final result computed and stored, pending reveal.',
      state: 'closed',
    });
  } catch (err) {
    next(err);
  }
}

async function revealResults(req, res, next) {
  try {
    const current = await getCurrentConfig();

    if (current.state !== 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Voting must be closed before results can be revealed.',
      });
    }

    const snapshot = await getLatestFinalSnapshot();

    if (!snapshot) {
      return res.status(500).json({
        success: false,
        message: 'No final result was computed at close time.',
      });
    }

    const unresolved = (snapshot.payload.teams || []).filter(
      (team) => team.needsAdminReview
    );

    if (
      unresolved.length > 0 &&
      req.body.acknowledgeTies !== true
    ) {
      return res.status(409).json({
        success: false,
        message:
          'Unresolved ties in the final result. Resend with acknowledgeTies: true to reveal anyway.',
        teams: snapshot.payload.teams,
      });
    }

    await transitionState('finalized');

    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('voting_configuration')
      .update({
        finalized_at: now,
        revealed_at: now,
      })
      .eq('id', 1);

    if (error) throw error;

    await logAudit('results_revealed', {
      snapshotId: snapshot.id,
    });

    res.json({
      success: true,
      message: 'Results revealed.',
      revealed: true,
      isFinal: true,
      ...snapshot.payload,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getVotingStatus,
  openVoting,
  closeVoting,
  revealResults,
};