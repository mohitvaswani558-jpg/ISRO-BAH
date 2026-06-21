import { useState } from "react";
import { motion } from "framer-motion";
import { History, GitCompareArrows, Calendar, Layers, TrendingDown, TrendingUp, Cpu } from "lucide-react";
import { GlassCard, SectionTitle, PageTransition, GlowButton } from "../components/ui";
import { MultiLineChart, BarChart, LineChart, RadarChart } from "../components/Charts";
import { STATE_ENV, STATE_ENV_MAP } from "../lib/mockData";

// synthetic historical decadal data (deterministic per state)
function decade(name: string, base: number, vol: number): number[] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  for (let y = 0; y < 5; y++) {
    const delta = (((h >> y) % 100) / 100 - 0.5) * vol;
    out.push(Math.round((base + delta) * 10) / 10);
  }
  return out;
}

export function HistoricalComparison() {
  const [a, setA] = useState("Delhi");
  const [b, setB] = useState("Maharashtra");
  const ea = STATE_ENV_MAP[a], eb = STATE_ENV_MAP[b];

  const years = ["2010-12", "2013-15", "2016-18", "2019-21", "2022-24"];
  const tempA = decade(a, ea.temp - 2, 4);
  const tempB = decade(b, eb.temp - 2, 4);
  const aqiA = decade(a, ea.aqi - 40, 60);
  const aqiB = decade(b, eb.aqi - 40, 60);
  const rainA = decade(a, ea.rainfall - 4, 10);
  const rainB = decade(b, eb.rainfall - 4, 10);

  const trendA = tempA[tempA.length - 1] - tempA[0];
  const trendB = tempB[tempB.length - 1] - tempB[0];

  return (
    <PageTransition>
      <SectionTitle kicker="Temporal Analytics · Module 06" title="Historical Comparison"
        subtitle="Compare decadal environmental patterns across regions to detect climate drift and validate AI forecasts against recorded history."
        icon={<History size={22} />} />

      <GlassCard className="p-4 mb-4" hover={false}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <GitCompareArrows size={15} className="text-cyan-glow" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-deep/55">Region A</span>
            <select value={a} onChange={(e) => setA(e.target.value)} className="input-glow !w-auto !py-1.5 !px-3 font-semibold">
              {STATE_ENV.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <span className="text-cyan-glow font-bold">VS</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-deep/55">Region B</span>
            <select value={b} onChange={(e) => setB(e.target.value)} className="input-glow !w-auto !py-1.5 !px-3 font-semibold">
              {STATE_ENV.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <span className="chip"><Calendar size={12} /> 2010 → 2024 · 5 epochs</span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Layers size={15} className="text-orange-500" /> Decadal Temperature · °C</h3>
          <MultiLineChart height={250} labels={years}
            datasets={[{ label: a, data: tempA, color: "#fb923c", fill: true }, { label: b, data: tempB, color: "#22d3ee", fill: true }]} />
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Layers size={15} className="text-purple-500" /> Decadal AQI</h3>
          <MultiLineChart height={250} labels={years}
            datasets={[{ label: a, data: aqiA, color: "#c084fc", fill: true }, { label: b, data: aqiB, color: "#34d399", fill: true }]} />
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Layers size={15} className="text-sky-500" /> Decadal Rainfall · mm</h3>
          <MultiLineChart height={250} labels={years}
            datasets={[{ label: a, data: rainA, color: "#38bdf8", fill: true }, { label: b, data: rainB, color: "#0284c7", fill: true }]} />
        </GlassCard>
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Cpu size={15} className="text-cyan-glow" /> Current Risk Profile · A vs B</h3>
          <RadarChart height={250} labels={["Heat", "Flood", "AQI", "Humidity", "Wind"]}
            datasets={[{ label: a, data: [ea.heatRisk, ea.floodRisk, ea.aqiRisk, ea.humidity, ea.wind * 2], color: "#fb923c" }, { label: b, data: [eb.heatRisk, eb.floodRisk, eb.aqiRisk, eb.humidity, eb.wind * 2], color: "#22d3ee" }]} />
        </GlassCard>
      </div>

      {/* comparison table */}
      <GlassCard className="p-5 mt-4" hover={false}>
        <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><GitCompareArrows size={15} className="text-cyan-glow" /> Side-by-Side Telemetry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-cyan-glow/20">
                <th className="py-2 font-mono text-[10px] uppercase text-deep/55">Metric</th>
                <th className="py-2 font-semibold text-deep">{a}</th>
                <th className="py-2 font-semibold text-deep">{b}</th>
                <th className="py-2 font-mono text-[10px] uppercase text-deep/55">Δ</th>
                <th className="py-2 font-mono text-[10px] uppercase text-deep/55">Trend A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-glow/10">
              {[
                ["Temperature °C", ea.temp, eb.temp], ["Feels Like °C", ea.feelsLike, eb.feelsLike],
                ["Humidity %", ea.humidity, eb.humidity], ["AQI", ea.aqi, eb.aqi],
                ["PM2.5", ea.pm25, eb.pm25], ["Rainfall mm", ea.rainfall, eb.rainfall],
                ["Wind km/h", ea.wind, eb.wind], ["Heat Risk %", ea.heatRisk, eb.heatRisk],
                ["Flood Risk %", ea.floodRisk, eb.floodRisk], ["AQI Risk %", ea.aqiRisk, eb.aqiRisk],
              ].map((row) => {
                const d = (row[1] as number) - (row[2] as number);
                return (
                  <tr key={row[0] as string} className="hover:bg-cyan-glow/5">
                    <td className="py-2 text-deep/70">{row[0]}</td>
                    <td className="py-2 font-mono font-bold text-deep">{row[1]}</td>
                    <td className="py-2 font-mono font-bold text-deep">{row[2]}</td>
                    <td className={`py-2 font-mono font-bold ${d > 0 ? "text-red-500" : d < 0 ? "text-emerald-500" : "text-deep/50"}`}>{d > 0 ? "+" : ""}{d.toFixed(1)}</td>
                    <td className="py-2">{trendA > 0 ? <TrendingUp size={15} className="text-orange-500" /> : <TrendingDown size={15} className="text-sky-500" />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="p-5 mt-4" hover={false}>
        <h3 className="font-display text-sm font-bold text-deep mb-3">Climate Drift Summary</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-deep/75 leading-relaxed">
          <div className="rounded-xl bg-white/45 border border-cyan-glow/20 p-3">
            <p className="font-semibold text-deep mb-1">{a}</p>
            <p>Temperature shifted {trendA > 0 ? "+" : ""}{trendA.toFixed(1)}°C over 5 epochs. {trendA > 1.5 ? "Significant warming detected — aligns with urban heat-island amplification." : "Marginal drift within natural variance."}</p>
          </div>
          <div className="rounded-xl bg-white/45 border border-cyan-glow/20 p-3">
            <p className="font-semibold text-deep mb-1">{b}</p>
            <p>Temperature shifted {trendB > 0 ? "+" : ""}{trendB.toFixed(1)}°C over 5 epochs. {trendB > 1.5 ? "Warming trend corroborates coastal climate models." : "Stable thermal regime."}</p>
          </div>
        </div>
        <div className="mt-3"><GlowButton variant="ghost" className="!text-xs">Export decadal comparison CSV ↗</GlowButton></div>
      </GlassCard>
    </PageTransition>
  );
}
