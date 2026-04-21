import { PROGRAM_LIST } from "@/lib/programs";
import { DISTRICTS } from "@/lib/mockData";
import type { FilterState } from "@/lib/useScoredLocations";
import { Building2, Briefcase, Landmark, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const PROGRAM_ICONS = {
  housing: Building2,
  public_services: Landmark,
  small_business: Briefcase,
  infrastructure: Wrench,
} as const;

interface SidebarFiltersProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  totalCount: number;
  excludedCount: number;
}

export function SidebarFilters({
  filters,
  onChange,
  totalCount,
  excludedCount,
}: SidebarFiltersProps) {
  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-border bg-surface/80 backdrop-blur-md">
      <div className="border-b border-border px-5 py-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Pilotna občina
        </div>
        <div className="mt-1 font-display text-lg font-semibold">Ljubljana</div>
        <div className="mt-3 flex items-center gap-2 font-mono text-xs">
          <span className="rounded border border-border bg-surface-elevated px-2 py-0.5 tabular-nums">
            {totalCount} kandidatov
          </span>
          {excludedCount > 0 && (
            <span className="rounded border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-destructive tabular-nums">
              {excludedCount} izločenih
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        <Section title="Tip programa">
          <div className="grid grid-cols-2 gap-2">
            {PROGRAM_LIST.map((p) => {
              const Icon = PROGRAM_ICONS[p.id];
              const active = filters.program === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onChange({ ...filters, program: p.id })}
                  className={cn(
                    "group flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all",
                    active
                      ? "border-primary/60 bg-primary/10 shadow-[var(--shadow-glow)]"
                      : "border-border bg-surface-elevated hover:border-border/80 hover:bg-surface-elevated/80"
                  )}
                >
                  <Icon
                    className={cn("size-4", active ? "text-primary" : "text-muted-foreground")}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium leading-tight",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Območje">
          <select
            value={filters.district}
            onChange={(e) => onChange({ ...filters, district: e.target.value })}
            className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-primary"
          >
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Section>

        <Section title="Trdi filtri">
          <Toggle
            label="Izključi visoko poplavno tveganje"
            checked={filters.excludeFlood}
            onChange={(v) => onChange({ ...filters, excludeFlood: v })}
          />
        </Section>

        <Section title="Sloji na zemljevidu">
          <div className="space-y-1.5">
            <Toggle
              label="Naselja"
              dotColor="oklch(0.78 0.06 220)"
              checked={filters.layers.settlements}
              onChange={(v) =>
                onChange({ ...filters, layers: { ...filters.layers, settlements: v } })
              }
            />
            <Toggle
              label="Javni prevoz"
              dotColor="oklch(0.85 0.14 80)"
              checked={filters.layers.transport}
              onChange={(v) =>
                onChange({ ...filters, layers: { ...filters.layers, transport: v } })
              }
            />
            <Toggle
              label="Poplavna območja"
              dotColor="oklch(0.65 0.22 25)"
              checked={filters.layers.flood}
              onChange={(v) => onChange({ ...filters, layers: { ...filters.layers, flood: v } })}
            />
            <Toggle
              label="Brownfield / razvrednoteno"
              dotColor="oklch(0.78 0.16 165)"
              checked={filters.layers.brownfield}
              onChange={(v) =>
                onChange({ ...filters, layers: { ...filters.layers, brownfield: v } })
              }
            />
            <Toggle
              label="GJI"
              dotColor="oklch(0.7 0.05 240)"
              checked={filters.layers.gji}
              onChange={(v) => onChange({ ...filters, layers: { ...filters.layers, gji: v } })}
            />
          </div>
        </Section>

        <Section title="Legenda ocene">
          <div className="space-y-2">
            <div className="score-bar h-2 w-full rounded-full" />
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Reuse Score je tehtana ocena primernosti za ponovno rabo že urbaniziranega prostora.
            </p>
          </div>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  dotColor,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  dotColor?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between rounded-md border border-border bg-surface-elevated px-3 py-2 text-left text-xs font-medium transition-colors hover:border-border/80",
        checked ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span className="flex items-center gap-2">
        {dotColor && (
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: dotColor, opacity: checked ? 1 : 0.3 }}
          />
        )}
        {label}
      </span>
      <span
        className={cn(
          "relative inline-flex h-4 w-7 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute size-3 rounded-full bg-background transition-transform",
            checked ? "translate-x-3.5" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}
