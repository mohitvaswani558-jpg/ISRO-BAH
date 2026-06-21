import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Siren, AlertOctagon, ShieldAlert, Radio, MapPin, Bell, Phone, Activity, Zap, ChevronRight } from "lucide-react";
import { GlassCard, SectionTitle, RiskBadge, PageTransition, GlowButton } from "../components/ui";
import { IndiaMap } from "../components/IndiaMap";
import { ALERTS, STATE_ENV_MAP, RISK_COLOR } from "../lib/mockData";

export function EmergencyAlert() {
  const [armed, setArmed] = useState(true);
  const [sel, setSel] = useState<string | null>(ALERTS[0]?.state ?? "Delhi");
  const severe = ALERTS.filter((a) => a.severity === "severe");

  return (
    <PageTransition>
      {/* emergency banner */}
      <AnimatePresence>
        {armed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-4 rounded-2xl overflow-hidden border-2 border-red-500/50">
            <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-5 py-3 flex items-center gap-3">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <Siren size={22} className="text-white" />
              </motion.div>
              <div className="text-white">
                <p className="font-display font-bold text-sm">EMERGENCY MODE ACTIVE — NATIONAL ENVIRONMENTAL THREAT DETECTED</p>
                <p className="text-[11px] text-white/85">{severe.length} severe alerts · {ALERTS.length} total active · auto-escalation engaged</p>
              </div>
              <button onClick={() => setArmed(false)} className="ml-auto rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-semibold text-white">Acknowledge</button>
            </div>
            <motion.div className="h-0.5 bg-red-400" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
          </motion.div>
        )}
      </AnimatePresence>

      <SectionTitle kicker="Crisis Response · Module 07" title="Emergency Alert Center"
        subtitle="Real-time threat monitoring with flash warning indicators, affected-region highlighting, and actionable emergency recommendations."
        icon={<ShieldAlert size={22} />} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard className="xl:col-span-2 p-5" hover={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-bold text-deep flex items-center gap-2"><AlertOctagon size={16} className="text-red-500" /> Affected Regions</h3>
            <GlowButton variant="ghost" className="!text-xs !py-1.5" onClick={() => setArmed(true)}><Zap size={12} /> Re-arm emergency</GlowButton>
          </div>
          <IndiaMap height={440} selected={sel} onSelect={setSel}
            colorFor={(n) => {
              const a = ALERTS.find((al) => al.state === n);
              if (!a) return "rgba(186,230,253,0.4)";
              return RISK_COLOR[a.severity] + "cc";
            }}
            tooltip={(n) => {
              const a = ALERTS.find((al) => al.state === n);
              if (!a) return <p className="text-deep/70 text-xs">{n} — nominal</p>;
              return (
                <div>
                  <p className="font-display font-bold text-deep text-sm">{n}</p>
                  <p className="text-[11px] font-semibold" style={{ color: RISK_COLOR[a.severity] }}>{a.type} · {a.severity.toUpperCase()}</p>
                  <p className="text-[11px] text-deep/70">{a.message}</p>
                </div>
              );
            }}
          />
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5 bg-gradient-to-br from-red-500/10 to-orange-500/5" hover={false}>
            <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Activity size={15} className="text-red-500" /> Threat Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Severe" value={severe.length} color="#ef4444" />
              <Stat label="High" value={ALERTS.filter((a) => a.severity === "high").length} color="#fb923c" />
              <Stat label="Total Alerts" value={ALERTS.length} color="#0ea5e9" />
              <Stat label="States Affected" value={new Set(ALERTS.map((a) => a.state)).size} color="#22d3ee" />
            </div>
          </GlassCard>

          <GlassCard className="p-5" hover={false}>
            <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Radio size={15} className="text-cyan-glow" /> Quick Response</h3>
            <div className="space-y-2">
              {[
                { l: "Broadcast SMS advisory", i: <Bell size={14} /> },
                { l: "Dispatch NDRF teams", i: <Phone size={14} /> },
                { l: "Notify state agencies", i: <Radio size={14} /> },
                { l: "Activate evacuation routes", i: <MapPin size={14} /> },
              ].map((r) => (
                <button key={r.l} className="w-full flex items-center gap-2 rounded-xl bg-white/45 border border-cyan-glow/20 p-2.5 text-xs font-medium text-deep/75 hover:border-red-400/50 hover:glow-cyan transition">
                  <span className="text-cyan-glow">{r.i}</span>{r.l}<ChevronRight size={13} className="ml-auto opacity-40" />
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* alert list */}
      <GlassCard className="p-5 mt-4" hover={false}>
        <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Siren size={15} className="text-red-500" /> Active Emergency Alerts</h3>
        <div className="space-y-2">
          {ALERTS.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-white/50 border border-cyan-glow/20 p-3 flex flex-col md:flex-row md:items-center gap-3 hover:border-red-400/40 transition">
              <div className="flex items-center gap-3 md:w-56">
                <div className="grid place-items-center h-10 w-10 rounded-lg" style={{ background: RISK_COLOR[a.severity] + "22" }}>
                  {a.type === "Heatwave" ? <Siren size={18} style={{ color: RISK_COLOR[a.severity] }} /> : a.type === "Flood" ? <Siren size={18} style={{ color: RISK_COLOR[a.severity] }} /> : <Siren size={18} style={{ color: RISK_COLOR[a.severity] }} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-deep">{a.state}</p>
                  <p className="text-[10px] text-deep/55 font-mono">{a.id} · {new Date(a.issued).toLocaleString("en-IN", { day: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="chip !text-[9px]">{a.type}</span>
                  <RiskBadge level={a.severity} risk={a.risk} />
                </div>
                <p className="text-xs text-deep/70">{a.message}</p>
                <p className="text-[11px] text-deep/60 mt-1"><span className="font-semibold text-deep">Recommendation:</span> {a.action}</p>
              </div>
              <GlowButton variant="ghost" className="!text-xs !py-1.5 shrink-0">Track</GlowButton>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </PageTransition>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-white/50 border border-cyan-glow/20 p-3">
      <p className="font-display text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-deep/55">{label}</p>
    </div>
  );
}
