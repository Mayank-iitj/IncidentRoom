"use client";

import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
}

const TYPE_STYLES = {
  success: {
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.4)",
    color: "#10B981",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  error: {
    bg: "rgba(244,63,94,0.12)",
    border: "rgba(244,63,94,0.4)",
    color: "#F43F5E",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  info: {
    bg: "rgba(34,211,238,0.10)",
    border: "rgba(34,211,238,0.3)",
    color: "#22D3EE",
    icon: <Info className="w-4 h-4" />,
  },
};

export default function Toast({ message, type }: ToastProps) {
  const style = TYPE_STYLES[type];

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl toast-enter"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        backdropFilter: "blur(12px)",
        maxWidth: "360px",
      }}
    >
      {style.icon}
      <span className="text-sm">{message}</span>
    </div>
  );
}
