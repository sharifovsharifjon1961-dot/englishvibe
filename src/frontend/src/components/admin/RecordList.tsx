import type { CefrLevel } from "@/backend";
import type {
  ContentRecord,
  ContentTypeConfig,
} from "@/components/admin/types";
import { GlowCard } from "@/components/effects/GlowCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";

interface RecordListProps {
  config: ContentTypeConfig;
  records: ContentRecord[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (record: ContentRecord) => void;
  onDelete: (record: ContentRecord) => void;
}

function levelOf(record: ContentRecord): CefrLevel | undefined {
  return "level" in record
    ? (record.level as CefrLevel | undefined)
    : undefined;
}

/** List of existing records for one content type, with edit and delete actions. */
export function RecordList({
  config,
  records,
  loading,
  onCreate,
  onEdit,
  onDelete,
}: RecordListProps) {
  if (loading) {
    return (
      <div
        data-ocid={`admin.${config.kind}.loading_state`}
        className="flex flex-col gap-3"
      >
        {Array.from({ length: 3 }, (_, i) => `admin-skeleton-${i}`).map(
          (id) => (
            <div
              key={id}
              className="h-20 animate-pulse rounded-2xl border border-border bg-muted/40"
            />
          ),
        )}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={`No ${config.plural.toLowerCase()} yet`}
        description={`Create the first ${config.singular} to publish it to students.`}
        action={
          <Button
            type="button"
            data-ocid={`admin.${config.kind}.empty_create_button`}
            onClick={onCreate}
            className="btn-neon"
          >
            <Plus className="size-4" aria-hidden="true" />
            New {config.singular}
          </Button>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {records.map((record, index) => {
        const level = levelOf(record);
        return (
          <li key={String(record.id)}>
            <GlowCard
              lift={false}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    data-ocid={`admin.${config.kind}.item.${index + 1}`}
                    className="truncate font-display text-base font-semibold text-foreground"
                  >
                    {config.summarize(record)}
                  </span>
                  {level && <LevelBadge level={level} />}
                </div>
                {config.meta && (
                  <p className="truncate text-sm text-muted-foreground">
                    {config.meta(record)}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-ocid={`admin.${config.kind}.edit_button.${index + 1}`}
                  onClick={() => onEdit(record)}
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-ocid={`admin.${config.kind}.delete_button.${index + 1}`}
                  onClick={() => onDelete(record)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </GlowCard>
          </li>
        );
      })}
    </ul>
  );
}
