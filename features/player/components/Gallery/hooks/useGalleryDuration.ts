"use client";

import { useCallback } from "react";
import { formatDurationCompact } from "@/features/player/utils/formatTime";
import { videoUrl } from "@/features/player/utils/encodeVideoPath";

const MAX_CONCURRENT_PROBES = 4;

const cache = new Map<string, string>();
const pending = new Map<string, Set<(label: string) => void>>();
const queue: string[] = [];
let activeProbes = 0;

function runNext() {
  if (activeProbes >= MAX_CONCURRENT_PROBES) return;
  const relPath = queue.shift();
  if (!relPath) return;
  activeProbes++;

  const probe = document.createElement("video");
  probe.preload = "metadata";
  probe.muted = true;
  probe.playsInline = true;

  const finalize = (label: string) => {
    cache.set(relPath, label);
    const callbacks = pending.get(relPath);
    pending.delete(relPath);
    callbacks?.forEach((cb) => cb(label));
    probe.removeAttribute("src");
    probe.load();
    probe.remove();
    activeProbes--;
    runNext();
  };

  probe.addEventListener("loadedmetadata", () => finalize(formatDurationCompact(probe.duration)), { once: true });
  probe.addEventListener("error", () => finalize("--:--"), { once: true });

  probe.src = videoUrl(relPath);
  probe.load();
}

export function useGalleryDuration() {
  const getDuration = useCallback((relPath: string, onResult: (label: string) => void): void => {
    const cached = cache.get(relPath);
    if (cached) {
      onResult(cached);
      return;
    }

    const existing = pending.get(relPath);
    if (existing) {
      existing.add(onResult);
      return;
    }

    pending.set(relPath, new Set([onResult]));
    queue.push(relPath);
    runNext();
  }, []);

  return { getDuration };
}
