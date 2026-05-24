import { Info } from "lucide-react";
import type { AreaRecord, MetricKey } from "../types";
import { barTone } from "../lib/colors";
import { formatScore } from "../lib/format";
import { getMetricExplanation, getMetricLabel } from "../lib/labels";

interface ScoreBarsProps {
  area: AreaRecord;
}

const barMetrics: MetricKey[] = [
  "car_pressure_score",
  "public_transport_service_score",
  "accessibility_score",
  "travel_time_competitiveness_score_final",
  "jspi_score"
];

function percentWidth(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0%";
  }

  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.max(0, Math.min(100, normalized))}%`;
}

export function ScoreBars({ area }: ScoreBarsProps) {
  return (
    <div className="space-y-3">
      {barMetrics.map((metric) => {
        const value = area[metric];
        return (
          <div key={metric}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-sm font-medium text-slate-800">{getMetricLabel(metric)}</span>
                <span className="shrink-0 text-slate-400" title={getMetricExplanation(metric)}>
                  <Info size={14} aria-hidden="true" />
                </span>
              </div>
              <span className="shrink-0 text-sm font-semibold text-slate-950">{formatScore(value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${barTone(value)}`} style={{ width: percentWidth(value) }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
