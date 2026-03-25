import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ShelfReady collects, uses, and protects your personal information.",
  alternates: { canonical: "https://shelfready.store/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-hover mb-10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to ShelfReady
        </Link>

        <h1 className="text-3xl font-bold text-brand-navy mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 24, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">1. Information We Collect</h2>
            <p>When you join the ShelfReady waitlist, we collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your email address (required)</li>
              <li>Your first name (optional)</li>
              <li>The date and time of your submission</li>
            </ul>
            <p className="mt-3">We do not collect payment information, browsing data, or any other personal information at this stage.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">2. How We Use Your Information</h2>
            <p>We use your information solely to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Notify you when ShelfReady launches</li>
              <li>Send you relevant updates about the product</li>
              <li>Respond to any enquiries you send us</li>
            </ul>
            <p className="mt-3">We will never sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">3. Data Storage</h2>
            <p>Your information is stored securely using Supabase, a cloud database provider. Data is encrypted at rest and in transit. Supabase infrastructure is hosted on AWS and complies with industry-standard security practices.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">4. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data at any time</li>
              <li>Opt out of any communications from us</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email us at <span className="text-brand">privacy@shelfready.store</span>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">5. Cookies</h2>
            <p>ShelfReady&apos;s waitlist page does not use tracking cookies or third-party analytics. We do not use Google Analytics, Facebook Pixel, or similar tools.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">6. Changes to This Policy</h2>
            <p>We may update this policy as the product evolves. Any significant changes will be communicated to waitlist members via email.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">7. Contact</h2>
            <p>For any privacy-related questions, contact us at <span className="text-brand">privacy@shelfready.store</span>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
