import React, { useState } from 'react';
import {
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
  ZapIcon } from
'lucide-react';
import { useEvent } from '../../contexts/EventContext';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { Countdown } from '../../components/ui/Countdown';
import { ConfirmModal } from '../../components/ui/Modal';
import { Meter } from '../../components/ui/Meter';
import { Toggle } from '../../components/ui/Field';
import { StatusBadge } from '../../components/ui/Status';
import { TechLabel } from '../../components/ui/TechScreen';
import { TeamMark } from '../../components/ui/TeamMark';
import { sortBy } from '../../utils/scoring';
import { useToast } from '../../components/ui/Toast';

export function AudienceControl() {
  const {
    state,
    timer,
    running,
    votes,
    settings,
    results,
    simulate,
    setSimulate,
    startVoting,
    pauseVoting,
    stopVoting,
    resetTimer,
    resetVoting
  } = useEvent();
  const toast = useToast();
  const [confirm, setConfirm] = useState<'stop' | 'reset' | null>(null);

  const live = state === 'voting_live' || state === 'ending_soon';
  const rows = sortBy(results, 'audiencePct');
  const participation = Math.min(100, votes.length / 420 * 100);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Panel
          label="Voting session control"
          index="B1"
          action={
          <StatusBadge tone={live ? 'live' : 'idle'} blink={live}>
              {live ? 'Accepting ballots' : 'Closed'}
            </StatusBadge>
          }>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-line bg-ink-950 p-5">
              <Countdown
                seconds={timer}
                total={settings.votingDuration}
                running={running}
                size="lg" />
              
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                disabled={live && running}
                icon={<PlayIcon className="h-4 w-4" strokeWidth={2.5} />}
                onClick={() => {
                  startVoting();
                  toast('Voting started', 'ok');
                }}>
                
                Start
              </Button>
              <Button
                variant="secondary"
                size="lg"
                disabled={!running}
                icon={<PauseIcon className="h-4 w-4" strokeWidth={2.5} />}
                onClick={() => {
                  pauseVoting();
                  toast('Voting paused');
                }}>
                
                Pause
              </Button>
              <Button
                variant="danger"
                size="lg"
                icon={<SquareIcon className="h-4 w-4" strokeWidth={2.5} />}
                onClick={() => setConfirm('stop')}>
                
                Stop
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={<RotateCcwIcon className="h-4 w-4" strokeWidth={2.5} />}
                onClick={() => {
                  resetTimer();
                  toast('Timer reset');
                }}>
                
                Reset timer
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
            <div>
              <TechLabel>Total votes</TechLabel>
              <div className="num text-3xl font-extrabold text-fg">
                {votes.length}
              </div>
            </div>
            <div>
              <TechLabel>Participation rate</TechLabel>
              <div className="num text-3xl font-extrabold text-brand">
                {participation.toFixed(0)}%
              </div>
              <div className="mt-2">
                <Meter value={participation} />
              </div>
            </div>
            <div>
              <TechLabel>Points in play</TechLabel>
              <div className="num text-3xl font-extrabold text-fg">
                {votes.length * 6}
              </div>
            </div>
          </div>
        </Panel>

        <Panel label="Live audience ranking" index="B2">
          <ul className="space-y-2">
            {rows.map((r) =>
            <li
              key={r.team.id}
              className="flex items-center gap-4 rounded-sm border border-line bg-ink-950 px-4 py-3">
              
                <span className="num w-6 text-sm font-extrabold text-fg-dim">
                  {String(r.rank).padStart(2, '0')}
                </span>
                <TeamMark team={r.team} size={38} active={r.rank === 1} />
                <span className="min-w-0 flex-1 truncate font-bold text-fg">
                  {r.team.name}
                </span>
                <span className="num hidden w-28 text-right text-xs font-bold text-fg-dim sm:block">
                  {r.firsts} firsts
                </span>
                <span className="num w-20 text-right text-xs font-bold text-fg-muted">
                  {r.points} pts
                </span>
                <span className="num w-20 text-right text-lg font-extrabold text-brand">
                  {r.audiencePct.toFixed(1)} pts
                </span>
              </li>
            )}
          </ul>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel label="Scoring model" index="B3">
          <ul className="space-y-2">
            {[
            ['1st place', '3 points'],
            ['2nd place', '2 points'],
            ['3rd place', '1 point']].
            map(([k, v]) =>
            <li
              key={k}
              className="flex items-center justify-between rounded-sm border border-line bg-ink-950 px-4 py-3">
              
                <span className="text-sm font-bold text-fg-soft">{k}</span>
                <span className="num text-sm font-extrabold text-brand">{v}</span>
              </li>
            )}
          </ul>
          <p className="mt-4 text-xs font-semibold leading-relaxed text-fg-dim">
            Each ballot distributes 6 points. Audience % is measured against the
            maximum points a team could earn if every ballot ranked it first,
            then weighted at {settings.audienceWeight}%.
          </p>
        </Panel>

        <Panel label="Traffic simulation" index="B4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-fg">
                <ZapIcon className="h-4 w-4 text-brand" strokeWidth={2} />
                Incoming ballots
              </div>
              <p className="mt-1 text-xs font-semibold text-fg-dim">
                Feeds the stage board while voting is live.
              </p>
            </div>
            <Toggle
              checked={simulate}
              onChange={setSimulate}
              label="Simulate incoming ballots" />
            
          </div>
        </Panel>

        <Panel label="Danger zone" index="B5">
          <p className="text-xs font-semibold leading-relaxed text-fg-muted">
            Resetting clears every audience ballot and returns the event to the
            not-started state. Judges evaluations are preserved.
          </p>
          <Button
            variant="danger"
            size="md"
            block
            className="mt-4"
            onClick={() => setConfirm('reset')}>
            
            Reset audience voting
          </Button>
        </Panel>
      </div>

      <ConfirmModal
        open={confirm === 'stop'}
        title="Stop voting now?"
        body="Ballots will be rejected immediately and the countdown will end. This cannot be undone from the audience side."
        confirmLabel="Stop voting"
        onConfirm={() => {
          stopVoting();
          toast('Voting stopped', 'warn');
        }}
        onClose={() => setConfirm(null)} />
      
      <ConfirmModal
        open={confirm === 'reset'}
        title="Reset all audience votes?"
        body={`This permanently deletes ${votes.length} ballots and recalculates every ranking and final score.`}
        confirmLabel="Delete all ballots"
        onConfirm={() => {
          resetVoting();
          toast('Audience voting reset', 'warn');
        }}
        onClose={() => setConfirm(null)} />
      
    </div>);

}