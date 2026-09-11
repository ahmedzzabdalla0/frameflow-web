"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { getCategoryMap } from "@/lib/api/categories";
import { getSettings, saveSettings } from "@/lib/api/settings";
import { clearThumbs } from "@/lib/api/thumbs";
import type { CategoryMap } from "@/types/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalFooter } from "@/components/ui/modal";
import { toast } from "sonner";
import { DISLIKES_CATEGORY } from "@/lib/constants/categories";

export default function SettingsSection() {
  const [catMap, setCatMap] = useState<CategoryMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const [includedCats, setIncludedCats] = useState<Set<string>>(new Set());
  const [excludedCats, setExcludedCats] = useState<Set<string>>(new Set());
  const [pureOnly, setPureOnly] = useState(false);
  const [intersectionOnly, setIntersectionOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, s] = await Promise.all([getCategoryMap(), getSettings()]);
      setCatMap(cats);
      setIncludedCats(new Set(s.default_included_categories));
      setExcludedCats(new Set(s.default_excluded_categories));
      setPureOnly(s.default_pure_only);
      setIntersectionOnly(s.default_intersection_only);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  const cycleChip = useCallback(
    (key: string) => {
      const isInc = includedCats.has(key);
      const isExc = excludedCats.has(key);
      const inc = new Set(includedCats);
      const exc = new Set(excludedCats);
      inc.delete(key);
      exc.delete(key);
      if (!isInc && !isExc) inc.add(key);
      else if (isInc) exc.add(key);
      setIncludedCats(inc);
      setExcludedCats(exc);
      if (inc.size < 2) {
        setPureOnly(false);
        setIntersectionOnly(false);
      }
    },
    [includedCats, excludedCats],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveSettings({
        default_included_categories: [...includedCats],
        default_excluded_categories: [...excludedCats],
        default_pure_only: pureOnly,
        default_intersection_only: intersectionOnly,
      });
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }, [includedCats, excludedCats, pureOnly, intersectionOnly]);

  const handleClearThumbs = useCallback(async () => {
    setClearing(true);
    try {
      const result = await clearThumbs();
      setClearDialogOpen(false);
      toast.success(`Cleared ${result.deleted} thumbnail(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setClearing(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  const allCatNames = catMap
    ? Object.keys(catMap).filter((name) => name !== "__uncategorized__" && name !== DISLIKES_CATEGORY)
    : [];
  const showRefineRows = includedCats.size > 1;

  return (
    <div className="max-w-120">
      <h1 className="mb-5 text-2xl font-bold text-foreground">Settings</h1>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
          Default Filter State
        </label>
        <p className="mb-2 text-xs text-subtle">
          The filter state the player opens with on first visit. Leave all off to show everything.
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {allCatNames.map((name) => {
            const isInc = includedCats.has(name);
            const isExc = excludedCats.has(name);
            const chipClass = isInc
              ? "border-positive bg-positive-muted text-positive-foreground"
              : isExc
                ? "border-negative bg-negative-muted text-negative-foreground"
                : "border-transparent bg-surface-hover text-muted";
            return (
              <button
                key={name}
                className={`inline-flex items-center gap-1 rounded-full border-[1.5px] px-3 py-1.75 text-[13px] font-medium transition-colors duration-200 ${chipClass}`}
                onClick={() => cycleChip(name)}
              >
                {isInc && <span className="text-xs font-black">＋</span>}
                {isExc && <span className="text-xs font-black">−</span>}
                {name === "__root__" ? "🏠 Home" : name}
              </button>
            );
          })}
        </div>

        {showRefineRows && (
          <>
            <ToggleRow
              label="Pure only"
              description="default keeps selected only"
              checked={pureOnly}
              onChange={() => setPureOnly((v) => !v)}
            />
            <ToggleRow
              label="Intersection only"
              description="default shows shared only"
              checked={intersectionOnly}
              onChange={() => setIntersectionOnly((v) => !v)}
              className="mt-2"
            />
          </>
        )}
      </div>

      <Button variant="primary" onClick={() => void handleSave()} loading={saving} className="mb-8">
        {saving ? "Saving…" : "Save"}
      </Button>

      <div className="border-t border-surface-hover pt-6">
        <label className="mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
          Thumbnail Cache
        </label>
        <p className="mb-3 text-xs text-subtle">Delete all cached thumbnails — regenerated on next view.</p>
        <Button variant="danger" onClick={() => setClearDialogOpen(true)} disabled={clearing}>
          {clearing ? "Clearing…" : "Clear Thumbnail Cache"}
        </Button>
      </div>

      {clearDialogOpen && (
        <Modal
          onClose={() => !clearing && setClearDialogOpen(false)}
          maxWidth="min(420px,94vw)"
          className="border-danger-border bg-danger-surface"
        >
          <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary-muted text-primary">
            <Trash2 size={16} aria-hidden="true" />
          </div>
          <ModalHeader>Clear thumbnail cache?</ModalHeader>
          <p className="text-sm leading-6 text-muted-foreground">
            All cached thumbnails will be removed and regenerated when needed.
          </p>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setClearDialogOpen(false)} disabled={clearing}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void handleClearThumbs()} loading={clearing}>
              {clearing ? "Clearing…" : "Clear cache"}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}

function ToggleRow({ label, description, checked, onChange, className = "" }: ToggleRowProps) {
  return (
    <button
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface-raised p-3 transition-colors duration-200 hover:border-border-strong ${className}`}
      onClick={onChange}
    >
      <div
        className={`relative h-5.5 w-9 shrink-0 rounded-[11px] transition-colors duration-200 ${checked ? "bg-positive" : "bg-border-strong"}`}
      >
        <span
          className={`absolute top-0.75 size-4 rounded-full bg-white transition-[left] duration-200 ${checked ? "left-4.25" : "left-0.75"}`}
        />
      </div>
      <span className="flex-1 text-left text-xs text-muted-foreground">
        <strong className="text-foreground/90">{label}</strong> — {description}
      </span>
    </button>
  );
}
