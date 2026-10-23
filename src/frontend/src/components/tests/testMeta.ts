import { CefrLevel, Skill, Variant_fullLength_topicWise } from "@/backend";

/** Human-readable label for a backend skill value. */
export const skillLabels: Record<Skill, string> = {
  [Skill.reading]: "Reading",
  [Skill.listening]: "Listening",
  [Skill.speaking]: "Speaking",
  [Skill.writing]: "Writing",
  [Skill.grammar]: "Use of English",
  [Skill.vocabulary]: "Use of English",
};

/** Filter options for the skill filter, mapped to the backend skill values. */
export const skillFilters: { label: string; value: Skill }[] = [
  { label: "Reading", value: Skill.reading },
  { label: "Listening", value: Skill.listening },
  { label: "Speaking", value: Skill.speaking },
  { label: "Writing", value: Skill.writing },
  { label: "Use of English", value: Skill.grammar },
];

/** Filter options for the CEFR level filter. */
export const levelFilters: { label: string; value: CefrLevel }[] = [
  { label: "B1", value: CefrLevel.b1 },
  { label: "B2", value: CefrLevel.b2 },
  { label: "C1", value: CefrLevel.c1 },
];

/** Formats a duration in seconds as a compact `Xm` / `Xm Ys` label. */
export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  if (minutes === 0) return `${rest}s`;
  if (rest === 0) return `${minutes} min`;
  return `${minutes} min ${rest}s`;
}

/** Label for a test kind tab. */
export function kindLabel(kind: Variant_fullLength_topicWise): string {
  return kind === Variant_fullLength_topicWise.fullLength
    ? "Full-Length"
    : "Topic-Wise";
}
