import type { SavedWord } from "@/backend";
import { GlowCard } from "@/components/effects/GlowCard";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/utils/time";
import { Layers, Trash2 } from "lucide-react";

interface SavedWordsPanelProps {
  words: SavedWord[];
  onRemove: (word: string) => void;
  onStartReview: () => void;
  removingWord: string | null;
}

/** Personal saved-word list with a shortcut into flashcard review. */
export function SavedWordsPanel({
  words,
  onRemove,
  onStartReview,
  removingWord,
}: SavedWordsPanelProps) {
  return (
    <GlowCard lift={false} className="flex flex-col gap-5 p-6">
      <div data-ocid="dictionary.saved_panel" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Layers className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Saved words
              </h2>
              <p className="text-xs text-muted-foreground">
                {words.length === 0
                  ? "Nothing saved yet"
                  : `${words.length} word${words.length === 1 ? "" : "s"} in your list`}
              </p>
            </div>
          </div>
          <Button
            type="button"
            data-ocid="dictionary.review_button"
            onClick={onStartReview}
            disabled={words.length === 0}
            className="btn-neon rounded-full px-5 text-sm font-semibold"
          >
            Review flashcards
          </Button>
        </div>

        {words.length > 0 && (
          <ul
            data-ocid="dictionary.saved_list"
            className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1"
          >
            {words.map((word, index) => (
              <li
                key={word.word}
                data-ocid={`dictionary.saved_item.${index + 1}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-semibold text-foreground">
                      {word.word}
                    </span>
                    {word.level && <LevelBadge level={word.level} />}
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {word.definition}
                  </p>
                  <time className="font-mono text-xs text-muted-foreground">
                    {formatTimestamp(word.savedAt)}
                  </time>
                </div>
                <button
                  type="button"
                  data-ocid={`dictionary.remove_button.${index + 1}`}
                  onClick={() => onRemove(word.word)}
                  disabled={removingWord === word.word}
                  aria-label={`Remove ${word.word} from saved words`}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-destructive/15 hover:text-destructive disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlowCard>
  );
}
