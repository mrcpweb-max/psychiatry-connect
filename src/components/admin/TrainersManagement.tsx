import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTrainers, useUpdateTrainer, useCreateTrainer } from "@/hooks/useTrainers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCog, Plus, Pencil, Loader2, Check, X, Eye, Clock, CheckCircle, XCircle } from "lucide-react";

import { Trainer } from "@/hooks/useTrainers";

export function TrainersManagement() {
  const { toast } = useToast();
  const { data: trainers, isLoading, refetch } = useTrainers(false);
  const updateTrainer = useUpdateTrainer();
  const createTrainer = useCreateTrainer();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  
  const [newTrainer, setNewTrainer] = useState({
    name: "",
    email: "",
    specialty: "",
    bio: "",
    calendly_url: "",
  });

  const pendingTrainers = trainers?.filter((t: Trainer) => t.status === "pending") || [];
  const approvedTrainers = trainers?.filter((t: Trainer) => t.status === "approved") || [];
  const rejectedTrainers = trainers?.filter((t: Trainer) => t.status === "rejected") || [];

  const handleApprove = async (trainer: Trainer) => {
    try {
      await updateTrainer.mutateAsync({ 
        id: trainer.id, 
        status: "approved" as any,
        is_active: true 
      });

      // Update user role to 'trainer' if the trainer has a linked user account
      if (trainer.user_id) {
        await supabase
          .from("user_roles")
          .update({ role: "trainer" as any })
          .eq("user_id", trainer.user_id);
      }

      toast({ title: "Trainer approved", description: `${trainer.name} can now receive bookings.` });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (trainer: Trainer) => {
    try {
      await updateTrainer.mutateAsync({ 
        id: trainer.id, 
        status: "rejected" as any,
        is_active: false 
      });
      toast({ title: "Trainer rejected", description: `${trainer.name}'s application has been rejected.` });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (trainer: Trainer) => {
    try {
      await updateTrainer.mutateAsync({ id: trainer.id, is_active: !trainer.is_active });
      toast({ title: trainer.is_active ? "Trainer deactivated" : "Trainer activated" });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddTrainer = async () => {
    try {
      await createTrainer.mutateAsync({
        name: newTrainer.name,
        email: newTrainer.email,
        specialty: newTrainer.specialty,
        bio: newTrainer.bio,
        calendly_url: newTrainer.calendly_url,
        is_active: true,
        avatar_url: null,
        status: "approved" as any,
      } as any);
      toast({ title: "Trainer added successfully" });
      setAddDialogOpen(false);
      setNewTrainer({ name: "", email: "", specialty: "", bio: "", calendly_url: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEditTrainer = async () => {
    if (!selectedTrainer) return;
    try {
      await updateTrainer.mutateAsync({
        id: selectedTrainer.id,
        name: selectedTrainer.name,
        email: selectedTrainer.email,
        specialty: selectedTrainer.specialty,
        bio: selectedTrainer.bio,
        calendly_url: selectedTrainer.calendly_url,
      });
      toast({ title: "Trainer updated" });
      setEditDialogOpen(false);
      setSelectedTrainer(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openEditDialog = (trainer: Trainer) => {
    setSelectedTrainer({ ...trainer });
    setEditDialogOpen(true);
  };

  const openViewDialog = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const TrainerRow = ({ trainer, showActions = true }: { trainer: Trainer; showActions?: boolean }) => (
    <TableRow>
      <TableCell className="font-medium">{trainer.name}</TableCell>
      <TableCell>{trainer.email || "—"}</TableCell>
      <TableCell>{trainer.specialty || "MRCPsych Trainer"}</TableCell>
      <TableCell>{getStatusBadge(trainer.status)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={trainer.is_active}
            onCheckedChange={() => handleToggleActive(trainer)}
            disabled={trainer.status !== "approved"}
          />
          <span className="text-sm">{trainer.is_active ? "Active" : "Inactive"}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => openViewDialog(trainer)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => openEditDialog(trainer)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {showActions && trainer.status === "pending" && (
            <>
              <Button size="icon" variant="ghost" className="text-green-600" onClick={() => handleApprove(trainer)}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleReject(trainer)}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Trainer Management
          </CardTitle>
          <CardDescription>Manage trainer accounts and applications</CardDescription>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg-primary border-0">
              <Plus className="h-4 w-4 mr-2" /> Add Trainer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Trainer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={newTrainer.name} onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={newTrainer.email} onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })} />
              </div>
              <div>
                <Label>Specialty</Label>
                <Input value={newTrainer.specialty} onChange={(e) => setNewTrainer({ ...newTrainer, specialty: e.target.value })} />
              </div>
              <div>
                <Label>Calendly URL</Label>
                <Input value={newTrainer.calendly_url} onChange={(e) => setNewTrainer({ ...newTrainer, calendly_url: e.target.value })} />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea value={newTrainer.bio} onChange={(e) => setNewTrainer({ ...newTrainer, bio: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTrainer} disabled={!newTrainer.name || createTrainer.isPending}>
                {createTrainer.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Trainer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending {pendingTrainers.length > 0 && <Badge className="ml-2" variant="secondary">{pendingTrainers.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedTrainers.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedTrainers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : pendingTrainers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTrainers.map((trainer: Trainer) => (
                    <TrainerRow key={trainer.id} trainer={trainer} />
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No pending applications</p>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approvedTrainers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedTrainers.map((trainer: Trainer) => (
                    <TrainerRow key={trainer.id} trainer={trainer} showActions={false} />
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No approved trainers</p>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejectedTrainers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedTrainers.map((trainer: Trainer) => (
                    <TrainerRow key={trainer.id} trainer={trainer} />
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No rejected applications</p>
            )}
          </TabsContent>
        </Tabs>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Trainer Details</DialogTitle>
            </DialogHeader>
            {selectedTrainer && (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedTrainer.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedTrainer.email || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Specialty</Label>
                    <p className="font-medium">{selectedTrainer.specialty || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <p>{getStatusBadge(selectedTrainer.status)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Years Experience</Label>
                    <p className="font-medium">{selectedTrainer.years_experience || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Calendar Type</Label>
                    <p className="font-medium capitalize">{selectedTrainer.calendar_type || "—"}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Qualifications</Label>
                  <p className="font-medium">{selectedTrainer.qualifications || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bio</Label>
                  <p className="font-medium">{selectedTrainer.bio || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Areas of Expertise</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTrainer.areas_of_expertise?.map((area, i) => (
                      <Badge key={i} variant="secondary">{area}</Badge>
                    )) || <span>—</span>}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Session Types</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTrainer.session_types_offered?.map((type, i) => (
                      <Badge key={i} variant="outline">{type}</Badge>
                    )) || <span>—</span>}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Calendar Link</Label>
                  <p className="font-medium break-all">{selectedTrainer.calendly_url || "—"}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              {selectedTrainer?.status === "pending" && (
                <>
                  <Button variant="destructive" onClick={() => { handleReject(selectedTrainer); setViewDialogOpen(false); }}>
                    Reject
                  </Button>
                  <Button onClick={() => { handleApprove(selectedTrainer); setViewDialogOpen(false); }}>
                    Approve
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Trainer</DialogTitle>
            </DialogHeader>
            {selectedTrainer && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input 
                    value={selectedTrainer.name} 
                    onChange={(e) => setSelectedTrainer({ ...selectedTrainer, name: e.target.value })} 
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={selectedTrainer.email || ""} 
                    onChange={(e) => setSelectedTrainer({ ...selectedTrainer, email: e.target.value })} 
                  />
                </div>
                <div>
                  <Label>Specialty</Label>
                  <Input 
                    value={selectedTrainer.specialty || ""} 
                    onChange={(e) => setSelectedTrainer({ ...selectedTrainer, specialty: e.target.value })} 
                  />
                </div>
                <div>
                  <Label>Calendly URL</Label>
                  <Input 
                    value={selectedTrainer.calendly_url || ""} 
                    onChange={(e) => setSelectedTrainer({ ...selectedTrainer, calendly_url: e.target.value })} 
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea 
                    value={selectedTrainer.bio || ""} 
                    onChange={(e) => setSelectedTrainer({ ...selectedTrainer, bio: e.target.value })} 
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditTrainer} disabled={updateTrainer.isPending}>
                {updateTrainer.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}