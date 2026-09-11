"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { ReelHandle } from "../../Reel/components/reel";
import { BUFFER_WINDOW } from "@/lib/constants/feed";
import { useWakeLock } from "../../../hooks/useWakeLock";
import type { LoopedSlide } from "../utils/buildLoopedSlides";

interface UseLoopedReelScrollArgs {
  isOpen: boolean;
  slides: LoopedSlide[];
  total: number;
  index: number;
  onGoTo: (index: number) => void;
}

export function useLoopedReelScroll({ isOpen, slides, total, index, onGoTo }: UseLoopedReelScrollArgs) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reelRefs = useRef<Map<string, ReelHandle>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isJumpingRef = useRef(false);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressExternalJumpRef = useRef(false);
  const activeIndexRef = useRef(-1);
  const { acquire: acquireWakeLock, release: releaseWakeLock } = useWakeLock();

  const [activeIndex, setActiveIndex] = useState(index);

  const setActive = useCallback((newIdx: number) => {
    activeIndexRef.current = newIdx;
    setActiveIndex(newIdx);
  }, []);

  const slideIndexForReal = useCallback((realIdx: number) => (total > 1 ? realIdx + 1 : 0), [total]);

  const jumpToSlide = useCallback((slideIdx: number) => {
    const container = containerRef.current;
    if (!container) return;
    isJumpingRef.current = true;

    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }

    container.scrollTo({ top: slideIdx * container.clientHeight, behavior: "auto" });

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
      container.scrollTo({ top: slideIndexForReal(current) * container.clientHeight, behavior: "auto" });
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
      fallbackRef.current = setTimeout(() => { isJumpingRef.current = false; }, 500);
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
    const frame = requestAnimationFrame(() => jumpToSlide(slideIndexForReal(index)));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, index, total]);

  useEffect(() => {
    if (!isOpen) return;

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
                const realTargetIdx = slide.key === "clone-last" ? total - 1 : 0;
                const targetSlideIdx = slideIndexForReal(realTargetIdx);
                jumpToSlide(targetSlideIdx);
                suppressExternalJumpRef.current = true;
                setActive(realTargetIdx);
                onGoTo(realTargetIdx);
                optimizeBuffers(targetSlideIdx);
              } else {
                isJumpingRef.current = false;
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

            reelRefs.current.forEach((h) => h.video?.classList.remove("is-active"));
            handle.video?.classList.add("is-active");
            handle.tryPlay();
            acquireWakeLock();
          } else {
            handle.pause();
            handle.video?.classList.remove("is-active");
          }
        }
      },
      { root: containerRef.current, threshold: [0, 0.6, 1] },
    );

    reelRefs.current.forEach((handle) => {
      if (handle.element) observerRef.current?.observe(handle.element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isOpen, slides, acquireWakeLock, optimizeBuffers, onGoTo, total, slideIndexForReal, jumpToSlide, setActive]);

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

  return { containerRef, activeIndex, registerReel, acquireWakeLock, releaseWakeLock };
}
