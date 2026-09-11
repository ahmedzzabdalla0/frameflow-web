"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { getCategoryMap } from "@/lib/api/categories";
import {
  getVideoStats,
  refreshVideoMetadata,
  scanVideos,
} from "@/lib/api/videos";
import { formatBytes } from "@/lib/utils";

import type { CategoryMap } from "@/types/api";

export default function OverviewSection() {
  const [catMap, setCatMap] = useState<CategoryMap | null>(null);
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalSizeBytes, setTotalSizeBytes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, videoStats] = await Promise.all([
        getCategoryMap(),
        getVideoStats(),
      ]);
      setCatMap(cats);
      setTotalVideos(videoStats.total_videos);
      setTotalSizeBytes(videoStats.total_size_bytes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  const handleScan = useCallback(async () => {
    setScanning(true);
    try {
      const result = await scanVideos();
      toast.success(`Done — ${result.added} new video(s) added`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await refreshVideoMetadata();
      toast.success(
        `Done — ${result.refreshed} video metadata record(s) refreshed`,
      );
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Metadata refresh failed",
      );
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="mt-0.5 text-sm text-subtle">Library summary</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => void handleRefresh()}
            loading={refreshing}
            disabled={scanning || refreshing}
          >
            <RefreshCw size={14} />
            {refreshing ? "Refreshing…" : "Refresh Metadata"}
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleScan()}
            loading={scanning}
            disabled={scanning || refreshing}
          >
            <RefreshCw size={14} />
            {scanning ? "Scanning…" : "Scan Files"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
            <StatCard label="Total Videos" value={totalVideos} />
            <StatCard
              label="Categories"
              value={catMap ? Object.keys(catMap).length : 0}
            />
            <StatCard label="Total Size" value={formatBytes(totalSizeBytes)} />
          </div>

          <div className="mb-3 text-base font-bold text-muted">Categories</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
            {catMap &&
              Object.entries(catMap).map(([name, paths]) => (
                <div
                  key={name}
                  className="rounded-[10px] border border-surface-hover bg-surface-raised p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[15px] font-semibold text-foreground">
                      {name === "__root__" ? "📁 Home" : `📂 ${name}`}
                    </div>
                    <span className="rounded-[10px] bg-surface-hover px-2 py-0.75 text-xs text-muted">
                      {paths.length}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-[10px] border border-surface-hover bg-surface-raised p-4">
      <div className="text-xs tracking-[0.06em] text-subtle uppercase">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-foreground leading-tight">
        {value}
      </div>
    </div>
  );
}
