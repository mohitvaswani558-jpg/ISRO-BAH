import { useEffect, useRef } from "react";

/** Floating particle field — light cyan glowing dots drifting upward. */
export function ParticleField({ count = 36, className = "" }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * devicePixelRatio);
    const onResize = () => { w = canvas.width = canvas.offsetWidth * devicePixelRatio; h = canvas.height = canvas.offsetHeight * devicePixelRatio; };
    window.addEventListener("resize", onResize);
    const parts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2.4 + 0.6,
      vy: -(Math.random() * 0.4 + 0.15) * devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.2 * devicePixelRatio,
      a: Math.random() * 0.5 + 0.2,
      hue: Math.random() > 0.5 ? 187 : 199,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y += p.vy; p.x += p.vx;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.a})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [count]);
  return <canvas ref={ref} className={`pointer-events-none ${className}`} />;
}

/** Animated radar sweep + orbit rings. */
export function RadarBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[180, 320, 480, 640].map((s, i) => (
          <div key={i} className="absolute rounded-full border border-cyan-glow/15"
            style={{ width: s, height: s, left: -s / 2, top: -s / 2 }} />
        ))}
        <div className="absolute rounded-full animate-spin-slow"
          style={{
            width: 480, height: 480, left: -240, top: -240,
            background: "conic-gradient(from 0deg, rgba(34,211,238,0.22), transparent 60deg)",
            maskImage: "radial-gradient(circle, transparent 30%, #000 31%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 30%, #000 31%)",
          }} />
        <div className="absolute h-2 w-2 rounded-full bg-cyan-glow glow-cyan" style={{ left: -4, top: -4 }} />
      </div>
    </div>
  );
}

/** Moving grid + scan line overlay. */
export function GridScanOverlay({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 grid-bg animate-grid opacity-60" />
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/70 to-transparent animate-scan" />
    </div>
  );
}

/** Orbiting glowing nodes around a center (decorative). */
export function OrbitNodes({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 grid place-items-center ${className}`}>
      <div className="relative h-72 w-72 animate-spin-slow">
        {[0, 120, 240].map((d) => (
          <div key={d} className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-glow glow-cyan"
            style={{ transform: `rotate(${d}deg) translateY(0)`, transformOrigin: "50% 144px" }} />
        ))}
      </div>
    </div>
  );
}
