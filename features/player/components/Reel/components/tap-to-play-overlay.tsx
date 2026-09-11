"use client";

import { Play } from "lucide-react";

interface TapToPlayOverlayProps {
  visible: boolean;
}

export default function TapToPlayOverlay({ visible }: TapToPlayOverlayProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-4 flex items-center justify-center bg-black/30 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-2 text-white">
        <div className="flex size-16 items-center justify-center rounded-full bg-black/60 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
          <Play size={32} />
        </div>
        <span className="text-sm font-medium tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">Click to play</span>
      </div>
    </div>
  );
}
