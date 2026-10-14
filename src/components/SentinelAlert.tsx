"use client";

import React from "react";
import { AlertTriangle, Shield, CheckCircle2 } from "lucide-react";
import type { Severity } from "./WarRoom";

interface SentinelAlertProps {
  data: Record<string, unknown>;
  onAcknowledge: () => void;
}

const SEVERITY_STYLES: Record<
  string,
  { bg: string; border: string; color: string; icon: React.ReactNode }
> = {
  CRITICAL: {
    bg: "rgba(244,63,94,0.08)",
    border: "rgba(244,63,94,0.4)",
    color: "#f43f5e",
    icon: <AlertTriangle className="w-4 h-4 text-[#f43f5e]" />,
  },
  HIGH: {
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.4)",
    color: "#f59e0b",
    icon: <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />,
  },
  MEDIUM: {
    bg: "rgba(204,255,0,0.08)",
    border: "rgba(204,255,0,0.3)",
    color: "#ccff00",
    icon: <Shield className="w-4 h-4 text-[#ccff00]" />,
  },
  LOW: {
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.3)",
    color: "#10b981",
    icon: <Shield className="w-4 h-4 text-[#10b981]" />,
  },
};

export default function SentinelAlert({ data, onAcknowledge }: SentinelAlertProps) {
  const severity = (data.severity as Severity) ?? "MEDIUM";
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.MEDIUM;
  const [acked, setAcked] = React.useState(false);

  const handleAck = () => {
    setAcked(true);
    onAcknowledge();
  };

  return (
    <div
      className="mx-2 rounded-2xl overflow-hidden message-enter border font-['Space_Grotesk']"
      style={{
        background: style.bg,
        borderColor: style.border,
        boxShadow: `0 0 25px ${style.border}`,
      }}
    >
      {/* Header Bar */}
      <div
        className="px-4 py-2.5 flex items-center justify-between border-b"
        style={{ borderColor: style.border }}
      >
        <div className="flex items-center gap-2">
          {style.icon}
          <span className="font-mono font-bold text-xs tracking-wider uppercase" style={{ color: style.color }}>
            SENTINEL TELEMETRY ALERT
          </span>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
          style={{
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
          }}
        >
          {severity}
        </span>
      </div>

      {/* Body Details */}
      <div className="p-4 space-y-3">
        <p className="text-xs sm:text-sm text-[#ebebeb] font-medium leading-relaxed">
          {data.summary as string}
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono p-3 rounded-xl bg-black/40 border border-white/5">
          <div>
            <span className="text-white/40 block text-[10px] uppercase">Source IP</span>
            <span className="text-white font-medium">{String(data.sourceIp)}</span>
          </div>
          <div>
            <span className="text-white/40 block text-[10px] uppercase">Affected Service</span>
            <span className="text-[#ccff00] font-medium">{String(data.affectedService)}</span>
          </div>
        </div>

        {Boolean(data.recommendedAction) && (
          <div className="text-xs font-mono p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-white/40">Action: </span>
            <span className="text-[#ebebeb]">{String(data.recommendedAction)}</span>
          </div>
        )}

        {/* Acknowledge Button */}
        <div className="pt-1">
          <button
            onClick={handleAck}
            disabled={acked}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-60"
            style={{
              background: acked ? "rgba(16,185,129,0.15)" : style.bg,
              color: acked ? "#10b981" : style.color,
              border: `1px solid ${acked ? "rgba(16,185,129,0.4)" : style.border}`,
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {acked ? "ACKNOWLEDGED BY TEAM" : "ACKNOWLEDGE ALERT"}
          </button>
        </div>
      </div>
    </div>
  );
}
