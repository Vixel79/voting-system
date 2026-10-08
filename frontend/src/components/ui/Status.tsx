import React from 'react';
import { EventState } from '../../types/event';

type Tone = 'live' | 'idle' | 'warn' | 'ok' | 'off';

const toneMap: Record<Tone, {dot: string;text: string;ring: string;}> = {
  live: {
    dot: 'bg-brand shadow-led',
    text: 'text-brand',
    ring: 'border-brand/45 bg-brand/10'
  },
  ok: {
    dot: 'bg-ok shadow-led-ok',
    text: 'text-ok',
    ring: 'border-ok/40 bg-ok/10'
  },
  warn: {
    dot: 'bg-danger shadow-[0_0_10px_rgba(224,74,69,0.7)]',
    text: 'text-danger',
    ring: 'border-danger/45 bg-danger/10'
  },
  idle: {
    dot: 'bg-fg-dim',
    text: 'text-fg-muted',
    ring: 'border-line-strong bg-white/[0.03]'
  },
  off: {
    dot: 'bg-ink-600',
    text: 'text-fg-dim',
    ring: 'border-line bg-transparent'
  }
};

export function Led({
  tone = 'live',
  blink,
  className = ''




}: {tone?: Tone;blink?: boolean;className?: string;}) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${toneMap[tone].dot} ${
      blink ? 'led-blink' : ''} ${
      className}`} />);


}

export function StatusBadge({
  tone = 'idle',
  children,
  blink,
  className = ''





}: {tone?: Tone;children: React.ReactNode;blink?: boolean;className?: string;}) {
  const t = toneMap[tone];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-[6px] border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-tech ${t.ring} ${t.text} ${className}`}>
      
      <Led tone={tone} blink={blink} />
      {children}
    </span>);

}

export const STATE_META: Record<
  EventState,
  {label: string;tone: Tone;blink?: boolean;note: string;}> =
{
  not_started: {
    label: 'Event not started',
    tone: 'off',
    note: 'Stage idle · voting locked'
  },
  starting_soon: {
    label: 'Voting starting soon',
    tone: 'idle',
    note: 'Audience arriving · QR live'
  },
  voting_live: {
    label: 'Voting live',
    tone: 'live',
    blink: true,
    note: 'Ballots accepted'
  },
  ending_soon: {
    label: 'Voting ending soon',
    tone: 'warn',
    blink: true,
    note: 'Final seconds'
  },
  voting_closed: {
    label: 'Voting closed',
    tone: 'idle',
    note: 'No further ballots accepted'
  },
  final_ready: {
    label: 'Final results ready',
    tone: 'ok',
    note: 'Awaiting publish command'
  },
  winner_published: {
    label: 'Winner published',
    tone: 'ok',
    note: 'Winner live on stage screen'
  },
  finished: { label: 'Event finished', tone: 'off', note: 'Archive mode' }
};

export function EventStatePill({ state }: {state: EventState;}) {
  const meta = STATE_META[state];
  return (
    <StatusBadge tone={meta.tone} blink={meta.blink}>
      {meta.label}
    </StatusBadge>);

}