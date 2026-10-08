const {
  computeResults,
  rankTeams,
  pointsForRank,
} = require('../../src/scoring/scoringService');

const config = require('../../src/scoring/scoringConfig');

const A = 'a';
const B = 'b';
const C = 'c';

const candidates = [
  { id: A, name: 'Team A' },
  { id: B, name: 'Team B' },
  { id: C, name: 'Team C' },
];

function ballot(first, second, third) {
  return {
    first_place_candidate_id: first,
    second_place_candidate_id: second,
    third_place_candidate_id: third,
  };
}

describe('pointsForRank', () => {
  it('returns configured point values', () => {
    expect(pointsForRank(1, config)).toBe(5);
    expect(pointsForRank(2, config)).toBe(3);
    expect(pointsForRank(3, config)).toBe(1);
    expect(pointsForRank(4, config)).toBe(0);
  });
});

describe('computeResults', () => {
  it('calculates raw points and normalizes each pool by total pool points', () => {
    const audienceVotes = [
      ballot(A, B, C),
      ballot(A, B, C),
    ];

    const judgeVotes = [
      ballot(B, A, C),
    ];

    const results = computeResults({
      candidates,
      audienceVotes,
      judgeVotes,
    });

    const byId = Object.fromEntries(
      results.teams.map((team) => [team.id, team])
    );

    expect(byId[A].audiencePoints).toBe(10);
    expect(byId[A].judgePoints).toBe(3);

    expect(byId[B].audiencePoints).toBe(6);
    expect(byId[B].judgePoints).toBe(5);

    expect(byId[C].audiencePoints).toBe(2);
    expect(byId[C].judgePoints).toBe(1);

    expect(byId[A].finalPoints).toBeCloseTo(42.22, 2);
    expect(byId[B].finalPoints).toBeCloseTo(46.67, 2);
    expect(byId[C].finalPoints).toBeCloseTo(11.11, 2);
  });

  it('flags judgesPending when no judge ballots exist', () => {
    const results = computeResults({
      candidates,
      audienceVotes: [ballot(A, B, C)],
      judgeVotes: [],
    });

    expect(results.judgesPending).toBe(true);
    expect(results.teams.every((team) => team.judgePoints === 0)).toBe(true);
  });

  it('keeps judge and audience pools independent', () => {
    const audienceVotes = Array.from(
      { length: 100 },
      () => ballot(B, C, A)
    );

    const judgeVotes = [
      ballot(A, C, B),
    ];

    const results = computeResults({
      candidates,
      audienceVotes,
      judgeVotes,
    });

    const byId = Object.fromEntries(
      results.teams.map((team) => [team.id, team])
    );

    expect(byId[A].judgePoints).toBe(5);
    expect(byId[A].audiencePoints).toBe(100);

    expect(byId[B].judgePoints).toBe(1);
    expect(byId[B].audiencePoints).toBe(500);
        expect(byId[A].finalPoints).toBeCloseTo(37.78, 2);
        expect(byId[B].finalPoints).toBeCloseTo(28.89, 2);
        expect(byId[A].finalPoints).toBeGreaterThan(byId[B].finalPoints);
  });

  it('uses judge raw points as the first tie-breaker', () => {
    const teams = [
      {
        id: A,
        finalPoints: 50,
        judgePoints: 10,
        firstPlaceCount: 1,
        secondPlaceCount: 0,
      },
      {
        id: B,
        finalPoints: 50,
        judgePoints: 8,
        firstPlaceCount: 5,
        secondPlaceCount: 0,
      },
    ];

    const ranked = rankTeams(teams, config);

    expect(ranked[0].id).toBe(A);
    expect(ranked[1].id).toBe(B);
  });

  it('uses first-place votes as the second tie-breaker', () => {
    const teams = [
      {
        id: A,
        finalPoints: 50,
        judgePoints: 10,
        firstPlaceCount: 3,
        secondPlaceCount: 0,
      },
      {
        id: B,
        finalPoints: 50,
        judgePoints: 10,
        firstPlaceCount: 1,
        secondPlaceCount: 5,
      },
    ];

    const ranked = rankTeams(teams, config);

    expect(ranked[0].id).toBe(A);
    expect(ranked[1].id).toBe(B);
  });

  it('flags admin review when teams remain tied after all tie-breakers', () => {
    const teams = [
      {
        id: A,
        finalPoints: 50,
        judgePoints: 10,
        firstPlaceCount: 3,
      },
      {
        id: B,
        finalPoints: 50,
        judgePoints: 10,
        firstPlaceCount: 3,
      },
    ];

    const ranked = rankTeams(teams, config);

    expect(ranked[0].needsAdminReview).toBe(true);
    expect(ranked[1].needsAdminReview).toBe(true);
  });
});