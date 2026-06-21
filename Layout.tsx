import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ParticleField } from "./Backgrounds";

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();

  return (
    <div className="flex min-h-screen relative">
      {/* ambient particles */}
      <ParticleField className="fixed inset-0 z-0 opacity-50" count={28} />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 relative">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <AnimatePresence mode="wait">
              <div key={loc.pathname}>
                <Outlet />
              </div>
            </AnimatePresence>
          </div>
        </main>
        <footer className="px-6 py-3 border-t border-cyan-glow/15 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-deep/45">
          <span>© 2024 GeoSentinel AI · ISRO Earth Observation Mission Control · Classified</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" /> Telemetry OK</span>
            <span>SAT-7 · 1840 sensors · NASA FIRMS sync</span>
          </span>
        </footer>
      </div>
    </div>
  );
}
