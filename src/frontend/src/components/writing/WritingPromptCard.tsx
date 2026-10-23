import type { WritingDraft, WritingPrompt } from "@/backend";
import { GlowCard } from "@/components/effects/GlowCard";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Textarea } from "@/components/ui/textarea";
import { ModelAnswer } from "@/components/writing/ModelAnswer";
import { WordCounter } from "@/components/writing/WordCounter";
import { useSaveDraft } from "@/hooks/useQueries";
import { useDraftsStore } from "@/store/draftsStore";
import { countWords } from "@/utils/text";
import { formatTimestamp } from "@/utils/time";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface WritingPromptCardProps {
  prompt: WritingPrompt;
  /** Backend draft for this prompt, when one has been saved. */
  serverDraft?: WritingDraft;
  /** 1-based position used for deterministic test markers. */
  index: number;
}

const AUTOSAVE_DELAY_MS = 900;

/**
 * One writing prompt: level badge, target range, an autosaving editor with a
 * live word counter, and a collapsible model answer.
 *
 * Draft text is owned by local state and mirrored into the shared drafts store
 * on every keystroke, so work survives a refresh. The backend draft endpoints
 * are written on a short debounce and flushed when the editor loses focus.
 */
export function WritingPromptCard({
  prompt,
  serverDraft,
  index,
}: WritingPromptCardProps) {
  const promptId = Number(prompt.id);
  const minWords = Number(prompt.minWords);
  const maxWords = Number(prompt.maxWords);

  const storedDraft = useDraftsStore((state) => state.drafts[promptId]);
  const saveLocalDraft = useDraftsStore((state) => state.saveDraft);
  const deleteLocalDraft = useDraftsStore((state) => state.deleteDraft);

  const saveDraft = useSaveDraft();

  const initialText = storedDraft?.text ?? serverDraft?.text ?? "";
  const [text, setText] = useState(initialText);
  const [savedAt, setSavedAt] = useState<number | null>(
    storedDraft?.updatedAt ?? null,
  );
  const [showSaved, setShowSaved] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFlashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTextRef = useRef(text);
  latestTextRef.current = text;

  const wordCount = useMemo(() => countWords(text), [text]);

  const flushToBackend = (value: string) => {
    saveDraft.mutate(
      {
        promptId: prompt.id,
        text: value,
        updatedAt: BigInt(Date.now()) * 1_000_000n,
      },
      {
        onSuccess: () => {
          setShowSaved(true);
          if (savedFlashRef.current) clearTimeout(savedFlashRef.current);
          savedFlashRef.current = setTimeout(() => setShowSaved(false), 2000);
        },
      },
    );
  };

  const handleChange = (value: string) => {
    setText(value);
    saveLocalDraft(promptId, value);
    setSavedAt(Date.now());
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => flushToBackend(value),
      AUTOSAVE_DELAY_MS,
    );
  };

  const handleBlur = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    flushToBackend(latestTextRef.current);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setText("");
    deleteLocalDraft(promptId);
    setSavedAt(null);
    flushToBackend("");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedFlashRef.current) clearTimeout(savedFlashRef.current);
    };
  }, []);

  const statusLabel = saveDraft.isPending
    ? "Saving…"
    : showSaved
      ? "Saved"
      : savedAt
        ? `Saved ${formatTimestamp(BigInt(savedAt) * 1_000_000n, "")}`
        : "Not saved yet";

  return (
    <div data-ocid={`writing.prompt_card.${index}`}>
      <GlowCard className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <LevelBadge level={prompt.level} />
              <span className="font-mono text-xs text-muted-foreground">
                {minWords}–{maxWords} words
              </span>
            </div>
            <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
              {prompt.title}
            </h3>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {prompt.prompt}
        </p>

        <div className="flex flex-col gap-3">
          <label
            htmlFor={`writing-editor-${promptId}`}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Your response
          </label>
          <Textarea
            id={`writing-editor-${promptId}`}
            data-ocid={`writing.editor.${index}`}
            value={text}
            onChange={(event) => handleChange(event.target.value)}
            onBlur={handleBlur}
            placeholder="Start writing your response here. Your draft saves automatically."
            className="min-h-40 resize-y bg-background/60 text-sm leading-relaxed"
          />

          <WordCounter
            count={wordCount}
            minWords={minWords}
            maxWords={maxWords}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              data-ocid={`writing.save_status.${index}`}
              aria-live="polite"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              {saveDraft.isPending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : showSaved ? (
                <Check className="size-3.5 text-success" aria-hidden="true" />
              ) : null}
              {statusLabel}
            </p>
            <button
              type="button"
              data-ocid={`writing.clear_button.${index}`}
              onClick={handleClear}
              disabled={text.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-smooth hover:border-destructive/60 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Clear draft
            </button>
          </div>
        </div>

        <ModelAnswer answer={prompt.modelAnswer} value={`model-${promptId}`} />
      </GlowCard>
    </div>
  );
}
