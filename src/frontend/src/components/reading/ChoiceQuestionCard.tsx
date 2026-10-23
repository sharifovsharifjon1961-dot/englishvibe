import type { ChoiceQuestion } from "@/backend";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface ChoiceQuestionCardProps {
  question: ChoiceQuestion;
  /** Index of the option the learner picked, or null when unanswered. */
  selectedIndex: number | null;
  /** Whether the learner has submitted this question for feedback. */
  checked: boolean;
  onSelect: (index: number) => void;
  onCheck: () => void;
  onReset: () => void;
}

/** Multiple-choice question with answer selection and per-option feedback. */
export function ChoiceQuestionCard({
  question,
  selectedIndex,
  checked,
  onSelect,
  onCheck,
  onReset,
}: ChoiceQuestionCardProps) {
  const correctIndex = Number(question.correctIndex);
  const isCorrect = checked && selectedIndex === correctIndex;

  return (
    <li
      data-ocid="reading.choice_question"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary">
          {question.id.toString()}
        </span>
        <p className="font-medium text-foreground">{question.prompt}</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">{question.prompt}</legend>
        {question.options.map((option, index) => {
          const selected = selectedIndex === index;
          const showCorrect = checked && index === correctIndex;
          const showWrong = checked && selected && index !== correctIndex;
          return (
            <label
              key={option}
              data-ocid={`reading.choice_option.${index}`}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-smooth",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
                showCorrect
                  ? "border-success/60 bg-success/10 text-foreground"
                  : showWrong
                    ? "border-destructive/60 bg-destructive/10 text-foreground"
                    : selected
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border bg-background hover:border-primary/40",
              )}
            >
              <input
                type="radio"
                name={`choice-${question.id.toString()}`}
                value={index}
                checked={selected}
                disabled={checked}
                onChange={() => onSelect(index)}
                className="size-4 accent-[oklch(var(--primary))]"
              />
              <span className="flex-1">{option}</span>
              {showCorrect && (
                <Check
                  className="size-4 shrink-0 text-success"
                  aria-label="Correct answer"
                />
              )}
              {showWrong && (
                <X
                  className="size-4 shrink-0 text-destructive"
                  aria-label="Incorrect answer"
                />
              )}
            </label>
          );
        })}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        {!checked ? (
          <button
            type="button"
            data-ocid="reading.choice_check_button"
            disabled={selectedIndex === null}
            onClick={onCheck}
            className="btn-neon inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-smooth disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Check answer
          </button>
        ) : (
          <button
            type="button"
            data-ocid="reading.choice_retry_button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try again
          </button>
        )}
      </div>

      {checked && (
        <p
          data-ocid="reading.choice_feedback"
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            isCorrect
              ? "border-success/40 bg-success/10 text-foreground"
              : "border-destructive/40 bg-destructive/10 text-foreground",
          )}
        >
          <span className="font-semibold">
            {isCorrect ? "Correct. " : "Not quite. "}
          </span>
          {question.explanation}
        </p>
      )}
    </li>
  );
}
