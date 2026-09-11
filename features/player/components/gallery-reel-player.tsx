"use client";

import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import Reel, { type ReelHandle } from "./Reel/components/reel";
import { categoryLabelsOf } from "./Gallery/utils/galleryVideoInfo";
import { BUFFER_WINDOW } from "@/lib/constants/feed";
import { useWakeLock } from "../hooks/useWakeLock";
import type { VideoMetaMap } from "@/types/player";
import type { CategoryMap } from "@/types/api";

interface GalleryReelPlayerProps {
  isOpen: boolean;
  playlist: string[];
  index: number;
  onClose: () => void;
  onGoTo: (index: number) => void;
  videoMeta: VideoMetaMap;
  categoryMap: CategoryMap;
  onRatingSaved: (relPath: string, rating: number) => void;
  dislikedVideos: Set<string>;
  onToggleDislike: (relPath: string, disliked: boolean) => Promise<void>;
}

interface Slide {
  relPath: string;
  key: string;
  isClone: boolean;
}

export default function GalleryReelPlayer({
  isOpen,
  playlist,
  index,
  onClose,
  onGoTo,
  videoMeta,
  categoryMap,
  onRatingSaved,
  dislikedVideos,
  onToggleDislike,
}: GalleryReelPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reelRefs = useRef<Map<string, ReelHandle>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isJumpingRef = useRef(false);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressExternalJumpRef = useRef(false);
  const activeIndexRef = useRef(-1);
  const { acquire: acquireWakeLock, release: releaseWakeLock } = useWakeLock();
  const reelRefCallbacks = useRef(
    new Map<string, (handle: ReelHandle | null) => void>(),
  );

  const [activeIndex, setActiveIndex] = useState(index);

  const total = playlist.length;

  const setActive = useCallback((newIdx: number) => {
    activeIndexRef.current = newIdx;
    setActiveIndex(newIdx);
  }, []);

  const slides: Slide[] = useMemo(() => {
    if (total === 0) return [];
    if (total === 1) {
      return [{ relPath: playlist[0], key: "real-0", isClone: false }];
    }
    return [
      { relPath: playlist[total - 1], key: "clone-last", isClone: true },
      ...playlist.map((p, i) => ({
        relPath: p,
        key: `real-${i}`,
        isClone: false,
      })),
      { relPath: playlist[0], key: "clone-first", isClone: true },
    ];
  }, [playlist, total]);

  const slideIndexForReal = useCallback(
    (realIdx: number) => (total > 1 ? realIdx + 1 : 0),
    [total],
  );

  const jumpToSlide = useCallback((slideIdx: number) => {
    const container = containerRef.current;
    if (!container) return;
    isJumpingRef.current = true;

    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }

    container.scrollTo({
      top: slideIdx * container.clientHeight,
      behavior: "auto",
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
    });
  }, []);

  const optimizeBuffers = useCallback(
    (activeSlideIdx: number) => {
      slides.forEach((slide, idx) => {
        const handle = reelRefs.current.get(slide.key);
        if (!handle) return;

        const shouldBuffer = Math.abs(idx - activeSlideIdx) <= BUFFER_WINDOW;
        handle.setSrc(shouldBuffer);
      });
    },
    [slides],
  );

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const current = activeIndexRef.current;
      if (current < 0) return;
      isJumpingRef.current = true;
      container.scrollTo({
        top: slideIndexForReal(current) * container.clientHeight,
        behavior: "auto",
      });
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
      fallbackRef.current = setTimeout(() => {
        isJumpingRef.current = false;
      }, 500);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [isOpen, slideIndexForReal]);

  useEffect(() => {
    if (!isOpen) return;
    if (suppressExternalJumpRef.current) {
      suppressExternalJumpRef.current = false;
      return;
    }
    activeIndexRef.current = -1;
    setActiveIndex(index);
    const frame = requestAnimationFrame(() =>
      jumpToSlide(slideIndexForReal(index)),
    );
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, index, total]);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const key = el.dataset.slideKey;
          if (!key) continue;
          const handle = reelRefs.current.get(key);
          if (!handle) continue;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const slideIdx = slides.findIndex((s) => s.key === key);
            if (slideIdx === -1) continue;
            const slide = slides[slideIdx];

            if (slide.isClone) {
              if (!isJumpingRef.current) {
                const realTargetIdx =
                  slide.key === "clone-last" ? total - 1 : 0;
                const targetSlideIdx = slideIndexForReal(realTargetIdx);
                jumpToSlide(targetSlideIdx);
                suppressExternalJumpRef.current = true;
                setActive(realTargetIdx);
                onGoTo(realTargetIdx);
                optimizeBuffers(targetSlideIdx);
              }
              continue;
            }

            const realIdx = Number(slide.key.replace("real-", ""));
            const isNewActive = realIdx !== activeIndexRef.current;

            if (isNewActive) {
              suppressExternalJumpRef.current = true;
              setActive(realIdx);
              onGoTo(realIdx);
              optimizeBuffers(slideIdx);
            }

            reelRefs.current.forEach((h) =>
              h.video?.classList.remove("is-active"),
            );
            handle.video?.classList.add("is-active");
            handle.tryPlay();
            acquireWakeLock();
          } else {
            handle.pause();
            handle.video?.classList.remove("is-active");
          }
        }
      },
      { root: container, threshold: [0, 0.6, 1] },
    );

    reelRefs.current.forEach((handle) => {
      if (handle.element) observerRef.current?.observe(handle.element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [
    isOpen,
    slides,
    acquireWakeLock,
    optimizeBuffers,
    onGoTo,
    total,
    slideIndexForReal,
    jumpToSlide,
    setActive,
  ]);

  useEffect(() => {
    if (!isOpen) {
      reelRefs.current.forEach((h) => h.pause());
      releaseWakeLock();
      suppressExternalJumpRef.current = false;
    }
  }, [isOpen, releaseWakeLock]);

  const registerReel = useCallback((key: string, handle: ReelHandle | null) => {
    if (handle) {
      reelRefs.current.set(key, handle);
      if (handle.element) {
        handle.element.dataset.slideKey = key;
        observerRef.current?.observe(handle.element);
      }
    } else {
      const existing = reelRefs.current.get(key);
      if (existing?.element) {
        observerRef.current?.unobserve(existing.element);
      }
      reelRefs.current.delete(key);
    }
  }, []);

  const getReelRef = useCallback(
    (key: string) => {
      let callback = reelRefCallbacks.current.get(key);
      if (!callback) {
        callback = (handle) => registerReel(key, handle);
        reelRefCallbacks.current.set(key, callback);
      }
      return callback;
    },
    [registerReel],
  );

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
        {/* eslint-disable-next-line react-hooks/refs */}
        {slides.map((slide) => (
          <Reel
            key={slide.key}
            ref={getReelRef(slide.key)}
            relPath={slide.relPath}
            categoryLabels={categoryLabelsOf(slide.relPath, categoryMap)}
            isDisliked={dislikedVideos.has(slide.relPath)}
            onToggleDislike={onToggleDislike}
            isBuffered={false}
            wakeLockAcquire={acquireWakeLock}
            wakeLockRelease={releaseWakeLock}
            rating={videoMeta[slide.relPath]?.rating}
            onRatingSaved={(rating) => onRatingSaved(slide.relPath, rating)}
          />
        ))}
      </div>
    </div>
  );
}
