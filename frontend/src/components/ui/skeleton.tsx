export function Skeleton({ className = '' }: { className?: string }) {
  return <div role="presentation" aria-hidden className={`skeleton ${className}`} />;
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[var(--line)]" aria-label="Loading" aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full !bg-transparent" />
      ))}
    </div>
  );
}

export function SkeletonPanel() {
  return (
    <div className="panel p-5" aria-label="Loading" aria-busy>
      <Skeleton className="mb-4 h-4 w-2/5" />
      <Skeleton className="mb-2 h-14 w-full" />
      <Skeleton className="mb-2 h-14 w-full" />
      <Skeleton className="h-14 w-3/4" />
    </div>
  );
}