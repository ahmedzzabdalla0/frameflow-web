import type { VideosResponse, GetVideosParams, UpdateVideoBody, Video } from "@/types/api";
import { apiGet, apiPost, apiPut, apiDelete } from "./client";

export async function getVideos(params: GetVideosParams = {}): Promise<VideosResponse> {
  return apiGet<VideosResponse>("/api/videos/", params as Record<string, string | number | boolean | undefined>);
}

export async function updateVideo(id: number, body: UpdateVideoBody): Promise<{ ok: true; video: Video }> {
  return apiPut(`/api/videos/${id}`, body);
}

export async function bulkUpdateVideoCategories(
  ids: number[],
  categories: string[],
): Promise<{ ok: true; updated: number }> {
  return apiPut("/api/videos/bulk-categories", { ids, categories });
}

export async function toggleVideoDislike(
  video: string,
  disliked: boolean,
): Promise<{ ok: true; disliked: boolean; video: Video }> {
  return apiPost("/api/videos/dislike", { video, disliked });
}

export async function deleteVideo(id: number): Promise<{ ok: true }> {
  return apiDelete(`/api/videos/${id}`);
}

export async function deleteVideos(ids: number[]): Promise<{ ok: true; deleted: number }> {
  const results = await Promise.all(ids.map((id) => deleteVideo(id)));
  return { ok: true, deleted: results.length };
}

export async function scanVideos(): Promise<{ ok: true; added: number }> {
  return apiPost("/api/videos/scan");
}

export async function refreshVideoMetadata(ids?: number[]): Promise<{ ok: true; refreshed: number }> {
  return apiPost("/api/videos/refresh-metadata", ids?.length ? { ids } : {});
}

export async function rateVideo(video: string, rating: number): Promise<{ ok: true; rating: number }> {
  return apiPost("/api/videos/rating", { video, rating });
}

export async function getVideoStats(): Promise<{ total_videos: number; total_size_bytes: number }> {
  return apiGet("/api/videos/stats");
}
