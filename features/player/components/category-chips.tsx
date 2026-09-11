"use client";

import { useCallback, useRef, useState, useTransition } from "react";

import { DISLIKES_CATEGORY } from "@/lib/constants/categories";

import type { CategoryMap } from "@/types/api";
import type { FilterState } from "@/types/player";

import MiniSpinner from "./Reel/components/mini-spinner";

interface CategoryChipsProps {
  categoryMap: CategoryMap;
  filter: FilterState;
  onCycleChip: (key: string) => void;
  onSoloChip: (key: string) => void;
  onClearAll: () => void;
  onTogglePureOnly: () => void;
  onToggleIntersectionOnly: () => void;
}

function chipState(
  key: string,
  filter: FilterState,
): "off" | "include" | "exclude" {
  if (filter.includedCats.has(key)) return "include";
  if (filter.excludedCats.has(key)) return "exclude";
  return "off";
}

function catLabel(key: string): string {
  if (key === "__root__") return "🏠 Home";
  if (key === "__uncategorized__") return "Uncategorized";
  if (key === DISLIKES_CATEGORY) return "Dislikes";
  return key;
}

const ALL_KEY = "__all__";
const PURE_KEY = "__pure__";
const INTERSECTION_KEY = "__intersection__";

export default function CategoryChips({
  categoryMap,
  filter,
  onCycleChip,
  onSoloChip,
  onClearAll,
  onTogglePureOnly,
  onToggleIntersectionOnly,
}: CategoryChipsProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const runWithLoading = useCallback(
    (key: string, action: () => void) => {
      setPendingKey(key);
      startTransition(() => {
        action();
      });
    },
    [startTransition],
  );

  const isLoading = useCallback(
    (key: string) => isPending && pendingKey === key,
    [isPending, pendingKey],
  );

  const allKeys = Object.keys(categoryMap);
  const totalCount = Object.values(categoryMap).reduce(
    (sum, paths) => sum + paths.length,
    0,
  );
  const isAll = !filter.includedCats.size && !filter.excludedCats.size;
  const showRefineRows = filter.includedCats.size > 1;

  return (
    <div className="flex flex-col gap-0">
      <p className="text-subtle mb-3 text-[10px] tracking-[0.08em] uppercase">
        Tap: off → include → exclude · hold to solo
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          className={`inline-flex items-center gap-1 rounded-[20px] border-[1.5px] px-3 py-1.5 text-[13px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
            isAll
              ? "border-positive-strong bg-positive-strong-muted text-positive-strong-foreground"
              : "bg-surface-hover text-inactive border-transparent"
          }`}
          onClick={() => runWithLoading(ALL_KEY, onClearAll)}
          disabled={isLoading(ALL_KEY)}
        >
          {isLoading(ALL_KEY) ? (
            <MiniSpinner />
          ) : (
            isAll && <span className="text-xs leading-none font-black">✓</span>
          )}
          All <span className="text-[10px] opacity-60">{totalCount}</span>
        </button>

        {allKeys.map((key) => {
          const state = chipState(key, filter);
          const count = categoryMap[key]?.length ?? 0;

          return (
            <HoldableChip
              key={key}
              state={state}
              label={catLabel(key)}
              count={count}
              isLoading={isLoading(key)}
              onTap={() => runWithLoading(key, () => onCycleChip(key))}
              onHold={() => runWithLoading(key, () => onSoloChip(key))}
            />
          );
        })}
      </div>

      {showRefineRows && (
        <>
          <button
            className="border-border bg-surface-card mt-3 flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => runWithLoading(PURE_KEY, onTogglePureOnly)}
            disabled={isLoading(PURE_KEY)}
          >
            <div
              className={`relative h-5.5 w-9 shrink-0 rounded-[11px] transition-colors duration-200 ${
                filter.pureOnly ? "bg-positive" : "bg-border-strong"
              }`}
            >
              <span
                className={`absolute top-0.75 size-4 rounded-full bg-white transition-[left] duration-200 ${
                  filter.pureOnly ? "left-4.25" : "left-0.75"
                }`}
              />
            </div>
            <span className="leading-1.4 text-muted-soft flex flex-1 items-center gap-1.5 text-left text-xs">
              <strong className="text-foreground-strong">Pure only</strong> —
              keep selected categories only
              {isLoading(PURE_KEY) && <MiniSpinner className="ml-1" />}
            </span>
          </button>

          <button
            className="border-border bg-surface-card mt-2 flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() =>
              runWithLoading(INTERSECTION_KEY, onToggleIntersectionOnly)
            }
            disabled={isLoading(INTERSECTION_KEY)}
          >
            <div
              className={`relative h-5.5 w-9 shrink-0 rounded-[11px] transition-colors duration-200 ${
                filter.intersectionOnly ? "bg-positive" : "bg-border-strong"
              }`}
            >
              <span
                className={`absolute top-0.75 size-4 rounded-full bg-white transition-[left] duration-200 ${
                  filter.intersectionOnly ? "left-4.25" : "left-0.75"
                }`}
              />
            </div>
            <span className="leading-1.4 text-muted-soft flex flex-1 items-center gap-1.5 text-left text-xs">
              <strong className="text-foreground-strong">
                Intersection only
              </strong>{" "}
              — videos common to all included categories
              {isLoading(INTERSECTION_KEY) && <MiniSpinner className="ml-1" />}
            </span>
          </button>
        </>
      )}

      {allKeys.length > 1 && (
        <p className="leading-1.4 text-subtle-deep mt-3 text-[11px]">
          Hold to select one category alone · Tap to cycle ＋/−/off
        </p>
      )}
    </div>
  );
}

interface HoldableChipProps {
  state: "off" | "include" | "exclude";
  label: string;
  count: number;
  isLoading: boolean;
  onTap: () => void;
  onHold: () => void;
}

function HoldableChip({
  state,
  label,
  count,
  isLoading,
  onTap,
  onHold,
}: HoldableChipProps) {
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didHoldRef = useRef(false);

  const startHold = useCallback(() => {
    if (isLoading) return;
    didHoldRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      didHoldRef.current = true;
      if (navigator.vibrate) navigator.vibrate(30);
      onHold();
    }, 500);
  }, [isLoading, onHold]);

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (isLoading) return;
    if (!didHoldRef.current) onTap();
    didHoldRef.current = false;
  }, [isLoading, onTap]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isLoading) return;
      onHold();
    },
    [isLoading, onHold],
  );

  const chipClass =
    state === "include"
      ? "border-positive bg-positive-muted text-positive-foreground"
      : state === "exclude"
        ? "border-negative bg-negative-muted text-negative-foreground"
        : "border-transparent bg-surface-hover text-inactive";

  const icon =
    state === "include" ? (
      <span className="text-xs leading-none font-black">＋</span>
    ) : state === "exclude" ? (
      <span className="text-xs leading-none font-black">−</span>
    ) : null;

  return (
    <button
      className={`inline-flex items-center gap-1 rounded-[20px] border-[1.5px] px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 select-none [-webkit-tap-highlight-color:transparent] disabled:cursor-not-allowed disabled:opacity-60 ${chipClass}`}
      onClick={handleClick}
      onTouchStart={startHold}
      onTouchEnd={cancelHold}
      onTouchMove={cancelHold}
      onContextMenu={handleContextMenu}
      disabled={isLoading}
    >
      {isLoading ? <MiniSpinner /> : icon}
      {label}
      <span className="text-[10px] opacity-60">{count}</span>
    </button>
  );
}
