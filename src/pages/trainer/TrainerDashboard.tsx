import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useTrainerProfile, useTrainerBookings } from "@/hooks/useTrainerData";
import { Brain, LogOut, User, Loader2, Calendar, Clock, Video, Settings } from "lucide-react";
import { isPast, isFuture, parseISO } from "date-fns";
import { TrainerStatsOverview } from "@/components/trainer/TrainerStatsOverview";
import { TrainerProfileCard } from "@/components/trainer/TrainerProfileCard";
import { TrainerSessionsTab } from "@/components/trainer/TrainerSessionsTab";
import { TrainerAvailabilityTab } from "@/components/trainer/TrainerAvailabilityTab";
import { TrainerRecordingsTab } from "@/components/trainer/TrainerRecordingsTab";
import { useRecordings } from "@/hooks/useRecordings";
import PendingApproval from "./PendingApproval";

export default function TrainerDashboard() {
  const { signOut } = useAuth();
  const { data: trainer, isLoading: trainerLoading } = useTrainerProfile();
  const { data: bookings, isLoading: bookingsLoading } = useTrainerBookings(trainer?.id);
  const { data: recordings } = useRecordings();

  const handleSignOut = async () => {
    await signOut();
  };

  if (trainerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <User className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h2 className="text-xl font-bold">Trainer Profile Not Found</h2>
          <p className="text-muted-foreground">Your account is not linked to a trainer profile.</p>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>
    );
  }

  const trainerStatus = (trainer as any).status;
  if (trainerStatus === "pending" || trainerStatus === "rejected") {
    return <PendingApproval status={trainerStatus} trainerName={trainer.name} />;
  }

  const upcomingSessions = bookings?.filter(
    (b) => b.scheduled_at && isFuture(parseISO(b.scheduled_at)) && b.status !== "cancelled"
  ) || [];

  const pastSessions = bookings?.filter(
    (b) => (b.scheduled_at && isPast(parseISO(b.scheduled_at))) || b.status === "completed"
  ) || [];

  const completedSessions = bookings?.filter((b) => b.status === "completed") || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              Trainer Dashboard
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{trainer.name}</span>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {trainer.name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your sessions and schedule.</p>
        </div>

        {/* Stats */}
        <TrainerStatsOverview
          totalSessions={bookings?.length || 0}
          upcomingSessions={upcomingSessions.length}
          completedSessions={completedSessions.length}
          totalRecordings={recordings?.length || 0}
        />

        {/* Profile Card */}
        <TrainerProfileCard trainer={trainer} />

        {/* Tabs */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="sessions" className="gap-2">
              <Calendar className="h-4 w-4" /> Sessions
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2">
              <Clock className="h-4 w-4" /> Availability
            </TabsTrigger>
            <TabsTrigger value="recordings" className="gap-2">
              <Video className="h-4 w-4" /> Recordings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <TrainerSessionsTab
              upcomingSessions={upcomingSessions}
              pastSessions={pastSessions}
              isLoading={bookingsLoading}
            />
          </TabsContent>

          <TabsContent value="availability">
            <TrainerAvailabilityTab trainerId={trainer.id} />
          </TabsContent>

          <TabsContent value="recordings">
            <TrainerRecordingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
