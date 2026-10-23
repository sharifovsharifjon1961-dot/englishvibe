import type {
  Announcement,
  ExternalLink,
  ListeningItem,
  MockTest,
  ReadingPassage,
  SpeakingCard,
  WritingPrompt,
} from "@/backend";
import {
  type ContentRecord,
  type ContentTypeConfig,
  LEVEL_OPTIONS,
  SKILL_OPTIONS,
  TEST_KIND_OPTIONS,
} from "@/components/admin/types";

const QUESTIONS_HELP =
  "JSON array of questions. Choice: {id, prompt, options[], correctIndex, explanation}. Matching: {id, prompt, left[], right[], correctRightIndex[]}.";

/** Field schema and list summaries for every managed content type. */
export const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    kind: "tests",
    singular: "mock test",
    plural: "Mock tests",
    queryKey: "tests",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      {
        name: "description",
        label: "Description",
        kind: "textarea",
        rows: 3,
      },
      {
        name: "kind",
        label: "Test kind",
        kind: "select",
        options: TEST_KIND_OPTIONS,
        required: true,
      },
      {
        name: "level",
        label: "CEFR level",
        kind: "level",
        options: LEVEL_OPTIONS,
        required: true,
      },
      {
        name: "skill",
        label: "Skill",
        kind: "select",
        options: SKILL_OPTIONS,
        required: true,
      },
      {
        name: "durationSeconds",
        label: "Duration (seconds)",
        kind: "number",
        required: true,
      },
      {
        name: "questions",
        label: "Questions",
        kind: "json",
        rows: 8,
        help: QUESTIONS_HELP,
      },
    ],
    blank: () => ({
      id: 0n,
      title: "",
      description: "",
      kind: "fullLength",
      level: "b1",
      skill: "reading",
      durationSeconds: 3600n,
      questions: [],
    }),
    summarize: (r) => (r as MockTest).title,
    meta: (r) => {
      const t = r as MockTest;
      return `${t.questions.length} question${t.questions.length === 1 ? "" : "s"} · ${Number(t.durationSeconds) / 60} min`;
    },
  },
  {
    kind: "passages",
    singular: "reading passage",
    plural: "Reading passages",
    queryKey: "passages",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      {
        name: "level",
        label: "CEFR level",
        kind: "level",
        options: LEVEL_OPTIONS,
        required: true,
      },
      { name: "body", label: "Passage text", kind: "textarea", rows: 10 },
      {
        name: "choiceQuestions",
        label: "Multiple-choice questions",
        kind: "json",
        rows: 6,
        help: "JSON array: {id, prompt, options[], correctIndex, explanation}.",
      },
      {
        name: "matchingQuestions",
        label: "Matching questions",
        kind: "json",
        rows: 6,
        help: "JSON array: {id, prompt, left[], right[], correctRightIndex[]}.",
      },
    ],
    blank: () => ({
      id: 0n,
      title: "",
      level: "b1",
      body: "",
      choiceQuestions: [],
      matchingQuestions: [],
    }),
    summarize: (r) => (r as ReadingPassage).title,
    meta: (r) => {
      const p = r as ReadingPassage;
      const count = p.choiceQuestions.length + p.matchingQuestions.length;
      return `${count} question${count === 1 ? "" : "s"}`;
    },
  },
  {
    kind: "listening",
    singular: "listening item",
    plural: "Listening items",
    queryKey: "listening",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      {
        name: "level",
        label: "CEFR level",
        kind: "level",
        options: LEVEL_OPTIONS,
        required: true,
      },
      {
        name: "audioUrl",
        label: "Audio URL",
        kind: "text",
        required: true,
        placeholder: "https://…/clip.mp3",
      },
      {
        name: "transcript",
        label: "Transcript",
        kind: "textarea",
        rows: 6,
      },
      {
        name: "questions",
        label: "Questions",
        kind: "json",
        rows: 6,
        help: "JSON array: {id, prompt, options[], correctIndex, explanation}.",
      },
    ],
    blank: () => ({
      id: 0n,
      title: "",
      level: "b1",
      audioUrl: "",
      transcript: "",
      questions: [],
    }),
    summarize: (r) => (r as ListeningItem).title,
    meta: (r) => {
      const l = r as ListeningItem;
      return `${l.questions.length} question${l.questions.length === 1 ? "" : "s"}`;
    },
  },
  {
    kind: "speakingCards",
    singular: "speaking card",
    plural: "Speaking cards",
    queryKey: "speakingCards",
    fields: [
      {
        name: "prompt",
        label: "Prompt",
        kind: "textarea",
        rows: 3,
        required: true,
      },
      {
        name: "level",
        label: "CEFR level",
        kind: "level",
        options: LEVEL_OPTIONS,
        required: true,
      },
      {
        name: "prepSeconds",
        label: "Prep time (seconds)",
        kind: "number",
        required: true,
      },
      {
        name: "speakSeconds",
        label: "Speaking time (seconds)",
        kind: "number",
        required: true,
      },
      { name: "tips", label: "Tips", kind: "textarea", rows: 3 },
    ],
    blank: () => ({
      id: 0n,
      prompt: "",
      level: "b1",
      prepSeconds: 60n,
      speakSeconds: 120n,
      tips: "",
    }),
    summarize: (r) => (r as SpeakingCard).prompt,
    meta: (r) => {
      const c = r as SpeakingCard;
      return `${Number(c.prepSeconds)}s prep · ${Number(c.speakSeconds)}s speak`;
    },
  },
  {
    kind: "writingPrompts",
    singular: "writing prompt",
    plural: "Writing prompts",
    queryKey: "writingPrompts",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      {
        name: "level",
        label: "CEFR level",
        kind: "level",
        options: LEVEL_OPTIONS,
        required: true,
      },
      {
        name: "prompt",
        label: "Prompt",
        kind: "textarea",
        rows: 4,
        required: true,
      },
      {
        name: "minWords",
        label: "Minimum words",
        kind: "number",
        required: true,
      },
      {
        name: "maxWords",
        label: "Maximum words",
        kind: "number",
        required: true,
      },
      { name: "modelAnswer", label: "Model answer", kind: "textarea", rows: 8 },
    ],
    blank: () => ({
      id: 0n,
      title: "",
      level: "b1",
      prompt: "",
      minWords: 120n,
      maxWords: 180n,
      modelAnswer: "",
    }),
    summarize: (r) => (r as WritingPrompt).title,
    meta: (r) => {
      const w = r as WritingPrompt;
      return `${Number(w.minWords)}–${Number(w.maxWords)} words`;
    },
  },
  {
    kind: "links",
    singular: "link",
    plural: "Links",
    queryKey: "links",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      {
        name: "url",
        label: "URL",
        kind: "text",
        required: true,
        placeholder: "https://…",
      },
      { name: "category", label: "Category", kind: "text", required: true },
      { name: "description", label: "Description", kind: "textarea", rows: 3 },
      {
        name: "level",
        label: "CEFR level (optional)",
        kind: "level",
        options: LEVEL_OPTIONS,
      },
    ],
    blank: () => ({
      id: 0n,
      title: "",
      url: "",
      category: "",
      description: "",
      level: undefined,
    }),
    summarize: (r) => (r as ExternalLink).title,
    meta: (r) => (r as ExternalLink).category,
  },
  {
    kind: "announcements",
    singular: "announcement",
    plural: "Announcements",
    queryKey: "announcements",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      {
        name: "body",
        label: "Body",
        kind: "textarea",
        rows: 5,
        required: true,
      },
    ],
    blank: () => ({
      id: 0n,
      title: "",
      body: "",
      createdAt: BigInt(Date.now()) * 1_000_000n,
    }),
    summarize: (r) => (r as Announcement).title,
    meta: (r) => (r as Announcement).body.slice(0, 80),
  },
];

export function configFor(kind: string): ContentTypeConfig {
  const config = CONTENT_TYPES.find((c) => c.kind === kind);
  if (!config) throw new Error(`Unknown content type: ${kind}`);
  return config;
}

/** Reads a record's id as a bigint regardless of the union member. */
export function recordId(record: ContentRecord): bigint {
  return record.id;
}
