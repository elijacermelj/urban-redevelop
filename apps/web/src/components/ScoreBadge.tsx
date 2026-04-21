import { scoreColor, scoreLabel } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({ score, size = "md", showLabel = false, className }: ScoreBadgeProps) {
  const pct = Math.round(score * 100);
  const sizeClasses = {
    sm: "h-7 min-w-[2.75rem] text-xs",
    md: "h-9 min-w-[3.25rem] text-sm",
    lg: "h-12 min-w-[4rem] text-lg",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-md font-mono font-semibold tabular-nums px-2 text-background",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: scoreColor(score) }}
      title={scoreLabel(score)}
    >
      {pct}
      {showLabel && <span className="ml-1.5 text-[0.7em] font-medium opacity-80">/100</span>}
    </div>
  );
}

export function ConfidenceBadge({ score, className }: { score: number; className?: string }) {
  const pct = Math.round(score * 100);
  const tone =
    score >= 0.85
      ? "border-success/50 text-success"
      : score >= 0.7
        ? "border-warning/50 text-warning"
        : "border-destructive/50 text-destructive";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border bg-surface/60 px-2 py-1 text-xs font-medium",
        tone,
        className
      )}
      title="Zanesljivost ocene glede na razpoložljivost podatkov"
    >
      <span className="size-1.5 rounded-full bg-current" />
      Zaupanje · {pct}%
    </div>
  );
}

export function WarningBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
      ⚠ {count} {count === 1 ? "opozorilo" : "opozoril"}
    </div>
  );
}
