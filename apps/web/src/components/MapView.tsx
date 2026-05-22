import { useEffect, useRef } from "react";
import L from "leaflet";
import type { CityMapConfig } from "@/lib/mockData";
import { scoreColor } from "@/lib/scoring";
import type { ScoredLocation } from "@/lib/types";
import { MAP_BASE_STYLES, type MapBaseStyleId } from "@/lib/mapBaseStyles";

interface MapViewProps {
  locations: ScoredLocation[];
  cityConfig: CityMapConfig;
  selectedId: string | null;
  comparedIds: string[];
  onSelect: (id: string) => void;
  fitToLocations?: boolean;
  baseStyle?: MapBaseStyleId;
  layers: {
    flood: boolean;
    transport: boolean;
    brownfield: boolean;
    settlements: boolean;
    gji: boolean;
    opportunity_heat: boolean;
  };
}

export function MapView({
  locations,
  cityConfig,
  selectedId,
  comparedIds,
  onSelect,
  fitToLocations = false,
  baseStyle = "osm_standard",
  layers,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const locationGroupRef = useRef<L.LayerGroup | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);
  const heatGroupRef = useRef<L.LayerGroup | null>(null);
  const guideGroupRef = useRef<L.LayerGroup | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: cityConfig.center,
      zoom: cityConfig.zoom,
      zoomControl: true,
      attributionControl: true,
    });

    baseLayerRef.current = createTileLayer(baseStyle).addTo(map);

    map.createPane("heatPane");
    if (map.getPane("heatPane")) map.getPane("heatPane")!.style.zIndex = "330";
    map.createPane("guidePane");
    if (map.getPane("guidePane")) map.getPane("guidePane")!.style.zIndex = "460";

    heatGroupRef.current = L.layerGroup().addTo(map);
    overlayGroupRef.current = L.layerGroup().addTo(map);
    locationGroupRef.current = L.layerGroup().addTo(map);
    guideGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [cityConfig.center, cityConfig.zoom]);

  // Keep Leaflet in sync with layout size changes (sidebar collapse/expand, panel toggles).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    const invalidateMapSize = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(() => {
        mapRef.current?.invalidateSize();
        rafId = null;
      });
    };

    invalidateMapSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", invalidateMapSize);
      return () => {
        window.removeEventListener("resize", invalidateMapSize);
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
        }
      };
    }

    const resizeObserver = new ResizeObserver(() => invalidateMapSize());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Recenter map when municipality changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(cityConfig.center, cityConfig.zoom, { animate: true });
  }, [cityConfig]);

  // Switch basemap style.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
    }
    baseLayerRef.current = createTileLayer(baseStyle).addTo(map);
  }, [baseStyle]);

  // Fit to all visible locations in all-cities mode.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fitToLocations || selectedId || locations.length === 0) return;

    const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng] as [number, number]));
    map.fitBounds(bounds.pad(0.15), { animate: true, maxZoom: 10 });
  }, [fitToLocations, locations, selectedId]);

  // Redraw opportunity heatmap
  useEffect(() => {
    const group = heatGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (!layers.opportunity_heat) return;

    locations.forEach((loc) => {
      const reliability = 0.6 + loc.confidence_score * 0.4;
      const intensity = (loc.excluded ? loc.reuse_score * 0.2 : loc.reuse_score) * reliability;
      if (intensity < 0.12) return;

      const areaRadius = Math.sqrt(loc.metrics.area_m2) * 1.35;
      const radiusM = Math.max(120, Math.min(420, areaRadius + intensity * 190));
      const fill = loc.excluded ? "oklch(0.7 0.16 50)" : scoreColor(loc.reuse_score);

      L.circle([loc.lat, loc.lng], {
        pane: "heatPane",
        radius: radiusM,
        stroke: false,
        fillColor: fill,
        fillOpacity: 0.12 + intensity * 0.16,
        interactive: false,
      }).addTo(group);
    });
  }, [layers.opportunity_heat, locations]);

  // Redraw overlays
  useEffect(() => {
    const group = overlayGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (layers.settlements) {
      L.polygon(cityConfig.settlementArea, {
        color: "#7dd3fc",
        weight: 1,
        dashArray: "4 4",
        fillOpacity: 0.04,
        fillColor: "#7dd3fc",
        interactive: false,
      }).addTo(group);
    }
    if (layers.flood) {
      cityConfig.floodAreas.forEach((floodArea) => {
        L.polygon(floodArea, {
          color: "#fb7185",
          weight: 1,
          fillOpacity: 0.18,
          fillColor: "#fb7185",
          interactive: false,
        }).addTo(group);
      });
    }
    if (layers.transport) {
      cityConfig.transportStops.forEach((s) => {
        L.circleMarker(s, {
          pane: "overlayPane",
          radius: 4,
          color: "oklch(0.78 0.13 90)",
          fillColor: "oklch(0.82 0.12 88)",
          fillOpacity: 0.9,
          weight: 1,
          interactive: false,
        }).addTo(group);
      });
    }
  }, [cityConfig, layers.flood, layers.settlements, layers.transport]);

  // Redraw locations
  useEffect(() => {
    const group = locationGroupRef.current;
    const map = mapRef.current;
    if (!group || !map) return;
    group.clearLayers();

    locations.forEach((loc) => {
      const isSelected = loc.id === selectedId;
      const isCompared = comparedIds.includes(loc.id);
      const color = loc.excluded ? "oklch(0.64 0.22 25)" : scoreColor(loc.reuse_score);
      const typeTag = layers.brownfield ? reuseTypeTag(loc.metrics.reuse_potential) : null;
      const showFloodChip =
        layers.flood &&
        (loc.metrics.flood_risk_class === "medium" || loc.metrics.flood_risk_class === "high");

      // Polygon
      const latlngs = loc.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
      L.polygon(latlngs, {
        color,
        weight: isSelected ? 3 : isCompared ? 2.5 : 1.5,
        fillOpacity: loc.excluded ? 0.14 : layers.opportunity_heat ? 0.28 : 0.38,
        fillColor: color,
        dashArray: layers.brownfield
          ? loc.excluded
            ? "4 3"
            : reuseTypeDash(loc.metrics.reuse_potential)
          : loc.excluded
            ? "4 3"
            : undefined,
      })
        .addTo(group)
        .on("click", () => onSelect(loc.id));

      // Center marker with score
      const chipMarkup = [
        typeTag &&
          `<span style="
            border:1px solid rgba(10,15,20,0.45);
            background:rgba(255,255,255,0.35);
            color:#04200f;
            border-radius:4px;
            padding:1px 4px;
            font-size:9px;
            font-weight:600;
            letter-spacing:0.01em;
          ">${typeTag}</span>`,
        showFloodChip &&
          `<span style="
            border:1px solid rgba(10,15,20,0.45);
            background:rgba(255,255,255,0.35);
            color:#04200f;
            border-radius:4px;
            padding:1px 4px;
            font-size:9px;
            font-weight:600;
            letter-spacing:0.01em;
          ">${floodTag(loc.metrics.flood_risk_class)}</span>`,
      ]
        .filter(Boolean)
        .join("");

      const markerWidth = 36 + (typeTag ? 24 : 0) + (showFloodChip ? 22 : 0);
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          display:flex;
          align-items:center;
          gap:4px;
          background:${color};
          color:${loc.excluded ? "#f8fafc" : "#092214"};
          font-family:'JetBrains Mono',monospace;
          font-weight:600;
          font-size:11px;
          padding:3px 6px;
          border-radius:6px;
          border:${isSelected ? "2px solid #fff" : isCompared ? "2px solid #38bdf8" : "1px solid rgba(0,0,0,0.4)"};
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          white-space:nowrap;
        "><span>${Math.round(loc.reuse_score * 100)}</span>${chipMarkup}</div>`,
        iconSize: [markerWidth, 20],
        iconAnchor: [Math.round(markerWidth / 2), 10],
      });
      L.marker([loc.lat, loc.lng], { icon })
        .addTo(group)
        .on("click", () => onSelect(loc.id));
    });
  }, [
    layers.brownfield,
    layers.flood,
    layers.opportunity_heat,
    locations,
    selectedId,
    comparedIds,
    onSelect,
  ]);

  // Redraw selected-location distance guides
  useEffect(() => {
    const group = guideGroupRef.current;
    if (!group) return;
    group.clearLayers();

    const selected = selectedId ? locations.find((loc) => loc.id === selectedId) : null;
    if (!selected) return;

    const center: [number, number] = [selected.lat, selected.lng];
    if (layers.transport) {
      drawDistanceGuide(group, center, {
        label: "Javni prevoz",
        distanceM: selected.metrics.distance_to_transport_m,
        thresholdsM: [150, 300, 500],
        positiveM: 250,
        acceptableM: 500,
        baseColor: "oklch(0.76 0.12 90)",
        labelOffsetLat: 0.0015,
      });
    }
    if (layers.gji) {
      drawDistanceGuide(group, center, {
        label: "GJI",
        distanceM: selected.metrics.distance_to_gji_m,
        thresholdsM: [50, 100, 250],
        positiveM: 120,
        acceptableM: 250,
        baseColor: "oklch(0.62 0.12 245)",
        labelOffsetLat: layers.transport ? -0.0015 : 0.0015,
      });
    }
  }, [layers.gji, layers.transport, locations, selectedId]);

  // Pan to selected
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const loc = locations.find((l) => l.id === selectedId);
    if (loc) mapRef.current.setView([loc.lat, loc.lng], 15, { animate: true });
  }, [selectedId, locations]);

  // Keep the map in a low stacking context so app overlays (drawers/modals) always render above Leaflet panes.
  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}

