"use client";

import { useMemo } from "react";
import Reel from "../../Reel/components/reel";
import { categoryOfPath } from "../../../utils/encodeVideoPath";
import { buildLoopedSlides } from "../utils/buildLoopedSlides";
import { useLoopedReelScroll } from "../hooks/useLoopedReelScroll";

interface GalleryReelPlayerProps {
  isOpen: boolean;
  playlist: string[];
  index: number;
  onClose: () => void;
  onGoTo: (index: number) => void;
}

export default function GalleryReelPlayer({ isOpen, playlist, index, onClose, onGoTo }: GalleryReelPlayerProps) {
  const total = playlist.length;
  const slides = useMemo(() => buildLoopedSlides(playlist), [playlist]);

  const { containerRef, activeIndex, registerReel, acquireWakeLock, releaseWakeLock } = useLoopedReelScroll({
    isOpen,
    slides,
    total,
    index,
    onGoTo,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-300 bg-black">
      <button
        onClick={onClose}
        className="absolute top-3.5 left-3.5 z-10 flex size-9.5 cursor-pointer items-center justify-center rounded-full border-none bg-black/55 text-xl text-white"
        aria-label="Close"
      >
        ✕
      </button>

      <span className="pointer-events-none absolute top-4.5 left-1/2 z-10 -translate-x-1/2 text-xs text-white/70">
        {activeIndex + 1} / {total}
      </span>

      <div
        ref={containerRef}
        className="h-dvh [scroll-snap-type:y_mandatory] scrollbar-none overflow-y-scroll [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => (
          <Reel
            key={slide.key}
            ref={(handle) => registerReel(slide.key, handle)}
            relPath={slide.relPath}
            categoryLabels={[categoryOfPath(slide.relPath) === "__root__" ? "Home" : categoryOfPath(slide.relPath)]}
            isBuffered={false}
            wakeLockAcquire={acquireWakeLock}
            wakeLockRelease={releaseWakeLock}
            isDisliked={false}
            onToggleDislike={async () => undefined}
          />
        ))}
      </div>
    </div>
  );
}
