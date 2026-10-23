import { renderWithActor } from "@/__tests__/test-utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import AdminPage from "@/pages/AdminPage";
import { useAdminStore } from "@/store/adminStore";
import { useThemeStore } from "@/store/themeStore";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  window.localStorage.clear();
  useThemeStore.setState({ theme: "dark" });
  useAdminStore.setState({ isAdmin: false });
  document.documentElement.classList.remove("dark");
});

describe("Theme", () => {
  it("toggles dark/light, applies the class and persists the choice", async () => {
    const user = userEvent.setup();
    renderWithActor(<ThemeToggle />, {});

    // Default theme is dark and applied to the document root.
    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );

    await user.click(screen.getByTestId("theme.toggle"));

    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(false),
    );
    expect(document.documentElement.style.colorScheme).toBe("light");
    // The choice is persisted so the inline script can apply it on reload.
    expect(window.localStorage.getItem("cefr-theme")).toContain("light");
  });
});

describe("Admin gate", () => {
  it("blocks the dashboard without a passcode and rejects a wrong one", async () => {
    const user = userEvent.setup();
    const checkAdminPasscode = vi.fn<(passcode: string) => Promise<boolean>>(
      async (passcode) => passcode === "letmein",
    );
    renderWithActor(<AdminPage />, { checkAdminPasscode });

    // The content manager is not reachable before unlocking.
    expect(screen.getByTestId("admin.login_form")).toBeInTheDocument();
    expect(
      screen.queryByTestId("admin.sign_out_button"),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Passcode"), "wrong-pass");
    await user.click(screen.getByRole("button", { name: /Unlock dashboard/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/not correct/i);
    expect(
      screen.queryByTestId("admin.sign_out_button"),
    ).not.toBeInTheDocument();

    // The correct passcode unlocks the dashboard.
    await user.clear(screen.getByLabelText("Passcode"));
    await user.type(screen.getByLabelText("Passcode"), "letmein");
    await user.click(screen.getByRole("button", { name: /Unlock dashboard/ }));

    expect(
      await screen.findByTestId("admin.sign_out_button"),
    ).toBeInTheDocument();
  });
});
