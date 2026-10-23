import type { CefrLevel, Skill } from "@/backend";
import { levelFilters, skillFilters } from "@/components/tests/testMeta";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, X } from "lucide-react";

export interface TestFilters {
  level: CefrLevel | null;
  skill: Skill | null;
}

interface TestFilterBarProps {
  filters: TestFilters;
  onChange: (filters: TestFilters) => void;
  resultCount: number;
}

/** Level + skill filter chips that narrow the listed mock tests. */
export function TestFilterBar({
  filters,
  onChange,
  resultCount,
}: TestFilterBarProps) {
  const hasFilters = filters.level !== null || filters.skill !== null;

  return (
    <div
      data-ocid="tests.filter.panel"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <SlidersHorizontal
            className="size-4 text-accent"
            aria-hidden="true"
          />
          <span>Filter tests</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {resultCount} {resultCount === 1 ? "test" : "tests"}
          </span>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid="tests.filter.clear_button"
              onClick={() => onChange({ level: null, skill: null })}
            >
              <X className="size-3.5" aria-hidden="true" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <FilterRow label="CEFR level">
          {levelFilters.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              active={filters.level === option.value}
              ocid={`tests.filter.level.${option.value}`}
              onClick={() =>
                onChange({
                  ...filters,
                  level: filters.level === option.value ? null : option.value,
                })
              }
            />
          ))}
        </FilterRow>

        <FilterRow label="Skill">
          {skillFilters.map((option) => (
            <FilterChip
              key={option.label}
              label={option.label}
              active={filters.skill === option.value}
              ocid={`tests.filter.skill.${option.value}`}
              onClick={() =>
                onChange({
                  ...filters,
                  skill: filters.skill === option.value ? null : option.value,
                })
              }
            />
          ))}
        </FilterRow>
      </div>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  ocid,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_16px_-4px_oklch(var(--primary)/0.6)]"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
