import type { ScoredLocation } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";
import { scoreColor } from "@/lib/scoring";
import { X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonPanelProps {
  locations: ScoredLocation[];
  onClose: () => void;
}

const ROWS: Array<{ key: string; label: string; get: (l: ScoredLocation) => string | number; better: "high" | "low" | "neutral"; numeric?: boolean }> = [
  { key: "score", label: "Reuse Score", get: (l) => Math.round(l.reuse_score * 100), better: "high", numeric: true },
  { key: "conf", label: "Confidence", get: (l) => `${Math.round(l.confidence_score * 100)}%`, better: "high" },
  { key: "set", label: "Umestitev", get: (l) => (l.metrics.within_settlement ? "V naselju" : l.metrics.edge_of_settlement ? "Rob naselja" : "Izven"), better: "neutral" },
  { key: "tr", label: "Javni prevoz", get: (l) => `${l.metrics.distance_to_transport_m} m`, better: "low", numeric: true },
  { key: "gji", label: "GJI", get: (l) => `${l.metrics.distance_to_gji_m} m`, better: "low", numeric: true },
  { key: "flood", label: "Poplavno tveganje", get: (l) => l.metrics.flood_risk_class, better: "neutral" },
  { key: "lu", label: "Skladnost rabe", get: (l) => Math.round(l.breakdown.land_use * 100), better: "high", numeric: true },
  { key: "reuse", label: "Reuse potencial", get: (l) => Math.round(l.breakdown.reuse_potential * 100), better: "high", numeric: true },
  { key: "area", label: "Površina", get: (l) => `${(l.metrics.area_m2 / 1000).toFixed(1)}k m²`, better: "neutral" },
];

export function ComparisonPanel({ locations, onClose }: ComparisonPanelProps) {
  if (locations.length !== 2) return null;
  const [a, b] = locations;
  const winner = a.reuse_score >= b.reuse_score ? a : b;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-background/70 backdrop-blur-[1px] animate-in fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 grid place-items-center p-6 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-elevated)] animate-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-6 py-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Primerjava lokacij
              </div>
              <div className="font-display text-lg font-semibold">
                Side-by-side analiza
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid size-8 cursor-pointer place-items-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-0">
            {/* Header row */}
            <div className="border-b border-border px-6 py-4" />
            {[a, b].map((l) => {
              const isWinner = l.id === winner.id && a.reuse_score !== b.reuse_score;
              return (
                <div
                  key={l.id}
                  className={cn(
                    "border-b border-border px-5 py-4 text-center",
                    isWinner && "bg-primary/5"
                  )}
                >
                  {isWinner && (
                    <div className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                      <Trophy className="size-3" /> Priporočeno
                    </div>
                  )}
                  <h3 className="font-display text-sm font-semibold leading-tight">{l.name}</h3>
                  <div className="text-[11px] text-muted-foreground">{l.district}</div>
                  <div className="mt-2 flex justify-center">
                    <ScoreBadge score={l.reuse_score} size="lg" />
                  </div>
                </div>
              );
            })}

            {/* Rows */}
            {ROWS.map((row) => {
              const va = row.get(a);
              const vb = row.get(b);
              const winnerSide =
                row.better === "neutral" || va === vb
                  ? null
                  : row.numeric && typeof va === "number" && typeof vb === "number"
                    ? row.better === "high"
                      ? va > vb
                        ? "a"
                        : "b"
                      : va < vb
                        ? "a"
                        : "b"
                    : row.numeric
                      ? row.better === "high"
                        ? parseFloat(String(va)) > parseFloat(String(vb))
                          ? "a"
                          : "b"
                        : parseFloat(String(va)) < parseFloat(String(vb))
                          ? "a"
                          : "b"
                      : null;

              return (
                <div key={row.key} className="contents">
                  <div className="border-b border-border px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </div>
                  <Cell value={va} highlight={winnerSide === "a"} />
                  <Cell value={vb} highlight={winnerSide === "b"} />
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          <div className="border-t border-border bg-gradient-to-br from-primary/10 to-transparent px-6 py-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Priporočilo
            </div>
            <p className="mt-1.5 text-sm leading-relaxed">
              <strong className="font-semibold">{winner.name}</strong> je bolj smiselna izbira z
              oceno <span className="font-mono">{Math.round(winner.reuse_score * 100)}/100</span>.{" "}
              {winner.summary}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function Cell({ value, highlight }: { value: string | number; highlight: boolean }) {
  return (
    <div
      className={cn(
        "border-b border-border px-5 py-3 text-center font-mono text-sm tabular-nums",
        highlight && "bg-success/10 font-semibold"
      )}
      style={highlight ? { color: scoreColor(0.8) } : undefined}
    >
      {value}
      {highlight && <span className="ml-1.5 text-[10px]">✓</span>}
    </div>
  );
}
