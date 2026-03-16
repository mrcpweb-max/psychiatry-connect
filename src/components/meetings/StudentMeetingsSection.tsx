import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStudentMeetings } from "@/hooks/useMeetings";
import { RecordingPlayer } from "./RecordingPlayer";
import { Loader2, Video, Calendar } from "lucide-react";
import { format } from "date-fns";

export function StudentMeetingsSection() {
  const { data: meetings, isLoading } = useStudentMeetings();

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!meetings?.length) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          My Sessions
        </CardTitle>
        <CardDescription>Your Zoom session recordings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {meetings.map((m) => {
            const isExpired = m.recording_access_expires
              ? new Date() > new Date(m.recording_access_expires)
              : false;
            const isAvailable = m.recording_status === "available" && !isExpired;

            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Session with {m.teacher_email?.split("@")[0] || "Teacher"}</p>
                    <p className="text-sm text-muted-foreground">
                      {m.meeting_time ? format(new Date(m.meeting_time), "MMM d, yyyy h:mm a") : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      m.meeting_status === "completed" ? "default" :
                      m.meeting_status === "scheduled" ? "secondary" : "outline"
                    }
                  >
                    {m.meeting_status}
                  </Badge>
                  {isAvailable ? (
                    <RecordingPlayer meetingId={m.id} />
                  ) : m.recording_status === "available" && isExpired ? (
                    <Badge variant="destructive">Recording expired</Badge>
                  ) : (
                    <Badge variant="secondary">{m.recording_status}</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
