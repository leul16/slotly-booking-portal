import type { Metadata } from "next";
import Link from "next/link";
import { FileText, AlertTriangle, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Review the Slotly Terms of Service governing the use of our appointment scheduling platform.",
};

export default function TermsPage() {
  const lastUpdated = "October 27, 2026";

  return (
    <div className="bg-background py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
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
            <FileText className="h-3.5 w-3.5" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Terms of Service
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
                These Terms of Service constitute a draft template created for the Slotly booking platform. They should be reviewed, adapted, and approved by competent legal counsel prior to formal commercial execution to reflect your entity structure, liability limitations, and local legal requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-muted-foreground text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or utilizing the Slotly booking portal (the &quot;Platform&quot; or &quot;Service&quot;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service (the &quot;Terms&quot;) and our Privacy Policy.
            </p>
            <p>
              If you do not agree to these Terms in their entirety, you must discontinue use of the Platform immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              2. Description of Services
            </h2>
            <p>
              Slotly provides a digital scheduling portal enabling clients to discover professional services, view availability schedules, request and confirm appointments, and receive automated notifications.
            </p>
            <p>
              We reserve the right to modify, enhance, suspend, or discontinue any feature or service catalog listing on the Platform at any time without prior notice.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              3. User Accounts and Verification
            </h2>
            <p>
              Certain features of Slotly require creating an account or providing authenticated contact information. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information during registration and booking.</li>
              <li>Maintain the confidentiality and security of your account credentials.</li>
              <li>Promptly notify Slotly if you discover any unauthorized use or security compromise of your account.</li>
              <li>Accept responsibility for all actions and bookings initiated under your account credentials.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              4. Bookings, Scheduling, and Confirmations
            </h2>
            <p>
              When you submit an appointment request through Slotly:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A booking is officially confirmed once you receive an automated confirmation notice and booking reference.</li>
              <li>Slotly employs concurrency control to prevent double-booking of identical time slots. In the rare event of a scheduling conflict, the earliest recorded booking request takes precedence.</li>
              <li>You agree to arrive promptly (or join remote sessions at the designated start time). Delays exceeding 15 minutes may result in cancellation or reduced service duration.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              5. Cancellations, Rescheduling, and Refunds
            </h2>
            <p>
              Our standardized cancellation and rescheduling framework operates as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Standard Window:</strong> Appointments may be rescheduled or cancelled without penalty if requested at least 24 hours prior to the scheduled appointment start time.
              </li>
              <li>
                <strong className="text-foreground">Late Cancellations:</strong> Cancellations made less than 24 hours prior to the appointment, or failure to attend without prior notice (&quot;No-Show&quot;), may be subject to a cancellation fee or forfeiture of prepaid amounts at the provider&apos;s discretion.
              </li>
              <li>
                <strong className="text-foreground">Provider Cancellations:</strong> If a service provider must cancel an appointment due to unforeseen circumstances, the client will be offered full rescheduling priority or a full refund where applicable.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              6. Client Conduct and Prohibitions
            </h2>
            <p>
              Users agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submit fraudulent, fictitious, or speculative appointment bookings.</li>
              <li>Use automated scripts, bots, or scrapers to extract availability or service listings.</li>
              <li>Interfere with or disrupt the operation of the portal, servers, or networks.</li>
              <li>Harass, abuse, or engage in discriminatory conduct toward service providers or staff.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              7. Limitation of Liability and Disclaimers
            </h2>
            <p>
              To the fullest extent permitted by law, the Platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without warranties of any kind, whether express or implied, including fitness for a particular purpose or non-infringement.
            </p>
            <p>
              Slotly and its affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from your access to, use of, or inability to access or use the Platform or booked services.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              8. Changes to Terms
            </h2>
            <p>
              We reserve the right to amend these Terms from time to time. Any changes will be posted on this page with an updated &quot;Last Updated&quot; date. Continued use of the Platform after revisions indicates acceptance of the amended terms.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              9. Contact Information
            </h2>
            <p>
              For legal inquiries, terms clarification, or formal communication, please reach us at:
            </p>
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 text-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium">legal@slotly.com</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Slotly Legal Affairs & Compliance
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
