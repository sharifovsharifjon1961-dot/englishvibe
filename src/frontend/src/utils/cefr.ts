import { CefrLevel } from "@/backend";
import cefrWords from "@/data/cefrWords.json";
import { normalizeWord } from "@/utils/text";

const levelMap = cefrWords as Record<string, string>;

/**
 * Estimates the CEFR level of a word from the local dataset. Returns
 * `undefined` when the word is not in the dataset so callers can show a
 * neutral badge instead of guessing.
 */
export function estimateWordLevel(word: string): CefrLevel | undefined {
  const key = normalizeWord(word);
  if (!key) return undefined;
  const raw = levelMap[key];
  if (raw === "b1") return CefrLevel.b1;
  if (raw === "b2") return CefrLevel.b2;
  if (raw === "c1") return CefrLevel.c1;
  return undefined;
}

/**
 * Estimates the CEFR level of a whole text from the share of B1/B2/C1 words
 * it contains. Used by the mock-test result summary.
 */
export function estimateTextLevel(text: string): CefrLevel {
  const words = text
    .toLowerCase()
    .split(/[^a-z'-]+/)
    .filter((w) => w.length > 2);
  if (words.length === 0) return CefrLevel.b1;

  let b2 = 0;
  let c1 = 0;
  for (const word of words) {
    const level = levelMap[word];
    if (level === "b2") b2 += 1;
    else if (level === "c1") c1 += 1;
  }

  const advanced = (b2 + c1 * 2) / words.length;
  if (advanced > 0.35) return CefrLevel.c1;
  if (advanced > 0.18) return CefrLevel.b2;
  return CefrLevel.b1;
}

/**
 * Estimates a CEFR level from a percentage score on a practice set.
 */
export function estimateScoreLevel(percent: number): CefrLevel {
  if (percent >= 80) return CefrLevel.c1;
  if (percent >= 60) return CefrLevel.b2;
  return CefrLevel.b1;
}
