export interface Team {
  id: string;
  name: string;
  photo?: string | null;
  // Kept for UI backwards compatibility (optional)
  code?: string;
  nameAr?: string;
  tagline?: string;
  monogram?: string;
}

export interface AudienceVote {
  id: string;
  ts: number;
  /** ordered team ids: [1st, 2nd, 3rd] */
  ranking: string[];
  source: 'qr' | 'kiosk';
  voterName?: string;
}

export interface Judge {
  id: string;
  label: string;
  name: string;
  /** ordered team ids: [1st, 2nd, 3rd, 4th, 5th] */
  ranking: string[];
  submitted: boolean;
  submittedAt?: number;
}

export type EventState =
'not_started' |
'starting_soon' |
'voting_live' |
'ending_soon' |
'voting_closed' |
'final_ready' |
'winner_published' |
'finished';

export type DisplayMode =
'branding' |
'starting' |
'voting_live' |
'audience' |
'judges' |
'combined' |
'hidden' |
'final_ready' |
'winner' |
'finished';

export interface DisplayControl {
  power: boolean;
  mode: DisplayMode;
}

export interface EventSettings {
  eventName: string;
  eventNameAr: string;
  venue: string;
  round: string;
  votingDuration: number;
  judgesWeight: number;
  audienceWeight: number;
  postVotingHeadline: string;
  postVotingBody: string;
  sponsors: string[];
}

export interface TeamResult {
  team: Team;
  votes: number;
  firsts: number;
  points: number;
  audiencePct: number;
  judgeAvg: number;
  judgesPct: number;
  finalPct: number;
  rank: number;
}