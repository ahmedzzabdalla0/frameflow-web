import { useCallback, useEffect } from "react";
import { videoUrl } from "../utils/encodeVideoPath";

export function useVideoSource(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  relPath: string,
  isBuffered: boolean,
) {
  const url = videoUrl(relPath);

  const setSrc = useCallback(
    (enabled: boolean) => {
      const video = videoRef.current;
      if (!video) return;
      if (enabled) {
        if (!video.getAttribute("src")) {
          video.src = url + "#t=0.2";
          video.preload = "auto";
          video.load();
        } else {
          video.preload = "auto";
        }
      } else {
        if (video.getAttribute("src")) {
          video.pause();
          video.removeAttribute("src");
          video.load();
        }
        video.preload = "none";
      }
    },
    [videoRef, url],
  );

  useEffect(() => {
    setSrc(isBuffered);
  }, [isBuffered, setSrc]);

  return { url, setSrc };
}
