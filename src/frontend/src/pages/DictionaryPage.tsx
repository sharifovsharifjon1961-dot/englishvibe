import { FlashcardMode } from "@/components/dictionary/FlashcardMode";
import { SavedWordsPanel } from "@/components/dictionary/SavedWordsPanel";
import { WordResult } from "@/components/dictionary/WordResult";
import { WordSearch } from "@/components/dictionary/WordSearch";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useRemoveSavedWord,
  useSaveWord,
  useSavedWords,
} from "@/hooks/useQueries";
import { type DictionaryResult, lookupWord } from "@/utils/dictionary";
import { normalizeWord } from "@/utils/text";
import { BookX, Library, SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type LookupStatus = "idle" | "loading" | "success" | "empty" | "error";

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [reviewing, setReviewing] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 450);

  const { data: savedWords, isLoading: isLoadingSaved } = useSavedWords();
  const saveWord = useSaveWord();
  const removeSavedWord = useRemoveSavedWord();

  const saved = useMemo(() => savedWords ?? [], [savedWords]);
  const savedKeys = useMemo(
    () => new Set(saved.map((entry) => normalizeWord(entry.word))),
    [saved],
  );

  // Debounced auto-lookup: fires once the student pauses typing.
  useEffect(() => {
    // `nonce` is read so a manual re-lookup re-runs this effect.
    void nonce;
    const word = normalizeWord(debouncedQuery);
    if (!word) {
      setStatus("idle");
      setResult(null);
      setSubmitted("");
      return;
    }
    if (word === submitted) return;

    let cancelled = false;
    setStatus("loading");
    setSubmitted(word);
    lookupWord(word)
      .then((found) => {
        if (cancelled) return;
        if (!found) {
          setResult(null);
          setStatus("empty");
          return;
        }
        setResult(found);
        setStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setResult(null);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, submitted, nonce]);

  // Escape closes the flashcard review.
  useEffect(() => {
    if (!reviewing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReviewing(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reviewing]);

  const runLookup = () => {
    const word = normalizeWord(query);
    if (!word) return;
    setSubmitted("");
    setNonce((value) => value + 1);
  };

  const clearSearch = () => {
    setQuery("");
    setSubmitted("");
    setResult(null);
    setStatus("idle");
  };

  const currentKey = result ? normalizeWord(result.word) : "";
  const isCurrentSaved = currentKey.length > 0 && savedKeys.has(currentKey);

  const toggleSave = () => {
    if (!result) return;
    if (isCurrentSaved) {
      removeSavedWord.mutate(currentKey);
      return;
    }
    const definition =
      result.definitions[0]?.definition ??
      result.synonyms.slice(0, 4).join(", ") ??
      "";
    saveWord.mutate({
      word: result.word,
      definition: definition || "No definition available.",
      level: result.level,
      savedAt: BigInt(Date.now()) * 1_000_000n,
    });
  };

  const isSaving = saveWord.isPending || removeSavedWord.isPending;

  return (
    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Tool"
        title="Dictionary"
        description="Look up definitions, synonyms and CEFR levels, then save words to review as flashcards."
      />

      <div className="mt-8 flex flex-col gap-8">
        <WordSearch
          value={query}
          onChange={setQuery}
          onSubmit={runLookup}
          onClear={clearSearch}
          isSearching={status === "loading"}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-6">
            {status === "loading" && (
              <div
                data-ocid="dictionary.loading_state"
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:p-8"
              >
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            )}

            {status === "success" && result && (
              <WordResult
                result={result}
                isSaved={isCurrentSaved}
                onToggleSave={toggleSave}
                isSaving={isSaving}
              />
            )}

            {status === "empty" && (
              <EmptyState
                icon={SearchX}
                title={`No entry for “${submitted}”`}
                description="We couldn't find that word in the dictionary. Check the spelling or try a different form of the word."
              />
            )}

            {status === "error" && (
              <EmptyState
                icon={BookX}
                title="Lookup unavailable"
                description="The dictionary service didn't respond. Check your connection and try the word again."
              />
            )}

            {status === "idle" && (
              <EmptyState
                icon={Library}
                title="Search for a word to begin"
                description="Type any English word above. You'll see its CEFR level, definitions, synonyms, example sentences and pronunciation — then save it for review."
              />
            )}
          </div>

          <div className="flex flex-col gap-6">
            {isLoadingSaved ? (
              <Skeleton className="h-64 rounded-2xl" />
            ) : (
              <SavedWordsPanel
                words={saved}
                onRemove={(word) => removeSavedWord.mutate(word)}
                onStartReview={() => setReviewing(true)}
                removingWord={
                  removeSavedWord.isPending
                    ? (removeSavedWord.variables ?? null)
                    : null
                }
              />
            )}
          </div>
        </div>
      </div>

      {reviewing && saved.length > 0 && (
        <FlashcardMode words={saved} onClose={() => setReviewing(false)} />
      )}
    </div>
  );
}
