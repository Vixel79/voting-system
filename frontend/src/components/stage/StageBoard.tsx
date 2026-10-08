import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { TeamResult } from '../../types/event';
import { ResultRow } from '../results/ResultRow';

interface StageBoardProps {
  title: string;
  subtitle: string;
  rows: TeamResult[];
  metric: (r: TeamResult) => number;
  lastMover: string | null;
}

export function StageBoard({
  title,
  subtitle,
  rows,
  metric,
  lastMover
}: StageBoardProps) {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <h1 className="text-5xl font-extrabold leading-none tracking-tight text-fg lg:text-6xl">
          {title}
        </h1>
        <span className="text-sm font-extrabold uppercase tracking-tech text-brand">
          {subtitle}
        </span>
      </div>
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {rows.map((row) =>
          <ResultRow
            key={row.team.id}
            row={row}
            metric={metric(row)}
            moved={lastMover === row.team.id}
            scale="stage" />

          )}
        </AnimatePresence>
      </ul>
    </div>);

}