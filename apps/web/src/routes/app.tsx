import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SidebarFilters } from "@/components/SidebarFilters";
import { TopLocationsList } from "@/components/TopLocationsList";
import { LocationDetailDrawer } from "@/components/LocationDetailDrawer";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { useScoredLocations, type FilterState } from "@/lib/useScoredLocations";
import { RAW_CANDIDATES } from "@/lib/mockData";
import { scoreLocation } from "@/lib/scoring";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Aplikacija · ReuseFirst Slovenija" },
      {
        name: "description",
        content:
          "Interaktivni zemljevid brownfield in reuse-first lokacij za pilotno občino Ljubljana.",
      },
      { property: "og:title", content: "ReuseFirst aplikacija — Ljubljana" },
      {
        property: "og:description",
        content: "Rangirane lokacije za ponovno rabo urbaniziranega prostora.",
      },
    ],
  }),
  component: AppPage,
  ssr: false, // Leaflet needs window
});

// Lazy-loaded so it only runs in the browser.
import { lazy, Suspense } from "react";
const MapView = lazy(() =>
  import("@/components/MapView").then((m) => ({ default: m.MapView }))
);

const DEFAULT_FILTERS: FilterState = {
  program: "housing",
  district: "Vsa območja",
  excludeFlood: true,
  layers: {
    settlements: true,
    transport: true,
    flood: true,
    brownfield: true,
    gji: false,
  },
};

function AppPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const locations = useScoredLocations(filters);

  // Total / excluded counts (independent of district/program filter? we use program-aware list)
  const totalCount = locations.length;
  const excludedCount = useMemo(() => {
    return RAW_CANDIDATES.filter((c) => c.program_fit.includes(filters.program))
      .map((c) => scoreLocation(c, filters.program))
      .filter((l) => l.excluded).length;
  }, [filters.program]);

  // Reset selection when filters change and selection no longer in list
  useEffect(() => {
    if (selectedId && !locations.find((l) => l.id === selectedId)) {
      setSelectedId(null);
    }
  }, [locations, selectedId]);

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedId) ?? null,
    [locations, selectedId]
  );

  const comparedLocations = useMemo(
    () => comparedIds.map((id) => locations.find((l) => l.id === id)).filter(Boolean) as typeof locations,
    [comparedIds, locations]
  );

  const toggleCompare = (id: string) => {
    setComparedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <SiteHeader />
      <div className="flex flex-1 overflow-hidden">
        <SidebarFilters
          filters={filters}
          onChange={setFilters}
          totalCount={totalCount}
          excludedCount={excludedCount}
        />
        <main className="relative flex-1">
          <Suspense
            fallback={
              <div className="absolute inset-0 grid place-items-center bg-surface text-muted-foreground">
                Nalagam zemljevid…
              </div>
            }
          >
            <MapView
              locations={locations}
              selectedId={selectedId}
              comparedIds={comparedIds}
              onSelect={setSelectedId}
              layers={filters.layers}
            />
          </Suspense>

          {/* Map overlay legend */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-20 rounded-lg border border-border bg-surface-overlay px-4 py-3 text-xs backdrop-blur-md">
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Reuse Score
            </div>
            <div className="score-bar h-2 w-40 rounded-full" />
            <div className="mt-1 flex w-40 justify-between font-mono text-[10px] text-muted-foreground">
              <span>nizko</span>
              <span>visoko</span>
            </div>
          </div>
        </main>
        {!selectedLocation && (
          <TopLocationsList
            locations={locations}
            selectedId={selectedId}
            comparedIds={comparedIds}
            onSelect={setSelectedId}
            onToggleCompare={toggleCompare}
            onOpenCompare={() => setCompareOpen(true)}
          />
        )}
      </div>

      <LocationDetailDrawer
        location={selectedLocation}
        onClose={() => setSelectedId(null)}
      />
      {compareOpen && comparedLocations.length === 2 && (
        <ComparisonPanel
          locations={comparedLocations}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  );
}
