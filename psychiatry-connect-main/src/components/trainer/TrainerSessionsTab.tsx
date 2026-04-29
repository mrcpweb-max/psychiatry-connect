import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, ExternalLink, Loader2, CheckCircle, XCircle, Video } from "lucide-react";
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

  // Sort upcoming: latest booked first
  const sortedUpcoming = [...upcomingSessions].sort((a, b) => {
    return new Date(b.created_at || b.scheduled_at || 0).getTime() - new Date(a.created_at || a.scheduled_at || 0).getTime();
  });

  // Sort past: latest booked first
  const sortedPast = [...pastSessions].sort((a, b) => {
    return new Date(b.created_at || b.scheduled_at || 0).getTime() - new Date(a.created_at || a.scheduled_at || 0).getTime();
  });

  return (
    <Tabs defaultValue="upcoming" className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming" className="gap-2">
          <Clock className="h-4 w-4" />
          Upcoming ({sortedUpcoming.length})
        </TabsTrigger>
        <TabsTrigger value="past" className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Past ({sortedPast.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>
              {sortedUpcoming.length} session{sortedUpcoming.length !== 1 ? "s" : ""} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedUpcoming.length > 0 ? (
              <div className="space-y-4">
                {sortedUpcoming.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <EmptyState message="No upcoming sessions" />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="past">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
              Past Sessions
            </CardTitle>
            <CardDescription>
              {sortedPast.length} session{sortedPast.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedPast.length > 0 ? (
              <div className="space-y-3">
                {sortedPast.map((session) => (
                  <PastSessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <EmptyState message="No past sessions yet" />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function SessionCard({ session }: { session: any }) {

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  const candidateName = session.candidate?.full_name || session.candidate?.email || "Candidate";

  return (
    <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{candidateName}</span>
        </div>
        <Badge className={statusColors[session.status] || ""}>{session.status}</Badge>
      </div>
      <div className="grid gap-1.5 text-sm text-muted-foreground ml-10">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          {session.scheduled_at
            ? format(parseISO(session.scheduled_at), "EEEE, MMMM d, yyyy")
            : "Not yet scheduled"}
        </div>
        {session.scheduled_at && (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            {format(parseISO(session.scheduled_at), "h:mm a")}
          </div>
        )}
        <div>
          {session.session_mode === "one_on_one" ? "1:1" : "Group"} {session.session_type} •{" "}
          {session.stations} station{session.stations !== 1 ? "s" : ""}
        </div>
        {Array.isArray(session.booking_stations) && session.booking_stations.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {session.booking_stations.map((bs: any) => (
              <Badge key={bs.id} variant="secondary" className="text-xs mr-1">
                {bs.station?.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {session.scheduled_at && session.status !== "cancelled" && session.status !== "completed" && (
        <div className="mt-3 ml-10">
          {session.zoom_join_url ? (
            <Button size="sm" className="gap-2 gradient-bg-primary border-0" asChild>
              <a href={session.zoom_join_url} target="_blank" rel="noopener noreferrer">
                <Video className="h-3.5 w-3.5" /> Join Meeting
              </a>
            </Button>
          ) : session.calendly_event_uri ? (
            <Button size="sm" variant="outline" className="gap-2" asChild>
              <a href={session.calendly_event_uri} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" /> View on Calendly
              </a>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground italic">Link will appear once candidate schedules via Calendly</span>
          )}
        </div>
      )}
    </div>
  );
}

function PastSessionCard({ session }: { session: any }) {
  const candidateName = session.candidate?.full_name || session.candidate?.email || "Candidate";
  const isCancelled = session.status === "cancelled";

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          {isCancelled ? (
            <XCircle className="h-4 w-4 text-destructive" />
          ) : (
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-medium text-sm">{candidateName}</p>
          <p className="text-xs text-muted-foreground">
            {session.scheduled_at ? format(parseISO(session.scheduled_at), "MMM d, yyyy 'at' h:mm a") : "—"} •{" "}
            {session.session_mode === "one_on_one" ? "1:1" : "Group"} {session.session_type} •{" "}
            {session.stations} station{session.stations !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <Badge variant={isCancelled ? "destructive" : "outline"} className="text-xs">
        {session.status}
      </Badge>
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
