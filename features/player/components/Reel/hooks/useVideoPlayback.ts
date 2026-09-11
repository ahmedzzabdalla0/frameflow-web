import { useCallback, useEffect, useRef, useState } from "react";

export function useVideoPlayback(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const pauseLockRef = useRef(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const handleSeek = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video) return;

      const wasPlaying = !video.paused;
      video.pause();
      video.currentTime = time;
      setCurrentTime(time);
      setIsPlaying(false);
      setIsSeeking(true);

      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        if (!wasPlaying) {
          setIsSeeking(false);
          return;
        }
        const onCanPlay = () => {
          video.removeEventListener("canplay", onCanPlay);
          setIsSeeking(false);
          video.play().catch(() => undefined);
        };
        if (video.readyState >= 3) {
          setIsSeeking(false);
          video.play().catch(() => undefined);
        } else {
          video.addEventListener("canplay", onCanPlay);
        }
      };
      video.addEventListener("seeked", onSeeked);
    },
    [videoRef],
  );

  const tryPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState === 0 && video.src) video.load();

    video.muted = false;
    video
      .play()
      .then(() => setNeedsInteraction(false))
      .catch((e: Error) => {
        if (e?.name !== "AbortError") {
          video.classList.remove("is-active");
        }
        setNeedsInteraction(e?.name !== "AbortError");
      });
  }, [videoRef]);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, [videoRef]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      tryPlay();
    } else {
      pause();
    }
  }, [videoRef, tryPlay, pause]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, [videoRef]);

  const tryPlayRef = useRef(tryPlay);
  useEffect(() => {
    tryPlayRef.current = tryPlay;
  }, [tryPlay]);

  const handleVideoClick = useCallback(
    (event: React.MouseEvent<HTMLVideoElement>) => {
      event.stopPropagation();
      const video = videoRef.current;
      if (!video) return;

      if (video.paused) {
        tryPlayRef.current();
        return;
      }

      if (pauseLockRef.current) {
        pauseLockRef.current = false;
        return;
      }

      video.pause();
    },
    [videoRef],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(video.readyState < 3);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (!video.paused) setIsLoading(video.readyState < 3);
    };

    const handleVolumeChange = () => setIsMuted(video.muted);
    const handleLoadedMetadata = () => setDuration(video.duration || 0);

    const handleLoadStart = () => setIsLoading(true);
    const handleLoadEnd = () => setIsLoading(false);

    const handleReadyStateChange = () => {
      setIsLoading(video.paused ? false : video.readyState < 3);
    };

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("waiting", handleReadyStateChange);
    video.addEventListener("canplay", handleReadyStateChange);
    video.addEventListener("error", handleLoadEnd);
    video.addEventListener("abort", handleLoadEnd);

    return () => {
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);

      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("waiting", handleReadyStateChange);
      video.removeEventListener("canplay", handleReadyStateChange);
      video.removeEventListener("error", handleLoadEnd);
      video.removeEventListener("abort", handleLoadEnd);
    };
  }, [videoRef]);

  return {
    tryPlay,
    pause,
    togglePlay,
    toggleMute,
    currentTime,
    duration,
    handleSeek,
    handleVideoClick,
    pauseLockRef,
    isMuted,
    isPlaying,
    isLoading,
    isSeeking,
    needsInteraction,
  };
}
