import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminMeetings, useExtendMeetingExpiry } from "@/hooks/useMeetings";
import { RecordingPlayer } from "./RecordingPlayer";
import { Loader2, Video, Search, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function AdminMeetingsTab() {
  const { data: meetings, isLoading } = useAdminMeetings();
  const extendExpiry = useExtendMeetingExpiry();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filtered = meetings?.filter(
    (m) =>
      m.teacher_email?.toLowerCase().includes(search.toLowerCase()) ||
      m.student_email?.toLowerCase().includes(search.toLowerCase()) ||
      m.meeting_status?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExtend = async (meetingId: string) => {
    try {
      await extendExpiry.mutateAsync({ meetingId, hours: 48 });
      toast({ title: "Expiry extended by 48 hours" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Meeting Recordings
        </CardTitle>
        <CardDescription>Manage all Zoom session recordings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by teacher or student email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {filtered?.length ? (
          <div className="space-y-3">
            {filtered.map((m) => {
              const isExpired = m.recording_access_expires
                ? new Date() > new Date(m.recording_access_expires)
                : false;
              const isAvailable = m.recording_status === "available";

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      Teacher: {m.teacher_email || "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Student: {m.student_email || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.meeting_time ? format(new Date(m.meeting_time), "MMM d, yyyy h:mm a") : "—"}
                      {m.recording_access_expires && (
                        <> • Expires: {format(new Date(m.recording_access_expires), "MMM d, h:mm a")}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Badge
                      variant={
                        m.recording_status === "available"
                          ? isExpired ? "destructive" : "default"
                          : "secondary"
                      }
                    >
                      {isExpired ? "expired" : m.recording_status}
                    </Badge>
                    {isAvailable && (
                      <RecordingPlayer meetingId={m.id} />
                    )}
                    {isAvailable && isExpired && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExtend(m.id)}
                        disabled={extendExpiry.isPending}
                        className="gap-1"
                      >
                        <Clock className="h-4 w-4" />
                        Extend 48h
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">No meetings found</p>
        )}
      </CardContent>
    </Card>
  );
}
