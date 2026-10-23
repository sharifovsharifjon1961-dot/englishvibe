import type { ListeningItem } from "@/backend";
import { AudioPlayer } from "@/components/listening/AudioPlayer";
import { ListeningItemList } from "@/components/listening/ListeningItemList";
import { QuestionSet } from "@/components/listening/QuestionSet";
import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Switch } from "@/components/ui/switch";
import { useListeningItems } from "@/hooks/useQueries";
import { Headphones, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function ListeningPage() {
  const { data: items, isLoading, isError, refetch } = useListeningItems();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playOnce, setPlayOnce] = useState(false);
  const [playedIds, setPlayedIds] = useState<Record<string, boolean>>({});

  // Auto-select the first item once the list loads.
  useEffect(() => {
    if (!items || items.length === 0) return;
    setSelectedId((current) => {
      if (current && items.some((item) => item.id.toString() === current)) {
        return current;
      }
      return items[0].id.toString();
    });
  }, [items]);

  const selected =
    items?.find((item) => item.id.toString() === selectedId) ?? null;

  const handleSelect = (item: ListeningItem) => {
    setSelectedId(item.id.toString());
  };

  const handleFirstPlay = (id: string) => {
    setPlayedIds((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Module"
        title="Listening"
        description="Train your ear with graded audio. Control playback speed, skip around, and test yourself with a question set."
      />

      {isLoading && (
        <div className="mt-10" data-ocid="listening.loading_state">
          <CardGridSkeleton count={3} />
        </div>
      )}

      {isError && (
        <div className="mt-10" data-ocid="listening.error_state">
          <EmptyState
            icon={RefreshCw}
            title="Couldn't load listening items"
            description="Something went wrong while fetching the audio library. Please try again."
            action={
              <button
                type="button"
                data-ocid="listening.retry_button"
                onClick={() => void refetch()}
                className="btn-neon rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
              >
                Retry
              </button>
            }
          />
        </div>
      )}

      {!isLoading && !isError && items && items.length === 0 && (
        <div className="mt-10" data-ocid="listening.empty_state">
          <EmptyState
            icon={Headphones}
            title="No listening items yet"
            description="Audio exercises will appear here as soon as they are published."
          />
        </div>
      )}

      {!isLoading && !isError && items && items.length > 0 && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="flex flex-col gap-8">
            {selected ? (
              <>
                <section className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      {selected.title}
                    </h2>
                    <LevelBadge level={selected.level} />
                  </div>
                  <AudioPlayer
                    src={selected.audioUrl}
                    title={selected.title}
                    playOnce={playOnce}
                    captions={selected.transcript}
                    onFirstPlay={() => handleFirstPlay(selected.id.toString())}
                  />
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <label
                        htmlFor="play-once"
                        className="text-sm font-medium text-foreground"
                      >
                        Play-once mode
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {playOnce && playedIds[selected.id.toString()]
                          ? "Locked — this track has already been played."
                          : "Prevents replaying the audio after the first listen."}
                      </p>
                    </div>
                    <Switch
                      id="play-once"
                      data-ocid="listening.play_once_switch"
                      checked={playOnce}
                      onCheckedChange={setPlayOnce}
                      aria-label="Toggle play-once mode"
                    />
                  </div>
                </section>

                <section className="flex flex-col gap-5">
                  <SectionHeading
                    eyebrow="Comprehension"
                    title="Questions"
                    description="Answer against what you heard, then check your score."
                  />
                  <QuestionSet
                    questions={selected.questions}
                    itemKey={selected.id.toString()}
                  />
                </section>
              </>
            ) : (
              <EmptyState
                icon={Headphones}
                title="Pick a listening item"
                description="Choose an audio exercise from the list to start practising."
              />
            )}
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            <SectionHeading
              eyebrow="Library"
              title="Listening items"
              className="[&_h2]:text-xl"
            />
            <ListeningItemList
              items={items}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
