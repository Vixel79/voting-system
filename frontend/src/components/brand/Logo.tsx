import React from 'react';

interface LogoProps {
  size?: number;
  tone?: 'yellow' | 'black' | 'white';
  className?: string;
}

/**
 * Brand mark: Replaced with the supplied Minders logo asset.
 */
export function LogoMark({ size = 40, tone = 'yellow', className = '' }: LogoProps) {
  let src = '/Minders Logos/Yellow/SVG/Minders.png';
  if (tone === 'black') {
    src = '/Minders Logos/Black/Minders.png';
  } else if (tone === 'white') {
    src = '/Minders Logos/White/Untitled-3.png';
  }

  return (
    <img
      src={src}
      alt="Minders Logo"
      style={{ width: size, height: 'auto', objectFit: 'contain' }}
      className={`shrink-0 ${className}`}
    />
  );
}

export function LogoLockup({
  size = 36,
  tone = 'yellow',
  title,
  subtitle,
  className = ''
}: LogoProps & {title?: string;subtitle?: string;}) {
  const light = tone === 'black';
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} tone={tone} />
      {(title || subtitle) && (
        <div className="leading-tight">
          {title && (
            <div
              className={`font-bold tracking-tight ${
              light ? 'text-ink-950' : 'text-fg'}`
              }
              style={{ fontSize: size * 0.42 }}>
              {title}
            </div>
          )}
          {subtitle && (
            <div
              className={`text-[11px] font-semibold uppercase tracking-widest ${
              light ? 'text-ink-600' : 'text-fg-muted'}`
              }>
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}