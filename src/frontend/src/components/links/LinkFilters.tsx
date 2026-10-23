import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface LinkFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  resultCount: number;
}

/** Search input plus a category chip row for the link directory. */
export function LinkFilters({
  query,
  onQueryChange,
  categories,
  activeCategory,
  onCategoryChange,
  resultCount,
}: LinkFiltersProps) {
  const chips = ["All", ...categories];

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          data-ocid="links.search_input"
          aria-label="Search links"
          placeholder="Search by title, description or category…"
          className="h-11 w-full rounded-full border border-input bg-card pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-smooth focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            data-ocid="links.search_clear_button"
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <fieldset
          aria-label="Filter by category"
          className="flex flex-wrap gap-2"
        >
          {chips.map((category) => {
            const active = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                data-ocid={`links.filter.${category.toLowerCase().replace(/\s+/g, "_")}`}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {category}
              </button>
            );
          })}
        </fieldset>

        <p
          aria-live="polite"
          data-ocid="links.result_count"
          className="text-sm text-muted-foreground"
        >
          {resultCount === 1
            ? "1 resource found"
            : `${resultCount} resources found`}
        </p>
      </div>
    </div>
  );
}
