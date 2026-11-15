'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const INK = 'rgba(42,38,32,0.65)';
const ACCENT = '#1f57e0';
const GOLD = '#d6b26e';

/** Animated 3D-ish structural frame: column + beam with load arrows + dimension. */
export function StructuralFrame({ className }: { className?: string }) {
  const ref = React.useRef<SVGSVGElement>(null);
  const [draw, setDraw] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && setDraw(true)),
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <svg ref={ref} viewBox="0 0 320 260" className={cn('h-full w-full', className)} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="colg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbf8f1" />
          <stop offset="100%" stopColor="#e7dfcd" />
        </linearGradient>
        <linearGradient id="beag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6f1e7" />
          <stop offset="100%" stopColor="#d8cdb6" />
        </linearGradient>
      </defs>

      {/* ground line */}
      <path d="M20 232 H300" stroke={INK} strokeWidth="1.5" strokeDasharray="6 4" />

      {/* column */}
      <g>
        <rect x="120" y="70" width="34" height="160" rx="3" fill="url(#colg)" stroke={INK} strokeWidth="1.5"
          style={{ transformOrigin: '137px 150px' }} className="animate-drift" />
        <path d="M120 70 H154 M120 150 H154 M120 232 H154" stroke={INK} strokeWidth="0.8" opacity="0.5" />
        {/* stirrups */}
        {[90, 120, 150, 180, 210].map((y) => (
          <rect key={y} x="126" y={y} width="22" height="10" rx="2" fill="none" stroke={ACCENT} strokeWidth="1.2" opacity="0.8" />
        ))}
      </g>

      {/* beam */}
      <rect x="154" y="58" width="120" height="26" rx="3" fill="url(#beag)" stroke={INK} strokeWidth="1.5" />
      <path d="M154 71 H274" stroke={INK} strokeWidth="0.8" opacity="0.5" />

      {/* load arrows (animated) */}
      <g stroke={ACCENT} strokeWidth="2" strokeLinecap="round">
        {[180, 214, 248].map((x, i) => (
          <g key={x} style={{ animation: `drift ${5 + i}s ease-in-out ${i * 0.4}s infinite` }}>
            <path d={`M${x} 30 V54`} />
            <path d={`M${x - 4} 48 L${x} 56 L${x + 4} 48`} />
          </g>
        ))}
      </g>

      {/* dimension line */}
      <g stroke={GOLD} strokeWidth="1.2" opacity={draw ? 1 : 0} style={{ transition: 'opacity 1s ease 0.6s' }}>
        <path d="M137 246 H274" className="draw" style={draw ? { strokeDashoffset: 0 } : undefined} pathLength={1} />
        <path d="M137 240 V252 M274 240 V252" />
        <text x="205" y="262" textAnchor="middle" fill={GOLD} fontFamily="IBM Plex Mono, monospace" fontSize="10">4.20 m SPAN</text>
      </g>
    </svg>
  );
}

/** Survey theodolite / total station motif with sweeping beam. */
export function SurveyScope({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 220" className={cn('h-full w-full', className)} fill="none" aria-hidden="true">
      {/* sweeping beam */}
      <defs>
        <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(31,87,224,0.5)" />
          <stop offset="100%" stopColor="rgba(31,87,224,0)" />
        </linearGradient>
      </defs>
      <g style={{ transformOrigin: '70px 120px', animation: 'spin 9s linear infinite' }}>
        <path d="M70 120 L210 60" stroke="url(#sweep)" strokeWidth="14" strokeLinecap="round" />
        <path d="M70 120 L210 60" stroke={ACCENT} strokeWidth="1.5" />
      </g>
      {/* station tripod */}
      <circle cx="70" cy="120" r="8" fill="#fbf8f1" stroke={INK} strokeWidth="1.5" />
      <path d="M70 128 L52 180 M70 128 L88 180 M70 128 V180" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      {/* grid ticks on ground */}
      {[20, 60, 100, 140, 180, 220, 260].map((x) => (
        <path key={x} d={`M${x} 196 V202`} stroke={INK} strokeWidth="1" opacity="0.5" />
      ))}
      <path d="M20 199 H260" stroke={INK} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
      <text x="70" y="200" textAnchor="middle" fill={GOLD} fontFamily="IBM Plex Mono, monospace" fontSize="9">STN-01</text>
    </svg>
  );
}

