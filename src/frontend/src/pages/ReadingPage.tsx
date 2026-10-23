import type { ReadingPassage } from "@/backend";
import { ChoiceQuestionCard } from "@/components/reading/ChoiceQuestionCard";
import { MatchingQuestionCard } from "@/components/reading/MatchingQuestionCard";
import { PassageList } from "@/components/reading/PassageList";
import { PassageView } from "@/components/reading/PassageView";
import { ReadingTimer } from "@/components/reading/ReadingTimer";
import { useHighlighter } from "@/components/reading/useHighlighter";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { usePassages } from "@/hooks/useQueries";
import { BookOpen, ListChecks } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

/** Source PDFs copied from the uploaded reading materials, in seed order. */
const PASSAGE_PDFS = [
  "/assets/reading/reading_1.pdf",
  "/assets/reading/reading_4.pdf",
  "/assets/reading/reading_5.pdf",
  "/assets/reading/reading_6.pdf",
  "/assets/reading/reading_7.pdf",
  "/assets/reading/reading_8.pdf",
  "/assets/reading/reading_9.pdf",
  "/assets/reading/reading_10.pdf",
];

interface ChoiceState {
  selectedIndex: number | null;
  checked: boolean;
}

interface MatchingState {
  selections: (number | null)[];
  checked: boolean;
}

function emptyChoiceState(
  passage: ReadingPassage,
): Record<string, ChoiceState> {
  return Object.fromEntries(
    passage.choiceQuestions.map((question) => [
      question.id.toString(),
      { selectedIndex: null, checked: false },
    ]),
  );
}

function emptyMatchingState(
  passage: ReadingPassage,
): Record<string, MatchingState> {
  return Object.fromEntries(
    passage.matchingQuestions.map((question) => [
      question.id.toString(),
      { selections: question.left.map(() => null), checked: false },
    ]),
  );
}

export default function ReadingPage() {
  const { data: passages, isLoading } = usePassages();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [choiceState, setChoiceState] = useState<Record<string, ChoiceState>>(
    {},
  );
  const [matchingState, setMatchingState] = useState<
    Record<string, MatchingState>
  >({});

  const list = useMemo(() => passages ?? [], [passages]);

  useEffect(() => {
    if (list.length === 0) return;
    setActiveId((current) => {
      if (current && list.some((p) => p.id.toString() === current)) {
        return current;
      }
      return list[0].id.toString();
    });
  }, [list]);

  const activeIndex = list.findIndex((p) => p.id.toString() === activeId);
  const activePassage = activeIndex >= 0 ? list[activeIndex] : null;

  const { highlights, addHighlight, removeHighlight, clearHighlights } =
    useHighlighter(activeId ?? "none");

  useEffect(() => {
    if (!activePassage) return;
    setChoiceState(emptyChoiceState(activePassage));
    setMatchingState(emptyMatchingState(activePassage));
  }, [activePassage]);

  const handleSelectChoice = useCallback(
    (questionId: string, index: number) => {
      setChoiceState((current) => ({
        ...current,
        [questionId]: { selectedIndex: index, checked: false },
      }));
    },
    [],
  );

  const handleCheckChoice = useCallback((questionId: string) => {
    setChoiceState((current) => {
      const entry = current[questionId];
      if (!entry) return current;
      return { ...current, [questionId]: { ...entry, checked: true } };
    });
  }, []);

  const handleResetChoice = useCallback((questionId: string) => {
    setChoiceState((current) => ({
      ...current,
      [questionId]: { selectedIndex: null, checked: false },
    }));
  }, []);

  const handleSelectMatch = useCallback(
    (questionId: string, leftIndex: number, rightIndex: number) => {
      setMatchingState((current) => {
        const entry = current[questionId];
        if (!entry) return current;
        const selections = [...entry.selections];
        selections[leftIndex] = rightIndex;
        return {
          ...current,
          [questionId]: { selections, checked: false },
        };
      });
    },
    [],
  );

  const handleCheckMatch = useCallback((questionId: string) => {
    setMatchingState((current) => {
      const entry = current[questionId];
      if (!entry) return current;
      return { ...current, [questionId]: { ...entry, checked: true } };
    });
  }, []);

  const handleResetMatch = useCallback(
    (questionId: string, leftCount: number) => {
      setMatchingState((current) => ({
        ...current,
        [questionId]: {
          selections: Array.from({ length: leftCount }, () => null),
          checked: false,
        },
      }));
    },
    [],
  );

  const pdfUrl =
    activeIndex >= 0 && activeIndex < PASSAGE_PDFS.length
      ? PASSAGE_PDFS[activeIndex]
      : undefined;

  return (
    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Module"
        title="Reading"
        description="Read a graded passage, highlight key phrases, time your session and answer multiple-choice and matching questions."
      />

      {isLoading && (
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="mt-10">
          <EmptyState
            icon={BookOpen}
            title="No passages yet"
            description="Reading passages will appear here once your teacher publishes them from the admin dashboard."
          />
        </div>
      )}

      {!isLoading && list.length > 0 && activePassage && (
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,1.1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PassageList
              passages={list}
              activeId={activeId}
              onSelect={setActiveId}
            />
          </aside>

          <div className="flex flex-col gap-6">
            <PassageView
              passage={activePassage}
              highlights={highlights}
              onAddHighlight={addHighlight}
              onRemoveHighlight={removeHighlight}
              onClearHighlights={clearHighlights}
              pdfUrl={pdfUrl}
            />
            <ReadingTimer />
          </div>

          <section
            data-ocid="reading.questions_panel"
            aria-label="Questions"
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <ListChecks className="size-5 text-accent" aria-hidden="true" />
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                Questions
              </h2>
            </div>

            {activePassage.choiceQuestions.length === 0 &&
              activePassage.matchingQuestions.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
                  This passage has no questions yet.
                </p>
              )}

            {activePassage.choiceQuestions.length > 0 && (
              <ul className="flex flex-col gap-4">
                {activePassage.choiceQuestions.map((question) => {
                  const key = question.id.toString();
                  const state = choiceState[key] ?? {
                    selectedIndex: null,
                    checked: false,
                  };
                  return (
                    <ChoiceQuestionCard
                      key={key}
                      question={question}
                      selectedIndex={state.selectedIndex}
                      checked={state.checked}
                      onSelect={(index) => handleSelectChoice(key, index)}
                      onCheck={() => handleCheckChoice(key)}
                      onReset={() => handleResetChoice(key)}
                    />
                  );
                })}
              </ul>
            )}

            {activePassage.matchingQuestions.length > 0 && (
              <ul className="flex flex-col gap-4">
                {activePassage.matchingQuestions.map((question) => {
                  const key = question.id.toString();
                  const state = matchingState[key] ?? {
                    selections: question.left.map(() => null),
                    checked: false,
                  };
                  return (
                    <MatchingQuestionCard
                      key={key}
                      question={question}
                      selections={state.selections}
                      checked={state.checked}
                      onSelect={(leftIndex, rightIndex) =>
                        handleSelectMatch(key, leftIndex, rightIndex)
                      }
                      onCheck={() => handleCheckMatch(key)}
                      onReset={() =>
                        handleResetMatch(key, question.left.length)
                      }
                    />
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
