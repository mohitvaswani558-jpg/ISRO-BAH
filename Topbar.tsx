import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Bell, LogOut, ChevronRight, Activity, Clock } from "lucide-react";
import { NAV } from "../lib/nav";
import { useAuth } from "../contexts/AuthContext";
import { ALERTS } from "../lib/mockData";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const loc = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const current = NAV.find((i) => i.path === loc.pathname) ?? NAV[0];
  const [clock, setClock] = useState(new Date());
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => { const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t); }, []);

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const m = q.toLowerCase();
    const hit = NAV.find((i) => i.label.toLowerCase().includes(m) || i.id.includes(m));
    if (hit) nav(hit.path);
    setQ("");
  };

  return (
    <header className="sticky top-0 z-30 h-16 px-4 md:px-6 flex items-center gap-3 glass-strong border-b border-cyan-glow/20">
      <button onClick={onMenu} className="md:hidden grid place-items-center h-10 w-10 rounded-lg btn-ghost !p-0"><Menu size={18} /></button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-widest text-deep/45 hidden sm:block">GeoSentinel</span>
        <ChevronRight size={12} className="text-deep/30 hidden sm:block" />
        <h2 className="font-display text-sm md:text-base font-bold text-deep truncate">{current.label}</h2>
      </div>

      <form onSubmit={go} className="ml-4 hidden lg:flex items-center gap-2 rounded-xl glass px-3 py-1.5 w-72">
        <Search size={15} className="text-electric" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search mission modules…"
          className="bg-transparent outline-none text-sm text-deep placeholder:text-deep/40 flex-1" />
        <kbd className="font-mono text-[9px] text-deep/40 border border-cyan-glow/30 rounded px-1">⌘K</kbd>
      </form>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <div className="hidden md:flex items-center gap-2 chip">
          <Activity size={12} className="text-emerald-500" />
          <span className="font-mono text-[10px] text-deep/70">LIVE FEED</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 font-mono text-xs text-deep/70">
          <Clock size={13} className="text-electric" />
          <span>{clock.toLocaleTimeString("en-IN", { hour12: false })}</span>
          <span className="text-deep/40">IST</span>
        </div>

        {/* alerts */}
        <div className="relative">
          <button onClick={() => setBellOpen((b) => !b)} className="relative grid place-items-center h-10 w-10 rounded-lg btn-ghost !p-0">
            <Bell size={17} />
            {ALERTS.length > 0 && (
              <span className="absolute -top-1 -right-1 grid place-items-center h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold animate-pulse-glow">{ALERTS.length}</span>
            )}
          </button>
          <AnimatePresence>
            {bellOpen && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 mt-2 w-80 glass-strong rounded-xl p-3 z-50 max-h-96 overflow-y-auto">
                <p className="font-display text-sm font-bold text-deep mb-2">Active Alerts · {ALERTS.length}</p>
                <div className="space-y-2">
                  {ALERTS.slice(0, 6).map((a) => (
                    <div key={a.id} className="rounded-lg bg-white/50 border border-cyan-glow/25 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-deep">{a.state}</span>
                        <span className="chip !py-0.5 !text-[9px]" style={{ borderColor: a.severity === "severe" ? "#ef4444aa" : "#fb923caa", color: a.severity === "severe" ? "#ef4444" : "#fb923c" }}>{a.severity.toUpperCase()}</span>
                      </div>
                      <p className="text-[11px] text-deep/65 mt-1">{a.message}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => { nav("/emergency"); setBellOpen(false); }} className="mt-2 w-full btn-ghost text-xs !py-1.5">Open Emergency Center →</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* user */}
        <div className="relative">
          <button onClick={() => setUserOpen((b) => !b)} className="flex items-center gap-2 rounded-xl glass px-2 py-1.5 hover:glow-cyan transition">
            <img src={user?.avatar} alt="" className="h-7 w-7 rounded-full ring-1 ring-cyan-glow/40" />
            <span className="hidden sm:block text-xs font-semibold text-deep max-w-[120px] truncate">{user?.name}</span>
          </button>
          <AnimatePresence>
            {userOpen && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 mt-2 w-56 glass-strong rounded-xl p-3 z-50">
                <div className="flex items-center gap-3 pb-2 border-b border-cyan-glow/20">
                  <img src={user?.avatar} alt="" className="h-10 w-10 rounded-full ring-2 ring-cyan-glow/40" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-deep">{user?.name}</p>
                    <p className="truncate text-[11px] text-deep/60">{user?.email}</p>
                  </div>
                </div>
                <div className="py-2 space-y-1 text-xs text-deep/70">
                  <div className="flex justify-between"><span>Role</span><span className="font-mono text-electric">{user?.role}</span></div>
                  <div className="flex justify-between"><span>Clearance</span><span className="font-mono text-electric">{user?.clearance}</span></div>
                  <div className="flex justify-between"><span>Agency</span><span className="font-mono text-electric truncate ml-2">{user?.agency}</span></div>
                </div>
                <button onClick={() => { logout(); nav("/login"); }} className="mt-1 w-full btn-ghost text-xs !py-2 flex items-center justify-center gap-2 !text-red-500 hover:!bg-red-500/10">
                  <LogOut size={13} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
