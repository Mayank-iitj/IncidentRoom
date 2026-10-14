"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PERSONAS } from "@/lib/seed";
import {
  Shield,
  Zap,
  Terminal,
  Lock,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Sliders,
  Radio,
  FileCode2,
} from "lucide-react";

export default function LandingView() {
  const { user, loading, error, login } = useAuth();
  const router = useRouter();
  const [activePersona, setActivePersona] = useState<string>("asha-soc");
  const [activeTab, setActiveTab] = useState<"overview" | "architecture">("overview");

  const handleEnterWarRoom = async (uid: string) => {
    await login(uid);
    router.push("/rooms/inc-101-phishing");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#ebebeb] p-3 sm:p-6 lg:p-8 flex justify-center items-center font-['Space_Grotesk']">
      {/* FLOATING SHELL CONTAINER (max-width 1600px, rounded-[2.5rem], ring-1 ring-white/10, shadow-2xl, #0c0c0c) */}
      <div className="w-full max-w-[1600px] bg-[#0c0c0c] rounded-[2.5rem] ring-1 ring-white/10 shadow-2xl overflow-hidden relative border border-white/5">
        
        {/* Grainy Noise Overlay & 60px Grid Background */}
        <div className="absolute inset-0 pointer-events-none grid-bg-pattern opacity-70 z-0" />
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-20"
          style={{
            background: "radial-gradient(circle, #ccff00 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none z-0 opacity-15"
          style={{
            background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
            filter: "blur(140px)",
          }}
        />

        {/* 1. NAVIGATION (Fixed/Absolute header) */}
        <header className="relative z-20 px-6 sm:px-12 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
          {/* Logo on Left: rounded-xl lime box with black initial */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ccff00] text-[#000000] flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(204,255,0,0.4)]">
              IR
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">IncidentRoom</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono tracking-widest text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/20 px-2 py-0.5 rounded-full">
                MCP LIVE
              </span>
            </div>
          </div>

          {/* Center: Pill-shaped navigation bar (rgba(255,255,255,0.05), backdrop-blur, rounded-full) */}
          <nav className="hidden md:flex items-center gap-8 px-6 py-2 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/10 text-sm">
            <a href="#war-room" className="text-white/70 hover:text-[#ccff00] transition-colors">
              War Room
            </a>
            <a href="#features" className="text-white/70 hover:text-[#ccff00] transition-colors">
              Secret Shield
            </a>
            <a href="#methodology" className="text-white/70 hover:text-[#ccff00] transition-colors">
              Methodology
            </a>
            <a href="#audit" className="text-white/70 hover:text-[#ccff00] transition-colors">
              Telemetry
            </a>
          </nav>

          {/* Right side: Monospaced system status indicator with pulsing lime dot next to white rounded-full button */}
          <div className="flex items-center gap-4">
            <div className="system-status-tag hidden sm:flex">
              <span className="system-status-dot" />
              <span className="text-[#ebebeb]/70">SHIELD ONLINE</span>
            </div>
            <button
              onClick={() => handleEnterWarRoom(activePersona)}
              className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#ccff00] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all duration-300"
            >
              Launch Room
            </button>
          </div>
        </header>

        {/* 2. HERO SECTION (Split 12-column grid) */}
        <section className="relative z-10 px-6 sm:px-12 pt-12 pb-20 lg:pt-16 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left (7 cols): Giant typography, mono label, italicized gradient span */}
            <div className="lg:col-span-7 space-y-6">
              {/* Mono AI Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 font-mono text-[11px] tracking-[0.2em] uppercase text-[#ccff00]">
                <Sparkles className="w-3.5 h-3.5" />
                COMETCHAT MCP · CREDENTIAL INTERCEPTOR
              </div>

              {/* Giant Heading (tight-tracked -0.06em, italic gradient span #ccff00 to white) */}
              <h1 className="text-5xl sm:text-7xl lg:text-[6.5rem] xl:text-[7.2rem] font-bold leading-[0.88] tracking-[-0.06em] text-[#ebebeb]">
                Incident Chat <br />
                That Stops <br />
                <span className="italic bg-gradient-to-r from-[#ccff00] via-[#86efac] to-white bg-clip-text text-transparent">
                  Leaks Live.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[#ebebeb]/60 max-w-xl font-normal leading-relaxed">
                A real-time security war-room powered by CometChat. Responders collaborate instantly while the
                in-flight Secret Shield scans, underlines, and intercepts live API keys before they ever hit the wire.
              </p>

              {/* Actions & Personas */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  id="hero-launch-btn"
                  onClick={() => handleEnterWarRoom(activePersona)}
                  className="btn-neon-lime px-8 py-4 flex items-center justify-center gap-3 text-sm tracking-wider uppercase"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  Enter War Room
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Persona selector quick toggle */}
                <div className="flex items-center gap-2 p-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
                  {PERSONAS.map((p) => {
                    const isSelected = activePersona === p.uid;
                    return (
                      <button
                        key={p.uid}
                        onClick={() => setActivePersona(p.uid)}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                          isSelected
                            ? "bg-[#ccff00] text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Spec Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-white/5 font-mono text-xs">
                <div>
                  <div className="text-[#ccff00] font-bold text-xl">0ms</div>
                  <div className="text-white/40 uppercase tracking-wider text-[10px]">Client Intercept Latency</div>
                </div>
                <div>
                  <div className="text-white font-bold text-xl">16+</div>
                  <div className="text-white/40 uppercase tracking-wider text-[10px]">Secret Regex Patterns</div>
                </div>
                <div>
                  <div className="text-[#10b981] font-bold text-xl">100%</div>
                  <div className="text-white/40 uppercase tracking-wider text-[10px]">E2E CometChat Sync</div>
                </div>
              </div>
            </div>

            {/* Right (5 cols): Interactive glassmorphism mockup shell with floating cards & AI cursor */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Glass Mockup Container */}
                <div className="rounded-[2rem] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 p-6 shadow-2xl relative overflow-hidden">
                  
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      <span className="ml-2 font-mono text-[10px] text-white/40 tracking-wider">
                        #INC-102-LEAKED-KEY
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded">
                      SEV-CRITICAL
                    </span>
                  </div>

                  {/* Mock Chat Stream */}
                  <div className="space-y-4 text-xs">
                    {/* Bot Message */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[#ccff00] text-[11px] font-semibold">SENTINEL BOT</span>
                        <span className="text-white/30 text-[9px]">18:34:02</span>
                      </div>
                      <p className="text-white/70">
                        🚨 Public GitHub commit detected with live IAM credentials in repository <code>corp/auth-svc</code>.
                      </p>
                    </div>

                    {/* Asha Message */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[#10b981] text-[11px] font-semibold">ASHA (SOC)</span>
                        <span className="text-white/30 text-[9px]">18:34:40</span>
                      </div>
                      <p className="text-white/70">
                        Isolating IAM principal. Checking CloudTrail logs for unauthorized S3 calls.
                      </p>
                    </div>

                    {/* INTERCEPTED SECRET CARD (Shake / High Contrast Block) */}
                    <div className="p-4 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] relative">
                      <div className="flex items-center gap-2 text-[#f43f5e] font-mono text-[11px] font-bold mb-1">
                        <Shield className="w-3.5 h-3.5" />
                        SECRET SHIELD BLOCKED MESSAGE
                      </div>
                      <div className="text-white/80 font-mono text-[11px] mb-2">
                        Attempted send: <span className="line-through text-[#f43f5e]">AKIAIOSFODNN7EXAMPLE</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-white/40">Only visible to you (blocked)</span>
                        <span className="text-[#ccff00] font-semibold cursor-pointer hover:underline">
                          Send Redacted →
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Input bar mockup */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                    <div className="flex-1 py-2 px-3 rounded-lg bg-black/40 border border-white/10 text-white/40 font-mono text-[11px]">
                      Type message... (Shield active)
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#ccff00] text-black flex items-center justify-center font-bold">
                      ↑
                    </div>
                  </div>
                </div>

                {/* Floating Card 1: Top Right Float (float-anim) */}
                <div className="absolute -top-6 -right-6 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-[16px] border border-white/10 shadow-2xl float-anim hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#ccff00] animate-ping" />
                    <div>
                      <div className="font-mono text-[10px] uppercase text-white/50 tracking-wider">Live Interception</div>
                      <div className="font-bold text-sm text-[#ccff00]">AWS Key Blocked</div>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2: AI Cursor label */}
                <div className="absolute -bottom-6 -left-6 px-4 py-2 rounded-full bg-[#ccff00] text-black font-mono font-bold text-xs shadow-[0_0_25px_rgba(204,255,0,0.4)] flex items-center gap-2 float-anim" style={{ animationDelay: "1.5s" }}>
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  AI CURSOR · SENTINEL ACTIVE
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 3. BENTO GRID FEATURES (Grid-cols-4 for desktop, rounded-[2.5rem], border border-white/10) */}
        <section id="features" className="relative z-10 px-6 sm:px-12 py-16 border-t border-white/5">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#ccff00] mb-2">
                // ARCHITECTURE CAPABILITIES
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Engineered for High-Stakes SOC War Rooms
              </h2>
            </div>
            <p className="text-sm text-white/50 max-w-md font-normal">
              Every component adheres to extreme performance standards: sub-millisecond regex parsing, CometChat web-sockets, and zero-leak guardrails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Large Card (Spans 2x2 on desktop, features internal data visualization vertical bars) */}
            <div className="lg:col-span-2 lg:row-span-2 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 hover:border-[#ccff00]/40 transition-all p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00]">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs text-[#ccff00] uppercase tracking-widest bg-[#ccff00]/10 px-3 py-1 rounded-full">
                    REAL-TIME TELEMETRY
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Secret Intercept Engine
                </h3>
                <p className="text-sm text-white/60 mb-6">
                  Live in-memory tokenization intercepts AWS, GitHub, Stripe, Slack, and private PEM keys inside the composer keystroke handler.
                </p>
              </div>

              {/* Data Visualization (Vertical Bars) */}
              <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs font-mono text-white/40 mb-4">
                  <span>INTERCEPTED SIGNATURES (LAST 24H)</span>
                  <span className="text-[#ccff00]">99.98% ACCURACY</span>
                </div>
                <div className="h-32 flex items-end gap-3 justify-between pt-4">
                  {[
                    { label: "AWS", h: "85%", count: "142", color: "#ccff00" },
                    { label: "GH", h: "60%", count: "89", color: "#86efac" },
                    { label: "STRIPE", h: "45%", count: "54", color: "#10b981" },
                    { label: "SLACK", h: "75%", count: "112", color: "#ccff00" },
                    { label: "JWT", h: "95%", count: "168", color: "#ccff00" },
                    { label: "PEM", h: "30%", count: "21", color: "#86efac" },
                    { label: "ENV", h: "50%", count: "67", color: "#10b981" },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-mono text-white/30 group-hover:text-white transition-colors">
                        {bar.count}
                      </div>
                      <div className="w-full bg-white/5 rounded-t-lg h-24 flex items-end">
                        <div
                          className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                          style={{ height: bar.h, backgroundColor: bar.color }}
                        />
                      </div>
                      <div className="text-[9px] font-mono text-white/50">{bar.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2: Tall Card (Spans 1x2 on desktop, features color/token swatches) */}
            <div className="lg:col-span-1 lg:row-span-2 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 hover:border-[#ccff00]/40 transition-all p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6">
                  <Sliders className="w-6 h-6 text-[#ccff00]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Design Tokens & Glass System</h3>
                <p className="text-xs text-white/60 mb-6">
                  Obsidian & Lime palette tailored for zero eye fatigue in dark ops centers.
                </p>
              </div>

              {/* Color & Token Swatches */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#ccff00] shadow-[0_0_10px_#ccff00]" />
                    <span className="text-white/80">Neon Lime</span>
                  </div>
                  <span className="text-[#ccff00]">#CCFF00</span>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#0c0c0c] border border-white/20" />
                    <span className="text-white/80">Obsidian Surface</span>
                  </div>
                  <span className="text-white/40">#0C0C0C</span>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#10b981]" />
                    <span className="text-white/80">Emerald Glow</span>
                  </div>
                  <span className="text-[#10b981]">#10B981</span>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-white/[0.03] border border-white/30" />
                    <span className="text-white/80">Glass Overlay</span>
                  </div>
                  <span className="text-white/40">3% + 16px Blur</span>
                </div>
              </div>
            </div>

            {/* Card 3: Accent Card (Solid #ccff00 background with black text and noise texture) */}
            <div className="lg:col-span-1 rounded-[2.5rem] bg-[#ccff00] text-black p-8 relative overflow-hidden shadow-[0_0_40px_rgba(204,255,0,0.25)] flex flex-col justify-between">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              
              <div className="relative z-10">
                <div className="font-mono text-xs uppercase tracking-widest font-bold mb-3">
                  COMETCHAT MCP CORE
                </div>
                <h3 className="text-2xl font-bold leading-tight mb-2">
                  Zero to Chat in Under 6 Hours
                </h3>
                <p className="text-xs font-medium text-black/80">
                  Built on CometChat JS SDK with full user presence, typing streams, and group messaging.
                </p>
              </div>

              <div className="pt-6 relative z-10">
                <button
                  onClick={() => handleEnterWarRoom("asha-soc")}
                  className="w-full py-3 rounded-full bg-black text-[#ccff00] font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
                >
                  Join as Asha (SOC) →
                </button>
              </div>
            </div>

            {/* Card 4: Standard Feature Card */}
            <div className="lg:col-span-1 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 hover:border-[#ccff00]/40 transition-all p-8 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ccff00] mb-4">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Sentinel AI Bot</h3>
                <p className="text-xs text-white/60">
                  Posts structured incident summaries and suggested remediation steps automatically.
                </p>
              </div>
              <div className="pt-4 font-mono text-[11px] text-[#ccff00] flex items-center gap-1">
                <span>Autonomous Threat Feeds</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        </section>

        {/* 4. CONTRAST SECTION (Methodology) */}
        {/* Full-width section with light-grey background (#e5e5e5) and dark text (#000000), rounded top corners (4rem radius) */}
        <section id="methodology" className="relative z-10 bg-[#e5e5e5] text-[#000000] rounded-t-[4rem] px-6 sm:px-12 py-20 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Numbered list (01, 02, 03) in monospaced font inside circles */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#000000]/60 mb-2">
                  // DEFENSIVE WORKFLOW
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#000000] leading-tight">
                  How Secret Shield Prevents Disaster Before Transmission
                </h2>
              </div>

              <div className="space-y-6">
                {/* Step 01 */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center font-mono font-bold text-sm shrink-0 bg-transparent">
                    01
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-black">Real-time Keystroke Regex Interception</h4>
                    <p className="text-sm text-black/70 mt-1">
                      As the responder pastes a command or log trace, the client-side parser identifies AWS keys, Stripe tokens, and RSA headers with zero external latency.
                    </p>
                  </div>
                </div>

                {/* Step 02 */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center font-mono font-bold text-sm shrink-0 bg-transparent">
                    02
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-black">Pre-Flight Transmission Gate</h4>
                    <p className="text-sm text-black/70 mt-1">
                      If a secret pattern triggers on Enter/Send, the socket call to CometChat is canceled immediately. The leak never reaches servers or peers.
                    </p>
                  </div>
                </div>

                {/* Step 03 */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center font-mono font-bold text-sm shrink-0 bg-transparent">
                    03
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-black">Inline Redaction & Air-Gap Audit</h4>
                    <p className="text-sm text-black/70 mt-1">
                      A shake-animated local feedback card alerts the sender, giving a 1-click option to transmit an HMAC-masked replacement safely.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Greyscale circular portrait with a glassmorphism testimonial card overlaying the bottom */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 border-black/10 overflow-hidden bg-black/5 flex items-center justify-center">
                {/* Hardware abstract circle graphic */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent grayscale flex items-center justify-center">
                  <Terminal className="w-24 h-24 text-white/40" />
                </div>
              </div>

              {/* Glass Testimonial Card overlaying bottom */}
              <div className="relative -mt-16 w-full max-w-sm rounded-2xl bg-white/70 backdrop-blur-[16px] border border-black/10 p-5 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-black mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  INCIDENT RESPONSE POST-MORTEM
                </div>
                <p className="text-xs text-black/80 italic mb-3">
                  "During high-pressure P0 incidents, pasting tokens into Slack is common. IncidentRoom completely eliminates the threat at the socket layer."
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-black/60 border-t border-black/10 pt-2">
                  <span>Ravi K. · Incident Lead</span>
                  <span className="font-bold text-black">#INC-102</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 5. FOOTER */}
        {/* Obsidian background (#000000), watermark 'SUPER', oversized lime CTA button */}
        <footer id="audit" className="relative z-10 bg-[#000000] text-[#ebebeb] px-6 sm:px-12 pt-24 pb-12 overflow-hidden border-t border-white/5">
          
          {/* Massive background watermark text 'SUPER' (10rem size, 5% opacity) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none select-none text-[8rem] sm:text-[14rem] font-bold text-white/[0.04] tracking-tighter leading-none whitespace-nowrap">
            SUPER
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 font-mono text-[10px] tracking-widest text-[#ccff00] uppercase mb-6">
              SECURE YOUR WAR ROOM
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-8">
              Join the Active Security War Room
            </h2>

            {/* Oversized lime button (#ccff00) with slide-up white background transition on hover */}
            <div className="flex justify-center">
              <button
                onClick={() => handleEnterWarRoom("asha-soc")}
                className="relative overflow-hidden group px-10 py-5 rounded-full bg-[#ccff00] text-black font-bold text-base sm:text-lg tracking-wider uppercase shadow-[0_0_50px_rgba(204,255,0,0.4)] transition-transform duration-300 hover:scale-105"
              >
                <span className="relative z-10 group-hover:text-black transition-colors duration-300 flex items-center gap-3">
                  Launch Live Demo Now
                  <ArrowRight className="w-5 h-5" />
                </span>
                <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
              </button>
            </div>
          </div>

          {/* 3-column footer with policy links, social icons, monospaced copyright */}
          <div className="relative z-10 pt-12 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-xs text-white/50 font-mono">
            <div>
              <span className="text-white font-bold tracking-tight text-sm">IncidentRoom</span>
              <p className="mt-1 text-[11px] text-white/40">Real-time incident response with zero credential leakage.</p>
            </div>

            {/* Social icons (hollow circles) */}
            <div className="flex justify-start md:justify-center items-center gap-3">
              {["GH", "DOCS", "MCP", "X"].map((item, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] hover:border-[#ccff00] hover:text-[#ccff00] transition-colors cursor-pointer"
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Monospaced copyright info */}
            <div className="md:text-right text-[11px]">
              <div>© 2026 INCIDENTROOM · #ZeroToChat</div>
              <div className="text-white/30 text-[10px] mt-0.5">COMETCHAT CHAT-SDK-JAVASCRIPT 4.2.0</div>
            </div>
          </div>

        </footer>

      </div>
    </div>
  );
}
