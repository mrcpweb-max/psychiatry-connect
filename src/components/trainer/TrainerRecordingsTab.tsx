import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useRecordings } from "@/hooks/useRecordings";

export function TrainerRecordingsTab() {
  const { data: recordings, isLoading } = useRecordings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Session Recordings
        </CardTitle>
        <CardDescription>View recordings from your sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : recordings?.length ? (
          <div className="space-y-3">
            {recordings.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Session Recording</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {format(parseISO(rec.created_at), "MMM d, yyyy")} • Expires: {format(parseISO(rec.expiry_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <Badge variant={rec.status === "active" ? "default" : "secondary"}>
                  {rec.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Video className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No recordings available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
