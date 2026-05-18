import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { COMPANY_NAME, COMPANY_ADDRESS, CONTACT_EMAIL } from '@/lib/constants';
import LegalSection from '@/components/shared/legal-section';
import SiteFooter from '@/components/shared/site-footer';
import SiteHeader from '@/components/shared/site-hearer';

export const metadata: Metadata = {
  title: 'Terms of Service — Rentora Houselink Uganda',
  description: 'Terms of Service for the Rentora Houselink Uganda mobile app and platform.',
};

const EFFECTIVE_DATE = 'May 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-400">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-700 leading-relaxed">
          Please read these Terms carefully before using the Rentora Houselink Uganda app or
          website. By accessing or using our platform, you agree to be bound by these Terms.
        </div>

        <LegalSection title="1. About Rentora Houselink Uganda">
          <p>
            {COMPANY_NAME} (&quot;Rentora&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
            is a digital property listing and rental management platform incorporated in Uganda,
            with offices at {COMPANY_ADDRESS}. We connect property owners and agents with renters
            looking for residential houses, apartments, hostels, hotels, AirBnBs, office spaces,
            and business spaces across Uganda.
          </p>
          <p>
            Rentora operates as a <strong>listing platform only</strong>. We are not a rental
            agent, property manager, or party to any rental agreement between a renter and a
            property owner.
          </p>
        </LegalSection>

        <LegalSection title="2. Acceptance of Terms">
          <p>By downloading, installing, or using the Rentora mobile application or any associated web services, you confirm that you:</p>
          <ul>
            <li>Are at least 18 years old, or have the consent of a parent or legal guardian;</li>
            <li>Have read, understood, and agree to these Terms; and</li>
            <li>
              Agree to our{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              , which is incorporated by reference into these Terms.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Platform Use">
          <h3>3.1 Permitted Use</h3>
          <p>You may use Rentora to:</p>
          <ul>
            <li>Browse and search property listings across Uganda;</li>
            <li>Submit booking requests for available properties;</li>
            <li>Save favourite listings;</li>
            <li>Contact property owners and agents via WhatsApp or phone;</li>
            <li>Receive notifications about new listings and booking updates;</li>
            <li>Submit complaints about listings or platform conduct.</li>
          </ul>

          <h3>3.2 Prohibited Use</h3>
          <p>You must not:</p>
          <ul>
            <li>Post false, misleading, or fraudulent listings or inquiries;</li>
            <li>Use the platform for any unlawful purpose;</li>
            <li>Attempt to scrape, reverse-engineer, or copy the platform;</li>
            <li>Harass, abuse, or threaten other users, property owners, or Rentora staff;</li>
            <li>Circumvent any technical measures that protect the platform;</li>
            <li>Use the platform to advertise or promote competing services.</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Property Listings">
          <p>
            All listings on Rentora are provided by property owners and agents (&quot;Listers&quot;).
            Rentora makes reasonable efforts to verify listings through physical inspection before
            awarding a <strong>&quot;Verified by Rentora&quot;</strong> badge. However, Rentora does
            not guarantee the accuracy, completeness, or availability of any listing at any given time.
          </p>
          <p>
            Renters are encouraged to independently verify property details before making any payment
            or commitment. Rentora is not responsible for any loss arising from inaccurate listing
            information provided by third-party Listers.
          </p>
          <p>
            Prices are displayed in <strong>Uganda Shillings (UGX)</strong> and are set by the
            Lister. Rentora does not set, negotiate, or guarantee prices.
          </p>
        </LegalSection>

        <LegalSection title="5. Bookings">
          <p>
            Booking requests submitted through the app are directed to the relevant property owner
            or agent. A booking request does not constitute a confirmed reservation until the Lister
            has accepted and confirmed it.
          </p>
          <p>
            Rentora does not collect rent, security deposits, or any other payments on behalf of
            Listers. All financial transactions are conducted directly between the renter and the
            Lister. Rentora accepts no liability for payment disputes.
          </p>
        </LegalSection>

        <LegalSection title="6. User Accounts">
          <p>
            You may browse listings without creating an account. To submit booking requests, save
            favourites, or receive notifications, you must register for a renter account using a
            valid email address and password.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials.
            You agree to notify us immediately at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
              {CONTACT_EMAIL}
            </a>{' '}
            if you suspect any unauthorised access to your account.
          </p>
        </LegalSection>

        <LegalSection title="7. Intellectual Property">
          <p>
            All content on the Rentora platform — including the app design, logo, software, and
            text — is owned by or licensed to {COMPANY_NAME}. You may not copy, reproduce,
            distribute, or create derivative works without our express written permission.
          </p>
          <p>
            Property images uploaded by Listers remain the property of their respective owners. By
            uploading images, Listers grant Rentora a non-exclusive licence to display those images
            on the platform.
          </p>
        </LegalSection>

        <LegalSection title="8. Disclaimer of Warranties">
          <p>
            The Rentora platform is provided &quot;as is&quot; and &quot;as available&quot; without
            warranties of any kind, either express or implied. We do not warrant that the platform
            will be uninterrupted, error-free, or free of viruses or other harmful components.
          </p>
          <p>Rentora does not guarantee that any property listed on the platform will be available, suitable, or accurately described.</p>
        </LegalSection>

        <LegalSection title="9. Limitation of Liability">
          <p>
            To the fullest extent permitted by Ugandan law, {COMPANY_NAME} and its officers,
            directors, employees, and agents shall not be liable for any indirect, incidental,
            special, punitive, or consequential damages arising out of or relating to your use of
            the platform — including but not limited to loss of income, loss of data, or failure to
            secure a rental property.
          </p>
          <p>Our total liability to you for any claim arising from these Terms shall not exceed the amount you paid to us (if any) in the three months preceding the claim.</p>
        </LegalSection>

        <LegalSection title="10. Complaints">
          <p>
            If you encounter a fraudulent listing, inappropriate conduct, or any other issue on the
            platform, you can submit a complaint directly through the Rentora app. Our team reviews
            all complaints and will take appropriate action, which may include removing a listing or
            suspending an account.
          </p>
        </LegalSection>

        <LegalSection title="11. Governing Law">
          <p>
            These Terms are governed by and construed in accordance with the laws of the Republic of
            Uganda. Any disputes arising from these Terms shall be subject to the exclusive
            jurisdiction of the courts of Uganda.
          </p>
        </LegalSection>

        <LegalSection title="12. Changes to These Terms">
          <p>
            We may update these Terms from time to time. When we do, we will revise the effective
            date at the top of this page. Continued use of the platform after changes constitutes
            your acceptance of the updated Terms. We encourage you to review this page periodically.
          </p>
        </LegalSection>

        <LegalSection title="13. Contact Us">
          <p>If you have any questions about these Terms, please contact us:</p>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm space-y-1 not-prose">
            <p className="font-semibold text-gray-900">{COMPANY_NAME}</p>
            <p className="text-gray-600">{COMPANY_ADDRESS}</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline block">
              {CONTACT_EMAIL}
            </a>
          </div>
        </LegalSection>
      </main>

      <SiteFooter crossLink="privacy" />
    </div>
  );
}