import type { CefrLevel } from "@/backend";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocalSavedWord {
  word: string;
  definition: string;
  level?: CefrLevel;
  savedAt: number;
}

interface SavedWordsState {
  words: LocalSavedWord[];
  addWord: (word: LocalSavedWord) => void;
  removeWord: (word: string) => void;
  hasWord: (word: string) => boolean;
  clear: () => void;
}

/** Local mirror of saved dictionary words so the module works before sign-in. */
export const useSavedWordsStore = create<SavedWordsState>()(
  persist(
    (set, get) => ({
      words: [],
      addWord: (word) =>
        set((state) => ({
          words: [
            word,
            ...state.words.filter(
              (w) => w.word.toLowerCase() !== word.word.toLowerCase(),
            ),
          ],
        })),
      removeWord: (word) =>
        set((state) => ({
          words: state.words.filter(
            (w) => w.word.toLowerCase() !== word.toLowerCase(),
          ),
        })),
      hasWord: (word) =>
        get().words.some((w) => w.word.toLowerCase() === word.toLowerCase()),
      clear: () => set({ words: [] }),
    }),
    { name: "cefr-saved-words" },
  ),
);
