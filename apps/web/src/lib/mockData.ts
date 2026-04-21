import type { CandidateMetrics, ScoredLocation } from "./types";

type RawCandidate = Omit<
  ScoredLocation,
  | "reuse_score"
  | "confidence_score"
  | "breakdown"
  | "positive_reasons"
  | "warnings"
  | "summary"
  | "excluded"
  | "exclusion_reason"
>;

function poly(lat: number, lng: number, sizeM = 90): [number, number][] {
  // ~111_111 m per degree lat; lng adjusted by cos(lat)
  const dLat = sizeM / 111_111;
  const dLng = sizeM / (111_111 * Math.cos((lat * Math.PI) / 180));
  return [
    [lng - dLng, lat - dLat],
    [lng + dLng, lat - dLat],
    [lng + dLng, lat + dLat],
    [lng - dLng, lat + dLat],
    [lng - dLng, lat - dLat],
  ];
}

function loc(
  id: string,
  name: string,
  district: string,
  lat: number,
  lng: number,
  metrics: CandidateMetrics,
  program_fit: ScoredLocation["program_fit"],
  size = 90
): RawCandidate {
  return {
    id,
    name,
    district,
    municipality: "Ljubljana",
    lat,
    lng,
    polygon: poly(lat, lng, size),
    metrics,
    program_fit,
  };
}

