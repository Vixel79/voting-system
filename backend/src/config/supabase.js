const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

/**
 * IMPORTANT: This client is created with the service-role key and must
 * NEVER be imported into any code that runs in a browser or is sent to
 * the frontend. It bypasses Row Level Security intentionally — the
 * Express layer is the sole authority for what writes are permitted.
 */
const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: 'public' },
});

module.exports = { supabaseAdmin };
