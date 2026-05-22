import { useMemo } from "react";
import { CITY_NAME_BY_ID, RAW_CANDIDATES } from "./mockData";
import { scoreLocation } from "./scoring";
import type { ProgramType, ScoredLocation } from "./types";
import type { CityId } from "./mockData";

export const NOT_SELECTED_CITY_ID = "not_selected" as const;
export type CityFilterId = CityId | typeof NOT_SELECTED_CITY_ID;

export interface FilterState {
  city: CityFilterId;
  program: ProgramType;
  district: string;
  excludeFlood: boolean;
  layers: {
    settlements: boolean;
    transport: boolean;
    flood: boolean;
    brownfield: boolean;
    gji: boolean;
    opportunity_heat: boolean;
  };
}

export function useScoredLocations(filters: FilterState): ScoredLocation[] {
  return useMemo(() => {
    const allCitiesSelected = filters.city === NOT_SELECTED_CITY_ID;
    const cityName = allCitiesSelected ? null : CITY_NAME_BY_ID[filters.city];
    const scored = RAW_CANDIDATES.map((c) => scoreLocation(c, filters.program));
    return scored
      .filter((l) => (cityName ? l.municipality === cityName : true))
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
