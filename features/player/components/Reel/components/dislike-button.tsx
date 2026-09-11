"use client";

import { useState } from "react";
import { Loader2, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DislikeButtonProps {
  isDisliked: boolean;
  isUpdating: boolean;
  onToggle: () => Promise<void>;
}

export default function DislikeButton({ isDisliked, isUpdating, onToggle }: DislikeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isUpdating) return;
    setIsAnimating(true);
    window.setTimeout(() => setIsAnimating(false), 420);
    await onToggle();
  };

  return (
    <Button
      variant="icon"
      active={isDisliked}
      tone="negative"
      onClick={(event) => void handleClick(event)}
      disabled={isUpdating}
      className={cn("relative", isAnimating && "animate-dislike-pop")}
      aria-label={isDisliked ? "Remove from dislikes" : "Add to dislikes"}
      title={isDisliked ? "Remove from dislikes" : "Add to dislikes"}
    >
      {isAnimating && <span className="pointer-events-none absolute inset-0 animate-dislike-ring rounded-full" />}
      {isUpdating ? <Loader2 size={16} /> : <ThumbsDown size={16} />}
    </Button>
  );
}
