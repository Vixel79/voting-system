import React from 'react';

/** Full-bleed cinematic technical environment wrapper */
export function TechScreen({
  children,
  tone = 'dark',
  scan = false,
  className = ''
}: {children: React.ReactNode;tone?: 'dark' | 'light';scan?: boolean;className?: string;}) {
  return (
    <div className={`tech-canvas text-fg ${className}`}>
      {/* Ambient Light Blobs */}
      <div className="ambient-blobs">
        <div className="ambient-blob blob-primary" />
        <div className="ambient-blob blob-secondary" />
      </div>

      <div className="relative z-10 w-full min-h-full">
        {children}
      </div>
    </div>
  );
}

export function TechLabel({
  children,
  className = ''
}: {children: React.ReactNode;className?: string;}) {
  return (
    <span
      className={`text-[12px] font-mono tracking-widest text-fg-subtle uppercase ${className}`}>
      {children}
    </span>
  );
}

export function Divider({ accent = false }: {accent?: boolean;}) {
  return (
    <div
      aria-hidden
      className={`h-px w-full ${accent ? 'bg-brand/30' : 'bg-white/[0.06]'}`}
    />
  );
}