import type { ScoredLocation } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";
import { scoreColor } from "@/lib/scoring";
import { X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonPanelProps {
  locations: ScoredLocation[];
  onClose: () => void;
}

const ROWS: Array<{
  key: string;
  label: string;
  get: (l: ScoredLocation) => string | number;
  better: "high" | "low" | "neutral";
  numeric?: boolean;
}> = [
  {
    key: "score",
    label: "Reuse Score",
    get: (l) => Math.round(l.reuse_score * 100),
    better: "high",
    numeric: true,
  },
  {
    key: "conf",
    label: "Confidence",
    get: (l) => `${Math.round(l.confidence_score * 100)}%`,
    better: "high",
  },
  {
    key: "set",
    label: "Umestitev",
    get: (l) =>
      l.metrics.within_settlement
        ? "V naselju"
        : l.metrics.edge_of_settlement
          ? "Rob naselja"
          : "Izven",
    better: "neutral",
  },
  {
    key: "tr",
    label: "Javni prevoz",
    get: (l) => `${l.metrics.distance_to_transport_m} m`,
    better: "low",
    numeric: true,
  },
  {
    key: "gji",
    label: "GJI",
    get: (l) => `${l.metrics.distance_to_gji_m} m`,
    better: "low",
    numeric: true,
  },
  {
    key: "flood",
    label: "Poplavno tveganje",
    get: (l) => floodLabel(l.metrics.flood_risk_class),
    better: "neutral",
  },
  {
    key: "lu",
    label: "Skladnost rabe",
    get: (l) => Math.round(l.breakdown.land_use * 100),
    better: "high",
    numeric: true,
  },
  {
    key: "reuse",
    label: "Reuse potencial",
    get: (l) => Math.round(l.breakdown.reuse_potential * 100),
    better: "high",
    numeric: true,
  },
  {
    key: "area",
    label: "Površina",
    get: (l) => `${(l.metrics.area_m2 / 1000).toFixed(1)}k m²`,
    better: "neutral",
  },
];

export function ComparisonPanel({ locations, onClose }: ComparisonPanelProps) {
  if (locations.length < 2 || locations.length > 3) return null;

  const bestScore = Math.max(...locations.map((location) => location.reuse_score));
  const winnerIds = new Set(
    locations
      .filter((location) => location.reuse_score === bestScore)
      .map((location) => location.id),
  );
  const hasSingleWinner = winnerIds.size === 1;
  const recommendationWinner =
    locations.find((location) => winnerIds.has(location.id)) ?? locations[0];
  const tableMinWidth = locations.length === 3 ? "960px" : "760px";
  const tableColumns = `minmax(220px, 1.5fr) repeat(${locations.length}, minmax(0, 1fr))`;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-background/70 backdrop-blur-[1px] animate-in fade-in"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-3 sm:p-6">
        <div className="pointer-events-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-elevated)] animate-in zoom-in-95 sm:max-h-[calc(100dvh-3rem)]">
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-elevated px-4 py-3 sm:px-6 sm:py-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Primerjava lokacij
              </div>
              <div className="font-display text-base font-semibold sm:text-lg">
                Primerjalna analiza
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid size-8 cursor-pointer place-items-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="hidden overflow-x-auto md:block">
              <div
                className="grid gap-0"
                style={{ minWidth: tableMinWidth, gridTemplateColumns: tableColumns }}
              >
                {/* Header row */}
                <div className="border-b border-border px-6 py-4" />
                {locations.map((location) => {
                  const isWinner = hasSingleWinner && winnerIds.has(location.id);
                  return (
                    <div
                      key={location.id}
                      className={cn(
                        "border-b border-border px-5 py-4 text-center",
                        isWinner && "bg-primary/5",
                      )}
                    >
                      <h3 className="font-display text-sm font-semibold leading-tight">
                        {location.name}
                      </h3>
                      <div className="text-[11px] text-muted-foreground">{location.district}</div>
                      <div className="mt-2 flex justify-center">
                        <ScoreBadge score={location.reuse_score} size="lg" />
                      </div>
                      {isWinner && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                          <Trophy className="size-3" /> Priporočeno
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Rows */}
                {ROWS.map((row) => {
                  const values = locations.map((location) => row.get(location));
                  const winnerIndices = computeWinnerIndices(row, values);

                  return (
                    <div key={row.key} className="contents">
                      <div className="border-b border-border px-6 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {row.label}
                      </div>
                      {values.map((value, index) => (
                        <Cell
                          key={`${row.key}-${locations[index]?.id ?? index}`}
                          value={value}
                          highlight={winnerIndices.has(index)}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <MobileComparison
              locations={locations}
              winnerIds={winnerIds}
              hasSingleWinner={hasSingleWinner}
            />

            {/* Recommendation */}
            <div className="border-t border-border bg-gradient-to-br from-primary/10 to-transparent px-4 py-4 sm:px-6 sm:py-5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
                Priporočilo
              </div>
              {hasSingleWinner ? (
                <p className="mt-1.5 text-sm leading-relaxed sm:text-base">
                  <strong className="font-semibold">{recommendationWinner.name}</strong> je bolj
                  smiselna izbira z oceno{" "}
                  <span className="font-mono">
                    {Math.round(recommendationWinner.reuse_score * 100)}/100
                  </span>
                  . {recommendationWinner.summary}
                </p>
              ) : (
                <p className="mt-1.5 text-sm leading-relaxed sm:text-base">
                  Najvišjo oceno delijo več lokacij (
                  <span className="font-mono">{Math.round(bestScore * 100)}/100</span>). Za končno
                  odločitev primerjajte opozorila, strošek priključevanja in izvajalska tveganja.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileComparison({
  locations,
  winnerIds,
  hasSingleWinner,
}: {
  locations: ScoredLocation[];
  winnerIds: Set<string>;
  hasSingleWinner: boolean;
}) {
  return (
    <div className="space-y-3 px-3 py-3 md:hidden">
      <div className="space-y-2">
        {locations.map((location, index) => {
          const isWinner = hasSingleWinner && winnerIds.has(location.id);

          return (
            <div
              key={location.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border bg-surface-elevated p-3",
                isWinner && "border-primary/40 bg-primary/5",
              )}
            >
              <div className="grid size-7 shrink-0 place-items-center rounded-md bg-surface font-mono text-xs font-semibold text-muted-foreground">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold leading-tight">{location.name}</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {location.district}
                </div>
                {isWinner && (
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/18 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
                    <Trophy className="size-3" /> Priporočeno
                  </div>
                )}
              </div>
              <ScoreBadge score={location.reuse_score} size="sm" />
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {ROWS.map((row) => {
          const values = locations.map((location) => row.get(location));
          const winnerIndices = computeWinnerIndices(row, values);

          return (
            <MobileMetricRow
              key={row.key}
              row={row}
              values={values}
              locations={locations}
              winnerIndices={winnerIndices}
            />
          );
        })}
      </div>
    </div>
  );
}

function MobileMetricRow({
  row,
  values,
  locations,
  winnerIndices,
}: {
  row: (typeof ROWS)[number];
  values: Array<string | number>;
  locations: ScoredLocation[];
  winnerIndices: Set<number>;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface-elevated/70 p-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {row.label}
      </div>
      <div className="mt-2 space-y-1.5">
        {values.map((value, index) => {
          const highlight = winnerIndices.has(index);

          return (
            <div
              key={`${row.key}-${locations[index]?.id ?? index}`}
              className={cn(
                "flex items-center justify-between gap-3 rounded-md bg-surface px-2.5 py-2",
                highlight && "bg-success/10",
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded bg-surface-elevated font-mono text-[10px] text-muted-foreground">
                  {index + 1}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {locations[index]?.name}
                </span>
              </div>
              <span
                className={cn(
                  "shrink-0 font-mono text-sm font-semibold tabular-nums",
                  highlight && "text-success",
                )}
                style={highlight ? { color: scoreColor(0.8) } : undefined}
              >
                {value}
                {highlight && <span className="ml-1 text-[10px]">✓</span>}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function computeWinnerIndices(
  row: (typeof ROWS)[number],
  values: Array<string | number>,
): Set<number> {
  if (row.better === "neutral" || !row.numeric) {
    return new Set();
  }

  const numericValues = values.map((value) =>
    typeof value === "number" ? value : Number.parseFloat(String(value)),
  );
  if (numericValues.some((value) => Number.isNaN(value))) {
    return new Set();
  }

  const target = row.better === "high" ? Math.max(...numericValues) : Math.min(...numericValues);
  const winners = new Set<number>();
  numericValues.forEach((value, index) => {
    if (value === target) {
      winners.add(index);
    }
  });
  return winners;
}

function Cell({ value, highlight }: { value: string | number; highlight: boolean }) {
  return (
    <div
      className={cn(
        "border-b border-border px-5 py-3 text-center font-mono text-sm tabular-nums",
        highlight && "bg-success/10 font-semibold",
      )}
      style={highlight ? { color: scoreColor(0.8) } : undefined}
    >
      {value}
      {highlight && <span className="ml-1.5 text-[10px]">✓</span>}
    </div>
  );
}

function floodLabel(value: string) {
  return { none: "Brez", low: "Nizko", medium: "Zmerno", high: "Visoko" }[value] ?? value;
}
