import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Rentora Houselink Uganda',
  description:
    'Privacy Policy for the Rentora Houselink Uganda mobile app and platform.',
};

const EFFECTIVE_DATE  = 'May 2026';
const CONTACT_EMAIL   = 'support@rentora.ug';
const COMPANY_NAME    = 'Rentora Houselink Uganda';
const COMPANY_ADDRESS = 'Plot 254, Kyebando, Kampala, Uganda';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            Rentora
          </span>
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-gray-700 transition-colors"
          >
            Get the App
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {/* Title block */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-700 leading-relaxed">
          Your privacy matters to us. This policy explains what data we collect,
          why we collect it, and how we protect it — in plain language, in
          compliance with Uganda&apos;s Data Protection and Privacy Act, 2019.
        </div>

        <LegalSection title="1. Who We Are">
          <p>
            {COMPANY_NAME} (&quot;Rentora&quot;, &quot;we&quot;, &quot;us&quot;,
            or &quot;our&quot;) is a digital property listing platform based at{' '}
            {COMPANY_ADDRESS}. We are responsible for the personal data you
            provide when using the Rentora mobile application and any associated
            services.
          </p>
        </LegalSection>

        <LegalSection title="2. Data We Collect">
          <h3>2.1 Data you give us directly</h3>
          <ul>
            <li>
              <strong>Account information:</strong> your name, email address,
              and password when you register as a renter.
            </li>
            <li>
              <strong>Booking requests:</strong> property preferences and any
              messages you include when submitting a booking.
            </li>
            <li>
              <strong>Complaints:</strong> details you provide when reporting a
              listing or platform issue.
            </li>
          </ul>

          <h3>2.2 Data collected automatically</h3>
          <ul>
            <li>
              <strong>Usage data:</strong> properties you view, search queries
              you run, and listings you save as favourites. This powers the
              view and enquiry counters shown on listings.
            </li>
            <li>
              <strong>Device data:</strong> device type, operating system
              version, and app version, used for diagnosing technical issues.
            </li>
            <li>
              <strong>Location data:</strong> approximate location (if you grant
              permission) to surface nearby listings. We do not store precise
              GPS coordinates persistently.
            </li>
          </ul>

          <h3>2.3 Data from property owners and agents</h3>
          <p>
            When property owners or agents (&quot;Listers&quot;) are added to
            the platform by an administrator, we collect their name, phone
            number, optional WhatsApp number, optional email address, and their
            role (owner or agent). This information is displayed on listings to
            facilitate direct contact from renters.
          </p>
        </LegalSection>

        <LegalSection title="3. How We Use Your Data">
          <p>We use your data to:</p>
          <ul>
            <li>Operate and improve the Rentora platform;</li>
            <li>Create and manage your renter account;</li>
            <li>Process and track booking requests;</li>
            <li>Send you in-app and push notifications about bookings, new listings, and platform updates (you can opt out at any time in settings);</li>
            <li>Respond to complaints and customer support queries;</li>
            <li>Detect and prevent fraud or abuse;</li>
            <li>Comply with applicable Ugandan laws and regulations;</li>
            <li>Generate anonymous, aggregated analytics to understand how the platform is used.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell your personal data to third parties.
            We do <strong>not</strong> use your data for advertising profiling.
          </p>
        </LegalSection>

        <LegalSection title="4. Legal Basis for Processing">
          <p>
            Under the Uganda Data Protection and Privacy Act, 2019, we process
            your personal data on the following grounds:
          </p>
          <ul>
            <li>
              <strong>Contract performance:</strong> to provide the services you
              requested (account creation, bookings, notifications);
            </li>
            <li>
              <strong>Legitimate interests:</strong> to operate and secure the
              platform, detect fraud, and improve the service;
            </li>
            <li>
              <strong>Legal obligation:</strong> where required by Ugandan law;
            </li>
            <li>
              <strong>Consent:</strong> for optional features such as location
              access or marketing communications (you may withdraw consent at
              any time).
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="5. Data Sharing">
          <p>
            We share your data only in the following limited circumstances:
          </p>
          <ul>
            <li>
              <strong>Property owners and agents:</strong> when you submit a
              booking enquiry, your contact details may be shared with the
              relevant Lister to facilitate communication.
            </li>
            <li>
              <strong>Service providers:</strong> we use trusted third-party
              services to operate the platform. Each processes data only on our
              instructions:
              <ul className="mt-1">
                <li><strong>Supabase</strong> (PostgreSQL database hosting — Ireland/EU);</li>
                <li><strong>Railway</strong> (API server hosting — US);</li>
                <li><strong>Cloudinary</strong> (image storage and optimisation — US);</li>
                <li><strong>Brevo</strong> (transactional email delivery — EU);</li>
                <li><strong>Vercel</strong> (web portal hosting — US).</li>
              </ul>
            </li>
            <li>
              <strong>Legal requirements:</strong> we may disclose data if
              required by a court order or government authority under Ugandan
              law.
            </li>
          </ul>
          <p>
            We do <strong>not</strong> share personal data with advertisers,
            data brokers, or any unauthorised third party.
          </p>
        </LegalSection>

        <LegalSection title="6. Data Security">
          <p>
            We implement industry-standard security measures to protect your
            data, including:
          </p>
          <ul>
            <li>All data transmitted over HTTPS/TLS encryption;</li>
            <li>Passwords stored as salted hashes (never in plain text);</li>
            <li>JWT-based authentication with token blacklisting on logout;</li>
            <li>Rate limiting on login and sensitive endpoints to prevent brute-force attacks;</li>
            <li>Failed login attempts are audited and monitored;</li>
            <li>Access to production systems is restricted to authorised personnel only.</li>
          </ul>
          <p>
            Despite our best efforts, no system is completely secure. If you
            suspect your account has been compromised, please contact us
            immediately at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-blue-600 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection title="7. Data Retention">
          <p>
            We retain your personal data for as long as your account is active
            or as needed to provide the service. Specifically:
          </p>
          <ul>
            <li>Account data is retained until you request deletion;</li>
            <li>Booking records are retained for 2 years for dispute resolution;</li>
            <li>Complaint records are retained for 1 year;</li>
            <li>Audit logs are retained for 12 months.</li>
          </ul>
          <p>
            After retention periods expire, data is deleted or anonymised.
          </p>
        </LegalSection>

        <LegalSection title="8. Your Rights">
          <p>
            Under the Uganda Data Protection and Privacy Act, 2019, you have the
            right to:
          </p>
          <ul>
            <li><strong>Access</strong> the personal data we hold about you;</li>
            <li><strong>Correct</strong> inaccurate or incomplete data;</li>
            <li><strong>Delete</strong> your account and associated personal data;</li>
            <li><strong>Withdraw consent</strong> for optional processing (e.g. location, marketing);</li>
            <li><strong>Object</strong> to processing based on legitimate interests;</li>
            <li><strong>Lodge a complaint</strong> with the Personal Data Protection Office of Uganda.</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-blue-600 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            . We will respond within 21 days.
          </p>
        </LegalSection>

        <LegalSection title="9. Children's Privacy">
          <p>
            Rentora is not intended for use by persons under the age of 18. We
            do not knowingly collect personal data from children. If you believe
            a child has provided us with personal data, please contact us and we
            will delete it promptly.
          </p>
        </LegalSection>

        <LegalSection title="10. Third-Party Links">
          <p>
            Listings on Rentora may contain WhatsApp links and phone numbers
            that connect you directly with property owners or agents. Once you
            leave the Rentora platform, this Privacy Policy no longer applies.
            We encourage you to review the privacy practices of any third-party
            service you interact with.
          </p>
        </LegalSection>

        <LegalSection title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we make
            material changes, we will update the effective date at the top of
            this page and, where appropriate, notify you via in-app notification
            or email. Your continued use of the platform after changes
            constitutes acceptance of the updated policy.
          </p>
        </LegalSection>

        <LegalSection title="12. Contact Us">
          <p>
            If you have any questions, concerns, or requests regarding your
            personal data, please reach out:
          </p>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm space-y-1 not-prose">
            <p className="font-semibold text-gray-900">{COMPANY_NAME}</p>
            <p className="text-gray-600">{COMPANY_ADDRESS}</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-blue-600 hover:underline block"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </LegalSection>
      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        © {new Date().getFullYear()} Rentora Houselink Uganda. All rights
        reserved. &nbsp;·&nbsp;
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
      </footer>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <div className="prose prose-sm prose-gray max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-4 [&_h3]:mb-1">
        {children}
      </div>
    </section>
  );
}