import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="container py-12 md:py-16 max-w-4xl">
      <Button variant="ghost" asChild className="mb-8">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p className="text-muted-foreground">
            MRC Psychiatry Coaching ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you use our platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Information We Collect</h2>
          <h3 className="text-lg font-medium">Personal Information</h3>
          <p className="text-muted-foreground">
            We may collect the following personal information:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Name and email address</li>
            <li>Phone number</li>
            <li>Professional qualifications and training status</li>
            <li>Payment information (processed securely through our payment provider)</li>
            <li>Session recordings (with your consent)</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-4">Automatically Collected Information</h3>
          <p className="text-muted-foreground">
            When you access our Service, we may automatically collect:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Device information and browser type</li>
            <li>IP address and location data</li>
            <li>Usage patterns and preferences</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
          <p className="text-muted-foreground">
            We use the collected information to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Provide and maintain our coaching services</li>
            <li>Process bookings and payments</li>
            <li>Send appointment confirmations and reminders</li>
            <li>Improve our services and user experience</li>
            <li>Communicate updates about our platform</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Session Recordings</h2>
          <p className="text-muted-foreground">
            With your explicit consent, coaching sessions may be recorded for:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Your personal review and learning purposes</li>
            <li>Quality assurance and trainer development</li>
            <li>Training of new coaches (anonymised where possible)</li>
          </ul>
          <p className="text-muted-foreground">
            Recordings are stored securely and automatically deleted after a specified period. 
            You can request deletion of your recordings at any time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. Data Sharing and Disclosure</h2>
          <p className="text-muted-foreground">
            We do not sell your personal information. We may share your data with:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Trainers assigned to your sessions (relevant booking details only)</li>
            <li>Payment processors for transaction handling</li>
            <li>Service providers who assist in operating our platform</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">6. Data Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate technical and organisational measures to protect your personal data, including:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication mechanisms</li>
            <li>Regular security assessments</li>
            <li>Access controls and audit logging</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">7. Your Rights (GDPR)</h2>
          <p className="text-muted-foreground">
            Under the UK General Data Protection Regulation, you have the right to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Access</strong> – Request a copy of your personal data</li>
            <li><strong>Rectification</strong> – Request correction of inaccurate data</li>
            <li><strong>Erasure</strong> – Request deletion of your data ("right to be forgotten")</li>
            <li><strong>Restriction</strong> – Request limitation of processing</li>
            <li><strong>Portability</strong> – Receive your data in a structured format</li>
            <li><strong>Objection</strong> – Object to processing based on legitimate interests</li>
            <li><strong>Withdraw consent</strong> – Withdraw consent at any time</li>
          </ul>
          <p className="text-muted-foreground">
            To exercise these rights, please contact us using the details below.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">8. Cookies</h2>
          <p className="text-muted-foreground">
            We use cookies to enhance your experience. These include:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Essential cookies</strong> – Required for the platform to function</li>
            <li><strong>Analytical cookies</strong> – Help us understand how visitors use the site</li>
            <li><strong>Preference cookies</strong> – Remember your settings and preferences</li>
          </ul>
          <p className="text-muted-foreground">
            You can manage cookie preferences through your browser settings.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">9. Data Retention</h2>
          <p className="text-muted-foreground">
            We retain your personal data only as long as necessary to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Provide our services to you</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce our agreements</li>
          </ul>
          <p className="text-muted-foreground">
            Account data is retained for the duration of your account plus a reasonable period thereafter. 
            Session recordings are typically retained for 30 days unless otherwise specified.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">10. International Transfers</h2>
          <p className="text-muted-foreground">
            Your data may be processed in countries outside the UK. Where this occurs, we ensure appropriate 
            safeguards are in place, such as standard contractual clauses approved by the UK Information 
            Commissioner's Office.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">11. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy periodically. We will notify you of any significant changes 
            via email or through our platform. We encourage you to review this policy regularly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">12. Contact Us</h2>
          <p className="text-muted-foreground">
            For privacy-related inquiries or to exercise your rights, please contact:
          </p>
          <p className="text-muted-foreground">
            Data Protection Officer<br />
            MRC Psychiatry Coaching<br />
            Email: privacy@mrcpsychcoaching.com<br />
            Phone: +44 (0) 20 1234 5678
          </p>
          <p className="text-muted-foreground mt-4">
            You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) 
            at <a href="https://ico.org.uk" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
