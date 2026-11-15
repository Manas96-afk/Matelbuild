'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Pointer-tracked 3D tilt card. Children with class `tilt-layer` get lifted on Z;
 * add `--tz` to control depth. Glare follows the cursor. Respects reduced motion.
 */
export function Tilt({
  children,
  className,
  max = 10,
  scale = 1.02,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  glare?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [t, setT] = React.useState({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const [active, setActive] = React.useState(false);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setT({
      ry: (px - 0.5) * 2 * max,
      rx: -(py - 0.5) * 2 * max,
      gx: px * 100,
      gy: py * 100,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => {
        setActive(false);
        setT({ rx: 0, ry: 0, gx: 50, gy: 50 });
      }}
      className={cn('tilt relative', className)}
      style={{
        transform: active
          ? `perspective(1100px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${scale})`
          : 'perspective(1100px) rotateX(0) rotateY(0) scale(1)',
        ['--gx' as any]: `${t.gx}%`,
        ['--gy' as any]: `${t.gy}%`,
      }}
    >
      {children}
      {glare && <span className="tilt-glare" aria-hidden="true" />}
    </div>
  );
}
