const { supabaseAdmin } = require('../config/supabase');
const { computeResults, computeLiveAudienceResults } = require('../scoring/scoringService');
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
  const { candidates, audienceVotes } = await fetchScoringInputs();

  const { data: dbConfig } = await supabaseAdmin
    .from('voting_configuration')
    .select('*')
    .eq('id', 1)
    .single();

  const config = dbConfig
    ? {
        FIRST_PLACE_POINTS: dbConfig.first_place_points,
        SECOND_PLACE_POINTS: dbConfig.second_place_points,
        THIRD_PLACE_POINTS: dbConfig.third_place_points,
      }
    : scoringConfig;

  // Live view computes unweighted audience score only
  return computeLiveAudienceResults({ candidates, audienceVotes, config });
}

// Used when voting ends or when snapshotting the final result
async function computeFinalResults() {
  const { candidates, audienceVotes, judgeVotes } = await fetchScoringInputs();

  const { data: dbConfig } = await supabaseAdmin
    .from('voting_configuration')
    .select('*')
    .eq('id', 1)
    .single();

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

module.exports = {
  getLiveResults,
  computeFinalResults,
  saveSnapshot,
  getLatestFinalSnapshot,
  fetchScoringInputs,
};