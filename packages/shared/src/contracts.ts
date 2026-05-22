import { z } from "zod";

export const ProgramTypeSchema = z.enum([
  "housing",
  "public_services",
  "small_business",
  "infrastructure",
]);

export const FloodRiskClassSchema = z.enum(["none", "low", "medium", "high"]);

export const ReusePotentialTypeSchema = z.enum([
  "brownfield",
  "underused_urban",
  "vacant_lot",
  "obsolete_building",
  "infill",
]);

export const LandUseCategorySchema = z.enum([
  "residential",
  "mixed",
  "central",
  "business",
  "industrial",
  "public",
  "green",
]);

export const CandidateMetricsSchema = z.object({
  within_settlement: z.boolean(),
  edge_of_settlement: z.boolean(),
  distance_to_transport_m: z.number(),
  distance_to_gji_m: z.number(),
  flood_risk_class: FloodRiskClassSchema,
  land_use_category: LandUseCategorySchema,
  reuse_potential: ReusePotentialTypeSchema,
  area_m2: z.number(),
  transit_lines_nearby: z.number(),
});

export const ScoreBreakdownSchema = z.object({
  settlement: z.number(),
  infrastructure: z.number(),
  public_transport: z.number(),
  land_use: z.number(),
  reuse_potential: z.number(),
  risk_penalty: z.number(),
});

export const ScoredLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  district: z.string(),
  municipality: z.string(),
  lat: z.number(),
  lng: z.number(),
  polygon: z.array(z.tuple([z.number(), z.number()])),
  metrics: CandidateMetricsSchema,
  reuse_score: z.number(),
  confidence_score: z.number(),
  breakdown: ScoreBreakdownSchema,
  positive_reasons: z.array(z.string()),
  warnings: z.array(z.string()),
  summary: z.string(),
  program_fit: z.array(ProgramTypeSchema),
  excluded: z.boolean().optional(),
  exclusion_reason: z.string().optional(),
});

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  timestamp: z.string(),
});
