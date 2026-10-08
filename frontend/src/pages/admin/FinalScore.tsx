import React, { useState } from 'react';
import { RadioIcon, TrophyIcon } from 'lucide-react';
import { useEvent } from '../../contexts/EventContext';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Status';
import { TeamMark, RankBadge } from '../../components/ui/TeamMark';
import { TechLabel } from '../../components/ui/TechScreen';
import { Meter } from '../../components/ui/Meter';
import { useToast } from '../../components/ui/Toast';

export function FinalScore() {
  const { results, settings, judges, votes, publishWinner, state } = useEvent();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const panelComplete = judges.every((j) => j.submitted);

  return (
    <div className="space-y-6">
      <Panel
        label="Weighted final calculation"
        index="F1"
        action={
        <StatusBadge tone={panelComplete ? 'ok' : 'live'} blink={!panelComplete}>
            {panelComplete ? 'Tally complete' : 'Panel incomplete'}
          </StatusBadge>
        }>
        
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-sm border border-line bg-ink-950 px-4 py-3">
          <TechLabel>Formula</TechLabel>
          <span className="num text-sm font-extrabold text-fg">
            Final = (Judges × {settings.judgesWeight}%) + (Audience ×{' '}
            {settings.audienceWeight}%)
          </span>
          <span className="num ml-auto text-xs font-bold text-fg-dim">
            {votes.length} ballots · {judges.filter((j) => j.submitted).length}{' '}
            judges
          </span>
        </div>

        <ul className="space-y-3">
          {results.map((r) =>
          <li
            key={r.team.id}
            className={`rounded-lg border px-5 py-4 ${
            r.rank === 1 ?
            'border-brand/50 bg-brand/[0.07]' :
            'border-line bg-ink-950'}`
            }>
            
              <div className="flex flex-wrap items-center gap-4">
                <RankBadge rank={r.rank} />
                <TeamMark team={r.team} size={40} active={r.rank === 1} />
                <span
                className={`min-w-0 flex-1 truncate text-lg font-extrabold ${
                r.rank === 1 ? 'text-brand' : 'text-fg'}`
                }>
                
                  {r.team.name}
                </span>
                <div className="num text-right">
                  <TechLabel>Final</TechLabel>
                  <div
                    className={`text-3xl font-extrabold leading-none ${
                      r.rank === 1 ? 'text-brand' : 'text-fg'
                    }`}
                  >
                    {r.finalPct.toFixed(1)} pts
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-baseline justify-between">
                    <TechLabel>Audience Points</TechLabel>
                    <span className="num text-sm font-extrabold text-fg">
                      {r.audiencePct.toFixed(1)} pts
                    </span>
                  </div>
                  <div className="mt-2">
                    <Meter value={r.audiencePct} max={r.finalPct || 1} tone="neutral" height={8} />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <TechLabel>Judges Points</TechLabel>
                    <span className="num text-sm font-extrabold text-fg">
                      {r.judgesPct.toFixed(1)} pts
                    </span>
                  </div>
                  <div className="mt-2">
                    <Meter value={r.judgesPct} max={r.finalPct || 1} height={8} />
                  </div>
                </div>
              </div>
            </li>
          )}
        </ul>
      </Panel>

      <Panel label="Publish winner" index="F2">
        <div className="flex flex-wrap items-center gap-5">
          <span className="grid h-14 w-14 place-items-center rounded-lg border border-brand-shade bg-brand text-ink-950">
            <TrophyIcon className="h-7 w-7" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-extrabold text-fg">
              {results[0]?.team.name} · {results[0]?.finalPct.toFixed(1)} pts
            </h3>
            <p className="mt-1 text-xs font-semibold text-fg-muted">
              Publishing pushes the winner reveal to the stage screen
              immediately. Nothing appears on stage until you trigger it.
            </p>
          </div>
          <Button
            size="lg"
            disabled={state === 'winner_published'}
            icon={<RadioIcon className="h-4 w-4" strokeWidth={2.5} />}
            onClick={() => setConfirm(true)}>
            
            {state === 'winner_published' ? 'Winner published' : 'Publish Winner'}
          </Button>
        </div>
      </Panel>

      <ConfirmModal
        open={confirm}
        title="Publish the winner to stage?"
        body={`${results[0]?.team.name} will be revealed on the main screen with a final score of ${results[0]?.finalPct.toFixed(1)} pts.`}
        confirmLabel="Publish winner"
        destructive={false}
        onConfirm={() => {
          publishWinner();
          toast('Winner published to stage', 'ok');
        }}
        onClose={() => setConfirm(false)} />
      
    </div>);

}