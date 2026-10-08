const express = require('express');
const { getCandidates, getVotingStatus } = require('../controllers/publicController');
const { submitAudienceVote } = require('../controllers/voteController');
const { submitJudgeVote, verifyJudgeAccess } = require('../controllers/judgeController');
const { getLiveResultsEndpoint } = require('../controllers/resultsController');
const { attachDeviceToken } = require('../middleware/deviceToken');
const { voteRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/candidates', getCandidates);
router.get('/teams', getCandidates);

router.get('/voting-status', getVotingStatus);
router.get('/state', getVotingStatus);

router.get('/results/live', getLiveResultsEndpoint);

router.get('/judge-access', verifyJudgeAccess);

router.post('/votes', attachDeviceToken, voteRateLimiter, submitAudienceVote);
router.post('/votes/audience', attachDeviceToken, voteRateLimiter, submitAudienceVote);

router.post('/judge-votes', attachDeviceToken, voteRateLimiter, submitJudgeVote);

module.exports = router;