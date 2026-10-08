const { submitVote } = require('../services/voteService');

async function submitAudienceVote(req, res, next) {
  try {
    const { ranking } = req.body || {};

    const body = {
      first: ranking?.[0],
      second: ranking?.[1],
      third: ranking?.[2],
      deviceToken: req.deviceToken,
    };

    const result = await submitVote({ body, voterType: 'audience' });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { submitAudienceVote };