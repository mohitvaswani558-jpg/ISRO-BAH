import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Thermometer, Sun, Activity, Cpu, ArrowRight, Gauge } from "lucide-react";
import { GlassCard, SectionTitle, RiskBadge, ProgressBar, PageTransition, GlowButton } from "../components/ui";
import { IndiaMap } from "../components/IndiaMap";
import { LineChart, MultiLineChart, BarChart } from "../components/Charts";
import { STATE_ENV, STATE_ENV_MAP, HEAT_COLOR } from "../lib/mockData";
import { predict } from "../lib/prediction";

const STEPS = [
  "Fetch live weather telemetry",
  "Render thermal overlays",
  "Compare 7-day past patterns",
  "Predict tomorrow heatwave probability",
  "Compute confidence score",
];

export function HeatIntelligence() {
  const [sel, setSel] = useState("Delhi");
  const [step, setStep] = useState(0);
  const e = STATE_ENV_MAP[sel];
  const p = predict(sel, "Heat");

  const top = [...STATE_ENV].sort((a, b) => b.heatRisk - a.heatRisk).slice(0, 8);

  return (
    <PageTransition>
      <SectionTitle kicker="Thermal Intelligence · Module 01" title="Heat Intelligence"
        subtitle="Live surface-temperature overlays, district heat analytics, and AI heatwave forecasting across India."
        icon={<Flame size={22} />} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="xl:col-span-2 p-5" hover={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-bold text-deep">National Thermal Overlay</h3>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <Legend c="#a3e635" l="Low" /><Legend c="#facc15" l="Moderate" /><Legend c="#fb923c" l="High" /><Legend c="#ef4444" l="Severe" />
            </div>
          </div>
          <IndiaMap
            height={460} selected={sel} onSelect={setSel}
            colorFor={(n) => { const s = STATE_ENV_MAP[n]; return s ? HEAT_COLOR(s.heatRisk) + "cc" : null; }}
            tooltip={(n) => {
              const s = STATE_ENV_MAP[n];
              return (
                <div>
                  <p className="font-display font-bold text-deep text-sm">{n}</p>
                  <p className="text-[11px] text-deep/70">Temp {s?.temp}°C · feels {s?.feelsLike}°C</p>
                  <p className="text-[11px] font-semibold" style={{ color: HEAT_COLOR(s?.heatRisk ?? 0) }}>Heat risk {s?.heatRisk}%</p>
                </div>
              );
            }}
          />
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-base font-bold text-deep">{e.name}</h3>
              <RiskBadge level={e.heatRisk >= 75 ? "severe" : e.heatRisk >= 55 ? "high" : e.heatRisk >= 35 ? "moderate" : "low"} risk={e.heatRisk} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Mini icon={<Thermometer size={14} />} label="Surface Temp" value={`${e.temp}°C`} color="#fb923c" />
              <Mini icon={<Sun size={14} />} label="Feels Like" value={`${e.feelsLike}°C`} color="#ef4444" />
              <Mini icon={<Gauge size={14} />} label="Humidity" value={`${e.humidity}%`} color="#38bdf8" />
              <Mini icon={<Activity size={14} />} label="Wind" value={`${e.wind}km/h`} color="#22d3ee" />
            </div>
            <div className="mt-3"><ProgressBar label="Heat Severity Index" value={e.heatRisk} color={HEAT_COLOR(e.heatRisk)} /></div>
          </GlassCard>

          <GlassCard className="p-5 relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-500/5" hover={false}>
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={16} className="text-orange-500" />
              <h3 className="font-display text-sm font-bold text-deep">AI Heatwave Prediction</h3>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <p className="font-display text-4xl font-bold" style={{ color: HEAT_COLOR(p.riskPercent) }}><motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{p.riskPercent}%</motion.span></p>
                <p className="text-[11px] text-deep/60">heatwave probability · tomorrow</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-mono text-2xl font-bold text-electric">{p.confidence}%</p>
                <p className="text-[10px] text-deep/55">confidence</p>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-deep/70 leading-relaxed bg-white/40 rounded-lg p-2.5 border border-orange-400/20">
              {p.reasoning[4]}
            </div>
            <p className="mt-2 text-[11px] text-deep/70"><span className="font-semibold">Action:</span> {p.recommendation}</p>
          </GlassCard>
        </div>
      </div>

      {/* workflow stepper */}
      <GlassCard className="p-5 mt-4" hover={false}>
        <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Cpu size={15} className="text-cyan-glow" /> Prediction Workflow</h3>
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium border transition ${i === step ? "bg-gradient-to-r from-cyan-glow to-azure text-white border-transparent glow-cyan" : "bg-white/40 text-deep/65 border-cyan-glow/25 hover:border-cyan-glow"}`}>
              <span className="grid place-items-center h-5 w-5 rounded-full bg-white/30 text-[10px] font-bold">{i + 1}</span>
              {s}
              {i < STEPS.length - 1 && <ArrowRight size={12} className="opacity-40" />}
            </button>
          ))}
        </div>
        <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl bg-white/45 border border-cyan-glow/20 p-3 text-sm text-deep/75">
          {step === 0 && <>Pulled live OpenWeather + NASA FIRMS thermal anomalies for {e.name}. Current surface temp {e.temp}°C, humidity {e.humidity}%, wind {e.wind} km/h.</>}
          {step === 1 && <>Thermal overlay rendered — {e.name} classified as <b>{e.heatRisk >= 75 ? "severe" : e.heatRisk >= 55 ? "high" : e.heatRisk >= 35 ? "moderate" : "low"}</b> heat severity ({e.heatRisk}%).</>}
          {step === 2 && <>7-day max-temp history analysed: {e.last7.map((t) => t + "°").join(" · ")}. Trend slope {p.reasoning[0]}.</>}
          {step === 3 && <>Forecast model projects tomorrow's max at <b>{p.forecastSeries[0]}°C</b>. Composite heatwave probability <b>{p.riskPercent}%</b>.</>}
          {step === 4 && <>Model confidence <b>{p.confidence}%</b>. {p.anomalies[0]}</>}
        </motion.div>
      </GlassCard>

      {/* charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">Past 7-Day vs Forecast 7-Day · {e.name}</h3>
          <MultiLineChart height={240}
            labels={["D1", "D2", "D3", "D4", "D5", "D6", "D7", "F1", "F2", "F3", "F4", "F5", "F6", "F7"]}
            datasets={[
              { label: "Historical °C", data: [...e.last7, ...Array(7).fill(null) as number[]], color: "#fb923c", fill: true },
              { label: "AI Forecast °C", data: [...Array(7).fill(null) as number[], ...p.forecastSeries], color: "#22d3ee", fill: true },
            ]}
          />
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">Top 8 Heat-Stressed States</h3>
          <BarChart labels={top.map((t) => t.name.replace("Andaman and Nicobar Islands", "A&N").replace("Dadra and Nagar Haveli and Daman and Diu", "DNH DD"))}
            data={top.map((t) => t.heatRisk)} label="Heat Risk %"
            colors={top.map((t) => HEAT_COLOR(t.heatRisk))} height={240} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <GlassCard className="xl:col-span-2 p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">24-Hour Humidity Trend · {e.name}</h3>
          <LineChart labels={e.humidityTrend.map((_, i) => `${i}h`)} data={e.humidityTrend} label="Humidity %" color="#38bdf8" height={220} suffix="%" />
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">AI Reasoning</h3>
          <div className="space-y-2 text-[11px] text-deep/75 leading-relaxed">
            {p.reasoning.map((r, i) => (
              <div key={i} className="flex gap-2"><span className="font-mono text-cyan-glow font-bold">{i + 1}.</span><span>{r}</span></div>
            ))}
          </div>
          <div className="mt-3"><GlowButton variant="ghost" className="!text-xs">Export thermal report ↗</GlowButton></div>
        </GlassCard>
      </div>
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
