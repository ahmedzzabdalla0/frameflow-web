"use client";

import { useState, useCallback } from "react";
import type { Video, CategoryMap } from "@/types/api";
import { updateVideo } from "@/lib/api/videos";
import { toast } from "sonner";
import { DISLIKES_CATEGORY } from "@/lib/constants/categories";
import { Modal, ModalHeader, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditVideoModalProps {
  video: Video | null;
  categoryMap: CategoryMap;
  onClose: () => void;
  onSaved: (video: Video) => void;
}

export default function EditVideoModal({ video, categoryMap, onClose, onSaved }: EditVideoModalProps) {
  const [title, setTitle] = useState(video?.title ?? "");
  const [selectedCats, setSelectedCats] = useState<Set<string>>(() => new Set(video?.categories ?? []));
  const [saving, setSaving] = useState(false);

  const handleCatToggle = useCallback((name: string) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!video) return;
    setSaving(true);
    try {
      const result = await updateVideo(video.id, {
        title: title.trim() || video.title,
        categories: [...selectedCats],
      });
      toast.success("Saved");
      onSaved(result.video);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving");
    } finally {
      setSaving(false);
    }
  }, [video, title, selectedCats, onSaved, onClose]);

  if (!video) return null;

  const allCatNames = Object.keys(categoryMap).filter((name) => name !== "__uncategorized__");

  return (
    <Modal onClose={onClose}>
      <ModalHeader>Edit Video</ModalHeader>

      <Input label="Title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-3.5" />

      <div className="mb-3.5 flex flex-col gap-1.5">
        <label className="text-xs font-semibold tracking-wider text-muted uppercase">Categories</label>
        <div className="flex max-h-45 flex-col gap-1 overflow-y-auto">
          {allCatNames.map((name) => (
            <label key={name} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-foreground/90">
              <input
                type="checkbox"
                checked={selectedCats.has(name)}
                onChange={() => handleCatToggle(name)}
                className="accent-primary"
              />
              {name === "__root__" ? "Home (root)" : name === DISLIKES_CATEGORY ? "Dislikes" : name}
            </label>
          ))}
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => void handleSave()} loading={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
