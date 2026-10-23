import { cn } from "@/lib/utils";
import { type ReactNode, useCallback, useRef } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  /** Adds the hover-lift transform on pointer devices. */
  lift?: boolean;
}

/**
 * Card surface whose border glow and inner spotlight follow the pointer via
 * the `--x` / `--y` CSS variables consumed by `.glow-card` in index.css. The
 * glow is disabled by CSS on touch devices and under reduced motion.
 */
export function GlowCard({ children, className, lift = true }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = ref.current;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      target.style.setProperty("--x", `${x}px`);
      target.style.setProperty("--y", `${y}px`);
      target.style.setProperty("--card-mx", `${(x / rect.width) * 100}%`);
      target.style.setProperty("--card-my", `${(y / rect.height) * 100}%`);
    },
    [],
  );

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={cn(
        "glow-card rounded-2xl border border-border bg-card text-card-foreground",
        lift && "hover-lift hover:shadow-elevated",
        className,
      )}
    >
      {children}
    </div>
  );
}
