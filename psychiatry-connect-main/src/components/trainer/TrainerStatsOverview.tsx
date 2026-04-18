import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Users, Video } from "lucide-react";

interface TrainerStatsOverviewProps {
  totalSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  totalRecordings: number;
}

export function TrainerStatsOverview({
  totalSessions,
  upcomingSessions,
  completedSessions,
  totalRecordings,
}: TrainerStatsOverviewProps) {
  const stats = [
    {
      label: "Total Sessions",
      value: totalSessions,
      icon: Calendar,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Upcoming",
      value: upcomingSessions,
      icon: Clock,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Completed",
      value: completedSessions,
      icon: Users,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Recordings",
      value: totalRecordings,
      icon: Video,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
