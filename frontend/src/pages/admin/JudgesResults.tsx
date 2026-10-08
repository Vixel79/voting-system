import React from 'react';
import { useEvent } from '../../contexts/EventContext';
import { Panel } from '../../components/ui/Panel';
import { Meter } from '../../components/ui/Meter';
import { StatusBadge } from '../../components/ui/Status';
import { TeamMark } from '../../components/ui/TeamMark';
import { TechLabel } from '../../components/ui/TechScreen';
import { sortBy } from '../../utils/scoring';

export function JudgesResults() {
  const { judges, teams, results, settings } = useEvent();
  const RANK_WORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  const submitted = judges.filter((j) => j.submitted);
  const rows = sortBy(results, 'judgesPct');

  return (
    <div className="space-y-6">
      <Panel
        label="Scores by team"
        index="E1"
        action={
        <StatusBadge tone="ok">
            {judges.length} judges counted
          </StatusBadge>
        }
        bodyClassName="px-0 py-0">
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-ink-850">
                <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-tech text-fg-muted">
                  Team
                </th>
                {judges.map((j) =>
                <th
                  key={j.id}
                  className="px-3 py-3 text-center text-[10px] font-extrabold uppercase tracking-tech text-fg-muted">
                  
                    {j.label}
                  </th>
                )}
                <th className="px-5 py-3 text-right text-[10px] font-extrabold uppercase tracking-tech text-fg-muted">
                  Average
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-extrabold uppercase tracking-tech text-fg-muted">
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => {
                const row = results.find((r) => r.team.id === team.id) || {
                  rank: 0,
                  points: 0,
                  judgeAvg: 0,
                  judgesPct: 0
                };
                return (
                  <tr key={team.id} className="border-b border-line/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <TeamMark team={team} size={34} />
                        <span className="whitespace-nowrap font-bold text-fg">
                          {team.name}
                        </span>
                      </div>
                    </td>
                    {judges.map((j) =>
                    <td key={j.id} className="px-3 py-3 text-center">
                        <span
                        className={`num inline-grid h-9 w-9 place-items-center rounded-[6px] border text-sm font-extrabold ${
                        j.submitted ?
                        'border-line-strong bg-ink-950 text-fg' :
                        'border-dashed border-line bg-transparent text-ink-600'}`
                        }>
                        
                          {j.submitted ? (j.ranking.indexOf(team.id) !== -1 ? RANK_WORD[j.ranking.indexOf(team.id)] : '—') : '—'}
                        </span>
                      </td>
                    )}
                    <td className="num px-5 py-3 text-right text-lg font-extrabold text-fg">
                      {row.judgeAvg.toFixed(1)}
                      <span className="text-sm text-fg-dim"> pts</span>
                    </td>
                    <td className="num px-5 py-3 text-right text-lg font-extrabold text-brand">
                      {row.judgesPct.toFixed(1)} pts
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-5 py-3">
          <TechLabel>
            Judges panel carries {settings.judgesWeight} pts max of the final score
          </TechLabel>
        </div>
      </Panel>

      <Panel label="Judges ranking" index="E2">
        <ul className="space-y-2">
          {rows.map((r) =>
          <li
            key={r.team.id}
            className="flex items-center gap-4 rounded-sm border border-line bg-ink-950 px-4 py-3">
            
              <span className="num w-6 text-sm font-extrabold text-fg-dim">
                {String(r.rank).padStart(2, '0')}
              </span>
              <span className="w-40 shrink-0 truncate font-bold text-fg">
                {r.team.name}
              </span>
              <div className="flex-1">
                <Meter value={r.judgesPct} max={r.finalPct || 1} tone={r.rank === 1 ? 'brand' : 'neutral'} />
              </div>
              <span className="num w-20 text-right text-lg font-extrabold text-brand">
                {r.judgesPct.toFixed(1)} pts
              </span>
            </li>
          )}
        </ul>
      </Panel>
    </div>);

}