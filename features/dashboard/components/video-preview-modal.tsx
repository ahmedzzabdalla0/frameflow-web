"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { videoUrl } from "@/features/player/utils/encodeVideoPath";

interface VideoPreviewModalProps {
  title: string;
  relPath: string;
  onClose: () => void;
}

export default function VideoPreviewModal({ title, relPath, onClose }: VideoPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-500 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-[min(820px,96vw)] overflow-hidden rounded-xl border border-border bg-surface-raised shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="max-w-[80%] truncate text-sm font-semibold text-foreground">{title}</h3>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close video preview">
            <X size={16} />
          </Button>
        </div>
        <div className="bg-black p-3">
          <video
            src={videoUrl(relPath)}
            controls
            playsInline
            preload="metadata"
            className="max-h-[72vh] w-full rounded-lg object-contain"
          />
        </div>
      </div>
    </div>
  );
}
