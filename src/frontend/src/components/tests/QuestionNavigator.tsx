import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";

export type QuestionState = "answered" | "unanswered" | "flagged";

interface QuestionNavigatorProps {
  total: number;
  currentIndex: number;
  stateFor: (index: number) => QuestionState;
  onJump: (index: number) => void;
}

const stateStyles: Record<QuestionState, string> = {
  answered: "border-success/50 bg-success/15 text-success",
  unanswered: "border-border bg-background text-muted-foreground",
  flagged: "border-warning/60 bg-warning/15 text-warning",
};

/** Grid of question buttons showing answered / unanswered / flagged state. */
export function QuestionNavigator({
  total,
  currentIndex,
  stateFor,
  onJump,
}: QuestionNavigatorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Question navigator
        </h3>
        <span className="font-mono text-xs text-muted-foreground">
          {currentIndex + 1} / {total}
        </span>
      </div>

      <div
        data-ocid="tests.navigator.grid"
        className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-6"
      >
        {Array.from({ length: total }, (_, i) => i).map((index) => {
          const state = stateFor(index);
          const isCurrent = index === currentIndex;
          return (
            <button
              key={`q-${index}`}
              type="button"
              data-ocid={`tests.navigator.item.${index + 1}`}
              aria-label={`Go to question ${index + 1}, ${state}`}
              aria-current={isCurrent ? "true" : undefined}
              onClick={() => onJump(index)}
              className={cn(
                "relative flex size-9 items-center justify-center rounded-lg border font-mono text-xs font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                stateStyles[state],
                isCurrent &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              {index + 1}
              {state === "flagged" && (
                <Flag
                  className="absolute -right-1 -top-1 size-3 fill-warning text-warning"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <LegendDot className="bg-success/60" label="Answered" />
        <LegendDot className="bg-border" label="Unanswered" />
        <LegendDot className="bg-warning/70" label="Flagged" />
      </ul>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <span
        className={cn("size-2.5 rounded-full", className)}
        aria-hidden="true"
      />
      {label}
    </li>
  );
}
