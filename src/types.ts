export type AnalysisView = "overall" | "national" | "underused";
export type MunicipalitySizeFilter = "all" | "large" | "small";

export type MetricKey =
  | "jspi_score"
  | "national_absolute_potential_score"
  | "underused_transit_potential_score"
  | "estimated_switchers"
  | "car_pressure_score"
  | "public_transport_service_score"
  | "accessibility_score"
  | "travel_time_competitiveness_score_final"
  | "data_confidence_score";

export interface Filters {
  searchText: string;
  campaignType: string;
  onlyHotspots: boolean;
  municipalitySize: MunicipalitySizeFilter;
  showMapLabels: boolean;
}

export interface AreaRecord {
  area_id: string;
  postal_code: string;
  area_name: string;
  municipality_code: string;
  municipality_name: string;
  municipality_population_total: number;
  lat: number;
  lon: number;
  area_m2: number | null;
  area_km2: number | null;
  polygon_rings: [number, number][][];
  population_final: number | null;
  employed_residents_final: number | null;
  estimated_commuters_base: number | null;
  estimated_car_commute_share: number | null;
  estimated_switchers: number;
  jspi_score: number;
  jspi_score_original: number | null;
  jspi_score_v2: number | null;
  national_absolute_potential_score: number;
  national_absolute_potential_rank: number | null;
  underused_transit_potential_score: number;
  underused_transit_potential_rank: number | null;
  primary_analysis_view: string;
  potential_persons_score: number | null;
  underuse_score: number | null;
  car_pressure_score: number | null;
  emission_congestion_score: number | null;
  ad_feasibility_score: number | null;
  public_transport_service_score: number | null;
  accessibility_score: number | null;
  travel_time_competitiveness_score_final: number | null;
  nearest_transit_stop_distance_m: number | null;
  rail_nearest_distance_m: number | null;
  liipi_nearest_distance_m: number | null;
  recommended_campaign_type: string;
  recommendation_reason: string;
  message_angle: string;
  data_confidence_score: number | null;
  data_confidence_level: string;
  commuting_data_source: string;
  confidence_missing_reasons: string;
  rank: number | null;
  isHotspot: boolean;
  hotspot_rank: number | null;
  hotspot_source_view: string;
  priority: string;
  campaign_lat: number | null;
  campaign_lon: number | null;
  campaign_point_type: string;
  raw: Record<string, string>;
}

export interface HotspotRecord extends AreaRecord {
  hotspot_rank: number;
}

export interface DataBundle {
  areas: AreaRecord[];
  hotspots: HotspotRecord[];
  loadedFiles: string[];
  modelConfig: unknown | null;
  dataDictionary: Record<string, string>[];
  viewDefinitions: string | null;
  readme: string | null;
}

export interface MetricOption {
  key: MetricKey;
  label: string;
  shortLabel: string;
  description: string;
  valueKind: "score100" | "score01" | "count";
}

export interface AnalysisViewConfig {
  id: AnalysisView;
  label: string;
  eyebrow: string;
  description: string;
  sortMetric: MetricKey;
}

export interface KpiSummary {
  totalAreas: number;
  visibleAreas: number;
  totalSwitchers: number;
  highestJspi: number;
  medianJspi: number;
  topArea: AreaRecord | null;
  confidenceCounts: Record<string, number>;
}
