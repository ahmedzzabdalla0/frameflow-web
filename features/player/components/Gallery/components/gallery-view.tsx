"use client";

import { useState } from "react";
import GalleryCard from "./gallery-card";
import GalleryToolbar from "./gallery-toolbar";
import type { CategoryMap } from "@/types/api";
import type { VideoMetaMap, SortDirection, SortField, FilterState } from "@/types/player";
import { categoryLabelsOf, videoTitle } from "../utils/galleryVideoInfo";
import { useGalleryVideoList } from "../hooks/useGalleryVideoList";

interface GalleryViewProps {
  categoryMap: CategoryMap;
  videoMeta: VideoMetaMap;
  filter: FilterState;
  isVisible: boolean;
  onOpenFullscreen: (relPath: string, playlist: string[]) => void;
  onRatingSaved: (relPath: string, rating: number) => void;
}

export default function GalleryView({
  categoryMap,
  videoMeta,
  filter,
  isVisible,
  onOpenFullscreen,
  onRatingSaved,
}: GalleryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("disabled");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [galleryEl, setGalleryEl] = useState<HTMLElement | null>(null);

  const { basePool, videos } = useGalleryVideoList({
    categoryMap,
    videoMeta,
    filter,
    searchTerm,
    sortField,
    sortDirection,
  });

  if (!isVisible) return null;

  return (
    <div
      ref={(el) => {
        if (el && !galleryEl) setGalleryEl(el);
      }}
      id="gallery"
      className="h-dvh min-w-0 overflow-x-hidden overflow-y-auto bg-surface px-2 pt-15 pb-2"
    >
      <GalleryToolbar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
      />

      {videos.length === 0 ? (
        <p className="p-10 text-center text-muted">{basePool.length > 0 ? "No videos match search" : "No videos"}</p>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {videos.map((relPath) => (
            <GalleryCard
              key={relPath}
              relPath={relPath}
              title={videoTitle(relPath, videoMeta)}
              categoryLabels={categoryLabelsOf(relPath, categoryMap)}
              rating={videoMeta[relPath]?.rating ?? null}
              durationSeconds={videoMeta[relPath]?.duration_seconds ?? 0}
              rootElement={galleryEl}
              onClick={() => onOpenFullscreen(relPath, videos)}
              onRatingSaved={(rating) => onRatingSaved(relPath, rating)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
