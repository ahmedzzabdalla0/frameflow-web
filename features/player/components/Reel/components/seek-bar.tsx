"use client";

import { useCallback, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { formatTime } from "@/features/player/utils/formatTime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
  isSeeking: boolean;
  onTogglePlay: (e: React.MouseEvent) => void;
  isLoading: boolean;
}

export default function SeekBar({
  currentTime,
  duration,
  onSeek,
  isPlaying,
  isSeeking,
  onTogglePlay,
  isLoading,
}: SeekBarProps) {
  const [dragPct, setDragPct] = useState<number | null>(null);
  const draggingRef = useRef(false);

  const progressPct =
    dragPct !== null
      ? dragPct
      : duration > 0
        ? (currentTime / duration) * 100
        : 0;

  const clamp = (pct: number) => Math.max(0, Math.min(100, pct));

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    draggingRef.current = true;
    setDragPct(clamp(parseFloat(e.target.value)));
  }, []);

  const commitSeek = useCallback(
    (pct: number) => {
      const clamped = clamp(pct);
      if (duration > 0) {
        onSeek((clamped / 100) * duration);
      }
      draggingRef.current = false;
      setDragPct(null);
    },
    [duration, onSeek],
  );

  const handlePointerUp = useCallback(
    (
      e:
        | React.MouseEvent<HTMLInputElement>
        | React.TouchEvent<HTMLInputElement>,
    ) => {
      commitSeek(parseFloat((e.currentTarget as HTMLInputElement).value));
    },
    [commitSeek],
  );

  return (
    <div className="mx-3 mb-3 flex w-[calc(100%-1.5rem)] items-center gap-3 p-2">
      <Button
        variant="icon"
        onClick={onTogglePlay}
        loading={isLoading || isSeeking}
        title={
          isLoading || isSeeking ? "Loading..." : isPlaying ? "Pause" : "Play"
        }
        aria-label={
          isLoading || isSeeking ? "Loading" : isPlaying ? "Pause" : "Play"
        }
        aria-busy={isLoading || isSeeking}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </Button>

      <div className="relative flex h-6 flex-1 items-center">
        <div className="pointer-events-none absolute inset-x-0 h-1 rounded-full bg-white/20" />
        <div
          className="pointer-events-none absolute left-0 h-1 rounded-full gradient-brand"
          style={{ width: `${progressPct}%` }}
        />
        <div
          className="pointer-events-none absolute left-0 size-3.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(168,85,247,0.35)]"
          style={{ left: `${progressPct + 0.2}%` }}
        />
        <Input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progressPct}
          onChange={handleInput}
          onMouseUp={handlePointerUp}
          onTouchEnd={handlePointerUp}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label="Seek"
        />
      </div>
      <span className="min-w-fit text-right text-xs font-medium text-foreground/80 tabular-nums">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}
