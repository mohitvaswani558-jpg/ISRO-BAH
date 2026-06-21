import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Satellite, ChevronRight } from "lucide-react";
import { NAV, GROUPS, canAccess, type NavItem } from "../lib/nav";
import { useAuth } from "../contexts/AuthContext";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const role = user?.role ?? "Public User";
  const loc = useLocation();

  const items = NAV.filter((i) => canAccess(i, role));

  return (
    <>
      {/* mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40 bg-deep/30 backdrop-blur-sm md:hidden" />
        )}
      </AnimatePresence>

      <aside className={`fixed md:sticky top-0 z-50 h-screen w-72 shrink-0 glass-strong border-r border-cyan-glow/25 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-cyan-glow/20">
          <div className="flex items-center gap-3">
            <div className="relative grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-glow to-deep glow-cyan">
              <Satellite size={20} className="text-white" />
              <span className="absolute inset-0 rounded-xl border border-white/40 animate-pulse-glow" />
            </div>
            <div>
              <p className="font-display text-[15px] font-extrabold leading-none holo-text">GeoSentinel</p>
              <p className="font-mono text-[9px] tracking-[0.25em] text-electric/80">ISRO · AI · GEO</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-deep/60 hover:text-cyan-glow"><X size={18} /></button>
        </div>

        {/* mission status */}
        <div className="mx-4 mt-3 rounded-xl glass px-3 py-2.5 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
          <span className="font-mono text-[10px] tracking-widest text-deep/70">MISSION ACTIVE</span>
          <span className="ml-auto font-mono text-[10px] text-electric">99.98%</span>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {GROUPS.map((g) => {
            const groupItems = items.filter((i) => i.group === g);
            if (groupItems.length === 0) return null;
            return (
              <div key={g}>
                <p className="px-2 mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-deep/45">{g}</p>
                <div className="space-y-1">
                  {groupItems.map((item: NavItem) => (
                    <NavLink key={item.id} to={item.path} end={item.path === "/"} onClick={onClose}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${isActive ? "text-deep" : "text-deep/65 hover:text-deep"}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span layoutId="navActive" className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-glow/25 to-azure/10 border border-cyan-glow/50 glow-cyan"
                              transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                          )}
                          <span className={`relative grid place-items-center h-8 w-8 rounded-lg transition ${isActive ? "bg-gradient-to-br from-cyan-glow to-deep text-white" : "bg-white/50 text-electric group-hover:text-cyan-glow group-hover:bg-cyan-glow/15"}`}>
                            {item.icon}
                          </span>
                          <span className="relative font-medium">{item.label}</span>
                          {item.badge && (
                            <span className={`relative ml-auto chip !py-0.5 !px-1.5 !text-[8px] ${item.badge === "ALERT" ? "!border-red-400/60 !bg-red-400/15 !text-red-500" : "!border-cyan-glow/40 !bg-cyan-glow/10 !text-electric"}`}>{item.badge}</span>
                          )}
                          <ChevronRight size={14} className={`relative transition ${isActive ? "opacity-100 text-cyan-glow" : "opacity-0 group-hover:opacity-40"}`} />
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* user mini */}
        <div className="border-t border-cyan-glow/20 p-3">
          <div className="flex items-center gap-3 rounded-xl glass px-3 py-2.5">
            <img src={user?.avatar} alt="" className="h-9 w-9 rounded-full ring-2 ring-cyan-glow/40" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-deep">{user?.name}</p>
              <p className="truncate font-mono text-[9px] text-electric">{user?.role} · {user?.clearance}</p>
            </div>
          </div>
          <p className="mt-2 px-1 font-mono text-[9px] text-deep/40 text-center">v3.2.1 · build 20240619 · classified</p>
        </div>
      </aside>
    </>
  );
}
