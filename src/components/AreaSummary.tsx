import { ChevronRight } from "lucide-react";
import type { AreaRecord, MetricKey } from "../types";
import { buildActionText, buildReasonText } from "../lib/explanations";
import { formatArea, formatNumber, formatScore } from "../lib/format";
import { getMetricExplanation, getMetricLabel } from "../lib/labels";
import { ScoreBars } from "./ScoreBars";

interface AreaSummaryProps {
  area: AreaRecord | null;
  metric: MetricKey;
  onShowDetails: () => void;
}

export function AreaSummary({ area, metric, onShowDetails }: AreaSummaryProps) {
  if (!area) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-950">Valitse alue</h2>
        <p className="mt-1 text-sm text-slate-600">Klikkaa kartalta postinumeroaluetta tai ranking-listasta aluetta.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-slate-950">{area.area_name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Postinumero {area.postal_code} · {area.municipality_name}
            </p>
        </div>

        <div className="mt-4 grid gap-3 2xl:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase text-slate-500">{getMetricLabel(metric)}</div>
            <div className="mt-1 text-3xl font-semibold text-slate-950">{formatScore(area[metric])}</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{getMetricExplanation(metric)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase text-slate-500">Arvio vaihtajista</div>
            <div className="mt-1 text-3xl font-semibold text-slate-950">{formatNumber(area.estimated_switchers)}</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">Suuntaa-antava arvio ihmisistä, joille viesti voisi osua.</p>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase text-slate-500">Postinumeroalueen pinta-ala</div>
          <div className="mt-1 text-lg font-semibold text-slate-950">{formatArea(area.area_km2)}</div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Kartalla alue näkyy omana todellisena aluepintanaan, ei samankokoisena pisteenä.
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Suositeltu kampanja</div>
            <div className="mt-1 text-sm font-semibold text-slate-950">{area.recommended_campaign_type}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Viestiehdotus</div>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{area.message_angle}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">Miksi tämä alue?</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{buildReasonText(area)}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">Mitä tällä voisi tehdä?</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{buildActionText(area)}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-950">Tärkeimmät tekijät</h3>
        <div className="mt-3">
          <ScoreBars area={area} />
        </div>
      </div>

      <button
        type="button"
        onClick={onShowDetails}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-slate-800"
      >
        <span>Katso tarkemmat tiedot</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </section>
  );
}
