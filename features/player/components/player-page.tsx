"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import TikTokFeed from "./tik-tok-feed";
import GalleryView from "./Gallery/components/gallery-view";
import AppDrawer from "./app-drawer";
import SettingsPanel from "./settings-panel";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorState } from "@/components/ui/error-state";
import { getCategoryMap } from "@/lib/api/categories";
import { getVideos } from "@/lib/api/videos";
import { getSettings } from "@/lib/api/settings";
import { toggleVideoDislike } from "@/lib/api/videos";
import type { CategoryMap, Settings } from "@/types/api";
import type { VideoMetaMap, PlaybackMode } from "@/types/player";
import { useFilterState, loadMode, saveMode } from "../hooks/useFilterState";
import { useFullscreenPlayer } from "../hooks/useFullscreenPlayer";
import { getActiveVideos } from "../utils/filterVideos";
import GalleryReelPlayer from "./gallery-reel-player";
import ReloadButton from "./reload-button";
import { DISLIKES_CATEGORY } from "@/lib/constants/categories";

interface AppData {
  categoryMap: CategoryMap;
  videoMeta: VideoMetaMap;
  settings: Settings;
}

export default function PlayerPage() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<PlaybackMode>("tiktok");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedPlaybackEnabled, setFeedPlaybackEnabled] = useState(true);
  const [dislikedVideos, setDislikedVideos] = useState<Set<string>>(new Set());
  const wasPlayingBeforeSettingsRef = useRef(false);

  const fsPlayer = useFullscreenPlayer();

  useEffect(() => {
    async function load() {
      try {
        const [categoryMap, videosResp, settings] = await Promise.all([
          getCategoryMap(),
          getVideos({ per_page: 10000 }),
          getSettings(),
        ]);

        const videoMeta: VideoMetaMap = {};
        for (const v of videosResp.videos) {
          videoMeta[v.rel_path] = {
            title: v.title,
            added_at: v.added_at,
            size_bytes: v.size_bytes,
            duration_seconds: v.duration_seconds,
            rating: v.rating,
          };
        }

        setAppData({ categoryMap, videoMeta, settings });
        setDislikedVideos(new Set(categoryMap[DISLIKES_CATEGORY] ?? []));
        setMode(loadMode());
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load");
      }
    }
    load();
  }, []);

  const filterState = useFilterState(
    appData?.categoryMap ?? {},
    appData?.settings ?? {
      default_included_categories: [],
      default_excluded_categories: [],
      default_pure_only: false,
      default_intersection_only: false,
    },
    !!appData,
  );

  const activeVideos = useMemo(
    () => (appData ? getActiveVideos(appData.categoryMap, filterState.filter) : []),
    [appData, filterState.filter],
  );

  const handleSetMode = useCallback((newMode: PlaybackMode) => {
    setMode(newMode);
    saveMode(newMode);
  }, []);

  const handleOpenSettings = useCallback(() => {
    const activeVideo = [...document.querySelectorAll<HTMLVideoElement>("#feed video")].find((video) => !video.paused);
    wasPlayingBeforeSettingsRef.current = Boolean(activeVideo);
    setFeedPlaybackEnabled(false);
    document.querySelectorAll<HTMLVideoElement>("#feed video").forEach((video) => video.pause());
    setSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    const shouldResume = wasPlayingBeforeSettingsRef.current;
    setSettingsOpen(false);
    setFeedPlaybackEnabled(shouldResume);
    if (!shouldResume) return;

    requestAnimationFrame(() => {
      const activeVideo = [...document.querySelectorAll<HTMLVideoElement>("#feed video")].find((video) =>
        video.classList.contains("is-active"),
      );
      void activeVideo?.play().catch(() => undefined);
      wasPlayingBeforeSettingsRef.current = false;
    });
  }, []);

  const handleTogglePureOnly = useCallback(() => {
    filterState.setPureOnly(!filterState.filter.pureOnly);
  }, [filterState]);

  const handleToggleIntersectionOnly = useCallback(() => {
    filterState.setIntersectionOnly(!filterState.filter.intersectionOnly);
  }, [filterState]);

  const handleSettingsSaved = useCallback(
    (settings: Settings) => {
      if (!appData) return;
      setAppData((prev) => (prev ? { ...prev, settings } : prev));
      filterState.applyServerDefaults(settings);
    },
    [appData, filterState],
  );

  const handleOpenFullscreen = useCallback(
    (relPath: string, playlist: string[]) => {
      fsPlayer.open(relPath, playlist);
    },
    [fsPlayer],
  );

  const handleRatingSaved = useCallback((relPath: string, rating: number) => {
    setAppData((prev) => {
      if (!prev || !prev.videoMeta[relPath]) return prev;
      return {
        ...prev,
        videoMeta: {
          ...prev.videoMeta,
          [relPath]: { ...prev.videoMeta[relPath], rating },
        },
      };
    });
  }, []);

  const handleToggleDislike = useCallback(async (relPath: string, disliked: boolean) => {
    const result = await toggleVideoDislike(relPath, disliked);
    setDislikedVideos((current) => {
      const next = new Set(current);
      if (result.disliked) next.add(relPath);
      else next.delete(relPath);
      return next;
    });
  }, []);

  if (loadError) {
    return (
      <div className="flex h-dvh items-center justify-center bg-black">
        <ErrorState message={loadError} onRetry={() => location.reload()} />
      </div>
    );
  }

  if (!appData || !filterState.isReady) {
    return (
      <div className="flex h-dvh items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-black">
      <div className="fixed top-3.5 left-3.5 z-50 flex gap-x-2">
        <AppDrawer
          mode={mode}
          onSetMode={handleSetMode}
          categoryMap={appData.categoryMap}
          filter={filterState.filter}
          onCycleChip={filterState.cycleChip}
          onSoloChip={filterState.soloChip}
          onClearAll={filterState.clearAll}
          onTogglePureOnly={handleTogglePureOnly}
          onToggleIntersectionOnly={handleToggleIntersectionOnly}
          onOpenSettings={handleOpenSettings}
        />
        <ReloadButton />
      </div>

      <TikTokFeed
        activeVideos={activeVideos}
        videoMeta={appData.videoMeta}
        categoryMap={appData.categoryMap}
        isVisible={mode === "tiktok"}
        playbackEnabled={feedPlaybackEnabled}
        onRatingSaved={handleRatingSaved}
        dislikedVideos={dislikedVideos}
        onToggleDislike={handleToggleDislike}
      />

      {mode === "gallery" && (
        <GalleryView
          key={JSON.stringify([...filterState.filter.includedCats, ...filterState.filter.excludedCats])}
          categoryMap={appData.categoryMap}
          videoMeta={appData.videoMeta}
          filter={filterState.filter}
          isVisible={true}
          onOpenFullscreen={handleOpenFullscreen}
          onRatingSaved={handleRatingSaved}
        />
      )}

      <GalleryReelPlayer
        isOpen={fsPlayer.state.isOpen}
        playlist={fsPlayer.state.playlist}
        index={fsPlayer.state.index}
        onClose={fsPlayer.close}
        onGoTo={fsPlayer.goTo}
        videoMeta={appData.videoMeta}
        categoryMap={appData.categoryMap}
        onRatingSaved={handleRatingSaved}
        dislikedVideos={dislikedVideos}
        onToggleDislike={handleToggleDislike}
      />

      <SettingsPanel
        isOpen={settingsOpen}
        categoryMap={appData.categoryMap}
        initialSettings={appData.settings}
        onClose={handleCloseSettings}
        onSaved={handleSettingsSaved}
      />
    </div>
  );
}
