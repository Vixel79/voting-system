import React, { useEffect, useRef, useState } from 'react';
import { StageDisplay } from '../../pages/StageDisplay';

/** Scaled 1920×1080 mirror of the live stage output. */
export function StagePreview() {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / 1920);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      className="relative w-full overflow-hidden rounded-sm border border-line-strong bg-black shadow-pressed"
      style={{ aspectRatio: '16 / 9' }}
      aria-label="Stage output preview">
      
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}>
        
        <StageDisplay />
      </div>
    </div>);

}