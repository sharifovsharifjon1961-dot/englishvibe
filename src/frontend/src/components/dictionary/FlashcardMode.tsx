import type { SavedWord } from "@/backend";
import { GlowCard } from "@/components/effects/GlowCard";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw, X } from "lucide-react";
import { useState } from "react";

interface FlashcardModeProps {
  words: SavedWord[];
  onClose: () => void;
}

/** Flip-and-next flashcard review over the student's saved words. */
export function FlashcardMode({ words, onClose }: FlashcardModeProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const total = words.length;
  const current = words[index];

  const goTo = (next: number) => {
    setFlipped(false);
    setIndex(((next % total) + total) % total);
  };

  if (!current) return null;

  return (
    <div
      data-ocid="dictionary.flashcard_modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
    >
      <GlowCard
        lift={false}
        className="flex w-full max-w-xl flex-col gap-6 p-6 md:p-8"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Card {index + 1} / {total}
          </span>
          <button
            type="button"
            data-ocid="dictionary.flashcard_close_button"
            onClick={onClose}
            aria-label="Close flashcard review"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          data-ocid="dictionary.flashcard_card"
          onClick={() => setFlipped((value) => !value)}
          aria-label={
            flipped
              ? `Hide definition of ${current.word}`
              : `Reveal definition of ${current.word}`
          }
          className="flex min-h-56 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/40 px-6 py-10 text-center transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {!flipped ? (
            <>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {current.word}
                </span>
                {current.level && <LevelBadge level={current.level} />}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-accent">
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Tap to reveal
              </span>
            </>
          ) : (
            <p className="text-base text-foreground md:text-lg">
              {current.definition}
            </p>
          )}
        </button>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            data-ocid="dictionary.flashcard_prev_button"
            onClick={() => goTo(index - 1)}
            className="rounded-full px-5"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Previous
          </Button>
          <Button
            type="button"
            data-ocid="dictionary.flashcard_flip_button"
            variant="secondary"
            onClick={() => setFlipped((value) => !value)}
            className="rounded-full px-5"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Flip
          </Button>
          <Button
            type="button"
            data-ocid="dictionary.flashcard_next_button"
            onClick={() => goTo(index + 1)}
            className="btn-neon rounded-full px-5"
          >
            Next
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </GlowCard>
    </div>
  );
}
