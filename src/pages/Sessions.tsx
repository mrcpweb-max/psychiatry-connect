import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Users,
  BookOpen,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";
import heroSessionsImage from "@/assets/hero-sessions.jpg";

const sessionCategories = [
  {
    id: "1-1-mock",
    title: "1:1 Mock Examinations",
    description: "Full CASC simulation with detailed feedback from expert trainers",
    icon: ClipboardCheck,
    badge: "Most Comprehensive",
    options: [
      { name: "4 Stations Mock", price: 200, duration: "2 hours" },
      { name: "8 Stations Mock", price: 350, duration: "4 hours" },
    ],
    features: [
      "Realistic exam conditions",
      "Video recording available",
      "Detailed written feedback",
      "Performance analysis",
    ],
  },
  {
    id: "1-1-learning",
    title: "1:1 Learning Sessions",
    description: "Focused training on specific psychiatric competencies with personalized attention",
    icon: BookOpen,
    badge: "Best Value",
    options: [
      { name: "1 Station", price: 60, duration: "30 mins" },
      { name: "2 Stations", price: 110, duration: "1 hour" },
      { name: "3 Stations", price: 150, duration: "1.5 hours" },
    ],
    features: [
      "In-depth technique coaching",
      "Personalized feedback",
      "Flexible station selection",
      "Resource materials included",
    ],
  },
  {
    id: "group",
    title: "Group Learning Sessions",
    description: "Collaborative learning with peer candidates for cost-effective preparation",
    icon: Users,
    badge: "Budget Friendly",
    options: [
      { name: "Group of 2 - 1 Station", price: 45, duration: "30 mins" },
      { name: "Group of 2 - 2 Stations", price: 80, duration: "1 hour" },
      { name: "Group of 2 - 3 Stations", price: 110, duration: "1.5 hours" },
      { name: "Group of 3 - 1 Station", price: 35, duration: "30 mins" },
      { name: "Group of 3 - 2 Stations", price: 60, duration: "1 hour" },
      { name: "Group of 3 - 3 Stations", price: 85, duration: "1.5 hours" },
    ],
    features: [
      "Learn with peers",
      "Cost-effective option",
      "Group feedback session",
      "Network with other candidates",
    ],
  },
];

const trainers = [
  {
    name: "Dr. Sarah Mitchell",
    specialty: "Adult Psychiatry",
    experience: "15+ years",
    rating: 4.9,
    sessions: 250,
  },
  {
    name: "Dr. James Chen",
    specialty: "Child & Adolescent",
    experience: "12+ years",
    rating: 4.8,
    sessions: 180,
  },
  {
    name: "Dr. Amara Okafor",
    specialty: "Forensic Psychiatry",
    experience: "10+ years",
    rating: 4.9,
    sessions: 150,
  },
];

export default function Sessions() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative gradient-bg-hero py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroSessionsImage} 
            alt="Psychiatry training session" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Our Sessions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Choose from our range of expertly designed coaching sessions. 
              All sessions include personalized feedback and resources.
            </p>
          </div>
        </div>
      </section>

      {/* Session Categories */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="space-y-12">
            {sessionCategories.map((category) => (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="bg-secondary/30 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center">
                        <category.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl md:text-2xl">{category.title}</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      {category.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Options */}
                    <div>
                      <h4 className="font-semibold mb-4">Pricing Options</h4>
                      <div className="space-y-3">
                        {category.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                          >
                            <div>
                              <p className="font-medium">{option.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {option.duration}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">£{option.price}</p>
                              <p className="text-xs text-muted-foreground">per person</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-semibold mb-4">What's Included</h4>
                      <ul className="space-y-3">
                        {category.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <Link to="/auth?mode=signup">
                      <Button className="gradient-bg-primary border-0 gap-2">
                        Book This Session
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers Preview */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Our Trainers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All sessions are conducted by verified, experienced psychiatrists.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {trainers.map((trainer, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full gradient-bg-primary mx-auto mb-4 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">{trainer.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{trainer.specialty}</p>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    <span className="font-medium">{trainer.rating}</span>
                    <span className="text-muted-foreground text-sm">
                      ({trainer.sessions} sessions)
                    </span>
                  </div>
                  <Badge variant="outline">{trainer.experience}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-bg-primary">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to Book Your Session?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
            Create an account to access our full booking system and choose your preferred trainer.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
