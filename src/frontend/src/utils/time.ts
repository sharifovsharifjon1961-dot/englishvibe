/**
 * Converts a Motoko nanosecond timestamp to a JavaScript Date.
 * Returns `null` when the value cannot be represented.
 */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats a nanosecond timestamp as a short local date, or a fallback. */
export function formatTimestamp(timestamp: bigint, fallback = "—"): string {
  const date = timestampToDate(timestamp);
  if (!date) return fallback;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
