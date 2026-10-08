const { supabaseAdmin } = require('../config/supabase');

async function resetVotingData() {
  const tables = [
    'results_snapshot',
    'audit_logs',
    'votes',
    'voting_identities',
  ];

  for (const table of tables) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .not('id', 'is', null);

    if (error) {
      throw new Error(`Failed to reset ${table}: ${error.message}`);
    }
  }

  const { error } = await supabaseAdmin
    .from('voting_configuration')
    .update({
      state: 'upcoming',
      finalized_at: null,
      revealed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    throw new Error(
      `Failed to reset voting configuration: ${error.message}`
    );
  }
}

module.exports = { resetVotingData };