import { EventSettings, Judge, Team } from '../types/event';

export const TEAMS: Team[] = [
{
  id: 'a',
  code: '01',
  name: 'Team Alpha',
  nameAr: 'فريق ألفا',
  tagline: 'Autonomous logistics swarm',
  monogram: 'A'
},
{
  id: 'b',
  code: '02',
  name: 'Team Beta',
  nameAr: 'فريق بيتا',
  tagline: 'Neural diagnostics engine',
  monogram: 'B'
},
{
  id: 'c',
  code: '03',
  name: 'Team Gamma',
  nameAr: 'فريق جاما',
  tagline: 'Grid-scale energy routing',
  monogram: 'C'
},
{
  id: 'd',
  code: '04',
  name: 'Team Delta',
  nameAr: 'فريق دلتا',
  tagline: 'Assistive haptics platform',
  monogram: 'D'
},
{
  id: 'e',
  code: '05',
  name: 'Team Epsilon',
  nameAr: 'فريق إبسلون',
  tagline: 'Realtime crowd safety mesh',
  monogram: 'E'
}];


export const DEFAULT_SETTINGS: EventSettings = {
  eventName: 'Museum Competition',
  eventNameAr: '',
  venue: '',
  round: '',
  votingDuration: 600,
  judgesWeight: 60,
  audienceWeight: 40,
  postVotingHeadline: 'Voting is closed. The show continues.',
  postVotingBody:
  'Stay in the hall — the winner is announced live on the main stage screen in a few minutes.',
  sponsors: []
};

// removed seedScores

export const INITIAL_JUDGES: Judge[] = [
{
  id: 'j1',
  label: 'Judge 01',
  name: 'Dr. Layla Hariri',
  ranking: ['a', 'c', 'b', 'e', 'd'],
  submitted: true,
  submittedAt: Date.now() - 1000 * 60 * 12
},
{
  id: 'j2',
  label: 'Judge 02',
  name: 'Marcus Feld',
  ranking: ['b', 'a', 'c', 'e', 'd'],
  submitted: true,
  submittedAt: Date.now() - 1000 * 60 * 9
},
{
  id: 'j3',
  label: 'Judge 03',
  name: 'Sara Okonjo',
  ranking: ['a', 'b', 'c', 'd', 'e'],
  submitted: true,
  submittedAt: Date.now() - 1000 * 60 * 7
}
];


/** Deterministic seed of audience ballots so the demo opens with a live board. */
export function seedVotes(count = 214) {
  const weights: Record<string, number> = { a: 34, b: 26, c: 18, d: 12, e: 10 };
  const pool = Object.entries(weights).flatMap(([id, w]) =>
  Array.from({ length: w }, () => id)
  );
  const votes = [];
  let seed = 20260907;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < count; i++) {
    const picked: string[] = [];
    while (picked.length < 3) {
      const cand = pool[Math.floor(rnd() * pool.length)];
      if (!picked.includes(cand)) picked.push(cand);
    }
    votes.push({
      id: `V-${(1000 + i).toString()}`,
      ts: Date.now() - Math.floor(rnd() * 1000 * 60 * 14),
      ranking: picked,
      source: (rnd() > 0.12 ? 'qr' : 'kiosk') as 'qr' | 'kiosk'
    });
  }
  return votes.sort((x, y) => y.ts - x.ts);
}