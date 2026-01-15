import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  CreditCard,
  CalendarCheck,
  Video,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up with your email and complete your profile. It only takes a few minutes to get started.",
    details: [
      "Quick email verification",
      "Complete your candidate profile",
      "Set your learning preferences",
    ],
  },
  {
    step: 2,
    icon: CreditCard,
    title: "Choose & Pay",
    description:
      "Select your preferred session type, trainer, and complete the secure payment to unlock scheduling.",
    details: [
      "Browse available trainers",
      "Select session type and stations",
      "Secure payment processing",
    ],
  },
  {
    step: 3,
    icon: CalendarCheck,
    title: "Schedule Your Session",
    description:
      "After payment, receive a secure scheduling link to book a time that works for both you and your trainer.",
    details: [
      "Secure scheduling token provided",
      "Choose from available slots",
      "Automatic confirmation sent",
    ],
  },
  {
    step: 4,
    icon: Video,
    title: "Attend & Learn",
    description:
      "Join your session at the scheduled time and receive expert coaching tailored to your needs.",
    details: [
      "High-quality video sessions",
      "Detailed feedback provided",
      "Resources shared after session",
    ],
  },
];

const faqs = [
  {
    q: "What happens after I pay?",
    a: "You'll receive a unique, time-limited scheduling link that allows you to book your session with your chosen trainer.",
  },
  {
    q: "Can I cancel my booking?",
    a: "Yes! Cancel 7+ days before for a full refund, or within 7 days for a 50% refund.",
  },
  {
    q: "How are trainers selected?",
    a: "All our trainers are verified psychiatrists with extensive experience in MRCPsych examination preparation.",
  },
];

export default function HowItWorks() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="gradient-bg-hero py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              How It Works
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Our simple 4-step process ensures you get the coaching you need 
              with secure payments and flexible scheduling.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-20 w-0.5 h-[calc(100%-5rem)] bg-border hidden md:block" />
                )}
                
                <div className="flex gap-6 mb-12 md:mb-16">
                  {/* Step indicator */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className="step-indicator active">
                      {step.step}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 md:p-8">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center flex-shrink-0">
                            <step.icon className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                        <ul className="grid gap-2 mt-6">
                          {step.details.map((detail, dIndex) => (
                            <li key={dIndex} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Payment First?
            </h2>
            <p className="text-lg text-muted-foreground">
              Our payment-first approach ensures commitment and guarantees your booking.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Guaranteed Slots",
                description: "Your session is confirmed immediately after payment - no waiting.",
              },
              {
                title: "Trainer Commitment",
                description: "Trainers prepare specifically for your session knowing it's confirmed.",
              },
              {
                title: "Secure & Private",
                description: "Scheduling links are private and single-use for your protection.",
              },
            ].map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick FAQs */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Quick Answers
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/faq">
                <Button variant="outline" className="gap-2">
                  View All FAQs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-bg-primary">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
            Create your account today and book your first coaching session.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
