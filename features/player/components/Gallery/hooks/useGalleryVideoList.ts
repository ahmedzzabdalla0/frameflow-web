"use client";

import { useMemo, useCallback } from "react";
import type { CategoryMap } from "@/types/api";
import type { VideoMetaMap, SortDirection, SortField, FilterState } from "@/types/player";
import { normalizeSearchText } from "@/features/player/utils/normalizeSearch";
import { shuffled } from "@/features/player/utils/shuffleArray";
import { getActiveVideos } from "@/features/player/utils/filterVideos";
import { videoTitle, videoAddedMs } from "../utils/galleryVideoInfo";

interface UseGalleryVideoListArgs {
  categoryMap: CategoryMap;
  videoMeta: VideoMetaMap;
  filter: FilterState;
  searchTerm: string;
  sortField: SortField;
  sortDirection: SortDirection;
}

export function useGalleryVideoList({
  categoryMap,
  videoMeta,
  filter,
  searchTerm,
  sortField,
  sortDirection,
}: UseGalleryVideoListArgs) {
  const basePool = useMemo(() => {
    const active = getActiveVideos(categoryMap, filter);
    const seen = new Set<string>();
    const unique = active.filter((relPath) => {
      if (seen.has(relPath)) return false;
      seen.add(relPath);
      return true;
    });
    return shuffled(unique);
  }, [categoryMap, filter]);

  const getViewList = useCallback((): string[] => {
    let list: string[] = basePool.slice();
    const term = normalizeSearchText(searchTerm);

    if (term) {
      list = list.filter((path: string) => normalizeSearchText(videoTitle(path, videoMeta)).includes(term));
    }

    if (sortField !== "disabled") {
      list = list.slice().sort((a: string, b: string) => {
        let comparison = 0;
        if (sortField === "date") {
          const da = videoAddedMs(a, videoMeta);
          const db = videoAddedMs(b, videoMeta);
          comparison = da - db;
        }
        if (sortField === "title") {
          const ta = normalizeSearchText(videoTitle(a, videoMeta));
          const tb = normalizeSearchText(videoTitle(b, videoMeta));
          comparison = ta.localeCompare(tb);
        }
        if (sortField === "size") comparison = (videoMeta[a]?.size_bytes ?? 0) - (videoMeta[b]?.size_bytes ?? 0);
        if (sortField === "duration")
          comparison = (videoMeta[a]?.duration_seconds ?? 0) - (videoMeta[b]?.duration_seconds ?? 0);
        if (sortField === "rating") comparison = (videoMeta[a]?.rating ?? 0) - (videoMeta[b]?.rating ?? 0);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return list;
  }, [basePool, searchTerm, sortField, sortDirection, videoMeta]);

  return { basePool, videos: getViewList() };
}
