"use client";

import dynamic from "next/dynamic";

const RoomContainer = dynamic(() => import("@/components/RoomContainer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen" style={{ background: "#0A0E17" }}>
      <div className="text-center">
        <div
          className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: "#22D3EE", borderTopColor: "transparent" }}
        />
        <div style={{ color: "#94A3B8" }}>Loading IncidentRoom...</div>
      </div>
    </div>
  ),
});

export default function RoomPage() {
  return <RoomContainer />;
}
