import { renderWithActor } from "@/__tests__/test-utils";
import type { SpeakingCard } from "@/backend";
import { CefrLevel } from "@/backend";
import { SpeakingPractice } from "@/components/speaking/SpeakingPractice";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const card: SpeakingCard = {
  id: 1n,
  prompt: "Describe a memorable journey you have taken.",
  tips: "Use past tenses and time expressions.",
  level: CefrLevel.b1,
  prepSeconds: 5n,
  speakSeconds: 10n,
};

/** Minimal MediaRecorder stand-in that emits a data chunk on stop. */
class FakeMediaRecorder {
  static instances: FakeMediaRecorder[] = [];
  mimeType = "audio/webm";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  state = "inactive";

  constructor(_stream: unknown) {
    FakeMediaRecorder.instances.push(this);
  }

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["audio-bytes"]) });
    this.onstop?.();
  }
}

beforeEach(() => {
  FakeMediaRecorder.instances = [];
  vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn(async () => ({
        getTracks: () => [{ stop: vi.fn() }],
      })),
    },
  });
  // jsdom's URL lacks the object-URL helpers; define them for the recorder.
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:recording"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Speaking", () => {
  it("runs a prep countdown then a speaking countdown", async () => {
    vi.useFakeTimers();
    renderWithActor(<SpeakingPractice card={card} />, {});

    expect(screen.getByTestId("speaking.phase_state")).toHaveTextContent(
      "Ready",
    );

    fireEvent.click(screen.getByTestId("speaking.start_button"));
    expect(screen.getByTestId("speaking.phase_state")).toHaveTextContent(
      "Preparing",
    );
    expect(screen.getByTestId("speaking.timer")).toHaveTextContent("00:05");

    // The prep countdown ticks down while it runs.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(screen.getByTestId("speaking.timer")).toHaveTextContent("00:03");

    // Skipping ahead starts the speaking countdown.
    fireEvent.click(screen.getByTestId("speaking.skip_button"));
    expect(screen.getByTestId("speaking.phase_state")).toHaveTextContent(
      "Speaking",
    );
    expect(screen.getByTestId("speaking.timer")).toHaveTextContent("00:10");

    // Let the speaking countdown run out; the phase completes.
    for (let i = 0; i < 11; i += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    }
    expect(screen.getByTestId("speaking.timer")).toHaveTextContent("00:00");
    expect(screen.getByTestId("speaking.phase_state")).toHaveTextContent(
      "Time's up",
    );
  });

  it("records, plays back and downloads the voice answer", async () => {
    renderWithActor(<SpeakingPractice card={card} />, {});

    fireEvent.click(screen.getByTestId("speaking.recorder.start_button"));
    await waitFor(() =>
      expect(
        screen.getByTestId("speaking.recorder.recording_state"),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("speaking.recorder.stop_button"));

    // Playback and download become available once a take exists.
    expect(
      await screen.findByTestId("speaking.recorder.playback"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("speaking.recorder.audio")).toHaveAttribute(
      "src",
      "blob:recording",
    );
    expect(
      screen.getByTestId("speaking.recorder.download_button"),
    ).toBeInTheDocument();
  });
});
