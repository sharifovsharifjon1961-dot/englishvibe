import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const SPEEDS = [0.75, 1, 1.25] as const;
const SKIP_SECONDS = 10;

interface AudioPlayerProps {
  src: string;
  title: string;
  /** When true, the audio can only be played through once. */
  playOnce: boolean;
  /** Plain-text transcript rendered as a captions track for accessibility. */
  captions?: string;
  /** Fired the first time playback starts. */
  onFirstPlay?: () => void;
  /** Fired when playback reaches the end. */
  onEnded?: () => void;
  className?: string;
}

/** Builds a WebVTT captions track from a plain-text transcript. */
function buildCaptionsUrl(transcript: string): string {
  const text = transcript.trim();
  if (!text) return "";
  const cue = text.replace(/\r\n/g, "\n").replace(/\n/g, " ");
  const vtt = `WEBVTT\n\n00:00:00.000 --> 99:59:59.000\n${cue}\n`;
  return URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Custom audio player: play/pause, seek bar, 0.75x/1x/1.25x speed, skip
 * ±10s, mute and an optional play-once lock that blocks replay after the
 * first listen.
 */
export function AudioPlayer({
  src,
  title,
  playOnce,
  captions,
  onFirstPlay,
  onEnded,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [muted, setMuted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [captionsUrl, setCaptionsUrl] = useState("");

  const locked = playOnce && hasPlayed;

  // Build a captions track from the transcript, revoking the previous blob.
  useEffect(() => {
    const url = captions ? buildCaptionsUrl(captions) : "";
    setCaptionsUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [captions]);

  // Reset all playback state whenever the track changes.
  useEffect(() => {
    const audio = audioRef.current;
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setHasPlayed(false);
    setIsReady(false);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      if (audio.getAttribute("src") !== src) {
        audio.setAttribute("src", src);
        audio.load();
      }
    }
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = speed;
  }, [speed]);

  const handleToggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || locked) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }, [locked]);

  const handleSeek = useCallback(
    (values: number[]) => {
      const audio = audioRef.current;
      const next = values[0];
      if (!audio || next === undefined || locked) return;
      audio.currentTime = next;
      setCurrentTime(next);
    },
    [locked],
  );

  const handleSkip = useCallback(
    (delta: number) => {
      const audio = audioRef.current;
      if (!audio || locked) return;
      const next = Math.min(
        Math.max(audio.currentTime + delta, 0),
        audio.duration || 0,
      );
      audio.currentTime = next;
      setCurrentTime(next);
    },
    [locked],
  );

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    if (!hasPlayed) {
      setHasPlayed(true);
      onFirstPlay?.();
    }
  }, [hasPlayed, onFirstPlay]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  return (
    <div
      data-ocid="listening.player"
      className={cn(
        "flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-subtle sm:p-6",
        className,
      )}
    >
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          setIsReady(true);
        }}
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onPlay={handlePlay}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
      >
        <track
          kind="captions"
          src={captionsUrl || undefined}
          srcLang="en"
          label="English transcript"
          default
        />
      </audio>

      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Volume2 className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-foreground">
            {title}
          </p>
          <p className="text-xs text-muted-foreground">
            {locked
              ? "Play-once mode — this track has already been played."
              : "Listen carefully, then answer the questions below."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Slider
          data-ocid="listening.seek"
          value={[currentTime]}
          min={0}
          max={duration || 0}
          step={0.1}
          disabled={!isReady || locked}
          onValueChange={handleSeek}
          aria-label="Seek audio position"
        />
        <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
          <span data-ocid="listening.current_time">
            {formatTime(currentTime)}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          data-ocid="listening.skip_back_button"
          aria-label="Skip back 10 seconds"
          disabled={!isReady || locked}
          onClick={() => handleSkip(-SKIP_SECONDS)}
          className="btn-neon-accent rounded-full"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          size="icon"
          data-ocid="listening.play_button"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
          disabled={!isReady || locked}
          onClick={handleToggle}
          className="btn-neon size-14 rounded-full"
        >
          {isPlaying ? (
            <Pause className="size-6" aria-hidden="true" />
          ) : (
            <Play className="size-6" aria-hidden="true" />
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          data-ocid="listening.skip_forward_button"
          aria-label="Skip forward 10 seconds"
          disabled={!isReady || locked}
          onClick={() => handleSkip(SKIP_SECONDS)}
          className="btn-neon-accent rounded-full"
        >
          <RotateCw className="size-4" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-ocid="listening.mute_button"
          aria-label={muted ? "Unmute audio" : "Mute audio"}
          disabled={!isReady}
          onClick={() => {
            const audio = audioRef.current;
            if (audio) audio.muted = !audio.muted;
          }}
          className="rounded-full"
        >
          {muted ? (
            <VolumeX className="size-4" aria-hidden="true" />
          ) : (
            <Volume2 className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2 border-t border-border pt-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Playback speed
        </span>
        <fieldset
          aria-label="Playback speed"
          className="inline-flex rounded-full border border-border bg-muted p-1"
        >
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              data-ocid={`listening.speed.${value}`}
              aria-pressed={speed === value}
              onClick={() => setSpeed(value)}
              className={cn(
                "rounded-full px-4 py-1.5 font-mono text-xs font-semibold transition-smooth",
                speed === value
                  ? "bg-primary text-primary-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {value}x
            </button>
          ))}
        </fieldset>
      </div>
    </div>
  );
}
