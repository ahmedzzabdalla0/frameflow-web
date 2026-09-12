import type { SetThumbSeekBody } from "@/types/api";

import { apiPost, mediaUrl } from "./client";

export function thumbUrl(relPath: string): string {
  return mediaUrl(`/api/thumb/${encodeURIComponent(relPath)}`);
}

export function thumbUrlWithBust(relPath: string): string {
  return `${thumbUrl(relPath)}?t=${Date.now()}`;
}

export async function setThumbSeek(
  body: SetThumbSeekBody,
): Promise<{ ok: true }> {
  return apiPost("/api/set-thumb-seek", body);
}

export async function clearThumbs(): Promise<{ ok: true; deleted: number }> {
  return apiPost("/api/clear-thumbs");
}
