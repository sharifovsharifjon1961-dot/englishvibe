import type { ListeningItem } from "@/backend";
import { GlowCard } from "@/components/effects/GlowCard";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { cn } from "@/lib/utils";
import { Headphones, ListChecks } from "lucide-react";

interface ListeningItemListProps {
  items: ListeningItem[];
  selectedId: string | null;
  onSelect: (item: ListeningItem) => void;
}

/** Selectable list of listening items showing title, CEFR level and size. */
export function ListeningItemList({
  items,
  selectedId,
  onSelect,
}: ListeningItemListProps) {
  return (
    <ul
      data-ocid="listening.list"
      className="flex flex-col gap-3"
      aria-label="Available listening items"
    >
      {items.map((item, index) => {
        const id = item.id.toString();
        const isSelected = id === selectedId;
        return (
          <li key={id}>
            <GlowCard
              lift={false}
              className={cn(
                "transition-smooth",
                isSelected && "border-primary/60 ring-1 ring-primary/40",
              )}
            >
              <button
                type="button"
                data-ocid={`listening.item.${index + 1}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(item)}
                className="flex w-full items-start gap-3 rounded-2xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Headphones className="size-5" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-display text-sm font-semibold text-foreground">
                      {item.title}
                    </span>
                    <LevelBadge level={item.level} />
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ListChecks className="size-3.5" aria-hidden="true" />
                    {item.questions.length}{" "}
                    {item.questions.length === 1 ? "question" : "questions"}
                  </span>
                </span>
              </button>
            </GlowCard>
          </li>
        );
      })}
    </ul>
  );
}
