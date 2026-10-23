import type { MatchingQuestion } from "@/backend";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface MatchingQuestionCardProps {
  question: MatchingQuestion;
  /** Selected right-option index per left item, or null when unset. */
  selections: (number | null)[];
  checked: boolean;
  onSelect: (leftIndex: number, rightIndex: number) => void;
  onCheck: () => void;
  onReset: () => void;
}

/** Matching question: pair each left item with a right option and get feedback. */
export function MatchingQuestionCard({
  question,
  selections,
  checked,
  onSelect,
  onCheck,
  onReset,
}: MatchingQuestionCardProps) {
  const allAnswered = selections.every((value) => value !== null);
  const correctCount = question.correctRightIndex.filter(
    (rightIndex, leftIndex) => Number(rightIndex) === selections[leftIndex],
  ).length;

  return (
    <li
      data-ocid="reading.matching_question"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-semibold text-accent">
          {question.id.toString()}
        </span>
        <p className="font-medium text-foreground">{question.prompt}</p>
      </div>

      <ul className="flex flex-col gap-3">
        {question.left.map((leftItem, leftIndex) => {
          const selected = selections[leftIndex];
          const correctIndex = Number(question.correctRightIndex[leftIndex]);
          const isRowCorrect = checked && selected === correctIndex;
          const isRowWrong =
            checked && selected !== null && selected !== correctIndex;
          const selectId = `match-${question.id.toString()}-${leftIndex}`;
          return (
            <li
              key={leftItem}
              data-ocid={`reading.matching_row.${leftIndex}`}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:gap-3",
                isRowCorrect
                  ? "border-success/60 bg-success/10"
                  : isRowWrong
                    ? "border-destructive/60 bg-destructive/10"
                    : "border-border bg-background",
              )}
            >
              <label
                htmlFor={selectId}
                className="flex-1 text-sm font-medium text-foreground"
              >
                {leftItem}
              </label>
              <div className="flex items-center gap-2 sm:w-64">
                <select
                  id={selectId}
                  data-ocid={`reading.matching_select.${leftIndex}`}
                  value={selected === null ? "" : String(selected)}
                  disabled={checked}
                  onChange={(event) =>
                    onSelect(leftIndex, Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70"
                >
                  <option value="" disabled>
                    Choose a match…
                  </option>
                  {question.right.map((rightItem, rightIndex) => (
                    <option key={rightItem} value={rightIndex}>
                      {rightItem}
                    </option>
                  ))}
                </select>
                {isRowCorrect && (
                  <Check
                    className="size-4 shrink-0 text-success"
                    aria-label="Correct match"
                  />
                )}
                {isRowWrong && (
                  <X
                    className="size-4 shrink-0 text-destructive"
                    aria-label="Incorrect match"
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        {!checked ? (
          <button
            type="button"
            data-ocid="reading.matching_check_button"
            disabled={!allAnswered}
            onClick={onCheck}
            className="btn-neon-accent inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-smooth disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Check matches
          </button>
        ) : (
          <button
            type="button"
            data-ocid="reading.matching_retry_button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try again
          </button>
        )}
      </div>

      {checked && (
        <p
          data-ocid="reading.matching_feedback"
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            correctCount === question.left.length
              ? "border-success/40 bg-success/10 text-foreground"
              : "border-warning/40 bg-warning/10 text-foreground",
          )}
        >
          <span className="font-semibold">
            {correctCount} of {question.left.length} correct.
          </span>{" "}
          {correctCount === question.left.length
            ? "Every pair matches."
            : "Review the highlighted rows and try again."}
        </p>
      )}
    </li>
  );
}
