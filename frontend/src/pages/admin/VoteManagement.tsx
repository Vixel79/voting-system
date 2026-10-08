import React, { useMemo, useState } from 'react';
import { SearchIcon, Trash2Icon } from 'lucide-react';
import { useEvent } from '../../contexts/EventContext';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Field';
import { StatusBadge } from '../../components/ui/Status';
import { TechLabel } from '../../components/ui/TechScreen';
import { useToast } from '../../components/ui/Toast';

const RANK_WORD = ['1st', '2nd', '3rd'];

export function VoteManagement() {
  const { votes, teams, deleteVote } = useEvent();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<string | null>(null);

  const teamName = (id: string) =>
  teams.find((t) => t.id === id)?.name.replace('Team ', '') || '—';

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ?
    votes.filter(
      (v) =>
      v.id.toLowerCase().includes(q) ||
      v.ranking.some((r) => teamName(r).toLowerCase().includes(q))
    ) :
    votes;
    return list.slice(0, 60);
  }, [votes, query, teams]);

  return (
    <div className="space-y-6">
      <Panel
        label="Audience ballots"
        index="C1"
        action={
        <StatusBadge tone="idle">{votes.length} recorded</StatusBadge>
        }
        bodyClassName="px-0 py-0">
        
        <div className="border-b border-line px-5 py-4">
          <div className="max-w-sm">
            <Input
              label="Search ballots"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Vote ID or team"
              icon={<SearchIcon className="h-4 w-4" strokeWidth={2} />} />
            
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-ink-850">
                {['Vote ID', 'Timestamp', 'Source', 'Selected teams', 'Status', ''].map(
                  (h) =>
                  <th
                    key={h}
                    className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-tech text-fg-muted">
                    
                      {h}
                    </th>

                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((v) =>
              <tr
                key={v.id}
                className="border-b border-line/70 transition-colors duration-150 hover:bg-white/[0.02]">
                
                  <td className="num px-5 py-3 text-sm font-extrabold text-fg">
                    {v.id}
                  </td>
                  <td className="num px-5 py-3 text-xs font-semibold text-fg-muted">
                    {new Date(v.ts).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-[4px] border border-line-strong px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-tech text-fg-dim">
                      {v.source}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {v.ranking.map((id, i) =>
                    <span
                      key={id}
                      className="flex items-center gap-1.5 rounded-[4px] border border-line bg-ink-950 px-2 py-1 text-[11px] font-bold text-fg-soft">
                      
                          <span className="num text-brand">{RANK_WORD[i]}</span>
                          {teamName(id)}
                        </span>
                    )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge tone="ok">Counted</StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2Icon className="h-4 w-4" strokeWidth={2} />}
                    onClick={() => setTarget(v.id)}>
                    
                      Delete
                    </Button>
                  </td>
                </tr>
              )}
              {!rows.length &&
              <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <TechLabel>No ballots match this search</TechLabel>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-5 py-3">
          <TechLabel>
            Showing {rows.length} of {votes.length} ballots · newest first
          </TechLabel>
        </div>
      </Panel>

      <ConfirmModal
        open={!!target}
        title={`Delete ballot ${target || ''}?`}
        body="Audience points, percentages, rankings and the final score are recalculated immediately."
        confirmLabel="Delete ballot"
        onConfirm={() => {
          if (target) {
            deleteVote(target);
            toast(`Ballot ${target} deleted`, 'warn');
          }
        }}
        onClose={() => setTarget(null)} />
      
    </div>);

}