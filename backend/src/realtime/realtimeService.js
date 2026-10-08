const { supabaseAdmin } = require('../config/supabase');

const RESULTS_CHANNEL = 'museum-results';

function getResultsChannel() {
  return supabaseAdmin.channel(RESULTS_CHANNEL);
}

async function broadcast(event, payload = {}) {
  const channel = getResultsChannel();

  await channel.subscribe();

  await channel.send({
    type: 'broadcast',
    event,
    payload: {
      updatedAt: new Date().toISOString(),
      ...payload,
    },
  });
}

async function broadcastResultsUpdated(meta = {}) {
  await broadcast('results-updated', meta);
}

async function broadcastStateUpdated(state) {
  await broadcast('state-updated', { state });
}

module.exports = {
  RESULTS_CHANNEL,
  broadcastResultsUpdated,
  broadcastStateUpdated,
};