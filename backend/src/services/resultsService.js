const { supabaseAdmin } = require('../config/supabase');
const { computeResults } = require('../scoring/scoringService');
const scoringConfig = require('../scoring/scoringConfig');

async function fetchScoringInputs() {
  const [{ data: candidates, error: candErr }, { data: votes, error: voteErr }] = await Promise.all([
    supabaseAdmin.from('candidates').select('id, name, photo').eq('is_active', true),
    supabaseAdmin
      .from('votes')
      .select('voter_type, first_place_candidate_id, second_place_candidate_id, third_place_candidate_id'),
  ]);

  if (candErr || voteErr) {
    throw new Error('Failed to load scoring inputs from database.');
  }

  return {
    candidates,
    audienceVotes: votes.filter((v) => v.voter_type === 'audience'),
    judgeVotes: votes.filter((v) => v.voter_type === 'judge'),
  };
}

async function getLiveResults() {
  const { candidates, audienceVotes, judgeVotes } = await fetchScoringInputs();

  // Pull live weight/points config from the DB so organizers can tune it
  // without a redeploy, falling back to the code-level defaults.
  const { data: dbConfig } = await supabaseAdmin.from('voting_configuration').select('*').eq('id', 1).single();

  const config = dbConfig
    ? {
        FIRST_PLACE_POINTS: dbConfig.first_place_points,
        SECOND_PLACE_POINTS: dbConfig.second_place_points,
        THIRD_PLACE_POINTS: dbConfig.third_place_points,
        AUDIENCE_WEIGHT: Number(dbConfig.audience_weight),
        JUDGES_WEIGHT: Number(dbConfig.judges_weight),
        TIE_BREAK_ORDER: scoringConfig.TIE_BREAK_ORDER,
      }
    : scoringConfig;

  return computeResults({ candidates, audienceVotes, judgeVotes, config });
}

/**
 * Persists a results snapshot. When `isFinal` is true, this is the
 * immutable record the Stage Screen and Admin Dashboard fall back to
 * after finalization — later votes (there shouldn't be any once voting
 * is closed) never overwrite it.
 */
async function saveSnapshot(results, isFinal) {
  const { data, error } = await supabaseAdmin
    .from('results_snapshot')
    .insert({ is_final: isFinal, payload: results })
    .select()
    .single();
  if (error) throw new Error('Failed to persist results snapshot.');
  return data;
}

async function getLatestFinalSnapshot() {
  const { data, error } = await supabaseAdmin
    .from('results_snapshot')
    .select('*')
    .eq('is_final', true)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error('Failed to read final results snapshot.');
  return data;
}

module.exports = { getLiveResults, saveSnapshot, getLatestFinalSnapshot, fetchScoringInputs };