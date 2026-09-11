"use client";

import { useState, useCallback } from "react";
import type { FilterState, PlaybackMode } from "@/types/player";
import type { CategoryMap, Settings } from "@/types/api";
import { LS_INCLUDES, LS_EXCLUDES, LS_PURE_ONLY, LS_INTERSECTION_ONLY, LS_MODE } from "@/lib/constants/storage";

function loadFromStorage(categoryMap: CategoryMap, serverSettings: Settings): FilterState {
  if (typeof window === "undefined") {
    return {
      includedCats: new Set((serverSettings.default_included_categories ?? []).filter((k) => k in categoryMap)),
      excludedCats: new Set((serverSettings.default_excluded_categories ?? []).filter((k) => k in categoryMap)),
      pureOnly: !!serverSettings.default_pure_only,
      intersectionOnly: !!serverSettings.default_intersection_only,
    };
  }

  const hasSavedFilter = localStorage.getItem(LS_INCLUDES) !== null || localStorage.getItem(LS_EXCLUDES) !== null;
  if (!hasSavedFilter) {
    return {
      includedCats: new Set((serverSettings.default_included_categories ?? []).filter((k) => k in categoryMap)),
      excludedCats: new Set((serverSettings.default_excluded_categories ?? []).filter((k) => k in categoryMap)),
      pureOnly: !!serverSettings.default_pure_only,
      intersectionOnly: !!serverSettings.default_intersection_only,
    };
  }

  try {
    const inc = JSON.parse(localStorage.getItem(LS_INCLUDES) ?? "[]") as unknown;
    const exc = JSON.parse(localStorage.getItem(LS_EXCLUDES) ?? "[]") as unknown;
    const pureOnly = localStorage.getItem(LS_PURE_ONLY) === "1";
    const intersectionOnly = localStorage.getItem(LS_INTERSECTION_ONLY) === "1";

    return {
      includedCats: new Set(Array.isArray(inc) ? (inc as string[]).filter((k) => k in categoryMap) : []),
      excludedCats: new Set(Array.isArray(exc) ? (exc as string[]).filter((k) => k in categoryMap) : []),
      pureOnly,
      intersectionOnly,
    };
  } catch {
    return {
      includedCats: new Set(),
      excludedCats: new Set(),
      pureOnly: false,
      intersectionOnly: false,
    };
  }
}

function persistToStorage(filter: FilterState): void {
  localStorage.setItem(LS_INCLUDES, JSON.stringify([...filter.includedCats]));
  localStorage.setItem(LS_EXCLUDES, JSON.stringify([...filter.excludedCats]));
  localStorage.setItem(LS_PURE_ONLY, filter.pureOnly ? "1" : "0");
  localStorage.setItem(LS_INTERSECTION_ONLY, filter.intersectionOnly ? "1" : "0");
}

export function useFilterState(categoryMap: CategoryMap, serverSettings: Settings, ready: boolean) {
  const [filter, setFilterRaw] = useState<FilterState>({
    includedCats: new Set(),
    excludedCats: new Set(),
    pureOnly: false,
    intersectionOnly: false,
  });

  const [initialized, setInitialized] = useState(false);

  if (ready && !initialized) {
    setInitialized(true);
    setFilterRaw(loadFromStorage(categoryMap, serverSettings));
  }

  const setFilter = useCallback((next: FilterState) => {
    persistToStorage(next);
    setFilterRaw(next);
  }, []);

  const cycleChip = useCallback(
    (key: string) => {
      setFilter(
        ((): FilterState => {
          const included = new Set(filter.includedCats);
          const excluded = new Set(filter.excludedCats);
          included.delete(key);
          excluded.delete(key);
          if (!filter.includedCats.has(key) && !filter.excludedCats.has(key)) {
            included.add(key);
          } else if (filter.includedCats.has(key)) {
            excluded.add(key);
          }
          return sanitizeFilter({
            ...filter,
            includedCats: included,
            excludedCats: excluded,
          });
        })(),
      );
    },
    [filter, setFilter],
  );

  const soloChip = useCallback(
    (key: string) => {
      setFilter(
        sanitizeFilter({
          ...filter,
          includedCats: new Set([key]),
          excludedCats: new Set(),
        }),
      );
    },
    [filter, setFilter],
  );

  const toggleExcludedCategory = useCallback(
    (key: string) => {
      const excluded = new Set(filter.excludedCats);
      const included = new Set(filter.includedCats);

      included.delete(key);
      if (excluded.has(key)) {
        excluded.delete(key);
      } else {
        excluded.add(key);
      }

      setFilter(
        sanitizeFilter({
          ...filter,
          includedCats: included,
          excludedCats: excluded,
        }),
      );
    },
    [filter, setFilter],
  );

  const clearAll = useCallback(() => {
    setFilter({
      includedCats: new Set(),
      excludedCats: new Set(),
      pureOnly: false,
      intersectionOnly: false,
    });
  }, [setFilter]);

  const setPureOnly = useCallback(
    (value: boolean) => {
      setFilter(sanitizeFilter({ ...filter, pureOnly: value }));
    },
    [filter, setFilter],
  );

  const setIntersectionOnly = useCallback(
    (value: boolean) => {
      setFilter(sanitizeFilter({ ...filter, intersectionOnly: value }));
    },
    [filter, setFilter],
  );

  const applyServerDefaults = useCallback(
    (settings: Settings) => {
      const next: FilterState = {
        includedCats: new Set((settings.default_included_categories ?? []).filter((k) => k in categoryMap)),
        excludedCats: new Set((settings.default_excluded_categories ?? []).filter((k) => k in categoryMap)),
        pureOnly: !!settings.default_pure_only,
        intersectionOnly: !!settings.default_intersection_only,
      };
      setFilter(next);
    },
    [categoryMap, setFilter],
  );

  return {
    filter,
    cycleChip,
    soloChip,
    toggleExcludedCategory,
    clearAll,
    setPureOnly,
    setIntersectionOnly,
    applyServerDefaults,
    isReady: initialized,
  };
}

function sanitizeFilter(filter: FilterState): FilterState {
  if (filter.includedCats.size < 2) {
    return { ...filter, pureOnly: false, intersectionOnly: false };
  }
  return filter;
}

export function loadMode(): PlaybackMode {
  if (typeof window === "undefined") return "tiktok";
  const saved = localStorage.getItem(LS_MODE);
  return saved === "gallery" ? "gallery" : "tiktok";
}

export function saveMode(mode: PlaybackMode): void {
  localStorage.setItem(LS_MODE, mode);
}
