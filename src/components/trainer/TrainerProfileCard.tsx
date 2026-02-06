import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUpdateTrainerProfile } from "@/hooks/useUpdateTrainerProfile";
import {
  User,
  Pencil,
  Save,
  X,
  MapPin,
  GraduationCap,
  Briefcase,
  Link as LinkIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TrainerProfileCardProps {
  trainer: any;
}

export function TrainerProfileCard({ trainer }: TrainerProfileCardProps) {
  const { toast } = useToast();
  const updateProfile = useUpdateTrainerProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    name: trainer.name || "",
    bio: trainer.bio || "",
    specialty: trainer.specialty || "",
    calendly_url: trainer.calendly_url || "",
    qualifications: trainer.qualifications || "",
    years_experience: trainer.years_experience || 0,
  });

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        trainerId: trainer.id,
        ...form,
        years_experience: Number(form.years_experience),
      });
      toast({ title: "Profile updated successfully" });
      setEditOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const statusVariant =
    trainer.status === "approved"
      ? "default"
      : trainer.status === "pending"
      ? "secondary"
      : "destructive";

  const statusLabel =
    trainer.status === "approved"
      ? "Approved"
      : trainer.status === "pending"
      ? "Pending"
      : "Rejected";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full gradient-bg-primary flex items-center justify-center shrink-0">
            <User className="h-10 w-10 text-primary-foreground" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">{trainer.name}</h2>
                <p className="text-muted-foreground">{trainer.specialty || "MRCPsych Trainer"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={statusVariant}>{statusLabel}</Badge>
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div>
                        <Label>Specialty</Label>
                        <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="e.g., Adult Psychiatry" />
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} placeholder="Tell candidates about yourself..." />
                      </div>
                      <div>
                        <Label>Qualifications</Label>
                        <Input value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} placeholder="e.g., MRCPsych, MBBS" />
                      </div>
                      <div>
                        <Label>Years of Experience</Label>
                        <Input type="number" value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label>Calendly URL</Label>
                        <Input value={form.calendly_url} onChange={(e) => setForm({ ...form, calendly_url: e.target.value })} placeholder="https://calendly.com/..." />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleSave} className="flex-1 gap-2" disabled={updateProfile.isPending}>
                          <Save className="h-4 w-4" /> Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {trainer.qualifications && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  <span className="truncate">{trainer.qualifications}</span>
                </div>
              )}
              {trainer.years_experience && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span>{trainer.years_experience} years experience</span>
                </div>
              )}
              {trainer.calendly_url && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  <a href={trainer.calendly_url} target="_blank" rel="noopener noreferrer" className="truncate hover:text-primary transition-colors">
                    Calendly Link
                  </a>
                </div>
              )}
              {trainer.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{trainer.email}</span>
                </div>
              )}
            </div>

            {trainer.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed">{trainer.bio}</p>
            )}

            {trainer.areas_of_expertise?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {trainer.areas_of_expertise.map((area: string) => (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
