import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { MobileFilterBar, SidebarFilters } from "@/components/SidebarFilters";
import { TopLocationsList } from "@/components/TopLocationsList";
import { LocationDetailDrawer } from "@/components/LocationDetailDrawer";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NOT_SELECTED_CITY_ID,
  useScoredLocations,
  type CityFilterId,
  type FilterState,
} from "@/lib/useScoredLocations";
import {
  DEFAULT_DISTRICT,
  DEFAULT_LAYER_STATE,
  LAYER_KEYS,
  type LayerKey,
} from "@/lib/filterConfig";
import {
  CITY_DISTRICTS,
  CITY_MAP_CONFIG,
  CITY_NAME_BY_ID,
  CITY_OPTIONS,
  RAW_CANDIDATES,
} from "@/lib/mockData";
import { MAP_BASE_STYLE_OPTIONS, type MapBaseStyleId } from "@/lib/mapBaseStyles";
import { scoreLocation } from "@/lib/scoring";
import type { ProgramType, ScoredLocation } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, GitCompare, Layers } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({
  validateSearch: (search): AppSearch => normalizeSearch(search),
  head: () => ({
    meta: [
      { title: "Aplikacija · ReuseFirst Slovenija" },
      {
        name: "description",
        content: "Interaktivni zemljevid brownfield in reuse-first lokacij za slovenske občine.",
      },
      { property: "og:title", content: "ReuseFirst aplikacija — več občin" },
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
const MapView = lazy(() => import("@/components/MapView").then((m) => ({ default: m.MapView })));

type AppSearch = {
  city?: CityFilterId;
  program?: ProgramType;
  district?: string;
  excludeFlood?: boolean;
  layers?: LayerKey[];
};

type ResolvedAppSearch = {
  city: CityFilterId;
  program: ProgramType;
  district: string;
  excludeFlood: boolean;
  layers: LayerKey[];
};

const CITY_FILTER_OPTIONS = [
  { id: NOT_SELECTED_CITY_ID, name: "Ni izbrano" },
  ...CITY_OPTIONS,
] as const satisfies readonly { id: CityFilterId; name: string }[];
const CITY_IDS = new Set<CityFilterId>(CITY_FILTER_OPTIONS.map((city) => city.id));
const PROGRAM_IDS = new Set<ProgramType>([
  "housing",
  "public_services",
  "small_business",
  "infrastructure",
]);
const LAYER_ID_SET = new Set<LayerKey>(LAYER_KEYS);
const ALL_CITIES_MAP_CONFIG = {
  ...CITY_MAP_CONFIG.ljubljana,
  name: "Vse občine",
  center: [46.1512, 14.9955] as [number, number],
  zoom: 8,
  settlementArea: [] as [number, number][],
  floodAreas: [] as [number, number][][],
  transportStops: [] as [number, number][],
};

const DEFAULT_FILTERS: FilterState = {
  city: NOT_SELECTED_CITY_ID,
  program: "housing",
  district: DEFAULT_DISTRICT,
  excludeFlood: true,
  layers: { ...DEFAULT_LAYER_STATE },
};
const MIN_COMPARE_LOCATIONS = 2;
const MAX_COMPARE_LOCATIONS = 3;
const SIDEBARS_COLLAPSED_STORAGE_KEY = "reusefirst:sidebars-collapsed";

function readSidebarsCollapsedState(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SIDEBARS_COLLAPSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function persistSidebarsCollapsedState(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIDEBARS_COLLAPSED_STORAGE_KEY, value ? "1" : "0");
  } catch {
    // Storage can be unavailable in some browser privacy modes/policies.
  }
}

function AppPage() {
  const isMobile = useIsMobile();
  const search = Route.useSearch();
  const { city, program, district, excludeFlood, layers } = search;
  const searchSnapshot = useMemo<ResolvedAppSearch>(
    () => normalizeSearch({ city, program, district, excludeFlood, layers }),
    [city, program, district, excludeFlood, layers],
  );
  const [filters, setFilters] = useState<FilterState>(() => filtersFromSearch(searchSnapshot));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [mapBaseStyle, setMapBaseStyle] = useState<MapBaseStyleId>("osm_standard");
  const [isSidebarsCollapsed, setIsSidebarsCollapsed] = useState<boolean>(
    readSidebarsCollapsedState,
  );
  const [mobileRecommendationsOpen, setMobileRecommendationsOpen] = useState(false);
  const previousComparedIdsRef = useRef<string[]>([]);

  useEffect(() => {
    setFilters(filtersFromSearch(searchSnapshot));
    setSelectedId(null);
    setComparedIds([]);
    setCompareOpen(false);
    setMobileRecommendationsOpen(false);
  }, [searchSnapshot]);

  useEffect(() => {
    persistSidebarsCollapsedState(isSidebarsCollapsed);
  }, [isSidebarsCollapsed]);

  useEffect(() => {
    if (!isMobile) {
      setMobileRecommendationsOpen(false);
    }
  }, [isMobile]);

  const allCitiesSelected = filters.city === NOT_SELECTED_CITY_ID;
  const cityName = allCitiesSelected ? "Ni izbrano" : CITY_NAME_BY_ID[filters.city];
  const cityConfig = allCitiesSelected ? ALL_CITIES_MAP_CONFIG : CITY_MAP_CONFIG[filters.city];

  const locations = useScoredLocations(filters);

  // Total / excluded counts (independent of district/program filter? we use program-aware list)
  const totalCount = locations.length;
  const excludedCount = useMemo(() => {
    return RAW_CANDIDATES.filter(
      (c) =>
        (allCitiesSelected || c.municipality === cityName) &&
        c.program_fit.includes(filters.program) &&
        (filters.district === "Vsa območja" || c.district === filters.district),
    )
      .map((c) => scoreLocation(c, filters.program))
      .filter((l) => l.excluded).length;
  }, [allCitiesSelected, cityName, filters.district, filters.program]);

  // Reset selection when filters change and selection no longer in list
  useEffect(() => {
    if (selectedId && !locations.find((l) => l.id === selectedId)) {
      setSelectedId(null);
    }
  }, [locations, selectedId]);

  useEffect(() => {
    const validIds = new Set(locations.map((location) => location.id));
    setComparedIds((prev) => {
      const next = prev.filter((id) => validIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [locations]);

  useEffect(() => {
    if (compareOpen && comparedIds.length < MIN_COMPARE_LOCATIONS) {
      setCompareOpen(false);
    }
  }, [compareOpen, comparedIds]);

  useEffect(() => {
    const previousComparedIds = previousComparedIdsRef.current;
    const addedId =
      comparedIds.length > previousComparedIds.length
        ? comparedIds.find((id) => !previousComparedIds.includes(id))
        : null;

    if (addedId) {
      const addedLocation = locations.find((location) => location.id === addedId);
      toast.success("Dodano v primerjavo", {
        description: addedLocation?.name,
        duration: 2200,
      });
    }

    previousComparedIdsRef.current = comparedIds;
  }, [comparedIds, locations]);

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedId) ?? null,
    [locations, selectedId],
  );

  const comparedLocations = useMemo(
    () =>
      comparedIds
        .map((id) => locations.find((l) => l.id === id))
        .filter(Boolean) as typeof locations,
    [comparedIds, locations],
  );

  const toggleCompare = (id: string) => {
    setComparedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE_LOCATIONS) return prev;
      return [...prev, id];
    });
  };

  const setCity = (city: CityFilterId) => {
    setFilters((prev) => ({ ...prev, city, district: "Vsa območja" }));
    setSelectedId(null);
    setComparedIds([]);
    setCompareOpen(false);
    setMobileRecommendationsOpen(false);
  };

  const handleSelectLocation = (id: string) => {
    setSelectedId(id);
    if (isMobile) {
      setMobileRecommendationsOpen(false);
    }
  };

  const handleOpenCompare = () => {
    setCompareOpen(true);
    if (isMobile) {
      setMobileRecommendationsOpen(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <SiteHeader />
      <div
        className={`flex flex-1 overflow-hidden ${isMobile ? "pb-[calc(4.5rem+env(safe-area-inset-bottom))]" : ""}`}
      >
        {!isMobile && (
          <SidebarFilters
            filters={filters}
            onChange={setFilters}
            onCityChange={setCity}
            isCollapsed={isSidebarsCollapsed}
            onToggleCollapsed={() => setIsSidebarsCollapsed((prev) => !prev)}
            cityOptions={CITY_FILTER_OPTIONS}
            districtOptions={allCitiesSelected ? [DEFAULT_DISTRICT] : CITY_DISTRICTS[filters.city]}
            cityName={cityName}
            totalCount={totalCount}
            excludedCount={excludedCount}
          />
        )}
        <main className={`relative flex-1 ${isMobile ? "" : "bg-surface/80 p-3"}`}>
          <div
            className={`relative h-full ${isMobile ? "" : "overflow-hidden rounded-xl shadow-[var(--shadow-panel)]"}`}
          >
            <Suspense
              fallback={
                <div className="absolute inset-0 grid place-items-center bg-surface text-muted-foreground">
                  Nalagam zemljevid…
                </div>
              }
            >
              <MapView
                locations={locations}
                cityConfig={cityConfig}
                selectedId={selectedId}
                comparedIds={comparedIds}
                onSelect={handleSelectLocation}
                baseStyle={mapBaseStyle}
                layers={filters.layers}
                fitToLocations={allCitiesSelected}
              />
            </Suspense>

            <MapStylePicker
              value={mapBaseStyle}
              onChange={setMapBaseStyle}
              isMobile={isMobile}
              comparedCount={comparedIds.length}
              minCompareCount={MIN_COMPARE_LOCATIONS}
              maxCompareCount={MAX_COMPARE_LOCATIONS}
              onOpenCompare={handleOpenCompare}
            />

            {/* Map overlay legend */}
            <MapLegend
              layers={filters.layers}
              selectedLocation={selectedLocation}
              isMobile={isMobile}
            />
          </div>
        </main>
        {!isMobile && !selectedLocation && !isSidebarsCollapsed && (
          <TopLocationsList
            locations={locations}
            selectedId={selectedId}
            comparedIds={comparedIds}
            minCompareCount={MIN_COMPARE_LOCATIONS}
            maxCompareCount={MAX_COMPARE_LOCATIONS}
            onSelect={handleSelectLocation}
            onToggleCompare={toggleCompare}
            onOpenCompare={handleOpenCompare}
          />
        )}
      </div>

      {isMobile && !selectedLocation && mobileRecommendationsOpen && (
        <TopLocationsList
          locations={locations}
          selectedId={selectedId}
          comparedIds={comparedIds}
          minCompareCount={MIN_COMPARE_LOCATIONS}
          maxCompareCount={MAX_COMPARE_LOCATIONS}
          onSelect={handleSelectLocation}
          onToggleCompare={toggleCompare}
          onOpenCompare={handleOpenCompare}
          mobileFullscreen
          onClose={() => setMobileRecommendationsOpen(false)}
        />
      )}

      {isMobile && !selectedLocation && !mobileRecommendationsOpen && (
        <MobileFilterBar
          filters={filters}
          onChange={setFilters}
          onCityChange={setCity}
          cityOptions={CITY_FILTER_OPTIONS}
          districtOptions={allCitiesSelected ? [DEFAULT_DISTRICT] : CITY_DISTRICTS[filters.city]}
          onOpenRecommendations={() => setMobileRecommendationsOpen(true)}
        />
      )}

      <LocationDetailDrawer
        location={selectedLocation}
        comparedIds={comparedIds}
        maxCompareCount={MAX_COMPARE_LOCATIONS}
        onToggleCompare={toggleCompare}
        onClose={() => setSelectedId(null)}
      />
      {compareOpen && comparedLocations.length >= MIN_COMPARE_LOCATIONS && (
        <ComparisonPanel locations={comparedLocations} onClose={() => setCompareOpen(false)} />
      )}
    </div>
  );
}

function normalizeSearch(rawSearch: unknown): ResolvedAppSearch {
  const search = (rawSearch ?? {}) as Record<string, unknown>;
  const city = parseCity(search.city);
  const program = parseProgram(search.program);
  const district = parseDistrict(search.district, city);
  const excludeFlood = parseBoolean(search.excludeFlood, DEFAULT_FILTERS.excludeFlood);
  const layers = parseLayers(search.layers);

  return {
    city,
    program,
    district,
    excludeFlood,
    layers,
  };
}

function filtersFromSearch(search: AppSearch): FilterState {
  const layerState = { ...DEFAULT_FILTERS.layers };
  for (const key of LAYER_KEYS) {
    layerState[key] = search.layers?.includes(key) ?? false;
  }

  return {
    city: search.city ?? DEFAULT_FILTERS.city,
    program: search.program ?? DEFAULT_FILTERS.program,
    district: search.district ?? DEFAULT_FILTERS.district,
    excludeFlood: search.excludeFlood ?? DEFAULT_FILTERS.excludeFlood,
    layers: layerState,
  };
}

function parseCity(value: unknown): CityFilterId {
  if (typeof value === "string" && CITY_IDS.has(value as CityFilterId)) {
    return value as CityFilterId;
  }
  return DEFAULT_FILTERS.city;
}

function parseProgram(value: unknown): ProgramType {
  if (typeof value === "string" && PROGRAM_IDS.has(value as ProgramType)) {
    return value as ProgramType;
  }
  return DEFAULT_FILTERS.program;
}

function parseDistrict(value: unknown, city: CityFilterId): string {
  if (city === NOT_SELECTED_CITY_ID) {
    return DEFAULT_DISTRICT;
  }

  const districts = CITY_DISTRICTS[city];
  if (typeof value === "string" && districts.includes(value)) {
    return value;
  }
  return DEFAULT_DISTRICT;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return fallback;
}

function parseLayers(value: unknown): LayerKey[] {
  const list: string[] = [];

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === "string") {
        list.push(...entry.split(","));
      }
    }
  } else if (typeof value === "string") {
    list.push(...value.split(","));
  }

  if (list.length === 0) {
    return LAYER_KEYS.filter((key) => DEFAULT_FILTERS.layers[key]);
  }

  const sanitized = list
    .map((entry) => entry.trim())
    .filter((entry): entry is LayerKey => LAYER_ID_SET.has(entry as LayerKey));

  if (sanitized.length === 0) {
    return LAYER_KEYS.filter((key) => DEFAULT_FILTERS.layers[key]);
  }

  return Array.from(new Set(sanitized));
}

function MapStylePicker({
  value,
  onChange,
  isMobile,
  comparedCount,
  minCompareCount,
  maxCompareCount,
  onOpenCompare,
}: {
  value: MapBaseStyleId;
  onChange: (value: MapBaseStyleId) => void;
  isMobile: boolean;
  comparedCount: number;
  minCompareCount: number;
  maxCompareCount: number;
  onOpenCompare: () => void;
}) {
  const canOpenCompare = comparedCount >= minCompareCount;

  return (
    <div
      className={`pointer-events-auto absolute right-4 z-30 flex items-center gap-2 ${isMobile ? "top-3" : "top-4"}`}
    >
      {isMobile && (
        <button
          type="button"
          onClick={onOpenCompare}
          disabled={!canOpenCompare}
          className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed ${
            canOpenCompare
              ? "border-primary/60 bg-primary text-primary-foreground hover:brightness-110"
              : "border-border bg-surface-elevated text-muted-foreground"
          }`}
          title={
            canOpenCompare
              ? "Odpri primerjavo"
              : `Izberi vsaj ${minCompareCount} lokaciji za primerjavo`
          }
          aria-label="Primerjaj lokacije"
        >
          <GitCompare className="size-3.5" />
          Primerjaj ({comparedCount}/{maxCompareCount})
        </button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            title="Slog zemljevida"
            aria-label="Slog zemljevida"
            className="h-9 w-9 border-border bg-surface text-foreground shadow-none hover:bg-surface-elevated"
          >
            <Layers className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[240px] border-border bg-surface-elevated p-1"
        >
          {MAP_BASE_STYLE_OPTIONS.map((style) => {
            const isActive = value === style.id;
            return (
              <DropdownMenuItem
                key={style.id}
                onSelect={() => onChange(style.id)}
                className={`relative flex w-full items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm text-foreground outline-none transition-colors focus:bg-primary/12 focus:text-foreground ${
                  isActive ? "font-bold" : ""
                }`}
              >
                <img
                  src={style.previewSrc}
                  alt=""
                  className="h-8 w-8 rounded-sm border border-border/70 object-cover"
                />
                <span>{style.label}</span>
                {isActive && <Check className="absolute right-2 size-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function MapLegend({
  layers,
  selectedLocation,
  isMobile,
}: {
  layers: FilterState["layers"];
  selectedLocation: ScoredLocation | null;
  isMobile: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute left-4 z-20 rounded-lg border border-border bg-surface-overlay px-4 py-2 text-xs backdrop-blur-md ${isMobile ? "bottom-3 w-[220px]" : "bottom-4 w-[240px]"}`}
    >
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Reuse Score
      </div>
      <div className="score-bar h-2 w-full rounded-full" />
      <div className="mt-1 flex w-full justify-between font-mono text-[10px] text-muted-foreground">
        <span>nizko</span>
        <span>visoko</span>
      </div>

      {selectedLocation && (layers.transport || layers.gji) && (
        <div className="mt-3 space-y-1 rounded border border-border/80 bg-surface/70 px-2 py-1.5 font-mono text-[10px] text-muted-foreground">
          {layers.transport && (
            <div className="flex items-center justify-between gap-2">
              <span>Javni prevoz</span>
              <span className="text-foreground">
                {selectedLocation.metrics.distance_to_transport_m} m
              </span>
            </div>
          )}
          {layers.gji && (
            <div className="flex items-center justify-between gap-2">
              <span>GJI</span>
              <span className="text-foreground">
                {selectedLocation.metrics.distance_to_gji_m} m
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
