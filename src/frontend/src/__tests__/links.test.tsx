import { renderWithActor } from "@/__tests__/test-utils";
import type { ExternalLink } from "@/backend";
import { CefrLevel } from "@/backend";
import LinksPage from "@/pages/LinksPage";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const links: ExternalLink[] = [
  {
    id: 1n,
    title: "Grammar Guide",
    url: "https://example.com/grammar",
    description: "A complete reference for English grammar.",
    category: "Grammar",
    level: CefrLevel.b1,
  },
  {
    id: 2n,
    title: "Vocabulary Builder",
    url: "https://example.com/vocab",
    description: "Grow your word bank with daily practice.",
    category: "Vocabulary",
    level: CefrLevel.b2,
  },
  {
    id: 3n,
    title: "Past Papers",
    url: "https://example.com/papers",
    description: "Practice with real exam papers.",
    category: "Mock Papers",
  },
];

function makeActor() {
  return {
    listLinks: vi.fn<() => Promise<ExternalLink[]>>(async () =>
      structuredClone(links),
    ),
  };
}

describe("Link Manager", () => {
  it("lists links grouped by category and filters by search and category", async () => {
    const user = userEvent.setup();
    renderWithActor(<LinksPage />, makeActor());

    // All three links render, grouped under their categories.
    expect(await screen.findByText("Grammar Guide")).toBeInTheDocument();
    expect(screen.getByText("Vocabulary Builder")).toBeInTheDocument();
    expect(screen.getByText("Past Papers")).toBeInTheDocument();
    expect(screen.getByTestId("links.result_count")).toHaveTextContent(
      "3 resources found",
    );

    // Search narrows the list to matching titles/descriptions.
    await user.type(screen.getByLabelText("Search links"), "vocab");
    await waitFor(() =>
      expect(screen.getByTestId("links.result_count")).toHaveTextContent(
        "1 resource found",
      ),
    );
    expect(screen.getByText("Vocabulary Builder")).toBeInTheDocument();
    expect(screen.queryByText("Grammar Guide")).not.toBeInTheDocument();

    // Clearing the search restores the full list.
    await user.click(screen.getByTestId("links.search_clear_button"));
    await waitFor(() =>
      expect(screen.getByTestId("links.result_count")).toHaveTextContent(
        "3 resources found",
      ),
    );

    // The category filter narrows to a single category.
    await user.click(screen.getByTestId("links.filter.grammar"));
    await waitFor(() =>
      expect(screen.getByTestId("links.result_count")).toHaveTextContent(
        "1 resource found",
      ),
    );
    expect(screen.getByText("Grammar Guide")).toBeInTheDocument();
    expect(screen.queryByText("Past Papers")).not.toBeInTheDocument();
  });
});
