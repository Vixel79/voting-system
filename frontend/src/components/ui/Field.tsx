  import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function Input({
  label,
  hint,
  error,
  icon,
  suffix,
  id,
  className = '',
  ...rest
}: InputProps) {
  const inputId = id || `f-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={inputId}
        className="mb-2 block text-[10px] font-extrabold uppercase tracking-tech text-fg-muted">
        
        {label}
      </label>
      <div
        className={`flex items-center gap-2.5 rounded-sm border bg-ink-950 px-3.5 shadow-pressed transition-colors duration-150 focus-within:border-brand ${
        error ? 'border-danger/70' : 'border-line-strong'}`
        }>
        
        {icon && <span className="text-fg-dim">{icon}</span>}
        <input
          id={inputId}
          aria-invalid={!!error}
          {...rest}
          className="h-12 w-full border-none bg-transparent text-sm font-semibold text-fg outline-none placeholder:font-medium placeholder:text-fg-dim focus:border-transparent focus:outline-none focus:ring-0" />
        
        {suffix}
      </div>
      {(hint || error) &&
      <p
        className={`mt-2 text-xs font-semibold ${
        error ? 'text-danger' : 'text-fg-dim'}`
        }>
        
          {error || hint}
        </p>
      }
    </div>);

}

export function Toggle({
  checked,
  onChange,
  label,
  onLabel = 'ON',
  offLabel = 'OFF'






}: {checked: boolean;onChange: (v: boolean) => void;label: string;onLabel?: string;offLabel?: string;}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-11 items-center gap-2 rounded-sm border px-1.5 transition-colors duration-150 ease-mech ${
      checked ?
      'border-brand-shade bg-brand/15' :
      'border-line-strong bg-ink-950'}`
      }>
      
      <span
        className={`num w-9 text-center text-[10px] font-extrabold tracking-tech ${
        checked ? 'text-brand' : 'text-fg-dim'}`
        }>
        
        {checked ? onLabel : offLabel}
      </span>
      <span className="relative h-8 w-14 rounded-[6px] border border-line-strong bg-ink-900 shadow-pressed">
        <span
          className={`absolute left-0 top-[3px] h-[26px] w-[26px] rounded-[4px] transition-transform duration-200 ease-mech ${
          checked ?
          'translate-x-[25px] bg-brand' :
          'translate-x-[3px] bg-ink-600'}`
          } />
        
      </span>
    </button>);

}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange




}: {tabs: {id: T;label: string;}[];value: T;onChange: (v: T) => void;}) {
  return (
    <div
      role="tablist"
      className="inline-flex gap-1 rounded-sm border border-line bg-ink-950 p-1">
      
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`h-9 rounded-[6px] px-3.5 text-[11px] font-extrabold uppercase tracking-tech transition-colors duration-150 ease-mech ${
            active ?
            'bg-brand text-ink-950' :
            'text-fg-muted hover:bg-white/5 hover:text-fg'}`
            }>
            
            {t.label}
          </button>);

      })}
    </div>);

}