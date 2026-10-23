import { Button } from "@/components/ui/button";
import { formatClock, useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";

const PRESETS = [5, 10, 15, 20] as const;

interface ReadingTimerProps {
  /** Called once when the countdown reaches zero. */
  onComplete?: () => void;
}

/**
 * Interactive study timer with start, pause and reset plus quick duration
 * presets. Counts down in whole seconds and announces completion politely.
 */
export function ReadingTimer({ onComplete }: ReadingTimerProps) {
  const { secondsLeft, isRunning, isFinished, start, pause, reset } =
    useCountdown(10 * 60, onComplete);

  return (
    <section
      data-ocid="reading.timer_panel"
      aria-label="Reading timer"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
          <Timer className="size-4" aria-hidden="true" />
          Study timer
        </span>
        <span
          data-ocid="reading.timer_display"
          role="timer"
          aria-live="polite"
          className={cn(
            "font-mono text-3xl font-bold tabular-nums tracking-tight",
            isFinished ? "text-destructive" : "text-foreground",
          )}
        >
          {formatClock(secondsLeft)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isRunning ? (
          <Button
            type="button"
            variant="secondary"
            data-ocid="reading.timer_pause_button"
            onClick={pause}
            className="rounded-full"
          >
            <Pause className="size-4" aria-hidden="true" />
            Pause
          </Button>
        ) : (
          <Button
            type="button"
            data-ocid="reading.timer_start_button"
            onClick={start}
            disabled={isFinished}
            className="btn-neon rounded-full"
          >
            <Play className="size-4" aria-hidden="true" />
            {secondsLeft === 0 ? "Finished" : "Start"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          data-ocid="reading.timer_reset_button"
          onClick={() => reset()}
          className="rounded-full"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Quick set</span>
        {PRESETS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            data-ocid={`reading.timer_preset.${minutes}`}
            onClick={() => reset(minutes * 60)}
            className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs font-medium text-muted-foreground transition-smooth hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {minutes}m
          </button>
        ))}
      </div>

      {isFinished && (
        <p
          data-ocid="reading.timer_finished_state"
          className="text-sm font-medium text-destructive"
        >
          Time is up — review your answers or reset the timer to keep reading.
        </p>
      )}
    </section>
  );
}
