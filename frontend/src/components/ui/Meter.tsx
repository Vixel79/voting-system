import React from 'react';

interface MeterProps {
  value: number;
  max?: number;
  tone?: 'brand' | 'neutral' | 'ok';
  height?: number;
  label?: string;
  segmented?: boolean;
}

export function Meter({
  value,
  max = 100,
  tone = 'brand',
  height = 10,
  label,
  segmented = false
}: MeterProps) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const fill =
  tone === 'brand' ? 'bg-brand' : tone === 'ok' ? 'bg-ok' : 'bg-fg-dim';
  return (
    <div
      className="relative w-full overflow-hidden rounded-[3px] border border-line bg-ink-950 shadow-pressed"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}>
      
      <div
        className={`h-full ${fill} transition-[width] duration-700 ease-mech`}
        style={{ width: `${pct}%` }} />
      
      {segmented &&
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
          'repeating-linear-gradient(90deg, transparent 0 11px, rgba(10,10,10,0.85) 11px 13px)'
        }} />

      }
    </div>);

}

export function StatTile({
  label,
  value,
  sub,
  accent = false,
  icon,
  index







}: {label: string;value: React.ReactNode;sub?: React.ReactNode;accent?: boolean;icon?: React.ReactNode;index?: string;}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border px-5 py-4 ${
      accent ?
      'border-brand-shade bg-brand text-ink-950' :
      'border-line bg-ink-900 text-fg shadow-panel'}`
      }>
      
      <div className="flex items-start justify-between gap-3">
        <span
          className={`text-[10px] font-extrabold uppercase tracking-tech ${
          accent ? 'text-ink-950/70' : 'text-fg-muted'}`
          }>
          
          {label}
        </span>
        <span className={accent ? 'text-ink-950/60' : 'text-fg-dim'}>
          {icon}
        </span>
      </div>
      <div className="mt-2 text-4xl font-extrabold leading-none">{value}</div>
      {sub &&
      <div
        className={`mt-2 text-xs font-semibold ${
        accent ? 'text-ink-950/70' : 'text-fg-dim'}`
        }>
        
          {sub}
        </div>
      }
      {index &&
      <span
        className={`num absolute bottom-2 right-3 text-[10px] font-extrabold ${
        accent ? 'text-ink-950/40' : 'text-ink-700'}`
        }>
        
          {index}
        </span>
      }
    </div>);

}