import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Brain, Clock, LogOut, CheckCircle, XCircle, Mail, RefreshCw } from "lucide-react";

interface PendingApprovalProps {
  status: "pending" | "rejected";
  trainerName?: string;
}

export default function PendingApproval({ status, trainerName }: PendingApprovalProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

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
              <Clock className="h-3 w-3" />
              Trainer Application
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            {trainerName && <span className="text-sm text-muted-foreground">{trainerName}</span>}
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-16">
        <div className="max-w-2xl mx-auto">
          {status === "pending" ? (
            <Card className="border-secondary bg-secondary/30">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <Clock className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl">Application Under Review</CardTitle>
                <CardDescription className="text-base">
                  Thank you for applying to become a trainer!
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Our team is currently reviewing your application. This process typically takes 
                    <span className="font-medium text-foreground"> 1-3 business days</span>.
                  </p>
                  <p>
                    You'll receive an email notification once your application has been reviewed.
                  </p>
                </div>

                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="font-medium mb-3 flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    What happens next?
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground">1.</span>
                      Our admin team reviews your qualifications and experience
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground">2.</span>
                      You'll receive an email with the decision
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground">3.</span>
                      Once approved, you can set your availability and start receiving bookings
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button variant="outline" onClick={handleRefresh} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Check Status
                  </Button>
                  <Button variant="outline" asChild className="gap-2">
                    <Link to="/contact">
                      <Mail className="h-4 w-4" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Application Not Approved</CardTitle>
                <CardDescription className="text-base">
                  We appreciate your interest in becoming a trainer.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Unfortunately, your application was not approved at this time. 
                    This could be due to various factors related to our current requirements.
                  </p>
                  <p>
                    If you believe this was in error or would like more information, 
                    please don't hesitate to contact our support team.
                  </p>
                </div>

                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="font-medium mb-3">What can you do?</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground">•</span>
                      Contact support for detailed feedback on your application
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground">•</span>
                      Update your qualifications and reapply after some time
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground">•</span>
                      Continue as a candidate and book sessions with our trainers
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button variant="outline" asChild className="gap-2">
                    <Link to="/contact">
                      <Mail className="h-4 w-4" />
                      Contact Support
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/">Return Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
