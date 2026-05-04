import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useUserBookings, useSyncCalendlyLink } from "@/hooks/useBookings";
import { useStudentMeetings } from "@/hooks/useMeetings";
import { RecordingPlayer } from "@/components/meetings/RecordingPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "@/assets/logo.png";
import {
  Calendar,
  CreditCard,
  LogOut,
  Plus,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Settings,
  Loader2,
  CalendarCheck,
  Video,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const { data: bookings, isLoading: bookingsLoading } = useUserBookings();
  const { data: meetings } = useStudentMeetings();
  const syncLink = useSyncCalendlyLink();
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const allBookings = bookings || [];

  const upcomingBookings = allBookings
    .filter((b) => {
      if (b.status === "cancelled" || b.status === "completed") return false;
      if (b.scheduled_at && new Date(b.scheduled_at).getTime() < new Date().getTime()) return false;
      return true;
    })
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const completedBookings = allBookings
    .filter((b) => {
      if (b.status === "completed" || b.status === "cancelled") return true;
      if (b.scheduled_at && new Date(b.scheduled_at).getTime() < new Date().getTime()) return true;
      return false;
    })
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const quickActions = [
    {
      title: "Book New Session",
      description: "Schedule a coaching session",
      icon: Plus,
      href: "/book",
      primary: true,
    },
    {
      title: "My Sessions",
      description: "View upcoming and past sessions",
      icon: Calendar,
      href: "/dashboard",
      primary: false,
    },
    {
      title: "Payment History",
      description: "View your transactions",
      icon: CreditCard,
      href: "/dashboard",
      primary: false,
    },
    {
      title: "Profile Settings",
      description: "Update your information",
      icon: Settings,
      href: "/dashboard",
      primary: false,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      case "completed": return "outline";
      default: return "destructive";
    }
  };

  const formatSessionType = (mode: string, type: string) => {
    const modeLabel = mode === "one_on_one" ? "1:1" : "Group";
    const typeLabel = type === "mock" ? "Mock Examination" : "Learning Session";
    return `${modeLabel} ${typeLabel}`;
  };

  const toggleExpand = (bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const getMatchingMeetings = (booking: typeof allBookings[0]) => {
    if (!meetings?.length) return [];

    const bookingTime = booking.scheduled_at
      ? new Date(booking.scheduled_at).getTime()
      : new Date(booking.created_at).getTime();

    const maxDiff = 48 * 60 * 60 * 1000;

    return meetings
      .filter((meeting) => {
        if (meeting.recording_status !== "available" || !meeting.zoom_play_url || !meeting.meeting_time) {
          return false;
        }

        if (meeting.recording_access_expires && new Date(meeting.recording_access_expires) <= new Date()) {
          return false;
        }

        const meetingTime = new Date(meeting.meeting_time).getTime();
        return Math.abs(meetingTime - bookingTime) <= maxDiff;
      })
      .sort((a, b) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  };

  const renderBookingCard = (booking: typeof allBookings[0]) => {
    const isExpanded = expandedBooking === booking.id;
    const matchedMeetings = getMatchingMeetings(booking);
    const stationsArray = Array.isArray(booking.booking_stations) ? booking.booking_stations : [];
    const stationNotes = stationsArray
      .filter((bs) => bs.station?.description)
      .sort((a, b) => a.station_order - b.station_order);
    
    // Get active, non-expired recordings for this booking
    const recordingsArray = Array.isArray(booking.recordings) ? booking.recordings : [];
    const activeRecordings = recordingsArray.filter((r) => {
      if (r.status !== "active") return false;
      const daysLeft = differenceInDays(new Date(r.expiry_date), new Date());
      return daysLeft >= 0;
    });

    const hasExtras = stationNotes.length > 0 || activeRecordings.length > 0 || matchedMeetings.length > 0;

    return (
      <div key={booking.id} className="border border-border rounded-lg overflow-hidden">
        <div
          className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${hasExtras ? "cursor-pointer" : ""}`}
          onClick={() => hasExtras && toggleExpand(booking.id)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">
                {formatSessionType(booking.session_mode, booking.session_type)}
              </h4>
              <p className="text-sm text-muted-foreground">
                with {booking.trainer?.name || "Trainer"} • {booking.stations} station{booking.stations !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              {booking.scheduled_at ? (
                <>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(booking.scheduled_at), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(booking.scheduled_at), "h:mm a")}
                  </div>
                </>
              ) : (
                <Link to={`/schedule/${booking.id}`} onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" className="gap-1">
                    <CalendarCheck className="h-4 w-4" />
                    Schedule
                  </Button>
                </Link>
              )}
            </div>
            {/* Join Meeting Link */}
            {booking.scheduled_at &&
              booking.status !== "cancelled" &&
              booking.status !== "completed" &&
              (booking.zoom_join_url ? (
                <a
                  href={booking.zoom_join_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button size="sm" className="gap-1.5 gradient-bg-primary border-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Join Meeting
                  </Button>
                </a>
              ) : booking.calendly_event_uri ? (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1.5" 
                  onClick={(e) => {
                    e.stopPropagation();
                    syncLink.mutate(booking.id);
                  }}
                  disabled={syncLink.isPending}
                >
                  {syncLink.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                  Get Meeting Link
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground italic">Link pending</span>
              ))}
            <Badge variant={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
            {hasExtras ? (
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {isExpanded && hasExtras && (
          <div className="border-t border-border bg-muted/30 p-4 space-y-4">
            {/* Station Notes */}
            {stationNotes.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Station Notes
                </h5>
                <div className="space-y-2">
                  {stationNotes.map((bs) => (
                    <div key={bs.id} className="bg-background border border-border rounded-md p-3">
                      <p className="text-sm font-medium text-primary">{bs.station?.name}</p>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {bs.station?.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recordings for this session */}
            {(activeRecordings.length > 0 || matchedMeetings.length > 0) && (
              <div>
                <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Video className="h-4 w-4 text-primary" />
                  Session Recordings
                </h5>
                <div className="space-y-2">
                  {matchedMeetings.map((matchedMeeting, idx) => {
                    const recordingExpiry = matchedMeeting.recording_access_expires;
                    const recordingDaysLeft = recordingExpiry
                      ? Math.max(0, differenceInDays(new Date(recordingExpiry), new Date()))
                      : null;
                    return (
                      <div key={matchedMeeting.id} className="flex items-center justify-between bg-background border border-border rounded-md p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Video className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Cloud Recording {matchedMeetings.length > 1 ? `#${idx + 1}` : ""}</p>
                            <p className="text-xs text-muted-foreground">
                              Available: {format(new Date(matchedMeeting.recording_created_at || booking.updated_at), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {recordingDaysLeft !== null && (
                            <div className="text-right">
                              <Badge variant={recordingDaysLeft <= 2 ? "destructive" : "secondary"} className="text-xs">
                                {recordingDaysLeft <= 0 ? "Expires today" : `${recordingDaysLeft} day${recordingDaysLeft !== 1 ? "s" : ""} left`}
                              </Badge>
                            </div>
                          )}
                          <div onClick={(e) => e.stopPropagation()}>
                            <RecordingPlayer
                              meetingId={matchedMeeting.id}
                              meetingLabel={`Recording ${matchedMeetings.length > 1 ? `#${idx + 1}` : ""}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {activeRecordings.map((rec) => {
                    const recordingExpiry = rec.expiry_date;
                    const recordingDaysLeft = recordingExpiry
                      ? Math.max(0, differenceInDays(new Date(recordingExpiry), new Date()))
                      : null;
                    return (
                      <div key={rec.id} className="flex items-center justify-between bg-background border border-border rounded-md p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Video className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Session Recording</p>
                            <p className="text-xs text-muted-foreground">
                              Available: {format(new Date(rec.created_at || booking.updated_at), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {recordingDaysLeft !== null && (
                            <div className="text-right">
                              <Badge variant={recordingDaysLeft <= 2 ? "destructive" : "secondary"} className="text-xs">
                                {recordingDaysLeft <= 0 ? "Expires today" : `${recordingDaysLeft} day${recordingDaysLeft !== 1 ? "s" : ""} left`}
                              </Badge>
                            </div>
                          )}
                          <a
                            href={rec.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button size="sm" variant="outline" className="gap-1">
                              <Video className="h-4 w-4" />
                              Watch
                            </Button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Recordings are available for 120 days. Downloads are not permitted.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Online CASC Practice" className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-semibold text-lg hidden sm:inline-block">
              Online CASC Practice
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">
            Manage your sessions and track your MRCPsych preparation progress.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className={`h-full transition-all hover:shadow-lg cursor-pointer ${
                action.primary ? "border-primary bg-primary/5" : ""
              }`}>
                <CardContent className="pt-6">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    action.primary ? "gradient-bg-primary" : "bg-muted"
                  }`}>
                    <action.icon className={`h-5 w-5 ${
                      action.primary ? "text-primary-foreground" : "text-muted-foreground"
                    }`} />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Sessions Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="upcoming" className="gap-2">
              <CalendarCheck className="h-4 w-4" /> Upcoming Sessions
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <Video className="h-4 w-4" /> Past Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Your scheduled coaching sessions</CardDescription>
                </div>
                <Link to="/book">
                  <Button size="sm" className="gradient-bg-primary border-0 gap-2">
                    <Plus className="h-4 w-4" />
                    Book New
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map(renderBookingCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">No Upcoming Sessions</h3>
                    <p className="text-muted-foreground mb-4">
                      Book your first session to get started
                    </p>
                    <Link to="/book">
                      <Button className="gradient-bg-primary border-0">
                        Book a Session
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Past Sessions
                </CardTitle>
                <CardDescription>View recordings and station notes from past sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {completedBookings.length > 0 ? (
                  <div className="space-y-4">
                    {completedBookings.map(renderBookingCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground">No past sessions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
