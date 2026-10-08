import { AudienceVote, Judge, Team, TeamResult } from '../types/event';

export const RANK_POINTS = [3, 2, 1];

export function audiencePoints(votes: AudienceVote[], teamId: string): number {
  return votes.reduce((sum, v) => {
    const idx = v.ranking.indexOf(teamId);
    return idx === -1 ? sum : sum + RANK_POINTS[idx];
  }, 0);
}

export function judgeAverage(judges: Judge[], teamId: string, maxTeams: number): number {
  const done = judges.filter((j) => j.submitted);
  if (!done.length) return 0;
  return done.reduce((s, j) => {
    const idx = j.ranking ? j.ranking.indexOf(teamId) : -1;
    const score = idx === -1 ? 0 : maxTeams - idx;
    return s + score;
  }, 0) / done.length;
}

interface ComputeArgs {
  teams: Team[];
  votes: AudienceVote[];
  judges: Judge[];
  judgesWeight: number;
  audienceWeight: number;
}

/**
 * Audience % = share of the maximum audience points a team could have earned
 * (every ballot ranking it 1st). Judges % = average score / 5.
 */
export function computeResults({
  teams,
  votes,
  judges,
  judgesWeight,
  audienceWeight
}: ComputeArgs): TeamResult[] {
  const maxAudience = Math.max(1, votes.length * RANK_POINTS[0]);

  const rows = teams.map((team) => {
    const points = audiencePoints(votes, team.id);
    const judgeAvg = judgeAverage(judges, team.id, teams.length);
    const audiencePct = points / maxAudience * 100;
    const judgesPct = judgeAvg / 5 * 100;
    return {
      team,
      votes: votes.filter((v) => v.ranking.includes(team.id)).length,
      firsts: votes.filter((v) => v.ranking[0] === team.id).length,
      points,
      audiencePct,
      judgeAvg,
      judgesPct,
      finalPct:
      judgesPct * (judgesWeight / 100) + audiencePct * (audienceWeight / 100),
      rank: 0
    };
  });

  return rows.
  sort((a, b) => b.finalPct - a.finalPct).
  map((r, i) => ({ ...r, rank: i + 1 }));
}

export function sortBy(
rows: TeamResult[],
key: 'audiencePct' | 'judgesPct' | 'finalPct')
: TeamResult[] {
  return [...rows].
  sort((a, b) => b[key] - a[key]).
  map((r, i) => ({ ...r, rank: i + 1 }));
}

export const pct = (n: number, d = 0) => `${n.toFixed(d)}%`;

export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}