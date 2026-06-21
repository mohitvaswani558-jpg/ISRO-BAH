import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Mic, Send, Sparkles, Cpu, Brain, AudioLines, Trash2, Volume2, ScanLine } from "lucide-react";
import { GlassCard, SectionTitle, PageTransition, GlowButton, RiskBadge } from "../components/ui";
import { copilotAnswer, COPILOT_SUGGESTIONS } from "../lib/prediction";
import { RadarBackground } from "../components/Backgrounds";

interface Msg { role: "user" | "ai"; text: string; cards?: { label: string; value: string }[]; prediction?: ReturnType<typeof copilotAnswer>["prediction"]; ts: number; }

export function AICopilot() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai", ts: Date.now(),
      text: "GeoSentinel Copilot online. I analyse live thermal, hydrological, and atmospheric telemetry to forecast environmental risk. Ask me about any Indian state.",
      cards: [{ label: "Status", value: "Ready" }, { label: "Models", value: "3 active" }, { label: "Coverage", value: "36 states" }],
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<any>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing]);

  const send = (q: string) => {
    if (!q.trim()) return;
    const userMsg: Msg = { role: "user", text: q, ts: Date.now() };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setHeard(null);
    setTimeout(() => {
      const ans = copilotAnswer(q);
      const aiMsg: Msg = { role: "ai", text: ans.text, cards: ans.cards, prediction: ans.prediction, ts: Date.now() };
      setMsgs((m) => [...m, aiMsg]);
      setTyping(false);
      speak(ans.text.slice(0, 220));
    }, 1500);
  };

  const speak = (t: string) => {
    try {
      const u = new SpeechSynthesisUtterance(t);
      u.rate = 1.05; u.pitch = 1.1;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch { /* ignore */ }
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setHeard("Voice input unsupported in this browser — please type."); return; }
    const r = new SR();
    r.lang = "en-IN"; r.interimResults = true; r.continuous = false;
    r.onresult = (e: any) => {
      const t = e.results[e.results.length - 1][0].transcript;
      setHeard(t);
      setInput(t);
    };
    r.onend = () => setRecording(false);
    r.onerror = () => setRecording(false);
    recogRef.current = r; r.start(); setRecording(true);
  };
  const stopVoice = () => { recogRef.current?.stop(); setRecording(false); };

  return (
    <PageTransition>
      <SectionTitle kicker="Conversational AI · Module 04" title="AI Copilot"
        subtitle="Speak or type environmental queries. The copilot reasons over live telemetry and returns risk, confidence, and forecast."
        icon={<Bot size={22} />} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-0 overflow-hidden flex flex-col" hover={false} style={{ height: 620 }}>
          {/* header */}
          <div className="relative px-5 py-3 border-b border-cyan-glow/20 bg-gradient-to-r from-cyan-glow/10 to-transparent overflow-hidden">
            <RadarBackground />
            <div className="relative flex items-center gap-3">
              <div className="relative grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-glow to-deep glow-cyan">
                <Bot size={20} className="text-white" />
                <span className="absolute inset-0 rounded-xl border border-white/40 animate-pulse-glow" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-deep">GeoSentinel Copilot</p>
                <p className="font-mono text-[10px] text-emerald-600 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" /> online · reasoning engine active</p>
              </div>
              <button onClick={() => setMsgs([msgs[0]])} className="ml-auto btn-ghost !p-2 text-deep/60 hover:!text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 relative">
            {msgs.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "ai" && (
                  <div className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-glow to-azure text-white shrink-0 glow-cyan"><Cpu size={16} /></div>
                )}
                <div className={`max-w-[80%] ${m.role === "user" ? "order-1" : ""}`}>
                  <div className={`rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-gradient-to-br from-cyan-glow to-azure text-white glow-cyan" : "glass-strong text-deep"}`}>
                    {m.role === "ai" && <TypingText text={m.text} />}
                    {m.role === "user" && <p className="text-sm">{m.text}</p>}
                  </div>
                  {m.cards && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {m.cards.map((c) => (
                        <div key={c.label} className="rounded-xl glass px-3 py-2 flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase text-deep/55">{c.label}</span>
                          <span className="font-display text-sm font-bold text-deep">{c.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.prediction && (
                    <div className="mt-2 rounded-xl glass p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] uppercase text-deep/55">{m.prediction.state} · {m.prediction.metric}</span>
                        <RiskBadge level={m.prediction.level} risk={m.prediction.riskPercent} />
                      </div>
                      <div className="space-y-1 text-[11px] text-deep/70">
                        {m.prediction.reasoning.slice(0, 3).map((r, j) => (
                          <div key={j} className="flex gap-1.5"><Sparkles size={11} className="text-cyan-glow shrink-0 mt-0.5" /><span>{r}</span></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="grid place-items-center h-9 w-9 rounded-lg bg-white/60 text-electric shrink-0"><Brain size={16} /></div>
                )}
              </motion.div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-glow to-azure text-white"><Cpu size={16} /></div>
                <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-2">
                  <ScanLine size={14} className="text-cyan-glow animate-pulse" />
                  <span className="text-sm text-deep/70">Analysing telemetry…</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((d) => (<motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-cyan-glow" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2 }} />))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* input */}
          <div className="p-4 border-t border-cyan-glow/20 bg-white/40">
            {heard && <p className="mb-2 text-[11px] font-mono text-cyan-glow flex items-center gap-1"><Mic size={11} /> heard: "{heard}"</p>}
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
              <button type="button" onClick={recording ? stopVoice : startVoice}
                className={`grid place-items-center h-11 w-11 rounded-xl shrink-0 transition ${recording ? "bg-red-500 text-white animate-pulse-glow" : "btn-ghost !p-0 text-cyan-glow"}`}>
                <Mic size={18} />
              </button>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask: Will Delhi face heatwave tomorrow?"
                className="input-glow !rounded-xl" />
              <GlowButton type="submit" className="!px-4 shrink-0"><Send size={16} /></GlowButton>
            </form>
          </div>
        </GlassCard>

        {/* right panel */}
        <div className="space-y-4">
          <GlassCard className="p-5" hover={false}>
            <h3 className="font-display text-sm font-bold text-deep mb-3 flex items-center gap-2"><Sparkles size={15} className="text-cyan-glow" /> Suggested Queries</h3>
            <div className="space-y-2">
              {COPILOT_SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="w-full text-left rounded-xl bg-white/45 border border-cyan-glow/20 p-2.5 text-xs text-deep/75 hover:border-cyan-glow hover:glow-cyan transition flex items-center justify-between group">
                  <span className="flex items-center gap-2"><AudioLines size={13} className="text-cyan-glow" /> {s}</span>
                  <Send size={12} className="opacity-0 group-hover:opacity-100 text-cyan-glow" />
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5 relative overflow-hidden bg-gradient-to-br from-deep/90 to-[#04121f]" hover={false}>
            <div className="flex items-center gap-2 mb-3">
              <Volume2 size={15} className="text-cyan-glow" />
              <h3 className="font-display text-sm font-bold text-white">Voice & TTS</h3>
            </div>
            <p className="text-[11px] text-cyan-100/70 mb-3">Press the mic to speak (en-IN). Responses are spoken aloud via the synthesis engine.</p>
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-12 rounded-xl border border-cyan-glow/30 overflow-hidden relative ${recording ? "glow-cyan" : ""}`}>
                {recording ? <Wave /> : <div className="h-full grid place-items-center text-[10px] font-mono text-cyan-100/40">idle</div>}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5" hover={false}>
            <h3 className="font-display text-sm font-bold text-deep mb-2 flex items-center gap-2"><Brain size={15} className="text-cyan-glow" /> Reasoning Pipeline</h3>
            <ol className="space-y-1.5 text-[11px] text-deep/70">
              {["Parse intent + geo-entity", "Pull live state telemetry", "Run trend + anomaly detection", "Time-series forecast (7-day)", "Compose risk + confidence + advice"].map((s, i) => (
                <li key={i} className="flex items-center gap-2"><span className="grid place-items-center h-5 w-5 rounded-full bg-cyan-glow/15 text-cyan-glow font-mono text-[9px] font-bold">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}

function TypingText({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let i = 0;
    const id = setInterval(() => { i += 2; setN(Math.min(text.length, i)); if (i >= text.length) clearInterval(id); }, 16);
    return () => clearInterval(id);
  }, [text]);
  return <p className="text-sm leading-relaxed">{text.slice(0, n)}{n < text.length && <span className="inline-block w-1.5 h-4 bg-cyan-glow animate-pulse-glow align-middle" />}</p>;
}

function Wave() {
  return (
    <div className="h-full flex items-center justify-center gap-1 px-3">
      {[...Array(18)].map((_, i) => (
        <motion.span key={i} className="w-1 rounded-full bg-cyan-glow"
          animate={{ height: [6, 22 + (i % 4) * 6, 6] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.05 }} />
      ))}
    </div>
  );
}
