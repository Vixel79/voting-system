const defaultConfig = require('./scoringConfig');

function pointsForRank(rank, config) {
  if (rank === 1) return config.FIRST_PLACE_POINTS;
  if (rank === 2) return config.SECOND_PLACE_POINTS;
  if (rank === 3) return config.THIRD_PLACE_POINTS;
  return 0;
}

function aggregateRawPoints(votes, candidates, config) {
  const perCandidate = new Map(
    candidates.map((candidate) => [
      candidate.id,
      {
        rawPoints: 0,
        firstPlaceCount: 0,
        secondPlaceCount: 0,
        thirdPlaceCount: 0,
      },
    ])
  );

  for (const vote of votes) {
    const ranks = [
      [vote.first_place_candidate_id, 1],
      [vote.second_place_candidate_id, 2],
      [vote.third_place_candidate_id, 3],
    ];

    for (const [candidateId, rank] of ranks) {
      const entry = perCandidate.get(candidateId);
      if (!entry) continue;

      entry.rawPoints += pointsForRank(rank, config);
      if (rank === 1) entry.firstPlaceCount += 1;
      if (rank === 2) entry.secondPlaceCount += 1;
      if (rank === 3) entry.thirdPlaceCount += 1;
    }
  }

  return perCandidate;
}

function getTotalPoolPoints(aggregatedPoints) {
  return [...aggregatedPoints.values()].reduce(
    (total, candidate) => total + candidate.rawPoints,
    0
  );
}

function weightedPoints(rawPoints, totalPoolPoints, weight) {
  if (totalPoolPoints === 0) return 0;
  return (rawPoints / totalPoolPoints) * weight * 100;
}

// -------------------------------------------------------------
// LIVE: Audience-Only, Unweighted Results
// -------------------------------------------------------------
function computeLiveAudienceResults({ candidates, audienceVotes, config = defaultConfig }) {
  const audienceAgg = aggregateRawPoints(audienceVotes, candidates, config);
  const audienceBallotCount = audienceVotes.length;

  const teams = candidates.map((candidate) => {
    const audience = audienceAgg.get(candidate.id);
    return {
      id: candidate.id,
      name: candidate.name,
      photo: candidate.photo || null,
      audiencePoints: audience.rawPoints,
      // Fallback display field so the frontend doesn't need field name changes
      finalPoints: audience.rawPoints,
      firstPlaceCount: audience.firstPlaceCount,
      secondPlaceCount: audience.secondPlaceCount,
      thirdPlaceCount: audience.thirdPlaceCount,
    };
  });

  // Sort solely by audience points, tie-break by placement counts
  const ranked = rankTeams(teams, ['firstPlaceCount', 'secondPlaceCount']);

  return {
    teams: ranked,
    audienceBallotCount,
    audiencePending: audienceBallotCount === 0,
    computedAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// FINAL: Combined & Proportional Weighted Results
// -------------------------------------------------------------
function computeResults({ candidates, audienceVotes, judgeVotes, config = defaultConfig }) {
  const audienceAgg = aggregateRawPoints(audienceVotes, candidates, config);
  const judgesAgg = aggregateRawPoints(judgeVotes, candidates, config);

  const audienceBallotCount = audienceVotes.length;
  const judgeBallotCount = judgeVotes.length;

  const audienceTotalPoints = getTotalPoolPoints(audienceAgg);
  const judgeTotalPoints = getTotalPoolPoints(judgesAgg);

  const teams = candidates.map((candidate) => {
    const audience = audienceAgg.get(candidate.id);
    const judges = judgesAgg.get(candidate.id);

    const audiencePoints = audience.rawPoints;
    const judgePoints = judges.rawPoints;

    const weightedAudiencePoints = weightedPoints(
      audiencePoints,
      audienceTotalPoints,
      config.AUDIENCE_WEIGHT
    );

    const weightedJudgePoints = weightedPoints(
      judgePoints,
      judgeTotalPoints,
      config.JUDGES_WEIGHT
    );

    const finalPoints = weightedJudgePoints + weightedAudiencePoints;

    return {
      id: candidate.id,
      name: candidate.name,
      photo: candidate.photo || null,
      judgePoints,
      audiencePoints,
      finalPoints: round2(finalPoints),
      firstPlaceCount: audience.firstPlaceCount + judges.firstPlaceCount,
      secondPlaceCount: audience.secondPlaceCount + judges.secondPlaceCount,
      thirdPlaceCount: audience.thirdPlaceCount + judges.thirdPlaceCount,
    };
  });

  const ranked = rankTeams(teams, config.TIE_BREAK_ORDER);

  return {
    teams: ranked,
    judgesPending: judgeBallotCount === 0,
    audiencePending: audienceBallotCount === 0,
    audienceBallotCount,
    judgeBallotCount,
    computedAt: new Date().toISOString(),
  };
}

function rankTeams(teams, tieBreakOrder = []) {
  const compare = (a, b) => {
    if (b.finalPoints !== a.finalPoints) {
      return b.finalPoints - a.finalPoints;
    }

    for (const key of tieBreakOrder) {
      if ((b[key] ?? 0) !== (a[key] ?? 0)) {
        return (b[key] ?? 0) - (a[key] ?? 0);
      }
    }

    return 0;
  };

  const sorted = [...teams].sort(compare);
  let rank = 1;

  const result = sorted.map((team, index) => {
    if (index > 0) {
      const previous = sorted[index - 1];
      const stillTied =
        team.finalPoints === previous.finalPoints &&
        tieBreakOrder.every((key) => team[key] === previous[key]);

      if (!stillTied) {
        rank = index + 1;
      }
    }

    return {
      ...team,
      rank,
    };
  });

  const rankCounts = result.reduce((acc, team) => {
    acc[team.rank] = (acc[team.rank] || 0) + 1;
    return acc;
  }, {});

  return result.map((team) => ({
    ...team,
    needsAdminReview: rankCounts[team.rank] > 1,
  }));
}

function round2(number) {
  return Math.round(number * 100) / 100;
}

module.exports = {
  computeResults,
  computeLiveAudienceResults,
  rankTeams,
  aggregateRawPoints,
  pointsForRank,
};