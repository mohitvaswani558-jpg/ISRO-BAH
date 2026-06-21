import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, CloudRain, Waves, Ship, Cpu, AlertTriangle, Shield, Activity } from "lucide-react";
import { GlassCard, SectionTitle, RiskBadge, ProgressBar, PageTransition } from "../components/ui";
import { IndiaMap } from "../components/IndiaMap";
import { LineChart, BarChart, MultiLineChart } from "../components/Charts";
import { STATE_ENV, STATE_ENV_MAP, FLOOD_COLOR } from "../lib/mockData";
import { predict } from "../lib/prediction";

export function FloodIntelligence() {
  const [sel, setSel] = useState("Assam");
  const e = STATE_ENV_MAP[sel];
  const p = predict(sel, "Flood");
  const top = [...STATE_ENV].sort((a, b) => b.floodRisk - a.floodRisk).slice(0, 8);

  return (
    <PageTransition>
      <SectionTitle kicker="Hydrological Intelligence · Module 02" title="Flood Intelligence"
        subtitle="Rainfall analytics, flood-prone district highlights, water-spread visualization, and AI flood probability forecasting."
        icon={<Droplets size={22} />} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="xl:col-span-2 p-5" hover={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-bold text-deep">Flood-Prone Overlay</h3>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <Legend c="#bae6fd" l="Low" /><Legend c="#7dd3fc" l="Mod" /><Legend c="#38bdf8" l="High" /><Legend c="#0284c7" l="Severe" />
            </div>
          </div>
          <IndiaMap
            height={460} selected={sel} onSelect={setSel}
            colorFor={(n) => { const s = STATE_ENV_MAP[n]; return s ? FLOOD_COLOR(s.floodRisk) + "cc" : null; }}
            tooltip={(n) => {
              const s = STATE_ENV_MAP[n];
              return (
                <div>
                  <p className="font-display font-bold text-deep text-sm">{n}</p>
                  <p className="text-[11px] text-deep/70">Rainfall {s?.rainfall}mm · humidity {s?.humidity}%</p>
                  <p className="text-[11px] font-semibold text-sky-600">Flood risk {s?.floodRisk}%</p>
                </div>
              );
            }}
          />
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-base font-bold text-deep">{e.name}</h3>
              <RiskBadge level={e.floodRisk >= 75 ? "severe" : e.floodRisk >= 55 ? "high" : e.floodRisk >= 35 ? "moderate" : "low"} risk={e.floodRisk} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Mini icon={<CloudRain size={14} />} label="Rainfall 24h" value={`${e.rainfall}mm`} color="#38bdf8" />
              <Mini icon={<Waves size={14} />} label="Humidity" value={`${e.humidity}%`} color="#0ea5e9" />
              <Mini icon={<Activity size={14} />} label="Wind" value={`${e.wind}km/h`} color="#22d3ee" />
              <Mini icon={<Ship size={14} />} label="Pressure" value={`${e.pressure}hPa`} color="#0369a1" />
            </div>
            <div className="mt-3"><ProgressBar label="Flood Probability" value={e.floodRisk} color={FLOOD_COLOR(e.floodRisk)} /></div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-deep/70">
              <Shield size={13} className="text-sky-500" /> Soil saturation index: {Math.min(98, e.humidity + 8)}%
            </div>
          </GlassCard>

          <GlassCard className="p-5 relative overflow-hidden bg-gradient-to-br from-sky-500/10 to-blue-600/5" hover={false}>
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={16} className="text-sky-500" />
              <h3 className="font-display text-sm font-bold text-deep">AI Flood Prediction</h3>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <p className="font-display text-4xl font-bold" style={{ color: FLOOD_COLOR(p.riskPercent) }}>{p.riskPercent}%</p>
                <p className="text-[11px] text-deep/60">flood inundation probability · tomorrow</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-mono text-2xl font-bold text-electric">{p.confidence}%</p>
                <p className="text-[10px] text-deep/55">confidence</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-deep/70">{p.reasoning[4]}</p>
            <p className="mt-2 text-[11px] text-deep/70"><span className="font-semibold">Action:</span> {p.recommendation}</p>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">7-Day Rainfall: History vs Forecast · {e.name}</h3>
          <MultiLineChart height={240}
            labels={["D1", "D2", "D3", "D4", "D5", "D6", "D7", "F1", "F2", "F3", "F4", "F5", "F6", "F7"]}
            datasets={[
              { label: "Rainfall mm (past)", data: [...e.rainfallTrend, ...Array(7).fill(null) as number[]], color: "#38bdf8", fill: true },
              { label: "Rainfall mm (AI forecast)", data: [...Array(7).fill(null) as number[], ...p.forecastSeries], color: "#0284c7", fill: true },
            ]}
          />
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">Top 8 Flood-Vulnerable States</h3>
          <BarChart labels={top.map((t) => t.name.length > 14 ? t.name.slice(0, 13) + "…" : t.name)}
            data={top.map((t) => t.floodRisk)} label="Flood Risk %"
            colors={top.map((t) => FLOOD_COLOR(t.floodRisk))} height={240} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <GlassCard className="xl:col-span-2 p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">Water-Spread Visualization · {e.name} catchment</h3>
          <WaterSpread risk={e.floodRisk} rain={e.rainfall} />
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-sky-500" /> Emergency Flood Alerts</h3>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {STATE_ENV.filter((s) => s.floodRisk >= 55).sort((a, b) => b.floodRisk - a.floodRisk).map((s) => (
              <div key={s.code} className="rounded-xl bg-white/50 border border-sky-400/25 p-2.5 flex items-center gap-2">
                <Waves size={15} className="text-sky-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-deep truncate">{s.name}</p>
                  <p className="text-[10px] text-deep/60">{s.rainfall}mm rainfall · {s.humidity}% humidity</p>
                </div>
                <RiskBadge level={s.floodRisk >= 75 ? "severe" : "high"} risk={s.floodRisk} />
              </div>
            ))}
            {STATE_ENV.filter((s) => s.floodRisk >= 55).length === 0 && <p className="text-xs text-deep/60">No active flood alerts.</p>}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5 mt-4" hover={false}>
        <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Cpu size={15} className="text-cyan-glow" /> AI Flood Reasoning</h3>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-deep/75 leading-relaxed">
          {p.reasoning.map((r, i) => (<div key={i} className="flex gap-2"><span className="font-mono text-sky-500 font-bold">{i + 1}.</span><span>{r}</span></div>))}
        </div>
      </GlassCard>
    </PageTransition>
  );
}

