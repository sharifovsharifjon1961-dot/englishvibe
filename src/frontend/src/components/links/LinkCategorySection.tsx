import type { ExternalLink } from "@/backend";
import { LinkCard } from "@/components/links/LinkCard";

interface LinkCategorySectionProps {
  category: string;
  links: ExternalLink[];
  /** Running 1-based offset so item test ids stay unique across sections. */
  startIndex: number;
}

/** One category group of the directory, rendered as a responsive card grid. */
export function LinkCategorySection({
  category,
  links,
  startIndex,
}: LinkCategorySectionProps) {
  return (
    <section
      aria-labelledby={`links-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center gap-3">
        <h2
          id={`links-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
          className="font-display text-xl font-semibold tracking-tight text-foreground"
        >
          {category}
        </h2>
        <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
          {links.length}
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link, offset) => (
          <LinkCard
            key={link.id.toString()}
            link={link}
            index={startIndex + offset}
          />
        ))}
      </div>
    </section>
  );
}
