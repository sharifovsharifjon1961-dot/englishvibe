import type { SpeakingCard } from "@/backend";
import { GlowCard } from "@/components/effects/GlowCard";
import { SpeakingRecorder } from "@/components/speaking/SpeakingRecorder";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Button } from "@/components/ui/button";
import { formatClock, useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";
import { Lightbulb, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useCallback, useState } from "react";

type Phase = "idle" | "prep" | "speak" | "done";

interface SpeakingPracticeProps {
  card: SpeakingCard;
}

/** Prep countdown → speaking countdown → recorder, for one question card. */
export function SpeakingPractice({ card }: SpeakingPracticeProps) {
  const prepSeconds = Number(card.prepSeconds);
  const speakSeconds = Number(card.speakSeconds);

  const [phase, setPhase] = useState<Phase>("idle");
  const [resetKey, setResetKey] = useState(0);

  const handlePrepComplete = useCallback(() => setPhase("speak"), []);
  const handleSpeakComplete = useCallback(() => setPhase("done"), []);

  const prep = useCountdown(prepSeconds, handlePrepComplete);
  const speak = useCountdown(speakSeconds, handleSpeakComplete);

  const startPrep = () => {
    setPhase("prep");
    prep.reset(prepSeconds);
    prep.start();
  };

  const startSpeaking = () => {
    setPhase("speak");
    speak.reset(speakSeconds);
    speak.start();
  };

  const resetAll = () => {
    setPhase("idle");
    prep.reset(prepSeconds);
    speak.reset(speakSeconds);
    setResetKey((key) => key + 1);
  };

  const activeTimer = phase === "prep" ? prep : speak;
  const activeLabel = phase === "prep" ? "Preparation" : "Speaking";
  const activeTotal = phase === "prep" ? prepSeconds : speakSeconds;
  const progress =
    activeTotal > 0
      ? ((activeTotal - activeTimer.secondsLeft) / activeTotal) * 100
      : 0;

  return (
    <GlowCard lift={false} className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LevelBadge level={card.level} />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Card {Number(card.id)}
          </span>
        </div>
        <span
          data-ocid="speaking.phase_state"
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
            phase === "prep" && "border-accent/40 bg-accent/15 text-accent",
            phase === "speak" && "border-primary/40 bg-primary/15 text-primary",
            phase === "done" && "border-success/40 bg-success/15 text-success",
            phase === "idle" && "border-border bg-muted text-muted-foreground",
          )}
        >
          {phase === "idle" && "Ready"}
          {phase === "prep" && "Preparing"}
          {phase === "speak" && "Speaking"}
          {phase === "done" && "Time's up"}
        </span>
      </div>

      <p className="font-display text-xl font-semibold leading-snug text-foreground md:text-2xl">
        {card.prompt}
      </p>

      {card.tips && (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <Lightbulb
            className="mt-0.5 size-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">{card.tips}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Timer className="size-4 text-primary" aria-hidden="true" />
            {phase === "idle" ? "Prep & speak timers" : activeLabel}
          </span>
          <span
            data-ocid="speaking.timer"
            className="font-mono text-2xl font-bold tabular-nums text-foreground"
          >
            {formatClock(activeTimer.secondsLeft)}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          tabIndex={-1}
          aria-label={`${activeLabel} time remaining`}
          aria-valuemin={0}
          aria-valuemax={activeTotal}
          aria-valuenow={activeTimer.secondsLeft}
        >
          <div
            className="h-full rounded-full bg-gradient-primary transition-[width] duration-1000 ease-linear"
            style={{ width: `${phase === "idle" ? 0 : progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {phase === "idle" && (
          <Button
            type="button"
            data-ocid="speaking.start_button"
            onClick={startPrep}
            className="btn-neon h-11 rounded-full px-6"
          >
            <Play className="size-4" aria-hidden="true" />
            Start prep ({prepSeconds}s)
          </Button>
        )}

        {phase === "prep" && (
          <>
            <Button
              type="button"
              variant="outline"
              data-ocid="speaking.pause_button"
              onClick={prep.isRunning ? prep.pause : prep.start}
              className="h-11 rounded-full px-5"
            >
              {prep.isRunning ? (
                <>
                  <Pause className="size-4" aria-hidden="true" />
                  Pause prep
                </>
              ) : (
                <>
                  <Play className="size-4" aria-hidden="true" />
                  Resume prep
                </>
              )}
            </Button>
            <Button
              type="button"
              data-ocid="speaking.skip_button"
              onClick={startSpeaking}
              className="btn-neon h-11 rounded-full px-6"
            >
              Start speaking now
            </Button>
          </>
        )}

        {phase === "speak" && (
          <Button
            type="button"
            variant="outline"
            data-ocid="speaking.pause_button"
            onClick={speak.isRunning ? speak.pause : speak.start}
            className="h-11 rounded-full px-5"
          >
            {speak.isRunning ? (
              <>
                <Pause className="size-4" aria-hidden="true" />
                Pause speaking
              </>
            ) : (
              <>
                <Play className="size-4" aria-hidden="true" />
                Resume speaking
              </>
            )}
          </Button>
        )}

        {phase === "done" && (
          <Button
            type="button"
            data-ocid="speaking.restart_button"
            onClick={startSpeaking}
            className="btn-neon h-11 rounded-full px-6"
          >
            <Play className="size-4" aria-hidden="true" />
            Speak again ({speakSeconds}s)
          </Button>
        )}

        {phase !== "idle" && (
          <Button
            type="button"
            variant="ghost"
            data-ocid="speaking.reset_button"
            onClick={resetAll}
            className="h-11 rounded-full px-5"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </Button>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="mb-4 font-display text-base font-semibold text-foreground">
          Record your answer
        </h3>
        <SpeakingRecorder resetKey={resetKey} />
      </div>
    </GlowCard>
  );
}
