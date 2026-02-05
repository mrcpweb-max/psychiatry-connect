import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, HelpCircle } from "lucide-react";
import heroFaqImage from "@/assets/hero-faq.jpg";

const faqCategories = [
  {
    title: "Getting Started",
    faqs: [
      {
        q: "How do I create an account?",
        a: "Click the 'Get Started' button on any page and fill out the registration form with your email and password. You'll receive a verification email to confirm your account.",
      },
      {
        q: "What do I need to book a session?",
        a: "You need a verified account and a valid payment method. Once you complete payment, you'll receive access to schedule your session with your chosen trainer.",
      },
      {
        q: "Can I book without creating an account?",
        a: "No, an account is required to ensure secure booking, payment processing, and access to your session history and materials.",
      },
    ],
  },
  {
    title: "Booking & Payments",
    faqs: [
      {
        q: "Why do I need to pay before scheduling?",
        a: "Our payment-first model ensures commitment from both candidates and trainers. It guarantees your slot is confirmed and allows trainers to prepare specifically for your session.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards through our secure payment processor. We also support Apple Pay and Google Pay.",
      },
      {
        q: "How does the scheduling link work?",
        a: "After payment, you receive a unique, time-limited link to access the scheduling system. This link is valid for 7 days and can only be used once to prevent unauthorized access.",
      },
      {
        q: "Can I book multiple sessions at once?",
        a: "Yes, you can book multiple sessions. Each booking will generate its own scheduling token, and you can manage all your sessions from your dashboard.",
      },
    ],
  },
  {
    title: "Sessions & Trainers",
    faqs: [
      {
        q: "What's the difference between Mock and Learning sessions?",
        a: "Mock sessions simulate real exam conditions with multiple stations and formal assessment. Learning sessions focus on teaching techniques and improving specific skills with more interaction and guidance.",
      },
      {
        q: "Can I choose my trainer?",
        a: "Yes, you can browse trainer profiles and select your preferred trainer based on their specialty, experience, and availability.",
      },
      {
        q: "What if I'm not satisfied with a session?",
        a: "We have a satisfaction guarantee. If you're not happy with your session, contact us within 48 hours and we'll work to resolve the issue, which may include a partial refund or free follow-up session.",
      },
      {
        q: "How do group sessions work?",
        a: "For group sessions, you'll need to provide the names and emails of your group members during booking. All participants will receive access to the session materials and feedback.",
      },
    ],
  },
  {
    title: "Cancellations & Refunds",
    faqs: [
      {
        q: "What is your cancellation policy?",
        a: "Cancel 7 or more days before your session for a 100% refund. Cancel within 7 days for a 50% refund. Same-day cancellations are not eligible for refunds.",
      },
      {
        q: "How do I cancel a booking?",
        a: "Log into your dashboard, find the session you want to cancel, and click the cancel button. You'll see the refund amount before confirming.",
      },
      {
        q: "How long do refunds take?",
        a: "Refunds are processed within 5-7 business days and will appear on your original payment method.",
      },
      {
        q: "Can I reschedule instead of cancelling?",
        a: "Yes, you can reschedule up to 48 hours before your session at no extra cost. Use the reschedule option in your dashboard.",
      },
    ],
  },
  {
    title: "Technical Requirements",
    faqs: [
      {
        q: "What do I need for online sessions?",
        a: "You need a stable internet connection, a computer or tablet with a camera and microphone, and a quiet environment. We recommend using Chrome or Firefox browsers.",
      },
      {
        q: "What platform do you use for sessions?",
        a: "We use secure video conferencing integrated into our platform. You'll receive a session link before your scheduled time.",
      },
      {
        q: "What if I have technical difficulties during a session?",
        a: "Contact our support team immediately. If technical issues on our end prevent you from completing a session, we'll reschedule at no extra cost.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative gradient-bg-hero py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroFaqImage} 
            alt="Medical support help desk" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl gradient-bg-primary mx-auto mb-6 flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Find answers to common questions about our platform, bookings, and sessions.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold mb-6">{category.title}</h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border border-border rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link to="/contact">
              <Button className="gradient-bg-primary border-0 gap-2">
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
