import type { SpeakingCard } from "@/backend";
import { GlowCard } from "@/components/effects/GlowCard";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { cn } from "@/lib/utils";
import { Clock, MessageSquareQuote } from "lucide-react";

interface SpeakingCardTileProps {
  card: SpeakingCard;
  isActive: boolean;
  onSelect: (card: SpeakingCard) => void;
}

/** Browsable question-card tile showing the prompt, level and timings. */
export function SpeakingCardTile({
  card,
  isActive,
  onSelect,
}: SpeakingCardTileProps) {
  const prep = Number(card.prepSeconds);
  const speak = Number(card.speakSeconds);

  return (
    <GlowCard
      className={cn(
        "flex h-full flex-col gap-4 p-5",
        isActive && "border-primary/60 ring-1 ring-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <LevelBadge level={card.level} />
        <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          {prep}s prep · {speak}s speak
        </span>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-foreground">
        {card.prompt}
      </p>

      <button
        type="button"
        data-ocid={`speaking.card.${Number(card.id)}`}
        onClick={() => onSelect(card)}
        aria-pressed={isActive}
        className={cn(
          "btn-neon inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-foreground hover:border-primary/60 hover:text-primary",
        )}
      >
        <MessageSquareQuote className="size-4" aria-hidden="true" />
        {isActive ? "Selected" : "Practise this card"}
      </button>
    </GlowCard>
  );
}
