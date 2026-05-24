import Papa from "papaparse";
import type { AreaRecord, DataBundle, HotspotRecord } from "../types";
import { normalizeCode, parseNumber, stringValue } from "./format";

const DATA_ROOT = "/data";

type CsvRow = Record<string, unknown>;
type PolygonPreview = { a?: unknown; r?: unknown };
type MunicipalityItem = {
  code?: unknown;
  classificationItemNames?: Array<{ lang?: string; name?: string }>;
};

async function fetchText(fileName: string, required = true): Promise<string | null> {
  const response = await fetch(`${DATA_ROOT}/${fileName}`);
  if (!response.ok) {
    if (required) {
      throw new Error(`Tiedostoa public/data/${fileName} ei löytynyt. Tarkista, että aineisto on public/data-kansiossa.`);
    }
    return null;
  }
  const text = (await response.text()).replace(/^\uFEFF/, "");
  if (!required && text.trimStart().toLowerCase().startsWith("<!doctype html")) {
    return null;
  }
  return text;
}

function parseCsv(text: string): CsvRow[] {
  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  if (parsed.errors.length) {
    const firstError = parsed.errors[0];
    throw new Error(`CSV-luku epäonnistui: ${firstError.message}`);
  }

  return parsed.data;
}

async function loadCsv(fileName: string, required = true): Promise<CsvRow[]> {
  const text = await fetchText(fileName, required);
  return text ? parseCsv(text) : [];
}

async function loadJson(fileName: string): Promise<unknown | null> {
  const text = await fetchText(fileName, false);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function loadText(fileName: string): Promise<string | null> {
  return fetchText(fileName, false);
}

function rowToRaw(row: CsvRow): Record<string, string> {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()]));
}

function areaBaseRaw(row: CsvRow | undefined): Record<string, string> {
  if (!row) {
    return {};
  }

  const { geometry_json: _geometryJson, ...rest } = row;
  return rowToRaw(rest);
}

function parsePolygonRings(value: unknown): [number, number][][] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((ring) => {
      if (!Array.isArray(ring)) {
        return [];
      }
      return ring
        .map((point): [number, number] | null => {
          if (!Array.isArray(point) || point.length < 2) {
            return null;
          }
          const lat = parseNumber(point[0]);
          const lon = parseNumber(point[1]);
          return lat === null || lon === null ? null : [lat, lon];
        })
        .filter((point): point is [number, number] => point !== null);
    })
    .filter((ring) => ring.length >= 4);
}

function buildPolygonMap(polygons: unknown): Map<string, [number, number][][]> {
  if (!Array.isArray(polygons)) {
    return new Map();
  }

  return new Map(
    (polygons as PolygonPreview[])
      .map((polygon) => [normalizeCode(polygon.a, 5), parsePolygonRings(polygon.r)] as const)
      .filter(([areaId, rings]) => Boolean(areaId) && rings.length > 0)
  );
}

function buildMunicipalityMap(items: unknown): Map<string, string> {
  if (items && typeof items === "object" && !Array.isArray(items)) {
    return new Map(
      Object.entries(items as Record<string, unknown>)
        .map(([code, name]) => [normalizeCode(code, 3), stringValue(name)] as const)
        .filter(([code, name]) => Boolean(code) && Boolean(name))
    );
  }

  if (!Array.isArray(items)) {
    return new Map();
  }

  return new Map(
    (items as MunicipalityItem[])
      .map((item) => {
        const code = normalizeCode(item.code, 3);
        const name =
          item.classificationItemNames?.find((candidate) => candidate.lang === "fi")?.name ??
          item.classificationItemNames?.[0]?.name ??
          "";
        return [code, name] as const;
      })
      .filter(([code, name]) => Boolean(code) && Boolean(name))
  );
}

function numberValue(row: CsvRow, key: string, fallback = 0): number {
  return parseNumber(row[key]) ?? fallback;
}

function nullableNumber(row: CsvRow, key: string): number | null {
  return parseNumber(row[key]);
}

