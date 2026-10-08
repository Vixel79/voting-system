const { getLiveResults, getLatestFinalSnapshot } = require('../services/resultsService');
const { getVotingConfiguration } = require('../services/voteService');

/**
 * Exposure rule for GET /api/results/live:
 *   - upcoming / open: live computed standings (the in-progress
 *     leaderboard the stage screen shows while voting is happening).
 *   - closed: voting has ended and the official result has been computed
 *     and stored, but must NOT be exposed yet — reveal is a distinct
 *     admin action (spec section 16). Respond with revealed: false and
 *     no team data.
 *   - finalized: return the stored, immutable final snapshot.
 */
async function getLiveResultsEndpoint(req, res, next) {
  try {
    const config = await getVotingConfiguration();

    if (config.state === 'finalized') {
      const final = await getLatestFinalSnapshot();
      if (final) {
        return res.json({ success: true, revealed: true, isFinal: true, ...final.payload });
      }
      // Defensive fallback — should not happen if close() always snapshots first.
      const live = await getLiveResults();
      return res.json({ success: true, revealed: true, isFinal: true, ...live });
    }

    if (config.state === 'closed') {
      return res.json({
        success: true,
        revealed: false,
        isFinal: false,
        message: 'Voting has closed. Results have not been revealed yet.',
      });
    }

    // upcoming / open — live, in-progress standings
    const live = await getLiveResults();
    res.json({ success: true, revealed: false, isFinal: false, ...live });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLiveResultsEndpoint };
