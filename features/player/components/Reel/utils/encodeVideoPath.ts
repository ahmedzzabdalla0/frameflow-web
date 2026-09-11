import { getApiUrl } from "@/features/player/utils/getApiUrl";

export function videoUrl(relPath: string): string {
  const encodedSegments = relPath.split("/").map((segment) => encodeURIComponent(segment));

  return new URL(`/video/${encodedSegments.join("/")}`, getApiUrl()).toString();
}
