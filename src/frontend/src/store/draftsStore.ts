import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocalDraft {
  promptId: number;
  text: string;
  updatedAt: number;
}

interface DraftsState {
  drafts: Record<number, LocalDraft>;
  saveDraft: (promptId: number, text: string) => void;
  getDraft: (promptId: number) => LocalDraft | undefined;
  deleteDraft: (promptId: number) => void;
}

/** Writing drafts autosaved locally so work survives a refresh. */
export const useDraftsStore = create<DraftsState>()(
  persist(
    (set, get) => ({
      drafts: {},
      saveDraft: (promptId, text) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [promptId]: { promptId, text, updatedAt: Date.now() },
          },
        })),
      getDraft: (promptId) => get().drafts[promptId],
      deleteDraft: (promptId) =>
        set((state) => {
          const next = { ...state.drafts };
          delete next[promptId];
          return { drafts: next };
        }),
    }),
    { name: "cefr-drafts" },
  ),
);
