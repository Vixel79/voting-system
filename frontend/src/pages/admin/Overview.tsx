import React from 'react';
import {
  ActivityIcon,
  GavelIcon,
  TimerIcon,
  TrophyIcon,
  UsersIcon } from
'lucide-react';
import { useEvent } from '../../contexts/EventContext';
import { Panel } from '../../components/ui/Panel';
import { Meter, StatTile } from '../../components/ui/Meter';
import { Button } from '../../components/ui/Button';
import { STATE_META, StatusBadge } from '../../components/ui/Status';
import { ResultRow } from '../../components/results/ResultRow';
import { clock } from '../../utils/scoring';
import { TechLabel } from '../../components/ui/TechScreen';
import { Link } from 'react-router-dom';

const STATE_SEQUENCE = [
'not_started',
'starting_soon',
'voting_live',
'ending_soon',
'voting_closed',
'final_ready',
'winner_published',
'finished'] as
const;

export function Overview() {
  const {
    state,
    setState,
    timer,
    running,
    votes,
    judges,
    results,
    settings,
    lastMover,
    startVoting,
    pauseVoting
  } = useEvent();

  const judgesDone = judges.filter((j) => j.submitted).length;
  const leader = results[0];
  const live = state === 'voting_live' || state === 'ending_soon';
  const participation = Math.min(100, votes.length / 420 * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile
          index="01"
          label="حالة التصويت"
          value={
          <span className={live ? 'text-brand' : 'text-fg'}>
              {live ? 'مباشر' : STATE_META[state].label.toUpperCase()}
            </span>
          }
          sub={STATE_META[state].note}
          icon={<ActivityIcon className="h-4 w-4" strokeWidth={2} />} />
        
        <StatTile
          index="02"
          accent
          label="الوقت المتبقي"
          value={<span className="num">{clock(timer)}</span>}
          sub={running ? 'العد التنازلي' : 'المؤقت متوقف'}
          icon={<TimerIcon className="h-4 w-4" strokeWidth={2} />} />
        
        <StatTile
          index="03"
          label="أصوات الجمهور"
          value={<span className="num">{votes.length}</span>}
          sub={`تم توزيع ${votes.length * 6} نقطة`}
          icon={<UsersIcon className="h-4 w-4" strokeWidth={2} />} />
        
        <StatTile
          index="04"
          label="تقييم الحكام"
          value={
          <span className="num">
              {judgesDone} <span className="text-fg-dim">/ {judges.length}</span>
            </span>
          }
          sub={judgesDone === judges.length ? 'اكتمل التقييم' : 'في انتظار التقييم'}
          icon={<GavelIcon className="h-4 w-4" strokeWidth={2} />} />
        
        <StatTile
          index="05"
          label="المتصدر الحالي"
          value={leader?.team.name.replace('Team ', '') || '—'}
          sub={leader ? `${leader.finalPct.toFixed(1)} pts مجمعة` : ''}
          icon={<TrophyIcon className="h-4 w-4" strokeWidth={2} />} />
        
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          label="الترتيب المباشر"
          index="A1"
          className="xl:col-span-2"
          action={
          <StatusBadge tone={live ? 'live' : 'idle'} blink={live}>
              {live ? 'يتم التحديث' : 'متوقف'}
            </StatusBadge>
          }>
          
          <ul className="space-y-2">
            {results.map((row) =>
            <ResultRow
              key={row.team.id}
              row={row}
              metric={row.finalPct}
              moved={lastMover === row.team.id}
              detail={`${row.points} pts · ${row.judgeAvg.toFixed(1)}/5`} />

            )}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel label="تقدم التصويت" index="A2">
            <TechLabel>نسبة المشاركة (تقديرياً ٤٢٠ حضور)</TechLabel>
            <div className="num mt-2 text-4xl font-extrabold text-brand">
              {participation.toFixed(0)}%
            </div>
            <div className="mt-3">
              <Meter value={participation} segmented />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-sm border border-line bg-ink-950 px-3 py-2.5">
                <TechLabel>الأصوات</TechLabel>
                <div className="num text-xl font-extrabold">{votes.length}</div>
              </div>
              <div className="rounded-sm border border-line bg-ink-950 px-3 py-2.5">
                <TechLabel>النتيجة النهائية</TechLabel>
                <div className="text-xl font-extrabold text-brand">
                  {judgesDone === judges.length ? 'جاهزة' : 'قيد الانتظار'}
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              {live ?
              <Button variant="secondary" size="sm" block onClick={pauseVoting}>
                  إيقاف التصويت مؤقتاً
                </Button> :

              <Button size="sm" block onClick={startVoting}>
                  بدء التصويت
                </Button>
              }
              <Link to="/admin/stage" className="flex-1">
                <Button variant="outline" size="sm" block>
                  شاشة العرض
                </Button>
              </Link>
            </div>
          </Panel>

          <Panel label="حالة النظام" index="A3">
            <ul className="space-y-1.5">
              {STATE_SEQUENCE.map((s, i) => {
                const active = s === state;
                const meta = STATE_META[s];
                return (
                  <li key={s}>
                    <button
                      onClick={() => setState(s)}
                      className={`flex w-full items-center gap-3 rounded-sm border px-3 py-2 text-left transition-colors duration-150 ${
                      active ?
                      'border-brand/60 bg-brand/10' :
                      'border-line bg-ink-950 hover:bg-ink-850'}`
                      }>
                      
                      <span
                        className={`num text-[10px] font-extrabold ${
                        active ? 'text-brand' : 'text-ink-600'}`
                        }>
                        
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`flex-1 truncate text-xs font-bold ${
                        active ? 'text-brand' : 'text-fg-muted'}`
                        }>
                        
                        {meta.label}
                      </span>
                      {active &&
                      <span className="text-[10px] font-extrabold uppercase tracking-tech text-brand">
                          الحالي
                        </span>
                      }
                    </button>
                  </li>);

              })}
            </ul>
          </Panel>
        </div>
      </div>
      <p className="text-[11px] font-semibold text-ink-600">
        {settings.eventName} · {settings.venue}
      </p>
    </div>);

}