const env = require('./config/env');
env.assertRequiredEnv();

const app = require('./app');
const { resetVotingData } = require('./services/startupResetService');

async function startServer() {
  if (env.resetVotesOnStart) {
    await resetVotingData();
    console.log('Voting data reset on server startup.');
  }

  app.listen(env.port, '0.0.0.0', () => {
    console.log(
      `The Museum voting API listening on port ${env.port} [${env.nodeEnv}]`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});