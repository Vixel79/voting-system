import React, { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

/** Broadcast-style count-up. Snaps to the target on reduced-motion. */
export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
  duration = 600,
  className = ''
}: AnimatedNumberProps) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = performance.now();
    const origin = from.current;
    const delta = value - origin;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(origin + delta * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);else
      from.current = value;
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={`num tabular-nums ${className}`}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>);

}