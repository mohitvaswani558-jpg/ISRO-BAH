import { motion } from "framer-motion";
import { Landmark, FileBarChart, Users, Building2, ShieldCheck, IndianRupee, CheckSquare, Send, Download, Activity, Satellite, Radar } from "lucide-react";
import { GlassCard, SectionTitle, StatCard, RiskBadge, ProgressBar, PageTransition, GlowButton, AnimatedNumber } from "../components/ui";
import { BarChart, DoughnutChart, LineChart } from "../components/Charts";
import { STATE_ENV, NATIONAL_STATS, ALERTS, aqiCategory } from "../lib/mockData";

const AGENCIES = [
  { name: "ISRO · SAC", role: "Earth Observation", status: "Active", load: 72 },
  { name: "IMD", role: "Meteorology", status: "Active", load: 64 },
  { name: "CPCB", role: "Air Quality", status: "Active", load: 81 },
  { name: "NDMA", role: "Disaster Mgmt", status: "Active", load: 58 },
  { name: "MoEFCC", role: "Environment", status: "Active", load: 49 },
  { name: "NESAC", role: "North-East EO", status: "Active", load: 38 },
];

const ACTIONS = [
  { t: "Issue national heatwave advisory", d: "Auto-drafted from AI prediction engine · 9 states flagged.", done: false },
  { t: "Pre-position NDRF in Assam & Bihar", d: "Flood probability >60% in 4 districts.", done: false },
  { t: "Activate GRAP Stage-III (Delhi NCR)", d: "AQI forecast crossing 300 tomorrow.", done: true },
  { t: "Brief Cabinet Secretary", d: "Daily environmental threat digest ready.", done: false },
  { t: "Publish public SMS broadcast", d: "12L citizens in severe-risk zones.", done: false },
];

