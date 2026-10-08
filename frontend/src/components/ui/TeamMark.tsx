import React from 'react';
import { Team } from '../../types/event';

interface TeamMarkProps {
  team: Team;
  size?: number;
  active?: boolean;
  tone?: 'dark' | 'light';
}

/** Geometric team emblem: monogram plate with technical corner notch. */
export function TeamMark({
  team,
  size = 52,
  active = false,
  tone = 'dark'
}: TeamMarkProps) {
  const light = tone === 'light';
  return (
    <div
      aria-hidden
      className={`relative grid shrink-0 place-items-center rounded-sm border font-extrabold transition-colors duration-200 ease-mech ${
      active ?
      'border-brand-shade bg-brand text-ink-950' :
      light ?
      'border-line-light bg-paper-200 text-ink-800' :
      'border-line-strong bg-ink-800 text-fg-soft'}`
      }
      style={{ width: size, height: size, fontSize: size * 0.42 }}>
      
      {team.monogram}
      <span
        className={`absolute right-0 top-0 h-2 w-2 ${
        active ? 'bg-ink-950/25' : light ? 'bg-ink-950/10' : 'bg-black/40'}`
        }
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
      
    </div>);

}

export function RankBadge({
  rank,
  size = 'md',
  tone = 'dark'




}: {rank: number;size?: 'sm' | 'md' | 'lg' | 'stage';tone?: 'dark' | 'light';}) {
  const dims = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-10 w-10 text-base',
    lg: 'h-14 w-14 text-2xl',
    stage: 'h-24 w-24 text-6xl'
  }[size];
  const podium = rank <= 3;
  return (
    <span
      className={`num grid shrink-0 place-items-center rounded-full border font-extrabold ${dims} ${
      podium ?
      'border-brand-shade bg-brand text-ink-950' :
      tone === 'light' ?
      'border-line-light bg-white text-ink-600' :
      'border-line-strong bg-ink-850 text-fg-muted'}`
      }
      aria-label={`Rank ${rank}`}>
      
      {rank.toString().padStart(2, '0')}
    </span>);

}