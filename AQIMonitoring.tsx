import { useState } from "react";
import { motion } from "framer-motion";
import { Wind, Activity, Cpu, HeartPulse, Leaf, Factory, Eye, AlertTriangle } from "lucide-react";
import { GlassCard, SectionTitle, RiskBadge, ProgressBar, PageTransition } from "../components/ui";
import { IndiaMap } from "../components/IndiaMap";
import { LineChart, BarChart, DoughnutChart, MultiLineChart } from "../components/Charts";
import { STATE_ENV, STATE_ENV_MAP, AQI_COLOR, aqiCategory } from "../lib/mockData";
import { predict } from "../lib/prediction";

export function AQIMonitoring() {
  const [sel, setSel] = useState("Delhi");
  const e = STATE_ENV_MAP[sel];
  const p = predict(sel, "AQI");
  const cat = aqiCategory(e.aqi);
  const top = [...STATE_ENV].sort((a, b) => b.aqi - a.aqi).slice(0, 8);

  const dist = [
    { l: "Good (0-50)", v: STATE_ENV.filter((s) => s.aqi <= 50).length, c: "#34d399" },
    { l: "Satisfactory (51-100)", v: STATE_ENV.filter((s) => s.aqi > 50 && s.aqi <= 100).length, c: "#facc15" },
    { l: "Moderate (101-200)", v: STATE_ENV.filter((s) => s.aqi > 100 && s.aqi <= 200).length, c: "#fbbf24" },
    { l: "Poor (201-300)", v: STATE_ENV.filter((s) => s.aqi > 200 && s.aqi <= 300).length, c: "#f87171" },
    { l: "Very Poor+ (>300)", v: STATE_ENV.filter((s) => s.aqi > 300).length, c: "#c084fc" },
  ];

  return (
    <PageTransition>
      <SectionTitle kicker="Atmospheric Intelligence · Module 03" title="AQI Monitoring"
        subtitle="Air-quality overlays, PM2.5/PM10 analytics, pollution forecasts, and health-risk indicators across India."
        icon={<Wind size={22} />} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="xl:col-span-2 p-5" hover={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-bold text-deep">National AQI Overlay</h3>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <Legend c="#34d399" l="Good" /><Legend c="#facc15" l="Sat" /><Legend c="#fbbf24" l="Mod" /><Legend c="#f87171" l="Poor" /><Legend c="#c084fc" l="VPoor" />
            </div>
          </div>
          <IndiaMap
            height={460} selected={sel} onSelect={setSel}
            colorFor={(n) => { const s = STATE_ENV_MAP[n]; return s ? AQI_COLOR(s.aqi) + "cc" : null; }}
            tooltip={(n) => {
              const s = STATE_ENV_MAP[n];
              const cc = aqiCategory(s?.aqi ?? 0);
              return (
                <div>
                  <p className="font-display font-bold text-deep text-sm">{n}</p>
                  <p className="text-[11px] font-semibold" style={{ color: cc.color }}>AQI {s?.aqi} · {cc.label}</p>
                  <p className="text-[11px] text-deep/70">PM2.5 {s?.pm25} · PM10 {s?.pm10}</p>
                </div>
              );
            }}
          />
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-base font-bold text-deep">{e.name}</h3>
              <span className="chip" style={{ borderColor: cat.color + "88", background: cat.color + "1a", color: cat.color }}>{cat.label}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="font-display text-5xl font-bold" style={{ color: cat.color }}>{e.aqi}</p>
              <p className="text-xs text-deep/55">AQI · US EPA scale</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Mini icon={<Activity size={14} />} label="PM2.5" value={`${e.pm25} µg/m³`} color={cat.color} />
              <Mini icon={<Factory size={14} />} label="PM10" value={`${e.pm10} µg/m³`} color={cat.color} />
              <Mini icon={<Leaf size={14} />} label="Visibility" value={`${e.visibility} km`} color="#34d399" />
              <Mini icon={<Wind size={14} />} label="Wind" value={`${e.wind} km/h`} color="#22d3ee" />
            </div>
            <div className="mt-3"><ProgressBar label="AQI Risk" value={e.aqiRisk} color={cat.color} /></div>
          </GlassCard>

          <GlassCard className="p-5 relative overflow-hidden" hover={false} style={{ background: `linear-gradient(135deg, ${cat.color}18, transparent)` }}>
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse size={16} style={{ color: cat.color }} />
              <h3 className="font-display text-sm font-bold text-deep">Health Risk Indicator</h3>
            </div>
            <p className="text-xs text-deep/75 leading-relaxed">{cat.advice}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-white/50 p-2"><p className="font-semibold text-deep">Sensitive groups</p><p style={{ color: cat.color }}>{e.aqi > 100 ? "Caution" : "Safe"}</p></div>
              <div className="rounded-lg bg-white/50 p-2"><p className="font-semibold text-deep">General public</p><p style={{ color: cat.color }}>{e.aqi > 150 ? "Limit outdoor" : "No restriction"}</p></div>
            </div>
          </GlassCard>

          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center gap-2 mb-2"><Cpu size={15} className="text-cyan-glow" /><h3 className="font-display text-sm font-bold text-deep">AI Pollution Forecast</h3></div>
            <div className="flex items-end gap-4">
              <p className="font-display text-3xl font-bold" style={{ color: cat.color }}>{p.riskPercent}%</p>
              <p className="text-[11px] text-deep/60">hazardous AQI risk · tomorrow</p>
            </div>
            <p className="mt-2 font-mono text-xs text-electric">Confidence {p.confidence}% · forecast AQI {p.forecastSeries[0]}</p>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <GlassCard className="xl:col-span-2 p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">24h AQI Trend · {e.name}</h3>
          <LineChart labels={e.aqiTrend.map((_, i) => `${i}h`)} data={e.aqiTrend} label="AQI" color={cat.color} height={240} />
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">AQI Category Distribution</h3>
          <DoughnutChart labels={dist.map((d) => d.l)} data={dist.map((d) => d.v)} colors={dist.map((d) => d.c)} height={240} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">PM2.5 vs PM10 · {e.name} (7-day forecast)</h3>
          <MultiLineChart height={240}
            labels={["D1", "D2", "D3", "D4", "D5", "D6", "D7", "F1", "F2", "F3", "F4", "F5", "F6", "F7"]}
            datasets={[
              { label: "PM2.5 (past)", data: [...e.last30.slice(-7).map((v) => v * 0.46), ...Array(7).fill(null) as number[]], color: "#c084fc" },
              { label: "PM2.5 (forecast)", data: [...Array(7).fill(null) as number[], ...p.forecastSeries.map((v) => v * 0.46)], color: "#22d3ee" },
            ]}
          />
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">Most Polluted States</h3>
          <BarChart labels={top.map((t) => t.name.length > 14 ? t.name.slice(0, 13) + "…" : t.name)}
            data={top.map((t) => t.aqi)} label="AQI" colors={top.map((t) => AQI_COLOR(t.aqi))} height={240} />
        </GlassCard>
      </div>

      <GlassCard className="p-5 mt-4" hover={false}>
        <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-purple-500" /> Pollution Forecast Reasoning</h3>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-deep/75 leading-relaxed">
          {p.reasoning.map((r, i) => (<div key={i} className="flex gap-2"><span className="font-mono text-purple-500 font-bold">{i + 1}.</span><span>{r}</span></div>))}
        </div>
      </GlassCard>
    </PageTransition>
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
