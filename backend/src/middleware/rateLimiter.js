const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * Per-IP limit on the vote submission endpoint. This is an abuse-signal
 * layer ON TOP OF the device-token unique constraint, not a replacement
 * for it — event WiFi/NAT means many legitimate attendees can share one
 * public IP, so this is set loose enough to never block a real attendee
 * casting their one vote, while still stopping obvious scripted floods.
 */
const voteRateLimiter = rateLimit({
  windowMs: env.voteRateLimitWindowMs,
  max: env.voteRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this network. Please wait a moment and try again.',
  },
});

/**
 * Tighter limiter for admin endpoints — low legitimate traffic expected.
 */
const adminRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many admin requests. Please slow down.' },
});

module.exports = { voteRateLimiter, adminRateLimiter };
