const { supabaseAdmin } = require('../config/supabase');
const { getVotingConfiguration } = require('../services/voteService');

async function getCandidates(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .select('id, name, photo')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ success: true, candidates: data });
  } catch (err) {
    next(err);
  }
}

async function getVotingStatus(req, res, next) {
  try {
    const config = await getVotingConfiguration();
    res.json({ success: true, state: config.state });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCandidates, getVotingStatus };
