"use client";

import React from "react";
import { Shield, Bot, CheckCircle } from "lucide-react";
import type { ChatMessage } from "@/hooks/useGroupChat";
import type { Persona } from "@/context/AuthContext";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  persona?: Persona | (typeof import("@/lib/seed").PERSONAS)[number];
}

function formatTime(sentAt: number): string {
  const d = new Date(sentAt * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const PERSONA_COLORS: Record<string, string> = {
  "asha-soc": "#10B981",
  "ravi-lead": "#F59E0B",
  "sentinel-bot": "#ccff00",
};

const PERSONA_INITIALS: Record<string, string> = {
  "asha-soc": "A",
  "ravi-lead": "R",
  "sentinel-bot": "S",
};

export default function MessageBubble({ message, isOwn, persona }: MessageBubbleProps) {
  const isBlocked = message.isBlocked;
  const isSummary = message.text.startsWith("📋 **INCIDENT SUMMARY**");
  const isEscalation = message.metadata?._escalation;

  // Blocked secret card
  if (isBlocked) {
    return (
      <div className="mx-2 p-4 rounded-2xl message-enter animate-shake bg-rose-500/10 border border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-[#f43f5e] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-[#f43f5e] tracking-wider uppercase">
                🛡️ Secret Intercepted (Shield Blocked)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-[#f43f5e]">
                LOCAL AIR-GAP
              </span>
            </div>
            <div className="text-xs font-mono p-2.5 rounded-xl bg-black/60 text-[#fca5a5] border border-rose-500/20 whitespace-pre-wrap break-all my-2">
              {message.text}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-white/40">
              <span>{formatTime(message.sentAt)}</span>
              <span className="text-[#ccff00]">Blocked from CometChat socket wire</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Escalation notice
  if (isEscalation) {
    return (
      <div className="mx-2 p-3.5 rounded-2xl message-enter bg-rose-500/10 border border-rose-500/30">
        <div className="text-xs font-mono font-bold text-[#f43f5e] tracking-wider">
          {message.text}
        </div>
        <div className="text-[10px] font-mono text-white/40 mt-1">
          {formatTime(message.sentAt)}
        </div>
      </div>
    );
  }

  const uid = message.uid;
  const color = PERSONA_COLORS[uid] ?? (isOwn ? "#ccff00" : "#94A3B8");
  const initials = PERSONA_INITIALS[uid] ?? message.name.slice(0, 2).toUpperCase();

  return (
    <div className={`flex items-start gap-2.5 message-enter px-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold font-mono shadow-sm"
        style={{
          background: `${color}20`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {initials}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-sm sm:max-w-md lg:max-w-lg ${isOwn ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1 text-[11px]">
          <span className="font-semibold font-mono" style={{ color }}>
            {message.name}
          </span>
          {uid === "sentinel-bot" && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 flex items-center gap-1">
              <Bot className="w-2.5 h-2.5" />
              BOT
            </span>
          )}
          <span className="text-white/40 font-mono text-[10px]">
            {formatTime(message.sentAt)}
          </span>
        </div>

        <div
          className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed ${
            isOwn
              ? "bg-[#ccff00]/15 border border-[#ccff00]/30 text-white rounded-tr-sm"
              : "bg-white/[0.04] border border-white/10 text-[#ebebeb] rounded-tl-sm"
          }`}
          style={{
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            maxWidth: "100%",
          }}
        >
          {isSummary ? (
            <div className="font-mono text-xs text-white/90 whitespace-pre-wrap leading-relaxed p-1">
              {message.text}
            </div>
          ) : (
            message.text
          )}
        </div>
      </div>
    </div>
  );
}
