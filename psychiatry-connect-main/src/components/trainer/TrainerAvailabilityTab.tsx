import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useTrainerAvailability,
  useTrainerBlockedDates,
  useAddAvailability,
  useDeleteAvailability,
  useAddBlockedDate,
  useDeleteBlockedDate,
} from "@/hooks/useTrainerData";
import { format, parseISO } from "date-fns";
import { Plus, X, Loader2, CalendarDays, CalendarOff, RefreshCw, ExternalLink, Globe, AlertCircle, ArrowUpRight } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface CalendlyInterval {
  from: string;
  to: string;
}

interface CalendlyRule {
  type: string;
  wday?: string;
  intervals: CalendlyInterval[];
  date?: string;
}

interface CalendlySchedule {
  timezone: string;
  rules: CalendlyRule[];
  name: string;
  default: boolean;
}

interface TrainerAvailabilityTabProps {
  trainerId: string;
}

export function TrainerAvailabilityTab({ trainerId }: TrainerAvailabilityTabProps) {
  const { toast } = useToast();
  const { data: availability } = useTrainerAvailability(trainerId);
  const { data: blockedDates } = useTrainerBlockedDates(trainerId);

  const addAvailability = useAddAvailability();
  const deleteAvailability = useDeleteAvailability();
  const addBlockedDate = useAddBlockedDate();
  const deleteBlockedDate = useDeleteBlockedDate();

  const [addAvailOpen, setAddAvailOpen] = useState(false);
  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [newAvail, setNewAvail] = useState({ day: "1", start: "09:00", end: "17:00" });
  const [newBlock, setNewBlock] = useState({ date: "", reason: "" });

  // Calendly state
  const [calendlySchedules, setCalendlySchedules] = useState<CalendlySchedule[]>([]);
  const [calendlyLoading, setCalendlyLoading] = useState(false);
  const [calendlyUser, setCalendlyUser] = useState<{ name?: string; scheduling_url?: string; timezone?: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  const fetchCalendlyAvailability = async () => {
    setCalendlyLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("calendly-availability", {
        body: { action: "get_availability" },
      });
      if (error) throw error;

      if (data?.schedules) {
        setCalendlySchedules(data.schedules.map((s: any) => ({
          timezone: s.timezone,
          rules: s.rules || [],
          name: s.name || "Default",
          default: s.default || false,
        })));
      }
      if (data?.user) {
        setCalendlyUser(data.user);
      }
      setSyncStatus("synced");
    } catch (err: any) {
      console.error("Calendly fetch error:", err);
      setSyncStatus("error");
      toast({ title: "Could not fetch Calendly availability", description: err.message, variant: "destructive" });
    } finally {
      setCalendlyLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendlyAvailability();
  }, []);

  const handleSyncToCalendly = async () => {
    setSyncStatus("syncing");
    try {
      // Send platform availability data to the sync endpoint
      const platformData = availability?.map(a => ({
        day: DAYS[a.day_of_week],
        start: a.start_time,
        end: a.end_time,
      }));

      const { data, error } = await supabase.functions.invoke("calendly-availability", {
        body: { action: "sync_to_calendly", availability_data: platformData },
      });
      if (error) throw error;

      toast({
        title: "Availability saved",
        description: "Platform availability saved. Please update your Calendly schedule to match for booking consistency.",
      });

      // Open Calendly availability page
      if (data?.calendly_management_url) {
        window.open(data.calendly_management_url, "_blank");
      }

      // Refresh Calendly data
      await fetchCalendlyAvailability();
      setSyncStatus("synced");
    } catch (err: any) {
      setSyncStatus("error");
      toast({ title: "Sync failed", description: err.message, variant: "destructive" });
    }
  };

  const handleAddAvailability = async () => {
    try {
      await addAvailability.mutateAsync({
        trainer_id: trainerId,
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
    await deleteAvailability.mutateAsync({ id, trainerId });
    toast({ title: "Availability removed" });
  };

  const handleAddBlockedDate = async () => {
    if (!newBlock.date) return;
    try {
      await addBlockedDate.mutateAsync({
        trainer_id: trainerId,
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
    await deleteBlockedDate.mutateAsync({ id, trainerId });
    toast({ title: "Blocked date removed" });
  };

  // Group platform availability by day
  const groupedAvailability = DAYS.map((day, index) => ({
    day,
    index,
    slots: availability?.filter((s) => s.day_of_week === index) || [],
  })).filter((g) => g.slots.length > 0);

  // Parse Calendly rules into day-grouped display
  const wdayMap: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6,
  };

  const defaultSchedule = calendlySchedules.find((s) => s.default) || calendlySchedules[0];
  const calendlyByDay = defaultSchedule
    ? DAYS.map((day, index) => {
        const dayRules = defaultSchedule.rules.filter(
          (r) => r.type === "wday" && r.wday && wdayMap[r.wday.toLowerCase()] === index
        );
        const intervals = dayRules.flatMap((r) => r.intervals || []);
        return { day, index, intervals };
      }).filter((g) => g.intervals.length > 0)
    : [];

  // Check if platform and Calendly availability differ
  const hasMismatch = groupedAvailability.length > 0 && calendlyByDay.length > 0 && (() => {
    for (const platformDay of groupedAvailability) {
      const calendlyDay = calendlyByDay.find(c => c.index === platformDay.index);
      if (!calendlyDay) return true;
      if (platformDay.slots.length !== calendlyDay.intervals.length) return true;
    }
    return false;
  })();

  return (
    <div className="space-y-6">
      {/* Sync Alert */}
      {hasMismatch && (
      <Alert className="border-amber-200 bg-amber-50/50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your platform and Calendly availability may be out of sync. Click "Push to Calendly" to align them.
          </AlertDescription>
        </Alert>
      )}

      {/* Calendly Availability (synced) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Calendly Availability
              {syncStatus === "synced" && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-300">Synced</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Live availability from your Calendly account
              {calendlyUser?.timezone && (
                <span className="ml-1">• {calendlyUser.timezone}</span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={fetchCalendlyAvailability} disabled={calendlyLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${calendlyLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="https://calendly.com/app/availability" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Edit on Calendly
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {calendlyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : calendlyByDay.length > 0 ? (
            <div className="space-y-4">
              {calendlyByDay.map(({ day, intervals }) => (
                <div key={day}>
                  <p className="text-sm font-semibold text-foreground mb-2">{day}</p>
                  <div className="space-y-1.5 pl-4">
                    {intervals.map((interval, i) => (
                      <div key={i} className="flex items-center p-2.5 border rounded-lg bg-primary/5">
                        <Badge variant="outline" className="text-xs">
                          {interval.from} – {interval.to}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Globe className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No Calendly availability found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Set your availability on Calendly, then click Refresh
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Availability */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Platform Availability
            </CardTitle>
            <CardDescription>Set your working hours here, then sync to Calendly</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            {groupedAvailability.length > 0 && (
              <Button size="sm" variant="default" onClick={handleSyncToCalendly} disabled={syncStatus === "syncing"}>
                {syncStatus === "syncing" ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                )}
                Push to Calendly
              </Button>
            )}
            <Dialog open={addAvailOpen} onOpenChange={setAddAvailOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
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
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day, i) => (
                          <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input type="time" value={newAvail.start} onChange={(e) => setNewAvail({ ...newAvail, start: e.target.value })} />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input type="time" value={newAvail.end} onChange={(e) => setNewAvail({ ...newAvail, end: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={handleAddAvailability} className="w-full" disabled={addAvailability.isPending}>
                    {addAvailability.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Availability"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {groupedAvailability.length > 0 ? (
            <div className="space-y-4">
              {groupedAvailability.map(({ day, slots }) => (
                <div key={day}>
                  <p className="text-sm font-semibold text-foreground mb-2">{day}</p>
                  <div className="space-y-1.5 pl-4">
                    {slots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-2.5 border rounded-lg bg-muted/30">
                        <span className="text-sm">
                          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                        </span>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDeleteAvailability(slot.id)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                💡 After updating, click "Push to Calendly" to open Calendly and align your schedules.
              </p>
            </div>
          ) : (
            <div className="text-center py-10">
              <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No platform availability set</p>
              <p className="text-xs text-muted-foreground mt-1">Add your working hours, then sync to Calendly</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarOff className="h-5 w-5 text-destructive" />
              Blocked Dates
            </CardTitle>
            <CardDescription>Days you're unavailable</CardDescription>
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
                  <Input type="date" value={newBlock.date} onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })} />
                </div>
                <div>
                  <Label>Reason (optional)</Label>
                  <Input value={newBlock.reason} onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })} placeholder="e.g., Holiday, Conference" />
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
                    <span className="font-medium text-sm">
                      {format(parseISO(bd.blocked_date), "EEEE, MMMM d, yyyy")}
                    </span>
                    {bd.reason && (
                      <Badge variant="secondary" className="ml-2 text-xs">{bd.reason}</Badge>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDeleteBlockedDate(bd.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <CalendarOff className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No blocked dates</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
