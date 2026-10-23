import { CefrLevel } from "@/backend";
import type { CefrLevel as CefrLevelType } from "@/backend";
import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { WritingPromptCard } from "@/components/writing/WritingPromptCard";
import { useDrafts, useWritingPrompts } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { AlertTriangle, PenLine } from "lucide-react";
import { useMemo, useState } from "react";

type LevelFilter = "all" | CefrLevelType;

const levelFilters: { value: LevelFilter; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: CefrLevel.b1, label: "B1" },
  { value: CefrLevel.b2, label: "B2" },
  { value: CefrLevel.c1, label: "C1" },
];

export default function WritingPage() {
  const promptsQuery = useWritingPrompts();
  const draftsQuery = useDrafts();
  const [level, setLevel] = useState<LevelFilter>("all");

  const prompts = promptsQuery.data ?? [];
  const drafts = draftsQuery.data ?? [];

  const draftByPromptId = useMemo(() => {
    const map = new Map<number, (typeof drafts)[number]>();
    for (const draft of drafts) {
      map.set(Number(draft.promptId), draft);
    }
    return map;
  }, [drafts]);

  const visiblePrompts = useMemo(
    () =>
      level === "all"
        ? prompts
        : prompts.filter((prompt) => prompt.level === level),
    [prompts, level],
  );

  const isLoading = promptsQuery.isLoading || draftsQuery.isLoading;
  const isError = promptsQuery.isError;

  return (
    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Module"
        title="Writing"
        description="Essay prompts with a live word counter, autosaved drafts and model answers."
      />

      <section className="mt-8 flex flex-col gap-6">
        <fieldset
          aria-label="Filter prompts by CEFR level"
          className="flex flex-wrap gap-2 border-0 p-0"
        >
          {levelFilters.map((filter) => {
            const active = level === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                data-ocid={`writing.level_filter.${filter.value}`}
                aria-pressed={active}
                onClick={() => setLevel(filter.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </fieldset>

        {isLoading ? (
          <div data-ocid="writing.loading_state">
            <CardGridSkeleton count={4} />
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            title="Could not load prompts"
            description="The writing prompts did not load. Check your connection and try again."
            action={
              <button
                type="button"
                data-ocid="writing.retry_button"
                onClick={() => void promptsQuery.refetch()}
                className="btn-neon inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Try again
              </button>
            }
          />
        ) : visiblePrompts.length === 0 ? (
          <EmptyState
            icon={PenLine}
            title="No prompts at this level"
            description="There are no writing prompts for the selected level yet. Choose another level to keep practising."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {visiblePrompts.map((prompt, index) => (
              <WritingPromptCard
                key={String(prompt.id)}
                prompt={prompt}
                serverDraft={draftByPromptId.get(Number(prompt.id))}
                index={index + 1}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
