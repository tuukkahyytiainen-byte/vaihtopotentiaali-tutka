import type { AreaRecord, MetricKey } from "../types";

const stops = [
  { t: 0, color: [219, 234, 254] },
  { t: 0.45, color: [251, 191, 36] },
  { t: 0.75, color: [239, 68, 68] },
  { t: 1, color: [147, 51, 234] }
];

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function interpolate(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function rgbToHex(rgb: number[]): string {
  return `#${rgb.map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

export function colorForNormalized(value: number): string {
  const t = clamp(value);
  const upperIndex = stops.findIndex((stop) => stop.t >= t);
  if (upperIndex <= 0) {
    return rgbToHex(stops[0].color);
  }

  const lower = stops[upperIndex - 1];
  const upper = stops[upperIndex];
  const localT = (t - lower.t) / (upper.t - lower.t);
  return rgbToHex([
    interpolate(lower.color[0], upper.color[0], localT),
    interpolate(lower.color[1], upper.color[1], localT),
    interpolate(lower.color[2], upper.color[2], localT)
  ]);
}

export function metricValue(area: AreaRecord, metric: MetricKey): number | null {
  const value = area[metric];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeMetricValue(value: number | null, metric: MetricKey, maxSwitchers: number): number {
  if (value === null || Number.isNaN(value)) {
    return 0;
  }

  if (metric === "estimated_switchers") {
    return clamp(value / Math.max(maxSwitchers, 1));
  }

  if (
    metric === "car_pressure_score" ||
    metric === "public_transport_service_score" ||
    metric === "accessibility_score" ||
    metric === "travel_time_competitiveness_score_final" ||
    metric === "data_confidence_score"
  ) {
    return clamp(value <= 1 ? value : value / 100);
  }

  return clamp(value / 100);
}

export function metricColor(area: AreaRecord, metric: MetricKey, maxSwitchers: number): string {
  return colorForNormalized(normalizeMetricValue(metricValue(area, metric), metric, maxSwitchers));
}

export function markerRadius(estimatedSwitchers: number, maxSwitchers: number, isHotspot = false): number {
  const normalized = Math.sqrt(Math.max(0, estimatedSwitchers) / Math.max(maxSwitchers, 1));
  return Math.round((isHotspot ? 7 : 5) + normalized * (isHotspot ? 13 : 10));
}

export function confidenceTone(level: string): string {
  const normalized = level.toLowerCase();
  if (normalized.includes("korkea")) {
    return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  }
  if (normalized.includes("matala")) {
    return "bg-rose-50 text-rose-800 ring-rose-200";
  }
  if (normalized.includes("keskitaso")) {
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

export function barTone(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "bg-slate-300";
  }
  const normalized = value <= 1 ? value : value / 100;
  if (normalized >= 0.75) {
    return "bg-fuchsia-600";
  }
  if (normalized >= 0.45) {
    return "bg-orange-500";
  }
  return "bg-sky-300";
}
