"use client";

import { useRef, useCallback, useEffect } from "react";

export function useWakeLock() {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  const acquire = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    if (lockRef.current) return;
    try {
      lockRef.current = await navigator.wakeLock.request("screen");
      lockRef.current.addEventListener("release", () => {
        lockRef.current = null;
      });
    } catch {
    }
  }, []);

  const release = useCallback(() => {
    if (lockRef.current) {
      lockRef.current.release();
      lockRef.current = null;
    }
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && lockRef.current === null) {
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return { acquire, release };
}
