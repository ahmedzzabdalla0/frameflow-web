"use client";

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { videoUrl } from "@/features/player/utils/encodeVideoPath";
import { formatSeekTime } from "@/features/player/utils/formatTime";
import { setThumbSeek } from "@/lib/api/thumbs";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FramePickerProps {
  relPath: string;
  initialSeek?: string;
  onThumbSet?: (seek: string) => void;
}

export interface FramePickerHandle {
  reset: () => void;
}

function parseTimeInput(value: string): number | null {
  const parts = value.trim().split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return null;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

const FramePicker = forwardRef<FramePickerHandle, FramePickerProps>(function FramePicker(
  { relPath, initialSeek, onThumbSet },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const seekRef = useRef<HTMLInputElement | null>(null);
  const [btnState, setBtnState] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [timeInput, setTimeInput] = useState("00:00:00");

  const reset = useCallback(() => {
    const video = videoRef.current;
    const seek = seekRef.current;
    if (video) {
      video.pause();
      video.src = "";
      video.src = videoUrl(relPath);
      video.load();
    }
    if (seek) seek.value = "0";
    setTimeInput("00:00:00");
    setBtnState("idle");
  }, [relPath]);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    const video = videoRef.current;
    const seek = seekRef.current;
    if (!video || !seek) return;

    video.src = videoUrl(relPath);
    video.load();

    const onMeta = () => {
      seek.max = String(video.duration || 100);
      const parts = (initialSeek ?? "").split(":").map(Number);
      const initialSeconds =
        parts.length === 3
          ? parts[0] * 3600 + parts[1] * 60 + parts[2]
          : parts.length === 2
            ? parts[0] * 60 + parts[1]
            : 0;
      if (initialSeconds > 0 && initialSeconds <= video.duration) {
        video.currentTime = initialSeconds;
        seek.value = String(initialSeconds);
      }
      const currentTime = formatSeekTime(video.currentTime);
      setTimeInput(currentTime);
    };
    const onTimeUpdate = () => {
      if (!video.seeking) {
        seek.value = String(video.currentTime);
        setTimeInput(formatSeekTime(video.currentTime));
      }
    };
    const onInput = () => {
      video.currentTime = parseFloat(seek.value);
      setTimeInput(formatSeekTime(video.currentTime));
      setBtnState("idle");
    };

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("timeupdate", onTimeUpdate);
    seek.addEventListener("input", onInput);

    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("timeupdate", onTimeUpdate);
      seek.removeEventListener("input", onInput);
      video.pause();
      video.src = "";
    };
  }, [relPath, initialSeek]);

  const applyTimeInput = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const parsed = parseTimeInput(timeInput);
    if (parsed === null) {
      setTimeInput(formatSeekTime(video.currentTime));
      return;
    }
    const nextTime = Math.min(Math.max(parsed, 0), video.duration || parsed);
    video.currentTime = nextTime;
    if (seekRef.current) seekRef.current.value = String(nextTime);
    setTimeInput(formatSeekTime(nextTime));
    setBtnState("idle");
  }, [timeInput]);

  const nudgeTime = useCallback((amount: number) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Math.min(Math.max(video.currentTime + amount, 0), video.duration || video.currentTime + amount);
    video.currentTime = nextTime;
    if (seekRef.current) seekRef.current.value = String(nextTime);
    setTimeInput(formatSeekTime(nextTime));
    setBtnState("idle");
  }, []);

  const handleSetFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    const seek = formatSeekTime(video.currentTime);
    setBtnState("saving");
    try {
      const result = await setThumbSeek({ video: relPath, seek });
      setBtnState(result.ok ? "ok" : "error");
      if (result.ok) onThumbSet?.(seek);
    } catch {
      setBtnState("error");
    }
    setTimeout(() => setBtnState("idle"), 2000);
  }, [relPath, onThumbSet]);

  const btnLabel =
    btnState === "saving" ? "Saving…" : btnState === "ok" ? "✓ Saved" : btnState === "error" ? "✗ Error" : "Set Frame";

  return (
    <div className="mt-1 rounded-lg border border-border bg-surface p-3">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="metadata"
        className="block max-h-45 w-full rounded-md bg-black object-contain"
      />
      <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
        <input
          ref={seekRef}
          type="range"
          min="0"
          defaultValue="0"
          step="0.1"
          className="flex-1 accent-primary"
          aria-label="Scrub to frame"
        />
        <input
          type="text"
          value={timeInput}
          onChange={(event) => setTimeInput(event.target.value)}
          onBlur={applyTimeInput}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyTimeInput();
            }
          }}
          className="h-8 w-23 rounded-md border border-border bg-surface-sunken px-2 text-center text-xs text-foreground outline-none focus:border-primary"
          aria-label="Go to time"
          placeholder="HH:MM:SS"
        />
        <button
          onClick={() => nudgeTime(-1)}
          disabled={btnState === "saving"}
          className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-surface-sunken text-muted-foreground transition-colors hover:border-subtle hover:text-foreground disabled:opacity-50"
          aria-label="Move back one second"
          title="Back 1 second"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          onClick={() => nudgeTime(1)}
          disabled={btnState === "saving"}
          className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-surface-sunken text-muted-foreground transition-colors hover:border-subtle hover:text-foreground disabled:opacity-50"
          aria-label="Move forward one second"
          title="Forward 1 second"
        >
          <ChevronRight aria-hidden="true" />
        </button>
        <button
          onClick={handleSetFrame}
          disabled={btnState === "saving"}
          className={`rounded-[7px] px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-colors disabled:opacity-50 ${
            btnState === "ok" ? "bg-success/20 text-success" : "bg-primary hover:bg-primary-hover"
          }`}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  );
});

export default FramePicker;
