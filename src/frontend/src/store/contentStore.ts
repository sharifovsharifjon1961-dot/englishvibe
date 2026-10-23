import type {
  Announcement,
  ExternalLink,
  ListeningItem,
  MockTest,
  ReadingPassage,
  SpeakingCard,
  WritingPrompt,
} from "@/backend";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ContentCache {
  tests: MockTest[];
  passages: ReadingPassage[];
  listening: ListeningItem[];
  speakingCards: SpeakingCard[];
  writingPrompts: WritingPrompt[];
  links: ExternalLink[];
  announcements: Announcement[];
}

const emptyCache: ContentCache = {
  tests: [],
  passages: [],
  listening: [],
  speakingCards: [],
  writingPrompts: [],
  links: [],
  announcements: [],
};

interface ContentState {
  cache: ContentCache;
  hydrated: boolean;
  setCache: (cache: Partial<ContentCache>) => void;
  reset: () => void;
}

/**
 * Local content cache so every module renders instantly on first load while
 * the backend query resolves. Backend data always wins once it arrives.
 */
export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      cache: emptyCache,
      hydrated: false,
      setCache: (cache) =>
        set((state) => ({
          cache: { ...state.cache, ...cache },
          hydrated: true,
        })),
      reset: () => set({ cache: emptyCache, hydrated: false }),
    }),
    { name: "cefr-content-cache" },
  ),
);