/** RCC cross-section / rebar cage detail with pulsing nodes. */
export function RebarSection({ className }: { className?: string }) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <svg viewBox="0 0 300 200" className={cn('h-full w-full', className)} fill="none" aria-hidden="true">
      <rect x="30" y="40" width="240" height="120" rx="6" fill="#f6f1e7" stroke={INK} strokeWidth="1.5" />
      {/* cover */}
      <rect x="30" y="40" width="240" height="120" rx="6" fill="none" stroke={GOLD} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
      {/* rebar verticals */}
      {[60, 110, 160, 210, 260].map((x) => (
        <line key={x} x1={x} y1="52" x2={x} y2="148" stroke={ACCENT} strokeWidth="2" />
      ))}
      {/* stirrups */}
      {[80, 130, 180, 230].map((x) => (
        <rect key={x} x={x} y="58" width="20" height="84" rx="3" fill="none" stroke={INK} strokeWidth="1" opacity="0.6" />
      ))}
      {/* measurement */}
      <path d="M30 176 H270" stroke={INK} strokeWidth="1" strokeDasharray="4 4" />
      <path d="M30 170 V182 M270 170 V182" stroke={INK} strokeWidth="1" />
      <text x="150" y="194" textAnchor="middle" fill={GOLD} fontFamily="IBM Plex Mono, monospace" fontSize="10">300 mm · Ø16 @ 150 c/c</text>
      {/* pulsing node */}
      <circle cx="160" cy="100" r="4" fill={ACCENT} opacity={on ? 1 : 0.3} style={{ transition: 'opacity 0.6s ease' }} />
      <circle cx="160" cy="100" r="4" fill="none" stroke={ACCENT} strokeWidth="1.5" className={on ? 'animate-pulse-ring' : ''} style={{ transformOrigin: '160px 100px' }} />
    </svg>
  );
}

/** Stacked blueprint sheets with a corner fold + drafter square. */
export function BlueprintStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 240" className={cn('h-full w-full', className)} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bpg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#13294d" />
          <stop offset="100%" stopColor="#0c1a3a" />
        </linearGradient>
      </defs>
      {/* back sheet */}
      <rect x="50" y="36" width="190" height="150" rx="6" fill="url(#bpg)" transform="rotate(-4 145 111)" />
      {/* front sheet */}
      <g transform="rotate(3 150 120)">
        <rect x="44" y="44" width="200" height="156" rx="6" fill="url(#bpg)" />
        <rect x="44" y="44" width="200" height="156" rx="6" fill="none" stroke="rgba(120,160,255,0.35)" strokeWidth="1" />
        {/* grid */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={`v${i}`} d={`M${64 + i * 34} 60 V184`} stroke="rgba(120,160,255,0.12)" strokeWidth="1" />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <path key={`h${i}`} d={`M60 ${84 + i * 30} H236`} stroke="rgba(120,160,255,0.12)" strokeWidth="1" />
        ))}
        {/* plan outline */}
        <rect x="84" y="84" width="120" height="80" fill="none" stroke="rgba(150,180,255,0.7)" strokeWidth="1.6" />
        <path d="M144 84 V164 M84 124 H204" stroke="rgba(150,180,255,0.5)" strokeWidth="1.2" />
        {/* title block */}
        <rect x="180" y="150" width="56" height="28" fill="rgba(31,87,224,0.25)" stroke="rgba(150,180,255,0.6)" strokeWidth="1" />
        <text x="208" y="169" textAnchor="middle" fill="#cfe0ff" fontFamily="IBM Plex Mono, monospace" fontSize="9">BR-001</text>
      </g>
      {/* drafter triangle */}
      <g transform="rotate(-12 250 200)" style={{ transformOrigin: '250px 200px' }} className="animate-drift">
        <path d="M226 210 L274 210 L274 162 Z" fill="rgba(214,178,110,0.9)" stroke="#b8915a" strokeWidth="1" />
      </g>
    </svg>
  );
}
