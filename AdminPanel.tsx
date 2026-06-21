import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Server, Satellite, ScrollText, Lock, Activity, Cpu, Database, Trash2, UserPlus, Check, X } from "lucide-react";
import { GlassCard, SectionTitle, StatCard, PageTransition, GlowButton } from "../components/ui";
import { RadarChart } from "../components/Charts";
import { NATIONAL_STATS } from "../lib/mockData";
import { useAuth, type Role } from "../contexts/AuthContext";

export const ROLES_HINT: Record<string, string> = {
  "Public User": "View-only access to public dashboards.",
  Analyst: "Prediction, comparison & copilot access.",
  Scientist: "Full intelligence + upload modules.",
  "Government Officer": "Government dashboard + briefings.",
  Admin: "Full system control including this panel.",
};

interface MockUser { uid: string; name: string; email: string; role: Role; status: "Active" | "Suspended"; last: string; }

const SEED: MockUser[] = [
  { uid: "U-A1", name: "Dr. R. Vikram", email: "vikram@isro.gov.in", role: "Scientist", status: "Active", last: "2m ago" },
  { uid: "U-A2", name: "A. Menon", email: "menon@isac.gov.in", role: "Analyst", status: "Active", last: "5m ago" },
  { uid: "U-A3", name: "S. Khanna", email: "khanna@moefcc.gov.in", role: "Government Officer", status: "Active", last: "1h ago" },
  { uid: "U-A4", name: "P. Das", email: "das@ndma.gov.in", role: "Government Officer", status: "Active", last: "12m ago" },
  { uid: "U-A5", name: "K. Rao", email: "rao@isro.gov.in", role: "Admin", status: "Active", last: "just now" },
  { uid: "U-A6", name: "Guest User", email: "guest@public.in", role: "Public User", status: "Active", last: "30m ago" },
  { uid: "U-A7", name: "T. Banerjee", email: "banerjee@cpcb.gov.in", role: "Analyst", status: "Suspended", last: "3d ago" },
  { uid: "U-A8", name: "M. Iyer", email: "iyer@imd.gov.in", role: "Scientist", status: "Active", last: "8m ago" },
];

const AUDIT = [
  { who: "U-A5", what: "Escalated Assam to SEVERE", when: "17:42 IST" },
  { who: "U-A1", what: "Ran heat prediction · Delhi", when: "17:38 IST" },
  { who: "U-A3", what: "Dispatched cabinet briefing", when: "17:30 IST" },
  { who: "U-A2", what: "Uploaded SAR scene · Assam", when: "17:12 IST" },
  { who: "U-A5", what: "Suspended U-A7", when: "16:55 IST" },
  { who: "U-A4", what: "Triggered NDRF pre-position", when: "16:40 IST" },
];

const SATELLITES = [
  { id: "SAT-7", name: "INSAT-3DR", load: 72, status: "Nominal" },
  { id: "SAT-3", name: "Sentinel-2", load: 58, status: "Nominal" },
  { id: "SAT-1", name: "Cartosat-3", load: 41, status: "Nominal" },
  { id: "SAT-5", name: "Resourcesat-2A", load: 88, status: "Elevated" },
  { id: "SAT-6", name: "Scatsat-1", load: 33, status: "Nominal" },
  { id: "SAT-4", name: "GHRC/LANCE-FIRMS", load: 64, status: "Nominal" },
];

