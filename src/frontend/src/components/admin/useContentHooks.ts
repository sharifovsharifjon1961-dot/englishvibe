import type {
  Announcement,
  ExternalLink,
  ListeningItem,
  MockTest,
  ReadingPassage,
  SpeakingCard,
  WritingPrompt,
} from "@/backend";
import type { ContentKind, ContentRecord } from "@/components/admin/types";
import {
  useAnnouncements,
  useDeleteAnnouncement,
  useDeleteLink,
  useDeleteListening,
  useDeletePassage,
  useDeleteSpeakingCard,
  useDeleteTest,
  useDeleteWritingPrompt,
  useLinks,
  useListeningItems,
  usePassages,
  useSpeakingCards,
  useTests,
  useUpsertAnnouncement,
  useUpsertLink,
  useUpsertListening,
  useUpsertPassage,
  useUpsertSpeakingCard,
  useUpsertTest,
  useUpsertWritingPrompt,
  useWritingPrompts,
} from "@/hooks/useQueries";

interface KindHooks {
  records: ContentRecord[];
  loading: boolean;
  upsert: (record: ContentRecord) => Promise<unknown>;
  remove: (id: bigint) => Promise<unknown>;
}

/**
 * Resolves the list, upsert and delete hooks for the active content kind.
 * All hooks are called unconditionally so the hook order stays stable.
 */
export function useContentHooks(kind: ContentKind): KindHooks {
  const tests = useTests();
  const passages = usePassages();
  const listening = useListeningItems();
  const speakingCards = useSpeakingCards();
  const writingPrompts = useWritingPrompts();
  const links = useLinks();
  const announcements = useAnnouncements();

  const upsertTest = useUpsertTest();
  const deleteTest = useDeleteTest();
  const upsertPassage = useUpsertPassage();
  const deletePassage = useDeletePassage();
  const upsertListening = useUpsertListening();
  const deleteListening = useDeleteListening();
  const upsertSpeakingCard = useUpsertSpeakingCard();
  const deleteSpeakingCard = useDeleteSpeakingCard();
  const upsertWritingPrompt = useUpsertWritingPrompt();
  const deleteWritingPrompt = useDeleteWritingPrompt();
  const upsertLink = useUpsertLink();
  const deleteLink = useDeleteLink();
  const upsertAnnouncement = useUpsertAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  switch (kind) {
    case "tests":
      return {
        records: tests.data ?? [],
        loading: tests.isLoading,
        upsert: (r) => upsertTest.mutateAsync(r as MockTest),
        remove: (id) => deleteTest.mutateAsync(id),
      };
    case "passages":
      return {
        records: passages.data ?? [],
        loading: passages.isLoading,
        upsert: (r) => upsertPassage.mutateAsync(r as ReadingPassage),
        remove: (id) => deletePassage.mutateAsync(id),
      };
    case "listening":
      return {
        records: listening.data ?? [],
        loading: listening.isLoading,
        upsert: (r) => upsertListening.mutateAsync(r as ListeningItem),
        remove: (id) => deleteListening.mutateAsync(id),
      };
    case "speakingCards":
      return {
        records: speakingCards.data ?? [],
        loading: speakingCards.isLoading,
        upsert: (r) => upsertSpeakingCard.mutateAsync(r as SpeakingCard),
        remove: (id) => deleteSpeakingCard.mutateAsync(id),
      };
    case "writingPrompts":
      return {
        records: writingPrompts.data ?? [],
        loading: writingPrompts.isLoading,
        upsert: (r) => upsertWritingPrompt.mutateAsync(r as WritingPrompt),
        remove: (id) => deleteWritingPrompt.mutateAsync(id),
      };
    case "links":
      return {
        records: links.data ?? [],
        loading: links.isLoading,
        upsert: (r) => upsertLink.mutateAsync(r as ExternalLink),
        remove: (id) => deleteLink.mutateAsync(id),
      };
    case "announcements":
      return {
        records: announcements.data ?? [],
        loading: announcements.isLoading,
        upsert: (r) => upsertAnnouncement.mutateAsync(r as Announcement),
        remove: (id) => deleteAnnouncement.mutateAsync(id),
      };
  }
}
