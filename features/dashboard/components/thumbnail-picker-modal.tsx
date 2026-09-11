"use client";

import FramePicker from "./frame-picker";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ThumbnailPickerModalProps {
  title: string;
  relPath: string;
  initialSeek?: string;
  onClose: () => void;
  onThumbSet: (seek: string) => void;
}

export default function ThumbnailPickerModal({
  title,
  relPath,
  initialSeek,
  onClose,
  onThumbSet,
}: ThumbnailPickerModalProps) {
  return (
    <div
      className="fixed inset-0 z-500 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-[min(620px,96vw)] rounded-xl border border-border bg-surface-raised p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-foreground">Edit Thumbnail</h3>
            <p className="mt-1 max-w-120 truncate text-xs text-muted">{title}</p>
          </div>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close thumbnail editor">
            <X size={16} />
          </Button>
        </div>
        <FramePicker relPath={relPath} initialSeek={initialSeek} onThumbSet={onThumbSet} />
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
