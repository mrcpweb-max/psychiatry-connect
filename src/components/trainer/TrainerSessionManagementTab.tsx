import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Users, User, BookOpen, GraduationCap, PoundSterling, Clock, Layers } from "lucide-react";
import { toast } from "sonner";
import {
  useTrainerSessions,
  useCreateTrainerSession,
  useUpdateTrainerSession,
  useDeleteTrainerSession,
  TrainerSession,
  TrainerSessionInsert,
} from "@/hooks/useTrainerSessions";

interface Props {
  trainerId: string;
}

const SESSION_MODE_LABELS: Record<string, string> = {
  one_on_one: "1:1",
  group: "Group",
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  mock: "Mock Examination",
  learning: "Learning Session",
};

const defaultForm: Omit<TrainerSessionInsert, "trainer_id"> = {
  session_mode: "one_on_one",
  session_type: "learning",
  group_size: null,
  stations: 1,
  duration_minutes: 25,
  price: 20,
  currency: "GBP",
  description: null,
  is_active: true,
};

export function TrainerSessionManagementTab({ trainerId }: Props) {
  const { data: sessions, isLoading } = useTrainerSessions(trainerId);
  const createSession = useCreateTrainerSession();
  const updateSession = useUpdateTrainerSession();
  const deleteSession = useDeleteTrainerSession();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainerSession | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingSession(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (session: TrainerSession) => {
    setEditingSession(session);
    setForm({
      session_mode: session.session_mode,
      session_type: session.session_type,
      group_size: session.group_size,
      stations: session.stations,
      duration_minutes: session.duration_minutes,
      price: session.price,
      currency: session.currency,
      description: session.description,
      is_active: session.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (form.session_mode === "group" && (!form.group_size || form.group_size < 2)) {
      toast.error("Group size must be at least 2");
      return;
    }
    if (form.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      if (editingSession) {
        await updateSession.mutateAsync({
          id: editingSession.id,
          trainerId,
          session_mode: form.session_mode as any,
          session_type: form.session_type as any,
          group_size: form.session_mode === "group" ? form.group_size : null,
          stations: form.stations,
          duration_minutes: form.duration_minutes,
          price: form.price,
          currency: form.currency,
          description: form.description,
          is_active: form.is_active,
        });
        toast.success("Session updated successfully");
      } else {
        await createSession.mutateAsync({
          trainer_id: trainerId,
          session_mode: form.session_mode as any,
          session_type: form.session_type as any,
          group_size: form.session_mode === "group" ? form.group_size : null,
          stations: form.stations,
          duration_minutes: form.duration_minutes,
          price: form.price,
          currency: form.currency,
          description: form.description,
          is_active: form.is_active,
        });
        toast.success("Session created successfully");
      }
      setDialogOpen(false);
    } catch (error: any) {
      if (error?.message?.includes("duplicate")) {
        toast.error("A session with this exact configuration already exists");
      } else {
        toast.error(error?.message || "Failed to save session");
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSession.mutateAsync({ id, trainerId });
      toast.success("Session deleted");
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete session");
    }
  };

  const handleToggleActive = async (session: TrainerSession) => {
    try {
      await updateSession.mutateAsync({
        id: session.id,
        trainerId,
        is_active: !session.is_active,
      });
      toast.success(session.is_active ? "Session deactivated" : "Session activated");
    } catch (error: any) {
      toast.error("Failed to update session");
    }
  };

  // Group sessions by mode/type
  const oneOnOneLearning = sessions?.filter(s => s.session_mode === "one_on_one" && s.session_type === "learning") || [];
  const oneOnOneMock = sessions?.filter(s => s.session_mode === "one_on_one" && s.session_type === "mock") || [];
  const groupLearning = sessions?.filter(s => s.session_mode === "group" && s.session_type === "learning") || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Session Offerings</h2>
          <p className="text-sm text-muted-foreground">Manage the sessions you offer to candidates</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Session
        </Button>
      </div>

      {/* 1:1 Learning */}
      <SessionGroup
        title="1:1 Learning Sessions"
        icon={<User className="h-5 w-5 text-primary" />}
        sessions={oneOnOneLearning}
        onEdit={openEdit}
        onDelete={setDeleteConfirmId}
        onToggle={handleToggleActive}
      />

      {/* 1:1 Mock */}
      <SessionGroup
        title="1:1 Mock Examinations"
        icon={<GraduationCap className="h-5 w-5 text-primary" />}
        sessions={oneOnOneMock}
        onEdit={openEdit}
        onDelete={setDeleteConfirmId}
        onToggle={handleToggleActive}
      />

      {/* Group Learning */}
      <SessionGroup
        title="Group Learning Sessions"
        icon={<Users className="h-5 w-5 text-primary" />}
        sessions={groupLearning}
        onEdit={openEdit}
        onDelete={setDeleteConfirmId}
        onToggle={handleToggleActive}
      />

      {(!sessions || sessions.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No sessions configured yet</p>
            <p className="text-sm text-muted-foreground mt-1">Click "Add Session" to start offering sessions to candidates</p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit Session" : "Add New Session"}</DialogTitle>
            <DialogDescription>
              {editingSession ? "Update the session configuration" : "Configure a new session offering"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Session Mode</Label>
                <Select
                  value={form.session_mode}
                  onValueChange={(v) => setForm(prev => ({
                    ...prev,
                    session_mode: v as any,
                    group_size: v === "group" ? 2 : null,
                    session_type: v === "group" ? "learning" : prev.session_type,
                  }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_on_one">1:1</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Session Type</Label>
                <Select
                  value={form.session_type}
                  onValueChange={(v) => setForm(prev => ({ ...prev, session_type: v as any }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learning">Learning</SelectItem>
                    {form.session_mode === "one_on_one" && (
                      <SelectItem value="mock">Mock Exam</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.session_mode === "group" && (
              <div className="space-y-2">
                <Label>Group Size</Label>
                <Select
                  value={String(form.group_size || 2)}
                  onValueChange={(v) => setForm(prev => ({ ...prev, group_size: parseInt(v) }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Group of 2</SelectItem>
                    <SelectItem value="3">Group of 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stations</Label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={form.stations}
                  onChange={(e) => setForm(prev => ({ ...prev, stations: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (mins)</Label>
                <Input
                  type="number"
                  min={10}
                  value={form.duration_minutes}
                  onChange={(e) => setForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 25 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (£)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm(prev => ({ ...prev, is_active: v }))}
                  />
                  <Label className="cursor-pointer">Active</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value || null }))}
                placeholder="Brief description of this session..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={createSession.isPending || updateSession.isPending}
            >
              {(createSession.isPending || updateSession.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingSession ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>Are you sure you want to delete this session offering? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deleteSession.isPending}
            >
              {deleteSession.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SessionGroup({
  title,
  icon,
  sessions,
  onEdit,
  onDelete,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  sessions: TrainerSession[];
  onEdit: (s: TrainerSession) => void;
  onDelete: (id: string) => void;
  onToggle: (s: TrainerSession) => void;
}) {
  if (sessions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon} {title}
        </CardTitle>
        <CardDescription>{sessions.length} offering{sessions.length !== 1 ? "s" : ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                session.is_active ? "hover:bg-muted/50" : "opacity-60 bg-muted/20"
              }`}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">
                    {session.stations} Station{session.stations !== 1 ? "s" : ""}
                  </span>
                  {session.group_size && (
                    <Badge variant="secondary" className="text-xs">
                      Group of {session.group_size}
                    </Badge>
                  )}
                  {!session.is_active && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {session.duration_minutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <PoundSterling className="h-3.5 w-3.5" /> £{session.price}
                  </span>
                </div>
                {session.description && (
                  <p className="text-xs text-muted-foreground mt-1">{session.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Switch
                  checked={session.is_active}
                  onCheckedChange={() => onToggle(session)}
                  className="mr-1"
                />
                <Button size="icon" variant="ghost" onClick={() => onEdit(session)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(session.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
