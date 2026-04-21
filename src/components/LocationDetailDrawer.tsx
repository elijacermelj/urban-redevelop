import type { ScoredLocation } from "@/lib/types";
import { ScoreBadge, ConfidenceBadge } from "./ScoreBadge";
import { X, MapPin, Train, Wrench, Droplets, Building, Recycle } from "lucide-react";
import { scoreColor } from "@/lib/scoring";

const CRITERIA_LABELS = {
  settlement: "Umestitev v naselje",
  infrastructure: "Bližina infrastrukture",
  public_transport: "Javni prevoz",
  land_use: "Skladnost z rabo",
  reuse_potential: "Potencial ponovne rabe",
  risk_penalty: "Tveganja (penalizacija)",
} as const;

interface DetailDrawerProps {
  location: ScoredLocation | null;
  onClose: () => void;
}

export function LocationDetailDrawer({ location, onClose }: DetailDrawerProps) {
  if (!location) return null;
  const m = location.metrics;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[480px] overflow-y-auto border-l border-border bg-surface shadow-[var(--shadow-elevated)] animate-in slide-in-from-right">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-surface/95 px-6 py-4 backdrop-blur">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {location.district} · Ljubljana
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold leading-tight">
              {location.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md border border-border bg-surface-elevated text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {location.excluded && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="font-semibold text-destructive">Lokacija izločena</div>
              <p className="mt-1 text-sm text-destructive/90">{location.exclusion_reason}</p>
            </div>
          )}

          {/* Score header */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: scoreColor(location.reuse_score),
                background: `linear-gradient(135deg, ${scoreColor(location.reuse_score)}22, transparent)`,
              }}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Reuse Score
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold tabular-nums">
                  {Math.round(location.reuse_score * 100)}
                </span>
                <span className="font-mono text-sm text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-elevated p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Confidence
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold tabular-nums">
                  {Math.round(location.confidence_score * 100)}
                </span>
                <span className="font-mono text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border bg-surface-elevated p-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Povzetek
            </div>
            <p className="text-sm leading-relaxed">{location.summary}</p>
          </div>

          {/* Metrics */}
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Ključne metrike
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Metric icon={MapPin} label="V naselju" value={m.within_settlement ? "Da" : m.edge_of_settlement ? "Rob" : "Ne"} />
              <Metric icon={Train} label="Javni prevoz" value={`${m.distance_to_transport_m} m`} />
              <Metric icon={Wrench} label="GJI razdalja" value={`${m.distance_to_gji_m} m`} />
              <Metric icon={Droplets} label="Poplave" value={floodLabel(m.flood_risk_class)} />
              <Metric icon={Building} label="Raba" value={landUseLabel(m.land_use_category)} />
              <Metric icon={Recycle} label="Reuse tip" value={reuseLabel(m.reuse_potential)} />
            </div>
          </div>

          {/* Score breakdown */}
          <div>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Razčlenitev ocene
            </div>
            <div className="space-y-2">
              {(Object.keys(CRITERIA_LABELS) as Array<keyof typeof CRITERIA_LABELS>).map(
                (k) => {
                  const v = location.breakdown[k];
                  const isPenalty = k === "risk_penalty";
                  return (
                    <div key={k} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{CRITERIA_LABELS[k]}</span>
                        <span className="font-mono tabular-nums">
                          {isPenalty ? "−" : ""}
                          {Math.round(v * 100)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${v * 100}%`,
                            backgroundColor: isPenalty
                              ? "var(--destructive)"
                              : scoreColor(v),
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Positive reasons */}
          {location.positive_reasons.length > 0 && (
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-success">
                Zakaj priporočamo
              </div>
              <ul className="space-y-1.5">
                {location.positive_reasons.map((r, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-md border border-success/20 bg-success/5 px-3 py-2 text-sm"
                  >
                    <span className="mt-0.5 text-success">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {location.warnings.length > 0 && (
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-warning">
                Opozorila
              </div>
              <ul className="space-y-1.5">
                {location.warnings.map((w, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-md border border-warning/20 bg-warning/5 px-3 py-2 text-sm"
                  >
                    <span className="mt-0.5 text-warning">⚠</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <ConfidenceBadge score={location.confidence_score} />
            <ScoreBadge score={location.reuse_score} size="lg" showLabel />
          </div>
        </div>
      </aside>
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-elevated p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="mt-1 font-mono text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function floodLabel(c: string) {
  return { none: "Brez", low: "Nizko", medium: "Zmerno", high: "Visoko" }[c] ?? c;
}
function landUseLabel(c: string) {
  return (
    {
      residential: "Stanovanjska",
      mixed: "Mešana",
      central: "Centralna",
      business: "Poslovna",
      industrial: "Industrijska",
      public: "Javna",
      green: "Zelena",
    }[c] ?? c
  );
}
function reuseLabel(c: string) {
  return (
    {
      brownfield: "Brownfield",
      obsolete_building: "Zastarela stavba",
      underused_urban: "Podizkoriščeno",
      vacant_lot: "Prazno zemljišče",
      infill: "Infill",
    }[c] ?? c
  );
}
