export type ProgramType = "housing" | "public_services" | "small_business" | "infrastructure";

export type FloodRiskClass = "none" | "low" | "medium" | "high";

export type ReusePotentialType =
  | "brownfield"
  | "underused_urban"
  | "vacant_lot"
  | "obsolete_building"
  | "infill";

export type LandUseCategory =
  | "residential"
  | "mixed"
  | "central"
  | "business"
  | "industrial"
  | "public"
  | "green";

export interface CandidateMetrics {
  within_settlement: boolean;
  edge_of_settlement: boolean;
  distance_to_transport_m: number;
  distance_to_gji_m: number;
  flood_risk_class: FloodRiskClass;
  land_use_category: LandUseCategory;
  reuse_potential: ReusePotentialType;
  area_m2: number;
  transit_lines_nearby: number;
}

export interface ScoreBreakdown {
  settlement: number;
  infrastructure: number;
  public_transport: number;
  land_use: number;
  reuse_potential: number;
  risk_penalty: number;
}

export interface ScoredLocation {
  id: string;
  name: string;
  district: string;
  municipality: string;
  lat: number;
  lng: number;
  polygon: [number, number][];
  metrics: CandidateMetrics;
  reuse_score: number;
  confidence_score: number;
  breakdown: ScoreBreakdown;
  positive_reasons: string[];
  warnings: string[];
  summary: string;
  program_fit: ProgramType[];
  excluded?: boolean;
  exclusion_reason?: string;
}

export interface ProgramConfig {
  id: ProgramType;
  label: string;
  weights: {
    settlement: number;
    infrastructure: number;
    public_transport: number;
    land_use: number;
    reuse_potential: number;
    risk_penalty: number;
  };
  preferred_land_use: LandUseCategory[];
}

export interface HealthResponse {
  status: "ok";
  service: string;
  timestamp: string;
}
