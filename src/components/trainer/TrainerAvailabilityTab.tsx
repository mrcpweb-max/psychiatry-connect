import { useState } from "react";
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
import { Plus, X, Loader2, CalendarDays, CalendarOff } from "lucide-react";
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

  // Group availability by day
  const groupedAvailability = DAYS.map((day, index) => ({
    day,
    index,
    slots: availability?.filter((s) => s.day_of_week === index) || [],
  })).filter((g) => g.slots.length > 0);

  return (
    <div className="space-y-6">
      {/* Weekly Availability */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Weekly Availability
            </CardTitle>
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
            </div>
          ) : (
            <div className="text-center py-10">
              <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No availability set</p>
              <p className="text-xs text-muted-foreground mt-1">Add your working hours so candidates can book sessions</p>
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
