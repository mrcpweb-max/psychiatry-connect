import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserBookings, useUpdateBooking } from "@/hooks/useBookings";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import { Brain, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ScheduleSession() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { data: bookings, isLoading } = useUserBookings();
  const updateBooking = useUpdateBooking();
  const [scheduled, setScheduled] = useState(false);

  const booking = bookings?.find((b) => b.id === bookingId);

  useEffect(() => {
    if (!isLoading && !booking) {
      toast({
        title: "Booking not found",
        description: "This booking doesn't exist or you don't have access to it.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [booking, isLoading, navigate, toast]);

  const handleEventScheduled = async () => {
    if (!bookingId) return;

    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        status: "confirmed",
        scheduled_at: new Date().toISOString(), // Calendly will provide actual time via webhook
      });

      setScheduled(true);
      toast({
        title: "Session scheduled!",
        description: "Your session has been confirmed. Check your email for details.",
      });
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const calendlyUrl = booking.trainer?.calendly_url;

  if (scheduled) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
            </Link>
          </div>
        </header>

        <main className="container py-16 max-w-2xl">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 rounded-full bg-accent/10 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Session Scheduled!</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Your session with {booking.trainer?.name} has been confirmed. 
                You'll receive an email with all the details.
              </p>
              <Link to="/dashboard">
                <Button className="gradient-bg-primary border-0">
                  Return to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
          </Link>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Schedule Your Session</h1>
          <p className="text-muted-foreground">
            Select a convenient time for your session with {booking.trainer?.name}.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select a Time</CardTitle>
            <CardDescription>
              Choose an available slot from the calendar below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calendlyUrl ? (
              <CalendlyEmbed
                url={calendlyUrl}
                prefill={{
                  name: profile?.full_name || user?.user_metadata?.full_name || "",
                  email: user?.email || "",
                }}
                onEventScheduled={handleEventScheduled}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-warning/10 mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-warning" />
                </div>
                <h3 className="font-semibold mb-2">Scheduling Unavailable</h3>
                <p className="text-muted-foreground mb-4">
                  The trainer's calendar is not configured. Please contact support.
                </p>
                <Link to="/contact">
                  <Button variant="outline">Contact Support</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
