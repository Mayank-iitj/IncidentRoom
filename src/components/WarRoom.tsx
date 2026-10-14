"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  AlertTriangle,
  Zap,
  Users,
  LogOut,
  Play,
  Terminal,
  ChevronUp,
  Clock,
  Eye,
  Search,
  ArrowLeft,
  Sparkles,
  Radio,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useGroupChat, usePresence } from "@/hooks/useGroupChat";
import { useShieldStats, useIncidentTimer } from "@/hooks/useShieldStats";
import { ROOMS, PERSONAS, seedMessagesForRoom } from "@/lib/seed";
import { scanSecrets, redactSecrets } from "@/lib/secretScanner";
import MessageBubble from "./MessageBubble";
import SentinelAlert from "./SentinelAlert";
import ComposerBar from "./ComposerBar";
import MembersPanel from "./MembersPanel";
import ShieldLog from "./ShieldLog";
import Toast from "./Toast";

const EmergencyCallBridge = dynamic(() => import("./EmergencyCallBridge"), {
  ssr: false,
});

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface RoomState {
  severity: Severity;
  startTime: number;
}

interface BlockedEntry {
  id: string;
  type: string;
  preview: string;
  timestamp: number;
  roomGuid: string;
}

const ROOM_START_TIMES: Record<string, number> = {};

function getOrCreateStartTime(guid: string): number {
  if (!ROOM_START_TIMES[guid]) {
    ROOM_START_TIMES[guid] = Date.now() - Math.floor(Math.random() * 45 * 60 * 1000);
  }
  return ROOM_START_TIMES[guid];
}

const SENTINEL_ALERTS = [
  {
    severity: "HIGH" as Severity,
    sourceIp: "192.168.1." + Math.floor(Math.random() * 255),
    affectedService: "AWS Lambda (prod-api)",
    recommendedAction: "Check CloudTrail logs and rotate IAM credentials",
    summary: "Unusual spike in Lambda invocations from unrecognized IP range. Possible exfiltration attempt.",
  },
  {
    severity: "CRITICAL" as Severity,
    sourceIp: "10.0.0." + Math.floor(Math.random() * 255),
    affectedService: "PostgreSQL (prod-db)",
    recommendedAction: "Block IP immediately, rotate DB credentials, audit query logs",
    summary: "SQL injection attempt detected in production database. Attacker is enumerating table names.",
  },
  {
    severity: "MEDIUM" as Severity,
    sourceIp: "203.0.113." + Math.floor(Math.random() * 255),
    affectedService: "Kubernetes Cluster (us-east-1)",
    recommendedAction: "Review RBAC policies, check for privilege escalation",
    summary: "Repeated failed attempts to access cluster admin API. Pattern consistent with automated scanner.",
  },
];

