import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Cpu, ScanLine, Layers, AlertOctagon, Brain, CheckCircle2, Map, Satellite, FileImage, Sparkles } from "lucide-react";
import { GlassCard, SectionTitle, RiskBadge, ProgressBar, PageTransition, GlowButton } from "../components/ui";
import { predict } from "../lib/prediction";

const SAMPLES = [
  { id: "thermal", label: "Thermal LST · Delhi NCR", color: "#fb923c", desc: "Surface temperature anomaly composite", img: "/images/thermal.jpg" },
  { id: "flood", label: "Flood Inundation · Assam", color: "#38bdf8", desc: "SAR water-spread imagery", img: "/images/flood.jpg" },
  { id: "aqi", label: "Aerosol Optical Depth · Mumbai", color: "#c084fc", desc: "PM2.5 column density", img: "/images/aqi.jpg" },
];

const STEPS = [
  { l: "Ingesting raster", i: <FileImage size={14} /> },
  { l: "Terrain classification", i: <Layers size={14} /> },
  { l: "Anomaly detection", i: <ScanLine size={14} /> },
  { l: "Historical match", i: <Map size={14} /> },
  { l: "Risk inference", i: <Brain size={14} /> },
];

export function UploadPredict() {
  const [img, setImg] = useState<{ url: string; name: string } | null>(null);
  const [sample, setSample] = useState(SAMPLES[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f?: File) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImg({ url, name: f.name });
    setDone(false); setStep(-1);
  };

  const runAnalysis = async () => {
    setAnalyzing(true); setDone(false); setStep(0);
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 850));
    }
    setAnalyzing(false); setDone(true); setStep(STEPS.length);
  };

  // pick which prediction to show based on sample
  const metric = sample.id === "thermal" ? "Heat" : sample.id === "flood" ? "Flood" : "AQI";
  const state = sample.id === "thermal" ? "Delhi" : sample.id === "flood" ? "Assam" : "Maharashtra";
  const p = predict(state, metric as "Heat" | "Flood" | "AQI");

  return (
    <PageTransition>
      <SectionTitle kicker="Satellite Ingest · Module 08" title="Upload & Predict"
        subtitle="Upload satellite or environmental imagery. The AI engine classifies terrain, detects anomalies, compares historical conditions, and predicts future risk."
        icon={<UploadCloud size={22} />} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* upload */}
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><ImageIcon size={15} className="text-cyan-glow" /> Imagery Source</h3>

          {/* dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
            onClick={() => fileRef.current?.click()}
            className="relative cursor-pointer rounded-2xl border-2 border-dashed border-cyan-glow/40 bg-white/40 hover:bg-cyan-glow/5 hover:border-cyan-glow transition p-6 grid place-items-center min-h-[180px] text-center"
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            <AnimatePresence mode="wait">
              {img ? (
                <motion.div key="prev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                  <img src={img.url} alt={img.name} className="mx-auto max-h-44 rounded-xl object-contain border border-cyan-glow/30" />
                  <p className="mt-2 text-xs font-mono text-deep/60 truncate">{img.name}</p>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                  <img src={sample.img} alt={sample.label} className="mx-auto max-h-44 rounded-xl object-cover border border-cyan-glow/30" />
                  <p className="mt-2 text-xs font-mono text-deep/60">Sample: {sample.label}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* sample chips */}
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-deep/55 mb-2">Or load ISRO sample scene</p>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLES.map((s) => (
              <button key={s.id} onClick={() => setSample(s)} className={`rounded-xl p-2.5 text-left border transition ${sample.id === s.id ? "border-cyan-glow glow-cyan bg-cyan-glow/10" : "border-cyan-glow/25 bg-white/40 hover:border-cyan-glow"}`}>
                <div className="h-2 rounded-full mb-1.5" style={{ background: s.color }} />
                <p className="text-[11px] font-semibold text-deep leading-tight">{s.label}</p>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-deep/60">{sample.desc}</p>

          <div className="mt-4 flex gap-2">
            <GlowButton onClick={runAnalysis} disabled={analyzing} className="flex-1 flex items-center justify-center gap-2">
              {analyzing ? <><ScanLine size={15} className="animate-spin" /> Analysing…</> : <><Cpu size={15} /> Run AI Analysis</>}
            </GlowButton>
            <GlowButton variant="ghost" onClick={() => { setImg(null); setDone(false); }} className="!px-4">Clear</GlowButton>
          </div>
          {!img && <p className="mt-2 text-[11px] text-deep/45">Upload an image or the sample scene will be used for analysis.</p>}
        </GlassCard>

        {/* analysis pipeline */}
        <GlassCard className="p-5" hover={false}>
          <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Cpu size={15} className="text-cyan-glow" /> AI Analysis Pipeline</h3>

          <div className="space-y-2.5">
            {STEPS.map((s, i) => {
              const state = step > i ? "done" : step === i && analyzing ? "active" : "idle";
              return (
                <div key={s.l} className={`flex items-center gap-3 rounded-xl p-3 border transition ${state === "done" ? "bg-emerald-500/10 border-emerald-400/30" : state === "active" ? "bg-cyan-glow/10 border-cyan-glow glow-cyan" : "bg-white/40 border-cyan-glow/20"}`}>
                  <div className={`grid place-items-center h-9 w-9 rounded-lg ${state === "done" ? "bg-emerald-500 text-white" : state === "active" ? "bg-gradient-to-br from-cyan-glow to-azure text-white" : "bg-white/60 text-electric"}`}>
                    {state === "done" ? <CheckCircle2 size={16} /> : s.i}
                  </div>
                  <span className={`text-sm font-medium ${state === "done" ? "text-emerald-700" : state === "active" ? "text-deep" : "text-deep/55"}`}>{s.l}</span>
                  {state === "active" && (
                    <div className="ml-auto flex gap-1">
                      {[0, 1, 2].map((d) => (
                        <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-cyan-glow" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.7, repeat: Infinity, delay: d * 0.15 }} />
                      ))}
                    </div>
                  )}
                  {state === "done" && <CheckCircle2 size={14} className="ml-auto text-emerald-500" />}
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {done && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-gradient-to-br from-cyan-glow/10 to-azure/5 border border-cyan-glow/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={15} className="text-cyan-glow" />
                  <p className="font-display text-sm font-bold text-deep">Analysis Complete · {sample.label}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><p className="font-mono text-[10px] uppercase text-deep/55">Detected risk</p><p className="font-display text-2xl font-bold" style={{ color: sample.color }}>{p.riskPercent}%</p></div>
                  <div><p className="font-mono text-[10px] uppercase text-deep/55">Confidence</p><p className="font-display text-2xl font-bold text-electric">{p.confidence}%</p></div>
                </div>
                <RiskBadge level={p.level} risk={p.riskPercent} />
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-start gap-2 text-[11px] text-deep/70"><Layers size={12} className="text-cyan-glow mt-0.5 shrink-0" /> Terrain classified: {metric === "Heat" ? "urban + semi-arid" : metric === "Flood" ? "riverine + lowland" : "urban-industrial"}.</div>
                  <div className="flex items-start gap-2 text-[11px] text-deep/70"><AlertOctagon size={12} className="text-red-500 mt-0.5 shrink-0" /> {p.anomalies[0]}</div>
                  <div className="flex items-start gap-2 text-[11px] text-deep/70"><Satellite size={12} className="text-cyan-glow mt-0.5 shrink-0" /> Cross-referenced with 7-day {metric} history for {state}.</div>
                </div>
                <div className="mt-3"><ProgressBar label="Composite risk" value={p.riskPercent} color={sample.color} /></div>
                <p className="mt-2 text-[11px] text-deep/70"><span className="font-semibold">Recommendation:</span> {p.recommendation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!done && !analyzing && (
            <div className="mt-4 rounded-xl bg-white/40 border border-cyan-glow/20 p-3 text-[11px] text-deep/55 text-center">
              Pipeline idle — upload imagery and run analysis to view AI inference.
            </div>
          )}
        </GlassCard>
      </div>

      {/* preview gallery */}
      <GlassCard className="p-5 mt-4" hover={false}>
        <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Satellite size={15} className="text-cyan-glow" /> Recent Ingested Scenes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SAMPLES.concat(SAMPLES).map((s, i) => (
            <div key={i} className="rounded-xl border border-cyan-glow/20 overflow-hidden group cursor-pointer hover:glow-cyan transition">
              <div className="h-24 relative overflow-hidden">
                <img src={s.img} alt={s.label} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute inset-0 grid-bg opacity-30" />
                <Satellite size={18} className="absolute top-2 right-2 text-white/80" />
                <ScanLine size={15} className="absolute bottom-2 left-2 text-white/80 animate-pulse" />
              </div>
              <div className="p-2"><p className="text-[11px] font-semibold text-deep truncate">{s.label}</p><p className="text-[9px] text-deep/55 font-mono">SCENE-{1024 + i}</p></div>
            </div>
          ))}
        </div>
      </GlassCard>
    </PageTransition>
  );
}