export function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState(SEED);
  const [q, setQ] = useState("");

  const filtered = users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()) || u.role.toLowerCase().includes(q.toLowerCase()));

  const toggleStatus = (uid: string) => setUsers((us) => us.map((u) => u.uid === uid ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u));
  const remove = (uid: string) => setUsers((us) => us.filter((u) => u.uid !== uid));

  return (
    <PageTransition>
      <SectionTitle kicker="System Authority · Module 11" title="Admin Panel"
        subtitle="User management, satellite health, access control, and audit trail. Restricted to Top Secret clearance."
        icon={<ShieldCheck size={22} />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users.length} icon={<Users size={18} />} accent="#0ea5e9" sub={`${users.filter((u) => u.status === "Active").length} active`} />
        <StatCard label="Satellites" value={NATIONAL_STATS.satellites} icon={<Satellite size={18} />} accent="#22d3ee" sub="6 nominal" />
        <StatCard label="Sensors" value={NATIONAL_STATS.sensors} icon={<Server size={18} />} accent="#38bdf8" sub="98.4% online" />
        <StatCard label="Uptime" value={NATIONAL_STATS.uptime} decimals={2} suffix="%" icon={<Activity size={18} />} accent="#34d399" sub="30-day SLA" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        {/* user table */}
        <GlassCard className="xl:col-span-2 p-5" hover={false}>
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3 className="font-display text-sm font-bold text-deep flex items-center gap-2"><Users size={15} className="text-cyan-glow" /> User Management</h3>
            <div className="flex items-center gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="input-glow !w-40 !py-1.5 !text-xs" />
              <GlowButton className="!text-xs !py-1.5 flex items-center gap-1"><UserPlus size={13} /> Add</GlowButton>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto pr-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white/70 backdrop-blur">
                <tr className="text-left border-b border-cyan-glow/20">
                  <th className="py-2 px-2 font-mono text-[10px] uppercase text-deep/55">User</th>
                  <th className="py-2 px-2 font-mono text-[10px] uppercase text-deep/55">Role</th>
                  <th className="py-2 px-2 font-mono text-[10px] uppercase text-deep/55">Status</th>
                  <th className="py-2 px-2 font-mono text-[10px] uppercase text-deep/55">Last</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-glow/10">
                {filtered.map((u) => (
                  <motion.tr key={u.uid} layout className="hover:bg-cyan-glow/5">
                    <td className="py-2 px-2"><p className="font-semibold text-deep">{u.name}</p><p className="text-[10px] text-deep/55 font-mono">{u.email}</p></td>
                    <td className="py-2 px-2"><span className="chip">{u.role}</span></td>
                    <td className="py-2 px-2">
                      <span className={`chip ${u.status === "Active" ? "!text-emerald-600 !border-emerald-400/40 !bg-emerald-400/10" : "!text-red-500 !border-red-400/40 !bg-red-400/10"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.status === "Active" ? "bg-emerald-400 animate-pulse-glow" : "bg-red-500"}`} />{u.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-mono text-[11px] text-deep/55">{u.last}</td>
                    <td className="py-2 px-2 flex items-center gap-1 justify-end">
                      <button onClick={() => toggleStatus(u.uid)} className="grid place-items-center h-7 w-7 rounded-lg btn-ghost !p-0 hover:!text-cyan-glow" title="Toggle">{u.status === "Active" ? <X size={13} /> : <Check size={13} />}</button>
                      <button onClick={() => remove(u.uid)} className="grid place-items-center h-7 w-7 rounded-lg btn-ghost !p-0 hover:!text-red-500" title="Remove"><Trash2 size={13} /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="py-6 text-center text-deep/50 text-sm">No users match filter.</p>}
          </div>
        </GlassCard>

        {/* system health */}
        <div className="space-y-4">
          <GlassCard className="p-5" hover={false}>
            <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Cpu size={15} className="text-cyan-glow" /> System Health</h3>
            <RadarChart height={220} labels={["API", "DB", "Sat", "AI", "Auth", "Map"]}
              datasets={[{ label: "Health %", data: [99, 98, 95, 96, 100, 99], color: "#22d3ee" }]} />
          </GlassCard>
          <GlassCard className="p-5" hover={false}>
            <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Database size={15} className="text-cyan-glow" /> Data Pipeline</h3>
            <div className="space-y-2 text-xs">
              {[["OpenWeather", 99, "#22d3ee"], ["NASA FIRMS", 96, "#fb923c"], ["Mapbox tiles", 99, "#0ea5e9"], ["Firebase Auth", 100, "#34d399"]].map(([n, v, c]) => (
                <div key={n as string} className="flex items-center gap-2"><span className="w-24 text-deep/70">{n}</span><div className="flex-1 h-1.5 rounded-full bg-white/50 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${v}%`, background: c as string }} /></div><span className="font-mono text-deep/60">{v}%</span></div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* satellites + audit */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Satellite size={15} className="text-cyan-glow" /> Satellite Fleet Status</h3>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {SATELLITES.map((s) => (
              <div key={s.id} className="rounded-xl bg-white/45 border border-cyan-glow/20 p-3">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-bold text-deep">{s.name}</p><p className="text-[10px] text-deep/55 font-mono">{s.id}</p></div>
                  <span className={`chip ${s.status === "Nominal" ? "!text-emerald-600 !border-emerald-400/40 !bg-emerald-400/10" : "!text-orange-600 !border-orange-400/40 !bg-orange-400/10"}`}>{s.status}</span>
                </div>
                <div className="mt-2 flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full bg-white/50 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.load}%`, background: s.load > 80 ? "#fb923c" : "#22d3ee" }} /></div><span className="font-mono text-[10px] text-deep/55">{s.load}%</span></div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><ScrollText size={15} className="text-cyan-glow" /> Audit Trail</h3>
          <div className="relative pl-5 space-y-3">
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gradient-to-b from-cyan-glow to-transparent" />
            {AUDIT.map((a, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-3.5 top-1 h-2.5 w-2.5 rounded-full bg-cyan-glow ring-2 ring-white animate-pulse-glow" />
                <p className="text-sm font-semibold text-deep">{a.what}</p>
                <p className="text-[10px] text-deep/55 font-mono">{a.who} · {a.when}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* access control */}
      <GlassCard className="p-5 mt-4" hover={false}>
        <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Lock size={15} className="text-cyan-glow" /> Role-Based Access Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b border-cyan-glow/20">
                <th className="py-2 pr-4 font-mono uppercase text-deep/55">Module</th>
                {(["Public User", "Analyst", "Scientist", "Gov Officer", "Admin"] as Role[]).map((r) => <th key={r} className="py-2 px-2 font-mono uppercase text-deep/55 text-center">{r.replace("Government ", "Gov ")}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-glow/10">
              {["Dashboard", "Heat/Flood/AQI", "AI Copilot", "Prediction", "Historical", "Emergency", "Upload", "Gov Dashboard", "Settings", "Admin Panel"].map((m, i) => (
                <tr key={m} className="hover:bg-cyan-glow/5">
                  <td className="py-2 pr-4 font-semibold text-deep">{m}</td>
                  {([true, true, true, true, true][i] ?? true) && (["Public User", "Analyst", "Scientist", "Government Officer", "Admin"] as Role[]).map((r, j) => {
                    const allowed = (i < 3 || i === 5 || i === 8) ? true : (i === 3 || i === 4 || i === 6) ? (r !== "Public User") : (i === 7) ? (r === "Government Officer" || r === "Admin") : (i === 9) ? (r === "Admin") : true;
                    return <td key={r} className="py-2 px-2 text-center">{allowed ? <Check size={14} className="inline text-emerald-500" /> : <X size={13} className="inline text-deep/25" />}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-deep/55">Signed in as <b className="text-deep">{user?.name}</b> · {user?.clearance} clearance · all actions logged to immutable audit store.</p>
      </GlassCard>
    </PageTransition>
  );
}
