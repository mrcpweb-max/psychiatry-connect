import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  LogOut,
  UserCog,
  BookOpen,
  DollarSign,
  RefreshCw,
  Mail,
  Shield,
  BarChart3,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      // In production, check admin role from user_roles table
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Mock KPI data
  const kpis = [
    { label: "Total Revenue", value: "£24,580", change: "+12%", icon: DollarSign },
    { label: "Active Bookings", value: "47", change: "+8", icon: Calendar },
    { label: "Total Users", value: "312", change: "+23", icon: Users },
    { label: "This Month", value: "£8,450", change: "+18%", icon: TrendingUp },
  ];

  // Mock recent bookings
  const recentBookings = [
    { id: 1, user: "Dr. Emily Watson", trainer: "Dr. Sarah Mitchell", type: "1:1 Mock", date: "Jan 18, 2026", amount: 200, status: "confirmed" },
    { id: 2, user: "Dr. Michael Brown", trainer: "Dr. James Chen", type: "Group Learning", date: "Jan 19, 2026", amount: 80, status: "pending" },
    { id: 3, user: "Dr. Lisa Park", trainer: "Dr. Amara Okafor", type: "1:1 Learning", date: "Jan 20, 2026", amount: 110, status: "confirmed" },
  ];

  // Mock pending refunds
  const pendingRefunds = [
    { id: 1, user: "Dr. John Smith", amount: 100, reason: "Cancelled 5 days before", date: "Jan 15, 2026" },
  ];

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
          <p className="text-muted-foreground">
            Manage bookings, trainers, payments, and platform settings.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className="h-5 w-5 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs">
                    {kpi.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="trainers" className="gap-2">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Trainers</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Manage and view all session bookings</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.user}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.type} with {booking.trainer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">£{booking.amount}</p>
                          <p className="text-sm text-muted-foreground">{booking.date}</p>
                        </div>
                        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trainers Tab */}
          <TabsContent value="trainers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Trainer Management</CardTitle>
                    <CardDescription>Add, edit, or deactivate trainers</CardDescription>
                  </div>
                  <Button className="gradient-bg-primary border-0 gap-2">
                    <UserCog className="h-4 w-4" />
                    Add Trainer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Trainer management features will be available after database setup.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="grid gap-6">
              {/* Pending Refunds Alert */}
              {pendingRefunds.length > 0 && (
                <Card className="border-warning/50 bg-warning/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <CardTitle className="text-lg">Pending Refunds</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {pendingRefunds.map((refund) => (
                      <div
                        key={refund.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-background"
                      >
                        <div>
                          <p className="font-medium">{refund.user}</p>
                          <p className="text-sm text-muted-foreground">{refund.reason}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">£{refund.amount}</p>
                            <p className="text-sm text-muted-foreground">{refund.date}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Process
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>View all transactions and refunds</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    Payment history will be populated from the database.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contact Submissions</CardTitle>
                <CardDescription>Review messages from the contact form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Contact form submissions will appear here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Admin Activity Logs</CardTitle>
                <CardDescription>Track all administrative actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "Trainer added", user: "Admin", time: "2 hours ago" },
                    { action: "Refund processed", user: "Admin", time: "5 hours ago" },
                    { action: "Booking cancelled", user: "Admin", time: "1 day ago" },
                  ].map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">by {log.user}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{log.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
