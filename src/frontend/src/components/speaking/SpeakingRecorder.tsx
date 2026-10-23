import { Button } from "@/components/ui/button";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { cn } from "@/lib/utils";
import { AlertTriangle, Download, Mic, RotateCcw, Square } from "lucide-react";
import { useState } from "react";

interface SpeakingRecorderProps {
  /** Bumped by the parent to clear the previous take when a new card starts. */
  resetKey: number;
}

/** Records the spoken answer and offers playback plus download. */
export function SpeakingRecorder({ resetKey }: SpeakingRecorderProps) {
  const {
    isRecording,
    audioUrl,
    audioBlob,
    error,
    isSupported,
    start,
    stop,
    reset,
  } = useMediaRecorder();

  // Clear the previous take whenever the parent starts a new card.
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    reset();
  }

  const handleDownload = () => {
    if (!audioUrl) return;
    const extension = audioBlob?.type.includes("mp4") ? "m4a" : "webm";
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `speaking-answer.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!isSupported) {
    return (
      <div
        data-ocid="speaking.recorder.unsupported"
        className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground"
      >
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-warning"
          aria-hidden="true"
        />
        <p>
          This browser cannot record audio. Try a recent version of Chrome,
          Edge, Firefox or Safari to record your answer.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {isRecording ? (
          <Button
            type="button"
            variant="destructive"
            data-ocid="speaking.recorder.stop_button"
            onClick={stop}
            className="btn-neon h-11 rounded-full px-6"
          >
            <Square className="size-4" aria-hidden="true" />
            Stop recording
          </Button>
        ) : (
          <Button
            type="button"
            data-ocid="speaking.recorder.start_button"
            onClick={() => void start()}
            className="btn-neon h-11 rounded-full px-6"
          >
            <Mic className="size-4" aria-hidden="true" />
            {audioUrl ? "Record again" : "Start recording"}
          </Button>
        )}

        {audioUrl && !isRecording && (
          <Button
            type="button"
            variant="outline"
            data-ocid="speaking.recorder.reset_button"
            onClick={reset}
            className="h-11 rounded-full px-5"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Clear take
          </Button>
        )}

        {isRecording && (
          <span
            data-ocid="speaking.recorder.recording_state"
            className="flex items-center gap-2 text-sm font-medium text-destructive"
          >
            <span className="size-2.5 animate-pulse rounded-full bg-destructive" />
            Recording…
          </span>
        )}
      </div>

      {error && (
        <div
          data-ocid="speaking.recorder.error_state"
          className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <p>{error}</p>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div
          data-ocid="speaking.recorder.playback"
          className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your recording
          </p>
          <audio
            controls
            src={audioUrl}
            className={cn("w-full")}
            data-ocid="speaking.recorder.audio"
          >
            <track kind="captions" />
          </audio>
          <Button
            type="button"
            variant="secondary"
            data-ocid="speaking.recorder.download_button"
            onClick={handleDownload}
            className="h-10 w-full rounded-full sm:w-auto"
          >
            <Download className="size-4" aria-hidden="true" />
            Download recording
          </Button>
        </div>
      )}
    </div>
  );
}
