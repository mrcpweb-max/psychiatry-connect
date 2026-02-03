import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="container py-12 md:py-16 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using MRC Psychiatry Coaching ("the Service"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Description of Service</h2>
          <p className="text-muted-foreground">
            MRC Psychiatry Coaching provides online coaching and training services for MRCPsych examination candidates. 
            Our services include mock examinations, learning sessions, and related educational resources.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. User Accounts</h2>
          <p className="text-muted-foreground">
            To access certain features of the Service, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete registration information</li>
            <li>Notifying us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Booking and Payment</h2>
          <p className="text-muted-foreground">
            When booking a session through our platform:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Payment is required at the time of booking</li>
            <li>All prices are displayed in GBP unless otherwise stated</li>
            <li>Sessions must be attended at the scheduled time</li>
            <li>Rescheduling is subject to trainer availability</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. Cancellation and Refund Policy</h2>
          <p className="text-muted-foreground">
            Cancellations made more than 48 hours before the scheduled session may be eligible for a full refund. 
            Cancellations made within 48 hours of the session may be subject to a cancellation fee. 
            No-shows will not be refunded.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
          <p className="text-muted-foreground">
            All content, materials, and resources provided through the Service are the intellectual property of 
            MRC Psychiatry Coaching or its licensors. You may not reproduce, distribute, or create derivative 
            works without our express written permission.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">7. Recording Consent</h2>
          <p className="text-muted-foreground">
            Sessions may be recorded with your consent for quality assurance and training purposes. 
            Recordings will be handled in accordance with our Privacy Policy and applicable data protection laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">8. Code of Conduct</h2>
          <p className="text-muted-foreground">
            Users agree to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Treat trainers and other users with respect</li>
            <li>Not share account credentials with others</li>
            <li>Not engage in any form of harassment or discrimination</li>
            <li>Use the Service only for its intended educational purposes</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">9. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            MRC Psychiatry Coaching provides educational services and does not guarantee examination success. 
            We shall not be liable for any indirect, incidental, special, or consequential damages arising 
            from your use of the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">10. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these Terms at any time. We will notify users of any material 
            changes via email or through the Service. Continued use of the Service after such changes 
            constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">11. Contact Information</h2>
          <p className="text-muted-foreground">
            For questions about these Terms, please contact us at:
          </p>
          <p className="text-muted-foreground">
            Email: support@mrcpsychcoaching.com<br />
            Phone: +44 (0) 20 1234 5678
          </p>
        </section>
      </div>
    </div>
  );
}
