import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { RecordForm } from "@/components/admin/RecordForm";
import { RecordList } from "@/components/admin/RecordList";
import { CONTENT_TYPES, configFor } from "@/components/admin/contentTypes";
import type { ContentKind, ContentRecord } from "@/components/admin/types";
import { useContentHooks } from "@/components/admin/useContentHooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Draft state for the create/edit dialog. */
interface EditorState {
  kind: ContentKind;
  record: ContentRecord | null;
  values: Record<string, unknown>;
}

/** Tabbed no-code manager for every content type. */
export function ContentManager() {
  const [activeKind, setActiveKind] = useState<ContentKind>("tests");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContentRecord | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const config = configFor(activeKind);
  const { records, loading, upsert, remove } = useContentHooks(activeKind);

  function openCreate() {
    setFormError(null);
    setEditor({
      kind: activeKind,
      record: null,
      values: config.blank(),
    });
  }

  function openEdit(record: ContentRecord) {
    setFormError(null);
    setEditor({
      kind: activeKind,
      record,
      values: { ...(record as unknown as Record<string, unknown>) },
    });
  }

  async function handleSubmit(values: Record<string, unknown>) {
    if (!editor) return;
    setFormError(null);
    setSaving(true);
    try {
      await upsert(values as unknown as ContentRecord);
      toast.success(
        editor.record
          ? `${config.singular} updated`
          : `${config.singular} created`,
      );
      setEditor(null);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : `Could not save the ${config.singular}.`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await remove(pendingDelete.id);
      toast.success(`${config.singular} deleted`);
      setPendingDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Could not delete the ${config.singular}.`,
      );
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section
      data-ocid="admin.content_manager"
      className="flex flex-col gap-6"
      aria-label="Content manager"
    >
      <Tabs
        value={activeKind}
        onValueChange={(value) => setActiveKind(value as ContentKind)}
        className="gap-6"
      >
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="h-auto w-max flex-nowrap gap-1 p-1">
            {CONTENT_TYPES.map((type) => (
              <TabsTrigger
                key={type.kind}
                value={type.kind}
                data-ocid={`admin.tab.${type.kind}`}
                className="px-3 py-1.5"
              >
                {type.plural}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {CONTENT_TYPES.map((type) => (
          <TabsContent key={type.kind} value={type.kind} className="mt-0">
            {type.kind === activeKind && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {records.length}{" "}
                    {records.length === 1 ? "record" : "records"} in{" "}
                    {type.plural.toLowerCase()}.
                  </p>
                  <Button
                    type="button"
                    data-ocid={`admin.${type.kind}.create_button`}
                    onClick={openCreate}
                    className="btn-neon"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    New {type.singular}
                  </Button>
                </div>
                <RecordList
                  config={type}
                  records={records}
                  loading={loading}
                  onCreate={openCreate}
                  onEdit={openEdit}
                  onDelete={setPendingDelete}
                />
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <DialogContent
          data-ocid="admin.record_dialog"
          className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>
              {editor?.record ? "Edit" : "New"} {config.singular}
            </DialogTitle>
            <DialogDescription>
              {editor?.record
                ? "Update the fields below and save to publish the change."
                : `Fill in the fields to add a new ${config.singular}.`}
            </DialogDescription>
          </DialogHeader>
          {editor && (
            <RecordForm
              key={editor.record ? String(editor.record.id) : "new"}
              fields={config.fields}
              initial={editor.values}
              submitLabel={
                editor.record ? "Save changes" : `Create ${config.singular}`
              }
              pending={saving}
              error={formError}
              onSubmit={handleSubmit}
              onCancel={() => setEditor(null)}
              ocidPrefix={`admin.${config.kind}.form`}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        label={pendingDelete ? config.summarize(pendingDelete) : ""}
        noun={config.singular}
        pending={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
