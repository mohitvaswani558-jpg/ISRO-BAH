import { useEffect, useRef, useState, type ReactNode } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import { HOTSPOTS, HOTSPOT_META, type HotspotType } from "../lib/hotspots";

export interface IndiaMapProps {
  colorFor?: (name: string) => string | null;
  selected?: string | null;
  onSelect?: (name: string) => void;
  tooltip?: (name: string) => ReactNode;
  height?: number;
  className?: string;
  showLabels?: boolean;
  glowSelected?: boolean;
  interactive?: boolean;
  /** Show the hotspot layer toggle bar above the map */
  showHotspotToggle?: boolean;
  /** Default hotspot layer to show */
  defaultHotspot?: HotspotType | null;
}

// Free satellite + reference tile layers (no API key required)
const SATELLITE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const REFERENCE = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const TERRAIN = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}";
const STREET = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const GEOJSON_URL = "/india-states.geojson";

const HOTSPOT_TYPES: (HotspotType | "none")[] = ["none", "heat", "flood", "aqi", "crop"];

function sevColor(sev: number, base: string): string {
  return base;
}

export function IndiaMap({
  colorFor, selected, onSelect, tooltip, height = 560, className = "", showLabels = false, interactive = true,
  showHotspotToggle = true, defaultHotspot = null,
}: IndiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const labelLayerRef = useRef<L.LayerGroup | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const refLayerRef = useRef<L.TileLayer | null>(null);
  const hotspotLayerRef = useRef<L.LayerGroup | null>(null);
  const [ready, setReady] = useState(false);
  const [layerType, setLayerType] = useState<"satellite" | "street" | "terrain">("satellite");
  const [zoomLevel, setZoomLevel] = useState(5);
  const [hotspotType, setHotspotType] = useState<HotspotType | "none">(defaultHotspot ?? "none");

  // refs to latest props (avoid re-fetching geojson on every render)
  const colorForRef = useRef(colorFor);
  const selectedRef = useRef(selected);
  const onSelectRef = useRef(onSelect);
  const tooltipRef = useRef(tooltip);
  const interactiveRef = useRef(interactive);
  colorForRef.current = colorFor;
  selectedRef.current = selected;
  onSelectRef.current = onSelect;
  tooltipRef.current = tooltip;
  interactiveRef.current = interactive;

  const styleFor = (feature?: GeoJSON.Feature): L.PathOptions => {
    const name = feature?.properties?.st_nm ?? "";
    const fill = colorForRef.current ? colorForRef.current(name) : null;
    const isSel = selectedRef.current === name;
    return {
      fillColor: fill ?? "rgba(34,211,238,0.22)",
      fillOpacity: isSel ? 0.6 : 0.38,
      color: isSel ? "#facc15" : "#22d3ee",
      weight: isSel ? 3 : 1.3,
      opacity: 0.95,
      className: "india-state",
    };
  };

  // ---- init map once ----
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [22.5, 80],
      zoom: 4.6,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
    });
    mapRef.current = map;

    const sat = L.tileLayer(SATELLITE, { maxZoom: 18, attribution: "Esri, Maxar, Earthstar Geographics" });
    sat.addTo(map);
    baseLayerRef.current = sat;

    const ref = L.tileLayer(REFERENCE, { maxZoom: 18, opacity: 0.9 });
    ref.addTo(map);
    refLayerRef.current = ref;

    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.attributionControl.setPrefix("");
    map.on("zoomend", () => setZoomLevel(map.getZoom()));
    setZoomLevel(map.getZoom());
    setReady(true);

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ---- load geojson once ----
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    let cancelled = false;

    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !mapRef.current) return;

        const gl = L.geoJSON(data, {
          style: styleFor,
          onEachFeature: (feature, layer) => {
            const name: string = feature.properties?.st_nm ?? "";
            const ll = layer as L.Path;

            ll.on("mouseover", () => {
              ll.setStyle({ weight: 2.6, color: "#a5f3fc", fillOpacity: 0.55 });
              ll.bringToFront();
            });
            ll.on("mouseout", () => { ll.setStyle(styleFor(feature)); });
            ll.on("click", () => {
              onSelectRef.current?.(name);
              const bounds = (ll as L.Polygon).getBounds();
              map.flyToBounds(bounds, { padding: [40, 40], duration: 0.9, maxZoom: 7 });
            });

            const buildTip = (): string => {
              const t = tooltipRef.current;
              if (!t) return `<b style="color:#04263a;font-size:12px">${name}</b>`;
              const node = t(name);
              return typeof node === "string" ? node : renderToStaticMarkup(node as React.ReactElement);
            };
            ll.bindTooltip(buildTip, { sticky: true, direction: "top", className: "india-leaflet-tooltip", offset: [0, -8] });
          },
        });
        gl.addTo(map);
        geoLayerRef.current = gl;

        if (showLabels) {
          const labels = L.layerGroup();
          gl.eachLayer((layer) => {
            const fl = (layer as L.GeoJSON).feature as GeoJSON.Feature;
            const nm: string = fl?.properties?.st_nm ?? "";
            const c = (layer as L.Polygon).getBounds().getCenter();
            labels.addLayer(L.marker(c, {
              icon: L.divIcon({ className: "india-state-label", html: `<span>${nm.length > 14 ? nm.slice(0, 13) + "…" : nm}</span>`, iconSize: [80, 16] }),
              interactive: false,
            }));
          });
          labels.addTo(map);
          labelLayerRef.current = labels;
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, showLabels]);

  // ---- restyle when colorFor / selected changes ----
  useEffect(() => {
    if (!geoLayerRef.current) return;
    geoLayerRef.current.eachLayer((layer) => {
      const fl = (layer as L.GeoJSON).feature as GeoJSON.Feature;
      (layer as L.Path).setStyle(styleFor(fl));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorFor, selected]);

  // ---- fly to selected when changed externally ----
  useEffect(() => {
    if (!ready || !geoLayerRef.current || !selected) return;
    geoLayerRef.current.eachLayer((layer) => {
      const fl = (layer as L.GeoJSON).feature as GeoJSON.Feature;
      if (fl?.properties?.st_nm === selected) {
        const bounds = (layer as L.Polygon).getBounds();
        mapRef.current?.flyToBounds(bounds, { padding: [40, 40], duration: 0.9, maxZoom: 7 });
      }
    });
  }, [selected, ready]);

  // ---- layer switching ----
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    if (baseLayerRef.current) { map.removeLayer(baseLayerRef.current); baseLayerRef.current = null; }
    if (refLayerRef.current) { map.removeLayer(refLayerRef.current); refLayerRef.current = null; }

    let url = SATELLITE, attr = "Esri, Maxar, Earthstar Geographics", max = 18;
    if (layerType === "street") { url = STREET; attr = "© OpenStreetMap, CARTO"; max = 19; }
    if (layerType === "terrain") { url = TERRAIN; attr = "Esri, USGS, NOAA"; max = 15; }

    const nl = L.tileLayer(url, { maxZoom: max, attribution: attr });
    nl.addTo(map);
    baseLayerRef.current = nl;

    if (layerType === "satellite") {
      const ref = L.tileLayer(REFERENCE, { maxZoom: 18, opacity: 0.9 });
      ref.addTo(map);
      refLayerRef.current = ref;
    }
  }, [layerType, ready]);

  // ---- hotspot layer rendering ----
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;

    // remove existing hotspot layer
    if (hotspotLayerRef.current) {
      map.removeLayer(hotspotLayerRef.current);
      hotspotLayerRef.current = null;
    }

    if (hotspotType === "none") return;

    const meta = HOTSPOT_META[hotspotType];
    const spots = HOTSPOTS[hotspotType];
    const group = L.layerGroup();

    spots.forEach((spot) => {
      const color = sevColor(spot.severity, meta.color);
      const opacity = 0.12 + (spot.severity / 100) * 0.25;

      // outer glow zone circle (radius in meters)
      const zone = L.circle([spot.lat, spot.lng], {
        radius: spot.radius,
        fillColor: color,
        fillOpacity: opacity,
        color: color,
        weight: 1.5,
        opacity: 0.7,
        className: "hotspot-zone",
      });
      group.addLayer(zone);

      // pulsing center marker
      const pulseIcon = L.divIcon({
        className: "hotspot-pulse-marker",
        html: `
          <div class="hotspot-pulse-wrap" style="--hs-color:${color}">
            <div class="hotspot-pulse-ring"></div>
            <div class="hotspot-pulse-ring2"></div>
            <div class="hotspot-pulse-core">${meta.icon}</div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const marker = L.marker([spot.lat, spot.lng], { icon: pulseIcon, zIndexOffset: 1000 });
      group.addLayer(marker);

      // tooltip with hotspot details
      const sevLabel = spot.severity >= 85 ? "SEVERE" : spot.severity >= 70 ? "HIGH" : spot.severity >= 55 ? "MODERATE" : "LOW";
      const tipHtml = `
        <div style="min-width:180px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:14px">${meta.icon}</span>
            <b style="color:#04263a;font-size:13px">${spot.name}</b>
          </div>
          <div style="font-size:10px;color:#0369a1;margin-bottom:2px">${spot.state}</div>
          <div style="display:inline-block;padding:1px 7px;border-radius:99px;font-size:9px;font-weight:700;color:#fff;background:${color};margin-bottom:4px">${sevLabel} · ${spot.intensity}</div>
          <div style="font-size:11px;color:#0c4a6e;line-height:1.4">${spot.detail}</div>
          <div style="margin-top:4px;font-size:10px;color:#0369a1;font-family:monospace">Severity ${spot.severity}% · ${meta.label}</div>
        </div>
      `;
      marker.bindTooltip(tipHtml, { direction: "top", className: "india-leaflet-tooltip", offset: [0, -12] });
      zone.bindTooltip(tipHtml, { sticky: true, direction: "top", className: "india-leaflet-tooltip", offset: [0, -8] });

      // click to zoom into hotspot
      const onZoom = () => {
        map.flyTo([spot.lat, spot.lng], 8, { duration: 1.1 });
      };
      marker.on("click", onZoom);
      zone.on("click", onZoom);
    });

    group.addTo(map);
    hotspotLayerRef.current = group;
  }, [hotspotType, ready]);

  const resetView = () => mapRef.current?.flyTo([22.5, 80], 4.6, { duration: 0.8 });

  const activeMeta = hotspotType !== "none" ? HOTSPOT_META[hotspotType] : null;

  return (
    <div className={className}>
      {/* Hotspot layer selector bar — above the map */}
      {showHotspotToggle && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-deep/55 mr-1">Overlay:</span>
          {HOTSPOT_TYPES.map((ht) => {
            const isActive = hotspotType === ht;
            const meta = ht === "none" ? null : HOTSPOT_META[ht];
            return (
              <button
                key={ht}
                onClick={() => setHotspotType(ht)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isActive
                    ? "text-white border-transparent scale-105"
                    : "bg-white/50 text-deep/65 border-cyan-glow/25 hover:border-cyan-glow"
                }`}
                style={isActive && meta ? {
                  background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                  boxShadow: `0 0 16px ${meta.glow}`,
                } : isActive ? {
                  background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
                  boxShadow: "0 0 16px rgba(34,211,238,0.5)",
                } : {}}
              >
                {meta ? <span>{meta.icon}</span> : null}
                {ht === "none" ? "State Risk" : meta?.label}
                {isActive && meta && (
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse-glow" />
                )}
              </button>
            );
          })}
          {activeMeta && (
            <span className="ml-auto chip" style={{ borderColor: activeMeta.color + "88", background: activeMeta.color + "1a", color: activeMeta.color }}>
              {HOTSPOTS[hotspotType as HotspotType].length} active hotspots · click to inspect
            </span>
          )}
        </div>
      )}

      {/* Map container */}
      <div className="relative" style={{ height }}>
        <div ref={containerRef} className="h-full w-full rounded-xl overflow-hidden" style={{ background: "#0a1628" }} />

        {/* base layer switcher */}
        <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-1.5">
          {(["satellite", "street", "terrain"] as const).map((lt) => (
            <button key={lt} onClick={() => setLayerType(lt)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold backdrop-blur-md border transition ${layerType === lt ? "bg-cyan-glow text-deep border-cyan-glow glow-cyan" : "bg-white/70 text-deep/70 border-white/60 hover:border-cyan-glow"}`}>
              {lt === "satellite" ? "🛰 Satellite" : lt === "street" ? "🗺 Street" : "⛰ Terrain"}
            </button>
          ))}
        </div>

        {interactive && (
          <button onClick={resetView} className="absolute left-3 top-3 z-[1000] btn-ghost !bg-white/70 !backdrop-blur-md !text-xs !py-1.5 !px-2.5">
            ⟲ Reset India view
          </button>
        )}
        {interactive && (
          <div className="absolute left-3 bottom-3 z-[1000] chip !bg-white/70 !backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-cyan-glow animate-pulse-glow" />
            Zoom {zoomLevel.toFixed(0)} · {layerType}{hotspotType !== "none" ? ` · ${HOTSPOT_META[hotspotType].label}` : ""} · click state/hotspot to zoom
          </div>
        )}

        {/* hotspot legend */}
        {hotspotType !== "none" && (
          <div className="absolute right-3 bottom-3 z-[1000] glass-strong rounded-xl p-3 max-w-[200px]">
            <p className="font-mono text-[9px] uppercase tracking-widest text-deep/55 mb-1.5">{HOTSPOT_META[hotspotType].label} Legend</p>
            <div className="space-y-1">
              {[
                { l: "Severe (85+)", c: HOTSPOT_META[hotspotType].color, o: 0.37 },
                { l: "High (70-84)", c: HOTSPOT_META[hotspotType].color, o: 0.27 },
                { l: "Moderate (55-69)", c: HOTSPOT_META[hotspotType].color, o: 0.18 },
              ].map((x) => (
                <div key={x.l} className="flex items-center gap-2 text-[10px] text-deep/70">
                  <span className="h-3 w-3 rounded-full" style={{ background: x.c, opacity: x.o, border: `1px solid ${x.c}` }} />
                  {x.l}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
