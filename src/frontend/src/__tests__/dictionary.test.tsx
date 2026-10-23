import { renderWithActor } from "@/__tests__/test-utils";
import type { SavedWord } from "@/backend";
import { CefrLevel } from "@/backend";
import DictionaryPage from "@/pages/DictionaryPage";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const lookupWord = vi.hoisted(() => vi.fn());
vi.mock("@/utils/dictionary", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/dictionary")>()),
  lookupWord,
}));

function makeActor(saved: SavedWord[]) {
  const store = structuredClone(saved);
  return {
    listSavedWords: vi.fn<() => Promise<SavedWord[]>>(async () =>
      structuredClone(store),
    ),
    saveWord: vi.fn<(word: SavedWord) => Promise<void>>(async (word) => {
      store.push(structuredClone(word));
    }),
    removeSavedWord: vi.fn<(word: string) => Promise<boolean>>(async (word) => {
      const index = store.findIndex((entry) => entry.word === word);
      if (index >= 0) store.splice(index, 1);
      return index >= 0;
    }),
  };
}

beforeEach(() => {
  lookupWord.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Dictionary", () => {
  it("looks up a word after the debounce and shows its CEFR badge", async () => {
    const user = userEvent.setup();
    lookupWord.mockResolvedValue({
      word: "ubiquitous",
      level: CefrLevel.c1,
      definitions: [
        {
          partOfSpeech: "adjective",
          definition: "Present everywhere at once.",
          example: "Phones are ubiquitous today.",
        },
      ],
      synonyms: [],
      examples: ["Phones are ubiquitous today."],
      source: "dictionaryapi",
    });

    renderWithActor(<DictionaryPage />, makeActor([]));

    await user.type(
      screen.getByRole("searchbox", { name: /Search for a word/i }),
      "ubiquitous",
    );

    // Debounced lookup fires without an explicit submit.
    await waitFor(() => expect(lookupWord).toHaveBeenCalledWith("ubiquitous"));
    expect(
      await screen.findByRole("heading", { name: "ubiquitous" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Present everywhere at once.")).toBeInTheDocument();
    // The example sentence is rendered in the definitions and examples sections.
    expect(
      screen.getAllByText("Phones are ubiquitous today.").length,
    ).toBeGreaterThan(0);
    // CEFR level badge from the local dataset.
    expect(screen.getByText("C1")).toBeInTheDocument();
  });

  it("saves a looked-up word and shows it in flashcard mode", async () => {
    const user = userEvent.setup();
    lookupWord.mockResolvedValue({
      word: "happy",
      level: CefrLevel.b1,
      definitions: [
        { partOfSpeech: "adjective", definition: "Feeling pleasure." },
      ],
      synonyms: ["glad", "cheerful"],
      examples: [],
      source: "dictionaryapi",
    });

    renderWithActor(<DictionaryPage />, makeActor([]));

    await user.type(
      screen.getByRole("searchbox", { name: /Search for a word/i }),
      "happy",
    );
    await screen.findByRole("heading", { name: "happy" });
    expect(screen.getByText("glad")).toBeInTheDocument();

    // Save the word; the button flips to the saved state.
    await user.click(screen.getByRole("button", { name: /Save word/ }));
    expect(
      await screen.findByRole("button", { name: /Saved/ }),
    ).toBeInTheDocument();

    // The saved word appears in the saved-words panel and can be reviewed.
    expect(
      await screen.findByTestId("dictionary.saved_panel"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Review flashcards/ }));
    expect(
      await screen.findByTestId("dictionary.flashcard_modal"),
    ).toBeInTheDocument();
  });
});
