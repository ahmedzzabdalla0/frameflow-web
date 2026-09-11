import { mediaUrl } from "@/lib/api/client";

export function videoUrl(relPath: string): string {
  const encoded = relPath
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return mediaUrl(`/video/${encoded}`);
}

export function categoryOfPath(relPath: string): string {
  const parts = relPath.split("/");
  return parts.length > 1 ? parts[0] : "__root__";
}
