"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";

const WarRoom = dynamic(() => import("@/components/WarRoom"), {
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

export default function RoomContainer() {
  const params = useParams();
  const roomId = (params?.id as string) || "inc-101-phishing";
  const { user, initialized, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.replace("/");
    }
  }, [initialized, loading, user, router]);

  if (!initialized || loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0A0E17" }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#22D3EE", borderTopColor: "transparent" }}
          />
          <div style={{ color: "#94A3B8" }}>Connecting...</div>
        </div>
      </div>
    );
  }

  return <WarRoom initialRoomId={roomId} />;
}
