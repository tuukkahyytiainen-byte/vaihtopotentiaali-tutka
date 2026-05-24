import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents
} from "react-leaflet";
import type { LatLngBounds, LatLngExpression } from "leaflet";
import type { AreaRecord, MetricKey } from "../types";
import { metricColor, metricValue } from "../lib/colors";
import { formatArea, formatDistance, formatNumber, formatScore } from "../lib/format";
import { VIEW_CONFIGS, getMetricLabel } from "../lib/labels";
import { KpiStrip } from "./KpiStrip";
import { MapLegend } from "./MapLegend";

interface MapPanelProps {
  areas: AreaRecord[];
  municipalityContextAreas: AreaRecord[];
  selectedArea: AreaRecord | null;
  focusArea: AreaRecord | null;
  metric: MetricKey;
  maxSwitchers: number;
  totalSwitchers: number;
  topArea: AreaRecord | null;
  activeView: keyof typeof VIEW_CONFIGS;
  showLabels: boolean;
  onSelect: (area: AreaRecord) => void;
}

const MUNICIPALITY_BORDER_MIN_ZOOM = 5;
const MUNICIPALITY_LABEL_MIN_ZOOM = 7;
const POSTAL_LABEL_MIN_ZOOM = 10;
const MAX_VISIBLE_MUNICIPALITY_LABELS = 80;
const MAX_VISIBLE_POSTAL_LABELS = 120;
const INITIAL_MAP_ZOOM = 7;

type BoundarySegment = [[number, number], [number, number]];

interface MunicipalityLabel {
  code: string;
  name: string;
  position: [number, number];
  population: number;
}

interface MapViewport {
  zoom: number;
  bounds: LatLngBounds | null;
}

function areaPosition(area: AreaRecord): [number, number] {
  return [area.campaign_lat ?? area.lat, area.campaign_lon ?? area.lon];
}

function markerPosition(area: AreaRecord): LatLngExpression {
  return areaPosition(area);
}

function coordinateKey(point: [number, number]): string {
  return `${point[0].toFixed(5)},${point[1].toFixed(5)}`;
}

function boundaryKey(start: [number, number], end: [number, number]): string {
  const startKey = coordinateKey(start);
  const endKey = coordinateKey(end);
  return startKey < endKey ? `${startKey}|${endKey}` : `${endKey}|${startKey}`;
}

function buildMunicipalityBoundarySegments(areas: AreaRecord[]): BoundarySegment[] {
  const edges = new Map<string, { segment: BoundarySegment; municipalities: Set<string> }>();

  for (const area of areas) {
    for (const ring of area.polygon_rings) {
      for (let index = 0; index < ring.length - 1; index += 1) {
        const start = ring[index];
        const end = ring[index + 1];
        if (!start || !end || coordinateKey(start) === coordinateKey(end)) {
          continue;
        }

        const key = boundaryKey(start, end);
        const existing = edges.get(key);
        if (existing) {
          existing.municipalities.add(area.municipality_code);
        } else {
          edges.set(key, {
            segment: [start, end],
            municipalities: new Set([area.municipality_code])
          });
        }
      }
    }
  }

  return Array.from(edges.values())
    .filter((edge) => edge.municipalities.size > 1)
    .map((edge) => edge.segment);
}

function buildMunicipalityLabels(areas: AreaRecord[]): MunicipalityLabel[] {
  const municipalities = new Map<
    string,
    { name: string; latSum: number; lonSum: number; weightSum: number; population: number }
  >();

  for (const area of areas) {
    const population = Math.max(0, area.population_final ?? 0);
    const weight = Math.max(1, population || area.estimated_switchers);
    const existing = municipalities.get(area.municipality_code);

    if (existing) {
      existing.latSum += area.lat * weight;
      existing.lonSum += area.lon * weight;
      existing.weightSum += weight;
      existing.population += population;
    } else {
      municipalities.set(area.municipality_code, {
        name: area.municipality_name,
        latSum: area.lat * weight,
        lonSum: area.lon * weight,
        weightSum: weight,
        population
      });
    }
  }

  return Array.from(municipalities.entries())
    .map(([code, municipality]) => ({
      code,
      name: municipality.name,
      position: [municipality.latSum / municipality.weightSum, municipality.lonSum / municipality.weightSum] as [number, number],
      population: municipality.population
    }))
    .sort((first, second) => second.population - first.population);
}

function MapViewportTracker({ onChange }: { onChange: (viewport: MapViewport) => void }) {
  const map = useMapEvents({
    moveend() {
      onChange({ zoom: map.getZoom(), bounds: map.getBounds() });
    },
    zoomend() {
      onChange({ zoom: map.getZoom(), bounds: map.getBounds() });
    }
  });

  useEffect(() => {
    onChange({ zoom: map.getZoom(), bounds: map.getBounds() });
  }, [map, onChange]);

  return null;
}

