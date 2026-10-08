const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const env = require('../config/env');

/**
 * Ensures every request carries a device token, stored as an httpOnly
 * cookie so it survives a page refresh but is never readable/tamperable
 * from page JavaScript. This is what makes "scan → vote → submit" work
 * with zero registration: the token IS the voting session.
 *
 * This is a practical, not perfect, device identifier (see spec section 29
 * / 11) — it is one layer among several (see rateLimiter + the DB unique
 * constraint in voteService, which is the real authority).
 */
function attachDeviceToken(req, res, next) {
  const cookieName = env.deviceTokenCookieName;
  const existing = req.cookies ? req.cookies[cookieName] : null;

  const token = existing && uuidValidate(existing) ? existing : uuidv4();

  if (token !== existing) {
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days — comfortably covers the event
    });
  }

  req.deviceToken = token;
  next();
}

module.exports = { attachDeviceToken };
