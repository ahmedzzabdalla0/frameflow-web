"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryBadgesProps {
  categories: string[];
}

export default function CategoryBadges({ categories }: CategoryBadgesProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleCategories = expanded ? categories : categories.slice(0, 2);
  const hasMore = categories.length > 2;

  if (categories.length === 0) return null;

  return (
    <div className="flex h-6 max-w-full items-center justify-end gap-1 overflow-hidden whitespace-nowrap">
      {hasMore && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
          className="inline-flex h-full w-7 shrink-0 items-center justify-center rounded-md bg-black/65 text-foreground transition-colors hover:bg-black/90"
          aria-label={expanded ? "Collapse categories" : "Expand categories"}
          aria-expanded={expanded}
        >
          <ChevronRight size={14} className={cn(!expanded && "rotate-180")} />
        </button>
      )}
      {visibleCategories.map((category) => (
        <span
          key={category}
          title={category}
          className="h-full max-w-45 truncate rounded-md bg-primary/90 px-2 py-1 text-xs leading-4 font-semibold text-primary-foreground"
        >
          {category}
        </span>
      ))}
    </div>
  );
}
