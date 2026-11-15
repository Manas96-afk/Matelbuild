'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** A subtle blueprint grid background. */
export function BlueprintGrid({
  className,
  animate = false,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 bg-grid-faint [background-size:34px_34px]',
        animate && 'bg-grid-scroll',
        className
      )}
      aria-hidden="true"
    />
  );
}

/** A precise cross / plus registration mark, like a drafting template. */
export function Crosshair({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} aria-hidden="true">
      <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * Animated technical floor-plan drawing with dimension lines that "draw" themselves
 * on mount and redraw when scrolled into view. Pure SVG, no dependencies.
 */
export function BlueprintDrawing({ className }: { className?: string }) {
  const ref = React.useRef<SVGSVGElement>(null);
  const [draw, setDraw] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setDraw(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setDraw(true)),
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const stroke = 'rgba(120,150,255,0.55)';
  const accent = 'rgba(31,87,224,0.9)';

  const paths = [
    // outer walls
    'M60 70 H440 V330 H60 Z',
    // inner partition
    'M250 70 V330',
    'M60 200 H440',
    // room divisions
    'M155 70 V200',
    'M345 200 V330',
    // door swing
    'M155 200 A40 40 0 0 1 195 240',
    // window gaps (breaks)
    'M60 130 H90 M110 130 H140',
    'M360 70 V100 M360 130 V160',
  ];

  const dims = [
    // top horizontal dimension
    'M60 50 H440',
    // left vertical dimension
    'M40 70 V330',
  ];

  return (
    <svg
      ref={ref}
      viewBox="0 0 500 380"
      className={cn('h-full w-full', className)}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bpfill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(31,87,224,0.06)" />
          <stop offset="100%" stopColor="rgba(31,87,224,0)" />
        </linearGradient>
      </defs>

      <rect x="60" y="70" width="380" height="260" fill="url(#bpfill)" />

      {/* dimension lines (draw first, thin) */}
      <g stroke={accent} strokeWidth="1" strokeDasharray="4 4" opacity={draw ? 0.85 : 0}>
        {dims.map((d, i) => (
          <path
            key={`dim-${i}`}
            d={d}
            style={{
              strokeDashoffset: draw ? 0 : 400,
              transition: `stroke-dashoffset 1.2s ease ${0.2 + i * 0.15}s`,
            }}
          />
        ))}
        {/* tick marks */}
        <path d="M60 44 V56 M440 44 V56 M34 70 H46 M34 330 H46" />
      </g>

      {/* main plan lines */}
      <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((d, i) => (
          <path
            key={`p-${i}`}
            d={d}
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: draw ? 0 : 1,
              transition: `stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.12}s`,
            }}
          />
        ))}
      </g>

      {/* corner registration marks */}
      <g stroke={accent} strokeWidth="1" opacity={draw ? 0.9 : 0} style={{ transition: 'opacity 1s ease 1s' }}>
        {[
          [60, 70],
          [440, 70],
          [60, 330],
          [440, 330],
        ].map(([x, y], i) => (
          <g key={`c-${i}`}>
            <path d={`M${x - 10} ${y} H${x + 10} M${x} ${y - 10} V${y + 10}`} />
            <circle cx={x} cy={y} r="3" />
          </g>
        ))}
      </g>

      {/* dimension labels */}
      <g fill="rgba(31,87,224,0.95)" fontFamily="IBM Plex Mono, monospace" fontSize="11" opacity={draw ? 1 : 0} style={{ transition: 'opacity 0.8s ease 1.2s' }}>
        <text x="250" y="42" textAnchor="middle">14.20 m</text>
        <text x="26" y="204" textAnchor="middle" transform="rotate(-90 26 204)">8.40 m</text>
        <text x="250" y="360" textAnchor="middle" fontStyle="italic">G+2 · RCC FRAME</text>
      </g>
    </svg>
  );
}

/** Parallax wrapper: translates children on scroll for depth. */
export function Parallax({
  children,
  speed = 0.15,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [y, setY] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
        setY(offset);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ transform: `translate3d(0, ${y}px, 0)` }}>
      {children}
    </div>
  );
}

/** A thin animated progress / scanning line used as an accent. */
export function ScanLine({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden', className)} aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent animate-scan" />
    </div>
  );
}
