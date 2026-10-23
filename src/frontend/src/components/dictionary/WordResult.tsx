import { GlowCard } from "@/components/effects/GlowCard";
import { LevelBadge, TagBadge } from "@/components/ui/LevelBadge";
import type { DictionaryResult } from "@/utils/dictionary";
import { BookmarkCheck, BookmarkPlus, Quote, Volume2 } from "lucide-react";
import { useRef } from "react";

interface WordResultProps {
  result: DictionaryResult;
  isSaved: boolean;
  onToggleSave: () => void;
  isSaving: boolean;
}

/** Full dictionary entry: level, pronunciation, definitions, synonyms, examples. */
export function WordResult({
  result,
  isSaved,
  onToggleSave,
  isSaving,
}: WordResultProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const playAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play();
  };

  return (
    <GlowCard className="flex flex-col gap-6 p-6 md:p-8">
      <div data-ocid="dictionary.result_card" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {result.word}
              </h2>
              {result.level ? (
                <LevelBadge level={result.level} />
              ) : (
                <TagBadge>Level unknown</TagBadge>
              )}
            </div>
            {result.phonetic && (
              <p className="font-mono text-sm text-muted-foreground">
                {result.phonetic}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {result.audioUrl && (
              <>
                {/* biome-ignore lint/a11y/useMediaCaption: a single-word pronunciation clip has no captions */}
                <audio ref={audioRef} src={result.audioUrl} preload="none" />
                <button
                  type="button"
                  data-ocid="dictionary.audio_button"
                  onClick={playAudio}
                  aria-label={`Play pronunciation of ${result.word}`}
                  className="btn-neon-accent flex size-11 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent transition-smooth hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Volume2 className="size-5" aria-hidden="true" />
                </button>
              </>
            )}
            <button
              type="button"
              data-ocid="dictionary.save_button"
              onClick={onToggleSave}
              disabled={isSaving}
              aria-pressed={isSaved}
              className="btn-neon flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="size-4" aria-hidden="true" />
                  Saved
                </>
              ) : (
                <>
                  <BookmarkPlus className="size-4" aria-hidden="true" />
                  Save word
                </>
              )}
            </button>
          </div>
        </div>

        {result.definitions.length > 0 && (
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent">
              Definitions
            </h3>
            <ol className="flex flex-col gap-4">
              {result.definitions.map((definition, index) => (
                <li
                  key={`${definition.partOfSpeech}-${index}`}
                  className="flex gap-4"
                >
                  <span className="mt-0.5 font-mono text-sm text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <TagBadge className="w-fit">
                      {definition.partOfSpeech}
                    </TagBadge>
                    <p className="text-base text-foreground">
                      {definition.definition}
                    </p>
                    {definition.example && (
                      <p className="flex items-start gap-2 text-sm italic text-muted-foreground">
                        <Quote
                          className="mt-0.5 size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        {definition.example}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {result.synonyms.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent">
              Synonyms
            </h3>
            <ul className="flex flex-wrap gap-2">
              {result.synonyms.map((synonym) => (
                <li key={synonym}>
                  <TagBadge className="text-sm">{synonym}</TagBadge>
                </li>
              ))}
            </ul>
          </section>
        )}

        {result.examples.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent">
              Example sentences
            </h3>
            <ul className="flex flex-col gap-2">
              {result.examples.map((example) => (
                <li
                  key={example}
                  className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground"
                >
                  {example}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </GlowCard>
  );
}
