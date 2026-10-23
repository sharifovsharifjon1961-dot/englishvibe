import type { ChoiceQuestion } from "@/backend";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

interface QuestionSetProps {
  questions: ChoiceQuestion[];
  /** Remount key so answers reset when the selected item changes. */
  itemKey: string;
}

interface Feedback {
  score: number;
  total: number;
}

/**
 * Multiple-choice question set answered against the audio, with per-question
 * feedback and an overall score on submission.
 */
export function QuestionSet({ questions, itemKey }: QuestionSetProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const allAnswered = useMemo(
    () => questions.every((q) => answers[q.id.toString()] !== undefined),
    [questions, answers],
  );

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (feedback) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    const score = questions.reduce((total, question) => {
      const chosen = answers[question.id.toString()];
      return total + (chosen === Number(question.correctIndex) ? 1 : 0);
    }, 0);
    setFeedback({ score, total: questions.length });
  };

  const handleReset = () => {
    setAnswers({});
    setFeedback(null);
  };

  if (questions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center text-sm text-muted-foreground">
        This listening item has no questions yet.
      </p>
    );
  }

  return (
    <div key={itemKey} className="flex flex-col gap-5">
      {feedback && (
        <div
          data-ocid="listening.feedback"
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4",
            feedback.score === feedback.total
              ? "border-success/40 bg-success/10"
              : "border-accent/40 bg-accent/10",
          )}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              You scored{" "}
              <span className="font-mono font-semibold">
                {feedback.score}/{feedback.total}
              </span>{" "}
              — {Math.round((feedback.score / feedback.total) * 100)}% correct.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="listening.retry_button"
            onClick={handleReset}
            className="btn-neon-accent rounded-full"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      )}

      <ol className="flex flex-col gap-4">
        {questions.map((question, index) => {
          const qid = question.id.toString();
          const chosen = answers[qid];
          const correctIndex = Number(question.correctIndex);
          return (
            <li
              key={qid}
              data-ocid={`listening.question.${index + 1}`}
              className="rounded-2xl border border-border bg-card p-5 shadow-subtle"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <p className="pt-0.5 text-sm font-medium text-foreground">
                  {question.prompt}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {question.options.map((option, optionIndex) => {
                  const isChosen = chosen === optionIndex;
                  const isCorrect = optionIndex === correctIndex;
                  const showCorrect = feedback && isCorrect;
                  const showWrong = feedback && isChosen && !isCorrect;
                  return (
                    <button
                      key={`${qid}-${option}`}
                      type="button"
                      data-ocid={`listening.option.${index + 1}.${optionIndex + 1}`}
                      aria-pressed={isChosen}
                      disabled={!!feedback}
                      onClick={() => handleSelect(qid, optionIndex)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-smooth",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        showCorrect &&
                          "border-success/60 bg-success/10 text-foreground",
                        showWrong &&
                          "border-destructive/60 bg-destructive/10 text-foreground",
                        !feedback &&
                          isChosen &&
                          "border-primary bg-primary/10 text-foreground",
                        !feedback &&
                          !isChosen &&
                          "border-border bg-background hover:border-primary/50 hover:bg-muted",
                        feedback &&
                          !showCorrect &&
                          !showWrong &&
                          "border-border bg-background opacity-70",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold",
                            isChosen
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground",
                          )}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        {option}
                      </span>
                      {showCorrect && (
                        <CheckCircle2
                          className="size-4 shrink-0 text-success"
                          aria-hidden="true"
                        />
                      )}
                      {showWrong && (
                        <XCircle
                          className="size-4 shrink-0 text-destructive"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {feedback && (
                <p className="mt-3 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Why: </span>
                  {question.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {!feedback && (
        <div className="flex flex-col items-start gap-2">
          <Button
            type="button"
            data-ocid="listening.submit_button"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="btn-neon rounded-full"
          >
            Check answers
          </Button>
          {!allAnswered && (
            <p className="text-xs text-muted-foreground">
              Answer every question to see your score.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
