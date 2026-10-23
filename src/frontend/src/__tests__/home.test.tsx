import App from "@/App";
import { renderWithActor } from "@/__tests__/test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

function makeActor() {
  return {
    listAnnouncements: vi.fn(async () => []),
  };
}

describe("App shell", () => {
  it("renders the default route with the main navigation, not a blank screen", async () => {
    renderWithActor(<App />, makeActor());

    // The hero heading proves the default route rendered content.
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
      /Elevate Your English/i,
    );

    // The primary navigation is present and links to every module.
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav).toBeInTheDocument();
    for (const ocid of [
      "nav.home_link",
      "nav.mock_tests_link",
      "nav.reading_link",
      "nav.listening_link",
      "nav.speaking_link",
      "nav.writing_link",
      "nav.dictionary_link",
      "nav.links_link",
      "nav.admin_link",
    ]) {
      expect(nav.querySelector(`[data-ocid="${ocid}"]`)).not.toBeNull();
    }

    // The theme toggle is reachable from the shell.
    expect(screen.getByTestId("theme.toggle")).toBeInTheDocument();
  });
});
