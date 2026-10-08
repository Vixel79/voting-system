const crypto = require('crypto');
const env = require('../config/env');

/**
 * Admin endpoints are protected by a single shared bearer token
 * (ADMIN_API_KEY), known only to organizers running the dashboard.
 * This is intentionally NOT a user-account system — there is exactly
 * one admin surface for a one-day event, so a shared secret is the
 * simplest production-safe option per spec section 30.
 */
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Admin authorization required.' });
  }

  const expected = Buffer.from(env.adminApiKey || '');
  const given = Buffer.from(token);

  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
  }

  next();
}

module.exports = { requireAdmin };
