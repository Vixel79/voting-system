import React from 'react';
import { clock } from '../../utils/scoring';

interface CountdownProps {
  seconds: number;
  total: number;
  running: boolean;
  size?: 'sm' | 'md' | 'lg' | 'stage';
  label?: string;
}

const sizeMap = {
  sm: 'text-2xl',
  md: 'text-5xl',
  lg: 'text-[64px] leading-none',
  stage: 'text-[140px] leading-[0.85]'
};

export function Countdown({
  seconds,
  total,
  running,
  size = 'md',
  label = 'Voting ends in'
}: CountdownProps) {
  const low = seconds <= 15 && seconds > 0;
  const done = seconds <= 0;
  const progress = Math.max(0, Math.min(1, seconds / Math.max(1, total)));

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-tech text-fg-muted">
          {label}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-tech text-fg-dim">
          {done ? 'Closed' : running ? 'Counting' : 'Paused'}
        </span>
      </div>
      <div
        className={`num font-extrabold tabular-nums ${sizeMap[size]} ${
        done ? 'text-fg-dim' : low ? 'text-danger' : 'text-brand'} ${
        low && running ? 'led-blink' : ''}`}
        role="timer"
        aria-live="off">
        
        {clock(seconds)}
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-[3px] border border-line bg-ink-950">
        <div
          className={`h-full transition-[width] duration-1000 ease-linear ${
          low ? 'bg-danger' : 'bg-brand'}`
          }
          style={{ width: `${progress * 100}%` }} />
        
      </div>
    </div>);

}