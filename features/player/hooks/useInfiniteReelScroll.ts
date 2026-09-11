"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { ReelHandle } from "../components/Reel/components/reel";
import { APPEND_THRESHOLD, APPEND_BATCH_SIZE, BUFFER_WINDOW } from "@/lib/constants/feed";
import { useVideoFeed } from "./useVideoFeed";
import { useWakeLock } from "./useWakeLock";

interface ReelEntry {
  relPath: string;
  key: string;
}

interface UseInfiniteReelScrollArgs {
  activeVideos: string[];
  isVisible: boolean;
  playbackEnabled: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteReelScroll({ activeVideos, isVisible, playbackEnabled, containerRef }: UseInfiniteReelScrollArgs) {
  const [reels, setReels] = useState<ReelEntry[]>([]);
  const reelRefs = useRef<Map<string, ReelHandle>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const playbackEnabledRef = useRef(playbackEnabled);
  const wasPlayingBeforeBlockRef = useRef(false);
  const resumeKeyRef = useRef<string | null>(null);
  const playbackBlockSeenRef = useRef(false);
  const activeKeyRef = useRef<string | null>(null);
  const { acquire: acquireWakeLock, release: releaseWakeLock } = useWakeLock();
  const activeVideosSig = activeVideos.join("|");

  const { resetPlaylist, nextFromPlaylist } = useVideoFeed({
    getActiveVideos: useCallback(() => activeVideos, [activeVideos]),
  });

  const appendBatch = useCallback(() => {
    const batch: ReelEntry[] = [];
    for (let i = 0; i < APPEND_BATCH_SIZE; i++) {
      const path = nextFromPlaylist();
      if (path) batch.push({ relPath: path, key: `${path}-${Date.now()}-${i}` });
    }
    if (batch.length > 0) setReels((prev) => [...prev, ...batch]);
  }, [nextFromPlaylist]);

  const optimizeBuffers = useCallback((activeIndex: number) => {
    [...reelRefs.current.values()].forEach((handle, idx) => {
      handle.setSrc(Math.abs(idx - activeIndex) <= BUFFER_WINDOW);
    });
  }, []);

  const appendBatchRef = useRef(appendBatch);
  const optimizeBuffersRef = useRef(optimizeBuffers);
  const acquireWakeLockRef = useRef(acquireWakeLock);

  useEffect(() => {
    playbackEnabledRef.current = playbackEnabled;
    appendBatchRef.current = appendBatch;
    optimizeBuffersRef.current = optimizeBuffers;
    acquireWakeLockRef.current = acquireWakeLock;
  }, [playbackEnabled, appendBatch, optimizeBuffers, acquireWakeLock]);

  useEffect(() => {
    if (!isVisible) return;
    if (activeVideos.length === 0) {
      queueMicrotask(() => setReels([]));
      return;
    }

    reelRefs.current.forEach((handle) => handle.pause());
    resetPlaylist();
    const initial: ReelEntry[] = [];
    for (let i = 0; i < APPEND_BATCH_SIZE; i++) {
      const path = nextFromPlaylist();
      if (path) initial.push({ relPath: path, key: `${path}-init-${i}` });
    }
    queueMicrotask(() => setReels(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideosSig, isVisible]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const key = activeKeyRef.current;
      if (!key) return;
      const handle = reelRefs.current.get(key);
      if (!handle?.element) return;
      const idx = [...reelRefs.current.keys()].indexOf(key);
      container.scrollTo({ top: idx * container.clientHeight, behavior: "auto" });
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (!playbackEnabledRef.current) {
          reelRefs.current.forEach((item) => item.pause());
          return;
        }
        for (const entry of entries) {
          const key = (entry.target as HTMLElement).dataset.reelKey;
          if (!key) continue;
          const handle = reelRefs.current.get(key);
          if (!handle) continue;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = [...reelRefs.current.keys()].indexOf(key);
            const alreadyActive = handle.video?.classList.contains("is-active") && handle.video && !handle.video.paused;
            if (alreadyActive) continue;
            activeKeyRef.current = key;
            reelRefs.current.forEach((item, k) => {
              item.video?.classList.remove("is-active");
              if (k !== key) item.pause();
            });
            handle.video?.classList.add("is-active");
            handle.tryPlay();
            acquireWakeLockRef.current();
            optimizeBuffersRef.current(idx);
            if (reelRefs.current.size - idx <= APPEND_THRESHOLD) appendBatchRef.current();
          } else if (entry.intersectionRatio === 0) {
            handle.pause();
            handle.video?.classList.remove("is-active");
          }
        }
      },
      {
        root: container,
        threshold: [0, 0.6, 1],
      },
    );

    reelRefs.current.forEach((handle) => {
      if (handle.element) observerRef.current?.observe(handle.element);
    });

    return () => observerRef.current?.disconnect();
  }, [containerRef]);

  const firstKey = reels[0]?.key;

  useEffect(() => {
    if (!firstKey || !isVisible || !playbackEnabled) return;
    if (playbackBlockSeenRef.current) return;

    const timer = setTimeout(() => {
      const handle = reelRefs.current.get(firstKey);
      const hasActive = [...reelRefs.current.values()].some((item) => item.video?.classList.contains("is-active"));
      if (handle && !hasActive) {
        handle.setSrc(true);
        handle.tryPlay();
        optimizeBuffers(0);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [firstKey, isVisible, playbackEnabled, optimizeBuffers]);

  useEffect(() => {
    if (!isVisible) {
      reelRefs.current.forEach((handle) => handle.pause());
      releaseWakeLock();
      return;
    }

    if (!playbackEnabled) {
      const playingEntry = [...reelRefs.current.entries()].find(([, handle]) => handle.video && !handle.video.paused);
      wasPlayingBeforeBlockRef.current = Boolean(playingEntry);
      resumeKeyRef.current = playingEntry?.[0] ?? null;
      playbackBlockSeenRef.current = true;
      reelRefs.current.forEach((handle) => handle.pause());
      releaseWakeLock();
      return;
    }

    const resumeHandle = resumeKeyRef.current ? reelRefs.current.get(resumeKeyRef.current) : undefined;
    if (resumeHandle && wasPlayingBeforeBlockRef.current) {
      resumeHandle.tryPlay();
      acquireWakeLock();
    }
    wasPlayingBeforeBlockRef.current = false;
    resumeKeyRef.current = null;
    playbackBlockSeenRef.current = false;
  }, [isVisible, playbackEnabled, acquireWakeLock, releaseWakeLock]);

  const registerReel = useCallback((key: string, handle: ReelHandle | null) => {
    if (handle) {
      reelRefs.current.set(key, handle);
      if (handle.element) {
        handle.element.dataset.reelKey = key;
        observerRef.current?.observe(handle.element);
      }
      return;
    }

    const existing = reelRefs.current.get(key);
    if (existing?.element) observerRef.current?.unobserve(existing.element);
    reelRefs.current.delete(key);
  }, []);

  return { reels, registerReel, acquireWakeLock, releaseWakeLock };
}