export function GovernmentDashboard() {
  const topRisk = [...STATE_ENV].sort((a, b) => b.overallRisk - a.overallRisk).slice(0, 10);

  return (
    <PageTransition>
      <SectionTitle kicker="National Command · Module 09" title="Government Dashboard"
        subtitle="Consolidated environmental intelligence for ministry briefings, inter-agency coordination, and policy action tracking."
        icon={<Landmark size={22} />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="States at Risk" value={ALERTS.length} icon={<ShieldCheck size={18} />} accent="#ef4444" sub="Action required" trend="auto-escalated" />
        <StatCard label="Agencies Coordinated" value={AGENCIES.length} icon={<Building2 size={18} />} accent="#0ea5e9" sub="Inter-ministry live feed" />
        <StatCard label="Citizens Covered" value={12400000} icon={<Users size={18} />} accent="#22d3ee" sub="SMS advisory reach" trend="98% delivery" />
        <StatCard label="Budget Deployed" value={4.2} decimals={1} suffix=" Cr" icon={<IndianRupee size={18} />} accent="#34d399" sub="Emergency allocation" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <GlassCard className="xl:col-span-2 p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><FileBarChart size={15} className="text-cyan-glow" /> State-Wise Risk Ledger</h3>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto pr-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white/70 backdrop-blur">
                <tr className="text-left border-b border-cyan-glow/20">
                  <th className="py-2 px-2 font-mono text-[10px] uppercase text-deep/55">State</th>
                  <th className="py-2 px-2 font-mono text-[10px] uppercase text-deep/55">Heat</th>
                  <th className="py-2 px-2 font-mono text-[10px] uppercase text-deep/55">Flood</th>
                  <th className="py-2 px-2 font-mono text-[10px] uppercase text-deep/55">AQI</th>
                  <th className="py-2 px-2 font-mono text-[10px] uppercase text-deep/55">Overall</th>
                  <th className="py-2 px-2 font-mono text-[10px] uppercase text-deep/55">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-glow/10">
                {topRisk.map((s) => (
                  <tr key={s.code} className="hover:bg-cyan-glow/5">
                    <td className="py-2 px-2 font-semibold text-deep">{s.name}</td>
                    <td className="py-2 px-2"><MiniBar v={s.heatRisk} c="#fb923c" /></td>
                    <td className="py-2 px-2"><MiniBar v={s.floodRisk} c="#38bdf8" /></td>
                    <td className="py-2 px-2"><MiniBar v={s.aqiRisk} c="#c084fc" /></td>
                    <td className="py-2 px-2 font-mono font-bold" style={{ color: s.overallRisk >= 75 ? "#ef4444" : s.overallRisk >= 55 ? "#fb923c" : "#facc15" }}>{s.overallRisk}%</td>
                    <td className="py-2 px-2"><RiskBadge level={s.overallRisk >= 75 ? "severe" : s.overallRisk >= 55 ? "high" : "moderate"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5" hover={false}>
            <h3 className="font-display text-sm font-bold text-deep mb-3">Threat Composition</h3>
            <DoughnutChart
              labels={["Heatwave", "Flood", "Air Quality"]}
              data={[ALERTS.filter((a) => a.type === "Heatwave").length, ALERTS.filter((a) => a.type === "Flood").length, ALERTS.filter((a) => a.type === "Air Quality").length]}
              colors={["#fb923c", "#38bdf8", "#c084fc"]} height={200} />
          </GlassCard>
          <GlassCard className="p-5" hover={false}>
            <h3 className="font-display text-sm font-bold text-deep mb-3">National Risk Trend (30-day)</h3>
            <LineChart labels={Array.from({ length: 30 }, (_, i) => `${i + 1}`)} data={Array.from({ length: 30 }, (_, i) => 40 + Math.round(Math.sin(i / 3) * 12 + i * 0.4))} label="Avg Risk %" color="#0ea5e9" height={180} suffix="%" />
          </GlassCard>
        </div>
      </div>

      {/* agency coordination */}
      <GlassCard className="p-5 mt-4" hover={false}>
        <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Building2 size={15} className="text-cyan-glow" /> Inter-Agency Coordination</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AGENCIES.map((a) => (
            <motion.div key={a.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white/50 border border-cyan-glow/20 p-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-bold text-deep">{a.name}</p><p className="text-[10px] text-deep/55">{a.role}</p></div>
                <span className="chip !text-emerald-600 !border-emerald-400/40 !bg-emerald-400/10"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />{a.status}</span>
              </div>
              <div className="mt-2"><ProgressBar label="Data load" value={a.load} color="#22d3ee" /></div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* policy actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><CheckSquare size={15} className="text-cyan-glow" /> Policy Action Tracker</h3>
          <div className="space-y-2">
            {ACTIONS.map((a) => (
              <div key={a.t} className={`rounded-xl border p-3 flex items-start gap-3 ${a.done ? "bg-emerald-500/10 border-emerald-400/30" : "bg-white/45 border-cyan-glow/20"}`}>
                <div className={`grid place-items-center h-6 w-6 rounded-md mt-0.5 shrink-0 ${a.done ? "bg-emerald-500 text-white" : "border-2 border-cyan-glow/40"}`}>
                  {a.done && <CheckSquare size={13} />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${a.done ? "text-emerald-700" : "text-deep"}`}>{a.t}</p>
                  <p className="text-[11px] text-deep/60">{a.d}</p>
                </div>
                {!a.done && <GlowButton variant="ghost" className="!text-[10px] !py-1"><Send size={11} /></GlowButton>}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Activity size={15} className="text-cyan-glow" /> Mission Telemetry</h3>
          <div className="grid grid-cols-2 gap-3">
            <Kpi icon={<Satellite size={16} />} label="Satellites" value={NATIONAL_STATS.satellites} />
            <Kpi icon={<Radar size={16} />} label="Sensors" value={NATIONAL_STATS.sensors} />
            <Kpi icon={<Activity size={16} />} label="Uptime" value={NATIONAL_STATS.uptime} decimals={2} suffix="%" />
            <Kpi icon={<ShieldCheck size={16} />} label="Compliance" value={98} suffix="%" />
          </div>
          <div className="mt-3 rounded-xl bg-white/45 border border-cyan-glow/20 p-3">
            <p className="font-mono text-[10px] uppercase text-deep/55 mb-1">Next briefing</p>
            <p className="text-sm font-semibold text-deep">Cabinet Secretary · 17:30 IST</p>
            <p className="text-[11px] text-deep/60">Auto-digest ready · 12 charts, 9 alerts</p>
          </div>
          <div className="mt-3 flex gap-2">
            <GlowButton variant="ghost" className="!text-xs flex-1 flex items-center justify-center gap-1"><Download size={13} /> Briefing PDF</GlowButton>
            <GlowButton className="!text-xs flex-1 flex items-center justify-center gap-1"><Send size={13} /> Dispatch</GlowButton>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}

function MiniBar({ v, c }: { v: number; c: string }) {
  return <div className="flex items-center gap-1.5"><div className="h-1.5 w-16 rounded-full bg-white/50 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} /></div><span className="font-mono text-[10px] text-deep/60">{v}</span></div>;
}
function Kpi({ icon, label, value, decimals = 0, suffix = "" }: { icon: React.ReactNode; label: string; value: number; decimals?: number; suffix?: string }) {
  return (
    <div className="rounded-xl bg-white/50 border border-cyan-glow/20 p-3 flex items-center gap-2">
      <div className="grid place-items-center h-9 w-9 rounded-lg bg-cyan-glow/15 text-electric">{icon}</div>
      <div><p className="font-display text-lg font-bold text-deep"><AnimatedNumber value={value} decimals={decimals} suffix={suffix} /></p><p className="text-[10px] text-deep/55">{label}</p></div>
    </div>
  );
}
