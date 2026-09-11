"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { formatDurationCompact } from "@/features/player/utils/formatTime";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import RatingControl from "@/components/ui/rating-control";
import { Select } from "@/components/ui/select";

import { getCategoryMap } from "@/lib/api/categories";
import { thumbUrl } from "@/lib/api/thumbs";
import {
  deleteVideo,
  deleteVideos,
  getVideos,
  refreshVideoMetadata,
} from "@/lib/api/videos";
import { DISLIKES_CATEGORY } from "@/lib/constants/categories";
import { cn, formatBytes } from "@/lib/utils";

import type { CategoryMap, Video } from "@/types/api";

import BulkCategoryModal from "./bulk-category-modal";
import EditVideoModal from "./edit-video-modal";
import ThumbnailPickerModal from "./thumbnail-picker-modal";
import VideoPreviewModal from "./video-preview-modal";

const PER_PAGE = 30;

type SortField = "date" | "title" | "size" | "duration" | "rating";
type SortDirection = "asc" | "desc";

export default function VideosSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [sort, setSort] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [loading, setLoading] = useState(false);
  const [catMap, setCatMap] = useState<CategoryMap>({});
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [thumbnailVideo, setThumbnailVideo] = useState<Video | null>(null);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Video | null>(null);
  const [thumbnailVersions, setThumbnailVersions] = useState<
    Record<number, number>
  >({});
  const [deletingVideoId, setDeletingVideoId] = useState<number | null>(null);
  const [refreshingVideoId, setRefreshingVideoId] = useState<number | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkRefreshing, setBulkRefreshing] = useState(false);
  const [bulkCategoriesOpen, setBulkCategoriesOpen] = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionAnchorRef = useRef<number | null>(null);

  const load = useCallback(
    async (
      p: number,
      q: string,
      cat: string,
      s: SortField,
      direction: SortDirection,
    ) => {
      setLoading(true);
      try {
        const data = await getVideos({
          page: p,
          per_page: PER_PAGE,
          q: q || undefined,
          category: cat || undefined,
          sort: s,
          order: direction,
        });
        setVideos(data.videos);
        setTotal(data.total);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadCatMap = useCallback(async () => {
    const data = await getCategoryMap();
    setCatMap(data);
  }, []);

  useEffect(() => {
    (async () => {
      await loadCatMap();
    })();
  }, [loadCatMap]);

  useEffect(() => {
    (async () => {
      await load(page, search, catFilter, sort, sortDirection);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, catFilter, sort, sortDirection, load]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        setPage(1);
        load(1, value, catFilter, sort, sortDirection);
      }, 350);
    },
    [catFilter, sort, sortDirection, load],
  );

  const totalPages = Math.ceil(total / PER_PAGE);

  const handleVideoSelection = useCallback(
    (videoId: number, checked: boolean, shiftKey: boolean) => {
      setSelectedIds((current) => {
        const next = new Set(current);
        const anchorIndex = videos.findIndex(
          (video) => video.id === selectionAnchorRef.current,
        );
        const targetIndex = videos.findIndex((video) => video.id === videoId);
        const hasVisibleAnchor =
          shiftKey && anchorIndex !== -1 && targetIndex !== -1;

        if (hasVisibleAnchor) {
          const start = Math.min(anchorIndex, targetIndex);
          const end = Math.max(anchorIndex, targetIndex);
          for (let index = start; index <= end; index += 1) {
            const id = videos[index].id;
            if (checked) next.add(id);
            else next.delete(id);
          }
        } else if (checked) {
          next.add(videoId);
        } else {
          next.delete(videoId);
        }
        return next;
      });

      if (!shiftKey || selectionAnchorRef.current === null) {
        selectionAnchorRef.current = videoId;
      }
    },
    [videos],
  );

  const handleVideoSaved = useCallback((updated: Video) => {
    setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  }, []);

  const handleVideoDelete = useCallback(
    async (video: Video) => {
      setDeletingVideoId(video.id);
      try {
        await deleteVideo(video.id);
        setVideos((prev) => prev.filter((item) => item.id !== video.id));
        setTotal((prev) => prev - 1);
        if (videos.length === 1 && page > 1) setPage((current) => current - 1);
        setEditingVideo((current) =>
          current?.id === video.id ? null : current,
        );
        setThumbnailVideo((current) =>
          current?.id === video.id ? null : current,
        );
        setPreviewVideo((current) =>
          current?.id === video.id ? null : current,
        );
        setDeleteCandidate(null);
        toast.success("Video deleted");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error deleting video",
        );
      } finally {
        setDeletingVideoId(null);
      }
    },
    [page, videos.length],
  );

  const handleRefreshMetadata = useCallback(
    async (video: Video) => {
      setRefreshingVideoId(video.id);
      try {
        await refreshVideoMetadata([video.id]);
        const data = await getVideos({
          page,
          per_page: PER_PAGE,
          q: search || undefined,
          category: catFilter || undefined,
          sort,
          order: sortDirection,
        });
        setVideos(data.videos);
        toast.success("Metadata refreshed");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Metadata refresh failed",
        );
      } finally {
        setRefreshingVideoId(null);
      }
    },
    [catFilter, page, search, sort, sortDirection],
  );

  const handleRefreshSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setBulkRefreshing(true);
    try {
      await refreshVideoMetadata([...selectedIds]);
      await load(page, search, catFilter, sort, sortDirection);
      setSelectedIds(new Set());
      toast.success("Selected metadata refreshed");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Metadata refresh failed",
      );
    } finally {
      setBulkRefreshing(false);
    }
  }, [catFilter, load, page, search, selectedIds, sort, sortDirection]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      await deleteVideos([...selectedIds]);
      const deletedCount = selectedIds.size;
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      await load(page, search, catFilter, sort, sortDirection);
      toast.success(`${deletedCount} video(s) deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      setBulkDeleting(false);
    }
  }, [catFilter, load, page, search, selectedIds, sort, sortDirection]);

  const clearSelection = useCallback(() => {
    selectionAnchorRef.current = null;
    setSelectedIds(new Set());
    setBulkActionsOpen(false);
  }, []);

  const isBusy = bulkRefreshing || bulkDeleting;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Videos</h1>
          <p className="mt-0.5 text-sm text-subtle">{total} video(s)</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-stretch gap-2.5">
        {selectedIds.size > 0 && (
          <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="h-auto"
              onClick={clearSelection}
              disabled={isBusy}
            >
              <X size={16} aria-hidden="true" />
              Deselect
            </Button>
            <div className="relative">
              <Button
                variant="secondary"
                className="h-full"
                size="sm"
                onClick={() => setBulkActionsOpen((open) => !open)}
                disabled={isBusy}
                aria-expanded={bulkActionsOpen}
                aria-haspopup="menu"
              >
                <MoreHorizontal size={16} aria-hidden="true" />
                Actions
                <span className="text-xs text-muted">({selectedIds.size})</span>
              </Button>

              {bulkActionsOpen && (
                <div
                  role="menu"
                  className="absolute top-[calc(100%+0.5rem)] left-0 z-40 w-[min(250px,calc(100vw-2rem))] rounded-xl border border-border bg-surface-raised p-1.5 shadow-2xl"
                >
                  <MenuAction
                    icon={<Pencil size={16} aria-hidden="true" />}
                    label="Edit categories"
                    onClick={() => {
                      setBulkActionsOpen(false);
                      setBulkCategoriesOpen(true);
                    }}
                    disabled={isBusy}
                  />
                  <MenuAction
                    icon={
                      bulkRefreshing ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <RefreshCw size={16} aria-hidden="true" />
                      )
                    }
                    label={bulkRefreshing ? "Refreshing…" : "Refresh selected"}
                    onClick={() => {
                      setBulkActionsOpen(false);
                      void handleRefreshSelected();
                    }}
                    disabled={isBusy}
                  />
                  <MenuAction
                    icon={<Trash2 size={16} aria-hidden="true" />}
                    label="Delete selected"
                    onClick={() => {
                      setBulkActionsOpen(false);
                      setBulkDeleteOpen(true);
                    }}
                    disabled={isBusy}
                    danger
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <Input
          type="search"
          placeholder="Search titles…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="min-w-45 flex-1"
        />
        <Select
          value={catFilter}
          onChange={(e) => {
            setCatFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by category"
          className="min-w-35"
        >
          <option value="">All categories</option>
          {Object.keys(catMap).map((name) => (
            <option key={name} value={name}>
              {name === "__root__"
                ? "Home (root)"
                : name === "__uncategorized__"
                  ? "Uncategorized"
                  : name === DISLIKES_CATEGORY
                    ? "Dislikes"
                    : name}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortField);
            setPage(1);
          }}
          aria-label="Sort by"
          className="min-w-40"
        >
          <option value="date">Added date</option>
          <option value="title">Title</option>
          <option value="size">File size</option>
          <option value="duration">Duration</option>
          <option value="rating">Rating</option>
        </Select>
        <Select
          value={sortDirection}
          onChange={(e) => {
            setSortDirection(e.target.value as SortDirection);
            setPage(1);
          }}
          aria-label="Sort direction"
          className="min-w-32.5"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-[10px] border border-surface-hover bg-surface">
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full min-w-245 border-collapse">
            <thead className="bg-surface-raised">
              <tr>
                <th className="w-9 px-2 py-2.5">
                  <input
                    type="checkbox"
                    checked={
                      videos.length > 0 &&
                      videos.every((video) => selectedIds.has(video.id))
                    }
                    onChange={(event) => {
                      selectionAnchorRef.current = null;
                      setSelectedIds(
                        event.target.checked
                          ? new Set(videos.map((video) => video.id))
                          : new Set(),
                      );
                    }}
                    aria-label="Select all visible videos"
                  />
                </th>
                {(
                  [
                    "Thumb",
                    "Duration",
                    "Size",
                    "Title",
                    "Rating",
                    "Categories",
                    "Added",
                    "Actions",
                  ] as const
                ).map((col) => (
                  <th
                    key={col}
                    className="px-3.5 py-2.5 text-left text-xs font-semibold tracking-[0.06em] text-subtle uppercase"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {videos.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3.5 py-10 text-center text-subtle"
                  >
                    No videos found
                  </td>
                </tr>
              ) : (
                videos.map((v) => (
                  <tr
                    key={v.id}
                    className="border-t border-surface-hover hover:bg-surface-raised"
                  >
                    <td className="px-2 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(v.id)}
                        onChange={(event) =>
                          handleVideoSelection(
                            v.id,
                            event.target.checked,
                            Boolean((event.nativeEvent as MouseEvent).shiftKey),
                          )
                        }
                        aria-label={`Select ${v.title}`}
                      />
                    </td>
                    <td className="px-3.5 py-2.5 align-middle">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${thumbUrl(v.rel_path)}?v=${thumbnailVersions[v.id] ?? 0}`}
                        alt={v.title}
                        loading="lazy"
                        className="h-15 w-12 cursor-pointer rounded bg-surface-hover object-contain transition-opacity hover:opacity-80"
                        onClick={() => setPreviewVideo(v)}
                        onError={(e) =>
                          ((e.currentTarget as HTMLImageElement).style.display =
                            "none")
                        }
                      />
                    </td>
                    <td className="px-3.5 py-2.5 text-xs whitespace-nowrap text-muted">
                      {formatDurationCompact(v.duration_seconds)}
                    </td>
                    <td className="px-3.5 py-2.5 text-xs whitespace-nowrap text-muted">
                      {formatBytes(v.size_bytes)}
                    </td>
                    <td
                      className="max-w-50 truncate px-3.5 py-2.5 text-sm text-foreground/90"
                      title={v.title}
                    >
                      {v.title}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <RatingControl
                        relPath={v.rel_path}
                        initialRating={v.rating}
                        compact
                        onSaved={(rating) => handleVideoSaved({ ...v, rating })}
                      />
                    </td>
                    <td className="px-3.5 py-2.5 text-sm">
                      {(v.categories ?? []).length === 0 ? (
                        <CategoryPill label="Uncategorized" />
                      ) : (
                        (v.categories ?? []).map((cat) => (
                          <CategoryPill
                            key={cat}
                            label={cat === DISLIKES_CATEGORY ? "Dislikes" : cat}
                            accent
                          />
                        ))
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-xs whitespace-nowrap text-subtle">
                      {v.added_at}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingVideo(v)}
                          disabled={
                            deletingVideoId === v.id ||
                            refreshingVideoId === v.id
                          }
                        >
                          <Pencil size={16} aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          variant="icon"
                          size="sm"
                          onClick={() => setThumbnailVideo(v)}
                          disabled={
                            deletingVideoId === v.id ||
                            refreshingVideoId === v.id
                          }
                          aria-label={`Edit thumbnail for ${v.title}`}
                          title="Edit thumbnail"
                        >
                          <ImageIcon size={16} aria-hidden="true" />
                        </Button>
                        <Button
                          variant="icon"
                          size="sm"
                          onClick={() => void handleRefreshMetadata(v)}
                          disabled={
                            deletingVideoId === v.id ||
                            refreshingVideoId === v.id
                          }
                          aria-label={`Refresh metadata for ${v.title}`}
                          title="Refresh metadata"
                        >
                          {refreshingVideoId === v.id ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <RefreshCw size={16} aria-hidden="true" />
                          )}
                        </Button>
                        <Button
                          variant="icon"
                          size="sm"
                          onClick={() => setDeleteCandidate(v)}
                          disabled={
                            deletingVideoId === v.id ||
                            refreshingVideoId === v.id
                          }
                          className="bg-primary-muted text-primary hover:bg-primary hover:text-primary-foreground"
                          aria-label={`Delete ${v.title}`}
                          title="Delete video"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          {page > 1 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(page - 1)}
            >
              ‹
            </Button>
          )}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return (
              <Button
                key={p}
                variant={p === page ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPage(p)}
                className="w-8 px-0"
              >
                {p}
              </Button>
            );
          })}
          {page < totalPages && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(page + 1)}
            >
              ›
            </Button>
          )}
          <span className="px-2 text-xs text-subtle">
            Page {page} of {totalPages}
          </span>
        </div>
      )}

      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          categoryMap={catMap}
          onClose={() => setEditingVideo(null)}
          onSaved={handleVideoSaved}
        />
      )}
      {bulkCategoriesOpen && (
        <BulkCategoryModal
          videoIds={[...selectedIds]}
          categoryMap={catMap}
          onClose={() => setBulkCategoriesOpen(false)}
          onSaved={() => {
            setSelectedIds(new Set());
            void load(page, search, catFilter, sort, sortDirection);
          }}
        />
      )}
      {thumbnailVideo && (
        <ThumbnailPickerModal
          title={thumbnailVideo.title}
          relPath={thumbnailVideo.rel_path}
          initialSeek={thumbnailVideo.thumb_seek}
          onClose={() => setThumbnailVideo(null)}
          onThumbSet={(seek) => {
            setVideos((prev) =>
              prev.map((video) =>
                video.id === thumbnailVideo.id
                  ? { ...video, thumb_seek: seek }
                  : video,
              ),
            );
            setThumbnailVideo((current) =>
              current ? { ...current, thumb_seek: seek } : current,
            );
            setThumbnailVersions((prev) => ({
              ...prev,
              [thumbnailVideo.id]: (prev[thumbnailVideo.id] ?? 0) + 1,
            }));
            toast.success("Thumbnail updated");
          }}
        />
      )}
      {previewVideo && (
        <VideoPreviewModal
          title={previewVideo.title}
          relPath={previewVideo.rel_path}
          onClose={() => setPreviewVideo(null)}
        />
      )}
      {deleteCandidate && (
        <Modal
          onClose={() => setDeleteCandidate(null)}
          maxWidth="min(420px,94vw)"
          className="border-danger-border bg-danger-surface"
        >
          <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary-muted text-primary">
            <Trash2 size={16} aria-hidden="true" />
          </div>
          <ModalHeader>Delete video?</ModalHeader>
          <p className="text-sm leading-6 text-muted-foreground">
            &ldquo;{deleteCandidate.title}&rdquo; and its video file will be
            permanently deleted.
          </p>
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteCandidate(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleVideoDelete(deleteCandidate)}
              loading={deletingVideoId === deleteCandidate.id}
            >
              {deletingVideoId === deleteCandidate.id
                ? "Deleting…"
                : "Delete video"}
            </Button>
          </ModalFooter>
        </Modal>
      )}
      {bulkDeleteOpen && (
        <Modal
          onClose={() => !bulkDeleting && setBulkDeleteOpen(false)}
          maxWidth="min(420px,94vw)"
          className="border-danger-border bg-danger-surface"
        >
          <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary-muted text-primary">
            <Trash2 size={16} aria-hidden="true" />
          </div>
          <ModalHeader>Delete selected videos?</ModalHeader>
          <p className="text-sm leading-6 text-muted-foreground">
            {selectedIds.size} video file(s) will be permanently deleted.
          </p>
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setBulkDeleteOpen(false)}
              disabled={bulkDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleDeleteSelected()}
              loading={bulkDeleting}
            >
              {bulkDeleting ? "Deleting…" : "Delete videos"}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

interface MenuActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

function MenuAction({
  icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: MenuActionProps) {
  return (
    <Button
      variant="ghost"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full justify-start px-3 py-2.5 text-left",
        danger
          ? "text-primary hover:bg-surface-hover hover:text-primary"
          : "text-foreground/90",
      )}
    >
      {icon}
      {label}
    </Button>
  );
}

interface CategoryPillProps {
  label: string;
  accent?: boolean;
}

function CategoryPill({ label, accent = false }: CategoryPillProps) {
  return (
    <span className="m-px inline-flex items-center gap-1 rounded-[20px] bg-surface-hover px-2 py-0.75 text-xs font-medium text-muted-foreground">
      <span
        className={`inline-block size-1.75 shrink-0 rounded-full ${accent ? "bg-primary" : "bg-muted"}`}
      />
      {label}
    </span>
  );
}
