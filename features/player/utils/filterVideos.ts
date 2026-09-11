import type { CategoryMap } from "@/types/api";
import type { FilterState } from "@/types/player";
import { DISLIKES_CATEGORY } from "@/lib/constants/categories";

export function getActiveVideos(categoryMap: CategoryMap, filter: FilterState): string[] {
  const { includedCats, excludedCats, pureOnly, intersectionOnly } = filter;
  const allKeys = Object.keys(categoryMap);
  const incKeys = includedCats.size > 0 ? [...includedCats] : allKeys;

  const seen = new Set<string>();
  const pool: string[] = [];
  for (const cat of incKeys) {
    const paths = categoryMap[cat];
    if (!paths) continue;
    for (const v of paths) {
      if (!seen.has(v)) {
        seen.add(v);
        pool.push(v);
      }
    }
  }

  const videoCats = new Map<string, Set<string>>();
  for (const v of pool) {
    const cats = new Set<string>();
    for (const k of allKeys) {
      if (categoryMap[k]?.includes(v)) cats.add(k);
    }
    videoCats.set(v, cats);
  }

  return pool.filter((v) => {
    const cats = videoCats.get(v) ?? new Set<string>();

    if (categoryMap[DISLIKES_CATEGORY]?.includes(v) && !includedCats.has(DISLIKES_CATEGORY)) return false;

    if (excludedCats.size > 0 && [...cats].some((k) => excludedCats.has(k))) {
      return false;
    }

    if (pureOnly && includedCats.size > 0) {
      if ([...cats].some((k) => !includedCats.has(k))) return false;
    }

    if (intersectionOnly && includedCats.size > 1) {
      if (![...includedCats].every((k) => cats.has(k))) return false;
    }

    return true;
  });
}
