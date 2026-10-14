"use client";

import dynamic from "next/dynamic";

const LandingView = dynamic(() => import("@/components/LandingView"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#000000]">
      <div className="text-center font-mono">
        <div
          className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: "#ccff00", borderTopColor: "transparent" }}
        />
        <div className="text-[#ebebeb]/60 text-xs tracking-widest uppercase">
          Initializing Obsidian & Lime Shell...
        </div>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return <LandingView />;
}
