import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  Star,
  Clock,
} from "lucide-react";

type SessionMode = "1-1" | "group";
type SessionType = "mock" | "learning";
type GroupSize = 2 | 3;

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  sessions: number;
}

const trainers: Trainer[] = [
  { id: "1", name: "Dr. Sarah Mitchell", specialty: "Adult Psychiatry", rating: 4.9, sessions: 250 },
  { id: "2", name: "Dr. James Chen", specialty: "Child & Adolescent", rating: 4.8, sessions: 180 },
  { id: "3", name: "Dr. Amara Okafor", specialty: "Forensic Psychiatry", rating: 4.9, sessions: 150 },
];

// Pricing configuration
const pricing = {
  "1-1": {
    mock: { 4: 200, 8: 350 },
    learning: { 1: 60, 2: 110, 3: 150 },
  },
  group: {
    2: { 1: 45, 2: 80, 3: 110 },
    3: { 1: 35, 2: 60, 3: 85 },
  },
};

export default function BookSession() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [selectedTrainer, setSelectedTrainer] = useState<string>("");
  const [sessionMode, setSessionMode] = useState<SessionMode | "">("");
  const [sessionType, setSessionType] = useState<SessionType | "">("");
  const [stations, setStations] = useState<number | "">("");
  const [groupSize, setGroupSize] = useState<GroupSize | "">("");
  const [participants, setParticipants] = useState<{ name: string; email: string }[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session?.user);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Reset dependent fields when mode changes
  useEffect(() => {
    setSessionType("");
    setStations("");
    setGroupSize("");
    setParticipants([]);
  }, [sessionMode]);

  useEffect(() => {
    setStations("");
  }, [sessionType, groupSize]);

  // Initialize participants when group size changes
  useEffect(() => {
    if (groupSize) {
      const count = groupSize - 1; // Exclude the booking user
      setParticipants(Array(count).fill({ name: "", email: "" }));
    } else {
      setParticipants([]);
    }
  }, [groupSize]);

  const calculatePrice = (): number => {
    if (sessionMode === "1-1" && sessionType && stations) {
      return pricing["1-1"][sessionType][stations as keyof typeof pricing["1-1"]["mock"]];
    }
    if (sessionMode === "group" && groupSize && stations) {
      return pricing.group[groupSize][stations as keyof typeof pricing.group[2]];
    }
    return 0;
  };

  const getStationOptions = () => {
    if (sessionMode === "1-1") {
      if (sessionType === "mock") {
        return [4, 8];
      }
      return [1, 2, 3];
    }
    return [1, 2, 3];
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedTrainer !== "";
      case 2:
        return sessionMode !== "";
      case 3:
        if (sessionMode === "1-1") {
          return sessionType !== "" && stations !== "";
        }
        if (sessionMode === "group") {
          if (!groupSize || !stations) return false;
          return participants.every((p) => p.name.trim() && p.email.trim());
        }
        return false;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      if (step === 3) {
        // Proceed to payment
        toast({
          title: "Proceeding to payment",
          description: "You will be redirected to our secure payment page.",
        });
        // In production, this would integrate with Stripe
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateParticipant = (index: number, field: "name" | "email", value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to book a session.
            </p>
            <Link to="/auth">
              <Button className="gradient-bg-primary border-0">
                Sign In to Continue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trainer = trainers.find((t) => t.id === selectedTrainer);
  const price = calculatePrice();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
          </Link>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book a Session</h1>
          <p className="text-muted-foreground">
            Complete the steps below to book your coaching session.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`step-indicator ${
                  s < step ? "completed" : s === step ? "active" : "pending"
                }`}
              >
                {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    s < step ? "bg-accent" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Choose Your Trainer"}
              {step === 2 && "Select Session Mode"}
              {step === 3 && "Configure Your Session"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Select an expert trainer for your session"}
              {step === 2 && "Choose between 1:1 or group learning"}
              {step === 3 && "Customize your session details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Choose Trainer */}
            {step === 1 && (
              <RadioGroup value={selectedTrainer} onValueChange={setSelectedTrainer}>
                <div className="grid gap-4">
                  {trainers.map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedTrainer === t.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={t.id} className="sr-only" />
                      <div className="w-14 h-14 rounded-full gradient-bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{t.name}</h4>
                        <p className="text-sm text-muted-foreground">{t.specialty}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 text-warning fill-warning" />
                            {t.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {t.sessions} sessions
                          </span>
                        </div>
                      </div>
                      {selectedTrainer === t.id && (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      )}
                    </label>
                  ))}
                </div>
              </RadioGroup>
            )}

            {/* Step 2: Session Mode */}
            {step === 2 && (
              <RadioGroup value={sessionMode} onValueChange={(v) => setSessionMode(v as SessionMode)}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label
                    className={`flex flex-col items-center p-6 rounded-lg border cursor-pointer transition-all ${
                      sessionMode === "1-1"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="1-1" className="sr-only" />
                    <div className="w-16 h-16 rounded-xl gradient-bg-primary flex items-center justify-center mb-4">
                      <User className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">1:1 Session</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Personalized one-on-one coaching
                    </p>
                    <Badge variant="secondary" className="mt-3">
                      Mock & Learning available
                    </Badge>
                  </label>

                  <label
                    className={`flex flex-col items-center p-6 rounded-lg border cursor-pointer transition-all ${
                      sessionMode === "group"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="group" className="sr-only" />
                    <div className="w-16 h-16 rounded-xl gradient-bg-accent flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-accent-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">Group Session</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Learn with 1-2 other candidates
                    </p>
                    <Badge variant="secondary" className="mt-3">
                      Learning sessions only
                    </Badge>
                  </label>
                </div>
              </RadioGroup>
            )}

            {/* Step 3: Configure Session */}
            {step === 3 && (
              <div className="space-y-6">
                {/* 1:1 Configuration */}
                {sessionMode === "1-1" && (
                  <>
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Session Type</Label>
                      <RadioGroup
                        value={sessionType}
                        onValueChange={(v) => setSessionType(v as SessionType)}
                        className="grid sm:grid-cols-2 gap-4"
                      >
                        <label
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            sessionType === "mock"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value="mock" />
                          <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Mock Examination</p>
                            <p className="text-sm text-muted-foreground">Full CASC simulation</p>
                          </div>
                        </label>

                        <label
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            sessionType === "learning"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value="learning" />
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Learning Session</p>
                            <p className="text-sm text-muted-foreground">Focused skill training</p>
                          </div>
                        </label>
                      </RadioGroup>
                    </div>

                    {sessionType && (
                      <div>
                        <Label className="text-base font-semibold mb-3 block">Number of Stations</Label>
                        <RadioGroup
                          value={stations.toString()}
                          onValueChange={(v) => setStations(parseInt(v))}
                          className="flex gap-4"
                        >
                          {getStationOptions().map((s) => (
                            <label
                              key={s}
                              className={`flex items-center justify-center w-16 h-16 rounded-lg border cursor-pointer transition-all ${
                                stations === s
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <RadioGroupItem value={s.toString()} className="sr-only" />
                              <span className="font-bold text-xl">{s}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                  </>
                )}

                {/* Group Configuration */}
                {sessionMode === "group" && (
                  <>
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Group Size</Label>
                      <RadioGroup
                        value={groupSize.toString()}
                        onValueChange={(v) => setGroupSize(parseInt(v) as GroupSize)}
                        className="grid sm:grid-cols-2 gap-4"
                      >
                        <label
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            groupSize === 2
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value="2" />
                          <div>
                            <p className="font-medium">Group of 2</p>
                            <p className="text-sm text-muted-foreground">You + 1 participant</p>
                          </div>
                        </label>

                        <label
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            groupSize === 3
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value="3" />
                          <div>
                            <p className="font-medium">Group of 3</p>
                            <p className="text-sm text-muted-foreground">You + 2 participants</p>
                          </div>
                        </label>
                      </RadioGroup>
                    </div>

                    {groupSize && (
                      <>
                        <div>
                          <Label className="text-base font-semibold mb-3 block">Number of Stations</Label>
                          <RadioGroup
                            value={stations.toString()}
                            onValueChange={(v) => setStations(parseInt(v))}
                            className="flex gap-4"
                          >
                            {[1, 2, 3].map((s) => (
                              <label
                                key={s}
                                className={`flex items-center justify-center w-16 h-16 rounded-lg border cursor-pointer transition-all ${
                                  stations === s
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <RadioGroupItem value={s.toString()} className="sr-only" />
                                <span className="font-bold text-xl">{s}</span>
                              </label>
                            ))}
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-3 block">
                            Participant Details
                          </Label>
                          <div className="space-y-4">
                            {participants.map((p, index) => (
                              <div key={index} className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg border border-border">
                                <div>
                                  <Label htmlFor={`name-${index}`}>Participant {index + 2} Name</Label>
                                  <Input
                                    id={`name-${index}`}
                                    placeholder="Full name"
                                    value={p.name}
                                    onChange={(e) => updateParticipant(index, "name", e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`email-${index}`}>Email</Label>
                                  <Input
                                    id={`email-${index}`}
                                    type="email"
                                    placeholder="email@example.com"
                                    value={p.email}
                                    onChange={(e) => updateParticipant(index, "email", e.target.value)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary & Price */}
        {price > 0 && step === 3 && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Session Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {trainer?.name} • {sessionMode === "1-1" ? "1:1" : `Group of ${groupSize}`}{" "}
                    {sessionType || "Learning"} • {stations} station{stations !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">£{price}</p>
                  <p className="text-sm text-muted-foreground">per person</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gradient-bg-primary border-0 gap-2"
          >
            {step === 3 ? (
              <>
                Proceed to Payment
                <CreditCard className="h-4 w-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}

// Add missing import
import { CreditCard } from "lucide-react";
