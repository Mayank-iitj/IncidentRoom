"use client";

import React from "react";
import { Shield, X, AlertOctagon } from "lucide-react";

interface ShieldEntry {
  id: string;
  type: string;
  preview: string;
  timestamp: number;
  roomGuid: string;
}

interface ShieldLogProps {
  entries: ShieldEntry[];
  onClose: () => void;
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function ShieldLog({ entries, onClose }: ShieldLogProps) {
  return (
    <div className="border-t border-white/10 bg-[#0a0a0a] flex flex-col max-h-[320px] font-['Space_Grotesk']">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#f43f5e]" />
          <span className="text-xs font-mono font-bold tracking-wider text-[#f43f5e] uppercase">
            Shield Intercept Audit
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
        {entries.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-white/30">
            <AlertOctagon className="w-6 h-6 mx-auto mb-2 opacity-30" />
            No credentials leaked or blocked yet.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1"
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-[#f43f5e] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  {entry.type}
                </span>
                <span className="text-white/40">{timeAgo(entry.timestamp)}</span>
              </div>
              <div className="text-[11px] font-mono text-white/60 truncate bg-black/40 p-1.5 rounded">
                {entry.preview}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
