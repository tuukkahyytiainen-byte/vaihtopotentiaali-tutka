import { RotateCcw, Search } from "lucide-react";
import type { AnalysisView, Filters } from "../types";
import { VIEW_CONFIGS } from "../lib/labels";
import { HelpBox } from "./HelpBox";

interface ControlPanelProps {
  activeView: AnalysisView;
  filters: Filters;
  campaignTypes: string[];
  onViewChange: (view: AnalysisView) => void;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
}

export function ControlPanel({
  activeView,
  filters,
  campaignTypes,
  onViewChange,
  onFiltersChange,
  onReset
}: ControlPanelProps) {
  function update(partial: Partial<Filters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  const municipalitySizeOptions: Array<{ value: Filters["municipalitySize"]; label: string; hint: string }> = [
    { value: "all", label: "Kaikki", hint: "Parhaat alueet koko aineistosta." },
    { value: "large", label: "Isot kunnat", hint: "Kunnat, joissa on vähintään 50 000 asukasta." },
    { value: "small", label: "Pienet kunnat", hint: "Kunnat, joissa on alle 50 000 asukasta." }
  ];

  return (
    <aside className="space-y-4 p-4">
      <section>
        <h2 className="text-lg font-semibold text-slate-950">Mitä haluat löytää?</h2>
        <div className="mt-3 grid gap-2">
          {(Object.keys(VIEW_CONFIGS) as AnalysisView[]).map((view) => {
            const config = VIEW_CONFIGS[view];
            const active = activeView === view;
            return (
              <button
                key={view}
                type="button"
                onClick={() => onViewChange(view)}
                className={`rounded-lg border p-3 text-left transition ${
                  active
                    ? "border-sky-500 bg-sky-50 text-slate-950 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                }`}
              >
                <span className="text-sm font-semibold">{config.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">{config.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">Parhaat alueet</div>
          <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
            {municipalitySizeOptions.map((option) => {
              const active = filters.municipalitySize === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update({ municipalitySize: option.value })}
                  title={option.hint}
                  className={`rounded-md px-2 py-2 text-xs font-semibold transition ${
                    active ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="area-search" className="text-sm font-semibold text-slate-800">
            Hae aluetta
          </label>
          <div className="relative mt-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="area-search"
              value={filters.searchText}
              onChange={(event) => update({ searchText: event.target.value })}
              placeholder="Alue, postinumero tai kunta"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-sky-200 focus:ring-2"
            />
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.onlyHotspots}
            onChange={(event) => update({ onlyHotspots: event.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600"
          />
          <span>
            <span className="block font-semibold text-slate-900">Näytä vain parhaat kampanja-alueet</span>
            <span className="text-xs text-slate-500">Rajaa kartan valmiiksi korostettuihin kohteisiin.</span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.showMapLabels}
            onChange={(event) => update({ showMapLabels: event.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600"
          />
          <span>
            <span className="block font-semibold text-slate-900">Näytä kuntien ja postinumeroiden nimet</span>
            <span className="text-xs text-slate-500">Piilota nimilaput, jos haluat rauhallisemman kartan.</span>
          </span>
        </label>

        <div>
          <label htmlFor="campaign-filter" className="text-sm font-semibold text-slate-800">
            Kampanjatyyppi
          </label>
          <select
            id="campaign-filter"
            value={filters.campaignType}
            onChange={(event) => update({ campaignType: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-200 focus:ring-2"
          >
            <option value="all">Kaikki kampanjat</option>
            {campaignTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw size={15} aria-hidden="true" />
          Nollaa valinnat
        </button>
      </section>

      <HelpBox text={VIEW_CONFIGS[activeView].interpretation} />
    </aside>
  );
}
