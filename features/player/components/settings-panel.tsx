"use client";

import { useState, useCallback } from "react";
import type { CategoryMap, Settings } from "@/types/api";
import { saveSettings } from "@/lib/api/settings";
import { DISLIKES_CATEGORY } from "@/lib/constants/categories";
import { Button } from "@/components/ui/button";

interface SettingsPanelProps {
  isOpen: boolean;
  categoryMap: CategoryMap;
  initialSettings: Settings;
  onClose: () => void;
  onSaved: (settings: Settings) => void;
}

function chipState(key: string, included: Set<string>, excluded: Set<string>): "off" | "include" | "exclude" {
  if (included.has(key)) return "include";
  if (excluded.has(key)) return "exclude";
  return "off";
}

export default function SettingsPanel({ isOpen, categoryMap, initialSettings, onClose, onSaved }: SettingsPanelProps) {
  const [includedCats, setIncludedCats] = useState<Set<string>>(
    () => new Set(initialSettings.default_included_categories),
  );
  const [excludedCats, setExcludedCats] = useState<Set<string>>(
    () => new Set(initialSettings.default_excluded_categories),
  );
  const [pureOnly, setPureOnly] = useState(initialSettings.default_pure_only);
  const [intersectionOnly, setIntersectionOnly] = useState(initialSettings.default_intersection_only);
  const [saving, setSaving] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const cycleChip = useCallback(
    (key: string) => {
      const state = chipState(key, includedCats, excludedCats);
      const inc = new Set(includedCats);
      const exc = new Set(excludedCats);
      inc.delete(key);
      exc.delete(key);
      if (state === "off") inc.add(key);
      else if (state === "include") exc.add(key);
      setIncludedCats(inc);
      setExcludedCats(exc);

      const showRefine = inc.size > 1;
      if (!showRefine) {
        setPureOnly(false);
        setIntersectionOnly(false);
      }
    },
    [includedCats, excludedCats],
  );

  const handleSave = useCallback(async () => {
    const settings: Settings = {
      default_included_categories: [...includedCats],
      default_excluded_categories: [...excludedCats],
      default_pure_only: pureOnly,
      default_intersection_only: intersectionOnly,
    };
    setSaving(true);
    try {
      await saveSettings(settings);
      onSaved(settings);
      onClose();
    } finally {
      setSaving(false);
    }
  }, [includedCats, excludedCats, pureOnly, intersectionOnly, onSaved, onClose]);

  const handleClearCache = useCallback(async () => {
    setClearingCache(true);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      setTimeout(() => location.reload(), 800);
    } finally {
      setClearingCache(false);
    }
  }, []);

  const allKeys = Object.keys(categoryMap);
  const showRefineRows = includedCats.size > 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-start justify-center bg-black/70 p-0 pb-[env(safe-area-inset-bottom)] sm:p-6">
      <div className="flex size-full flex-col bg-surface-panel shadow-2xl sm:h-[min(760px,calc(100dvh-3rem))] sm:max-w-155 sm:rounded-2xl sm:border sm:border-border-panel">
        <div className="flex items-center gap-3 border-b border-border-subtle px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 sm:px-6">
          <button
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent p-1 text-[22px] leading-none text-muted-foreground"
            aria-label="Back"
          >
            ←
          </button>
          <h2 className="flex-1 text-lg font-semibold text-white">Settings</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:px-6">
          <p className="mb-2 text-[11px] tracking-[0.08em] text-muted uppercase">Default Categories</p>

          <div className="mb-3.5 flex flex-wrap gap-2">
            {allKeys.map((key) => {
              const state = chipState(key, includedCats, excludedCats);
              const icon = state === "include" ? "＋" : state === "exclude" ? "−" : null;
              const chipClass =
                state === "include"
                  ? "border-positive bg-positive-muted text-positive-foreground"
                  : state === "exclude"
                    ? "border-negative bg-negative-muted text-negative-foreground"
                    : "border-transparent bg-surface-hover text-inactive";
              const label =
                key === "__root__"
                  ? "🏠 Home"
                  : key === "__uncategorized__"
                    ? "Uncategorized"
                    : key === DISLIKES_CATEGORY
                      ? "Dislikes"
                      : key;
              return (
                <button
                  key={key}
                  className={`inline-flex items-center gap-1 rounded-[20px] border-[1.5px] px-3 py-1.75 text-[13px] font-medium transition-colors duration-150 select-none ${chipClass}`}
                  onClick={() => cycleChip(key)}
                >
                  {icon && <span className="text-xs leading-none font-black">{icon}</span>}
                  {label}
                </button>
              );
            })}
          </div>

          {showRefineRows && (
            <>
              <button
                className="mb-2 flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface-card p-3"
                onClick={() => setPureOnly(!pureOnly)}
              >
                <div
                  className={`relative h-5.5 w-9 shrink-0 rounded-[11px] transition-colors duration-200 ${pureOnly ? "bg-positive" : "bg-border-strong"}`}
                >
                  <span
                    className={`absolute top-0.75 size-4 rounded-full bg-white transition-[left] duration-200 ${pureOnly ? "left-4.25" : "left-0.75"}`}
                  />
                </div>
                <span className="flex-1 text-left text-xs leading-1.4 text-muted-soft">
                  <strong className="text-foreground-strong">Pure only</strong> — default keeps selected categories only
                </span>
              </button>

              <button
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface-card p-3"
                onClick={() => setIntersectionOnly(!intersectionOnly)}
              >
                <div
                  className={`relative h-5.5 w-9 shrink-0 rounded-[11px] transition-colors duration-200 ${intersectionOnly ? "bg-positive" : "bg-border-strong"}`}
                >
                  <span
                    className={`absolute top-0.75 size-4 rounded-full bg-white transition-[left] duration-200 ${intersectionOnly ? "left-4.25" : "left-0.75"}`}
                  />
                </div>
                <span className="flex-1 text-left text-xs leading-1.4 text-muted-soft">
                  <strong className="text-foreground-strong">Intersection only</strong> — default shows shared videos only
                </span>
              </button>
            </>
          )}

          <Button
            variant="primary"
            onClick={() => void handleSave()}
            loading={saving}
            className="mt-6 w-full rounded-xl py-3.5 text-base"
          >
            {saving ? "Saving…" : "Save Defaults"}
          </Button>

          <p className="mt-7 mb-2 text-[11px] tracking-[0.08em] text-muted uppercase">Cache</p>
          <Button
            variant="secondary"
            onClick={() => void handleClearCache()}
            loading={clearingCache}
            className="w-full rounded-xl py-3.5 text-base"
          >
            {clearingCache ? "Clearing…" : "🗑 Clear Browser Cache"}
          </Button>
        </div>
      </div>
    </div>
  );
}
