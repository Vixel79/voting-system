require('dotenv').config();

const { supabaseAdmin } = require('../../src/config/supabase');

async function runSeed() {
  console.log('Starting development seed...');

  const tablesToClear = [
    'votes',
    'voting_identities',
    'results_snapshot',
    'audit_logs',
    'candidates',
  ];

  for (const table of tablesToClear) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .not('id', 'is', null);

    if (error) {
      throw new Error(`Failed to clear ${table}: ${error.message}`);
    }
  }

  const { error: configError } = await supabaseAdmin
    .from('voting_configuration')
    .update({
      state: 'upcoming',
      finalized_at: null,
      revealed_at: null,
    })
    .eq('id', 1);

  if (configError) {
    throw new Error(`Failed to reset voting configuration: ${configError.message}`);
  }

  const candidates = [
    { name: 'Team السم في العسل', photo: null, is_active: true },
    { name: 'Team B', photo: null, is_active: true },
    { name: 'Team C', photo: null, is_active: true },
    { name: 'Team D', photo: null, is_active: true },
  ];

  const { error: candidateError } = await supabaseAdmin
    .from('candidates')
    .insert(candidates);

  if (candidateError) {
    throw new Error(`Failed to insert candidates: ${candidateError.message}`);
  }

  console.log('Seed applied successfully.');
}

runSeed().catch((error) => {
  console.error('Failed to apply seed:', error.message);
  process.exit(1);
});