import { applyTheme, useThemeStore } from "@/store/themeStore";
import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

/**
 * Sun/Moon theme toggle. The store is persisted to localStorage and the
 * inline script in index.html applies the stored theme before first paint, so
 * this component only keeps the DOM class in sync after mount.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      data-ocid="theme.toggle"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      onClick={toggleTheme}
      className={
        className ??
        "inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-smooth hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      }
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
