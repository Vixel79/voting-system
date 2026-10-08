import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ExternalLinkIcon,
  GaugeIcon,
  GavelIcon,
  LayoutPanelTopIcon,
  ListChecksIcon,
  MenuIcon,
  MonitorPlayIcon,
  SettingsIcon,
  TrophyIcon,
  UsersIcon,
  VoteIcon,
  XIcon } from
'lucide-react';
import { LogoLockup } from '../brand/Logo';
import { EventStatePill, Led } from '../ui/Status';
import { useEvent } from '../../contexts/EventContext';
import { clock } from '../../utils/scoring';

const NAV = [
{ to: '/admin', label: 'نظرة عامة', icon: GaugeIcon, end: true },
{ to: '/admin/audience', label: 'تصويت الجمهور', icon: VoteIcon },
{ to: '/admin/ballots', label: 'إدارة التصويت', icon: ListChecksIcon },
{ to: '/admin/judges', label: 'الحكام', icon: GavelIcon },
{ to: '/admin/judges-results', label: 'نتائج الحكام', icon: LayoutPanelTopIcon },
{ to: '/admin/final', label: 'النتيجة النهائية', icon: TrophyIcon },
{ to: '/admin/stage', label: 'التحكم بالشاشة', icon: MonitorPlayIcon },
{ to: '/admin/teams', label: 'الفرق', icon: UsersIcon },
{ to: '/admin/settings', label: 'إعدادات الحدث', icon: SettingsIcon }];


export function AdminShell({ children }: {children: React.ReactNode;}) {
  const { state, timer, running, display } = useEvent();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const nav =
  <nav className="flex flex-col gap-1 p-3">
      {NAV.map(({ to, label, icon: Icon, end }) =>
    <NavLink
      key={to}
      to={to}
      end={end}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
      `flex h-11 items-center gap-3 rounded-sm border px-3 text-sm font-bold transition-colors duration-150 ease-mech ${
      isActive ?
      'border-brand-shade bg-brand text-ink-950' :
      'border-transparent text-fg-muted hover:bg-white/5 hover:text-fg'}`

      }>
      
          <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="truncate">{label}</span>
        </NavLink>
    )}
      <a
      href="https://display-screen-minders.vercel.app/"
      target="display_window"
      rel="noreferrer"
      onClick={(e) => {
        e.preventDefault();
        const win = window.open('https://display-screen-minders.vercel.app/', 'display_window');
        if (win) (window as any).__DISPLAY_WINDOW__ = win;
      }}
      className="mt-3 flex h-11 items-center gap-3 rounded-sm border border-line px-3 text-sm font-bold text-fg-muted transition-colors duration-150 hover:border-brand/50 hover:text-brand">
      
        <ExternalLinkIcon className="h-4 w-4" strokeWidth={2} />
        فتح شاشة العرض
      </a>
    </nav>;


  return (
    <div className="flex min-h-full w-full bg-ink-950">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-ink-900 lg:flex">
        <div className="flex h-16 items-center border-b border-line px-4">
          <LogoLockup size={32} subtitle="لوحة التحكم" />
        </div>
        {nav}
        <div className="mt-auto border-t border-line p-4">
          <div className="flex items-center gap-2">
            <Led tone={display.power ? 'live' : 'off'} blink={display.power} />
            <span className="text-[10px] font-extrabold uppercase tracking-tech text-fg-muted">
              {display.power ?
              `الشاشة متصلة · ${display.mode.replace('_', ' ')}` :
              'الشاشة مخفية'}
            </span>
          </div>
        </div>
      </aside>

      {open &&
      <div className="fixed inset-0 z-40 lg:hidden">
          <div
          className="absolute inset-0 bg-black/80"
          onClick={() => setOpen(false)} />
        
          <div className="relative h-full w-72 border-r border-line bg-ink-900">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <LogoLockup size={30} subtitle="لوحة التحكم" />
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <XIcon className="h-5 w-5 text-fg-muted" strokeWidth={2} />
              </button>
            </div>
            {nav}
          </div>
        </div>
      }

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-ink-950/95 px-4 backdrop-blur lg:px-7">
          <button
            className="grid h-10 w-10 place-items-center rounded-sm border border-line text-fg-muted lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu">
            
            <MenuIcon className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-extrabold uppercase tracking-tech text-fg">
              {NAV.find((n) =>
              n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
              )?.label || 'لوحة التحكم'}
            </h1>
          </div>
          <div className="num hidden items-center gap-2 rounded-sm border border-line bg-ink-900 px-3 py-1.5 sm:flex">
            <span className="text-[10px] font-extrabold uppercase tracking-tech text-fg-dim">
              المؤقت
            </span>
            <span
              className={`text-sm font-extrabold ${
              timer <= 15 && running ? 'text-danger' : 'text-brand'}`
              }>
              
              {clock(timer)}
            </span>
          </div>
          <EventStatePill state={state} />
        </header>
        <main className="tech-grid-dark min-w-0 flex-1 px-4 py-6 lg:px-7 lg:py-8">
          {children}
        </main>
      </div>
    </div>);

}