import type { ReadingPassage } from "@/backend";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { countWords, splitHighlights } from "@/utils/text";
import { FileText, Highlighter, Minus, Plus, Trash2, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

const MIN_FONT = 15;
const MAX_FONT = 26;
const FONT_STEP = 1;

interface PassageViewProps {
  passage: ReadingPassage;
  highlights: string[];
  onAddHighlight: (phrase: string) => void;
  onRemoveHighlight: (phrase: string) => void;
  onClearHighlights: () => void;
  /** Public path to the source PDF, when one is linked to this passage. */
  pdfUrl?: string;
}

/**
 * Passage reader: adjustable font size, a selection-based highlighter that
 * persists marks for the session, and a link to the source PDF.
 */
export function PassageView({
  passage,
  highlights,
  onAddHighlight,
  onRemoveHighlight,
  onClearHighlights,
  pdfUrl,
}: PassageViewProps) {
  const [fontSize, setFontSize] = useState(18);
  const [pendingSelection, setPendingSelection] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  const captureSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setPendingSelection("");
      return;
    }
    const anchor = selection.anchorNode;
    if (!anchor || !bodyRef.current?.contains(anchor)) {
      setPendingSelection("");
      return;
    }
    const text = selection.toString().replace(/\s+/g, " ").trim();
    setPendingSelection(text.length >= 2 ? text : "");
  }, []);

  const applyHighlight = useCallback(() => {
    if (!pendingSelection) return;
    onAddHighlight(pendingSelection);
    window.getSelection()?.removeAllRanges();
    setPendingSelection("");
  }, [pendingSelection, onAddHighlight]);

  const segments = splitHighlights(passage.body, highlights);
  const wordCount = countWords(passage.body);

  return (
    <article
      data-ocid="reading.passage_panel"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={passage.level} />
          <span className="font-mono text-xs text-muted-foreground">
            {wordCount} words
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {passage.title}
        </h2>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-y border-border py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Text size
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            data-ocid="reading.font_decrease_button"
            aria-label="Decrease passage font size"
            disabled={fontSize <= MIN_FONT}
            onClick={() =>
              setFontSize((size) => Math.max(MIN_FONT, size - FONT_STEP))
            }
            className="size-8 rounded-full"
          >
            <Minus className="size-4" aria-hidden="true" />
          </Button>
          <span
            data-ocid="reading.font_size_value"
            className="w-12 text-center font-mono text-sm text-foreground"
          >
            {fontSize}px
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            data-ocid="reading.font_increase_button"
            aria-label="Increase passage font size"
            disabled={fontSize >= MAX_FONT}
            onClick={() =>
              setFontSize((size) => Math.min(MAX_FONT, size + FONT_STEP))
            }
            className="size-8 rounded-full"
          >
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            data-ocid="reading.highlight_button"
            disabled={!pendingSelection}
            onClick={applyHighlight}
            className="rounded-full"
          >
            <Highlighter className="size-4" aria-hidden="true" />
            Highlight selection
          </Button>
          {highlights.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid="reading.clear_highlights_button"
              onClick={onClearHighlights}
              className="rounded-full text-muted-foreground"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div
        ref={bodyRef}
        data-ocid="reading.passage_body"
        onMouseUp={captureSelection}
        onKeyUp={captureSelection}
        style={{ fontSize: `${fontSize}px` }}
        className="font-body leading-relaxed text-foreground"
      >
        {segments.map((segment, index) =>
          segment.highlighted ? (
            <mark
              key={`${segment.text}-${index}`}
              className="rounded bg-accent/25 px-0.5 text-foreground"
            >
              {segment.text}
            </mark>
          ) : (
            <span key={`${segment.text}-${index}`}>{segment.text}</span>
          ),
        )}
      </div>

      {pendingSelection && (
        <p
          data-ocid="reading.selection_hint"
          className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent"
        >
          Selected: “{pendingSelection}” — choose “Highlight selection” to mark
          it.
        </p>
      )}

      {highlights.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your highlights ({highlights.length})
          </span>
          <ul className="flex flex-wrap gap-2">
            {highlights.map((phrase) => (
              <li key={phrase}>
                <button
                  type="button"
                  data-ocid="reading.highlight_chip"
                  onClick={() => onRemoveHighlight(phrase)}
                  aria-label={`Remove highlight: ${phrase}`}
                  className={cn(
                    "inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent transition-smooth hover:border-destructive/60 hover:text-destructive",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <span className="max-w-[16rem] truncate">{phrase}</span>
                  <X className="size-3 shrink-0" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          data-ocid="reading.pdf_link"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <FileText className="size-4" aria-hidden="true" />
          Open source PDF
        </a>
      )}
    </article>
  );
}