function parseArea(row: CsvRow): AreaRecord {
  const areaId = normalizeCode(row.area_id, 5);
  const postalCode = normalizeCode(row.postal_code ?? row.area_id, 5);
  const municipalityCode = normalizeCode(row.municipality_code, 3);

  return {
    area_id: areaId,
    postal_code: postalCode,
    area_name: stringValue(row.area_name, `Postinumero ${postalCode}`),
    municipality_code: municipalityCode,
    municipality_name: municipalityCode,
    municipality_population_total: 0,
    lat: numberValue(row, "lat"),
    lon: numberValue(row, "lon"),
    area_m2: nullableNumber(row, "area_m2"),
    area_km2: nullableNumber(row, "area_km2"),
    polygon_rings: [],
    population_final: nullableNumber(row, "population_final"),
    employed_residents_final: nullableNumber(row, "employed_residents_final"),
    estimated_commuters_base: nullableNumber(row, "estimated_commuters_base"),
    estimated_car_commute_share: nullableNumber(row, "estimated_car_commute_share"),
    estimated_switchers: numberValue(row, "estimated_switchers"),
    jspi_score: numberValue(row, "jspi_score"),
    jspi_score_original: nullableNumber(row, "jspi_score_original"),
    jspi_score_v2: nullableNumber(row, "jspi_score_v2"),
    national_absolute_potential_score: numberValue(row, "national_absolute_potential_score"),
    national_absolute_potential_rank: nullableNumber(row, "national_absolute_potential_rank"),
    underused_transit_potential_score: numberValue(row, "underused_transit_potential_score"),
    underused_transit_potential_rank: nullableNumber(row, "underused_transit_potential_rank"),
    primary_analysis_view: stringValue(row.primary_analysis_view),
    potential_persons_score: nullableNumber(row, "potential_persons_score"),
    underuse_score: nullableNumber(row, "underuse_score"),
    car_pressure_score: nullableNumber(row, "car_pressure_score"),
    emission_congestion_score: nullableNumber(row, "emission_congestion_score"),
    ad_feasibility_score: nullableNumber(row, "ad_feasibility_score"),
    public_transport_service_score: nullableNumber(row, "public_transport_service_score"),
    accessibility_score: nullableNumber(row, "accessibility_score"),
    travel_time_competitiveness_score_final: nullableNumber(row, "travel_time_competitiveness_score_final"),
    nearest_transit_stop_distance_m: nullableNumber(row, "nearest_transit_stop_distance_m"),
    rail_nearest_distance_m: nullableNumber(row, "rail_nearest_distance_m"),
    liipi_nearest_distance_m: nullableNumber(row, "liipi_nearest_distance_m"),
    recommended_campaign_type: stringValue(row.recommended_campaign_type, "Ei suositusta"),
    recommendation_reason: stringValue(row.recommendation_reason, "Ei erillistä perustelua."),
    message_angle: stringValue(row.message_angle, "Ei erillistä viestikulmaa."),
    data_confidence_score: nullableNumber(row, "data_confidence_score"),
    data_confidence_level: stringValue(row.data_confidence_level, "ei tietoa").toLowerCase(),
    commuting_data_source: stringValue(row.commuting_data_source, "ei tietoa"),
    confidence_missing_reasons: stringValue(row.confidence_missing_reasons),
    rank: nullableNumber(row, "rank"),
    isHotspot: false,
    hotspot_rank: nullableNumber(row, "hotspot_rank"),
    hotspot_source_view: stringValue(row.hotspot_source_view),
    priority: stringValue(row.priority),
    campaign_lat: nullableNumber(row, "campaign_lat"),
    campaign_lon: nullableNumber(row, "campaign_lon"),
    campaign_point_type: stringValue(row.campaign_point_type),
    raw: rowToRaw(row)
  };
}

function keyedRows(rows: CsvRow[]): Map<string, CsvRow> {
  return new Map(rows.map((row) => [normalizeCode(row.area_id, 5), row]));
}

function mergeRaw(target: AreaRecord, source: CsvRow | undefined) {
  if (!source) {
    return;
  }

  target.raw = {
    ...target.raw,
    ...rowToRaw(source)
  };
}

function mergeNumeric(target: AreaRecord, source: CsvRow | undefined, keys: Array<keyof AreaRecord & string>) {
  if (!source) {
    return;
  }

  for (const key of keys) {
    const value = parseNumber(source[key]);
    if (value !== null) {
      (target as unknown as Record<string, number | null>)[key] = value;
    }
  }
}

function mergeText(target: AreaRecord, source: CsvRow | undefined, keys: Array<keyof AreaRecord & string>) {
  if (!source) {
    return;
  }

  for (const key of keys) {
    const value = stringValue(source[key]);
    if (value) {
      (target as unknown as Record<string, string>)[key] = value;
    }
  }
}