export default function WarRoom({ initialRoomId }: { initialRoomId: string }) {
  const { user, persona, logout } = useAuth();
  const router = useRouter();
  const [activeRoomId, setActiveRoomId] = useState(initialRoomId);
  const [roomStates, setRoomStates] = useState<Record<string, RoomState>>({});
  const [showShieldLog, setShowShieldLog] = useState(false);
  const [blockedLog, setBlockedLog] = useState<BlockedEntry[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [seeded, setSeeded] = useState<Set<string>>(new Set());
  const [demoRunning, setDemoRunning] = useState(false);
  const [showCallBridge, setShowCallBridge] = useState(false);
  const [showRoomSwitcher, setShowRoomSwitcher] = useState(false);
  const [switcherQuery, setSwitcherQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K room switcher shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowRoomSwitcher((prev) => !prev);
      }
      if (e.key === "Escape") {
        setShowRoomSwitcher(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeRoom = ROOMS.find((r) => r.guid === activeRoomId) ?? ROOMS[0];
  const activeRoomState = roomStates[activeRoomId];
  const currentSeverity = activeRoomState?.severity ?? activeRoom.severity;
  const startTime = activeRoomState?.startTime ?? getOrCreateStartTime(activeRoomId);

  const {
    messages,
    loading,
    typingUsers,
    unreadCount,
    sendMessage,
    sendTypingIndicator,
    clearUnread,
    addBlockedMessage,
  } = useGroupChat(activeRoomId);

  const { onlineUsers } = usePresence();
  const { stats: shieldStats, animating: shieldAnimating, incrementBlocked } = useShieldStats(activeRoomId);
  const { formatted: timerFormatted } = useIncidentTimer(startTime);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize room states
  useEffect(() => {
    const initial: Record<string, RoomState> = {};
    for (const room of ROOMS) {
      initial[room.guid] = {
        severity: room.severity,
        startTime: getOrCreateStartTime(room.guid),
      };
    }
    setRoomStates(initial);
  }, []);

  // Clear unread when active
  useEffect(() => {
    clearUnread();
  }, [activeRoomId, clearUnread]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleSwitchRoom = useCallback(
    (guid: string) => {
      setActiveRoomId(guid);
      router.push(`/rooms/${guid}`);
    },
    [router]
  );

  const handleEscalate = useCallback(() => {
    const nextSeverity: Record<Severity, Severity> = {
      LOW: "MEDIUM",
      MEDIUM: "HIGH",
      HIGH: "CRITICAL",
      CRITICAL: "CRITICAL",
    };
    const next = nextSeverity[currentSeverity];
    setRoomStates((prev) => ({
      ...prev,
      [activeRoomId]: {
        ...prev[activeRoomId],
        severity: next,
      },
    }));
    showToast(`Incident escalated to ${next}!`, "error");

    sendMessage(`🚨 **INCIDENT ESCALATED TO ${next}** by Lead ${persona?.name ?? ""}`, {
      _escalation: true,
      _seedSender: persona?.uid,
      _senderName: persona?.name,
    });
  }, [activeRoomId, currentSeverity, persona?.name, persona?.uid, sendMessage, showToast]);

  const handleSimulateAlert = useCallback(async () => {
    const alert = SENTINEL_ALERTS[Math.floor(Math.random() * SENTINEL_ALERTS.length)];
    await sendMessage(
      JSON.stringify({
        _sentinel: true,
        ...alert,
      }),
      {
        _isSentinel: true,
        _seedSender: "sentinel-bot",
        _senderName: "Sentinel",
        _senderRole: "Bot",
      }
    );
    showToast("Sentinel alert posted.", "success");
  }, [sendMessage, showToast]);

  const handleSummary = useCallback(async () => {
    const recentMessages = messages.slice(-20);
    const participants = [...new Set(recentMessages.map((m) => m.name))];
    const msgCount = recentMessages.length;
    const hasAlerts = recentMessages.some((m) => m.isSentinel);
    const blockedCount = shieldStats.blocked;

    const summary = [
      `📋 **INCIDENT SUMMARY** — ${activeRoom.name}`,
      `Severity: ${currentSeverity} | Timer: ${timerFormatted}`,
      "",
      `Participants active: ${participants.join(", ")}`,
      `Messages reviewed: ${msgCount}`,
      `Automated alerts: ${hasAlerts ? "Yes" : "None"}`,
      `Credentials blocked by Shield: ${blockedCount}`,
      "",
      `Status: Investigation ongoing. Key actions taken: credential rotation, log analysis, threat containment.`,
      `Open actions: Verify no lateral movement. Confirm all affected services have been patched.`,
    ].join("\n");

    await sendMessage(summary, {
      _isSentinel: true,
      _seedSender: "sentinel-bot",
      _senderName: "Sentinel",
      _senderRole: "Bot",
    });
    showToast("Summary posted by Sentinel.", "success");
  }, [messages, activeRoom.name, currentSeverity, timerFormatted, shieldStats.blocked, sendMessage, showToast]);

  const handleSecretBlocked = useCallback((text: string, secretType: string, redacted: string) => {
    incrementBlocked();
    const preview = redacted.slice(0, 40) + (redacted.length > 40 ? "..." : "");
    const entry: BlockedEntry = {
      id: `block-${Date.now()}`,
      type: secretType,
      preview,
      timestamp: Date.now(),
      roomGuid: activeRoomId,
    };
    setBlockedLog((prev) => [entry, ...prev].slice(0, 50));
    addBlockedMessage(
      `🛡️ Secret blocked by IncidentRoom Shield\nType: ${secretType}\nRedacted: ${preview}\n\nShare via vault link instead.`,
      secretType
    );
  }, [activeRoomId, incrementBlocked, addBlockedMessage]);

  const handleRunDemo = useCallback(async () => {
    if (demoRunning) return;
    setDemoRunning(true);
    showToast("Running 60-second demo scenario...", "info");

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    try {
      await sendMessage("What's the current status on INC-102? I'm seeing unusual activity in S3.", {
        _seedSender: "asha-soc",
        _senderName: "Asha",
      });
      await delay(3000);

      await sendMessage(
        JSON.stringify({
          _sentinel: true,
          severity: "CRITICAL",
          sourceIp: "198.51.100.42",
          affectedService: "S3 (prod-assets)",
          recommendedAction: "Block IP, audit bucket policies, enable MFA Delete",
          summary: "Mass download from prod-assets S3 bucket. 2.3GB exfiltrated in 4 minutes from unknown IP.",
        }),
        { _isSentinel: true, _seedSender: "sentinel-bot", _senderName: "Sentinel", _senderRole: "Bot" }
      );
      await delay(4000);

      await sendMessage("On it. Blocking that IP now. Asha — check if the access was via temp credentials or long-lived key.", {
        _seedSender: "ravi-lead",
        _senderName: "Ravi",
      });
      await delay(3500);

      const fakeKey = "AKIAIOSFODNN7EXAMPLE";
      const fakeMsg = `I found the key: ${fakeKey}`;
      handleSecretBlocked(fakeMsg, "AWS Access Key", fakeMsg.replace(fakeKey, "AKIA••••••••••••••••"));
      await delay(4000);

      await sendMessage("Asha: I revoked that key in IAM. Rotating all dependent microservices now.", {
        _seedSender: "ravi-lead",
        _senderName: "Ravi",
      });
      await delay(3000);

      handleEscalate();
      await delay(3000);

      await handleSummary();
      showToast("Demo scenario completed!", "success");
    } finally {
      setDemoRunning(false);
    }
  }, [demoRunning, sendMessage, handleSecretBlocked, handleEscalate, handleSummary, showToast]);

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500/15 text-[#f43f5e] border border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/15 text-[#f59e0b] border border-amber-500/30";
      case "MEDIUM":
        return "bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30";
      default:
        return "bg-emerald-500/15 text-[#10b981] border border-emerald-500/30";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000] text-[#ebebeb] font-['Space_Grotesk'] p-2 sm:p-3">
      {/* FLOATING SHELL WRAPPER */}
      <div className="flex-1 flex overflow-hidden rounded-[2rem] bg-[#0c0c0c] border border-white/10 ring-1 ring-white/5 shadow-2xl relative">
        
        {/* Grainy Noise & subtle grid in warroom */}
        <div className="absolute inset-0 pointer-events-none grid-bg-pattern opacity-40 z-0" />

        {/* 1. LEFT SIDEBAR: Active incidents & identity */}
        <div className="w-64 sm:w-72 flex-shrink-0 flex flex-col border-r border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl relative z-10">
          
          {/* Logo & Home Return */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#ccff00] text-black flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(204,255,0,0.4)]">
                IR
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white block">IncidentRoom</span>
                <span className="text-[9px] font-mono tracking-widest text-[#ccff00] block">WAR ROOM</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Return to Home Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md"
                style={{
                  background: persona?.color ? `${persona.color}25` : "rgba(204,255,0,0.15)",
                  color: persona?.color ?? "#ccff00",
                  border: `1px solid ${persona?.color ?? "#ccff00"}40`,
                }}
              >
                {persona?.initials ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate text-white">{persona?.name}</div>
                <div className="text-[11px] font-mono text-[#ccff00]/80 tracking-wide uppercase">
                  {persona?.role}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Incident Rooms Navigation */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/40">
                ACTIVE INCIDENTS
              </span>
              <span className="text-[10px] font-mono text-[#ccff00]">CTRL+K</span>
            </div>

            {ROOMS.map((room) => {
              const severity = roomStates[room.guid]?.severity ?? room.severity;
              const isActive = room.guid === activeRoomId;

              return (
                <button
                  key={room.guid}
                  id={`room-${room.guid}`}
                  onClick={() => handleSwitchRoom(room.guid)}
                  className={`w-full text-left rounded-xl p-3 transition-all duration-200 border ${
                    isActive
                      ? "bg-white/[0.06] border-[#ccff00]/40 shadow-[0_0_20px_rgba(204,255,0,0.1)]"
                      : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-white/60"}`}>
                      {room.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${getSeverityBadge(severity)}`}>
                      {severity}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Shield Log Drawer Toggle */}
          <div className="p-3 border-t border-white/10 bg-[#0a0a0a]">
            <button
              onClick={() => setShowShieldLog(!showShieldLog)}
              className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-mono font-semibold transition-all bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] hover:bg-[#ccff00]/20"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>SHIELD AUDIT</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-black/40 text-[10px]">
                {blockedLog.length} BLOCKED
              </span>
            </button>
          </div>
        </div>

        {/* 2. CENTER PANEL: Incident War Room Chat */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0c0c0c]/80 backdrop-blur-md relative z-10">
          
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3 bg-white/[0.01]">
            
            {/* Incident Title & Timers */}
            <div className="flex items-center gap-4 min-w-0">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm tracking-tight text-white truncate">
                    {activeRoom.name}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${getSeverityBadge(currentSeverity)}`}>
                    {currentSeverity}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-1 font-mono text-[11px]">
                  <span className="flex items-center gap-1.5 text-white/50">
                    <Clock className="w-3.5 h-3.5 text-[#ccff00]" />
                    <span className="text-white/80">{timerFormatted}</span>
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${shieldAnimating ? "shield-pop" : ""}`}
                    style={{ color: shieldStats.blocked > 0 ? "#f43f5e" : "rgba(255,255,255,0.4)" }}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{shieldStats.blocked} Leaks Blocked</span>
                  </span>
                </div>
              </div>
            </div>

            {/* War Room Actions */}
            <div className="flex items-center gap-2">
              <button
                id="btn-call-bridge"
                onClick={() => setShowCallBridge(!showCallBridge)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  showCallBridge
                    ? "bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]"
                    : "bg-[#ccff00]/10 border border-[#ccff00]/40 text-[#ccff00] hover:bg-[#ccff00]/20"
                }`}
                title="Toggle Emergency Voice & Video Bridge powered by CometChat Calls SDK"
              >
                <Radio className={`w-3.5 h-3.5 ${showCallBridge ? "animate-pulse" : ""}`} />
                <span>{showCallBridge ? "Bridge Live" : "Voice/Video"}</span>
              </button>

              <button
                id="btn-simulate-alert"
                onClick={handleSimulateAlert}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors bg-amber-500/10 border border-amber-500/30 text-[#f59e0b] hover:bg-amber-500/20"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Alert
              </button>

              <button
                id="btn-summarize"
                onClick={handleSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] hover:bg-[#ccff00]/20"
              >
                <Terminal className="w-3.5 h-3.5" />
                Summary
              </button>

              {persona?.uid === "ravi-lead" && (
                <button
                  id="btn-escalate"
                  onClick={handleEscalate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors bg-rose-500/15 border border-rose-500/30 text-[#f43f5e] hover:bg-rose-500/25"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  Escalate
                </button>
              )}

              <button
                id="btn-run-demo"
                onClick={handleRunDemo}
                disabled={demoRunning}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:scale-105 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                {demoRunning ? "Running..." : "Run Demo"}
              </button>
            </div>
          </div>

          {/* Emergency Audio/Video Bridge */}
          {showCallBridge && (
            <div className="p-4 pb-0">
              <EmergencyCallBridge
                roomId={activeRoomId}
                roomName={activeRoom.name}
                onClose={() => setShowCallBridge(false)}
              />
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div
                  className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: "#ccff00", borderTopColor: "transparent" }}
                />
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-white/30 font-mono text-xs">
                <Shield className="w-12 h-12 mb-3 text-white/20" />
                <p>No messages in war-room. Ready for incident response.</p>
              </div>
            )}

            {messages.map((msg) => {
              let parsedSentinel: Record<string, unknown> | null = null;
              if (msg.isSentinel || msg.metadata?._isSentinel) {
                try {
                  parsedSentinel = JSON.parse(msg.text) as Record<string, unknown>;
                } catch {
                  // Text fallback
                }
              }

              if (parsedSentinel && parsedSentinel._sentinel) {
                return (
                  <SentinelAlert
                    key={msg.id}
                    data={parsedSentinel}
                    onAcknowledge={() =>
                      sendMessage(`✅ Alert acknowledged by ${persona?.name}`, {
                        _seedSender: persona?.uid,
                        _senderName: persona?.name,
                      })
                    }
                  />
                );
              }

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.uid === (user?.getUid() ?? "") || msg.uid === persona?.uid}
                  persona={PERSONAS.find((p) => p.uid === msg.uid)}
                />
              );
            })}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 font-mono text-xs text-[#ccff00]">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
                <span>
                  {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer with Keystroke Secret Shield */}
          <ComposerBar
            onSend={sendMessage}
            onTyping={sendTypingIndicator}
            onSecretBlocked={handleSecretBlocked}
            disabled={!activeRoomId}
          />
        </div>

        {/* 3. RIGHT SIDEBAR: War Room Responders + Shield Log */}
        <div className="w-64 sm:w-72 flex-shrink-0 border-l border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl flex flex-col relative z-10">
          <MembersPanel roomGuid={activeRoomId} onlineUsers={onlineUsers} />
          {showShieldLog && (
            <ShieldLog entries={blockedLog} onClose={() => setShowShieldLog(false)} />
          )}
        </div>

        {/* Global Toast */}
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* Ctrl+K Room Switcher Modal */}
        {showRoomSwitcher && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/80 backdrop-blur-md"
            onClick={() => setShowRoomSwitcher(false)}
          >
            <div
              className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-[#ccff00]/30 bg-[#0c0c0c] p-2"
              style={{ boxShadow: "0 0 40px rgba(204,255,0,0.15)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                <Search className="w-5 h-5 text-[#ccff00]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Jump to incident room... (type or press Esc)"
                  value={switcherQuery}
                  onChange={(e) => setSwitcherQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white placeholder-white/40"
                />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 text-white/40">
                  ESC
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {ROOMS.filter(
                  (r) =>
                    r.name.toLowerCase().includes(switcherQuery.toLowerCase()) ||
                    r.guid.toLowerCase().includes(switcherQuery.toLowerCase()) ||
                    r.severity.toLowerCase().includes(switcherQuery.toLowerCase())
                ).map((room) => {
                  const isActive = room.guid === activeRoomId;
                  return (
                    <button
                      key={room.guid}
                      onClick={() => {
                        handleSwitchRoom(room.guid);
                        setShowRoomSwitcher(false);
                        setSwitcherQuery("");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                        isActive
                          ? "bg-[#ccff00]/10 border border-[#ccff00]/30 text-white"
                          : "hover:bg-white/5 text-white/70"
                      }`}
                    >
                      <span className="text-sm font-medium">{room.name}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${getSeverityBadge(room.severity)}`}>
                        {room.severity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
