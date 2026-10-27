import type { Metadata } from "next";
import Link from "next/link";
import { Shield, AlertTriangle, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the Slotly Privacy Policy to understand how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  const lastUpdated = "October 27, 2026";

  return (
    <div className="bg-background py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground -ml-3" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="space-y-4 mb-10 pb-8 border-b border-border">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Shield className="h-3.5 w-3.5" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Draft Notice Banner */}
        <div className="mb-10 rounded-xl border border-amber-300/80 bg-amber-50/70 p-5 text-amber-900 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold">
                Draft Template Notice
              </p>
              <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                This document is a draft template provided for operational reference for the Slotly booking portal. Prior to public release or commercial operations, please have legal counsel review and customize these terms to ensure compliance with relevant privacy regulations (such as GDPR, CCPA/CPRA, and local statutes).
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-muted-foreground text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              1. Introduction
            </h2>
            <p>
              Slotly (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the Slotly service booking portal (the &quot;Platform&quot;). We are committed to protecting the privacy, confidentiality, and security of individuals who access or use our services (&quot;Users,&quot; &quot;Clients,&quot; or &quot;You&quot;).
            </p>
            <p>
              This Privacy Policy explains what information we collect, how it is used, how it is stored, and your rights concerning your personal data when using the Slotly appointment scheduling platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              2. Information We Collect
            </h2>
            <p>
              We collect information that you provide directly to us, as well as data gathered automatically during your use of the Platform:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Personal Identification Details:</strong> When you register an account or book an appointment, we may collect your full name, email address, phone number, and profile details.
              </li>
              <li>
                <strong className="text-foreground">Booking & Appointment Data:</strong> Information regarding the services you request, scheduled dates and times, duration, notes provided during booking, and cancellation records.
              </li>
              <li>
                <strong className="text-foreground">Authentication & Account Credentials:</strong> Securely hashed passwords, login tokens, session identifiers, and verification codes managed through our authentication infrastructure.
              </li>
              <li>
                <strong className="text-foreground">Technical & Usage Information:</strong> Device details, browser user agent, IP address, operating system, referral URLs, and interactions with portal features to maintain reliability and security.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              3. How We Use Your Information
            </h2>
            <p>
              We utilize collected information solely for legitimate business operations and platform functionality, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facilitating, scheduling, confirming, and updating your service appointments.</li>
              <li>Delivering automated booking confirmations, calendar invitations (.ics files), and email reminders.</li>
              <li>Authenticating your identity and preventing unauthorized access or fraudulent bookings.</li>
              <li>Providing responsive customer support and addressing booking inquiries or technical issues.</li>
              <li>Analyzing service popularity and platform performance to improve scheduling convenience.</li>
              <li>Complying with applicable legal obligations and enforcing our Terms of Service.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              4. Cookies and Session Storage
            </h2>
            <p>
              Slotly uses cookies and similar storage technologies to provide essential site functionality:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Essential Session Cookies:</strong> Required to authenticate your session, maintain secure logins, and remember booking progress.
              </li>
              <li>
                <strong className="text-foreground">Preferences:</strong> Used to store user interface preferences and regional settings.
              </li>
            </ul>
            <p>
              You can configure your browser to reject cookies; however, certain features of the booking portal (such as authenticated dashboards) may not operate properly without essential session cookies.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              5. Sharing and Disclosure of Information
            </h2>
            <p>
              We do not sell, rent, or trade your personal data to third-party advertisers. We share information only under the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Service Providers & Staff:</strong> When you book a service, relevant details (name, booking time, notes) are shared with the designated provider to execute the appointment.
              </li>
              <li>
                <strong className="text-foreground">Infrastructure Vendors:</strong> Trusted third-party vendors who provide hosting (e.g., Neon PostgreSQL), email delivery (e.g., Resend), and cloud infrastructure under strict data protection terms.
              </li>
              <li>
                <strong className="text-foreground">Legal & Regulatory Authorities:</strong> Where disclosure is required by lawful subpoena, court order, or governmental regulation.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              6. Data Security
            </h2>
            <p>
              We implement industry-standard technical and organizational security measures to protect your personal data against unauthorized access, destruction, loss, or alteration. All web communications are encrypted via Transport Layer Security (TLS/HTTPS). Database connections are secured using enterprise-grade encryption at rest and in transit.
            </p>
            <p>
              While we use commercially reasonable safeguards, no system connected to the Internet can guarantee absolute security. We encourage users to maintain secure passwords and report any suspicious activity immediately.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              7. Your Rights and Choices
            </h2>
            <p>
              Depending on your jurisdiction, you may have statutory rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to request access to the personal data we hold about you.</li>
              <li>The right to request rectification of inaccurate or incomplete records.</li>
              <li>The right to request deletion of your account and associated booking history.</li>
              <li>The right to object to or restrict specific processing operations.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact our privacy representative using the details provided below.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              8. Retention of Information
            </h2>
            <p>
              We retain personal data and booking records for as long as necessary to fulfill the purposes for which they were collected, resolve disputes, satisfy accounting audits, or meet legal requirements. When data is no longer required, it is securely deleted or anonymized.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              9. Contact Us
            </h2>
            <p>
              If you have questions, comments, or concerns regarding this Privacy Policy or our data management practices, please contact us at:
            </p>
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium">privacy@slotly.com</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Slotly Operations & Privacy Department
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
