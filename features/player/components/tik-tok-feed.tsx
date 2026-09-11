"use client";

import { useRef } from "react";
import Reel, { type ReelHandle } from "./Reel/components/reel";
import { useInfiniteReelScroll } from "../hooks/useInfiniteReelScroll";
import type { VideoMetaMap } from "@/types/player";
import type { CategoryMap } from "@/types/api";
import { categoryLabelsOf } from "./Gallery/utils/galleryVideoInfo";

interface TikTokFeedProps {
  activeVideos: string[];
  isVisible: boolean;
  playbackEnabled: boolean;
  videoMeta: VideoMetaMap;
  categoryMap: CategoryMap;
  onRatingSaved: (relPath: string, rating: number) => void;
  dislikedVideos: Set<string>;
  onToggleDislike: (relPath: string, disliked: boolean) => Promise<void>;
}

export default function TikTokFeed({
  activeVideos,
  isVisible,
  playbackEnabled,
  videoMeta,
  categoryMap,
  onRatingSaved,
  dislikedVideos,
  onToggleDislike,
}: TikTokFeedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { reels, registerReel, acquireWakeLock, releaseWakeLock } = useInfiniteReelScroll({
    activeVideos,
    isVisible,
    playbackEnabled,
    containerRef,
  });

  if (!isVisible) return null;

  if (activeVideos.length === 0) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <p className="px-10 text-center text-muted">No videos in selected categories</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="feed"
      className="h-dvh [scroll-snap-type:y_mandatory] scrollbar-none overflow-y-scroll [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {reels.map((reel) => (
        <Reel
          key={reel.key}
          ref={(handle: ReelHandle | null) => registerReel(reel.key, handle)}
          relPath={reel.relPath}
          categoryLabels={categoryLabelsOf(reel.relPath, categoryMap)}
          isDisliked={dislikedVideos.has(reel.relPath)}
          onToggleDislike={onToggleDislike}
          isBuffered={false}
          wakeLockAcquire={acquireWakeLock}
          wakeLockRelease={releaseWakeLock}
          rating={videoMeta[reel.relPath]?.rating}
          onRatingSaved={(rating) => onRatingSaved(reel.relPath, rating)}
        />
      ))}
    </div>
  );
}