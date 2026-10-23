import { GlowCard } from "@/components/effects/GlowCard";
import { Button } from "@/components/ui/button";
import { useExportContent, useImportContent } from "@/hooks/useQueries";
import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Feedback = { kind: "error" | "success"; message: string } | null;

/** Downloads the full content bundle and restores it from a JSON file. */
export function ImportExportPanel() {
  const exportContent = useExportContent();
  const importContent = useImportContent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleExport() {
    setFeedback(null);
    try {
      const json = await exportContent.mutateAsync();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cefr-content-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setFeedback({ kind: "success", message: "Content bundle downloaded." });
      toast.success("Content exported");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Export failed. Try again.";
      setFeedback({ kind: "error", message });
      toast.error(message);
    }
  }

  async function handleFile(file: File) {
    setFeedback(null);
    let text: string;
    try {
      text = await file.text();
    } catch {
      setFeedback({ kind: "error", message: "Could not read that file." });
      return;
    }

    try {
      JSON.parse(text);
    } catch {
      setFeedback({
        kind: "error",
        message:
          "That file is not valid JSON. Check for a missing brace or comma and try again.",
      });
      return;
    }

    try {
      const bundle = await importContent.mutateAsync(text);
      const total =
        bundle.tests.length +
        bundle.passages.length +
        bundle.listening.length +
        bundle.speakingCards.length +
        bundle.writingPrompts.length +
        bundle.links.length +
        bundle.announcements.length;
      setFeedback({
        kind: "success",
        message: `Import complete — ${total} records restored across every module.`,
      });
      toast.success("Content imported");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Import failed. The bundle may be missing required fields.";
      setFeedback({ kind: "error", message });
      toast.error("Import failed");
    }
  }

  return (
    <GlowCard lift={false} className="flex flex-col gap-5 p-6">
      <div
        className="flex flex-col gap-1.5"
        data-ocid="admin.import_export_panel"
      >
        <h2 className="font-display text-xl font-semibold text-foreground">
          Backup &amp; restore
        </h2>
        <p className="text-sm text-muted-foreground">
          Export the entire content set as JSON, or restore it from a previous
          export. Importing replaces all current content.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          data-ocid="admin.export_button"
          onClick={handleExport}
          disabled={exportContent.isPending}
          className="btn-neon"
        >
          <Download className="size-4" aria-hidden="true" />
          {exportContent.isPending ? "Exporting…" : "Export JSON"}
        </Button>
        <Button
          type="button"
          variant="outline"
          data-ocid="admin.import_button"
          onClick={() => fileInputRef.current?.click()}
          disabled={importContent.isPending}
        >
          <Upload className="size-4" aria-hidden="true" />
          {importContent.isPending ? "Importing…" : "Import JSON"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          data-ocid="admin.import_input"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
      </div>

      {feedback && (
        <p
          data-ocid={
            feedback.kind === "error"
              ? "admin.import_export.error_state"
              : "admin.import_export.success_state"
          }
          role={feedback.kind === "error" ? "alert" : "status"}
          className={
            feedback.kind === "error"
              ? "flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              : "flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
          }
        >
          {feedback.kind === "error" ? (
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
          )}
          {feedback.message}
        </p>
      )}
    </GlowCard>
  );
}
