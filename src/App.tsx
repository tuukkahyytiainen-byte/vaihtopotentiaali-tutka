import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { AnalysisView, AreaRecord, Filters } from "./types";
import { AreaDrilldown } from "./components/AreaDrilldown";
import { AreaSummary } from "./components/AreaSummary";
import { ControlPanel } from "./components/ControlPanel";
import { Layout, type MobileTab } from "./components/Layout";
import { MapPanel } from "./components/MapPanel";
import { RankingList } from "./components/RankingList";
import { loadAreaData } from "./lib/data";
import { applyFilters, computeKpis, getCampaignTypes, sortAreas } from "./lib/filters";
import { getViewMetric } from "./lib/labels";

const defaultFilters: Filters = {
  searchText: "",
  campaignType: "all",
  onlyHotspots: false,
  municipalitySize: "all",
  showMapLabels: true
};

export default function App() {
  const [areas, setAreas] = useState<AreaRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AnalysisView>("overall");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [mapFocusAreaId, setMapFocusAreaId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("map");

  useEffect(() => {
    let cancelled = false;

    loadAreaData()
      .then((bundle) => {
        if (cancelled) {
          return;
        }
        setAreas(bundle.areas);
        setSelectedAreaId(bundle.areas[0]?.area_id ?? null);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Datan lataus epäonnistui.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const metric = getViewMetric(activeView);
  const campaignTypes = useMemo(() => getCampaignTypes(areas), [areas]);
  const filteredAreas = useMemo(() => applyFilters(areas, filters), [areas, filters]);
  const rankedAreas = useMemo(() => sortAreas(filteredAreas, metric), [filteredAreas, metric]);
  const kpis = useMemo(() => computeKpis(rankedAreas, metric), [rankedAreas, metric]);
  const maxSwitchers = useMemo(
    () => areas.reduce((max, area) => Math.max(max, area.estimated_switchers), 0),
    [areas]
  );
  const selectedArea = useMemo(
    () => rankedAreas.find((area) => area.area_id === selectedAreaId) ?? rankedAreas[0] ?? null,
    [rankedAreas, selectedAreaId]
  );

  useEffect(() => {
    if (!rankedAreas.length) {
      setSelectedAreaId(null);
      return;
    }

    if (!selectedAreaId || !rankedAreas.some((area) => area.area_id === selectedAreaId)) {
      setSelectedAreaId(rankedAreas[0].area_id);
    }
  }, [rankedAreas, selectedAreaId]);

  function selectArea(area: AreaRecord, openDetails = false) {
    setSelectedAreaId(area.area_id);
    setMapFocusAreaId(area.area_id);
    setDetailsOpen(openDetails);
    setMobileTab("details");
  }

  function changeView(view: AnalysisView) {
    setActiveView(view);
    setMapFocusAreaId(null);
    setDetailsOpen(false);
    setMobileTab("map");
  }

  function resetFilters() {
    setFilters(defaultFilters);
    setMapFocusAreaId(null);
    setDetailsOpen(false);
    setMobileTab("map");
  }

  if (isLoading) {
    return (
      <main className="flex h-screen items-center justify-center bg-slate-50 p-6 text-slate-700">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-soft">
          <Loader2 className="animate-spin text-sky-700" size={22} aria-hidden="true" />
          <span className="font-medium">Ladataan Vaihtopotentiaali Tutkan aineistoa...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex h-screen items-center justify-center bg-slate-50 p-6">
        <section className="max-w-xl rounded-lg border border-rose-200 bg-white p-6 shadow-soft">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-1 text-rose-600" size={24} aria-hidden="true" />
            <div>
              <h1 className="text-xl font-semibold text-slate-950">Dataa ei voitu ladata</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{error}</p>
              <p className="mt-3 text-sm text-slate-500">
                Sovellus lukee CSV- ja JSON-tiedostot staattisesti kansiosta public/data.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const left = (
    <ControlPanel
      activeView={activeView}
      filters={filters}
      campaignTypes={campaignTypes}
      onViewChange={changeView}
      onFiltersChange={setFilters}
      onReset={resetFilters}
    />
  );

  const map = (
    <MapPanel
      areas={rankedAreas}
      municipalityContextAreas={areas}
      selectedArea={selectedArea}
      focusArea={selectedArea?.area_id === mapFocusAreaId ? selectedArea : null}
      metric={metric}
      maxSwitchers={maxSwitchers}
      totalSwitchers={kpis.totalSwitchers}
      topArea={kpis.topArea}
      activeView={activeView}
      showLabels={filters.showMapLabels}
      onSelect={(area) => selectArea(area)}
    />
  );

  const right = (
    <div className="grid w-full gap-4 xl:grid-cols-[minmax(340px,1fr)_300px] xl:items-start 2xl:grid-cols-[minmax(400px,1fr)_320px]">
      <div className="min-w-0">
        {detailsOpen && selectedArea ? (
          <AreaDrilldown area={selectedArea} onClose={() => setDetailsOpen(false)} />
        ) : (
          <AreaSummary area={selectedArea} metric={metric} onShowDetails={() => setDetailsOpen(true)} />
        )}
      </div>
      <div className="min-w-0 xl:sticky xl:top-0">
        <RankingList
          areas={rankedAreas}
          selectedAreaId={selectedArea?.area_id ?? null}
          metric={metric}
          onSelect={selectArea}
        />
      </div>
    </div>
  );

  return <Layout left={left} map={map} right={right} mobileTab={mobileTab} onMobileTabChange={setMobileTab} />;
}
