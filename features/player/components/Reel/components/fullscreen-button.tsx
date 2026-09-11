"use client";

import { useCallback, useEffect, useState } from "react";
import { Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullscreenButtonProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function FullscreenButton({ videoRef }: FullscreenButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const show = () => setVisible(true);
    video.addEventListener("loadedmetadata", show);
    return () => video.removeEventListener("loadedmetadata", show);
  }, [videoRef]);

  const enterNativeFullscreen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const video = videoRef.current;
      if (!video) return;
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if ("webkitEnterFullscreen" in video) {
        (video as HTMLVideoElement & { webkitEnterFullscreen(): void }).webkitEnterFullscreen();
      }
    },
    [videoRef],
  );

  if (!visible) return null;

  return (
    <Button variant="icon" onClick={enterNativeFullscreen} aria-label="Enter fullscreen" title="Fullscreen">
      <Maximize size={16} />
    </Button>
  );
}
