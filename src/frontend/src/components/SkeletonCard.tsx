import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  rows?: number;
  showHeader?: boolean;
  className?: string;
}

export function SkeletonCard({
  rows = 3,
  showHeader = true,
  className,
}: SkeletonCardProps) {
  const rowKeys = Array.from({ length: rows }, (_, i) => `skeleton-row-${i}`);
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-5 shadow-card space-y-4",
        className,
      )}
    >
      {showHeader && (
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      )}
      <div className="space-y-2.5">
        {rowKeys.map((key, i) => (
          <Skeleton
            key={key}
            className="h-3 rounded"
            style={{ width: `${85 - i * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-5 shadow-card space-y-3",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  const headerKeys = Array.from({ length: cols }, (_, i) => `th-${i}`);
  const rowKeys = Array.from({ length: rows }, (_v, r) => `tr-${r}`);

  return (
    <div className="rounded-lg border bg-card shadow-card overflow-hidden">
      <div className="border-b bg-muted/40 px-5 py-3 flex gap-4">
        {headerKeys.map((key, i) => (
          <Skeleton
            key={key}
            className="h-3"
            style={{ width: `${20 + i * 5}%` }}
          />
        ))}
      </div>
      {rowKeys.map((rowKey) => {
        const cellKeys = Array.from(
          { length: cols },
          (_, c) => `${rowKey}-td-${c}`,
        );
        return (
          <div
            key={rowKey}
            className="px-5 py-3.5 border-b last:border-b-0 flex gap-4 items-center"
          >
            {cellKeys.map((cellKey, col) => (
              <Skeleton
                key={cellKey}
                className="h-3"
                style={{ width: `${15 + col * 6}%` }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
