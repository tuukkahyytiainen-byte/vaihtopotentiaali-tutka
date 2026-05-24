import type { AreaRecord } from "../types";
import { formatNumber, formatScore } from "../lib/format";
import { getMetricLabel } from "../lib/labels";
import type { MetricKey } from "../types";

interface KpiStripProps {
  visibleAreas: number;
  totalSwitchers: number;
  topArea: AreaRecord | null;
  metric: MetricKey;
}

export function KpiStrip({ visibleAreas, totalSwitchers, topArea, metric }: KpiStripProps) {
  return (
    <div className="grid w-full grid-cols-3 overflow-hidden rounded-lg border border-white/70 bg-white/95 shadow-soft backdrop-blur">
      <div className="border-r border-slate-200 px-3 py-2">
        <div className="text-[11px] font-semibold uppercase text-slate-500">Näkyvissä olevat alueet</div>
        <div className="text-lg font-semibold text-slate-950">{formatNumber(visibleAreas)}</div>
      </div>
      <div className="border-r border-slate-200 px-3 py-2">
        <div className="text-[11px] font-semibold uppercase text-slate-500">Arvio vaihtajista yhteensä</div>
        <div className="text-lg font-semibold text-slate-950">{formatNumber(totalSwitchers)}</div>
      </div>
      <div className="px-3 py-2">
        <div className="text-[11px] font-semibold uppercase text-slate-500">Korkein potentiaali</div>
        <div className="truncate text-lg font-semibold text-slate-950">
          {topArea ? formatScore(topArea[metric]) : "Ei tietoa"}
        </div>
        <div className="truncate text-[11px] text-slate-500">{topArea ? `${topArea.area_name} · ${getMetricLabel(metric)}` : ""}</div>
      </div>
    </div>
  );
}
