import { cn } from '@/lib/utils';

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
          <defs>
            <linearGradient id="bgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#599dff" />
              <stop offset="100%" stopColor="#1f57e0" />
            </linearGradient>
          </defs>
          <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#bgrad)" />
          {/* stylised B / beam mark */}
          <path
            d="M9.5 22V10.5h4.6c2.6 0 4.2 1.4 4.2 3.7 0 1.7-1 3-2.7 3.4 1.9.3 3.2 1.6 3.2 3.6 0 2.5-1.9 4.3-4.8 4.3H9.5Zm2.4-1.9h2.2c1.4 0 2.3-.7 2.3-1.9s-.8-1.9-2.3-1.9h-2.2v3.8Zm0-5.7h2c1.3 0 2.1-.6 2.1-1.7s-.8-1.7-2.1-1.7h-2v3.4Z"
            fill="#ffffff"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display text-xl font-semibold tracking-tight text-[var(--ink)]">
          MatelBuild
        </span>
      )}
    </span>
  );
}
