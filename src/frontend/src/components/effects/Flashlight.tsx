import { useFlashlight, usePointerEffects } from "@/hooks/usePointerEffects";

/**
 * Fixed cursor-tracking flashlight layer. Renders nothing on touch devices or
 * when the user prefers reduced motion (the hook returns `false`).
 */
export function Flashlight() {
  const enabled = usePointerEffects();
  useFlashlight(enabled);

  if (!enabled) return null;

  return <div aria-hidden="true" className="flashlight-layer" />;
}