function WaterSpread({ risk, rain }: { risk: number; rain: number }) {
  const level = Math.min(96, 30 + risk * 0.7);
  return (
    <div className="relative h-56 rounded-xl overflow-hidden border border-sky-400/25 bg-gradient-to-b from-sky-50 to-blue-100">
      {/* terrain */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute bottom-0 rounded-t-full bg-emerald-600/40" style={{ left: `${i * 16}%`, width: "16%", height: `${30 + (i % 3) * 8}%` }} />
        ))}
      </div>
      {/* water */}
      <motion.div initial={{ height: 0 }} animate={{ height: `${level}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-sky-400/70 to-blue-600/80 backdrop-blur-sm"
        style={{ boxShadow: "inset 0 8px 20px rgba(56,189,248,0.5)" }}>
        <div className="absolute -top-1 left-0 right-0 h-2 bg-cyan-glow/60 animate-pulse-glow" />
      </motion.div>
      {/* grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-3 left-3 chip !text-sky-700"><Droplets size={12} /> Water level {level.toFixed(0)}%</div>
      <div className="absolute top-3 right-3 chip !text-sky-700">{rain}mm inflow</div>
    </div>
  );
}

function Legend({ c, l }: { c: string; l: string }) {
  return <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />{l}</span>;
}
function Mini({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-white/50 border border-cyan-glow/20 p-2.5">
      <div className="flex items-center gap-1.5 text-deep/55"><span style={{ color }}>{icon}</span><span className="font-mono text-[10px] uppercase">{label}</span></div>
      <p className="font-display text-lg font-bold text-deep mt-0.5">{value}</p>
    </div>
  );
}
