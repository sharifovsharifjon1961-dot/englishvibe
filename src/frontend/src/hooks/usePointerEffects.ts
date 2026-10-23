import { useCallback, useEffect, useState } from "react";

/**
 * Tracks whether decorative pointer effects (flashlight, glow cards) should
 * run. Disabled on touch/coarse pointers and when the user prefers reduced
 * motion, matching the CSS guards in index.css.
 */
export function usePointerEffects(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    const update = () =>
      setEnabled(!motionQuery.matches && pointerQuery.matches);
    update();
    motionQuery.addEventListener("change", update);
    pointerQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      pointerQuery.removeEventListener("change", update);
    };
  }, []);

  return enabled;
}

/**
 * Updates the `--mx` / `--my` CSS variables on the document root inside a
 * requestAnimationFrame loop so the flashlight layer follows the pointer.
 */
export function useFlashlight(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let pendingX = 0;
    let pendingY = 0;
    let hasPending = false;

    const flush = () => {
      frame = 0;
      if (!hasPending) return;
      hasPending = false;
      const root = document.documentElement;
      root.style.setProperty("--mx", `${pendingX}px`);
      root.style.setProperty("--my", `${pendingY}px`);
    };

    const onMove = (event: PointerEvent) => {
      pendingX = event.clientX;
      pendingY = event.clientY;
      hasPending = true;
      if (!frame) frame = window.requestAnimationFrame(flush);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled]);
}

/** Tracks a pointer position within an element as `--x` / `--y` percentages. */
export function useGlowPointer<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);

  const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--y", `${event.clientY - rect.top}px`);
    target.style.setProperty(
      "--card-mx",
      `${((event.clientX - rect.left) / rect.width) * 100}%`,
    );
    target.style.setProperty(
      "--card-my",
      `${((event.clientY - rect.top) / rect.height) * 100}%`,
    );
  }, []);

  return { ref: setElement, element, onPointerMove };
}
