import { createActor } from "@/backend";
import type {
  Announcement,
  ContentBundle,
  ExternalLink,
  ListeningItem,
  MockTest,
  ReadingPassage,
  SavedWord,
  SpeakingCard,
  WritingDraft,
  WritingPrompt,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/* Content queries                                                     */
/* ------------------------------------------------------------------ */

export function useTests() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<MockTest[]>({
    queryKey: ["tests"],
    queryFn: async () => (actor ? actor.listTests() : []),
    enabled: !!actor && !isFetching,
  });
}

export function usePassages() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ReadingPassage[]>({
    queryKey: ["passages"],
    queryFn: async () => (actor ? actor.listPassages() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useListeningItems() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ListeningItem[]>({
    queryKey: ["listening"],
    queryFn: async () => (actor ? actor.listListening() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useSpeakingCards() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SpeakingCard[]>({
    queryKey: ["speakingCards"],
    queryFn: async () => (actor ? actor.listSpeakingCards() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useWritingPrompts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<WritingPrompt[]>({
    queryKey: ["writingPrompts"],
    queryFn: async () => (actor ? actor.listWritingPrompts() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useLinks() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ExternalLink[]>({
    queryKey: ["links"],
    queryFn: async () => (actor ? actor.listLinks() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useAnnouncements() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => (actor ? actor.listAnnouncements() : []),
    enabled: !!actor && !isFetching,
  });
}

/* ------------------------------------------------------------------ */
/* Saved words + drafts                                                */
/* ------------------------------------------------------------------ */

export function useSavedWords() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SavedWord[]>({
    queryKey: ["savedWords"],
    queryFn: async () => (actor ? actor.listSavedWords() : []),
    enabled: !!actor && !isFetching,
  });
}

export function useDrafts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<WritingDraft[]>({
    queryKey: ["drafts"],
    queryFn: async () => (actor ? actor.listDrafts() : []),
    enabled: !!actor && !isFetching,
  });
}

/* ------------------------------------------------------------------ */
/* Admin mutations                                                     */
/* ------------------------------------------------------------------ */

export function useUpsertTest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (test: MockTest) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.upsertTest(test);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useDeleteTest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteTest(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}

export function useUpsertPassage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (passage: ReadingPassage) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.upsertPassage(passage);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["passages"] });
    },
  });
}

export function useDeletePassage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deletePassage(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["passages"] });
    },
  });
}

export function useUpsertListening() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: ListeningItem) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.upsertListening(item);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["listening"] });
    },
  });
}

export function useDeleteListening() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteListening(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["listening"] });
    },
  });
}

export function useUpsertSpeakingCard() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (card: SpeakingCard) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.upsertSpeakingCard(card);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["speakingCards"] });
    },
  });
}

export function useDeleteSpeakingCard() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteSpeakingCard(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["speakingCards"] });
    },
  });
}

export function useUpsertWritingPrompt() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prompt: WritingPrompt) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.upsertWritingPrompt(prompt);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["writingPrompts"] });
    },
  });
}

export function useDeleteWritingPrompt() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteWritingPrompt(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["writingPrompts"] });
    },
  });
}

export function useUpsertLink() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (link: ExternalLink) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.upsertLink(link);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

export function useDeleteLink() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteLink(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

export function useUpsertAnnouncement() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (announcement: Announcement) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.upsertAnnouncement(announcement);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useDeleteAnnouncement() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteAnnouncement(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Saved words + drafts mutations                                      */
/* ------------------------------------------------------------------ */

export function useSaveWord() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (word: SavedWord) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveWord(word);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["savedWords"] });
    },
  });
}

export function useRemoveSavedWord() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (word: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.removeSavedWord(word);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["savedWords"] });
    },
  });
}

export function useSaveDraft() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: WritingDraft) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveDraft(draft);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["drafts"] });
    },
  });
}

export function useDeleteDraft() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptId: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteDraft(promptId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["drafts"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Admin session + import/export                                       */
/* ------------------------------------------------------------------ */

export function useCheckAdminPasscode() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (passcode: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.checkAdminPasscode(passcode);
    },
  });
}

export function useExportContent() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.exportContent();
    },
  });
}

export function useImportContent() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (json: string): Promise<ContentBundle> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.importContent(json);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
}
