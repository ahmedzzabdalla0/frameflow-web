"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SortDirection, SortField } from "@/types/player";

interface GalleryToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortFieldChange: (value: SortField) => void;
  onSortDirectionChange: (value: SortDirection) => void;
}

export default function GalleryToolbar({
  searchTerm,
  onSearchTermChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
}: GalleryToolbarProps) {
  return (
    <div className="z-6 mb-2.5 grid min-w-0 grid-cols-1 gap-2 bg-linear-to-b from-[rgba(17,17,17,0.98)] to-[rgba(17,17,17,0.92)] px-1.5 py-2.5 backdrop-blur-xs sm:grid-cols-[minmax(0,1fr)_auto_auto]">
      <Input
        type="search"
        placeholder="Search by title"
        autoComplete="off"
        spellCheck={false}
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="h-9.5"
      />
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:contents">
        <Select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as SortField)}
          aria-label="Sort by"
          className="h-9.5 sm:w-37.5"
        >
          <option value="disabled">Sort: Disabled</option>
          <option value="date">Added date</option>
          <option value="title">Title</option>
          <option value="size">File size</option>
          <option value="duration">Duration</option>
          <option value="rating">Rating</option>
        </Select>
        <Select
          value={sortDirection}
          onChange={(e) => onSortDirectionChange(e.target.value as SortDirection)}
          aria-label="Sort direction"
          className="h-9.5 sm:w-32.5"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </Select>
      </div>
    </div>
  );
}
