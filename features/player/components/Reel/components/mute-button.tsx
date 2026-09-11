"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MuteButtonProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isMuted: boolean;
  onToggleMute: (e: React.MouseEvent) => void;
}

export default function MuteButton({ videoRef, isMuted, onToggleMute }: MuteButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const show = () => setVisible(true);
    video.addEventListener("loadedmetadata", show);
    return () => video.removeEventListener("loadedmetadata", show);
  }, [videoRef]);

  if (!visible) return null;

  return (
    <Button
      variant="icon"
      onClick={onToggleMute}
      aria-label={isMuted ? "Unmute" : "Mute"}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
    </Button>
  );
}
