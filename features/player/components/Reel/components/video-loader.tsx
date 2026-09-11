"use client";

interface VideoLoaderProps {
  visible: boolean;
}

export default function VideoLoader({ visible }: VideoLoaderProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-4 flex items-center justify-center bg-black/20 backdrop-blur-[1px] transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-white/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-white" />
      </div>
    </div>
  );
}
