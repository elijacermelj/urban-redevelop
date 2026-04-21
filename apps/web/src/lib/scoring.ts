import { PROGRAMS } from "./programs";
import type {
  CandidateMetrics,
  ProgramType,
  ScoreBreakdown,
  ScoredLocation,
} from "./types";

/* --- Normalizers (0..1) --- */

function settlementScore(m: CandidateMetrics): number {
  if (m.within_settlement) return 1;
  if (m.edge_of_settlement) return 0.6;
  return 0.2;
}

function distanceScore(distance: number, sweet = 300, ok = 600, far = 1000): number {
  if (distance <= sweet) return 1;
  if (distance <= ok) return 0.75;
  if (distance <= far) return 0.5;
  return 0.2;
}

function transitScore(m: CandidateMetrics): number {
  const d = distanceScore(m.distance_to_transport_m, 250, 500, 900);
  const linesBonus = Math.min(m.transit_lines_nearby, 4) * 0.04;
  return Math.min(1, d + linesBonus);
}

function landUseScore(m: CandidateMetrics, program: ProgramType): number {
  const cfg = PROGRAMS[program];
  const idx = cfg.preferred_land_use.indexOf(m.land_use_category);
  if (idx === 0) return 1;
  if (idx === 1) return 0.85;
  if (idx > 1) return 0.7;
  // Compatible-ish fallbacks
  if (m.land_use_category === "green") return 0.15;
  return 0.4;
}

function reusePotentialScore(m: CandidateMetrics): number {
  switch (m.reuse_potential) {
    case "brownfield":
      return 1;
    case "obsolete_building":
      return 0.9;
    case "underused_urban":
      return 0.8;
    case "vacant_lot":
      return 0.7;
    case "infill":
      return 0.6;
    default:
      return 0.4;
  }
}

function riskPenalty(m: CandidateMetrics): {
  penalty: number;
  exclude: boolean;
  reason?: string;
} {
  if (m.flood_risk_class === "high") {
    return { penalty: 1, exclude: true, reason: "Lokacija je v visoki poplavni nevarnosti" };
  }
  if (m.flood_risk_class === "medium") return { penalty: 0.5, exclude: false };
  if (m.flood_risk_class === "low") return { penalty: 0.2, exclude: false };
  return { penalty: 0, exclude: false };
}

function confidenceScore(m: CandidateMetrics): number {
  // For demo we assume all layers present; small variance based on data signals.
  let c = 0.92;
  if (m.distance_to_transport_m > 1500) c -= 0.08;
  if (m.land_use_category === "green") c -= 0.05;
  if (m.reuse_potential === "infill") c -= 0.04;
  return Math.max(0.55, Math.min(1, c));
}

function buildExplanation(
  m: CandidateMetrics,
  program: ProgramType,
  breakdown: ScoreBreakdown
) {
  const positive: string[] = [];
  const warnings: string[] = [];

  if (m.within_settlement)
    positive.push("Lokacija leži znotraj strnjenega naselja");
  else if (m.edge_of_settlement)
    positive.push("Lokacija je na robu naselja, povezana z urbanim tkivom");

  if (m.distance_to_transport_m <= 400)
    positive.push(
      `Postaja javnega prevoza je v neposredni bližini (${m.distance_to_transport_m} m)`
    );
  else if (m.distance_to_transport_m <= 800)
    positive.push(`Javni prevoz dosegljiv v ${m.distance_to_transport_m} m`);

  if (m.distance_to_gji_m <= 200)
    positive.push("Obstoječa komunalna infrastruktura je tik ob lokaciji");
  else if (m.distance_to_gji_m <= 500)
    positive.push("Lokacija je dobro opremljena z gospodarsko javno infrastrukturo");

  if (breakdown.land_use >= 0.85)
    positive.push("Namenska raba je skladna z izbranim programom");

  if (m.reuse_potential === "brownfield")
    positive.push("Območje je razvrednoteno (brownfield) — visok potencial za ponovno aktivacijo");
  else if (m.reuse_potential === "obsolete_building")
    positive.push("Obstoječi objekti so primerni za prenovo in ponovno rabo");
  else if (m.reuse_potential === "underused_urban")
    positive.push("Urban prostor je trenutno podizkoriščen");

  if (m.flood_risk_class === "medium")
    warnings.push("Prisotno je zmerno poplavno tveganje — potrebna je dodatna preverba");
  if (m.flood_risk_class === "low")
    warnings.push("Manjše poplavno tveganje — preveriti ureditev odvodnjavanja");
  if (breakdown.land_use < 0.7)
    warnings.push("Namenska raba je delno neskladna — potrebna podrobnejša preverba prostorskega akta");
  if (m.distance_to_transport_m > 800)
    warnings.push("Javni prevoz je razmeroma oddaljen — razmisliti o izboljšavi dostopnosti");
  if (m.distance_to_gji_m > 500)
    warnings.push("Priklop na komunalno infrastrukturo lahko zahteva dodatno investicijo");

  const programLabel = PROGRAMS[program].label.toLowerCase();
  const summary = `Lokacija je primerna za ${programLabel} zaradi ${
    m.within_settlement ? "umestitve znotraj naselja" : "robne urbane lege"
  }, ${
    m.distance_to_transport_m <= 500 ? "dobre dostopnosti z javnim prevozom" : "razumne dostopnosti"
  } in potenciala za ponovno rabo že urbaniziranega prostora.`;

  return { positive_reasons: positive, warnings, summary };
}

export function scoreLocation(
  base: Omit<
    ScoredLocation,
    | "reuse_score"
    | "confidence_score"
    | "breakdown"
    | "positive_reasons"
    | "warnings"
    | "summary"
    | "excluded"
    | "exclusion_reason"
  >,
  program: ProgramType
): ScoredLocation {
  const m = base.metrics;
  const cfg = PROGRAMS[program];

  const breakdown: ScoreBreakdown = {
    settlement: settlementScore(m),
    infrastructure: distanceScore(m.distance_to_gji_m, 200, 500, 1000),
    public_transport: transitScore(m),
    land_use: landUseScore(m, program),
    reuse_potential: reusePotentialScore(m),
    risk_penalty: riskPenalty(m).penalty,
  };

  const risk = riskPenalty(m);

  const raw =
    cfg.weights.settlement * breakdown.settlement +
    cfg.weights.infrastructure * breakdown.infrastructure +
    cfg.weights.public_transport * breakdown.public_transport +
    cfg.weights.land_use * breakdown.land_use +
    cfg.weights.reuse_potential * breakdown.reuse_potential -
    cfg.weights.risk_penalty * breakdown.risk_penalty;

  const reuse_score = Math.max(0, Math.min(1, raw));
  const confidence = confidenceScore(m);
  const expl = buildExplanation(m, program, breakdown);

  return {
    ...base,
    reuse_score,
    confidence_score: confidence,
    breakdown,
    excluded: risk.exclude,
    exclusion_reason: risk.reason,
    ...expl,
  };
}

export function scoreColor(score: number): string {
  if (score >= 0.75) return "var(--score-high)";
  if (score >= 0.5) return "var(--score-mid)";
  return "var(--score-low)";
}

export function scoreLabel(score: number): string {
  if (score >= 0.85) return "Odlično";
  if (score >= 0.7) return "Zelo dobro";
  if (score >= 0.55) return "Dobro";
  if (score >= 0.4) return "Zmerno";
  return "Šibko";
}
