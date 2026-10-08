import React from 'react';
import { LogoLockup } from '../brand/Logo';
import { EventStatePill } from '../ui/Status';
import { EventState } from '../../types/event';

export function AudienceHeader({
  eventName,
  round,
  state




}: {eventName: string;round: string;state: EventState;}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <LogoLockup size={34} subtitle="Audience Vote" />
        <EventStatePill state={state} />
      </div>
      <div className="border-t border-line bg-ink-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-1.5">
          <span className="truncate text-[10px] font-bold uppercase tracking-tech text-fg-muted">
            {eventName}
          </span>
          <span className="num shrink-0 text-[10px] font-bold uppercase tracking-tech text-fg-dim">
            {round}
          </span>
        </div>
      </div>
    </header>);

}