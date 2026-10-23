import type { TestQuestion } from "@/backend";
import { Variant_choice_matching } from "@/backend";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/** Answer value for a question: a choice index or a left→right index map. */
export type AnswerValue = number | number[];

interface QuestionViewProps {
  question: TestQuestion;
  index: number;
  total: number;
  answer: AnswerValue | undefined;
  onAnswer: (value: AnswerValue) => void;
}

/** Renders one question — multiple-choice or matching — with its controls. */
export function QuestionView({
  question,
  index,
  total,
  answer,
  onAnswer,
}: QuestionViewProps) {
  return (
    <div
      data-ocid={`tests.question.${index + 1}`}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-wider text-accent">
          Question {index + 1} of {total}
        </span>
      </div>

      {question.kind === Variant_choice_matching.choice && question.choice ? (
        <ChoiceView
          prompt={question.choice.prompt}
          options={question.choice.options}
          selected={typeof answer === "number" ? answer : undefined}
          onSelect={onAnswer}
        />
      ) : question.matching ? (
        <MatchingView
          prompt={question.matching.prompt}
          left={question.matching.left}
          right={question.matching.right}
          selected={Array.isArray(answer) ? answer : undefined}
          onSelect={onAnswer}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          This question has no content yet.
        </p>
      )}
    </div>
  );
}

function ChoiceView({
  prompt,
  options,
  selected,
  onSelect,
}: {
  prompt: string;
  options: string[];
  selected: number | undefined;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium leading-relaxed text-foreground">
        {prompt}
      </p>
      <fieldset className="flex flex-col gap-2.5">
        <legend className="sr-only">Answer options</legend>
        {options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          return (
            <label
              key={option}
              data-ocid={`tests.option.${optionIndex + 1}`}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-smooth has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
                isSelected
                  ? "border-primary/60 bg-primary/10 text-foreground shadow-[0_0_18px_-6px_oklch(var(--primary)/0.7)]"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name="choice-option"
                className="sr-only"
                checked={isSelected}
                onChange={() => onSelect(optionIndex)}
              />
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {isSelected ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  String.fromCharCode(65 + optionIndex)
                )}
              </span>
              <span className="min-w-0 flex-1">{option}</span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}

function MatchingView({
  prompt,
  left,
  right,
  selected,
  onSelect,
}: {
  prompt: string;
  left: string[];
  right: string[];
  selected: number[] | undefined;
  onSelect: (value: number[]) => void;
}) {
  const current = selected ?? left.map(() => -1);

  const setMatch = (leftIndex: number, rightIndex: number) => {
    const next = [...current];
    next[leftIndex] = next[leftIndex] === rightIndex ? -1 : rightIndex;
    onSelect(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium leading-relaxed text-foreground">
        {prompt}
      </p>
      <p className="text-xs text-muted-foreground">
        Select the option on the right that matches each item on the left.
      </p>
      <div className="flex flex-col gap-3">
        {left.map((leftItem, leftIndex) => (
          <div
            key={leftItem}
            className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
              {leftItem}
            </span>
            <div className="flex flex-wrap gap-2">
              {right.map((rightItem, rightIndex) => {
                const isSelected = current[leftIndex] === rightIndex;
                return (
                  <button
                    key={rightItem}
                    type="button"
                    aria-pressed={isSelected}
                    data-ocid={`tests.match.${leftIndex + 1}.${rightIndex + 1}`}
                    onClick={() => setMatch(leftIndex, rightIndex)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isSelected
                        ? "border-accent/60 bg-accent/15 text-accent"
                        : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground",
                    )}
                  >
                    {rightItem}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
