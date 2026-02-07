import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Users,
  Calendar,
  Award,
  CheckCircle2,
  ArrowRight,
  Star,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";
import heroHomeImage from "@/assets/hero-home.jpg";

const features = [
  {
    icon: Brain,
    title: "Expert Trainers",
    description:
      "Learn from experienced psychiatrists who understand the MRCPsych exam inside out.",
  },
  {
    icon: Users,
    title: "1:1 & Group Sessions",
    description:
      "Choose between personalized one-on-one coaching or collaborative group learning.",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description:
      "Book sessions at times that work for you with our easy-to-use scheduling system.",
  },
  {
    icon: Award,
    title: "Proven Results",
    description:
      "Join hundreds of successful candidates who passed their exams with our coaching.",
  },
];

const stats = [
  { value: "95%", label: "Pass Rate" },
  { value: "500+", label: "Candidates Trained" },
  { value: "50+", label: "Expert Trainers" },
  { value: "4.9", label: "Average Rating" },
];

const sessionTypes = [
  {
    title: "Mock Examinations",
    description: "Full simulation of CASC stations with detailed feedback",
    features: ["4 or 8 station options", "Realistic exam conditions", "Video recording available"],
    popular: false,
  },
  {
    title: "Learning Sessions",
    description: "Focused training on specific psychiatric competencies",
    features: ["Choose 1-3 stations", "In-depth technique coaching", "Personalized feedback"],
    popular: true,
  },
  {
    title: "Group Sessions",
    description: "Collaborative learning with peer candidates",
    features: ["Groups of 2-3", "Cost-effective option", "Peer learning benefits"],
    popular: false,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg-hero py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
              <Sparkles className="h-4 w-4" />
              Trusted by 500+ MRCPsych Candidates
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Master Your{" "}
              <span className="gradient-text">MRCPsych</span>{" "}
              Journey
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Expert-led coaching sessions designed to help you excel in your psychiatric 
              training. Book personalized 1:1 or group sessions with experienced trainers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/sessions">
                <Button size="lg" className="gradient-bg-primary border-0 gap-2 w-full sm:w-auto">
                  Book a Session
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-border bg-card">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Our Coaching?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive support to help you succeed in your MRCPsych examinations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="glass-card border-0 hover:scale-[1.02] transition-transform duration-300"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Session Types Section */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Session Types
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the learning format that best suits your preparation needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessionTypes.map((session, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  session.popular ? "border-primary shadow-card" : ""
                }`}
              >
                {session.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-xl mb-2">{session.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {session.description}
                  </p>
                  <ul className="space-y-3">
                    {session.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/sessions">
              <Button size="lg" className="gradient-bg-primary border-0 gap-2">
                View All Sessions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Secure, Professional, Trusted
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We prioritize your success and security. Our platform ensures a 
                seamless booking experience with secure payments and verified trainers.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: "Secure payment processing" },
                  { icon: Clock, text: "Flexible cancellation policy" },
                  { icon: Star, text: "Verified expert trainers" },
                  { icon: CheckCircle2, text: "Money-back guarantee" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-accent" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-lg">
                <img 
                  src={heroHomeImage} 
                  alt="Expert psychiatry trainer conducting a mock CASC coaching session online" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card rounded-xl p-4 shadow-lg border border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">Pass Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 gradient-bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Start Your Journey Today
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Take the first step towards acing your MRCPsych examination. 
            Book a session with one of our expert trainers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sessions">
              <Button size="lg" variant="secondary" className="gap-2 w-full sm:w-auto">
                Browse Sessions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
