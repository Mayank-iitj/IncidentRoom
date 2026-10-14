"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PERSONAS } from "@/lib/seed";
import { Shield, AlertTriangle, Zap } from "lucide-react";

const roleColors: Record<string, string> = {
  "SOC Analyst": "#10B981",
  "Incident Lead": "#F59E0B",
  Bot: "#22D3EE",
};

const roleIcons: Record<string, React.ReactNode> = {
  "SOC Analyst": <Zap className="w-5 h-5" />,
  "Incident Lead": <AlertTriangle className="w-5 h-5" />,
  Bot: <Shield className="w-5 h-5" />,
};

export default function LoginView() {
  const { user, loading, error, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/rooms/inc-101-phishing");
    }
  }, [user, router]);

  if (user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl px-4">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)" }}
            >
              <Shield className="w-7 h-7" style={{ color: "#22D3EE" }} />
            </div>
            <h1
              className="text-4xl font-bold tracking-tight logo-gradient"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              IncidentRoom
            </h1>
          </div>
          <p className="text-lg font-medium" style={{ color: "#94A3B8" }}>
            Incident chat that stops credential leaks.{" "}
            <span style={{ color: "#22D3EE" }}>Live.</span>
          </p>
          <p className="text-sm mt-2" style={{ color: "#475569" }}>
            Choose your persona to join the war room
          </p>
        </div>

        {/* Persona cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PERSONAS.map((persona) => {
            const color = roleColors[persona.role] ?? "#94A3B8";
            const isBot = persona.role === "Bot";

            return (
              <button
                key={persona.uid}
                id={`persona-${persona.uid}`}
                onClick={() => login(persona.uid)}
                disabled={loading}
                className="group relative text-left transition-all duration-200 rounded-2xl p-6 cursor-pointer"
                style={{
                  background: "rgba(17,24,39,0.8)",
                  border: `1px solid rgba(255,255,255,0.06)`,
                  backdropFilter: "blur(12px)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.border = `1px solid ${color}40`;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 24px ${color}15`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.border = `1px solid rgba(255,255,255,0.06)`;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                {/* Avatar */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold relative"
                    style={{ background: `${color}20`, color }}
                  >
                    {persona.initials}
                    {isBot && (
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ background: "#22D3EE", color: "#0A0E17" }}
                      >
                        B
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{persona.name}</div>
                    <div
                      className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
                      style={{
                        background: `${color}20`,
                        color,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      {isBot ? (
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          BOT
                        </span>
                      ) : (
                        persona.role
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ color: "#94A3B8", fontSize: "0.875rem" }}>
                  {persona.uid === "asha-soc" &&
                    "Monitors alerts, investigates threats, and documents findings in real-time."}
                  {persona.uid === "ravi-lead" &&
                    "Coordinates incident response, escalates issues, and leads the war room."}
                  {persona.uid === "sentinel-bot" &&
                    "Automated threat intelligence bot. Posts structured alerts and summaries."}
                </div>

                <div
                  className="mt-4 flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all"
                  style={{ color }}
                >
                  {roleIcons[persona.role]}
                  Sign in as {persona.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div
            className="text-center rounded-xl p-4 mb-4"
            style={{
              background: "rgba(244,63,94,0.1)",
              border: "1px solid rgba(244,63,94,0.3)",
              color: "#F43F5E",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center" style={{ color: "#22D3EE" }}>
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Initializing secure channel...
            </div>
          </div>
        )}

        {/* Powered by */}
        <div className="text-center mt-8" style={{ color: "#475569", fontSize: "0.75rem" }}>
          Powered by{" "}
          <a
            href="https://cometchat.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#22D3EE" }}
          >
            CometChat
          </a>{" "}
          MCP · Built for #ZeroToChat
        </div>
      </div>
    </div>
  );
}
