const express = require('express');
const { getVotingStatus, openVoting, closeVoting, revealResults } = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminAuth');
const { adminRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(requireAdmin, adminRateLimiter);

// Exactly the four operations required: status, open, close, reveal.
// No pause/resume, no dashboard, no judge-link management (judges have
// no individual identity to link).
router.get('/voting/status', getVotingStatus);
router.post('/voting/open', openVoting);
router.post('/voting/close', closeVoting);
router.post('/results/reveal', revealResults);

module.exports = router;
