import type { CefrLevel, SpeakingCard } from "@/backend";
import { CefrLevel as CefrLevelEnum } from "@/backend";
import { SpeakingCardTile } from "@/components/speaking/SpeakingCardTile";
import { SpeakingPractice } from "@/components/speaking/SpeakingPractice";
import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/button";
import { useSpeakingCards } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { MicOff, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

type LevelFilter = "all" | CefrLevel;

const levelFilters: { value: LevelFilter; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: CefrLevelEnum.b1, label: "B1" },
  { value: CefrLevelEnum.b2, label: "B2" },
  { value: CefrLevelEnum.c1, label: "C1" },
];

export default function SpeakingPage() {
  const { data: cards, isLoading, isError, refetch } = useSpeakingCards();
  const [filter, setFilter] = useState<LevelFilter>("all");
  const [selectedId, setSelectedId] = useState<bigint | null>(null);

  const filtered = useMemo(() => {
    const list = cards ?? [];
    if (filter === "all") return list;
    return list.filter((card) => card.level === filter);
  }, [cards, filter]);

  const selected = useMemo(
    () => filtered.find((card) => card.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  const handleSelect = (card: SpeakingCard) => {
    setSelectedId((current) => (current === card.id ? null : card.id));
  };

  return (
    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Module"
        title="Speaking"
        description="Pick a question card, prepare with a countdown, then record your spoken answer and play it back."
      />

      <section className="mt-10 flex flex-col gap-6">
        <SectionHeading
          eyebrow="Question bank"
          title="Choose a card to practise"
          description="Filter by CEFR level, then select a card to open the prep and speaking timers."
        />

        <fieldset
          aria-label="Filter question cards by CEFR level"
          className="flex flex-wrap gap-2 border-0 p-0"
        >
          {levelFilters.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                data-ocid={`speaking.filter.${option.value}`}
                aria-pressed={active}
                onClick={() => {
                  setFilter(option.value);
                  setSelectedId(null);
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </fieldset>

        {isLoading && <CardGridSkeleton count={6} />}

        {isError && (
          <EmptyState
            icon={MicOff}
            title="Could not load question cards"
            description="Something went wrong while fetching the speaking bank. Please try again."
            action={
              <Button
                type="button"
                data-ocid="speaking.retry_button"
                onClick={() => void refetch()}
                className="btn-neon rounded-full px-6"
              >
                Retry
              </Button>
            }
          />
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState
            icon={Sparkles}
            title="No cards at this level yet"
            description="There are no speaking cards for the selected level. Try another level to keep practising."
            action={
              <Button
                type="button"
                data-ocid="speaking.show_all_button"
                onClick={() => setFilter("all")}
                className="btn-neon rounded-full px-6"
              >
                Show all levels
              </Button>
            }
          />
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div
            data-ocid="speaking.card_list"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((card) => (
              <SpeakingCardTile
                key={String(card.id)}
                card={card}
                isActive={card.id === selectedId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </section>

      {selected && (
        <section className="mt-12 flex flex-col gap-6">
          <SectionHeading
            eyebrow="Practice"
            title="Prep, speak, record"
            description="Use the countdowns to pace yourself, then record and review your answer."
          />
          <SpeakingPractice key={String(selected.id)} card={selected} />
        </section>
      )}
    </div>
  );
}
