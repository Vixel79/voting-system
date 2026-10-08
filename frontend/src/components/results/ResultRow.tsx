import React from 'react';
import { motion } from 'framer-motion';
import { TeamResult } from '../../types/event';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Meter } from '../ui/Meter';
import { TeamMark, RankBadge } from '../ui/TeamMark';

interface ResultRowProps {
  row: TeamResult;
  metric: number;
  moved?: boolean;
  scale?: 'admin' | 'stage';
  detail?: React.ReactNode;
}

export function ResultRow({
  row,
  metric,
  moved,
  scale = 'admin',
  detail
}: ResultRowProps) {
  const stage = scale === 'stage';
  const lead = row.rank === 1;
  return (
    <motion.li
      layout
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      className={`relative flex items-center gap-4 border ${
      stage ? 'rounded-lg px-7 py-5' : 'rounded-sm px-4 py-3'} ${

      lead ?
      'border-brand/50 bg-brand/[0.07]' :
      'border-line bg-ink-900'} ${
      moved ? 'ring-2 ring-brand' : ''}`}>
      
      {moved &&
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg bg-brand/20"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }} />

      }
      <RankBadge rank={row.rank} size={stage ? 'stage' : 'md'} />
      <TeamMark team={row.team} size={stage ? 84 : 44} active={lead} />
      <div className="min-w-0 flex-1">
        <div
          className={`truncate font-extrabold ${
          stage ? 'text-[54px] leading-none' : 'text-base'} ${
          lead ? 'text-brand' : 'text-fg'}`}>
          
          {row.team.name}
        </div>
        {stage ?
        <div className="mt-3">
            <Meter value={metric} height={12} tone={lead ? 'brand' : 'neutral'} segmented />
          </div> :

        <div className="mt-1.5 flex items-center gap-3">
            <Meter value={metric} height={6} tone={lead ? 'brand' : 'neutral'} />
            {detail &&
          <span className="num shrink-0 text-[11px] font-bold text-fg-dim">
                {detail}
              </span>
          }
          </div>
        }
      </div>
      <div
        className={`num shrink-0 text-right font-extrabold ${
        stage ? 'text-[72px] leading-none' : 'text-2xl'} ${
        lead ? 'text-brand' : 'text-fg'}`}>
        
        <AnimatedNumber value={metric} decimals={stage ? 0 : 1} suffix="%" />
      </div>
    </motion.li>);

}