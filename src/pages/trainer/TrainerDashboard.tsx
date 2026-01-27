import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
  useTrainerProfile,
  useTrainerAvailability,
  useTrainerBlockedDates,
  useTrainerBookings,
  useAddAvailability,
  useDeleteAvailability,
  useAddBlockedDate,
  useDeleteBlockedDate,
} from "@/hooks/useTrainerData";
import { useRecordings } from "@/hooks/useRecordings";
import { useToast } from "@/hooks/use-toast";
import { format, isPast, isFuture, parseISO } from "date-fns";
import {
  Brain,
  Calendar,
  Clock,
  LogOut,
  User,
  Video,
  Plus,
  X,
  Loader2,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TrainerDashboard() {
  const { signOut, profile } = useAuth();
  const { toast } = useToast();
  const { data: trainer, isLoading: trainerLoading } = useTrainerProfile();
  const { data: availability } = useTrainerAvailability(trainer?.id);
  const { data: blockedDates } = useTrainerBlockedDates(trainer?.id);
  const { data: bookings, isLoading: bookingsLoading } = useTrainerBookings(trainer?.id);
  const { data: recordings } = useRecordings();

  const addAvailability = useAddAvailability();
  const deleteAvailability = useDeleteAvailability();
  const addBlockedDate = useAddBlockedDate();
  const deleteBlockedDate = useDeleteBlockedDate();

  const [addAvailOpen, setAddAvailOpen] = useState(false);
  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [newAvail, setNewAvail] = useState({ day: "1", start: "09:00", end: "17:00" });
  const [newBlock, setNewBlock] = useState({ date: "", reason: "" });

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAddAvailability = async () => {
    if (!trainer) return;
    try {
      await addAvailability.mutateAsync({
        trainer_id: trainer.id,
        day_of_week: parseInt(newAvail.day),
        start_time: newAvail.start,
        end_time: newAvail.end,
      });
      toast({ title: "Availability added" });
      setAddAvailOpen(false);
      setNewAvail({ day: "1", start: "09:00", end: "17:00" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    if (!trainer) return;
    await deleteAvailability.mutateAsync({ id, trainerId: trainer.id });
    toast({ title: "Availability removed" });
  };

  const handleAddBlockedDate = async () => {
    if (!trainer || !newBlock.date) return;
    try {
      await addBlockedDate.mutateAsync({
        trainer_id: trainer.id,
        blocked_date: newBlock.date,
        reason: newBlock.reason || null,
      });
      toast({ title: "Date blocked" });
      setAddBlockOpen(false);
      setNewBlock({ date: "", reason: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    if (!trainer) return;
    await deleteBlockedDate.mutateAsync({ id, trainerId: trainer.id });
    toast({ title: "Blocked date removed" });
  };

  const upcomingSessions = bookings?.filter(
    (b) => b.scheduled_at && isFuture(parseISO(b.scheduled_at)) && b.status !== "cancelled"
  ) || [];

  const pastSessions = bookings?.filter(
    (b) => b.scheduled_at && isPast(parseISO(b.scheduled_at)) || b.status === "completed"
  ) || [];

  if (trainerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Trainer Profile Not Found</h2>
            <p className="text-muted-foreground">Your account is not linked to a trainer profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
            </Link>
            <Badge variant="outline" className="gap-1">
              <User className="h-3 w-3" />
              Trainer
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{trainer.name}</span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trainer Dashboard</h1>
          <p className="text-muted-foreground">Manage your sessions and availability.</p>
        </div>

        {/* Profile Overview */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-bg-primary flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{trainer.name}</h2>
                  <p className="text-muted-foreground">{trainer.specialty || "MRCPsych Trainer"}</p>
                  {trainer.email && <p className="text-sm text-muted-foreground">{trainer.email}</p>}
                </div>
              </div>
              <Badge variant={(trainer as any).status === "approved" ? "default" : (trainer as any).status === "pending" ? "secondary" : "destructive"}>
                {(trainer as any).status === "approved" ? "Approved" : (trainer as any).status === "pending" ? "Pending Approval" : "Rejected"}
              </Badge>
            </div>
            {(trainer as any).status === "pending" && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Your application is pending admin review. You'll be able to receive bookings once approved.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled sessions with candidates</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {session.candidate?.full_name || session.candidate?.email || "Candidate"}
                            </span>
                          </div>
                          <Badge>{session.status}</Badge>
                        </div>
                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {session.scheduled_at
                              ? format(parseISO(session.scheduled_at), "EEEE, MMMM d, yyyy")
                              : "Not scheduled"}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {session.scheduled_at
                              ? format(parseISO(session.scheduled_at), "h:mm a")
                              : "—"}
                          </div>
                          <div>
                            {session.session_mode === "one_on_one" ? "1:1" : "Group"}{" "}
                            {session.session_type} • {session.stations} stations
                          </div>
                          {session.booking_stations?.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium text-foreground">Stations:</p>
                              <ul className="list-disc list-inside">
                                {session.booking_stations.map((bs: any) => (
                                  <li key={bs.id}>
                                    {bs.station?.subcategory?.category?.name} → {bs.station?.subcategory?.name} → {bs.station?.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        {session.calendly_event_uri && (
                          <Button size="sm" variant="outline" className="mt-3 gap-2" asChild>
                            <a href={session.calendly_event_uri} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              Join Meeting
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No upcoming sessions</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {pastSessions.length > 0 ? (
                  <div className="space-y-3">
                    {pastSessions.slice(0, 10).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{session.candidate?.full_name || "Candidate"}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.scheduled_at
                              ? format(parseISO(session.scheduled_at), "MMM d, yyyy")
                              : "—"}
                          </p>
                        </div>
                        <Badge variant="outline">{session.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No past sessions</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Weekly Availability</CardTitle>
                  <CardDescription>Set your regular working hours</CardDescription>
                </div>
                <Dialog open={addAvailOpen} onOpenChange={setAddAvailOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" /> Add Hours
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Availability</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Day</Label>
                        <Select value={newAvail.day} onValueChange={(v) => setNewAvail({ ...newAvail, day: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((day, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={newAvail.start}
                            onChange={(e) => setNewAvail({ ...newAvail, start: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={newAvail.end}
                            onChange={(e) => setNewAvail({ ...newAvail, end: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddAvailability} className="w-full" disabled={addAvailability.isPending}>
                        {addAvailability.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {availability?.length ? (
                  <div className="space-y-2">
                    {availability.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{DAYS[slot.day_of_week]}</span>
                          <span className="text-muted-foreground">
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteAvailability(slot.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No availability set</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Blocked Dates</CardTitle>
                  <CardDescription>Days you're not available</CardDescription>
                </div>
                <Dialog open={addBlockOpen} onOpenChange={setAddBlockOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" /> Block Date
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Block a Date</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newBlock.date}
                          onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Reason (optional)</Label>
                        <Input
                          value={newBlock.reason}
                          onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                          placeholder="e.g., Holiday, Conference"
                        />
                      </div>
                      <Button onClick={handleAddBlockedDate} className="w-full" disabled={addBlockedDate.isPending || !newBlock.date}>
                        {addBlockedDate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Block Date"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {blockedDates?.length ? (
                  <div className="space-y-2">
                    {blockedDates.map((bd) => (
                      <div key={bd.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">
                            {format(parseISO(bd.blocked_date), "EEEE, MMMM d, yyyy")}
                          </span>
                          {bd.reason && (
                            <span className="text-sm text-muted-foreground ml-2">({bd.reason})</span>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteBlockedDate(bd.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No blocked dates</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings">
            <Card>
              <CardHeader>
                <CardTitle>Session Recordings</CardTitle>
                <CardDescription>View recordings from your sessions (view only)</CardDescription>
              </CardHeader>
              <CardContent>
                {recordings?.length ? (
                  <div className="space-y-3">
                    {recordings.map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Video className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Recording</p>
                            <p className="text-sm text-muted-foreground">
                              Expires: {format(parseISO(rec.expiry_date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <Badge variant={rec.status === "active" ? "default" : "secondary"}>
                          {rec.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No recordings available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
