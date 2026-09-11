"use client";

import { useRef, useEffect } from "react";
import { thumbUrl } from "@/lib/api/thumbs";
import RatingControl from "@/components/ui/rating-control";
import CategoryBadges from "@/components/ui/category-badges";
import { formatDurationCompact } from "@/features/player/utils/formatTime";

interface GalleryCardProps {
  relPath: string;
  title: string;
  categoryLabels: string[];
  rootElement: HTMLElement | null;
  onClick: () => void;
  rating: number | null;
  durationSeconds: number;
  onRatingSaved: (rating: number) => void;
}

export default function GalleryCard({
  relPath,
  title,
  categoryLabels,
  rootElement,
  onClick,
  rating,
  durationSeconds,
  onRatingSaved,
}: GalleryCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
        }
      },
      { root: rootElement, rootMargin: "400px 0px", threshold: 0 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [relPath, rootElement]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/8 bg-linear-to-b from-surface-sunken to-surface-deep shadow-[0_6px_16px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.03)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_16px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-deep focus-visible:outline-none active:scale-98 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Play ${title}`}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden bg-surface-hover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbUrl(relPath)}
          alt={title}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-300 ease-out group-hover:scale-103 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-linear-to-b from-black/70 to-transparent" />

        <div className="pointer-events-auto absolute top-1.5 right-1.5 max-w-[70%]">
          <CategoryBadges categories={categoryLabels} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/80 to-transparent" />

        <span className="pointer-events-none absolute right-1.5 bottom-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.02em] text-white backdrop-blur-xs">
          {formatDurationCompact(durationSeconds)}
        </span>
      </div>

      <div
        dir="auto"
        className="line-clamp-2 min-h-10 px-3 pt-3 text-start text-[13px] leading-1.4 font-semibold tracking-[0.01em] text-foreground-soft"
      >
        {title}
      </div>

      <div className="mt-2 flex items-center justify-between px-3 pb-3">
        <RatingControl relPath={relPath} initialRating={rating} compact onSaved={onRatingSaved} />
        <span
          className={
            rating
              ? "rounded-full bg-white/5 px-2 py-0.5 text-[10.5px] font-medium text-amber-300/90 tabular-nums"
              : "rounded-full bg-white/5 px-2 py-0.5 text-[10.5px] font-medium text-subtle-strong"
          }
        >
          {rating ? rating.toFixed(1) : "Unrated"}
        </span>
      </div>
    </div>
  );
}
