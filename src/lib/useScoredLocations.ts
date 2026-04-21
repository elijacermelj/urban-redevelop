import { useMemo } from "react";
import { RAW_CANDIDATES } from "./mockData";
import { scoreLocation } from "./scoring";
import type { ProgramType, ScoredLocation } from "./types";

export interface FilterState {
  program: ProgramType;
  district: string;
  excludeFlood: boolean;
  layers: {
    settlements: boolean;
    transport: boolean;
    flood: boolean;
    brownfield: boolean;
    gji: boolean;
  };
}

export function useScoredLocations(filters: FilterState): ScoredLocation[] {
  return useMemo(() => {
    const scored = RAW_CANDIDATES.map((c) => scoreLocation(c, filters.program));
    return scored
      .filter((l) => filters.district === "Vsa območja" || l.district === filters.district)
      .filter((l) => l.program_fit.includes(filters.program))
      .filter((l) => (filters.excludeFlood ? !l.excluded : true))
      .sort((a, b) => {
        if (a.excluded && !b.excluded) return 1;
        if (!a.excluded && b.excluded) return -1;
        return b.reuse_score - a.reuse_score;
      });
  }, [filters]);
}
