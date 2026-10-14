"use client";

import { useState, useEffect, useCallback } from "react";

interface ShieldStats {
  blocked: number;
  lastBlockedAt: number | null;
}

const STORAGE_KEY = "incidentroom_shield_stats";

function loadStats(roomGuid: string): ShieldStats {
  if (typeof window === "undefined") return { blocked: 0, lastBlockedAt: null };
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${roomGuid}`);
    if (!raw) return { blocked: 0, lastBlockedAt: null };
    return JSON.parse(raw) as ShieldStats;
  } catch {
    return { blocked: 0, lastBlockedAt: null };
  }
}

function saveStats(roomGuid: string, stats: ShieldStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${STORAGE_KEY}_${roomGuid}`,
      JSON.stringify(stats)
    );
  } catch {
    // ignore
  }
}

export function useShieldStats(roomGuid: string | null) {
  const [stats, setStats] = useState<ShieldStats>({
    blocked: 0,
    lastBlockedAt: null,
  });
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!roomGuid) return;
    const loaded = loadStats(roomGuid);
    setStats(loaded);
  }, [roomGuid]);

  const incrementBlocked = useCallback(() => {
    if (!roomGuid) return;
    setStats((prev) => {
      const next = {
        blocked: prev.blocked + 1,
        lastBlockedAt: Date.now(),
      };
      saveStats(roomGuid, next);
      return next;
    });
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);
  }, [roomGuid]);

  return { stats, animating, incrementBlocked };
}

export function useIncidentTimer(startTime: number) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const formatted = hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { elapsed, formatted };
}
