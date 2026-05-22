export type MapBaseStyleId =
  | "carto_light"
  | "carto_voyager"
  | "carto_dark"
  | "osm_standard"
  | "opentopo"
  | "esri_satellite";

type MapBaseStyleConfig = {
  label: string;
  previewSrc: string;
  tileUrl: string;
  attribution: string;
  maxZoom?: number;
  subdomains?: string;
};

export const MAP_BASE_STYLES: Record<MapBaseStyleId, MapBaseStyleConfig> = {
  carto_light: {
    label: "Svetla",
    previewSrc: `${import.meta.env.BASE_URL}map-style-previews/svetla-carto.png`,
    tileUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: "abcd",
  },
  carto_voyager: {
    label: "Voyager",
    previewSrc: `${import.meta.env.BASE_URL}map-style-previews/voyager-carto.png`,
    tileUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: "abcd",
  },
  carto_dark: {
    label: "Temna",
    previewSrc: `${import.meta.env.BASE_URL}map-style-previews/temna-carto.png`,
    tileUrl: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: "abcd",
  },
  osm_standard: {
    label: "OSM standard",
    previewSrc: `${import.meta.env.BASE_URL}map-style-previews/osm-standard.png`,
    tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  opentopo: {
    label: "Topo",
    previewSrc: `${import.meta.env.BASE_URL}map-style-previews/topo-opentopo.png`,
    tileUrl: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17,
    subdomains: "abc",
  },
  esri_satellite: {
    label: "Satelitska",
    previewSrc: `${import.meta.env.BASE_URL}map-style-previews/satelitska-esri.png`,
    tileUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 19,
  },
};

export const MAP_BASE_STYLE_OPTIONS = [
  {
    id: "osm_standard",
    label: MAP_BASE_STYLES.osm_standard.label,
    previewSrc: MAP_BASE_STYLES.osm_standard.previewSrc,
  },
  {
    id: "opentopo",
    label: MAP_BASE_STYLES.opentopo.label,
    previewSrc: MAP_BASE_STYLES.opentopo.previewSrc,
  },
  {
    id: "esri_satellite",
    label: MAP_BASE_STYLES.esri_satellite.label,
    previewSrc: MAP_BASE_STYLES.esri_satellite.previewSrc,
  },
  {
    id: "carto_voyager",
    label: MAP_BASE_STYLES.carto_voyager.label,
    previewSrc: MAP_BASE_STYLES.carto_voyager.previewSrc,
  },
  {
    id: "carto_light",
    label: MAP_BASE_STYLES.carto_light.label,
    previewSrc: MAP_BASE_STYLES.carto_light.previewSrc,
  },
  {
    id: "carto_dark",
    label: MAP_BASE_STYLES.carto_dark.label,
    previewSrc: MAP_BASE_STYLES.carto_dark.previewSrc,
  },
] as const satisfies readonly { id: MapBaseStyleId; label: string; previewSrc: string }[];
