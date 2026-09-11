"use client";

import { useRef, useCallback } from "react";
import { shuffled } from "../utils/shuffleArray";

interface UseVideoFeedOptions {
  getActiveVideos: () => string[];
}

export function useVideoFeed({ getActiveVideos }: UseVideoFeedOptions) {
  const playlistRef = useRef<string[]>([]);
  const indexRef = useRef(0);

  const resetPlaylist = useCallback(() => {
    playlistRef.current = shuffled(getActiveVideos());
    indexRef.current = 0;
  }, [getActiveVideos]);

  const nextFromPlaylist = useCallback((): string | null => {
    if (!playlistRef.current.length) return null;
    if (indexRef.current >= playlistRef.current.length) {
      playlistRef.current = shuffled(getActiveVideos());
      indexRef.current = 0;
    }
    return playlistRef.current[indexRef.current++];
  }, [getActiveVideos]);

  return { resetPlaylist, nextFromPlaylist, playlistRef };
}
