import React from 'react';
import { motion } from 'framer-motion';
import { TeamResult } from '../../types/event';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { TeamMark } from '../ui/TeamMark';

import { Trophy } from 'lucide-react';
import { Fireworks } from '../ui/Fireworks';

const ease = [0.23, 1, 0.32, 1] as const;

export function WinnerReveal({
  winner,
  runnersUp
}: {winner: TeamResult;runnersUp: TeamResult[];}) {
  return (
    <div className="relative mx-auto w-full max-w-[1500px]">
      <Fireworks />
      
      {/* controlled stage lighting: two slow yellow sweeps, no confetti */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/[0.06] blur-[2px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0.4, 0.75, 0.4], scale: 1 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
      
      <div className="relative flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
          className="text-base font-extrabold uppercase tracking-tech text-brand lg:text-xl">
          
          And the winner is
        </motion.span>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.28, ease }}
          className="mt-8 flex h-[150px] w-[150px] items-center justify-center rounded-sm border border-brand-shade bg-brand">
          
          <Trophy className="h-20 w-20 text-ink-950" strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3, ease }}
          className="mt-8 text-[84px] font-extrabold uppercase leading-[0.9] tracking-tight text-brand lg:text-[140px]">
          
          {winner.team.name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.25 }}
          className="mt-10 flex items-end gap-12 border-t border-line pt-8">
          
          <div className="text-left">
            <div className="text-[11px] font-extrabold uppercase tracking-tech text-fg-muted lg:text-sm">
              Final score
            </div>
            <div className="num mt-1 text-6xl font-extrabold leading-none text-fg lg:text-[92px]">
              <AnimatedNumber
                value={winner.finalPct}
                decimals={1}
                suffix="%"
                duration={1400} />
              
            </div>
          </div>
          <div className="hidden h-20 w-px bg-line sm:block" aria-hidden />
          <div className="hidden text-left sm:block">
            <div className="mt-4 text-[13px] font-extrabold uppercase tracking-widest text-brand lg:text-sm">
              Total Score: {winner.finalPct.toFixed(0)}%
            </div>
            <div className="mt-2 text-2xl font-extrabold text-fg-soft lg:text-4xl">
              Congratulations!
            </div>
          </div>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.3, ease }}
          className="mt-12 flex w-full flex-wrap items-stretch justify-center gap-3">
          
          {runnersUp.map((r) =>
          <li
            key={r.team.id}
            className="flex min-w-[240px] flex-1 items-center gap-4 rounded-lg border border-line bg-ink-900 px-6 py-4 text-left">
            
              <span className="num text-2xl font-extrabold text-fg-dim">
                {String(r.rank).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 truncate text-xl font-extrabold text-fg">
                {r.team.name}
              </span>
              <span className="num text-2xl font-extrabold text-fg-muted">
                {r.finalPct.toFixed(1)}%
              </span>
            </li>
          )}
        </motion.ul>
      </div>
    </div>);

}