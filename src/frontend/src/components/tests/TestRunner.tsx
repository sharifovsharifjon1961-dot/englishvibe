import type { MockTest } from "@/backend";
import {
  QuestionNavigator,
  type QuestionState,
} from "@/components/tests/QuestionNavigator";
import {
  type AnswerValue,
  QuestionView,
} from "@/components/tests/QuestionView";
import { Button } from "@/components/ui/button";
import { formatClock, useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface TestRunnerProps {
  test: MockTest;
  onSubmit: (answers: Record<number, AnswerValue>) => void;
  onExit: () => void;
}

/** Timed runner: one question at a time, navigator, flagging, auto-submit. */
export function TestRunner({ test, onSubmit, onExit }: TestRunnerProps) {
  const total = test.questions.length;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [confirming, setConfirming] = useState(false);

  const handleComplete = useCallback(() => {
    onSubmit(answers);
  }, [answers, onSubmit]);

  const { secondsLeft, isRunning, start, pause } = useCountdown(
    Number(test.durationSeconds),
    handleComplete,
  );

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const stateFor = useCallback(
    (index: number): QuestionState => {
      if (flagged.has(index)) return "flagged";
      return answers[index] !== undefined ? "answered" : "unanswered";
    },
    [answers, flagged],
  );

  const setAnswer = (value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [current]: value }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current)) next.delete(current);
      else next.add(current);
      return next;
    });
  };

  const flaggedList = useMemo(
    () => [...flagged].sort((a, b) => a - b),
    [flagged],
  );

  const isLast = current === total - 1;
  const lowTime = secondsLeft <= 60;

  return (
    <div data-ocid="tests.runner.panel" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate font-display text-lg font-semibold text-foreground">
            {test.title}
          </h2>
          <span className="text-xs text-muted-foreground">
            {answeredCount} of {total} answered
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            data-ocid="tests.timer"
            aria-live="off"
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-lg font-semibold tabular-nums",
              lowTime
                ? "border-destructive/50 bg-destructive/10 text-destructive"
                : "border-border bg-background text-foreground",
            )}
          >
            {formatClock(secondsLeft)}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="tests.timer.toggle_button"
            onClick={isRunning ? pause : start}
          >
            {isRunning ? "Pause" : "Resume"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <QuestionView
            question={test.questions[current]}
            index={current}
            total={total}
            answer={answers[current]}
            onAnswer={setAnswer}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              data-ocid="tests.prev_button"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Previous
            </Button>

            <Button
              type="button"
              variant={flagged.has(current) ? "secondary" : "ghost"}
              data-ocid="tests.flag_button"
              aria-pressed={flagged.has(current)}
              onClick={toggleFlag}
            >
              <Flag
                className={cn("size-4", flagged.has(current) && "fill-current")}
                aria-hidden="true"
              />
              {flagged.has(current) ? "Flagged" : "Flag for review"}
            </Button>

            {isLast ? (
              <Button
                type="button"
                data-ocid="tests.submit_button"
                className="btn-neon"
                onClick={() => setConfirming(true)}
              >
                <Send className="size-4" aria-hidden="true" />
                Submit test
              </Button>
            ) : (
              <Button
                type="button"
                data-ocid="tests.next_button"
                onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              >
                Next
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
          <QuestionNavigator
            total={total}
            currentIndex={current}
            stateFor={stateFor}
            onJump={setCurrent}
          />

          {flaggedList.length > 0 && (
            <div
              data-ocid="tests.flagged.panel"
              className="flex flex-col gap-2 border-t border-border pt-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-warning">
                Flagged for review
              </h3>
              <div className="flex flex-wrap gap-2">
                {flaggedList.map((index) => (
                  <button
                    key={`flagged-${index}`}
                    type="button"
                    data-ocid={`tests.flagged.item.${index + 1}`}
                    onClick={() => setCurrent(index)}
                    className="rounded-full border border-warning/50 bg-warning/10 px-3 py-1 font-mono text-xs font-semibold text-warning transition-smooth hover:bg-warning/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Q{index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              data-ocid="tests.exit_button"
              onClick={onExit}
            >
              Exit test
            </Button>
          </div>
        </aside>
      </div>

      {confirming && (
        <dialog
          open
          data-ocid="tests.submit.dialog"
          aria-labelledby="submit-dialog-title"
          className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-background/80 p-4 backdrop-blur-sm"
        >
          <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-elevated">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-warning/15 text-warning">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </span>
              <h3
                id="submit-dialog-title"
                className="font-display text-lg font-semibold text-foreground"
              >
                Submit this test?
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              You have answered {answeredCount} of {total} questions
              {flaggedList.length > 0
                ? ` and flagged ${flaggedList.length} for review`
                : ""}
              . You cannot change your answers after submitting.
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                data-ocid="tests.submit.cancel_button"
                onClick={() => setConfirming(false)}
              >
                Keep working
              </Button>
              <Button
                type="button"
                data-ocid="tests.submit.confirm_button"
                className="btn-neon"
                onClick={() => onSubmit(answers)}
              >
                Submit now
              </Button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