/** Hand-tuned candidates inspired by real Ljubljana brownfield / infill areas. */
export const RAW_CANDIDATES: RawCandidate[] = [
  loc(
    "lj-01",
    "Rog – nekdanja tovarna koles",
    "Center",
    46.0521,
    14.5135,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 180,
      distance_to_gji_m: 60,
      flood_risk_class: "low",
      land_use_category: "central",
      reuse_potential: "obsolete_building",
      area_m2: 8400,
      transit_lines_nearby: 5,
    },
    ["public_services", "small_business", "housing"],
    140
  ),
  loc(
    "lj-02",
    "Cukrarna – širše območje",
    "Center",
    46.0556,
    14.5142,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 220,
      distance_to_gji_m: 90,
      flood_risk_class: "medium",
      land_use_category: "central",
      reuse_potential: "obsolete_building",
      area_m2: 12000,
      transit_lines_nearby: 4,
    },
    ["public_services", "housing"],
    160
  ),
  loc(
    "lj-03",
    "Tobačna mesto",
    "Vič-Rudnik",
    46.0464,
    14.4904,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 150,
      distance_to_gji_m: 50,
      flood_risk_class: "none",
      land_use_category: "mixed",
      reuse_potential: "brownfield",
      area_m2: 16500,
      transit_lines_nearby: 6,
    },
    ["housing", "small_business", "public_services"],
    180
  ),
  loc(
    "lj-04",
    "Litostrojska – severni del",
    "Šiška",
    46.0735,
    14.4843,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 320,
      distance_to_gji_m: 110,
      flood_risk_class: "low",
      land_use_category: "industrial",
      reuse_potential: "brownfield",
      area_m2: 22000,
      transit_lines_nearby: 3,
    },
    ["small_business", "infrastructure", "housing"],
    220
  ),
  loc(
    "lj-05",
    "BTC – severovzhodna cona",
    "Moste-Polje",
    46.0688,
    14.5482,
    {
      within_settlement: true,
      edge_of_settlement: true,
      distance_to_transport_m: 410,
      distance_to_gji_m: 80,
      flood_risk_class: "low",
      land_use_category: "business",
      reuse_potential: "underused_urban",
      area_m2: 18500,
      transit_lines_nearby: 3,
    },
    ["small_business", "infrastructure"],
    200
  ),
  loc(
    "lj-06",
    "Fužine – degradirani plato",
    "Moste-Polje",
    46.0539,
    14.5612,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 260,
      distance_to_gji_m: 120,
      flood_risk_class: "none",
      land_use_category: "residential",
      reuse_potential: "underused_urban",
      area_m2: 6800,
      transit_lines_nearby: 4,
    },
    ["housing", "public_services"],
    120
  ),
  loc(
    "lj-07",
    "Bežigrad – stara železniška cona",
    "Bežigrad",
    46.0731,
    14.5167,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 290,
      distance_to_gji_m: 70,
      flood_risk_class: "low",
      land_use_category: "mixed",
      reuse_potential: "brownfield",
      area_m2: 14200,
      transit_lines_nearby: 5,
    },
    ["housing", "small_business", "public_services"],
    170
  ),
  loc(
    "lj-08",
    "Vižmarje – urbana praznina",
    "Šiška",
    46.0931,
    14.4719,
    {
      within_settlement: true,
      edge_of_settlement: true,
      distance_to_transport_m: 540,
      distance_to_gji_m: 230,
      flood_risk_class: "low",
      land_use_category: "residential",
      reuse_potential: "vacant_lot",
      area_m2: 4200,
      transit_lines_nearby: 2,
    },
    ["housing", "public_services"],
    100
  ),
  loc(
    "lj-09",
    "Zalog – industrijski rob",
    "Moste-Polje",
    46.0626,
    14.6022,
    {
      within_settlement: true,
      edge_of_settlement: true,
      distance_to_transport_m: 720,
      distance_to_gji_m: 180,
      flood_risk_class: "medium",
      land_use_category: "industrial",
      reuse_potential: "brownfield",
      area_m2: 28000,
      transit_lines_nearby: 2,
    },
    ["small_business", "infrastructure"],
    240
  ),
  loc(
    "lj-10",
    "Kolinska – nekdanji obrat",
    "Bežigrad",
    46.0808,
    14.5311,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 240,
      distance_to_gji_m: 65,
      flood_risk_class: "low",
      land_use_category: "mixed",
      reuse_potential: "brownfield",
      area_m2: 19500,
      transit_lines_nearby: 4,
    },
    ["housing", "small_business", "public_services"],
    200
  ),
  loc(
    "lj-11",
    "Vrhovci – obrobni infill",
    "Vič-Rudnik",
    46.0367,
    14.4624,
    {
      within_settlement: false,
      edge_of_settlement: true,
      distance_to_transport_m: 880,
      distance_to_gji_m: 320,
      flood_risk_class: "medium",
      land_use_category: "residential",
      reuse_potential: "infill",
      area_m2: 5400,
      transit_lines_nearby: 1,
    },
    ["housing"],
    110
  ),
  loc(
    "lj-12",
    "Rakova jelša – poplavna ravnica",
    "Vič-Rudnik",
    46.0291,
    14.4975,
    {
      within_settlement: false,
      edge_of_settlement: true,
      distance_to_transport_m: 950,
      distance_to_gji_m: 410,
      flood_risk_class: "high",
      land_use_category: "residential",
      reuse_potential: "vacant_lot",
      area_m2: 7600,
      transit_lines_nearby: 1,
    },
    ["housing"],
    130
  ),
  loc(
    "lj-13",
    "Polje – podizkoriščeni plato",
    "Moste-Polje",
    46.0594,
    14.5836,
    {
      within_settlement: true,
      edge_of_settlement: true,
      distance_to_transport_m: 470,
      distance_to_gji_m: 150,
      flood_risk_class: "low",
      land_use_category: "mixed",
      reuse_potential: "underused_urban",
      area_m2: 9200,
      transit_lines_nearby: 2,
    },
    ["housing", "small_business"],
    150
  ),
  loc(
    "lj-14",
    "Trnovo – mali infill",
    "Center",
    46.0413,
    14.5049,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 200,
      distance_to_gji_m: 50,
      flood_risk_class: "none",
      land_use_category: "residential",
      reuse_potential: "vacant_lot",
      area_m2: 2400,
      transit_lines_nearby: 4,
    },
    ["housing", "public_services"],
    80
  ),
  loc(
    "lj-15",
    "Stožice – obrobni servisni plato",
    "Bežigrad",
    46.0852,
    14.5234,
    {
      within_settlement: true,
      edge_of_settlement: true,
      distance_to_transport_m: 380,
      distance_to_gji_m: 110,
      flood_risk_class: "low",
      land_use_category: "mixed",
      reuse_potential: "underused_urban",
      area_m2: 11200,
      transit_lines_nearby: 3,
    },
    ["small_business", "public_services", "infrastructure"],
    160
  ),
  loc(
    "lj-16",
    "Kodeljevo – obstoječa cona",
    "Moste-Polje",
    46.0517,
    14.5404,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 310,
      distance_to_gji_m: 95,
      flood_risk_class: "low",
      land_use_category: "central",
      reuse_potential: "underused_urban",
      area_m2: 5800,
      transit_lines_nearby: 4,
    },
    ["public_services", "housing"],
    120
  ),
  loc(
    "lj-17",
    "Vodmat – zaposlitvena cona",
    "Center",
    46.0512,
    14.5234,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 170,
      distance_to_gji_m: 55,
      flood_risk_class: "none",
      land_use_category: "central",
      reuse_potential: "obsolete_building",
      area_m2: 7400,
      transit_lines_nearby: 5,
    },
    ["public_services", "small_business", "housing"],
    140
  ),
  loc(
    "lj-18",
    "Šentvid – industrijski rob",
    "Šiška",
    46.1082,
    14.4744,
    {
      within_settlement: true,
      edge_of_settlement: true,
      distance_to_transport_m: 620,
      distance_to_gji_m: 220,
      flood_risk_class: "low",
      land_use_category: "industrial",
      reuse_potential: "brownfield",
      area_m2: 17800,
      transit_lines_nearby: 2,
    },
    ["small_business", "infrastructure"],
    200
  ),
  loc(
    "lj-19",
    "Dolgi most – obrtna cona",
    "Vič-Rudnik",
    46.0395,
    14.4738,
    {
      within_settlement: true,
      edge_of_settlement: true,
      distance_to_transport_m: 450,
      distance_to_gji_m: 140,
      flood_risk_class: "low",
      land_use_category: "business",
      reuse_potential: "underused_urban",
      area_m2: 13200,
      transit_lines_nearby: 3,
    },
    ["small_business", "infrastructure"],
    180
  ),
  loc(
    "lj-20",
    "Jarše – nekdanji obrat",
    "Moste-Polje",
    46.0688,
    14.5618,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 280,
      distance_to_gji_m: 100,
      flood_risk_class: "low",
      land_use_category: "industrial",
      reuse_potential: "brownfield",
      area_m2: 15600,
      transit_lines_nearby: 3,
    },
    ["small_business", "housing", "infrastructure"],
    180
  ),
  loc(
    "lj-21",
    "Spodnja Šiška – urban praznina",
    "Šiška",
    46.0671,
    14.4972,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 230,
      distance_to_gji_m: 70,
      flood_risk_class: "none",
      land_use_category: "mixed",
      reuse_potential: "vacant_lot",
      area_m2: 4800,
      transit_lines_nearby: 4,
    },
    ["housing", "public_services"],
    110
  ),
  loc(
    "lj-22",
    "Murgle – robni infill",
    "Vič-Rudnik",
    46.0339,
    14.4881,
    {
      within_settlement: false,
      edge_of_settlement: true,
      distance_to_transport_m: 1100,
      distance_to_gji_m: 380,
      flood_risk_class: "medium",
      land_use_category: "residential",
      reuse_potential: "infill",
      area_m2: 3800,
      transit_lines_nearby: 1,
    },
    ["housing"],
    100
  ),
  loc(
    "lj-23",
    "Kosovelova – degradirani plato",
    "Bežigrad",
    46.0764,
    14.5078,
    {
      within_settlement: true,
      edge_of_settlement: false,
      distance_to_transport_m: 250,
      distance_to_gji_m: 75,
      flood_risk_class: "low",
      land_use_category: "central",
      reuse_potential: "underused_urban",
      area_m2: 6200,
      transit_lines_nearby: 5,
    },
    ["public_services", "housing", "small_business"],
    130
  ),
  loc(
    "lj-24",
    "Letališka – obrobna servisna cona",
    "Moste-Polje",
    46.0623,
    14.5703,
    {
      within_settlement: true,
      edge_of_settlement: true,
      distance_to_transport_m: 510,
      distance_to_gji_m: 160,
      flood_risk_class: "low",
      land_use_category: "business",
      reuse_potential: "brownfield",
      area_m2: 21000,
      transit_lines_nearby: 2,
    },
    ["small_business", "infrastructure"],
    220
  ),
];

export const LJUBLJANA_CENTER: [number, number] = [46.0569, 14.5058];

export const DISTRICTS = [
  "Vsa območja",
  "Center",
  "Bežigrad",
  "Šiška",
  "Vič-Rudnik",
  "Moste-Polje",
] as const;
