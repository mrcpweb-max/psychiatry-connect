import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Play, ExternalLink, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface RecordingWithBooking {
  id: string;
  booking_id: string;
  recording_url: string;
  expiry_date: string;
  status: string;
  created_at: string;
  booking?: {
    id: string;
    session_type: string;
    session_mode: string;
    stations: number;
    scheduled_at: string | null;
    candidate: {
      full_name: string | null;
      email: string | null;
    } | null;
  };
}

function useTrainerRecordings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trainer-recordings", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get the trainer's ID first
      const { data: trainer } = await supabase
        .from("trainers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!trainer) return [];

      // Get recordings for bookings assigned to this trainer
      const { data, error } = await supabase
        .from("recordings")
        .select(`
          *,
          booking:bookings!recordings_booking_id_fkey(
            id, session_type, session_mode, stations, scheduled_at,
            candidate:profiles!bookings_candidate_id_fkey(full_name, email)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as RecordingWithBooking[];
    },
    enabled: !!user,
  });
}

export function TrainerRecordingsTab() {
  const { data: recordings, isLoading } = useTrainerRecordings();

  const isExpired = (expiry: string) => new Date(expiry) < new Date();
  const activeRecordings = recordings?.filter((r) => r.status === "active" && !isExpired(r.expiry_date)) || [];
  const expiredRecordings = recordings?.filter((r) => r.status !== "active" || isExpired(r.expiry_date)) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Session Recordings
        </CardTitle>
        <CardDescription>
          Recordings from your completed sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : recordings?.length ? (
          <div className="space-y-6">
            {/* Active Recordings */}
            {activeRecordings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Active</h3>
                {activeRecordings.map((rec) => (
                  <RecordingCard key={rec.id} recording={rec} expired={false} />
                ))}
              </div>
            )}

            {/* Expired / Revoked */}
            {expiredRecordings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Expired / Revoked</h3>
                {expiredRecordings.map((rec) => (
                  <RecordingCard key={rec.id} recording={rec} expired={true} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <Video className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No recordings available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Recordings will appear here after completed sessions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecordingCard({ recording, expired }: { recording: RecordingWithBooking; expired: boolean }) {
  const candidateName = recording.booking?.candidate?.full_name || recording.booking?.candidate?.email || "Candidate";
  const sessionLabel = recording.booking
    ? `${recording.booking.session_mode === "one_on_one" ? "1:1" : "Group"} ${recording.booking.session_type} • ${recording.booking.stations} station${recording.booking.stations !== 1 ? "s" : ""}`
    : "Session Recording";

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${expired ? "opacity-60" : "hover:bg-muted/50"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${expired ? "bg-muted" : "bg-primary/10"}`}>
          <Video className={`h-5 w-5 ${expired ? "text-muted-foreground" : "text-primary"}`} />
        </div>
        <div>
          <p className="font-medium text-sm">{candidateName}</p>
          <p className="text-xs text-muted-foreground">
            {sessionLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            {recording.booking?.scheduled_at
              ? format(parseISO(recording.booking.scheduled_at), "MMM d, yyyy")
              : format(parseISO(recording.created_at), "MMM d, yyyy")}{" "}
            • Expires: {format(parseISO(recording.expiry_date), "MMM d, yyyy")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={expired ? "secondary" : "default"}>
          {expired ? "Expired" : "Active"}
        </Badge>
        {!expired && recording.recording_url && (
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <a href={recording.recording_url} target="_blank" rel="noopener noreferrer">
              <Play className="h-3.5 w-3.5" /> Watch
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
