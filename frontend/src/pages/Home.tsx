import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  GavelIcon,
  MonitorPlayIcon,
  QrCodeIcon,
  SlidersHorizontalIcon } from
'lucide-react';
import { LogoMark } from '../components/brand/Logo';
import { TechLabel, TechScreen } from '../components/ui/TechScreen';
import { EventStatePill } from '../components/ui/Status';
import { useEvent } from '../contexts/EventContext';

const ENTRIES = [
{
  to: '/vote',
  label: 'Audience Voting',
  note: 'Mobile · QR entry · rank your top 3',
  icon: QrCodeIcon,
  index: '01',
  accent: true
},
{
  to: '/judges',
  label: 'Judges Panel',
  note: 'Score all 5 teams from 1 to 5',
  icon: GavelIcon,
  index: '02'
},
{
  to: '/stage',
  label: 'Stage Screen',
  note: '1920×1080 broadcast output',
  icon: MonitorPlayIcon,
  index: '03'
},
{
  to: '/admin/login',
  label: 'Control Room',
  note: 'Admin login · event command centre',
  icon: SlidersHorizontalIcon,
  index: '04'
}];


export function Home() {
  const { settings, state, votes, results } = useEvent();

  return (
    <TechScreen scan>
      <div className="mx-auto max-w-5xl px-5 py-14 lg:py-20">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <LogoMark size={64} />
            <div>
              <TechLabel>{settings.venue}</TechLabel>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight lg:text-4xl">
                {settings.eventName}
              </h1>
            </div>
          </div>
          <EventStatePill state={state} />
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
          ['Ballots received', votes.length.toString()],
          ['Current leader', results[0]?.team.name || '—'],
          ['Weighting', `${settings.judgesWeight} / ${settings.audienceWeight}`]].
          map(([k, v]) =>
          <div
            key={k}
            className="rounded-lg border border-line bg-ink-900 px-5 py-4">
            
              <TechLabel>{k}</TechLabel>
              <div className="num mt-1 text-2xl font-extrabold text-fg">{v}</div>
            </div>
          )}
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {ENTRIES.map(({ to, label, note, icon: Icon, index, accent }) =>
          <li key={to}>
              <Link
              to={to}
              className={`group flex h-full items-center gap-4 rounded-lg border px-5 py-6 transition-[transform,border-color,background-color] duration-200 ease-mech hover:-translate-y-[2px] ${
              accent ?
              'border-brand-shade bg-brand text-ink-950' :
              'border-line bg-ink-900 hover:border-brand/50'}`
              }>
              
                <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-sm border ${
                accent ?
                'border-ink-950/20 bg-ink-950 text-brand' :
                'border-line-strong bg-ink-950 text-brand'}`
                }>
                
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                  className={`num block text-[10px] font-extrabold tracking-tech ${
                  accent ? 'text-ink-950/60' : 'text-fg-dim'}`
                  }>
                  
                    {index}
                  </span>
                  <span className="block truncate text-xl font-extrabold">
                    {label}
                  </span>
                  <span
                  className={`block truncate text-xs font-semibold ${
                  accent ? 'text-ink-950/70' : 'text-fg-muted'}`
                  }>
                  
                    {note}
                  </span>
                </span>
                <ArrowRightIcon
                className="h-5 w-5 shrink-0 transition-transform duration-200 ease-mech group-hover:translate-x-1"
                strokeWidth={2} />
              
              </Link>
            </li>
          )}
        </ul>

        <p className="mt-10 text-[11px] font-semibold leading-relaxed text-ink-600">
          One shared event state drives all four surfaces — start voting in the
          control room and the audience page, judges panel and stage screen
          respond live.
        </p>
      </div>
    </TechScreen>);

}