import type { ScoredLocation } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";
import { cn } from "@/lib/utils";
import { GitCompare, MapPin } from "lucide-react";

interface TopLocationsListProps {
  locations: ScoredLocation[];
  selectedId: string | null;
  comparedIds: string[];
  onSelect: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onOpenCompare: () => void;
}

export function TopLocationsList({
  locations,
  selectedId,
  comparedIds,
  onSelect,
  onToggleCompare,
  onOpenCompare,
}: TopLocationsListProps) {
  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-l border-border bg-surface/80 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Top lokacije
          </div>
          <div className="font-display text-base font-semibold">
            {locations.length} priporočil
          </div>
        </div>
        <button
          onClick={onOpenCompare}
          disabled={comparedIds.length !== 2}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
            comparedIds.length === 2
              ? "border-primary/60 bg-primary text-primary-foreground hover:brightness-110"
              : "border-border bg-surface-elevated text-muted-foreground"
          )}
          title={
            comparedIds.length === 2
              ? "Odpri primerjavo"
              : "Izberi 2 lokaciji za primerjavo"
          }
        >
          <GitCompare className="size-3.5" />
          Primerjaj ({comparedIds.length}/2)
        </button>
      </div>

      <ol className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {locations.length === 0 && (
          <li className="rounded-md border border-border bg-surface-elevated px-4 py-8 text-center text-sm text-muted-foreground">
            Ni kandidatov za izbrane filtre.
          </li>
        )}
        {locations.map((loc, idx) => {
          const selected = loc.id === selectedId;
          const compared = comparedIds.includes(loc.id);
          const canAddCompare =
            comparedIds.length < 2 || compared || comparedIds.length === 2;
          return (
            <li
              key={loc.id}
              className={cn(
                "group rounded-lg border bg-surface-elevated p-3 transition-all cursor-pointer",
                selected
                  ? "border-primary/60 shadow-[var(--shadow-glow)]"
                  : "border-border hover:border-border/70"
              )}
              onClick={() => onSelect(loc.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    #{idx + 1}
                  </span>
                  <ScoreBadge score={loc.reuse_score} size="md" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold leading-tight">
                      {loc.name}
                    </h3>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="size-3" />
                    <span>{loc.district}</span>
                    <span className="opacity-50">·</span>
                    <span className="font-mono tabular-nums">
                      {(loc.metrics.area_m2 / 1000).toFixed(1)}k m²
                    </span>
                  </div>
                  {loc.excluded ? (
                    <div className="mt-2 rounded border border-destructive/40 bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
                      Izločeno: {loc.exclusion_reason}
                    </div>
                  ) : (
                    <p className="mt-1.5 line-clamp-2 text-[11px] text-muted-foreground">
                      {loc.positive_reasons[0]}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-1 font-mono text-[10px] text-muted-foreground">
                      <span className="rounded bg-surface px-1.5 py-0.5">
                        🚉 {loc.metrics.distance_to_transport_m}m
                      </span>
                      <span className="rounded bg-surface px-1.5 py-0.5">
                        ⚙ {loc.metrics.distance_to_gji_m}m
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompare(loc.id);
                      }}
                      disabled={!canAddCompare && !compared}
                      className={cn(
                        "rounded border px-2 py-0.5 text-[10px] font-medium transition-colors",
                        compared
                          ? "border-accent bg-accent/20 text-accent"
                          : "border-border bg-surface text-muted-foreground hover:border-accent/50 hover:text-accent disabled:opacity-30"
                      )}
                    >
                      {compared ? "✓ V primerjavi" : "+ Primerjaj"}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
