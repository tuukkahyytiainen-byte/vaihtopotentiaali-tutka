import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import type { AreaRecord, MetricKey } from "../types";
import {
  confidenceExplanation,
  explainCommutingSource,
  explainMissingReasons,
  nearestPlaceSummary
} from "../lib/explanations";
import { formatArea, formatDistance, formatNumber, formatPercent, formatScore } from "../lib/format";
import { getMetricExplanation, getMetricLabel } from "../lib/labels";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { RawFieldsTable } from "./RawFieldsTable";

interface AreaDrilldownProps {
  area: AreaRecord;
  onClose: () => void;
}

type DrilldownTab = "scoring" | "transport" | "population" | "confidence" | "raw";

const tabs: Array<{ id: DrilldownTab; label: string }> = [
  { id: "scoring", label: "Pisteiden laskenta" },
  { id: "transport", label: "Liikenne ja joukkoliikenne" },
  { id: "population", label: "Väestö ja potentiaali" },
  { id: "confidence", label: "Datan luotettavuus" },
  { id: "raw", label: "Raakakentät" }
];

const scoringMetrics: MetricKey[] = [
  "estimated_switchers",
  "car_pressure_score",
  "public_transport_service_score",
  "accessibility_score",
  "travel_time_competitiveness_score_final",
  "jspi_score",
  "national_absolute_potential_score",
  "underused_transit_potential_score"
];

function ValueRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-slate-950">{value}</div>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  );
}

function formatMetricValue(area: AreaRecord, metric: MetricKey): string {
  if (metric === "estimated_switchers") {
    return formatNumber(area[metric]);
  }
  return formatScore(area[metric]);
}

export function AreaDrilldown({ area, onClose }: AreaDrilldownProps) {
  const [activeTab, setActiveTab] = useState<DrilldownTab>("scoring");

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Takaisin perusselitykseen
      </button>

      <div>
        <h2 className="text-lg font-semibold text-slate-950">Tarkemmat tiedot</h2>
        <p className="text-sm text-slate-500">
          {area.area_name} · {area.postal_code} · {area.municipality_name}
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition ${
              activeTab === tab.id ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "scoring" ? (
        <div className="space-y-3">
          <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700">
            Kokonaispotentiaali lasketaan yhdistämällä viisi tekijää: mahdollisten vaihtajien määrä,
            joukkoliikenteen palvelutaso, autoilun paine, pysäkkien, asemien ja liityntäpysäköinnin läheisyys sekä
            datan perusteella arvioitu kampanjan toteutettavuus.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {scoringMetrics.map((metric) => (
              <div key={metric} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-sm font-semibold text-slate-950">{getMetricLabel(metric)}</div>
                <div className="mt-1 text-xl font-semibold text-slate-950">{formatMetricValue(area, metric)}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{getMetricExplanation(metric)}</p>
                <div className="mt-2 font-mono text-[11px] text-slate-400">{metric}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "transport" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueRow label="Autoilun paine" value={formatScore(area.car_pressure_score)} />
            <ValueRow label="Joukkoliikenteen tarjonta" value={formatScore(area.public_transport_service_score)} />
            <ValueRow label="Lähin pysäkki" value={formatDistance(area.nearest_transit_stop_distance_m)} />
            <ValueRow label="Lähin asema" value={formatDistance(area.rail_nearest_distance_m)} />
            <ValueRow label="Lähin liityntäpysäköinti" value={formatDistance(area.liipi_nearest_distance_m)} />
            <ValueRow
              label="Matka-ajan kilpailukyky"
              value={formatScore(area.travel_time_competitiveness_score_final)}
            />
          </div>
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{nearestPlaceSummary(area)}</p>
        </div>
      ) : null}

      {activeTab === "population" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueRow label="Väestö" value={formatNumber(area.population_final)} />
            <ValueRow label="Työlliset asukkaat" value={formatNumber(area.employed_residents_final)} />
            <ValueRow label="Arvio työmatkalaisista" value={formatNumber(area.estimated_commuters_base)} />
            <ValueRow label="Arvio mahdollisista vaihtajista" value={formatNumber(area.estimated_switchers)} />
            <ValueRow label="Arvioitu auton käyttöosuus" value={formatPercent(area.estimated_car_commute_share)} />
            <ValueRow label="Postinumeroalueen pinta-ala" value={formatArea(area.area_km2)} />
          </div>
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
            Mahdolliset vaihtajat on mallin arvio. Se ei tarkoita, että näin moni varmasti vaihtaisi kulkutapaa.
          </p>
        </div>
      ) : null}

      {activeTab === "confidence" ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase text-slate-500">Datan luotettavuus</div>
                <div className="mt-1 text-sm text-slate-600">{confidenceExplanation(area.data_confidence_level)}</div>
              </div>
              <ConfidenceBadge level={area.data_confidence_level} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueRow label="Luotettavuuden numero" value={formatScore(area.data_confidence_score)} />
            <ValueRow label="Työmatkadatan lähde" value={explainCommutingSource(area.commuting_data_source)} />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-sm font-semibold text-slate-950">Puuttuvat signaalit</div>
            <div className="mt-2 space-y-2">
              {explainMissingReasons(area.confidence_missing_reasons).map((reason) => (
                <div key={reason} className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {reason}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "raw" ? <RawFieldsTable area={area} /> : null}
    </section>
  );
}
