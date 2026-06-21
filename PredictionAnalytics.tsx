import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Cpu, Brain, Target, Gauge, Activity, Sparkles, AlertOctagon, LineChart as LineIcon } from "lucide-react";
import { GlassCard, SectionTitle, RiskBadge, ProgressBar, PageTransition, GlowButton, AnimatedNumber } from "../components/ui";
import { IndiaMap } from "../components/IndiaMap";
import { MultiLineChart, RadarChart } from "../components/Charts";
import { STATE_ENV, STATE_ENV_MAP } from "../lib/mockData";
import { predict, type Prediction } from "../lib/prediction";

type Metric = Prediction["metric"];
const METRICS: { id: Metric; label: string; color: string; icon: React.ReactNode }[] = [
  { id: "Heat", label: "Heat Stress", color: "#fb923c", icon: <TrendingUp size={15} /> },
  { id: "Flood", label: "Flood Inundation", color: "#38bdf8", icon: <Activity size={15} /> },
  { id: "AQI", label: "Air Quality", color: "#c084fc", icon: <Gauge size={15} /> },
];

export function PredictionAnalytics() {
  const [state, setState] = useState("Delhi");
  const [metric, setMetric] = useState<Metric>("Heat");
  const p = predict(state, metric);
  const e = STATE_ENV_MAP[state];

  const forecast = [
    { label: "Heat", color: "#fb923c", data: predict(state, "Heat") },
    { label: "Flood", color: "#38bdf8", data: predict(state, "Flood") },
    { label: "AQI", color: "#c084fc", data: predict(state, "AQI") },
  ];

  const national = STATE_ENV.map((s) => predict(s.name, metric)).sort((a, b) => b.riskPercent - a.riskPercent).slice(0, 6);

  return (
    <PageTransition>
      <SectionTitle kicker="AI Future Prediction Engine · Module 05" title="Prediction Analytics"
        subtitle="Time-series forecasting fusing historical weather, AQI, and rainfall to predict future environmental risks with explainable confidence."
        icon={<Brain size={22} />} />

      {/* controls */}
      <GlassCard className="p-4 mb-4" hover={false}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-cyan-glow" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-deep/55">Target region</span>
            <select value={state} onChange={(e) => setState(e.target.value)} className="input-glow !w-auto !py-1.5 !px-3 font-semibold">
              {STATE_ENV.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-deep/55">Metric</span>
            <div className="flex gap-1.5">
              {METRICS.map((m) => (
                <button key={m.id} onClick={() => setMetric(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${metric === m.id ? "text-white border-transparent glow-cyan" : "bg-white/40 text-deep/65 border-cyan-glow/25"}`}
                  style={metric === m.id ? { background: `linear-gradient(135deg, ${m.color}, #0369a1)` } : {}}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* headline prediction */}
        <GlassCard className="xl:col-span-2 p-6 relative overflow-hidden" hover={false}
          style={{ background: `linear-gradient(135deg, ${METRICS.find((m) => m.id === metric)!.color}12, transparent 60%)` }}>
          <div className="flex items-center gap-2 mb-1">
            <Cpu size={16} className="text-cyan-glow" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-deep/55">Prediction · {p.horizonLabel}</span>
          </div>
          <h3 className="font-display text-xl font-bold text-deep">{state} — {METRICS.find((m) => m.id === metric)!.label} Forecast</h3>
          <div className="mt-4 flex items-end gap-8">
            <div>
              <p className="font-mono text-[10px] uppercase text-deep/55">Risk Probability</p>
              <p className="font-display text-6xl font-bold" style={{ color: METRICS.find((m) => m.id === metric)!.color }}>
                <AnimatedNumber value={p.riskPercent} suffix="%" />
              </p>
              <RiskBadge level={p.level} risk={p.riskPercent} />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-deep/55">Confidence</p>
              <p className="font-display text-4xl font-bold text-electric"><AnimatedNumber value={p.confidence} suffix="%" /></p>
              <p className="text-[10px] text-deep/55">model certainty</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-white/50 border border-cyan-glow/20 p-3 text-sm text-deep/80 leading-relaxed">
            <p className="font-semibold text-deep mb-1">AI Verdict</p>
            Based on the last 7 days of {metric === "Heat" ? "temperature" : metric === "Flood" ? "rainfall" : "AQI"}, humidity, and dispersion conditions,
            <b> {state}</b> has a <b style={{ color: METRICS.find((m) => m.id === metric)!.color }}>{p.riskPercent}%</b> probability of
            {metric === "Heat" ? " severe heat stress" : metric === "Flood" ? " flood inundation" : " hazardous air quality"} tomorrow, with <b>{p.confidence}%</b> confidence.
          </div>
          <div className="mt-3"><GlowButton variant="ghost" className="!text-xs">Generate full mission report ↗</GlowButton></div>
        </GlassCard>

        {/* gauge + radar */}
        <div className="space-y-4">
          <GlassCard className="p-5" hover={false}>
            <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Gauge size={15} className="text-cyan-glow" /> Risk Gauge</h3>
            <GaugeDial value={p.riskPercent} color={METRICS.find((m) => m.id === metric)!.color} />
          </GlassCard>
          <GlassCard className="p-5" hover={false}>
            <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Sparkles size={15} className="text-cyan-glow" /> Multi-Metric Risk · {state}</h3>
            <RadarChart height={220}
              labels={["Heat", "Flood", "AQI", "Humidity", "Wind", "Pressure"]}
              datasets={[{ label: "Current %", data: [forecast[0].data.riskPercent, forecast[1].data.riskPercent, forecast[2].data.riskPercent, e.humidity, e.wind, (e.pressure - 1000) * 5], color: "#22d3ee" }]}
            />
          </GlassCard>
        </div>
      </div>

      {/* forecast graph */}
      <GlassCard className="p-5 mt-4" hover={false}>
        <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><LineIcon size={15} className="text-cyan-glow" /> 14-Day Time-Series · Past 7 + Forecast 7 · {state} ({metric})</h3>
        <MultiLineChart height={300}
          labels={["-7d", "-6d", "-5d", "-4d", "-3d", "-2d", "-1d", "+1d", "+2d", "+3d", "+4d", "+5d", "+6d", "+7d"]}
          datasets={[
            { label: "Historical", data: [...p.baselineSeries, ...Array(7).fill(null) as number[]], color: METRICS.find((m) => m.id === metric)!.color, fill: true },
            { label: "AI Forecast", data: [...Array(7).fill(null) as number[], ...p.forecastSeries], color: "#22d3ee", fill: true },
          ]}
        />
      </GlassCard>

      {/* future overlay map */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <GlassCard className="xl:col-span-2 p-5" hover={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-bold text-deep flex items-center gap-2"><AlertOctagon size={15} className="text-cyan-glow" /> Future Risk Overlay · {metric} (tomorrow)</h3>
            <span className="chip">{metric} forecast</span>
          </div>
          <IndiaMap height={420} selected={state} onSelect={setState}
            colorFor={(n) => {
              const pp = predict(n, metric);
              const c = METRICS.find((m) => m.id === metric)!.color;
              const alpha = Math.round(Math.min(220, pp.riskPercent * 2.4)).toString(16).padStart(2, "0");
              return c + alpha;
            }}
            tooltip={(n) => {
              const pp = predict(n, metric);
              return (
                <div>
                  <p className="font-display font-bold text-deep text-sm">{n}</p>
                  <p className="text-[11px] font-semibold" style={{ color: METRICS.find((m) => m.id === metric)!.color }}>{metric} risk {pp.riskPercent}% · conf {pp.confidence}%</p>
                </div>
              );
            }}
          />
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3">National Top-6 Risk · {metric}</h3>
          <div className="space-y-2">
            {national.map((np) => (
              <div key={np.state} className="rounded-xl bg-white/50 border border-cyan-glow/20 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-deep">{np.state}</span>
                  <span className="font-mono text-xs font-bold" style={{ color: METRICS.find((m) => m.id === metric)!.color }}>{np.riskPercent}%</span>
                </div>
                <ProgressBar value={np.riskPercent} color={METRICS.find((m) => m.id === metric)!.color} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* reasoning + anomalies */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Brain size={15} className="text-cyan-glow" /> AI Reasoning · {state}</h3>
          <div className="space-y-2 text-[12px] text-deep/75 leading-relaxed">
            <AnimatePresence mode="wait">
              <motion.div key={state + metric} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {p.reasoning.map((r, i) => (<div key={i} className="flex gap-2"><span className="font-mono text-cyan-glow font-bold shrink-0">{i + 1}.</span><span>{r}</span></div>))}
              </motion.div>
            </AnimatePresence>
          </div>
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><AlertOctagon size={15} className="text-red-500" /> Anomaly Detection</h3>
          <div className="space-y-2">
            {p.anomalies.map((a, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-white/45 border border-cyan-glow/20 p-2.5 text-[12px] text-deep/75">
                <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${a.includes("No statistical") ? "bg-emerald-400" : "bg-red-500 animate-pulse-glow"}`} />
                {a}
              </div>
            ))}
          </div>
          <div className="mt-3"><ProgressBar label="Anomaly score" value={p.anomalies.filter((a) => !a.includes("No statistical")).length * 25} color="#ef4444" /></div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}

function GaugeDial({ value, color }: { value: number; color: string }) {
  const r = 70, c = 2 * Math.PI * r;
  const arc = (value / 100) * c * 0.75;
  return (
    <div className="relative grid place-items-center h-44">
      <svg width="180" height="160" viewBox="0 0 180 160">
        <defs>
          <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} /><stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="80" r={r} fill="none" stroke="rgba(2,132,199,0.12)" strokeWidth="12" strokeDasharray={`${c * 0.75} ${c}`} strokeLinecap="round" transform="rotate(135 90 80)" />
        <motion.circle cx="90" cy="80" r={r} fill="none" stroke="url(#gg)" strokeWidth="12" strokeLinecap="round" transform="rotate(135 90 80)"
          initial={{ strokeDasharray: `0 ${c}` }} animate={{ strokeDasharray: `${arc} ${c}` }} transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-3xl font-bold" style={{ color }}>{value}<span className="text-lg">%</span></p>
        <p className="font-mono text-[10px] text-deep/55">risk index</p>
      </div>
    </div>
  );
}