export async function loadAreaData(): Promise<DataBundle> {
  const [
    mainRows,
    areaBaseRows,
    featureRows,
    hotspotRows,
    nationalRows,
    underusedRows,
    polygonPreview,
    municipalityItems,
    modelConfig,
    dataDictionary,
    viewDefinitions,
    readme
  ] = await Promise.all([
    loadCsv("jspi_area_scores.csv"),
    loadCsv("area_base.csv", false),
    loadCsv("area_features.csv", false),
    loadCsv("campaign_hotspots.csv"),
    loadCsv("national_absolute_potential.csv"),
    loadCsv("underused_transit_potential.csv"),
    loadJson("area_polygons_preview.json"),
    loadJson("municipalities_2026.json"),
    loadJson("model_config.json"),
    loadCsv("data_dictionary.csv", false),
    loadText("VIEW_DEFINITIONS.md"),
    loadText("README_FOR_CODEX.md")
  ]);

  const areaBaseByArea = keyedRows(areaBaseRows);
  const nationalByArea = keyedRows(nationalRows);
  const underusedByArea = keyedRows(underusedRows);
  const featuresByArea = keyedRows(featureRows);
  const polygonByArea = buildPolygonMap(polygonPreview);
  const municipalityByCode = buildMunicipalityMap(municipalityItems);
  const hotspotRecords = hotspotRows.map((row) => parseArea(row) as HotspotRecord);
  const hotspotByArea = new Map<string, HotspotRecord>();

  for (const hotspot of hotspotRecords) {
    const existing = hotspotByArea.get(hotspot.area_id);
    if (!existing || (hotspot.hotspot_rank ?? Infinity) < (existing.hotspot_rank ?? Infinity)) {
      hotspotByArea.set(hotspot.area_id, {
        ...hotspot,
        isHotspot: true,
        hotspot_rank: hotspot.hotspot_rank ?? 9999
      });
    }
  }

  const areas = mainRows
    .map((row) => {
      const area = parseArea(row);
      const areaBase = areaBaseByArea.get(area.area_id);
      const features = featuresByArea.get(area.area_id);
      const national = nationalByArea.get(area.area_id);
      const underused = underusedByArea.get(area.area_id);

      area.raw = { ...area.raw, ...areaBaseRaw(areaBase) };
      mergeNumeric(area, areaBase, ["area_m2", "area_km2"]);
      area.polygon_rings = polygonByArea.get(area.area_id) ?? [];
      area.municipality_name = municipalityByCode.get(area.municipality_code) ?? area.municipality_code;
      area.raw.municipality_name = area.municipality_name;
      mergeRaw(area, features);
      mergeRaw(area, national);
      mergeRaw(area, underused);
      mergeNumeric(area, national, [
        "national_absolute_potential_score",
        "national_absolute_potential_rank",
        "estimated_switchers"
      ]);
      mergeNumeric(area, underused, [
        "underused_transit_potential_score",
        "underused_transit_potential_rank",
        "car_pressure_score",
        "public_transport_service_score",
        "accessibility_score",
        "travel_time_competitiveness_score_final"
      ]);
      mergeText(area, national, ["recommended_campaign_type", "recommendation_reason", "data_confidence_level"]);
      mergeText(area, underused, ["recommended_campaign_type", "recommendation_reason", "data_confidence_level"]);

      const hotspot = hotspotByArea.get(area.area_id);
      if (hotspot) {
        area.raw = { ...area.raw, ...hotspot.raw };
        area.isHotspot = true;
        area.hotspot_rank = hotspot.hotspot_rank;
        area.hotspot_source_view = hotspot.hotspot_source_view;
        area.priority = hotspot.priority;
        area.campaign_lat = hotspot.campaign_lat;
        area.campaign_lon = hotspot.campaign_lon;
        area.campaign_point_type = hotspot.campaign_point_type;
      }

      area.data_confidence_level = area.data_confidence_level.toLowerCase();

      return area;
    })
    .filter((area) => Number.isFinite(area.lat) && Number.isFinite(area.lon));

  const municipalityPopulation = areas.reduce<Record<string, number>>((acc, area) => {
    acc[area.municipality_code] = (acc[area.municipality_code] ?? 0) + Math.max(0, area.population_final ?? 0);
    return acc;
  }, {});

  for (const area of areas) {
    area.municipality_population_total = municipalityPopulation[area.municipality_code] ?? 0;
    area.raw.municipality_population_total = String(Math.round(area.municipality_population_total));
  }

  return {
    areas,
    hotspots: Array.from(hotspotByArea.values()),
    loadedFiles: [
      "jspi_area_scores.csv",
      ...(areaBaseRows.length ? ["area_base.csv"] : []),
      ...(polygonByArea.size ? ["area_polygons_preview.json"] : []),
      ...(municipalityByCode.size ? ["municipalities_2026.json"] : []),
      ...(featureRows.length ? ["area_features.csv"] : []),
      "campaign_hotspots.csv",
      "national_absolute_potential.csv",
      "underused_transit_potential.csv",
      "model_config.json",
      "data_dictionary.csv",
      "VIEW_DEFINITIONS.md",
      "README_FOR_CODEX.md"
    ],
    modelConfig,
    dataDictionary: dataDictionary.map((row) => rowToRaw(row)),
    viewDefinitions,
    readme
  };
}
