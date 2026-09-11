"use client";

import { Clapperboard, LayoutDashboard, LayoutGrid, Settings, SquarePlay, X } from "lucide-react";
import CategoryChips from "./category-chips";
import type { CategoryMap } from "@/types/api";
import type { FilterState, PlaybackMode } from "@/types/player";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: PlaybackMode;
  onSetMode: (mode: PlaybackMode) => void;
  categoryMap: CategoryMap;
  filter: FilterState;
  onCycleChip: (key: string) => void;
  onSoloChip: (key: string) => void;
  onClearAll: () => void;
  onTogglePureOnly: () => void;
  onToggleIntersectionOnly: () => void;
  onOpenSettings: () => void;
}

export default function NavigationDrawer({
  isOpen,
  onClose,
  mode,
  onSetMode,
  categoryMap,
  filter,
  onCycleChip,
  onSoloChip,
  onClearAll,
  onTogglePureOnly,
  onToggleIntersectionOnly,
  onOpenSettings,
}: NavigationDrawerProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-100 bg-black/55 transition-opacity duration-250" onClick={onClose} />}

      <nav
        className={`fixed inset-y-0 left-0 z-101 flex w-75 flex-col bg-surface pb-[env(safe-area-inset-bottom)] transition-transform duration-280 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation drawer"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-5 pt-13 pb-3.5">
          <div className="flex items-center gap-2.5 text-xl font-bold text-white">
            <Clapperboard size={22} color="var(--color-primary)" strokeWidth={2} />
            Video Feed
          </div>
          <button
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-muted transition-colors hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-0 border-b border-border-subtle px-4 py-2.5">
          <button
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-l-lg py-2 text-[13px] transition-colors ${
              mode === "tiktok" ? "bg-primary text-white" : "bg-surface-inset text-inactive-strong hover:text-white"
            }`}
            onClick={() => onSetMode("tiktok")}
          >
            <SquarePlay size={16} />
            TikTok
          </button>
          <button
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-r-lg py-2 text-[13px] transition-colors ${
              mode === "gallery" ? "bg-primary text-white" : "bg-surface-inset text-inactive-strong hover:text-white"
            }`}
            onClick={() => onSetMode("gallery")}
          >
            <LayoutGrid size={16} />
            Gallery
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3.5">
          <CategoryChips
            categoryMap={categoryMap}
            filter={filter}
            onCycleChip={onCycleChip}
            onSoloChip={onSoloChip}
            onClearAll={onClearAll}
            onTogglePureOnly={onTogglePureOnly}
            onToggleIntersectionOnly={onToggleIntersectionOnly}
          />
        </div>

        <div className="shrink-0 border-t border-border-subtle px-5 py-3">
          <button
            onClick={onOpenSettings}
            className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent py-2 text-sm text-muted transition-colors hover:text-white"
          >
            <Settings size={18} />
            Settings
          </button>
          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 py-2 text-sm text-muted no-underline transition-colors hover:text-white"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </a>
        </div>
      </nav>
    </>
  );
}
