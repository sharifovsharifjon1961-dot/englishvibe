import type { CefrLevel } from "@/backend";
import { cn } from "@/lib/utils";

const levelStyles: Record<CefrLevel, string> = {
  b1: "bg-accent/15 text-accent border-accent/30",
  b2: "bg-primary/15 text-primary border-primary/30",
  c1: "bg-success/15 text-success border-success/30",
};

/** Pill badge for a CEFR level, tinted per level. */
export function LevelBadge({
  level,
  className,
}: {
  level: CefrLevel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider",
        levelStyles[level],
        className,
      )}
    >
      {level.toUpperCase()}
    </span>
  );
}

/** Neutral pill badge for a free-form label such as a category or skill. */
export function TagBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
