import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Droplets, Wind, Satellite, Radar, Activity, AlertTriangle, TrendingUp, Gauge, Thermometer, Eye, Zap } from "lucide-react";
import { GlassCard, SectionTitle, StatCard, RiskBadge, ProgressBar, AnimatedNumber, PageTransition } from "../components/ui";
import { IndiaMap } from "../components/IndiaMap";
import { Globe3D } from "../components/Globe3D";
import { ParticleField } from "../components/Backgrounds";
import { LineChart, DoughnutChart } from "../components/Charts";
import { STATE_ENV_MAP, CITIES, ALERTS, NATIONAL_STATS, HEAT_COLOR, AQI_COLOR, aqiCategory } from "../lib/mockData";
import { useAuth } from "../contexts/AuthContext";

export function Dashboard() {
  const { user } = useAuth();
  const [sel, setSel] = useState<string | null>("Delhi");
  const e = sel ? STATE_ENV_MAP[sel] : null;

  const cards = [
    { label: "Avg National Temp", value: NATIONAL_STATS.avgTemp, suffix: "°C", icon: <Thermometer size={18} />, accent: "#fb923c", trend: "+1.2° vs 10yr avg", sub: "Surface LST composite" },
    { label: "Avg AQI Index", value: NATIONAL_STATS.avgAqi, icon: <Wind size={18} />, accent: "#c084fc", trend: `${NATIONAL_STATS.highAlerts} states high`, sub: "PM2.5 + PM10 weighted" },
    { label: "Avg Rainfall", value: NATIONAL_STATS.avgRain, suffix: "mm", decimals: 1, icon: <Droplets size={18} />, accent: "#38bdf8", trend: "Monsoon active", sub: "24h IMD radar blend" },
    { label: "Severe Alerts", value: NATIONAL_STATS.severeAlerts, icon: <AlertTriangle size={18} />, accent: "#ef4444", trend: "Action required", sub: "Auto-escalated regions" },
  ];

  return (
    <PageTransition>
      <ParticleField className="absolute inset-0 z-0 opacity-40" count={22} />
      <div className="relative">
        <SectionTitle kicker="Mission Control · Live" title={`Welcome back, ${user?.name?.split(" ")[0]}`}
          subtitle="Real-time environmental intelligence across the Indian subcontinent. Click any state on the map to inspect regional telemetry."
          icon={<Radar size={22} />} />

        {/* hero stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <StatCard {...c} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
          {/* Map */}
          <GlassCard className="xl:col-span-2 p-5 relative overflow-hidden" hover={false}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-deep/50">Geospatial Overview</p>
                <h3 className="font-display text-lg font-bold text-deep">National Environmental Map</h3>
              </div>
              <span className="chip"><span className="h-2 w-2 rounded-full bg-cyan-glow animate-pulse-glow" /> Thermal overlay ON</span>
            </div>
            <IndiaMap
              height={460}
              selected={sel}
              onSelect={setSel}
              colorFor={(name) => {
                const s = STATE_ENV_MAP[name];
                if (!s) return null;
                const v = s.overallRisk;
                return v >= 75 ? "#ef444499" : v >= 55 ? "#fb923c99" : v >= 35 ? "#facc1599" : "#a3e63599";
              }}
              tooltip={(name) => {
                const s = STATE_ENV_MAP[name];
                if (!s) return name;
                return (
                  <div>
                    <p className="font-display font-bold text-deep text-sm">{name}</p>
                    <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-deep/70">
                      <span>Temp</span><span className="font-mono text-deep font-semibold">{s.temp}°C</span>
                      <span>AQI</span><span className="font-mono text-deep font-semibold">{s.aqi}</span>
                      <span>Rain</span><span className="font-mono text-deep font-semibold">{s.rainfall}mm</span>
                      <span>Risk</span><span className="font-mono font-semibold" style={{ color: HEAT_COLOR(s.overallRisk) }}>{s.overallRisk}%</span>
                    </div>
                  </div>
                );
              }}
            />
          </GlassCard>

          {/* Right column: globe + AI insight */}
          <div className="space-y-4">
            <GlassCard className="p-5 relative overflow-hidden bg-gradient-to-br from-deep/90 to-[#04121f]" hover={false}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-glow/70">Orbital View</p>
                  <h3 className="font-display text-lg font-bold text-white">Earth Observation</h3>
                </div>
                <Satellite size={18} className="text-cyan-glow animate-pulse-glow" />
              </div>
              <div className="grid place-items-center -my-2">
                <Globe3D size={220} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[["SAT-7", "LST"], ["INSAT-3D", "Rain"], ["Sentinel", "AQI"]].map(([a, b]) => (
                  <div key={a} className="rounded-lg bg-white/5 border border-cyan-glow/20 p-2 text-center">
                    <p className="font-mono text-[10px] text-cyan-glow font-bold">{a}</p>
                    <p className="text-[9px] text-cyan-100/60">{b}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5" hover={false}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-cyan-glow" />
                <h3 className="font-display text-sm font-bold text-deep">AI Insight Engine</h3>
              </div>
              <div className="space-y-2 text-xs text-deep/75 leading-relaxed">
                <p><span className="font-semibold text-deep">Delhi</span> — 78% probability of severe heat stress tomorrow. Confidence 86%.</p>
                <p><span className="font-semibold text-deep">Assam</span> — rising rainfall trend (+3.2mm/day) elevates flood probability to 64%.</p>
                <p><span className="font-semibold text-deep">Mumbai</span> — AQI trending moderate; PM2.5 spike detected in 24h window.</p>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="chip">7-day forecast</span>
                <span className="chip">Anomaly scan</span>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* selected state detail + weather widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-deep">Region Telemetry · {e?.name}</h3>
              {e && <RiskBadge level={e.overallRisk >= 75 ? "severe" : e.overallRisk >= 55 ? "high" : e.overallRisk >= 35 ? "moderate" : "low"} risk={e.overallRisk} />}
            </div>
            {e && (
              <div className="grid grid-cols-2 gap-3">
                <Metric icon={<Thermometer size={14} />} label="Temperature" value={`${e.temp}°C`} sub={`Feels ${e.feelsLike}°C`} color="#fb923c" />
                <Metric icon={<Droplets size={14} />} label="Humidity" value={`${e.humidity}%`} sub={e.condition} color="#38bdf8" />
                <Metric icon={<Wind size={14} />} label="AQI" value={`${e.aqi}`} sub={aqiCategory(e.aqi).label} color={aqiCategory(e.aqi).color} />
                <Metric icon={<Droplets size={14} />} label="Rainfall" value={`${e.rainfall}mm`} sub={`${e.wind} km/h wind`} color="#0ea5e9" />
                <Metric icon={<Gauge size={14} />} label="Pressure" value={`${e.pressure}hPa`} sub={`${e.visibility}km vis`} color="#22d3ee" />
                <Metric icon={<Activity size={14} />} label="PM2.5" value={`${e.pm25}`} sub={`PM10 ${e.pm10}`} color="#c084fc" />
              </div>
            )}
            <div className="mt-4 space-y-2.5">
              <ProgressBar label="Heat Risk" value={e?.heatRisk ?? 0} color={HEAT_COLOR(e?.heatRisk ?? 0)} />
              <ProgressBar label="Flood Risk" value={e?.floodRisk ?? 0} color="#38bdf8" />
              <ProgressBar label="AQI Risk" value={e?.aqiRisk ?? 0} color={AQI_COLOR(e?.aqi ?? 0)} />
            </div>
          </GlassCard>

          <GlassCard className="p-5" hover={false}>
            <h3 className="font-display text-base font-bold text-deep mb-3">7-Day Temperature Trend · {e?.name}</h3>
            <LineChart labels={["D1", "D2", "D3", "D4", "D5", "D6", "D7"]} data={e?.last7 ?? []} label="Max Temp °C" color="#fb923c" suffix="°" height={200} />
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-deep/60">Forecast horizon</span>
              <span className="font-mono text-electric">+7 days · 86% conf.</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5" hover={false}>
            <h3 className="font-display text-base font-bold text-deep mb-3">Risk Distribution</h3>
            <DoughnutChart
              labels={["Low", "Moderate", "High", "Severe"]}
              data={[
                Object.values(STATE_ENV_MAP).filter((s) => s.overallRisk < 35).length,
                Object.values(STATE_ENV_MAP).filter((s) => s.overallRisk >= 35 && s.overallRisk < 55).length,
                Object.values(STATE_ENV_MAP).filter((s) => s.overallRisk >= 55 && s.overallRisk < 75).length,
                Object.values(STATE_ENV_MAP).filter((s) => s.overallRisk >= 75).length,
              ]}
              colors={["#a3e635", "#facc15", "#fb923c", "#ef4444"]}
              height={210}
            />
          </GlassCard>
        </div>

        {/* live cities + alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-deep">Live City Weather</h3>
              <span className="chip"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" /> OpenWeather sync</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {CITIES.map((c) => (
                <div key={c.name} className="flex items-center gap-3 rounded-xl bg-white/50 border border-cyan-glow/20 p-2.5 hover:glow-cyan transition">
                  <div className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-glow to-azure text-white text-xs font-bold">{c.temp}°</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-deep truncate">{c.name}</p>
                    <p className="text-[10px] text-deep/55">{c.condition} · {c.state}</p>
                  </div>
                  <span className="font-mono text-[11px] font-bold" style={{ color: AQI_COLOR(c.aqi) }}>{c.aqi}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-deep flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" /> Active Alerts</h3>
              <span className="chip !border-red-400/50 !bg-red-400/10 !text-red-500">{ALERTS.length} active</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {ALERTS.map((a) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl bg-white/50 border border-cyan-glow/20 p-3 flex items-center gap-3 hover:border-red-400/40 transition">
                  <div className="grid place-items-center h-10 w-10 rounded-lg" style={{ background: a.severity === "severe" ? "#ef444422" : "#fb923c22" }}>
                    {a.type === "Heatwave" ? <Flame size={18} className="text-orange-500" /> : a.type === "Flood" ? <Droplets size={18} className="text-sky-500" /> : <Wind size={18} className="text-purple-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-deep truncate">{a.state} · {a.type}</p>
                    <p className="text-[11px] text-deep/60 truncate">{a.message}</p>
                  </div>
                  <RiskBadge level={a.severity} risk={a.risk} />
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* real-time indicators strip */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { l: "Satellites", v: NATIONAL_STATS.satellites, i: <Satellite size={16} /> },
            { l: "Sensors", v: NATIONAL_STATS.sensors, i: <Radar size={16} /> },
            { l: "Uptime %", v: NATIONAL_STATS.uptime, decimals: 2, i: <Activity size={16} /> },
            { l: "States", v: NATIONAL_STATS.statesMonitored, i: <Eye size={16} /> },
            { l: "High Alerts", v: NATIONAL_STATS.highAlerts, i: <AlertTriangle size={16} /> },
            { l: "Avg Heat Risk", v: NATIONAL_STATS.avgHeatRisk, suffix: "%", i: <TrendingUp size={16} /> },
          ].map((x) => (
            <GlassCard key={x.l} className="p-3 flex items-center gap-3">
              <div className="grid place-items-center h-9 w-9 rounded-lg bg-cyan-glow/15 text-electric">{x.i}</div>
              <div>
                <p className="font-mono text-[9px] uppercase text-deep/50">{x.l}</p>
                <p className="font-display text-base font-bold text-deep"><AnimatedNumber value={x.v} decimals={x.decimals ?? 0} suffix={x.suffix ?? ""} /></p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

function Metric({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl bg-white/50 border border-cyan-glow/20 p-2.5">
      <div className="flex items-center gap-1.5 text-deep/55">
        <span style={{ color }}>{icon}</span>
        <span className="font-mono text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-display text-lg font-bold text-deep mt-0.5">{value}</p>
      <p className="text-[10px] text-deep/50">{sub}</p>
    </div>
  );
}
