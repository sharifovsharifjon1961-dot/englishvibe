import type { FieldSpec } from "@/components/admin/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";

interface RecordFormProps {
  fields: FieldSpec[];
  /** Initial draft values, keyed by field name. */
  initial: Record<string, unknown>;
  submitLabel: string;
  pending: boolean;
  error?: string | null;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
  /** Prefix for deterministic test markers, e.g. "admin.tests". */
  ocidPrefix: string;
}

/** Serializes a value for a JSON field's textarea. */
function toJsonText(value: unknown): string {
  if (value === undefined || value === null) return "";
  try {
    return JSON.stringify(
      value,
      (_key, val) => (typeof val === "bigint" ? Number(val) : val),
      2,
    );
  } catch {
    return "";
  }
}

/** Parses a JSON field, returning an error message when malformed. */
function parseJsonField(
  raw: string,
): { ok: true; value: unknown } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: true, value: [] };
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch {
    return { ok: false, error: "This field must be valid JSON." };
  }
}

/**
 * Data-driven form for any content type. Scalar fields render as inputs,
 * selects or level pickers; nested collections render as validated JSON.
 */
export function RecordForm({
  fields,
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
  onCancel,
  ocidPrefix,
}: RecordFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [jsonText, setJsonText] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const field of fields) {
      if (field.kind === "json")
        map[field.name] = toJsonText(initial[field.name]);
    }
    return map;
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const jsonFields = useMemo(
    () => fields.filter((f) => f.kind === "json"),
    [fields],
  );

  function setValue(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const nextValues: Record<string, unknown> = { ...values };

    for (const field of fields) {
      if (field.kind === "json") {
        const parsed = parseJsonField(jsonText[field.name] ?? "");
        if (!parsed.ok) {
          nextErrors[field.name] = parsed.error;
        } else {
          nextValues[field.name] = parsed.value;
        }
        continue;
      }
      const value = values[field.name];
      if (
        field.required &&
        (value === undefined || value === null || value === "")
      ) {
        nextErrors[field.name] = `${field.label} is required.`;
      }
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(nextValues);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {fields.map((field) => {
        const id = `${ocidPrefix}.${field.name}`;
        const fieldError = fieldErrors[field.name];
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={id}>{field.label}</Label>
            {field.kind === "textarea" && (
              <Textarea
                id={id}
                data-ocid={`${id}.input`}
                rows={field.rows ?? 4}
                value={String(values[field.name] ?? "")}
                placeholder={field.placeholder}
                onChange={(e) => setValue(field.name, e.target.value)}
              />
            )}
            {field.kind === "json" && (
              <Textarea
                id={id}
                data-ocid={`${id}.input`}
                rows={field.rows ?? 6}
                className="font-mono text-xs"
                value={jsonText[field.name] ?? ""}
                placeholder="[]"
                onChange={(e) =>
                  setJsonText((prev) => ({
                    ...prev,
                    [field.name]: e.target.value,
                  }))
                }
              />
            )}
            {field.kind === "text" && (
              <Input
                id={id}
                data-ocid={`${id}.input`}
                value={String(values[field.name] ?? "")}
                placeholder={field.placeholder}
                onChange={(e) => setValue(field.name, e.target.value)}
              />
            )}
            {field.kind === "number" && (
              <Input
                id={id}
                data-ocid={`${id}.input`}
                type="number"
                min={0}
                value={String(values[field.name] ?? "")}
                onChange={(e) =>
                  setValue(
                    field.name,
                    e.target.value === "" ? "" : BigInt(e.target.value),
                  )
                }
              />
            )}
            {(field.kind === "level" || field.kind === "select") && (
              <Select
                value={String(values[field.name] ?? "")}
                onValueChange={(value) =>
                  setValue(
                    field.name,
                    field.kind === "level" && value === "__none__"
                      ? undefined
                      : value,
                  )
                }
              >
                <SelectTrigger
                  id={id}
                  data-ocid={`${id}.select`}
                  className="w-full"
                >
                  <SelectValue
                    placeholder={`Choose ${field.label.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {field.kind === "level" && !field.required && (
                    <SelectItem value="__none__">No level</SelectItem>
                  )}
                  {(field.options ?? []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.help && (
              <p className="text-xs text-muted-foreground">{field.help}</p>
            )}
            {fieldError && (
              <p
                data-ocid={`${id}.error`}
                className="flex items-center gap-1.5 text-xs font-medium text-destructive"
              >
                <AlertCircle className="size-3.5" aria-hidden="true" />
                {fieldError}
              </p>
            )}
          </div>
        );
      })}

      {error && (
        <p
          data-ocid={`${ocidPrefix}.error_state`}
          className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          data-ocid={`${ocidPrefix}.cancel_button`}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          data-ocid={`${ocidPrefix}.submit_button`}
          disabled={pending}
          className="btn-neon"
        >
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
      {jsonFields.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Nested questions are edited as JSON so every field of the content type
          stays available.
        </p>
      )}
    </form>
  );
}
