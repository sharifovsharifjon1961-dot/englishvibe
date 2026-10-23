import { renderWithActor } from "@/__tests__/test-utils";
import { AudioPlayer } from "@/components/listening/AudioPlayer";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * jsdom does not implement media playback, so stub the handful of
 * HTMLMediaElement members the player touches and drive the events it listens
 * for directly.
 */
function stubMedia() {
  const play = vi
    .spyOn(HTMLMediaElement.prototype, "play")
    .mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
  const pause = vi
    .spyOn(HTMLMediaElement.prototype, "pause")
    .mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"));
    });
  const load = vi
    .spyOn(HTMLMediaElement.prototype, "load")
    .mockImplementation(() => {});
  return { play, pause, load };
}

beforeEach(() => {
  // Radix Slider observes its own size; jsdom has no ResizeObserver.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  stubMedia();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Listening player", () => {
  it("plays, pauses, changes speed and skips 10 seconds", async () => {
    const user = userEvent.setup();
    renderWithActor(
      <AudioPlayer src="/audio/one.mp3" title="Track one" playOnce={false} />,
      {},
    );

    const audio = document.querySelector("audio") as HTMLAudioElement;
    // Simulate metadata loading so the controls become enabled.
    Object.defineProperty(audio, "duration", {
      configurable: true,
      value: 120,
    });
    fireEvent.loadedMetadata(audio);

    const playButton = await screen.findByTestId("listening.play_button");
    await waitFor(() => expect(playButton).toBeEnabled());

    // Play then pause.
    await user.click(playButton);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByTestId("listening.play_button")).toHaveAccessibleName(
        "Pause audio",
      ),
    );
    await user.click(screen.getByTestId("listening.play_button"));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();

    // Speed buttons reflect the selected rate.
    await user.click(screen.getByTestId("listening.speed.1.25"));
    expect(screen.getByTestId("listening.speed.1.25")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(audio.playbackRate).toBe(1.25);

    // Skip forward 10 seconds from the start.
    await user.click(screen.getByTestId("listening.skip_forward_button"));
    expect(audio.currentTime).toBe(10);
    expect(screen.getByTestId("listening.current_time")).toHaveTextContent(
      "0:10",
    );
  });

  it("locks replay in play-once mode after the first listen", async () => {
    const user = userEvent.setup();
    renderWithActor(
      <AudioPlayer src="/audio/two.mp3" title="Track two" playOnce />,
      {},
    );

    const audio = document.querySelector("audio") as HTMLAudioElement;
    Object.defineProperty(audio, "duration", {
      configurable: true,
      value: 60,
    });
    fireEvent.loadedMetadata(audio);

    const playButton = await screen.findByTestId("listening.play_button");
    await waitFor(() => expect(playButton).toBeEnabled());
    await user.click(playButton);

    // After the first play the controls lock and replay is blocked.
    await waitFor(() =>
      expect(screen.getByTestId("listening.play_button")).toBeDisabled(),
    );
    expect(screen.getByTestId("listening.skip_forward_button")).toBeDisabled();
    expect(screen.getByText(/already been played/i)).toBeInTheDocument();
  });
});
