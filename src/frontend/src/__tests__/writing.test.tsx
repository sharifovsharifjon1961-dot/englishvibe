import { renderWithActor } from "@/__tests__/test-utils";
import type { WritingDraft, WritingPrompt } from "@/backend";
import { CefrLevel } from "@/backend";
import WritingPage from "@/pages/WritingPage";
import { useDraftsStore } from "@/store/draftsStore";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prompt: WritingPrompt = {
  id: 1n,
  title: "Describe your hometown",
  prompt: "Write about the place where you grew up.",
  level: CefrLevel.b1,
  minWords: 5n,
  maxWords: 10n,
  modelAnswer: "I grew up in a small coastal town by the sea.",
};

function makeActor(drafts: WritingDraft[] = []) {
  const store = structuredClone(drafts);
  return {
    listWritingPrompts: vi.fn<() => Promise<WritingPrompt[]>>(async () => [
      structuredClone(prompt),
    ]),
    listDrafts: vi.fn<() => Promise<WritingDraft[]>>(async () =>
      structuredClone(store),
    ),
    saveDraft: vi.fn<(draft: WritingDraft) => Promise<WritingDraft>>(
      async (draft) => {
        const index = store.findIndex(
          (entry) => entry.promptId === draft.promptId,
        );
        if (index >= 0) store[index] = structuredClone(draft);
        else store.push(structuredClone(draft));
        return structuredClone(draft);
      },
    ),
  };
}

beforeEach(() => {
  window.localStorage.clear();
  useDraftsStore.setState({ drafts: {} });
});

describe("Writing", () => {
  it("shows a live word counter against the prompt's target range", async () => {
    const user = userEvent.setup();
    renderWithActor(<WritingPage />, makeActor());

    const editor = await screen.findByLabelText("Your response");
    expect(screen.getByText("Keep going")).toBeInTheDocument();

    await user.type(editor, "one two three four five six");

    // Six words lands inside the 5–10 target range.
    await waitFor(() =>
      expect(screen.getByText("Target reached")).toBeInTheDocument(),
    );
    expect(screen.getByText("Within range")).toBeInTheDocument();
  });

  it("preserves the draft after a reload and expands the model answer", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    const first = renderWithActor(<WritingPage />, actor);

    const editor = await screen.findByLabelText("Your response");
    await user.type(editor, "A draft that must survive a reload.");
    await waitFor(() =>
      expect(actor.saveDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "A draft that must survive a reload.",
        }),
      ),
    );

    // Simulate a reload: unmount and remount with a fresh actor that has no
    // server draft, so the text can only come from the persisted local store.
    first.unmount();
    renderWithActor(<WritingPage />, makeActor());

    const restored = await screen.findByLabelText("Your response");
    expect(restored).toHaveValue("A draft that must survive a reload.");

    // The model answer is collapsed until the toggle is activated.
    expect(
      screen.queryByTestId("writing.model_answer"),
    ).not.toBeInTheDocument();
    await user.click(screen.getByTestId("writing.model_answer_toggle"));
    expect(await screen.findByTestId("writing.model_answer")).toHaveTextContent(
      "I grew up in a small coastal town by the sea.",
    );
  });
});
