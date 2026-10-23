import { renderWithActor } from "@/__tests__/test-utils";
import type { ReadingPassage } from "@/backend";
import { CefrLevel } from "@/backend";
import { PassageView } from "@/components/reading/PassageView";
import { ReadingTimer } from "@/components/reading/ReadingTimer";
import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const passage: ReadingPassage = {
  id: 1n,
  title: "The Coastal Town",
  body: "The town sits beside a wide blue bay. Fishermen leave at dawn.",
  level: CefrLevel.b1,
  choiceQuestions: [],
  matchingQuestions: [],
};

afterEach(() => {
  vi.useRealTimers();
});

describe("Reading", () => {
  it("changes font size and highlights a selected phrase", async () => {
    const user = userEvent.setup();
    const onAddHighlight = vi.fn();
    renderWithActor(
      <PassageView
        passage={passage}
        highlights={[]}
        onAddHighlight={onAddHighlight}
        onRemoveHighlight={vi.fn()}
        onClearHighlights={vi.fn()}
      />,
      {},
    );

    // Font size starts at 18px and increases by one step.
    expect(screen.getByTestId("reading.font_size_value")).toHaveTextContent(
      "18px",
    );
    await user.click(screen.getByTestId("reading.font_increase_button"));
    expect(screen.getByTestId("reading.font_size_value")).toHaveTextContent(
      "19px",
    );

    // Simulate selecting a phrase inside the passage body.
    const body = screen.getByTestId("reading.passage_body");
    const textNode = body.querySelector("span")?.firstChild;
    expect(textNode).not.toBeNull();
    const range = document.createRange();
    range.setStart(textNode as Node, 0);
    range.setEnd(textNode as Node, 8);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    await act(async () => {
      body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    });

    const highlightButton = screen.getByTestId("reading.highlight_button");
    expect(highlightButton).toBeEnabled();
    await user.click(highlightButton);
    expect(onAddHighlight).toHaveBeenCalledWith("The town");
  });

  it("starts, pauses and resets the study timer", async () => {
    vi.useFakeTimers();
    renderWithActor(<ReadingTimer />, {});

    expect(screen.getByTestId("reading.timer_display")).toHaveTextContent(
      "10:00",
    );

    fireEvent.click(screen.getByTestId("reading.timer_start_button"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByTestId("reading.timer_display")).toHaveTextContent(
      "09:57",
    );

    // Pause freezes the countdown.
    fireEvent.click(screen.getByTestId("reading.timer_pause_button"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.getByTestId("reading.timer_display")).toHaveTextContent(
      "09:57",
    );

    // Reset returns to the initial duration.
    fireEvent.click(screen.getByTestId("reading.timer_reset_button"));
    expect(screen.getByTestId("reading.timer_display")).toHaveTextContent(
      "10:00",
    );
  });
});
