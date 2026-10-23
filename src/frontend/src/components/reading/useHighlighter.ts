import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "cefr-reading-highlights:";

function readStored(passageId: string): string[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + passageId);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export interface HighlighterControls {
  highlights: string[];
  addHighlight: (phrase: string) => void;
  removeHighlight: (phrase: string) => void;
  clearHighlights: () => void;
}

/**
 * Session-scoped text highlighter. Marks are stored per passage in
 * `sessionStorage` so they survive navigation within the tab but reset when
 * the session ends. This is UI state, not backend-owned data.
 */
export function useHighlighter(passageId: string): HighlighterControls {
  const [highlights, setHighlights] = useState<string[]>([]);

  useEffect(() => {
    setHighlights(readStored(passageId));
  }, [passageId]);

  const persist = useCallback(
    (next: string[]) => {
      setHighlights(next);
      try {
        window.sessionStorage.setItem(
          STORAGE_PREFIX + passageId,
          JSON.stringify(next),
        );
      } catch {
        /* storage unavailable — keep in-memory marks */
      }
    },
    [passageId],
  );

  const addHighlight = useCallback(
    (phrase: string) => {
      const cleaned = phrase.replace(/\s+/g, " ").trim();
      if (cleaned.length < 2) return;
      setHighlights((current) => {
        if (
          current.some((item) => item.toLowerCase() === cleaned.toLowerCase())
        ) {
          return current;
        }
        const next = [...current, cleaned];
        try {
          window.sessionStorage.setItem(
            STORAGE_PREFIX + passageId,
            JSON.stringify(next),
          );
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [passageId],
  );

  const removeHighlight = useCallback(
    (phrase: string) => {
      persist(
        highlights.filter(
          (item) => item.toLowerCase() !== phrase.toLowerCase(),
        ),
      );
    },
    [highlights, persist],
  );

  const clearHighlights = useCallback(() => persist([]), [persist]);

  return { highlights, addHighlight, removeHighlight, clearHighlights };
}
