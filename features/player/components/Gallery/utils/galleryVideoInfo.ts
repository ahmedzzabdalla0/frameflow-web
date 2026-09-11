import type { CategoryMap } from "@/types/api";
import type { VideoMetaMap } from "@/types/player";
import { DISLIKES_CATEGORY } from "@/lib/constants/categories";

export function categoryLabelsOf(relPath: string, categoryMap: CategoryMap): string[] {
  return Object.entries(categoryMap)
    .filter(([name]) => name !== DISLIKES_CATEGORY)
    .filter(([, paths]) => paths.includes(relPath))
    .map(([name]) => {
      if (name === "__root__") return "Home";
      if (name === "__uncategorized__") return "Uncategorized";
      return name;
    });
}

export function videoTitle(relPath: string, videoMeta: VideoMetaMap): string {
  const fallback =
    relPath
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "") ?? relPath;
  const t = videoMeta[relPath]?.title;
  return t && t.trim() ? t.trim() : fallback;
}

export function videoAddedMs(relPath: string, videoMeta: VideoMetaMap): number {
  const raw = videoMeta[relPath]?.added_at ?? "";
  const ms = Date.parse(raw);
  return isNaN(ms) ? 0 : ms;
}
