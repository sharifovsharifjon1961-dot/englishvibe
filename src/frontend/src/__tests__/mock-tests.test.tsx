import { renderWithActor } from "@/__tests__/test-utils";
import type { MockTest } from "@/backend";
import {
  CefrLevel,
  Skill,
  Variant_choice_matching,
  Variant_fullLength_topicWise,
} from "@/backend";
import MockTestsPage from "@/pages/MockTestsPage";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

function choiceQuestion(id: bigint, correctIndex: bigint) {
  return {
    id,
    kind: Variant_choice_matching.choice,
    skill: Skill.reading,
    choice: {
      id,
      prompt: `Question ${id}`,
      options: ["Alpha", "Beta", "Gamma"],
      correctIndex,
      explanation: `Because ${id}`,
    },
  };
}

const fullLengthTest: MockTest = {
  id: 1n,
  title: "Full Length Paper A",
  description: "A complete exam paper.",
  kind: Variant_fullLength_topicWise.fullLength,
  level: CefrLevel.b1,
  skill: Skill.reading,
  durationSeconds: 120n,
  questions: [choiceQuestion(1n, 0n), choiceQuestion(2n, 1n)],
};

const topicWiseTest: MockTest = {
  id: 2n,
  title: "Topic Wise Grammar",
  description: "Focused grammar drill.",
  kind: Variant_fullLength_topicWise.topicWise,
  level: CefrLevel.c1,
  skill: Skill.grammar,
  durationSeconds: 60n,
  questions: [choiceQuestion(3n, 2n)],
};

function makeActor(tests: MockTest[]) {
  return {
    listTests: vi.fn<() => Promise<MockTest[]>>(async () =>
      structuredClone(tests),
    ),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Mock Tests Hub", () => {
  it("shows Full-Length and Topic-Wise tabs and filters by level and skill", async () => {
    const user = userEvent.setup();
    renderWithActor(
      <MockTestsPage />,
      makeActor([fullLengthTest, topicWiseTest]),
    );

    // Full-Length tab is the default and lists only the full-length test.
    expect(await screen.findByText("Full Length Paper A")).toBeInTheDocument();
    expect(screen.queryByText("Topic Wise Grammar")).not.toBeInTheDocument();

    // Switching to the Topic-Wise tab reveals the topic-wise test.
    await user.click(screen.getByRole("tab", { name: "Topic-Wise" }));
    expect(await screen.findByText("Topic Wise Grammar")).toBeInTheDocument();
    expect(screen.queryByText("Full Length Paper A")).not.toBeInTheDocument();

    // A level filter that matches nothing shows the empty state.
    await user.click(screen.getByRole("button", { name: "B1" }));
    expect(
      await screen.findByText("No tests match your filters"),
    ).toBeInTheDocument();

    // Clearing the filter restores the topic-wise list.
    await user.click(screen.getByRole("button", { name: /Clear/ }));
    expect(await screen.findByText("Topic Wise Grammar")).toBeInTheDocument();
  });

  it("flags a question and reflects answered/flagged state in the navigator", async () => {
    const user = userEvent.setup();
    renderWithActor(<MockTestsPage />, makeActor([fullLengthTest]));

    await user.click(await screen.findByRole("button", { name: /Start test/ }));

    // Answer question 1.
    await user.click(screen.getByText("Alpha"));
    expect(screen.getByText("1 of 2 answered")).toBeInTheDocument();

    // Flag question 1 for review.
    await user.click(screen.getByRole("button", { name: /Flag for review/ }));
    expect(screen.getByRole("button", { name: /Flagged/ })).toBeInTheDocument();

    // Navigator reflects the flagged state on item 1.
    expect(
      screen.getByRole("button", { name: "Go to question 1, flagged" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to question 2, unanswered" }),
    ).toBeInTheDocument();
  });

  it("auto-submits when the countdown reaches zero and shows a CEFR estimate", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
    renderWithActor(<MockTestsPage />, makeActor([fullLengthTest]));

    await user.click(await screen.findByRole("button", { name: /Start test/ }));

    // The runner countdown starts paused; start it explicitly.
    await user.click(screen.getByRole("button", { name: "Resume" }));

    // Answer both questions correctly.
    await user.click(screen.getByText("Alpha"));
    await user.click(screen.getByRole("button", { name: /Next/ }));
    await user.click(screen.getByText("Beta"));

    // Let the 120s countdown run out; the runner auto-submits.
    await vi.advanceTimersByTimeAsync(121_000);

    await waitFor(() => {
      expect(screen.getByText("Test summary")).toBeInTheDocument();
    });
    // 2/2 correct => 100% => C1 estimate.
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText("100% correct")).toBeInTheDocument();
    expect(screen.getByText("C1")).toBeInTheDocument();
  });
});
