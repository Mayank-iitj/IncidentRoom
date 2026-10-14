"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  Hand,
  Maximize2,
  Minimize2,
  Users,
  Radio,
  Settings,
  Shield,
  Volume2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  joinEmergencyBridge,
  leaveEmergencyBridge,
  toggleAudio,
  toggleVideo,
  toggleScreenShare,
  toggleHand,
} from "@/lib/cometchatCalls";
import { PERSONAS } from "@/lib/seed";

interface EmergencyCallBridgeProps {
  roomId: string;
  roomName: string;
  onClose: () => void;
}

export default function EmergencyCallBridge({
  roomId,
  roomName,
  onClose,
}: EmergencyCallBridgeProps) {
  const { user, persona } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"tile" | "spotlight">("tile");
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const callsContainerRef = useRef<HTMLDivElement>(null);

  // Other responder persona in the call
  const otherPersona =
    persona?.uid === "asha-soc"
      ? PERSONAS.find((p) => p.uid === "ravi-lead")
      : PERSONAS.find((p) => p.uid === "asha-soc");

  // Call duration counter
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isJoined) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isJoined]);

  // Format call duration
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  // Connect to Emergency Bridge on mount
  useEffect(() => {
    let isCancelled = false;

    async function connect() {
      // 1. Join CometChat Calls session
      await joinEmergencyBridge(roomId, callsContainerRef.current, {
        startMuted: false,
        startVideoDisabled: false,
      });

      // 2. Request user media for local video tile preview
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (!isCancelled) {
            mediaStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        }
      } catch (err) {
        console.warn("Camera/microphone preview not granted or simulated:", err);
      }

      if (!isCancelled) {
        setIsJoined(true);
      }
    }

    connect();

    return () => {
      isCancelled = true;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      leaveEmergencyBridge();
    };
  }, [roomId]);

  // Toggle local mic
  const handleToggleAudio = async () => {
    const nextState = await toggleAudio(isMuted);
    setIsMuted(nextState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextState;
      });
    }
  };

  // Toggle local camera
  const handleToggleVideo = async () => {
    const nextState = await toggleVideo(isVideoOff);
    setIsVideoOff(nextState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !nextState;
      });
    }
  };

  // Toggle screen share
  const handleToggleScreenShare = async () => {
    const nextState = await toggleScreenShare(isScreenSharing);
    setIsScreenSharing(nextState);
  };

  // Toggle hand raise
  const handleToggleHand = async () => {
    const nextState = await toggleHand(isHandRaised);
    setIsHandRaised(nextState);
  };

  // Disconnect & hang up
  const handleHangUp = async () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    await leaveEmergencyBridge();
    setIsJoined(false);
    onClose();
  };

  // Collapsed Picture-In-Picture mode
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-[#0c0c0c]/95 border border-[#ccff00]/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse" />
          <span className="text-xs font-mono font-semibold text-[#ebebeb]">
            BRIDGE: {formatDuration(callDuration)}
          </span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <button
          onClick={handleToggleAudio}
          className={`p-1.5 rounded-lg text-xs ${
            isMuted ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white/80 hover:text-white"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 rounded-lg bg-[#ccff00]/20 text-[#ccff00] hover:bg-[#ccff00]/30"
          title="Expand Bridge"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleHangUp}
          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
          title="Leave Bridge"
        >
          <PhoneOff className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mb-4 transition-all duration-300">
      {/* 1. Header Bar */}
      <div className="px-4 py-3 bg-[#111111] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#ccff00]/15 border border-[#ccff00]/30">
            <Radio className="w-3.5 h-3.5 text-[#ccff00] animate-pulse" />
            <span className="text-[11px] font-mono font-semibold tracking-wider text-[#ccff00] uppercase">
              Emergency Audio/Video Bridge
            </span>
          </div>
          <span className="text-xs text-white/50 hidden sm:inline">
            Room: <strong className="text-white/80">{roomName}</strong>
          </span>
          <div className="h-3 w-px bg-white/10 hidden sm:block" />
          <span className="text-xs font-mono text-[#ccff00]/80">
            {formatDuration(callDuration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Mode Selector */}
          <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5 text-[11px] font-mono">
            <button
              onClick={() => setLayoutMode("tile")}
              className={`px-2 py-1 rounded ${
                layoutMode === "tile" ? "bg-white/10 text-[#ccff00]" : "text-white/40 hover:text-white"
              }`}
            >
              Tile
            </button>
            <button
              onClick={() => setLayoutMode("spotlight")}
              className={`px-2 py-1 rounded ${
                layoutMode === "spotlight" ? "bg-white/10 text-[#ccff00]" : "text-white/40 hover:text-white"
              }`}
            >
              Spotlight
            </button>
          </div>

          {/* Minimize button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize to Picture-In-Picture"
          >
            <Minimize2 className="w-4 h-4" />
          </button>

          {/* Leave Call button */}
          <button
            onClick={handleHangUp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-xs font-mono transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* 2. Video Grid / Tiles */}
      <div className="p-3 bg-black/60 relative min-h-[220px]">
        {/* SDK mount point if native SDK attaches */}
        <div ref={callsContainerRef} className="absolute inset-0 pointer-events-none opacity-0" />

        <div
          className={`grid gap-3 ${
            layoutMode === "tile"
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-3"
          }`}
        >
          {/* TILE 1: Local Responder (You) */}
          <div
            className={`relative bg-[#141414] rounded-xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center ${
              layoutMode === "spotlight" ? "md:col-span-2 aspect-video" : ""
            }`}
          >
            {isVideoOff ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-lg font-bold text-[#ccff00]">
                  {persona?.name?.slice(0, 2).toUpperCase() || "ME"}
                </div>
                <span className="text-xs text-white/40 font-mono">Camera Paused</span>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            )}

            {/* Overlay Badges */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
              <span>{persona?.name || "You"} (Local)</span>
            </div>

            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              {isHandRaised && (
                <span className="px-2 py-0.5 rounded bg-amber-500/30 border border-amber-500/40 text-[10px] text-amber-300 font-mono flex items-center gap-1">
                  <Hand className="w-3 h-3" /> Hand Raised
                </span>
              )}
              <span
                className={`p-1 rounded ${
                  isMuted ? "bg-red-500/30 text-red-400" : "bg-black/60 text-[#ccff00]"
                }`}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </span>
            </div>
          </div>

          {/* TILE 2: Remote Peer (Ravi or Asha) */}
          <div className="relative bg-[#141414] rounded-xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center">
            {/* Simulated Remote WebRTC Feed with Voice Wave Animation */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-xl font-bold text-cyan-300">
                  {otherPersona?.name?.slice(0, 2).toUpperCase() || "RP"}
                </div>
                {/* Voice Activity Waves */}
                <div className="absolute -inset-1.5 rounded-full border border-cyan-400/30 animate-ping pointer-events-none" />
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-white/90">
                  {otherPersona?.name || "Incident Responder"}
                </div>
                <div className="text-[10px] text-white/40 font-mono">
                  {otherPersona?.role || "Responder Lead"} • WebRTC Connected
                </div>
              </div>
            </div>

            {/* Peer Badges */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{otherPersona?.name || "Responder"}</span>
            </div>

            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 text-[11px] font-mono text-white/70">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Speaking</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tactical Media Controls Toolbar */}
      <div className="px-4 py-3 bg-[#111111] border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mute Button */}
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isMuted
                ? "bg-red-500/20 border-red-500/30 text-red-400"
                : "bg-white/5 border-white/10 text-white hover:border-[#ccff00]/40"
            }`}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#ccff00]" />}
            <span>{isMuted ? "Unmute Mic" : "Mute Mic"}</span>
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={handleToggleVideo}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isVideoOff
                ? "bg-red-500/20 border-red-500/30 text-red-400"
                : "bg-white/5 border-white/10 text-white hover:border-[#ccff00]/40"
            }`}
          >
            {isVideoOff ? (
              <VideoOff className="w-3.5 h-3.5" />
            ) : (
              <Video className="w-3.5 h-3.5 text-[#ccff00]" />
            )}
            <span>{isVideoOff ? "Start Camera" : "Stop Camera"}</span>
          </button>

          {/* Screen Share Button */}
          <button
            onClick={handleToggleScreenShare}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isScreenSharing
                ? "bg-[#ccff00]/20 border-[#ccff00]/40 text-[#ccff00]"
                : "bg-white/5 border-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{isScreenSharing ? "Stop Share" : "Share Screen"}</span>
          </button>

          {/* Raise Hand Button */}
          <button
            onClick={handleToggleHand}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isHandRaised
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-white/5 border-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>{isHandRaised ? "Lower Hand" : "Raise Hand"}</span>
          </button>
        </div>

        {/* Security & Presence status */}
        <div className="flex items-center gap-3 text-xs font-mono text-white/40">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#ccff00]" />
            <span className="hidden md:inline">E2E Encrypted WebRTC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>2 Responders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
