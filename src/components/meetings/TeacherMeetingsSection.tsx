import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTeacherMeetings } from "@/hooks/useMeetings";
import { RecordingPlayer } from "./RecordingPlayer";
import { Loader2, Video, Calendar } from "lucide-react";
import { format } from "date-fns";

export function TeacherMeetingsSection() {
  const { data: meetings, isLoading } = useTeacherMeetings();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!meetings?.length) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground">
          No session history yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Session History
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
                    <p className="font-medium">Session with {m.student_email?.split("@")[0] || "Student"}</p>
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
