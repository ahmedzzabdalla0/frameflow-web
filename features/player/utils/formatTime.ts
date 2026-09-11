export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  return (
    Math.floor(seconds / 60) +
    ":" +
    String(Math.floor(seconds % 60)).padStart(2, "0")
  );
}

export function formatDurationCompact(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "--:--";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatSeekTime(seconds: number): string {
  const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
  return `${pad(seconds / 3600)}:${pad((seconds % 3600) / 60)}:${pad(seconds % 60)}`;
}
