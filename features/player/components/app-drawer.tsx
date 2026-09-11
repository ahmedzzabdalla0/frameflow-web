"use client";

import { useCallback } from "react";
import { Menu } from "lucide-react";
import NavigationDrawer from "./navigation-drawer";
import { useDrawer } from "../hooks/useDrawer";
import type { CategoryMap } from "@/types/api";
import type { FilterState, PlaybackMode } from "@/types/player";

interface AppDrawerProps {
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

export default function AppDrawer({
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
}: AppDrawerProps) {
  const drawer = useDrawer();

  const handleSetMode = useCallback(
    (newMode: PlaybackMode) => {
      onSetMode(newMode);
      drawer.close();
    },
    [onSetMode, drawer],
  );

  const handleOpenSettings = useCallback(() => {
    drawer.close();
    onOpenSettings();
  }, [drawer, onOpenSettings]);

  return (
    <>
      <button
        onClick={drawer.open}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-black/50"
        aria-label="Open menu"
      >
        <Menu size={20} color="white" strokeWidth={2.25} />
      </button>

      <NavigationDrawer
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        mode={mode}
        onSetMode={handleSetMode}
        categoryMap={categoryMap}
        filter={filter}
        onCycleChip={onCycleChip}
        onSoloChip={onSoloChip}
        onClearAll={onClearAll}
        onTogglePureOnly={onTogglePureOnly}
        onToggleIntersectionOnly={onToggleIntersectionOnly}
        onOpenSettings={handleOpenSettings}
      />
    </>
  );
}
