import type { ProgramConfig, ProgramType } from "./types";

export const PROGRAMS: Record<ProgramType, ProgramConfig> = {
  housing: {
    id: "housing",
    label: "Stanovanja",
    weights: {
      settlement: 0.25,
      infrastructure: 0.18,
      public_transport: 0.18,
      land_use: 0.2,
      reuse_potential: 0.19,
      risk_penalty: 0.2,
    },
    preferred_land_use: ["residential", "mixed", "central"],
  },
  public_services: {
    id: "public_services",
    label: "Javne storitve",
    weights: {
      settlement: 0.28,
      infrastructure: 0.15,
      public_transport: 0.22,
      land_use: 0.2,
      reuse_potential: 0.15,
      risk_penalty: 0.2,
    },
    preferred_land_use: ["central", "public", "mixed"],
  },
  small_business: {
    id: "small_business",
    label: "Manjši poslovni program",
    weights: {
      settlement: 0.18,
      infrastructure: 0.25,
      public_transport: 0.15,
      land_use: 0.22,
      reuse_potential: 0.2,
      risk_penalty: 0.18,
    },
    preferred_land_use: ["mixed", "business", "central", "industrial"],
  },
  infrastructure: {
    id: "infrastructure",
    label: "Lokalna infrastruktura",
    weights: {
      settlement: 0.15,
      infrastructure: 0.3,
      public_transport: 0.1,
      land_use: 0.2,
      reuse_potential: 0.25,
      risk_penalty: 0.2,
    },
    preferred_land_use: ["industrial", "mixed", "public"],
  },
};

export const PROGRAM_LIST: ProgramConfig[] = Object.values(PROGRAMS);
