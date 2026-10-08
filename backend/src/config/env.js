require('dotenv').config();

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_API_KEY',
  'JUDGE_ACCESS_TOKEN',
];

function assertRequiredEnv() {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Copy .env.example to .env and fill these in before starting the server.'
    );
    process.exit(1);
  }
}

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  adminApiKey: process.env.ADMIN_API_KEY,
  judgeAccessToken: process.env.JUDGE_ACCESS_TOKEN,
  voteRateLimitWindowMs: parseInt(
    process.env.VOTE_RATE_LIMIT_WINDOW_MS || '60000',
    10
  ),
  voteRateLimitMax: parseInt(
    process.env.VOTE_RATE_LIMIT_MAX || '8',
    10
  ),
  deviceTokenCookieName:
    process.env.DEVICE_TOKEN_COOKIE_NAME || 'museum_device_token',
  resetVotesOnStart: process.env.RESET_VOTES_ON_START === 'true',
  assertRequiredEnv,
};