import type { CefrLevel } from "@/backend";

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Splits `text` into segments around every case-insensitive occurrence of the
 * given highlight phrases, so a renderer can wrap matches in a `<mark>`.
 */
export function splitHighlights(
  text: string,
  phrases: string[],
): HighlightSegment[] {
  const cleaned = phrases.map((p) => p.trim()).filter((p) => p.length > 0);
  if (cleaned.length === 0) return [{ text, highlighted: false }];

  const escaped = cleaned
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      highlighted: cleaned.some((p) => p.toLowerCase() === part.toLowerCase()),
    }));
}

/** Counts words in a passage of text, ignoring extra whitespace. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

/** Normalizes a word for dictionary lookup and comparison. */
export function normalizeWord(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/[^a-z'-]/g, "");
}

/** Maps a CEFR level to its display label. */
export function levelLabel(level: CefrLevel): string {
  return level.toUpperCase();
}
