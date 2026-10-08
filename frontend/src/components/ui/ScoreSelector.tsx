import React from 'react';
import { StarIcon } from 'lucide-react';

interface ScoreSelectorProps {
  value: number;
  onChange: (v: number) => void;
  teamName: string;
  disabled?: boolean;
}

/** Mechanical 1–5 score bank: physical keys, not stars-only. */
export function ScoreSelector({
  value,
  onChange,
  teamName,
  disabled
}: ScoreSelectorProps) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={`Score for ${teamName}`}
        className="grid grid-cols-5 gap-2">
        
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${n} out of 5`}
              disabled={disabled}
              onClick={() => onChange(n)}
              className={`num h-14 rounded-sm border text-xl font-extrabold transition-[transform,background-color,color,box-shadow] duration-150 ease-mech disabled:opacity-50 ${
              active ?
              'border-brand-shade bg-brand text-ink-950 shadow-[0_3px_0_0_#A88A00]' :
              'border-line-strong bg-ink-950 text-fg-muted shadow-pressed hover:border-line-strong hover:bg-ink-800 hover:text-fg active:translate-y-[2px]'}`
              }>
              
              {n}
            </button>);

        })}
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-0.5" aria-hidden>
          {[1, 2, 3, 4, 5].map((n) =>
          <StarIcon
            key={n}
            className={`h-4 w-4 ${
            n <= value ? 'fill-brand text-brand' : 'text-ink-700'}`
            }
            strokeWidth={1.5} />

          )}
        </div>
        <span className="num text-sm font-extrabold text-fg">
          {value ? `${value} / 5` : '— / 5'}
        </span>
      </div>
    </div>);

}