import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useAllBookings, useUpdateBooking } from "@/hooks/useBookings";
import { useTrainers, useCreateTrainer, useUpdateTrainer } from "@/hooks/useTrainers";
import { useContactSubmissions, useMarkContactRead } from "@/hooks/useContactSubmissions";
import { useStationCategories, useStationSubcategories, useAllStations } from "@/hooks/useStations";
import { useRecordings, useRevokeRecording, useAppSettings } from "@/hooks/useRecordings";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Brain, Users, Calendar, CreditCard, TrendingUp, LogOut,
  UserCog, BookOpen, DollarSign, RefreshCw, Mail, Shield,
  BarChart3, Clock, Loader2, Plus, Eye, X, Video, Layers,
  FolderTree, Settings, Ban,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useAllBookings();
  const { data: trainers, isLoading: trainersLoading, refetch: refetchTrainers } = useTrainers(false);
  const { data: contacts, isLoading: contactsLoading } = useContactSubmissions();
  const { data: categories } = useStationCategories();
  const { data: subcategories } = useStationSubcategories();
  const { data: stations, isLoading: stationsLoading } = useAllStations();
  const { data: recordings, isLoading: recordingsLoading } = useRecordings();
  const { data: appSettings } = useAppSettings();
  
  const createTrainer = useCreateTrainer();
  const updateTrainer = useUpdateTrainer();
  const updateBooking = useUpdateBooking();
  const markRead = useMarkContactRead();
  const revokeRecording = useRevokeRecording();

  const [addTrainerOpen, setAddTrainerOpen] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ name: "", email: "", bio: "", specialty: "", calendly_url: "" });

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAddTrainer = async () => {
    try {
      await createTrainer.mutateAsync({ ...newTrainer, is_active: true, avatar_url: null });
      toast({ title: "Trainer added successfully" });
      setAddTrainerOpen(false);
      setNewTrainer({ name: "", email: "", bio: "", specialty: "", calendly_url: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleTrainerActive = async (id: string, isActive: boolean) => {
    await updateTrainer.mutateAsync({ id, is_active: !isActive });
    toast({ title: isActive ? "Trainer deactivated" : "Trainer activated" });
  };

  const cancelBooking = async (id: string) => {
    await updateBooking.mutateAsync({ id, status: "cancelled" });
    toast({ title: "Booking cancelled" });
  };

  const handleRevokeRecording = async (id: string) => {
    try {
      await revokeRecording.mutateAsync(id);
      toast({ title: "Recording access revoked" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const totalRevenue = bookings?.filter(b => b.status !== "cancelled").length || 0;
  const unreadContacts = contacts?.filter(c => !c.is_read).length || 0;
  const activeRecordings = recordings?.filter(r => r.status === "active").length || 0;

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
              <Shield className="h-3 w-3" />
              Admin Panel
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage bookings, trainers, stations, and recordings.</p>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{bookings?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <UserCog className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{trainers?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Trainers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Layers className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{stations?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Stations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Video className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{activeRecordings}</p>
              <p className="text-sm text-muted-foreground">Active Recordings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Mail className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{unreadContacts}</p>
              <p className="text-sm text-muted-foreground">Unread Messages</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-2">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
            <TabsTrigger value="contacts">
              Contacts {unreadContacts > 0 && <Badge className="ml-2">{unreadContacts}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Bookings</CardTitle>
                <Button variant="outline" size="sm" onClick={() => refetchBookings()}>
                  <RefreshCw className="h-4 w-4 mr-2" />Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : bookings?.length ? (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{b.profile?.full_name || b.profile?.email || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">
                            {b.session_mode === "one_on_one" ? "1:1" : "Group"} {b.session_type} • {b.stations} stations
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Trainer: {b.trainer?.name || "—"} {b.scheduled_at && `• ${format(new Date(b.scheduled_at), "MMM d, h:mm a")}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={b.status === "confirmed" ? "default" : b.status === "cancelled" ? "destructive" : "secondary"}>
                            {b.status}
                          </Badge>
                          {b.status !== "cancelled" && (
                            <Button size="sm" variant="outline" onClick={() => cancelBooking(b.id)}>Cancel</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No bookings yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trainers Tab */}
          <TabsContent value="trainers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Trainer Management</CardTitle>
                  <CardDescription>Add, edit, and manage trainer accounts</CardDescription>
                </div>
                <Dialog open={addTrainerOpen} onOpenChange={setAddTrainerOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-bg-primary border-0"><Plus className="h-4 w-4 mr-2" />Add Trainer</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Trainer</DialogTitle>
                      <DialogDescription>
                        Create a trainer profile. They can log in once you link their user account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Name</Label><Input value={newTrainer.name} onChange={(e) => setNewTrainer({...newTrainer, name: e.target.value})} /></div>
                      <div><Label>Email</Label><Input value={newTrainer.email} onChange={(e) => setNewTrainer({...newTrainer, email: e.target.value})} /></div>
                      <div><Label>Specialty</Label><Input value={newTrainer.specialty} onChange={(e) => setNewTrainer({...newTrainer, specialty: e.target.value})} /></div>
                      <div><Label>Calendly URL</Label><Input value={newTrainer.calendly_url} onChange={(e) => setNewTrainer({...newTrainer, calendly_url: e.target.value})} /></div>
                      <div><Label>Bio</Label><Textarea value={newTrainer.bio} onChange={(e) => setNewTrainer({...newTrainer, bio: e.target.value})} /></div>
                      <Button onClick={handleAddTrainer} disabled={!newTrainer.name || createTrainer.isPending} className="w-full">
                        {createTrainer.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Trainer"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {trainersLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : trainers?.length ? (
                  <div className="space-y-3">
                    {trainers.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{t.name}</p>
                          <p className="text-sm text-muted-foreground">{t.specialty || "MRCPsych Trainer"}</p>
                          <p className="text-xs text-muted-foreground">{t.email || "No email"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch checked={t.is_active} onCheckedChange={() => toggleTrainerActive(t.id, t.is_active)} />
                          <span className="text-sm w-16">{t.is_active ? "Active" : "Inactive"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No trainers yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stations Tab */}
          <TabsContent value="stations">
            <div className="grid gap-6">
              {/* Categories Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderTree className="h-5 w-5" />
                    Station Categories
                  </CardTitle>
                  <CardDescription>Manage exam station categories and subcategories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories?.map((cat) => (
                      <div key={cat.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">{cat.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {subcategories
                            ?.filter((sub: any) => sub.category_id === cat.id)
                            .map((sub: any) => (
                              <Badge key={sub.id} variant="secondary">
                                {sub.name}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stations List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Stations</CardTitle>
                  <CardDescription>View and manage individual stations</CardDescription>
                </CardHeader>
                <CardContent>
                  {stationsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                  ) : stations?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Station Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Sub-category</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stations.map((station: any) => (
                          <TableRow key={station.id}>
                            <TableCell className="font-medium">{station.name}</TableCell>
                            <TableCell>{station.subcategory?.category?.name || "—"}</TableCell>
                            <TableCell>{station.subcategory?.name || "—"}</TableCell>
                            <TableCell>
                              <Badge variant={station.is_active ? "default" : "secondary"}>
                                {station.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No stations found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings">
            <div className="grid gap-6">
              {/* Recording Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Recording Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Auto Recording</p>
                        <p className="text-sm text-muted-foreground">Record sessions automatically</p>
                      </div>
                      <Switch checked={appSettings?.recording_auto_enabled?.enabled ?? true} disabled />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Auto Share</p>
                        <p className="text-sm text-muted-foreground">Share with candidate automatically</p>
                      </div>
                      <Switch checked={appSettings?.recording_auto_share?.enabled ?? true} disabled />
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium">Auto Delete</p>
                      <p className="text-sm text-muted-foreground">
                        Recordings expire after {appSettings?.recording_expiry_days?.days ?? 10} days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recordings List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Recordings</CardTitle>
                  <CardDescription>Manage session recordings and access</CardDescription>
                </CardHeader>
                <CardContent>
                  {recordingsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                  ) : recordings?.length ? (
                    <div className="space-y-3">
                      {recordings.map((rec) => (
                        <div key={rec.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Video className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Recording</p>
                              <p className="text-sm text-muted-foreground">
                                Created: {format(new Date(rec.created_at), "MMM d, yyyy")} • 
                                Expires: {format(new Date(rec.expiry_date), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={rec.status === "active" ? "default" : rec.status === "revoked" ? "destructive" : "secondary"}>
                              {rec.status}
                            </Badge>
                            {rec.status === "active" && (
                              <Button size="sm" variant="outline" onClick={() => handleRevokeRecording(rec.id)}>
                                <Ban className="h-4 w-4 mr-1" />
                                Revoke
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No recordings yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader><CardTitle>Contact Submissions</CardTitle></CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : contacts?.length ? (
                  <div className="space-y-3">
                    {contacts.map((c) => (
                      <div key={c.id} className={`p-4 border rounded-lg ${!c.is_read ? "bg-primary/5 border-primary/30" : ""}`}>
                        <div className="flex justify-between mb-2">
                          <p className="font-medium">{c.name} ({c.email})</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{format(new Date(c.created_at), "MMM d, h:mm a")}</span>
                            {!c.is_read && <Button size="sm" variant="ghost" onClick={() => markRead.mutate(c.id)}><Eye className="h-4 w-4" /></Button>}
                          </div>
                        </div>
                        {c.subject && <Badge variant="secondary" className="mb-2">{c.subject}</Badge>}
                        <p className="text-sm text-muted-foreground">{c.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No contact submissions yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
