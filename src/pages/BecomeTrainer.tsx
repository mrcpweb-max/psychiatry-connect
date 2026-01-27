import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Mail, Lock, User, ArrowLeft, Loader2, GraduationCap, Calendar, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const trainerSignupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  qualifications: z.string().min(10, "Please provide your qualifications"),
  yearsExperience: z.number().min(1, "Please enter years of experience"),
  areasOfExpertise: z.array(z.string()).min(1, "Select at least one area"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  sessionTypesOffered: z.array(z.string()).min(1, "Select at least one session type"),
  calendarType: z.string(),
  calendarLink: z.string().url("Please enter a valid URL"),
});

const expertiseAreas = [
  "Adult Psychiatry",
  "Child & Adolescent Psychiatry",
  "Forensic Psychiatry",
  "Old Age Psychiatry",
  "Addiction Psychiatry",
  "Neuropsychiatry",
  "Psychotherapy",
  "Consultation-Liaison",
];

export default function BecomeTrainer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    qualifications: "",
    yearsExperience: "",
    areasOfExpertise: [] as string[],
    bio: "",
    sessionTypesOffered: [] as string[],
    calendarType: "calendly",
    calendarLink: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if already logged in as trainer
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        if (roleData?.role === "trainer") {
          navigate("/trainer");
        } else if (roleData?.role === "admin") {
          navigate("/admin");
        }
      }
    };
    checkSession();
  }, [navigate]);

  const toggleExpertise = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areasOfExpertise: prev.areasOfExpertise.includes(area)
        ? prev.areasOfExpertise.filter(a => a !== area)
        : [...prev.areasOfExpertise, area]
    }));
  };

  const toggleSessionType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      sessionTypesOffered: prev.sessionTypesOffered.includes(type)
        ? prev.sessionTypesOffered.filter(t => t !== type)
        : [...prev.sessionTypesOffered, type]
    }));
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6) newErrors.password = "Min 6 characters";
      if (!formData.fullName) newErrors.fullName = "Name is required";
    }
    
    if (stepNumber === 2) {
      if (!formData.qualifications || formData.qualifications.length < 10) 
        newErrors.qualifications = "Please provide your qualifications";
      if (!formData.yearsExperience || parseInt(formData.yearsExperience) < 1) 
        newErrors.yearsExperience = "Enter years of experience";
      if (formData.areasOfExpertise.length === 0) 
        newErrors.areasOfExpertise = "Select at least one area";
    }
    
    if (stepNumber === 3) {
      if (!formData.bio || formData.bio.length < 50) 
        newErrors.bio = "Bio must be at least 50 characters";
      if (formData.sessionTypesOffered.length === 0) 
        newErrors.sessionTypesOffered = "Select at least one session type";
      if (!formData.calendarLink) newErrors.calendarLink = "Calendar link is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsLoading(true);

    try {
      // 1. Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/trainer`,
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create account");

      // 2. Sign in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      // 3. Update user role to trainer
      await supabase.from("user_roles").update({ role: "trainer" }).eq("user_id", authData.user.id);

      // 4. Create trainer profile with pending status
      const { error: trainerError } = await supabase.from("trainers").insert({
        user_id: authData.user.id,
        name: formData.fullName,
        email: formData.email,
        bio: formData.bio,
        qualifications: formData.qualifications,
        years_experience: parseInt(formData.yearsExperience),
        areas_of_expertise: formData.areasOfExpertise,
        session_types_offered: formData.sessionTypesOffered,
        calendar_type: formData.calendarType,
        calendly_url: formData.calendarLink,
        status: "pending",
        is_active: false,
        applied_at: new Date().toISOString(),
      });

      if (trainerError) throw trainerError;

      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Your trainer application is pending admin review.",
      });
    } catch (error: any) {
      let message = "An error occurred. Please try again.";
      
      if (error.message.includes("User already registered")) {
        message = "This email is already registered. Please sign in instead.";
      }
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen gradient-bg-hero flex flex-col">
        <header className="p-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for applying to become a trainer. Your application is now pending review by our admin team. 
                We'll notify you once your application is approved.
              </p>
              <div className="space-y-3">
                <Link to="/trainer">
                  <Button className="w-full gradient-bg-primary border-0">
                    Go to Trainer Dashboard
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Return Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-hero flex flex-col">
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-bg-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Become a Trainer</CardTitle>
            <CardDescription>
              Join our team of expert MRCPsych trainers
            </CardDescription>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s < step ? "bg-accent text-accent-foreground" : 
                    s === step ? "bg-primary text-primary-foreground" : 
                    "bg-muted text-muted-foreground"
                  }`}>
                    {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-accent" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Account Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Account Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Dr. John Smith"
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Professional Info */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Professional Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="e.g., MBBS, MRCPsych, CCT in General Adult Psychiatry"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    rows={3}
                  />
                  {errors.qualifications && <p className="text-sm text-destructive">{errors.qualifications}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="1"
                    placeholder="e.g., 10"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  />
                  {errors.yearsExperience && <p className="text-sm text-destructive">{errors.yearsExperience}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Areas of Expertise</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {expertiseAreas.map((area) => (
                      <label
                        key={area}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.areasOfExpertise.includes(area)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          checked={formData.areasOfExpertise.includes(area)}
                          onCheckedChange={() => toggleExpertise(area)}
                        />
                        <span className="text-sm">{area}</span>
                      </label>
                    ))}
                  </div>
                  {errors.areasOfExpertise && <p className="text-sm text-destructive">{errors.areasOfExpertise}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Session & Calendar */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Session & Calendar Setup</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Write a short bio about your experience and teaching style..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">{formData.bio.length}/50 minimum characters</p>
                  {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Session Types You'll Offer</Label>
                  <div className="flex gap-4">
                    {["1:1 Sessions", "Group Sessions"].map((type) => (
                      <label
                        key={type}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors flex-1 ${
                          formData.sessionTypesOffered.includes(type)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          checked={formData.sessionTypesOffered.includes(type)}
                          onCheckedChange={() => toggleSessionType(type)}
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                  {errors.sessionTypesOffered && <p className="text-sm text-destructive">{errors.sessionTypesOffered}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Calendar Type</Label>
                  <RadioGroup
                    value={formData.calendarType}
                    onValueChange={(v) => setFormData({ ...formData, calendarType: v })}
                    className="flex gap-4"
                  >
                    <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer flex-1 ${
                      formData.calendarType === "calendly" ? "border-primary bg-primary/5" : "border-border"
                    }`}>
                      <RadioGroupItem value="calendly" />
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Calendly</span>
                    </label>
                    <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer flex-1 ${
                      formData.calendarType === "google" ? "border-primary bg-primary/5" : "border-border"
                    }`}>
                      <RadioGroupItem value="google" />
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Google Calendar</span>
                    </label>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calendarLink">Calendar Link</Label>
                  <Input
                    id="calendarLink"
                    type="url"
                    placeholder={formData.calendarType === "calendly" ? "https://calendly.com/your-link" : "https://calendar.google.com/..."}
                    value={formData.calendarLink}
                    onChange={(e) => setFormData({ ...formData, calendarLink: e.target.value })}
                  />
                  {errors.calendarLink && <p className="text-sm text-destructive">{errors.calendarLink}</p>}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <Button onClick={handleNext} className="gradient-bg-primary border-0">
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  className="gradient-bg-primary border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              )}
            </div>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}