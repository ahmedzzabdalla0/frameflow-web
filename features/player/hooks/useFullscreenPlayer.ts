"use client";

import { useState, useRef, useCallback } from "react";
import { videoUrl } from "../utils/encodeVideoPath";

interface FullscreenPlayerState {
  isOpen: boolean;
  currentPath: string;
  playlist: string[];
  index: number;
}

const CLOSED: FullscreenPlayerState = {
  isOpen: false,
  currentPath: "",
  playlist: [],
  index: 0,
};

export function useFullscreenPlayer() {
  const [state, setState] = useState<FullscreenPlayerState>(CLOSED);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isAudioUnlockedRef = useRef(false);

  const open = useCallback((path: string, playlist: string[]) => {
    let idx = playlist.indexOf(path);
    if (idx === -1) {
      playlist = [path, ...playlist];
      idx = 0;
    }
    setState({ isOpen: true, currentPath: path, playlist, index: idx });
  }, []);

  const close = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.src = "";
    }
    setState(CLOSED);
  }, []);

  const goTo = useCallback((index: number) => {
    setState((prev) => {
      const safeIdx =
        ((index % prev.playlist.length) + prev.playlist.length) %
        prev.playlist.length;
      return { ...prev, index: safeIdx, currentPath: prev.playlist[safeIdx] };
    });
  }, []);

  const next = useCallback(() => {
    setState((prev) => {
      const safeIdx = (prev.index + 1) % prev.playlist.length;
      return { ...prev, index: safeIdx, currentPath: prev.playlist[safeIdx] };
    });
  }, []);

  const prev = useCallback(() => {
    setState((prev) => {
      const safeIdx =
        (prev.index - 1 + prev.playlist.length) % prev.playlist.length;
      return { ...prev, index: safeIdx, currentPath: prev.playlist[safeIdx] };
    });
  }, []);

  const currentVideoUrl = state.currentPath ? videoUrl(state.currentPath) : "";

  return {
    state,
    videoRef,
    isAudioUnlockedRef,
    open,
    close,
    goTo,
    next,
    prev,
    currentVideoUrl,
  };
}
