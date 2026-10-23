import type {
  Announcement,
  ExternalLink,
  ListeningItem,
  MockTest,
  ReadingPassage,
  SpeakingCard,
  WritingPrompt,
} from "@/backend";

/** Every content type the admin dashboard can manage. */
export type ContentKind =
  | "tests"
  | "passages"
  | "listening"
  | "speakingCards"
  | "writingPrompts"
  | "links"
  | "announcements";

/** A record from any managed collection. */
export type ContentRecord =
  | MockTest
  | ReadingPassage
  | ListeningItem
  | SpeakingCard
  | WritingPrompt
  | ExternalLink
  | Announcement;

/** Field input kinds rendered by the generic record form. */
export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "level"
  | "select"
  | "json";

export interface FieldSpec {
  /** Property name on the record. */
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  placeholder?: string;
  help?: string;
  /** Options for `select` fields. */
  options?: { value: string; label: string }[];
  /** Rows for `textarea` fields. */
  rows?: number;
}

export interface ContentTypeConfig {
  kind: ContentKind;
  /** Singular noun used in buttons and dialogs. */
  singular: string;
  /** Plural noun used in headings. */
  plural: string;
  /** Query key used by the list hook. */
  queryKey: string;
  fields: FieldSpec[];
  /** Builds a blank draft for the "new record" form. */
  blank: () => Record<string, unknown>;
  /** One-line summary shown in the record list. */
  summarize: (record: ContentRecord) => string;
  /** Secondary metadata shown under the summary. */
  meta?: (record: ContentRecord) => string;
}

export const LEVEL_OPTIONS = [
  { value: "b1", label: "B1 — Intermediate" },
  { value: "b2", label: "B2 — Upper intermediate" },
  { value: "c1", label: "C1 — Advanced" },
];

export const SKILL_OPTIONS = [
  { value: "reading", label: "Reading" },
  { value: "listening", label: "Listening" },
  { value: "speaking", label: "Speaking" },
  { value: "writing", label: "Writing" },
  { value: "grammar", label: "Grammar" },
  { value: "vocabulary", label: "Vocabulary" },
];

export const TEST_KIND_OPTIONS = [
  { value: "fullLength", label: "Full-length" },
  { value: "topicWise", label: "Topic-wise" },
];
