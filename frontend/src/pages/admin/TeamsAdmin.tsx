import React from 'react';
import { useEvent } from '../../contexts/EventContext';
import { Panel } from '../../components/ui/Panel';
import { Input } from '../../components/ui/Field';
import { TeamMark } from '../../components/ui/TeamMark';
import { TechLabel } from '../../components/ui/TechScreen';
import { StatusBadge } from '../../components/ui/Status';

export function TeamsAdmin() {
  const { teams, updateTeam, results } = useEvent();

  return (
    <Panel
      label="الفرق المتنافسة"
      index="H1"
      action={<StatusBadge tone="idle">{teams.length} فريق مسجل</StatusBadge>}>
      
      <ul className="grid gap-3 xl:grid-cols-2">
        {teams.map((team) => {
          const row = results.find((r) => r.team.id === team.id) || {
            rank: 0,
            points: 0,
            judgeAvg: 0,
            finalPct: 0,
            audiencePct: 0,
            judgesPct: 0
          };
          return (
            <li
              key={team.id}
              className="rounded-lg border border-line bg-ink-950 p-5">
              
              <div className="flex items-center gap-4">
                <TeamMark team={team} size={52} active={row.rank === 1} />
                <div className="min-w-0 flex-1">
                  <TechLabel>Slot T{team.code}</TechLabel>
                  <div className="truncate text-lg font-extrabold text-fg">
                    {team.name}
                  </div>
                </div>
                <div className="num text-right">
                  <TechLabel>Rank</TechLabel>
                  <div className="text-2xl font-extrabold text-brand">
                    {String(row.rank).padStart(2, '0')}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  label="اسم الفريق"
                  value={team.name}
                  onChange={(e) => updateTeam(team.id, { name: e.target.value })} />
                
                <Input
                  label="الاسم بالعربي"
                  value={team.nameAr}
                  onChange={(e) => updateTeam(team.id, { nameAr: e.target.value })}
                  dir="rtl" />
                
                <Input
                  label="وصف قصير"
                  value={team.tagline}
                  onChange={(e) => updateTeam(team.id, { tagline: e.target.value })}
                  className="sm:col-span-2" />
                
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
                {[
                ['الجمهور', `${row.audiencePct.toFixed(1)} pts`],
                ['الحكام', `${row.judgesPct.toFixed(1)} pts`],
                ['النهائي', `${row.finalPct.toFixed(1)} pts`]].
                map(([k, v]) =>
                <div key={k}>
                    <TechLabel>{k}</TechLabel>
                    <div className="num text-lg font-extrabold text-fg">{v}</div>
                  </div>
                )}
              </div>
            </li>);

        })}
      </ul>
    </Panel>);

}