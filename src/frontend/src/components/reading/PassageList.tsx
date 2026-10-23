import type { ReadingPassage } from "@/backend";
import { GlowCard } from "@/components/effects/GlowCard";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { cn } from "@/lib/utils";
import { BookOpen, Check } from "lucide-react";

interface PassageListProps {
  passages: ReadingPassage[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

/** Selectable list of reading passages, shown as a rail on large screens. */
export function PassageList({
  passages,
  activeId,
  onSelect,
}: PassageListProps) {
  return (
    <nav
      data-ocid="reading.passage_list"
      aria-label="Reading passages"
      className="flex flex-col gap-3"
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-accent">
        Passages ({passages.length})
      </span>
      <ul className="flex flex-col gap-3">
        {passages.map((passage, index) => {
          const id = passage.id.toString();
          const active = id === activeId;
          return (
            <li key={id}>
              <button
                type="button"
                data-ocid={`reading.passage_item.${index + 1}`}
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(id)}
                className="w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <GlowCard
                  lift={!active}
                  className={cn(
                    "flex h-full flex-col gap-2 p-4",
                    active && "border-primary/60 bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <BookOpen className="size-4" aria-hidden="true" />
                    </span>
                    <LevelBadge level={passage.level} />
                  </div>
                  <span className="font-display text-sm font-semibold text-foreground">
                    {passage.title}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {active ? (
                      <>
                        <Check
                          className="size-3.5 text-primary"
                          aria-hidden="true"
                        />
                        Now reading
                      </>
                    ) : (
                      `${passage.choiceQuestions.length + passage.matchingQuestions.length} questions`
                    )}
                  </span>
                </GlowCard>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
