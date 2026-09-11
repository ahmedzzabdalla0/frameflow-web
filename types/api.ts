export interface Video {
  id: number;
  rel_path: string;
  title: string;
  added_at: string;
  categories: string[];
  thumb_seek?: string;
  size_bytes: number;
  duration_seconds: number;
  rating: number | null;
}

export type CategoryMap = Record<string, string[]>;

export interface Category {
  id: number;
  name: string;
  color: string;
  count: number;
}

export interface VideosResponse {
  videos: Video[];
  total: number;
}

export interface Settings {
  default_included_categories: string[];
  default_excluded_categories: string[];
  default_pure_only: boolean;
  default_intersection_only: boolean;
}

export interface ApiOkResponse {
  ok: true;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
}

export type ApiResult<T> = (T & ApiOkResponse) | ApiErrorResponse;

export interface GetVideosParams {
  page?: number;
  per_page?: number;
  q?: string;
  category?: string;
  sort?: "date" | "title" | "size" | "duration" | "rating";
  order?: "asc" | "desc";
}

export interface UpdateVideoBody {
  title?: string;
  categories?: string[];
  rating?: number | null;
}

export interface CreateCategoryBody {
  name: string;
  color?: string;
}

export interface UpdateCategoryBody {
  name?: string;
  color?: string;
}

export interface SetThumbSeekBody {
  video: string;
  seek: string;
}
