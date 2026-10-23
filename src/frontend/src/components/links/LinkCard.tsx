import type { ExternalLink } from "@/backend";
import { GlowCard } from "@/components/effects/GlowCard";
import { LevelBadge, TagBadge } from "@/components/ui/LevelBadge";
import { ArrowUpRight } from "lucide-react";

interface LinkCardProps {
  link: ExternalLink;
  /** 1-based position in the rendered directory, used for stable test ids. */
  index: number;
}

/** A single directory entry: title, description, category and optional level. */
export function LinkCard({ link, index }: LinkCardProps) {
  return (
    <GlowCard className="h-full">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        data-ocid={`links.item.${index}`}
        aria-label={`${link.title} — opens in a new tab`}
        className="group flex h-full flex-col gap-4 rounded-2xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 font-display text-lg font-semibold leading-snug text-foreground transition-smooth group-hover:text-primary">
            {link.title}
          </h3>
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-smooth group-hover:border-primary/50 group-hover:text-primary"
          >
            <ArrowUpRight className="size-4" />
          </span>
        </div>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {link.description}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <TagBadge>{link.category}</TagBadge>
          {link.level && <LevelBadge level={link.level} />}
        </div>
      </a>
    </GlowCard>
  );
}
