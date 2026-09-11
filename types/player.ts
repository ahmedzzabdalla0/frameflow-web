export type ChipState = "off" | "include" | "exclude";

export type PlaybackMode = "tiktok" | "gallery";

export type SortField = "disabled" | "date" | "title" | "size" | "duration" | "rating";
export type SortDirection = "asc" | "desc";

export interface FilterState {
  includedCats: Set<string>;
  excludedCats: Set<string>;
  pureOnly: boolean;
  intersectionOnly: boolean;
}

export interface VideoMeta {
  title: string;
  added_at: string;
  size_bytes: number;
  duration_seconds: number;
  rating: number | null;
}

export type VideoMetaMap = Record<string, VideoMeta>;
