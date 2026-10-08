import React, { useRef, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { Team } from '../../types/event';
import { TeamMark } from '../ui/TeamMark';

const RANK_WORD = ['1st Place', '2nd Place', '3rd Place'];

interface TeamSelectCardProps {
  team: Team;
  rank: number | null;
  disabled?: boolean;
  onToggle: () => void;
}

export function TeamSelectCard({
  team,
  rank,
  disabled,
  onToggle
}: TeamSelectCardProps) {
  const selected = rank !== null;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const rectRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (rectRef.current) {
      const rect = rectRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <button
      ref={rectRef}
      type="button"
      onClick={onToggle}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled && !selected}
      aria-pressed={selected}
      className={`group relative flex w-full items-center gap-5 overflow-hidden rounded-2xl border px-5 py-5 text-left transition-all duration-300 ease-out disabled:opacity-40 disabled:cursor-not-allowed ${
        selected ?
        'bg-brand border-brand/80 shadow-[0_4px_16px_rgba(248,201,0,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]' :
        'glass-panel bg-white/[0.02]'
      }`}
    >
      {/* Spotlight for unselected state */}
      {!selected && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 ease-out"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(248,201,0,0.08), transparent 40%)`,
          }}
        />
      )}

      <span
        aria-hidden
        className={`absolute right-4 top-3 font-mono text-[11px] font-bold tracking-widest ${
          selected ? 'text-black/40' : 'text-fg-subtle group-hover:text-fg-muted transition-colors duration-200'
        }`}
      >
        T{team.code}
      </span>

      <div className="relative z-10 shrink-0">
        <TeamMark team={team} size={64} active={false} tone={selected ? 'light' : 'dark'} />
      </div>

      <span className="relative z-10 min-w-0 flex-1">
        <span
          className={`block truncate text-xl font-bold leading-tight tracking-tight ${
            selected ? 'text-black' : 'text-fg'
          }`}
        >
          {team.name}
        </span>
        <span
          className={`mt-1 block truncate text-sm font-medium ${
            selected ? 'text-black/70' : 'text-fg-muted'
          }`}
        >
          {team.tagline}
        </span>
        {selected && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand shadow-sm">
            <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
            {RANK_WORD[(rank as number) - 1]}
          </span>
        )}
      </span>

      <span
        className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-2xl font-bold transition-all duration-300 ${
          selected ?
          'border-black/20 bg-black/90 text-brand' :
          'border-white/10 bg-white/5 text-fg-subtle group-hover:border-brand/40 group-hover:bg-brand/10 group-hover:text-brand'
        }`}
      >
        {selected ? rank : '+'}
      </span>
    </button>
  );
}