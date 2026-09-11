"use client";

import { useCallback, useState } from "react";
import type { CategoryMap } from "@/types/api";
import { bulkUpdateVideoCategories } from "@/lib/api/videos";
import { DISLIKES_CATEGORY } from "@/lib/constants/categories";
import { toast } from "sonner";
import { Modal, ModalHeader, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface BulkCategoryModalProps {
  videoIds: number[];
  categoryMap: CategoryMap;
  onClose: () => void;
  onSaved: () => void;
}

export default function BulkCategoryModal({ videoIds, categoryMap, onClose, onSaved }: BulkCategoryModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const categoryNames = Object.keys(categoryMap).filter((name) => name !== "__uncategorized__");

  const toggleCategory = useCallback((name: string) => {
    setSelectedCategories((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await bulkUpdateVideoCategories(videoIds, [...selectedCategories]);
      toast.success(selectedCategories.size ? "Categories updated" : "Categories cleared");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update categories");
    } finally {
      setSaving(false);
    }
  }, [onClose, onSaved, selectedCategories, videoIds]);

  return (
    <Modal onClose={() => !saving && onClose()} maxWidth="min(480px,94vw)" className="z-700">
      <ModalHeader>Edit Categories</ModalHeader>
      <p className="mb-4 text-sm text-muted">
        Choose the new categories for {videoIds.length} selected video(s). Existing categories will be replaced.
      </p>

      <div className="flex max-h-65 flex-col gap-1 overflow-y-auto">
        {categoryNames.map((name) => (
          <label
            key={name}
            className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm text-foreground/90 transition-colors duration-200 hover:bg-surface-hover"
          >
            <input
              type="checkbox"
              checked={selectedCategories.has(name)}
              onChange={() => toggleCategory(name)}
              className="accent-primary"
            />
            {name === DISLIKES_CATEGORY ? "Dislikes" : name === "__root__" ? "Home (root)" : name}
          </label>
        ))}
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => void handleSave()} loading={saving}>
          {saving ? "Saving…" : "Save categories"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
