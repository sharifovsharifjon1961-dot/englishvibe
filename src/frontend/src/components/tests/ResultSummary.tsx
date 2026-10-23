import type { MockTest } from "@/backend";
import { Variant_choice_matching } from "@/backend";
import type { AnswerValue } from "@/components/tests/QuestionView";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { estimateScoreLevel } from "@/utils/cefr";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

interface ResultSummaryProps {
  test: MockTest;
  answers: Record<number, AnswerValue>;
  onRetake: () => void;
  onExit: () => void;
}

interface GradedQuestion {
  index: number;
  prompt: string;
  correct: boolean;
  answered: boolean;
  correctText: string;
  givenText: string;
  explanation?: string;
}

/** Grades a single question against the learner's answer. */
function gradeQuestion(
  test: MockTest,
  index: number,
  answer: AnswerValue | undefined,
): GradedQuestion {
  const question = test.questions[index];
  const base = {
    index,
    prompt: "",
    correct: false,
    answered: answer !== undefined,
  };

  if (question.kind === Variant_choice_matching.choice && question.choice) {
    const { prompt, options, correctIndex, explanation } = question.choice;
    const given = typeof answer === "number" ? answer : undefined;
    return {
      ...base,
      prompt,
      correct: given === Number(correctIndex),
      correctText: options[Number(correctIndex)] ?? "—",
      givenText: given !== undefined ? (options[given] ?? "—") : "Not answered",
      explanation,
    };
  }

  if (question.matching) {
    const { prompt, left, right, correctRightIndex } = question.matching;
    const given = Array.isArray(answer) ? answer : [];
    const correct =
      given.length === left.length &&
      left.every((_, i) => given[i] === Number(correctRightIndex[i]));
    return {
      ...base,
      prompt,
      correct,
      correctText: left
        .map(
          (item, i) =>
            `${item} → ${right[Number(correctRightIndex[i])] ?? "—"}`,
        )
        .join("; "),
      givenText:
        given.length === 0
          ? "Not answered"
          : left
              .map((item, i) => `${item} → ${right[given[i]] ?? "—"}`)
              .join("; "),
    };
  }

  return {
    ...base,
    prompt: "Question",
    correct: false,
    correctText: "—",
    givenText: "—",
  };
}

/** Post-submission summary: score, CEFR estimate and per-question review. */
export function ResultSummary({
  test,
  answers,
  onRetake,
  onExit,
}: ResultSummaryProps) {
  const graded = test.questions.map((_, index) =>
    gradeQuestion(test, index, answers[index]),
  );
  const correctCount = graded.filter((g) => g.correct).length;
  const total = graded.length;
  const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const estimated = estimateScoreLevel(percent);

  return (
    <div data-ocid="tests.result.panel" className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <ScoreTile
          label="Score"
          value={`${correctCount} / ${total}`}
          hint={`${percent}% correct`}
        />
        <ScoreTile
          label="Estimated level"
          value={estimated.toUpperCase()}
          hint="Based on your score"
          badge={estimated}
        />
        <ScoreTile label="Test" value={test.title} hint="Completed" compact />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Question review
        </h3>
        <ul className="flex flex-col gap-3">
          {graded.map((item) => (
            <li
              key={`review-${item.index}`}
              data-ocid={`tests.review.item.${item.index + 1}`}
              className={cn(
                "rounded-xl border p-4",
                item.correct
                  ? "border-success/40 bg-success/5"
                  : "border-destructive/40 bg-destructive/5",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  {item.correct ? (
                    <CheckCircle2
                      className="size-5 text-success"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="size-5 text-destructive"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">
                    <span className="font-mono text-xs text-muted-foreground">
                      Q{item.index + 1}.
                    </span>{" "}
                    {item.prompt}
                  </p>
                  <dl className="flex flex-col gap-1 text-xs">
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-muted-foreground">
                        Your answer:
                      </dt>
                      <dd
                        className={cn(
                          "min-w-0 break-words",
                          item.correct ? "text-success" : "text-destructive",
                        )}
                      >
                        {item.givenText}
                      </dd>
                    </div>
                    {!item.correct && (
                      <div className="flex gap-2">
                        <dt className="shrink-0 font-semibold text-muted-foreground">
                          Correct:
                        </dt>
                        <dd className="min-w-0 break-words text-foreground">
                          {item.correctText}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {item.explanation && (
                    <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                      {item.explanation}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          data-ocid="tests.result.retake_button"
          className="btn-neon"
          onClick={onRetake}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Retake test
        </Button>
        <Button
          type="button"
          variant="outline"
          data-ocid="tests.result.exit_button"
          onClick={onExit}
        >
          Back to tests
        </Button>
      </div>
    </div>
  );
}

function ScoreTile({
  label,
  value,
  hint,
  badge,
  compact = false,
}: {
  label: string;
  value: string;
  hint: string;
  badge?: MockTest["level"];
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {badge ? (
        <LevelBadge level={badge} className="w-fit text-sm" />
      ) : (
        <span
          className={cn(
            "font-display font-bold text-foreground",
            compact ? "truncate text-lg" : "text-3xl",
          )}
        >
          {value}
        </span>
      )}
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}