function createTileLayer(styleId: MapBaseStyleId): L.TileLayer {
  const style = MAP_BASE_STYLES[styleId] ?? MAP_BASE_STYLES.osm_standard;
  const options: L.TileLayerOptions = {
    attribution: style.attribution,
    maxZoom: style.maxZoom ?? 19,
  };

  if (style.subdomains) {
    options.subdomains = style.subdomains;
  }

  return L.tileLayer(style.tileUrl, options);
}

function reuseTypeTag(type: ScoredLocation["metrics"]["reuse_potential"]): string {
  return (
    {
      brownfield: "BF",
      underused_urban: "UU",
      vacant_lot: "VL",
      obsolete_building: "OB",
      infill: "IF",
    }[type] ?? "RF"
  );
}

function reuseTypeDash(type: ScoredLocation["metrics"]["reuse_potential"]): string | undefined {
  return (
    {
      brownfield: undefined,
      underused_urban: "2 3",
      vacant_lot: "8 4",
      obsolete_building: "5 3",
      infill: "1 4",
    }[type] ?? undefined
  );
}

function floodTag(risk: ScoredLocation["metrics"]["flood_risk_class"]): string {
  return risk === "high" ? "F-H" : "F-M";
}

function drawDistanceGuide(
  group: L.LayerGroup,
  center: [number, number],
  cfg: {
    label: string;
    distanceM: number;
    thresholdsM: number[];
    positiveM: number;
    acceptableM: number;
    baseColor: string;
    labelOffsetLat: number;
  },
) {
  cfg.thresholdsM.forEach((thresholdM) => {
    L.circle(center, {
      pane: "guidePane",
      radius: thresholdM,
      color: cfg.baseColor,
      weight: 1,
      opacity: 0.5,
      dashArray: "4 5",
      fill: false,
      interactive: false,
    }).addTo(group);
  });

  const distanceColor =
    cfg.distanceM <= cfg.positiveM
      ? "var(--score-high)"
      : cfg.distanceM <= cfg.acceptableM
        ? "var(--score-mid)"
        : "var(--score-low)";

  L.circle(center, {
    pane: "guidePane",
    radius: cfg.distanceM,
    color: distanceColor,
    weight: 2,
    opacity: 0.9,
    fillColor: distanceColor,
    fillOpacity: 0.07,
    interactive: false,
  }).addTo(group);

  const labelIcon = L.divIcon({
    className: "",
    html: `<div style="
      background:rgba(247,250,248,0.94);
      border:1px solid rgba(158,176,165,0.85);
      border-radius:5px;
      color:#0b1f14;
      font-family:'JetBrains Mono', monospace;
      font-size:10px;
      font-weight:600;
      letter-spacing:0.01em;
      padding:2px 6px;
      white-space:nowrap;
      box-shadow:0 1px 4px rgba(0,0,0,0.12);
    ">${cfg.label} ${cfg.distanceM} m</div>`,
    iconSize: [120, 18],
    iconAnchor: [60, 9],
  });

  L.marker([center[0] + cfg.labelOffsetLat, center[1]], {
    pane: "guidePane",
    icon: labelIcon,
    interactive: false,
  }).addTo(group);
}
