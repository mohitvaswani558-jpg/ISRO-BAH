import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { type RiskLevel, RISK_COLOR } from "../lib/mockData";

export function GlassCard({
  children, className = "", glow = false, hover = true, style,
}: { children: ReactNode; className?: string; glow?: boolean; hover?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      className={`glass rounded-2xl ${hover ? "card-hover" : ""} ${glow ? "glow-cyan" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  kicker, title, subtitle, icon,
}: { kicker?: string; title: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <div className="mb-6">
      {kicker && (
        <div className="flex items-center gap-2 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-pulse-glow" />
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-electric">{kicker}</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        {icon && <div className="text-cyan-glow">{icon}</div>}
        <h1 className="font-display text-2xl md:text-3xl font-bold holo-text">{title}</h1>
      </div>
      {subtitle && <p className="mt-2 text-sm text-deep/70 max-w-2xl">{subtitle}</p>}
    </div>
  );
}

export function AnimatedNumber({ value, decimals = 0, suffix = "", prefix = "" }: {
  value: number; decimals?: number; suffix?: string; prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1400, bounce: 0 });
  useEffect(() => { if (inView) mv.set(value); }, [inView, value, mv]);
  useEffect(() => spring.on("change", (v) => {
    if (ref.current) ref.current.textContent = prefix + v.toFixed(decimals) + suffix;
  }), [spring, prefix, suffix, decimals]);
  return <span ref={ref}>{prefix + (0).toFixed(decimals) + suffix}</span>;
}

export function StatCard({
  label, value, suffix = "", decimals = 0, icon, accent = "#22d3ee", trend, sub,
}: {
  label: string; value: number; suffix?: string; decimals?: number;
  icon?: ReactNode; accent?: string; trend?: string; sub?: string;
}) {
  return (
    <GlassCard className="p-5 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-70"
        style={{ background: accent }} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-deep/60">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold" style={{ color: accent }}>
            <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
          </p>
          {sub && <p className="mt-1 text-xs text-deep/60">{sub}</p>}
        </div>
        {icon && (
          <div className="grid place-items-center h-11 w-11 rounded-xl text-white"
            style={{ background: `linear-gradient(135deg, ${accent}, #0369a1)`, boxShadow: `0 0 18px ${accent}66` }}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold" style={{ color: accent }}>
          <span className="inline-block h-2 w-2 rounded-full animate-pulse-glow" style={{ background: accent }} />
          {trend}
        </div>
      )}
    </GlassCard>
  );
}

export function RiskBadge({ level, risk }: { level: RiskLevel; risk?: number }) {
  const color = RISK_COLOR[level];
  return (
    <span className="chip" style={{ borderColor: color + "88", background: color + "1a", color }}>
      <span className="h-2 w-2 rounded-full animate-pulse-glow" style={{ background: color }} />
      {level.toUpperCase()}{risk != null ? ` · ${risk}%` : ""}
    </span>
  );
}

export function ProgressBar({ value, color = "#22d3ee", label }: { value: number; color?: string; label?: string }) {
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-deep/70 font-medium">{label}</span>
          <span className="font-mono font-bold" style={{ color }}>{value}%</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-white/40 overflow-hidden border border-white/50">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, #a5f3fc)`, boxShadow: `0 0 12px ${color}aa` }}
        />
      </div>
    </div>
  );
}

export function GlowButton({ children, onClick, variant = "glow", className = "", type = "button", disabled }: {
  children: ReactNode; onClick?: () => void; variant?: "glow" | "ghost";
  className?: string; type?: "button" | "submit"; disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }}
      type={type} onClick={onClick} disabled={disabled}
      className={`${variant === "glow" ? "btn-glow" : "btn-ghost"} ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
