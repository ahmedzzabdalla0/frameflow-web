"use client";

import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import SeekBar from "./seek-bar";
import CopyLinkButton from "./copy-link-button";
import DislikeButton from "./dislike-button";
import FullscreenButton from "./fullscreen-button";
import VideoLoader from "./video-loader";
import TapToPlayOverlay from "./tap-to-play-overlay";
import RatingControl from "@/components/ui/rating-control";
import CategoryBadges from "@/components/ui/category-badges";
import { useVideoSource } from "../hooks/useVideoSource";
import { useVideoPlayback } from "../hooks/useVideoPlayback";

interface ReelProps {
  relPath: string;
  categoryLabels: string[];
  isBuffered: boolean;
  wakeLockAcquire: () => void;
  wakeLockRelease: () => void;
  rating?: number | null;
  onRatingSaved?: (rating: number) => void;
  isDisliked: boolean;
  onToggleDislike: (relPath: string, disliked: boolean) => Promise<void>;
}

export interface ReelHandle {
  element: HTMLElement | null;
  video: HTMLVideoElement | null;
  tryPlay: () => void;
  pause: () => void;
  setSrc: (enabled: boolean) => void;
}

const Reel = forwardRef<ReelHandle, ReelProps>(function Reel(
  {
    relPath,
    categoryLabels,
    isBuffered,
    rating,
    onRatingSaved,
    isDisliked,
    onToggleDislike,
  },
  ref,
) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isDislikeUpdating, setIsDislikeUpdating] = useState(false);

  const { url, setSrc } = useVideoSource(videoRef, relPath, isBuffered);
  const {
    handleVideoClick,
    tryPlay,
    pause,
    togglePlay,
    currentTime,
    duration,
    handleSeek,
    isPlaying,
    isLoading,
    isSeeking,
    needsInteraction,
  } = useVideoPlayback(videoRef);

  useImperativeHandle(
    ref,
    () => ({
      element: sectionRef.current,
      video: videoRef.current,
      tryPlay,
      pause,
      setSrc,
    }),
    [tryPlay, pause, setSrc],
  );

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  const handleToggleDislike = async () => {
    if (isDislikeUpdating) return;
    setIsDislikeUpdating(true);
    try {
      await onToggleDislike(relPath, !isDisliked);
    } finally {
      setIsDislikeUpdating(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex h-dvh w-full items-center justify-center bg-black"
      style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
    >
      <video
        ref={videoRef}
        onClick={handleVideoClick}
        className="size-full bg-black object-contain"
        playsInline
        muted
        loop
        preload="none"
      />

      <div
        className="pointer-events-auto absolute right-4 z-20 max-w-[calc(100%-2rem)]"
        style={{ top: "max(3.5rem, calc(env(safe-area-inset-top) + 1rem))" }}
      >
        <CategoryBadges categories={categoryLabels} />
      </div>

      <VideoLoader visible={isLoading} />
      {!isLoading && <TapToPlayOverlay visible={needsInteraction} />}

      <CopyLinkButton url={url} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
        <div className="pointer-events-auto absolute right-4 bottom-25 flex flex-col items-center gap-2">
          <RatingControl
            relPath={relPath}
            initialRating={rating ?? null}
            onSaved={onRatingSaved}
          />
          <DislikeButton
            isDisliked={isDisliked}
            isUpdating={isDislikeUpdating}
            onToggle={handleToggleDislike}
          />
          <FullscreenButton videoRef={videoRef} />
        </div>

        <div
          className="pointer-events-auto absolute inset-x-0"
          style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <SeekBar
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            isPlaying={isPlaying}
            isSeeking={isSeeking}
            onTogglePlay={handleTogglePlay}
            isLoading={isLoading}
          />
        </div>
      </div>
    </section>
  );
});

export default Reel;
