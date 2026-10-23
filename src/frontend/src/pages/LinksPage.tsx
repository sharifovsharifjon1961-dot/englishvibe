import { LinkCategorySection } from "@/components/links/LinkCategorySection";
import { LinkFilters } from "@/components/links/LinkFilters";
import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLinks } from "@/hooks/useQueries";
import { Link2, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

const ALL = "All";

export default function LinksPage() {
  const { data: links, isLoading, isError, refetch } = useLinks();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const link of links ?? []) {
      if (link.category.trim().length > 0) seen.add(link.category);
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [links]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (links ?? []).filter((link) => {
      const matchesCategory =
        activeCategory === ALL || link.category === activeCategory;
      if (!matchesCategory) return false;
      if (needle.length === 0) return true;
      return (
        link.title.toLowerCase().includes(needle) ||
        link.description.toLowerCase().includes(needle) ||
        link.category.toLowerCase().includes(needle)
      );
    });
  }, [links, query, activeCategory]);

  const grouped = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, typeof filtered>();
    for (const link of filtered) {
      const key = link.category.trim().length > 0 ? link.category : "Other";
      const bucket = map.get(key);
      if (bucket) bucket.push(link);
      else {
        map.set(key, [link]);
        order.push(key);
      }
    }
    return order.map((category) => ({
      category,
      links: map.get(category) ?? [],
    }));
  }, [filtered]);

  const hasAnyLinks = (links?.length ?? 0) > 0;
  const hasResults = filtered.length > 0;

  return (
    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Directory"
        title="Link Library"
        description="A curated directory of external English-learning resources — PDFs, grammar, vocabulary, mock papers and videos — filterable by category and searchable by keyword."
      />

      <div className="mt-8">
        <LinkFilters
          query={query}
          onQueryChange={setQuery}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          resultCount={filtered.length}
        />
      </div>

      <div className="mt-10">
        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : isError ? (
          <EmptyState
            icon={Link2}
            title="Couldn't load the directory"
            description="Something went wrong while fetching the link library. Check your connection and try again."
            action={
              <button
                type="button"
                onClick={() => void refetch()}
                data-ocid="links.retry_button"
                className="btn-neon rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Try again
              </button>
            }
          />
        ) : !hasAnyLinks ? (
          <EmptyState
            icon={Link2}
            title="No resources yet"
            description="The link library is empty. Resources added from the admin dashboard will appear here."
          />
        ) : !hasResults ? (
          <EmptyState
            icon={SearchX}
            title="No matching resources"
            description="No links match your search and category filter. Try a different keyword or reset the filters."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory(ALL);
                }}
                data-ocid="links.reset_filters_button"
                className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-smooth hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Reset filters
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-12">
            {grouped.map((group, groupIndex) => {
              const startIndex =
                grouped
                  .slice(0, groupIndex)
                  .reduce((total, item) => total + item.links.length, 0) + 1;
              return (
                <LinkCategorySection
                  key={group.category}
                  category={group.category}
                  links={group.links}
                  startIndex={startIndex}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
