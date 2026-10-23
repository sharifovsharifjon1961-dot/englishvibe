import { cn } from "@/lib/utils";
import { CheckCircle2, MinusCircle, PlusCircle } from "lucide-react";

interface WordCounterProps {
  count: number;
  minWords: number;
  maxWords: number;
  className?: string;
}

type CounterState = "under" | "within" | "over";

function resolveState(count: number, min: number, max: number): CounterState {
  if (count < min) return "under";
  if (count > max) return "over";
  return "within";
}

const stateCopy: Record<CounterState, string> = {
  under: "Keep going",
  within: "Target reached",
  over: "Over the limit",
};

const stateStyles: Record<CounterState, string> = {
  under: "text-muted-foreground",
  within: "text-success",
  over: "text-destructive",
};

const barStyles: Record<CounterState, string> = {
  under: "bg-accent",
  within: "bg-success",
  over: "bg-destructive",
};

/**
 * Live word counter showing progress against a prompt's target word range.
 * The bar fills toward the minimum, then turns green inside the range and red
 * once the maximum is exceeded.
 */
export function WordCounter({
  count,
  minWords,
  maxWords,
  className,
}: WordCounterProps) {
  const state = resolveState(count, minWords, maxWords);
  const span = Math.max(maxWords - minWords, 1);
  const rawPercent =
    count <= minWords
      ? (count / Math.max(minWords, 1)) * 60
      : 60 + ((count - minWords) / span) * 40;
  const percent = Math.min(Math.max(rawPercent, 0), 100);

  const Icon =
    state === "within"
      ? CheckCircle2
      : state === "over"
        ? PlusCircle
        : MinusCircle;

  const remaining =
    state === "under"
      ? `${minWords - count} to minimum`
      : state === "over"
        ? `${count - maxWords} over maximum`
        : "Within range";

  return (
    <div
      data-ocid="writing.word_counter"
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-sm text-foreground">
          <span className="text-lg font-semibold tabular-nums">{count}</span>
          <span className="text-muted-foreground">
            {" "}
            / {minWords}–{maxWords} words
          </span>
        </p>
        <p
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium",
            stateStyles[state],
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          {stateCopy[state]}
        </p>
      </div>

      <div
        role="progressbar"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={maxWords}
        aria-valuenow={count}
        aria-label="Word count progress toward the target range"
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out",
            barStyles[state],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">{remaining}</p>
    </div>
  );
}
