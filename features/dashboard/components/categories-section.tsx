"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import type { Category } from "@/types/api";
import { getCategories, reorderCategories, deleteCategory } from "@/lib/api/categories";
import CategoryModal from "./category-modal";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalFooter } from "@/components/ui/modal";
import { DISLIKES_CATEGORY } from "@/lib/constants/categories";

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | "new" | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
      setOrderDirty(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  const moveCat = useCallback((id: number, delta: -1 | 1) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const target = idx + delta;
      if (target < 0 || target >= prev.length) return prev;
      if (prev[idx].name === DISLIKES_CATEGORY || prev[target].name === DISLIKES_CATEGORY) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setOrderDirty(true);
  }, []);

  const handleSaveOrder = useCallback(async () => {
    setSavingOrder(true);
    try {
      await reorderCategories(categories.map((c) => c.id));
      setOrderDirty(false);
      toast.success("Category order saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving order");
    } finally {
      setSavingOrder(false);
    }
  }, [categories]);

  const handleDelete = useCallback(
    async (cat: Category) => {
      try {
        await deleteCategory(cat.id);
        setDeleteCandidate(null);
        toast.success("Deleted");
        load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error");
      }
    },
    [load],
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5">
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => void handleSaveOrder()}
            loading={savingOrder}
            disabled={!orderDirty || savingOrder}
          >
            {savingOrder ? "Saving…" : "Save Order"}
          </Button>
          <Button variant="primary" onClick={() => setEditingCat("new")}>
            + New Category
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : categories.length === 0 ? (
        <p className="text-subtle">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="rounded-[10px] border border-surface-hover bg-surface-raised p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <span className="inline-block size-2.5 shrink-0 rounded-full" style={{ background: cat.color }} />
                  {cat.name === "__root__"
                    ? "Home"
                    : cat.name === "__uncategorized__"
                      ? "Uncategorized"
                      : cat.name === DISLIKES_CATEGORY
                        ? "Dislikes"
                        : cat.name}
                </div>
                <span className="rounded-[10px] bg-surface-hover px-2 py-0.75 text-xs text-muted">
                  {cat.count} videos
                </span>
              </div>

              {cat.id !== 0 && cat.name !== DISLIKES_CATEGORY && (
                <>
                  <div className="mb-2.5 flex gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => moveCat(cat.id, -1)} disabled={idx === 0}>
                      ↑ Up
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => moveCat(cat.id, 1)}
                      disabled={idx === categories.length - 1 || categories[idx + 1]?.name === DISLIKES_CATEGORY}
                    >
                      ↓ Down
                    </Button>
                  </div>

                  <div className="flex gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => setEditingCat(cat)}>
                      Edit
                    </Button>
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => setDeleteCandidate(cat)}
                      className="bg-primary-muted text-primary hover:bg-primary hover:text-primary-foreground"
                      aria-label={`Delete ${cat.name}`}
                      title="Delete category"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {editingCat !== null && (
        <CategoryModal
          category={editingCat === "new" ? null : editingCat}
          onClose={() => setEditingCat(null)}
          onSaved={load}
        />
      )}

      {deleteCandidate && (
        <Modal
          onClose={() => setDeleteCandidate(null)}
          maxWidth="min(420px,94vw)"
          className="border-danger-border bg-danger-surface"
        >
          <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary-muted text-primary">
            <Trash2 size={16} aria-hidden="true" />
          </div>
          <ModalHeader>Delete category?</ModalHeader>
          <p className="text-sm leading-6 text-muted-foreground">
            &ldquo;{deleteCandidate.name}&rdquo; will be removed. The videos inside it will not be deleted.
          </p>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void handleDelete(deleteCandidate)}>
              Delete category
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
