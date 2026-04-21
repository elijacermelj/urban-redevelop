import { useEffect, useRef } from "react";
import L from "leaflet";
import { LJUBLJANA_CENTER } from "@/lib/mockData";
import { scoreColor } from "@/lib/scoring";
import type { ScoredLocation } from "@/lib/types";

interface MapViewProps {
  locations: ScoredLocation[];
  selectedId: string | null;
  comparedIds: string[];
  onSelect: (id: string) => void;
  layers: {
    flood: boolean;
    transport: boolean;
    brownfield: boolean;
    settlements: boolean;
    gji: boolean;
  };
}

// Approximate flood-prone polygon (Ljubljansko Barje area), demo only.
const FLOOD_AREA: [number, number][] = [
  [46.0335, 14.4750],
  [46.0335, 14.5200],
  [46.0210, 14.5200],
  [46.0210, 14.4750],
];

// Approximate "settlement core" of Ljubljana, demo only.
const SETTLEMENT_AREA: [number, number][] = [
  [46.095, 14.45],
  [46.095, 14.61],
  [46.025, 14.61],
  [46.025, 14.45],
];

// Mock public transport stops.
const TRANSPORT_STOPS: [number, number][] = [
  [46.0521, 14.5055],
  [46.0569, 14.5118],
  [46.0612, 14.5145],
  [46.0688, 14.5232],
  [46.0735, 14.4843],
  [46.0464, 14.4904],
  [46.0539, 14.5612],
  [46.0808, 14.5311],
  [46.0731, 14.5167],
  [46.0517, 14.5404],
];

export function MapView({ locations, selectedId, comparedIds, onSelect, layers }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: LJUBLJANA_CENTER,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    overlayGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw overlays
  useEffect(() => {
    const group = overlayGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (layers.settlements) {
      L.polygon(SETTLEMENT_AREA, {
        color: "#7dd3fc",
        weight: 1,
        dashArray: "4 4",
        fillOpacity: 0.04,
        fillColor: "#7dd3fc",
        interactive: false,
      }).addTo(group);
    }
    if (layers.flood) {
      L.polygon(FLOOD_AREA, {
        color: "#fb7185",
        weight: 1,
        fillOpacity: 0.18,
        fillColor: "#fb7185",
        interactive: false,
      }).addTo(group);
    }
    if (layers.transport) {
      TRANSPORT_STOPS.forEach((s) => {
        L.circleMarker(s, {
          radius: 4,
          color: "#fde68a",
          fillColor: "#fde68a",
          fillOpacity: 0.9,
          weight: 1,
          interactive: false,
        }).addTo(group);
      });
    }
  }, [layers]);

  // Redraw locations
  useEffect(() => {
    const group = layerGroupRef.current;
    const map = mapRef.current;
    if (!group || !map) return;
    group.clearLayers();

    locations.forEach((loc) => {
      const isSelected = loc.id === selectedId;
      const isCompared = comparedIds.includes(loc.id);
      const color = loc.excluded ? "#ef4444" : scoreColor(loc.reuse_score);

      // Polygon
      const latlngs = loc.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
      L.polygon(latlngs, {
        color,
        weight: isSelected ? 3 : isCompared ? 2.5 : 1.5,
        fillOpacity: loc.excluded ? 0.15 : 0.4,
        fillColor: color,
        dashArray: loc.excluded ? "4 3" : undefined,
      })
        .addTo(group)
        .on("click", () => onSelect(loc.id));

      // Center marker with score
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background:${color};
          color:#0a0f14;
          font-family:'JetBrains Mono',monospace;
          font-weight:600;
          font-size:11px;
          padding:3px 6px;
          border-radius:6px;
          border:${isSelected ? "2px solid #fff" : isCompared ? "2px solid #38bdf8" : "1px solid rgba(0,0,0,0.4)"};
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          white-space:nowrap;
        ">${Math.round(loc.reuse_score * 100)}</div>`,
        iconSize: [32, 20],
        iconAnchor: [16, 10],
      });
      L.marker([loc.lat, loc.lng], { icon })
        .addTo(group)
        .on("click", () => onSelect(loc.id));
    });
  }, [locations, selectedId, comparedIds, onSelect]);

  // Pan to selected
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const loc = locations.find((l) => l.id === selectedId);
    if (loc) mapRef.current.setView([loc.lat, loc.lng], 15, { animate: true });
  }, [selectedId, locations]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
