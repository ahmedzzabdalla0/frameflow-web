export interface LoopedSlide {
  relPath: string;
  key: string;
  isClone: boolean;
}

export function buildLoopedSlides(playlist: string[]): LoopedSlide[] {
  const total = playlist.length;

  if (total === 0) return [];
  if (total === 1) {
    return [{ relPath: playlist[0], key: "real-0", isClone: false }];
  }

  return [
    { relPath: playlist[total - 1], key: "clone-last", isClone: true },
    ...playlist.map((p, i) => ({ relPath: p, key: `real-${i}`, isClone: false })),
    { relPath: playlist[0], key: "clone-first", isClone: true },
  ];
}
