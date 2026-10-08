const { submitVote } = require('../services/voteService');
const { isValidJudgeToken } = require('../services/judgeSessionService');

async function submitJudgeVote(req, res, next) {
  try {
    const judgeToken = req.body?.judgeToken || req.query?.jt;

    if (!isValidJudgeToken(judgeToken)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or missing judge access token.',
      });
    }

    const { ranking } = req.body || {};

    const body = {
      first: ranking?.[0],
      second: ranking?.[1],
      third: ranking?.[2],
      deviceToken: req.deviceToken,
    };

    const result = await submitVote({ body, voterType: 'judge' });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

function verifyJudgeAccess(req, res) {
  const valid = isValidJudgeToken(req.query.jt);

  res.json({
    success: true,
    valid,
  });
}

module.exports = {
  submitJudgeVote,
  verifyJudgeAccess,
};