function FlyToSelected({ area }: { area: AreaRecord | null }) {
  const map = useMap();

  useEffect(() => {
    if (area) {
      const polygonPoints = area.polygon_rings.flat();
      if (polygonPoints.length) {
        map.fitBounds(polygonPoints, {
          animate: true,
          duration: 0.7,
          maxZoom: 12,
          padding: [36, 36]
        });
      } else {
        map.flyTo(markerPosition(area), Math.max(map.getZoom(), 10), {
          duration: 0.7
        });
      }
    }
  }, [area, map]);

  return null;
}

export function MapPanel({
  areas,
  municipalityContextAreas,
  selectedArea,
  focusArea,
  metric,
  maxSwitchers,
  totalSwitchers,
  topArea,
  activeView,
  showLabels,
  onSelect
}: MapPanelProps) {
  const center = useMemo<LatLngExpression>(() => [61.35, 25.2], []);
  const [viewport, setViewport] = useState<MapViewport>({ zoom: INITIAL_MAP_ZOOM, bounds: null });
  const viewConfig = VIEW_CONFIGS[activeView];
  const municipalityBoundarySegments = useMemo(
    () => buildMunicipalityBoundarySegments(municipalityContextAreas),
    [municipalityContextAreas]
  );
  const municipalityLabels = useMemo(() => buildMunicipalityLabels(areas), [areas]);
  const handleViewportChange = useCallback((nextViewport: MapViewport) => {
    setViewport(nextViewport);
  }, []);
  const labeledAreaIds = useMemo(() => {
    const bounds = viewport.bounds;
    if (!showLabels || viewport.zoom < POSTAL_LABEL_MIN_ZOOM || !bounds) {
      return new Set<string>();
    }

    const visibleAreas = areas.filter((area) => bounds.contains(areaPosition(area)));
    const ids = new Set(visibleAreas.slice(0, MAX_VISIBLE_POSTAL_LABELS).map((area) => area.area_id));

    if (selectedArea && bounds.contains(areaPosition(selectedArea))) {
      ids.add(selectedArea.area_id);
    }

    return ids;
  }, [areas, selectedArea, showLabels, viewport.bounds, viewport.zoom]);
  const visibleMunicipalityLabels = useMemo(() => {
    const bounds = viewport.bounds;
    if (
      !showLabels ||
      viewport.zoom < MUNICIPALITY_LABEL_MIN_ZOOM ||
      viewport.zoom >= POSTAL_LABEL_MIN_ZOOM ||
      !bounds
    ) {
      return [];
    }

    return municipalityLabels
      .filter((municipality) => bounds.contains(municipality.position))
      .slice(0, MAX_VISIBLE_MUNICIPALITY_LABELS);
  }, [municipalityLabels, showLabels, viewport.bounds, viewport.zoom]);

  return (
    <section className="relative h-full min-h-0 overflow-hidden bg-slate-100">
      <MapContainer
        center={center}
        zoom={INITIAL_MAP_ZOOM}
        minZoom={4}
        maxZoom={14}
        zoomControl={false}
        preferCanvas
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <MapViewportTracker onChange={handleViewportChange} />
        <FlyToSelected area={focusArea} />

        {areas.map((area) => {
          const selected = selectedArea?.area_id === area.area_id;
          const showLabel = labeledAreaIds.has(area.area_id);
          const color = metricColor(area, metric, maxSwitchers);
          const borderColor = selected ? "#0f172a" : area.isHotspot ? "#86198f" : "#ffffff";
          const polygonOptions = {
            color: borderColor,
            fillColor: color,
            fillOpacity: selected ? 0.68 : 0.44,
            opacity: selected || area.isHotspot ? 0.95 : 0.72,
            weight: selected ? 3 : area.isHotspot ? 2 : 1
          };
          return (
            <Fragment key={area.area_id}>
              {area.polygon_rings.length ? (
                area.polygon_rings.map((ring, index) => (
                  <Polygon
                    key={`${area.area_id}-${index}`}
                    positions={ring}
                    pathOptions={polygonOptions}
                    eventHandlers={{
                      click: () => onSelect(area)
                    }}
                  >
                    <Popup>
                      <div className="w-64 space-y-2">
                        <div>
                          <div className="text-base font-semibold text-slate-950">{area.area_name}</div>
                          <div className="text-xs text-slate-500">
                            {area.postal_code} · {area.municipality_name}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded bg-slate-50 p-2">
                            <div className="text-[11px] font-semibold uppercase text-slate-500">{getMetricLabel(metric)}</div>
                            <div className="text-sm font-semibold text-slate-950">
                              {formatScore(metricValue(area, metric))}
                            </div>
                          </div>
                          <div className="rounded bg-slate-50 p-2">
                            <div className="text-[11px] font-semibold uppercase text-slate-500">Pinta-ala</div>
                            <div className="text-sm font-semibold text-slate-950">{formatArea(area.area_km2)}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded bg-slate-50 p-2">
                            <div className="text-[11px] font-semibold uppercase text-slate-500">Vaihtajia</div>
                            <div className="text-sm font-semibold text-slate-950">{formatNumber(area.estimated_switchers)}</div>
                          </div>
                          <div className="rounded bg-slate-50 p-2">
                            <div className="text-[11px] font-semibold uppercase text-slate-500">Kunta</div>
                            <div className="truncate text-sm font-semibold text-slate-950">{area.municipality_name}</div>
                          </div>
                        </div>
                        <div className="text-xs leading-relaxed text-slate-700">
                          <strong className="text-slate-950">{area.recommended_campaign_type}</strong>
                          <br />
                          {area.message_angle}
                        </div>
                        {area.isHotspot ? (
                          <div className="flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-fuchsia-50 px-2 py-0.5 text-[11px] font-semibold text-fuchsia-700 ring-1 ring-fuchsia-100">
                              kampanja-hotspot
                            </span>
                          </div>
                        ) : null}
                        <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-500">
                          <span>pysäkki {formatDistance(area.nearest_transit_stop_distance_m)}</span>
                          <span>asema {formatDistance(area.rail_nearest_distance_m)}</span>
                          <span>liityntä {formatDistance(area.liipi_nearest_distance_m)}</span>
                        </div>
                      </div>
                    </Popup>
                    {showLabel && index === 0 ? (
                      <Tooltip permanent direction="center" opacity={0.94} className="postal-area-label">
                        {area.area_name}
                      </Tooltip>
                    ) : null}
                  </Polygon>
                ))
              ) : (
                <CircleMarker
                  center={markerPosition(area)}
                  radius={6}
                  pathOptions={{
                    color: borderColor,
                    fillColor: color,
                    fillOpacity: selected ? 0.9 : 0.7,
                    opacity: 1,
                    weight: selected ? 3 : 1
                  }}
                  eventHandlers={{
                    click: () => onSelect(area)
                  }}
                >
                  {showLabel ? (
                    <Tooltip permanent direction="top" offset={[0, -8]} opacity={0.94} className="postal-area-label">
                      {area.area_name}
                    </Tooltip>
                  ) : null}
                </CircleMarker>
              )}
            </Fragment>
          );
        })}

        {viewport.zoom >= MUNICIPALITY_BORDER_MIN_ZOOM && municipalityBoundarySegments.length ? (
          <Polyline
            positions={municipalityBoundarySegments}
            pathOptions={{
              color: "#1f2937",
              opacity: viewport.zoom >= POSTAL_LABEL_MIN_ZOOM ? 0.52 : 0.72,
              weight: viewport.zoom >= POSTAL_LABEL_MIN_ZOOM ? 1.4 : 1.8
            }}
            interactive={false}
          />
        ) : null}

        {visibleMunicipalityLabels.map((municipality) => (
          <CircleMarker
            key={municipality.code}
            center={municipality.position}
            radius={1}
            pathOptions={{ opacity: 0, fillOpacity: 0 }}
            interactive={false}
          >
            <Tooltip permanent direction="center" opacity={0.95} className="municipality-label">
              {municipality.name}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute left-3 right-3 top-3 z-[450] hidden md:block">
        <KpiStrip visibleAreas={areas.length} totalSwitchers={totalSwitchers} topArea={topArea} metric={metric} />
      </div>

      <div className="pointer-events-none absolute left-3 top-3 z-[450] max-w-[260px] rounded-lg border border-slate-200 bg-white/95 p-3 text-xs leading-relaxed text-slate-700 shadow-soft backdrop-blur md:top-24">
        <div className="font-semibold text-slate-950">{viewConfig.label}</div>
        <p className="mt-1">{viewConfig.mapSentence}</p>
        <p className="mt-2 text-slate-500">Alueen muoto ja koko vastaavat postinumeroalueen pinta-alaa.</p>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-[450] hidden sm:block">
        <MapLegend metric={metric} />
      </div>

      {!areas.length ? (
        <div className="absolute inset-0 z-[460] flex items-center justify-center bg-white/80 p-6 text-center backdrop-blur">
          <div>
            <div className="text-lg font-semibold text-slate-950">Ei alueita valituilla rajauksilla</div>
            <p className="mt-1 text-sm text-slate-600">Muuta hakua tai poista osa rajauksista.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
