import React, { useRef, useState } from 'react';

interface PanelProps {
  children: React.ReactNode;
  label?: string;
  index?: string;
  action?: React.ReactNode;
  tone?: 'dark' | 'light';
  screws?: boolean;
  className?: string;
  bodyClassName?: string;
}

export function Panel({
  children,
  label,
  index,
  action,
  tone = 'dark',
  screws = false,
  className = '',
  bodyClassName = ''
}: PanelProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const rectRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rectRef.current) {
      const rect = rectRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <section
      ref={rectRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`glass-panel relative overflow-hidden group ${className}`}
    >
      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(248,201,0,0.08), transparent 40%)`,
        }}
      />

      <div className="relative z-10">
        {(label || action) && (
          <header className="flex items-center justify-between gap-4 border-b border-white/[0.04] px-6 py-4 bg-white/[0.01]">
            <div className="flex min-w-0 items-center gap-3">
              {index && (
                <span className="flex items-center justify-center rounded bg-brand/10 text-brand px-2 py-1 text-xs font-mono font-bold tracking-widest border border-brand/20">
                  {index}
                </span>
              )}
              <h2 className="truncate text-sm font-semibold tracking-tight text-fg-subtle">
                {label}
              </h2>
            </div>
            {action && <div>{action}</div>}
          </header>
        )}
        <div className={`px-6 py-6 ${bodyClassName}`}>{children}</div>
      </div>
    </section>
  );
}