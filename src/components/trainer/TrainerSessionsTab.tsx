import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ExternalLink, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

interface TrainerSessionsTabProps {
  upcomingSessions: any[];
  pastSessions: any[];
  isLoading: boolean;
}

export function TrainerSessionsTab({ upcomingSessions, pastSessions, isLoading }: TrainerSessionsTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>{upcomingSessions.length} session{upcomingSessions.length !== 1 ? "s" : ""} scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <EmptyState message="No upcoming sessions" />
          )}
        </CardContent>
      </Card>

      {/* Past */}
      <Card>
        <CardHeader>
          <CardTitle>Past Sessions</CardTitle>
          <CardDescription>{pastSessions.length} completed</CardDescription>
        </CardHeader>
        <CardContent>
          {pastSessions.length > 0 ? (
            <div className="space-y-3">
              {pastSessions.slice(0, 15).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{session.candidate?.full_name || "Candidate"}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.scheduled_at ? format(parseISO(session.scheduled_at), "MMM d, yyyy") : "—"} •{" "}
                        {session.session_mode === "one_on_one" ? "1:1" : "Group"} {session.session_type}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{session.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No past sessions" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SessionCard({ session }: { session: any }) {
  return (
    <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">
            {session.candidate?.full_name || session.candidate?.email || "Candidate"}
          </span>
        </div>
        <Badge>{session.status}</Badge>
      </div>
      <div className="grid gap-1.5 text-sm text-muted-foreground ml-10">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          {session.scheduled_at ? format(parseISO(session.scheduled_at), "EEEE, MMMM d, yyyy") : "Not scheduled"}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          {session.scheduled_at ? format(parseISO(session.scheduled_at), "h:mm a") : "—"}
        </div>
        <div>
          {session.session_mode === "one_on_one" ? "1:1" : "Group"} {session.session_type} • {session.stations} station{session.stations !== 1 ? "s" : ""}
        </div>
        {session.booking_stations?.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {session.booking_stations.map((bs: any) => (
              <Badge key={bs.id} variant="secondary" className="text-xs mr-1">
                {bs.station?.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {session.calendly_event_uri && (
        <Button size="sm" variant="outline" className="mt-3 ml-10 gap-2" asChild>
          <a href={session.calendly_event_uri} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" /> Join Meeting
          </a>
        </Button>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10">
      <Calendar className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
