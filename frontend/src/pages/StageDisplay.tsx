import React from 'react';
import { PowerOffIcon } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { StageFrame } from '../components/stage/StageFrame';
import { StageBoard } from '../components/stage/StageBoard';
import { StageMessage } from '../components/stage/StageMessage';
import { WinnerReveal } from '../components/stage/WinnerReveal';
import { sortBy } from '../utils/scoring';

export function StageDisplay() {
  const { settings, display, results, votes, timer, state, lastMover } =
  useEvent();

  if (!display.power) {
    return (
      <div className="grid min-h-full w-full place-items-center bg-black">
        <div className="flex flex-col items-center gap-3 text-ink-600">
          <PowerOffIcon className="h-10 w-10" strokeWidth={1.5} />
          <span className="text-[11px] font-extrabold uppercase tracking-tech">
            Display off
          </span>
        </div>
      </div>);

  }

  const live = state === 'voting_live' || state === 'ending_soon';
  const ticker = [
  settings.venue,
  `Judges ${settings.judgesWeight}% · Audience ${settings.audienceWeight}%`,
  'Scan the QR code in the hall to vote'];


  const frameProps = {
    eventName: settings.eventName,
    round: settings.round,
    ticker
  };

  const audienceRows = sortBy(results, 'audiencePct');
  const judgeRows = sortBy(results, 'judgesPct');

  switch (display.mode) {
    case 'audience':
      return (
        <StageFrame
          {...frameProps}
          live={live}
          timer={live ? timer : undefined}
          totalVotes={votes.length}>
          
          <StageBoard
            title="Audience Results"
            subtitle={`${settings.audienceWeight} pts of final score · 3-2-1 points`}
            rows={audienceRows}
            metric={(r) => r.audiencePct}
            lastMover={lastMover} />
          
        </StageFrame>);


    case 'judges':
      return (
        <StageFrame {...frameProps} totalVotes={votes.length}>
          <StageBoard
            title="Judges Results"
            subtitle={`${settings.judgesWeight} pts of final score · scored 1–5`}
            rows={judgeRows}
            metric={(r) => r.judgesPct}
            lastMover={null} />
          
        </StageFrame>
      );

    case 'combined':
      return (
        <StageFrame {...frameProps} totalVotes={votes.length}>
          <StageBoard
            title="Combined Results"
            subtitle=""
            rows={results}
            metric={(r) => r.finalPct}
            lastMover={lastMover} />
          
        </StageFrame>);


    case 'voting_live':
      return (
        <StageFrame
          {...frameProps}
          live
          timer={timer}
          totalVotes={votes.length}>
          
          <StageMessage
            eyebrow="Live Voting"
            headline="Voting is Open"
            support="Scan the QR code to submit your ballot" />
          
        </StageFrame>);


    case 'hidden':
      return (
        <StageFrame {...frameProps}>
          <StageMessage
            eyebrow="Results held"
            headline="Results Hidden"
            support="The control room is verifying the tally."
            showLogo />
          
        </StageFrame>);


    case 'final_ready':
      return (
        <StageFrame {...frameProps} totalVotes={votes.length}>
          <StageMessage
            eyebrow="Tally complete"
            headline="Final Results Ready"
            support="Standing by for the host to announce tonight's champion."
            footnote="Awaiting publish command" />
          
        </StageFrame>);


    case 'winner':
      return (
        <StageFrame {...frameProps}>
          <WinnerReveal winner={results[0]} runnersUp={results.slice(1, 4)} />
        </StageFrame>);


    case 'finished':
      return (
        <StageFrame {...frameProps}>
          <StageMessage
            eyebrow="That's a wrap"
            headline="Thank You"
            support={`${settings.eventName} · ${settings.round}`}
            showLogo
            sponsors={settings.sponsors} />
          
        </StageFrame>);


    case 'starting':
      return (
        <StageFrame {...frameProps}>
          <StageMessage
            eyebrow="Please Take Your Seats"
            headline="Voting Starts Soon"
            support="Five teams. One stage. Your vote makes the difference."
            showLogo />
          
        </StageFrame>);


    case 'branding':
    default:
      return (
        <StageFrame {...frameProps}>
          <StageMessage
            eyebrow={settings.venue}
            headline={settings.eventName}
            support={settings.eventNameAr}
            showLogo
            sponsors={settings.sponsors} />
          
        </StageFrame>);

  }
}