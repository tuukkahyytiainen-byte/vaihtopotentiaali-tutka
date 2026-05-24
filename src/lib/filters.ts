import type { AreaRecord, Filters, KpiSummary, MetricKey } from "../types";

const LARGE_MUNICIPALITY_POPULATION = 50_000;

export function getAreaMetric(area: AreaRecord, metric: MetricKey): number {
  const value = area[metric];
  return typeof value === "number" && Number.isFinite(value) ? value : -Infinity;
}

export function applyFilters(areas: AreaRecord[], filters: Filters): AreaRecord[] {
  const query = filters.searchText.trim().toLowerCase();

  return areas.filter((area) => {
    if (query) {
      const haystack =
        `${area.area_name} ${area.postal_code} ${area.area_id} ${area.municipality_name} ${area.municipality_code}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (filters.onlyHotspots && !area.isHotspot) {
      return false;
    }

    if (
      filters.municipalitySize === "large" &&
      area.municipality_population_total < LARGE_MUNICIPALITY_POPULATION
    ) {
      return false;
    }

    if (
      filters.municipalitySize === "small" &&
      area.municipality_population_total >= LARGE_MUNICIPALITY_POPULATION
    ) {
      return false;
    }

    if (filters.campaignType !== "all" && area.recommended_campaign_type !== filters.campaignType) {
      return false;
    }

    return true;
  });
}

export function sortAreas(areas: AreaRecord[], metric: MetricKey): AreaRecord[] {
  return [...areas].sort((a, b) => {
    const diff = getAreaMetric(b, metric) - getAreaMetric(a, metric);
    if (diff !== 0) {
      return diff;
    }
    return b.estimated_switchers - a.estimated_switchers;
  });
}

export function computeKpis(visibleAreas: AreaRecord[], metric: MetricKey): KpiSummary {
  const ranked = sortAreas(visibleAreas, metric);
  const metricValues = visibleAreas.map((area) => getAreaMetric(area, metric)).filter(Number.isFinite);

  return {
    totalAreas: visibleAreas.length,
    visibleAreas: visibleAreas.length,
    totalSwitchers: visibleAreas.reduce((sum, area) => sum + Math.max(0, area.estimated_switchers), 0),
    highestJspi: metricValues.length ? Math.max(...metricValues) : 0,
    medianJspi: 0,
    topArea: ranked[0] ?? null,
    confidenceCounts: {}
  };
}

export function getCampaignTypes(areas: AreaRecord[]): string[] {
  return Array.from(new Set(areas.map((area) => area.recommended_campaign_type).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "fi")
  );
}
