import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Satellite, Mail, Lock, ShieldCheck, User, ArrowRight, KeyRound, Sparkles, CheckCircle2, Fingerprint } from "lucide-react";
import { useAuth, type Role } from "../contexts/AuthContext";
import { Globe3D } from "../components/Globe3D";
import { ParticleField, RadarBackground } from "../components/Backgrounds";
import { GlowButton } from "../components/ui";

const ROLES: Role[] = ["Scientist", "Government Officer", "Analyst", "Public User", "Admin"];

type Tab = "email" | "otp" | "register";

export function Login() {
  const { loginEmail, loginGoogle, requestOtp, verifyOtp, register } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("email");
  const [role, setRole] = useState<Role>("Scientist");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const wrap = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError(null); setInfo(null);
    try { await fn(); nav("/"); } catch (e: unknown) { setError(e instanceof Error ? e.message : "Authentication failed"); }
    finally { setBusy(false); }
  };

  const doEmail = () => wrap(() => loginEmail(email || "scientist@isro.gov.in", password, role));
  const doGoogle = () => wrap(() => loginGoogle());
  const doRegister = () => wrap(() => register(name || "Dr. A. Rao", email || "analyst@isro.gov.in", password, role));

  const sendOtp = () => {
    if (!email) { setError("Enter your email to receive an OTP."); return; }
    const { otp: code } = requestOtp(email);
    setSentOtp(code);
    setInfo(`Demo OTP sent: ${code} (simulated ISRO secure gateway).`);
    setError(null);
  };
  const doVerify = () => wrap(() => verifyOtp(email, otp, role));

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden">
      <ParticleField className="absolute inset-0 z-0 opacity-60" count={40} />

      {/* LEFT — cinematic brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-deep/95 via-[#06243d] to-[#04121f]">
        <img src="/images/earth.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-br from-deep/85 via-[#06243d]/80 to-[#04121f]/90" />
        <RadarBackground />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-glow to-azure glow-cyan">
              <Satellite size={24} className="text-white" />
            </div>
            <div>
              <p className="font-display text-xl font-extrabold holo-text">GeoSentinel AI</p>
              <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-glow/80">ISRO · ENVIRONMENTAL INTELLIGENCE</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid place-items-center my-6">
          <Globe3D size={340} />
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="font-display text-3xl font-bold text-white leading-tight">
            National Mission Control for<br /><span className="holo-text">Environmental Prediction</span>
          </h1>
          <p className="text-sm text-cyan-100/70 max-w-md">
            AI-powered geospatial intelligence fusing satellite thermal imaging, rainfall radar, and air-quality
            telemetry to forecast heatwaves, floods, and pollution across every Indian state.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[["36", "States Monitored"], ["7", "Satellites Linked"], ["1840", "Live Sensors"]].map(([n, l]) => (
              <div key={l} className="glass-dark rounded-xl p-3">
                <p className="font-display text-xl font-bold text-cyan-glow">{n}</p>
                <p className="text-[10px] text-cyan-100/60">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — auth panel */}
      <div className="relative z-10 flex items-center justify-center p-6 md:p-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-md glass-strong rounded-3xl p-7 md:p-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-glow/20 blur-3xl" />
          <div className="flex items-center gap-3 mb-1 lg:hidden">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-glow to-deep glow-cyan">
              <Satellite size={20} className="text-white" />
            </div>
            <p className="font-display text-lg font-extrabold holo-text">GeoSentinel AI</p>
          </div>
          <h2 className="font-display text-2xl font-bold text-deep mt-3">Secure Access Portal</h2>
          <p className="text-sm text-deep/60 mt-1">Authenticate to enter mission control. Role-based clearance enforced.</p>

          {/* tabs */}
          <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-white/40 p-1 border border-cyan-glow/25">
            {([["email", "Email"], ["otp", "OTP"], ["register", "Register"]] as [Tab, string][]).map(([t, l]) => (
              <button key={t} onClick={() => { setTab(t); setError(null); setInfo(null); }}
                className={`relative rounded-lg py-2 text-xs font-semibold transition ${tab === t ? "text-white" : "text-deep/60 hover:text-deep"}`}>
                {tab === t && <motion.span layoutId="authTab" className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-glow to-azure glow-cyan" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <span className="relative">{l}</span>
              </button>
            ))}
          </div>

          {/* role selector */}
          <div className="mt-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-deep/50 mb-2">Access Role</p>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((r) => (
                <button key={r} onClick={() => setRole(r)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${role === r ? "bg-gradient-to-r from-cyan-glow to-azure text-white border-transparent glow-cyan" : "bg-white/40 text-deep/70 border-cyan-glow/30 hover:border-cyan-glow"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="mt-5 space-y-3">
              {tab === "register" && (
                <Field icon={<User size={15} />} placeholder="Full name" value={name} onChange={setName} />
              )}
              <Field icon={<Mail size={15} />} placeholder="Official email" type="email" value={email} onChange={setEmail} />
              {tab !== "otp" && (
                <Field icon={<Lock size={15} />} placeholder="Password" type="password" value={password} onChange={setPassword} />
              )}
              {tab === "otp" && (
                <>
                  <div className="flex gap-2">
                    <Field icon={<KeyRound size={15} />} placeholder="6-digit OTP" value={otp} onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))} />
                    <GlowButton variant="ghost" onClick={sendOtp} className="!px-3 whitespace-nowrap text-xs">Send OTP</GlowButton>
                  </div>
                  <button onClick={doVerify} disabled={busy || !otp} className="w-full btn-glow flex items-center justify-center gap-2">
                    {busy ? "Verifying…" : <>Verify & Enter <ArrowRight size={15} /></>}
                  </button>
                </>
              )}
              {tab !== "otp" && (
                <button onClick={tab === "register" ? doRegister : doEmail} disabled={busy}
                  className="w-full btn-glow flex items-center justify-center gap-2">
                  {busy ? "Authenticating…" : <>{tab === "register" ? "Create Account" : "Sign In"} <ArrowRight size={15} /></>}
                </button>
              )}
            </motion.div>
          </AnimatePresence>

          {info && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-cyan-glow/10 border border-cyan-glow/30 p-3 text-xs text-deep">
              <Sparkles size={14} className="text-cyan-glow mt-0.5 shrink-0" /> <span>{info}</span>
            </div>
          )}
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-400/30 p-3 text-xs text-red-600">
              <ShieldCheck size={14} className="mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <div className="my-4 flex items-center gap-3 text-[10px] font-mono text-deep/40">
            <div className="flex-1 divider-glow" /> OR <div className="flex-1 divider-glow" />
          </div>

          <button onClick={doGoogle} disabled={busy}
            className="w-full btn-ghost flex items-center justify-center gap-2 !py-2.5">
            <Fingerprint size={16} className="text-cyan-glow" /> Continue with Google (ISRO SSO)
          </button>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-deep/55">
            {[["AES-256", "Encryption"], ["RBAC", "Clearance"], ["MFA", "Verified"]].map(([a, b]) => (
              <div key={a} className="rounded-lg bg-white/40 border border-cyan-glow/20 p-2 flex flex-col items-center gap-0.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span className="font-mono font-bold text-deep">{a}</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[10px] text-deep/40 font-mono">Demo platform · any email/password grants access · role selects clearance</p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type = "text" }: {
  icon: React.ReactNode; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-electric">{icon}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="input-glow !pl-9"
      />
    </div>
  );
}
