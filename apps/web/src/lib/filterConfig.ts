export const LAYER_KEYS = [
  "settlements",
  "transport",
  "flood",
  "brownfield",
  "gji",
  "opportunity_heat",
] as const;

export type LayerKey = (typeof LAYER_KEYS)[number];

export const DEFAULT_LAYER_STATE: Record<LayerKey, boolean> = {
  settlements: true,
  transport: true,
  flood: true,
  brownfield: true,
  gji: false,
  opportunity_heat: true,
};

export const DEFAULT_DISTRICT = "Vsa območja";
