import type { MetricKey } from "../types";
import { getMetricLabel } from "../lib/labels";

interface MapLegendProps {
  metric: MetricKey;
}

export function MapLegend({ metric }: MapLegendProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 p-3 text-xs text-slate-600 shadow-soft backdrop-blur">
      <div className="font-semibold text-slate-950">{getMetricLabel(metric)}</div>
      <div className="mt-2 h-2 w-44 rounded-full bg-gradient-to-r from-blue-100 via-orange-400 to-fuchsia-700" />
      <div className="mt-1 flex justify-between text-[11px]">
        <span>Matala</span>
        <span>Keskitaso</span>
        <span>Korkea</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="inline-flex h-3 w-5 rounded-sm border-2 border-fuchsia-700 bg-fuchsia-200" />
        <span>Violetti reuna = kampanja-hotspot</span>
      </div>
      <div className="mt-1 flex items-center gap-3">
        <span className="inline-flex h-3 w-5 rounded-sm border border-slate-300 bg-sky-100" />
        <span>Muoto ja koko = postinumeroalueen pinta-ala</span>
      </div>
    </div>
  );
}
