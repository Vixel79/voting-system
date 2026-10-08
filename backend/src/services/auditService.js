const { supabaseAdmin } = require('../config/supabase');

/**
 * Minimal, append-only audit trail for SYSTEM/ADMIN events only:
 *   state_change | admin_action | final_result_generated | results_revealed
 *
 * Deliberately NOT used for individual vote submissions or rejections —
 * with 600+ ballots that's high-volume noise with no real operational
 * value, and every rejection reason is already returned directly to the
 * voter in the API response. Never pass anything personally identifying
 * (nothing in this system collects any).
 */
async function logAudit(eventType, detail = {}) {
  try {
    await supabaseAdmin.from('audit_logs').insert({ event_type: eventType, detail });
  } catch (err) {
    // Audit logging must never break the voting/admin flow.
    // eslint-disable-next-line no-console
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logAudit };
