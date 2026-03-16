import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStreamRecording } from "@/hooks/useMeetings";
import { Loader2, Video, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecordingPlayerProps {
  meetingId: string;
  meetingLabel?: string;
  disabled?: boolean;
}

export function RecordingPlayer({ meetingId, meetingLabel, disabled }: RecordingPlayerProps) {
  const [open, setOpen] = useState(false);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRecording = useStreamRecording();
  const { toast } = useToast();

  const handleOpen = async () => {
    setOpen(true);
    setError(null);
    setPlayUrl(null);

    try {
      const result = await streamRecording.mutateAsync(meetingId);
      setPlayUrl(result.play_url);
    } catch (err: any) {
      const msg = err?.message || err?.context?.body?.error || "Failed to load recording";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={handleOpen}
        disabled={disabled}
        className="gap-1"
      >
        <Video className="h-4 w-4" />
        Watch Recording
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{meetingLabel || "Session Recording"}</DialogTitle>
          </DialogHeader>

          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            {streamRecording.isPending && (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}

            {error && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {playUrl && (
              <video
                src={playUrl}
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full"
                autoPlay
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
