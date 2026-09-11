"use client";

import { useState, useCallback } from "react";
import type { Category } from "@/types/api";
import { createCategory, updateCategory } from "@/lib/api/categories";
import { toast } from "sonner";
import { Modal, ModalHeader, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CategoryModal({ category, onClose, onSaved }: CategoryModalProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color ?? "#e44444");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name required");
      return;
    }
    setSaving(true);
    try {
      if (category) {
        await updateCategory(category.id, { name: trimmed, color });
      } else {
        await createCategory({ name: trimmed, color });
      }
      toast.success("Saved");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }, [name, color, category, onSaved, onClose]);

  return (
    <Modal onClose={onClose} maxWidth="min(480px,94vw)">
      <ModalHeader>{category ? "Edit Category" : "New Category"}</ModalHeader>

      <Input
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Favorites"
        className="mb-3.5"
      />

      <div className="mb-3.5 flex flex-col gap-1.5">
        <label className="text-xs font-semibold tracking-wider text-muted uppercase">Accent Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-[38px] w-full rounded-lg border border-border-strong bg-surface-sunken px-1.5 py-0.5 transition-colors duration-200 outline-none focus:border-muted"
        />
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
