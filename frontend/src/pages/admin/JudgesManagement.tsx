import React, { useState } from 'react';
import { CheckIcon, ClockIcon, RotateCcwIcon } from 'lucide-react';
import { useEvent } from '../../contexts/EventContext';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/Modal';
import { Meter } from '../../components/ui/Meter';
import { StatusBadge } from '../../components/ui/Status';
import { TechLabel } from '../../components/ui/TechScreen';
import { useToast } from '../../components/ui/Toast';

export function JudgesManagement() {
  const { judges, teams, deleteJudgeVote } = useEvent();
  const RANK_WORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  const toast = useToast();
  const [target, setTarget] = useState<string | null>(null);
  const done = judges.filter((j) => j.submitted).length;

  return (
    <div className="space-y-6">
      <Panel
        label="Judges panel"
        index="D1"
        action={
        <StatusBadge tone="ok">
            {done} judges submitted
          </StatusBadge>
        }>
        
        {judges.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-line text-sm font-medium text-fg-muted">
            No judges have submitted yet.
          </div>
        ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {judges.map((j) =>
          <li
            key={j.id}
            className="rounded-lg border border-line bg-ink-950 px-5 py-4">
            
              <div className="flex items-center gap-3">
                <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border font-extrabold ${
                j.submitted ?
                'border-brand-shade bg-brand text-ink-950' :
                'border-line-strong bg-ink-900 text-fg-dim'}`
                }>
                
                  {j.submitted ?
                <CheckIcon className="h-5 w-5" strokeWidth={3} /> :

                <ClockIcon className="h-5 w-5" strokeWidth={2} />
                }
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-extrabold text-fg">
                    {j.label} · {j.name}
                  </div>
                  <TechLabel>
                    {j.submitted && j.submittedAt ?
                  `Submitted ${new Date(j.submittedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}` :
                  'Awaiting evaluation'}
                  </TechLabel>
                </div>
                {j.submitted &&
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcwIcon className="h-4 w-4" strokeWidth={2} />}
                onClick={() => setTarget(j.id)}>
                
                    Delete Vote
                  </Button>
              }
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2 border-t border-line pt-4">
                {teams.map((t) =>
              <div key={t.id} className="text-center">
                    <div className="num text-[10px] font-extrabold tracking-tech text-fg-dim">
                      {t.monogram}
                    </div>
                    <div
                  className={`num mt-1 rounded-[4px] border py-1.5 text-sm font-extrabold ${
                  j.submitted ?
                  'border-brand/40 bg-brand/10 text-brand' :
                  'border-line bg-ink-900 text-ink-600'}`
                  }>
                  
                      {j.submitted ? (j.ranking.indexOf(t.id) !== -1 ? RANK_WORD[j.ranking.indexOf(t.id)] : '—') : '—'}
                    </div>
                  </div>
              )}
              </div>
            </li>
          )}
        </ul>
        )}
      </Panel>

      <ConfirmModal
        open={!!target}
        title="Delete this evaluation?"
        body="This judge's ranking will be completely removed from the panel."
        confirmLabel="Delete vote"
        onConfirm={() => {
          if (target) {
            deleteJudgeVote(target);
            toast('Evaluation deleted', 'warn');
          }
        }}
        onClose={() => setTarget(null)} />
      
    </div>);

}