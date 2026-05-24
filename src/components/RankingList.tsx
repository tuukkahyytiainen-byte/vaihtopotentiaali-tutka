import { useState } from "react";
import type { AreaRecord, MetricKey } from "../types";
import { formatNumber, formatScore } from "../lib/format";
import { getMetricLabel } from "../lib/labels";

interface RankingListProps {
  areas: AreaRecord[];
  selectedAreaId: string | null;
  metric: MetricKey;
  onSelect: (area: AreaRecord) => void;
}

export function RankingList({ areas, selectedAreaId, metric, onSelect }: RankingListProps) {
  const [limit, setLimit] = useState(10);
  const visible = areas.slice(0, limit);

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Parhaat alueet</h2>
          <p className="text-xs text-slate-500">Järjestetty: {getMetricLabel(metric)}</p>
        </div>
        <button
          type="button"
          onClick={() => setLimit(limit === 10 ? 50 : 10)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {limit === 10 ? "Näytä top 50" : "Näytä top 10"}
        </button>
      </div>

      <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto xl:max-h-[calc(100vh-180px)]">
        {visible.map((area, index) => {
          const selected = selectedAreaId === area.area_id;
          return (
            <button
              key={area.area_id}
              type="button"
              onClick={() => onSelect(area)}
              className={`grid w-full grid-cols-[36px_minmax(0,1fr)] gap-3 px-4 py-3 text-left transition ${
                selected ? "bg-sky-50" : "hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  selected ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {index + 1}
              </div>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-950">{area.area_name}</div>
                    <div className="text-xs text-slate-500">
                      {area.postal_code} · {area.municipality_name} · {formatNumber(area.estimated_switchers)} vaihtajaa
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-sm font-semibold text-slate-950">{formatScore(area[metric])}</div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {area.recommended_campaign_type}
                  </span>
                  {area.isHotspot ? (
                    <span className="rounded-full bg-fuchsia-50 px-2 py-0.5 text-[11px] font-semibold text-fuchsia-700 ring-1 ring-fuchsia-100">
                      hotspot
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
        {!visible.length ? (
          <div className="px-4 py-6 text-sm text-slate-500">Ei alueita valituilla rajauksilla.</div>
        ) : null}
      </div>
    </section>
  );
}
