import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogoMark } from '../brand/Logo';
import { Led } from '../ui/Status';
import { clock } from '../../utils/scoring';

interface StageFrameProps {
  children: React.ReactNode;
  eventName: string;
  round: string;
  live?: boolean;
  timer?: number;
  totalVotes?: number;
  ticker?: string[];
}

export function StageFrame({
  children,
  eventName,
  round,
  live,
  timer,
  totalVotes,
  ticker
}: StageFrameProps) {
  return (
    <div className="tech-grid-dark tech-noise relative flex min-h-full w-full flex-col overflow-hidden">
      <div className="hatch h-2 w-full shrink-0" aria-hidden />
      <header className="flex shrink-0 items-center justify-between gap-6 border-b border-line px-8 py-5 lg:px-12">
        <div className="flex items-center gap-4">
          <LogoMark size={52} />
          <div>
            <div className="text-xl font-extrabold leading-none tracking-tight lg:text-2xl">
              {eventName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {typeof totalVotes === 'number' &&
          <div className="text-right">
              <div className="text-[11px] font-extrabold uppercase tracking-tech text-fg-muted">
                Total audience votes
              </div>
              <div className="num text-3xl font-extrabold leading-none text-fg lg:text-4xl">
                {totalVotes.toLocaleString()}
              </div>
            </div>
          }
          {typeof timer === 'number' &&
          <div className="text-right">
              <div className="text-[11px] font-extrabold uppercase tracking-tech text-fg-muted">
                Time remaining
              </div>
              <div
              className={`num text-3xl font-extrabold leading-none lg:text-4xl ${
              timer <= 15 ? 'text-danger' : 'text-brand'}`
              }>
              
                {clock(timer)}
              </div>
            </div>
          }
          {live &&
          <div className="flex items-center gap-2.5 rounded-sm border border-brand/50 bg-brand/10 px-4 py-2">
              <Led tone="live" blink />
              <span className="text-sm font-extrabold uppercase tracking-tech text-brand">
                Live
              </span>
            </div>
          }
        </div>
      </header>

      <main className="relative flex flex-1 flex-col justify-center px-8 py-8 lg:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={String((children as any)?.type?.name || Math.random())}
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="flex h-full w-full flex-col justify-center"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {ticker &&
      <footer className="flex shrink-0 items-center gap-6 border-t border-line bg-ink-950 px-8 py-3 lg:px-12">
          {ticker.map((t, i) =>
        <span
          key={t}
          className="flex items-center gap-6 text-[11px] font-extrabold uppercase tracking-tech text-fg-dim">
          
              {i > 0 && <span className="h-3 w-px bg-line" aria-hidden />}
              {t}
            </span>
        )}
        </footer>
      }
    </div>);

}