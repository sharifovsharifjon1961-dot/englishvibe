import type { MockTest } from "@/backend";
import { GlowCard } from "@/components/effects/GlowCard";
import {
  formatDuration,
  kindLabel,
  skillLabels,
} from "@/components/tests/testMeta";
import { LevelBadge, TagBadge } from "@/components/ui/LevelBadge";
import { Button } from "@/components/ui/button";
import { Clock, ListChecks, Play } from "lucide-react";

interface TestCardProps {
  test: MockTest;
  index: number;
  onStart: (test: MockTest) => void;
}

/** Summary card for one mock test with its metadata and a start action. */
export function TestCard({ test, index, onStart }: TestCardProps) {
  const questionCount = test.questions.length;

  return (
    <GlowCard
      data-ocid={`tests.item.${index + 1}`}
      className="flex h-full flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={test.level} />
          <TagBadge>{skillLabels[test.skill]}</TagBadge>
        </div>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {kindLabel(test.kind)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
          {test.title}
        </h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {test.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5 text-accent" aria-hidden="true" />
          {formatDuration(Number(test.durationSeconds))}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="size-3.5 text-accent" aria-hidden="true" />
          {questionCount} {questionCount === 1 ? "question" : "questions"}
        </span>
      </div>

      <Button
        type="button"
        data-ocid={`tests.start_button.${index + 1}`}
        className="btn-neon w-full"
        onClick={() => onStart(test)}
      >
        <Play className="size-4" aria-hidden="true" />
        Start test
      </Button>
    </GlowCard>
  );
}
