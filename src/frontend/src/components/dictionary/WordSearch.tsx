import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X } from "lucide-react";

interface WordSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isSearching: boolean;
}

/** Debounced dictionary search field with an explicit submit and clear action. */
export function WordSearch({
  value,
  onChange,
  onSubmit,
  onClear,
  isSearching,
}: WordSearchProps) {
  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor="dictionary-search" className="sr-only">
          Search for a word
        </label>
        <Input
          id="dictionary-search"
          data-ocid="dictionary.search_input"
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Type a word — e.g. resilient, nuance, thrive"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 rounded-full border-input bg-card pl-11 pr-11 text-base"
        />
        {value.length > 0 && (
          <button
            type="button"
            data-ocid="dictionary.clear_button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <Button
        type="submit"
        data-ocid="dictionary.submit_button"
        disabled={isSearching || value.trim().length === 0}
        className="btn-neon h-12 rounded-full px-6 text-sm font-semibold"
      >
        {isSearching ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Looking up
          </>
        ) : (
          <>
            <Search className="size-4" aria-hidden="true" />
            Look up
          </>
        )}
      </Button>
    </form>
  );
}
