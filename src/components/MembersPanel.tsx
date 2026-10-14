"use client";

import React, { useState, useEffect } from "react";
import { Users, Shield } from "lucide-react";
import { fetchGroupMembers } from "@/lib/cometchat";
import { PERSONAS } from "@/lib/seed";

interface MembersPanelProps {
  roomGuid: string;
  onlineUsers: Set<string>;
}

interface Member {
  uid: string;
  name: string;
  role: string;
  isOnline: boolean;
  isBot: boolean;
  color: string;
  initials: string;
}

const PERSONA_META: Record<string, { color: string; initials: string; role: string; isBot: boolean }> = {
  "asha-soc": { color: "#10B981", initials: "A", role: "SOC Analyst", isBot: false },
  "ravi-lead": { color: "#F59E0B", initials: "R", role: "Incident Lead", isBot: false },
  "sentinel-bot": { color: "#ccff00", initials: "S", role: "Sentinel Bot", isBot: true },
};

export default function MembersPanel({ roomGuid, onlineUsers }: MembersPanelProps) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await fetchGroupMembers(roomGuid);
        const mapped: Member[] = raw.map((m) => {
          const uid = m.getUid();
          const meta = PERSONA_META[uid];
          return {
            uid,
            name: m.getName() ?? uid,
            role: meta?.role ?? "Responder",
            isOnline: onlineUsers.has(uid),
            isBot: meta?.isBot ?? false,
            color: meta?.color ?? "#94A3B8",
            initials: meta?.initials ?? uid.slice(0, 2).toUpperCase(),
          };
        });
        setMembers(mapped);
      } catch {
        // Fallback to personas
        const fallback = PERSONAS.map((p) => ({
          uid: p.uid,
          name: p.name,
          role: p.role,
          isOnline: onlineUsers.has(p.uid),
          isBot: "isBot" in p ? Boolean(p.isBot) : false,
          color: p.uid === "sentinel-bot" ? "#ccff00" : p.color,
          initials: p.initials,
        }));
        setMembers(fallback);
      }
    };
    load();
  }, [roomGuid, onlineUsers]);

  useEffect(() => {
    setMembers((prev) =>
      prev.map((m) => ({ ...m, isOnline: onlineUsers.has(m.uid) }))
    );
  }, [onlineUsers]);

  return (
    <div className="flex flex-col flex-1 min-h-0 font-['Space_Grotesk']">
      <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#ccff00]" />
          <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
            Responders ({members.length})
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full">
          SYNCED
        </span>
      </div>

      <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
        {members.length === 0 &&
          PERSONAS.map((p) => (
            <MemberRow
              key={p.uid}
              member={{
                uid: p.uid,
                name: p.name,
                role: p.role,
                isOnline: onlineUsers.has(p.uid),
                isBot: "isBot" in p ? Boolean(p.isBot) : false,
                color: p.uid === "sentinel-bot" ? "#ccff00" : p.color,
                initials: p.initials,
              }}
            />
          ))}

        {members.map((m) => (
          <MemberRow key={m.uid} member={m} />
        ))}
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/5">
      <div className="relative flex-shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono"
          style={{
            background: `${member.color}20`,
            color: member.color,
            border: `1px solid ${member.color}40`,
          }}
        >
          {member.initials}
        </div>
        {/* Presence indicator */}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black"
          style={{
            background: member.isOnline ? "#ccff00" : "#374151",
            boxShadow: member.isOnline ? "0 0 8px #ccff00" : "none",
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold truncate text-[#ebebeb] flex items-center gap-1.5">
          <span>{member.name}</span>
          {member.isBot && (
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30">
              BOT
            </span>
          )}
        </div>
        <div className="text-[11px] font-mono text-white/40 mt-0.5 truncate">
          {member.isOnline ? "Online" : "Offline"} · {member.role}
        </div>
      </div>
    </div>
  );
}
