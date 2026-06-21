import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Shield, Bell, Palette, KeyRound, Fingerprint, Check, LogOut, Moon, Sun, Volume2, Mail } from "lucide-react";
import { GlassCard, SectionTitle, PageTransition, GlowButton } from "../components/ui";
import { useAuth, type Role } from "../contexts/AuthContext";
import { ROLES_HINT } from "./AdminPanel";

const ACCENTS = ["#22d3ee", "#0ea5e9", "#38bdf8", "#a5f3fc", "#fb923c", "#c084fc"];

export function Settings() {
  const { user, updateProfile, setRole, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [accent, setAccent] = useState("#22d3ee");
  const [notif, setNotif] = useState({ push: true, email: true, sms: false, voice: true });
  const [saved, setSaved] = useState(false);

  const roles: Role[] = ["Public User", "Analyst", "Scientist", "Government Officer", "Admin"];

  const save = () => {
    updateProfile({ name, email });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageTransition>
      <SectionTitle kicker="Account · Module 10" title="Settings & Profile"
        subtitle="Manage identity, role clearance, notification preferences, and security posture."
        icon={<SettingsIcon size={22} />} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* profile card */}
        <GlassCard className="p-6 text-center relative overflow-hidden" hover={false}>
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full blur-3xl" style={{ background: accent + "55" }} />
          <div className="relative">
            <div className="relative inline-block">
              <img src={user?.avatar} alt="" className="h-24 w-24 rounded-full ring-4 ring-cyan-glow/40 mx-auto" />
              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-white grid place-items-center"><Check size={11} className="text-white" /></span>
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-deep">{user?.name}</h3>
            <p className="text-xs text-deep/60">{user?.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <span className="chip">{user?.role}</span>
              <span className="chip">{user?.clearance}</span>
              <span className="chip">{user?.loginMethod}</span>
            </div>
            <div className="mt-3 rounded-xl bg-white/45 border border-cyan-glow/20 p-3 text-left">
              <p className="font-mono text-[10px] uppercase text-deep/55">Agency</p>
              <p className="text-sm font-semibold text-deep">{user?.agency}</p>
              <p className="font-mono text-[10px] uppercase text-deep/55 mt-2">UID</p>
              <p className="text-xs font-mono text-electric">{user?.uid}</p>
              <p className="font-mono text-[10px] uppercase text-deep/55 mt-2">Joined</p>
              <p className="text-xs text-deep/70">{new Date(user?.joined ?? Date.now()).toLocaleDateString("en-IN")}</p>
            </div>
          </div>
        </GlassCard>

        {/* edit form */}
        <GlassCard className="xl:col-span-2 p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-4 flex items-center gap-2"><User size={15} className="text-cyan-glow" /> Identity</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="font-mono text-[10px] uppercase text-deep/55">Display name</label><input value={name} onChange={(e) => setName(e.target.value)} className="input-glow mt-1" /></div>
            <div><label className="font-mono text-[10px] uppercase text-deep/55">Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} className="input-glow mt-1" /></div>
          </div>

          <h3 className="font-display text-sm font-bold text-deep mt-5 mb-3 flex items-center gap-2"><Shield size={15} className="text-cyan-glow" /> Role & Clearance</h3>
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <button key={r} onClick={() => setRole(r)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${user?.role === r ? "bg-gradient-to-r from-cyan-glow to-azure text-white border-transparent glow-cyan" : "bg-white/40 text-deep/65 border-cyan-glow/25 hover:border-cyan-glow"}`}>
                {r}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-deep/55">Switching role changes clearance and accessible modules (demo). {ROLES_HINT[user?.role ?? "Public User"] ?? ""}</p>

          <h3 className="font-display text-sm font-bold text-deep mt-5 mb-3 flex items-center gap-2"><Palette size={15} className="text-cyan-glow" /> Interface Accent</h3>
          <div className="flex gap-2">
            {ACCENTS.map((c) => (
              <button key={c} onClick={() => setAccent(c)} className={`h-9 w-9 rounded-full transition ${accent === c ? "ring-2 ring-offset-2 ring-cyan-glow scale-110" : ""}`} style={{ background: c, boxShadow: `0 0 12px ${c}88` }} />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-deep/55"><Sun size={13} /> Light mission theme · <Moon size={13} className="opacity-40" /> dark mode roadmap Q4</div>

          <h3 className="font-display text-sm font-bold text-deep mt-5 mb-3 flex items-center gap-2"><Bell size={15} className="text-cyan-glow" /> Notifications</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {(Object.entries(notif) as [keyof typeof notif, boolean][]).map(([k, v]) => (
              <button key={k} onClick={() => setNotif((n) => ({ ...n, [k]: !n[k] }))} className="flex items-center justify-between rounded-xl bg-white/45 border border-cyan-glow/20 p-3 hover:border-cyan-glow transition">
                <span className="flex items-center gap-2 text-sm text-deep capitalize">
                  {k === "email" ? <Mail size={14} className="text-cyan-glow" /> : k === "voice" ? <Volume2 size={14} className="text-cyan-glow" /> : <Bell size={14} className="text-cyan-glow" />}
                  {k} alerts
                </span>
                <span className={`relative h-6 w-11 rounded-full transition ${v ? "bg-gradient-to-r from-cyan-glow to-azure" : "bg-deep/20"}`}>
                  <motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" style={{ left: v ? 22 : 2 }} />
                </span>
              </button>
            ))}
          </div>

          <h3 className="font-display text-sm font-bold text-deep mt-5 mb-3 flex items-center gap-2"><KeyRound size={15} className="text-cyan-glow" /> Security</h3>
          <div className="grid sm:grid-cols-3 gap-2 text-center">
            {[<Fingerprint size={16} />, <Shield size={16} />, <KeyRound size={16} />].map((icon, i) => (
              <div key={i} className="rounded-xl bg-white/45 border border-cyan-glow/20 p-3">
                <div className="grid place-items-center h-9 w-9 rounded-lg bg-cyan-glow/15 text-cyan-glow mx-auto mb-1">{icon}</div>
                <p className="text-xs font-semibold text-deep">{["MFA Enabled", "AES-256", "RBAC Active"][i]}</p>
                <p className="text-[10px] text-emerald-600 flex items-center justify-center gap-1"><Check size={10} /> verified</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <GlowButton onClick={save} className="flex-1 flex items-center justify-center gap-2">{saved ? <><Check size={15} /> Saved</> : "Save Changes"}</GlowButton>
            <GlowButton variant="ghost" onClick={logout} className="!text-red-500 hover:!bg-red-500/10 flex items-center gap-2"><LogOut size={14} /> Sign Out</GlowButton>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
