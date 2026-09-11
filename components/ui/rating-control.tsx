"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Star } from "lucide-react";
import { rateVideo } from "@/lib/api/videos";
import { Button } from "./button";

interface RatingControlProps {
  relPath: string;
  initialRating: number | null;
  onSaved?: (rating: number) => void;
  compact?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function RatingControl({ relPath, initialRating, onSaved, compact = false }: RatingControlProps) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [sliderValue, setSliderValue] = useState(initialRating ?? 0);
  const [draft, setDraft] = useState((initialRating ?? 0).toFixed(1));
  const [prevInitialRating, setPrevInitialRating] = useState(initialRating);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number; placement: "top" | "bottom" } | null>(
    null,
  );
  const [prevRelPath, setPrevRelPath] = useState(relPath);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (relPath !== prevRelPath) {
    setPrevRelPath(relPath);
    if (open) setOpen(false);
  }

  if (initialRating !== prevInitialRating) {
    setPrevInitialRating(initialRating);
    const next = initialRating ?? 0;
    setRating(next);
    setSliderValue(next);
    setDraft(next.toFixed(1));
  }

  useEffect(() => {
    if (open) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      return;
    }
    closeTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      setPopupPosition(null);
    }, 0);
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const updatePopupPosition = () => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const popupWidth = popupRef.current?.offsetWidth ?? 232;
      const popupHeight = popupRef.current?.offsetHeight ?? 176;
      const gap = 10;
      const edge = 8;
      const left = clamp(rect.left + rect.width / 2 - popupWidth / 2, edge, window.innerWidth - popupWidth - edge);
      const fitsAbove = rect.top >= popupHeight + gap + edge;
      const preferredTop = fitsAbove ? rect.top - popupHeight - gap : rect.bottom + gap;
      const top = clamp(preferredTop, edge, window.innerHeight - popupHeight - edge);
      setPopupPosition({ top, left, placement: fitsAbove ? "top" : "bottom" });
    };

    updatePopupPosition();
    const measureFrame = requestAnimationFrame(() => {
      updatePopupPosition();
      requestAnimationFrame(() => setVisible(true));
    });
    window.addEventListener("resize", updatePopupPosition);
    return () => {
      cancelAnimationFrame(measureFrame);
      window.removeEventListener("resize", updatePopupPosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnScroll = () => setOpen(false);
    window.addEventListener("scroll", closeOnScroll, true);
    return () => window.removeEventListener("scroll", closeOnScroll, true);
  }, [open]);

  const save = async (value: number) => {
    const normalized = Math.round(clamp(value, 0, 5) * 10) / 10;
    setRating(normalized);
    setSliderValue(normalized);
    setDraft(normalized.toFixed(1));
    setSaving(true);
    try {
      await rateVideo(relPath, normalized);
      onSaved?.(normalized);
    } finally {
      setSaving(false);
    }
  };

  const handleSliderChange = (value: string) => {
    const next = Number(value);
    setSliderValue(next);
    setDraft(next.toFixed(1));
  };

  const handleSliderCommit = () => {
    void save(sliderValue);
  };

  const handleDraftCommit = () => {
    const value = Number(draft);
    if (!Number.isFinite(value)) {
      setDraft(rating.toFixed(1));
      return;
    }
    void save(value);
  };

  const sliderPct = clamp(sliderValue, 0, 5) * 20;

  const popupIsVisible = open && visible && popupPosition !== null;

  return (
    <div
      ref={rootRef}
      className="relative w-min touch-none"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onTouchMove={(event) => {
        event.stopPropagation();
        event.preventDefault();
      }}
      onTouchEnd={(event) => event.stopPropagation()}
      role="group"
      aria-label={`Rating ${rating.toFixed(1)} out of 5`}
    >
      <Button
        ref={buttonRef}
        variant="icon"
        size={compact ? "sm" : "md"}
        tone="accent"
        active={rating > 0}
        onClick={() => setOpen((current) => !current)}
        disabled={saving}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Set rating, currently ${rating.toFixed(1)} out of 5`}
        title={`Rating: ${rating.toFixed(1)} / 5`}
      >
        <Star
          size={16}
          stroke="white"
          fill={rating > 0 ? "white" : "none"}
        />
      </Button>

      {rating > 0 && (
        <span className="pointer-events-none absolute -top-1.5 -right-1.5 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] leading-4 font-semibold text-white tabular-nums shadow-[0_0_0_1px_var(--color-white)]">
          {rating.toFixed(1)}
        </span>
      )}

      {typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-790"
              style={{ pointerEvents: open ? "auto" : "none" }}
              onPointerDown={(event) => {
                if (!open) return;
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
              }}
              onClick={(event) => open && event.preventDefault()}
              onWheel={(event) => open && event.preventDefault()}
              onTouchMove={(event) => open && event.preventDefault()}
              aria-hidden="true"
            />

            <div
              ref={popupRef}
              style={{
                top: popupPosition?.top ?? 0,
                left: popupPosition?.left ?? 0,
                transformOrigin:
                  (popupPosition?.placement ?? "top") === "top" ? "bottom center" : "top center",
                visibility: popupPosition ? "visible" : "hidden",
              }}
              className={`fixed z-800 flex w-58 flex-col items-center gap-3 rounded-2xl p-4 text-white glass-panel-strong transition-[opacity,transform] duration-150 ease-out ${
                popupIsVisible
                  ? "translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none translate-y-1 scale-95 opacity-0"
              }`}
              role="dialog"
              aria-label="Set rating"
              aria-hidden={!open}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onTouchMove={(event) => event.stopPropagation()}
            >
              <div className="flex items-baseline gap-1 text-accent">
                <Star size={16} fill="currentColor" />
                <span className="text-lg font-semibold text-white tabular-nums">{sliderValue.toFixed(1)}</span>
                <span className="text-xs text-white/70">/ 5</span>
              </div>

              <div className="relative flex h-6 w-full items-center">
                <div className="pointer-events-none absolute inset-x-0 h-1 rounded-full bg-white/20" />
                <div
                  className="pointer-events-none absolute left-0 h-1 rounded-full bg-accent"
                  style={{ width: `${sliderPct}%` }}
                />
                <div
                  className="pointer-events-none absolute left-0 size-3.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(242,184,75,0.35)]"
                  style={{ left: `${sliderPct}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={sliderValue}
                  onChange={(event) => handleSliderChange(event.target.value)}
                  onPointerUp={handleSliderCommit}
                  onTouchEnd={handleSliderCommit}
                  onKeyUp={handleSliderCommit}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                  aria-label="Rating from zero to five"
                />
              </div>

              <div className="flex w-full items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={handleDraftCommit}
                  onKeyDown={(event) => event.key === "Enter" && handleDraftCommit()}
                  disabled={saving}
                  className="w-16 rounded-lg border border-white bg-white/10 px-2 py-1.5 text-center text-sm text-white tabular-nums outline-none focus:border-accent disabled:opacity-50"
                  aria-label="Exact rating"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void save(0)}
                  disabled={saving || rating === 0}
                  className="flex-1 text-xs text-white/70 hover:text-negative"
                >
                  Clear
                </Button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
