import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions for using ShelfReady.",
  alternates: { canonical: "https://shelfready.store/terms" },
};

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold text-brand-navy mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 24, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">1. Acceptance of Terms</h2>
            <p>By joining the ShelfReady waitlist, you agree to these Terms of Service. If you do not agree, please do not submit your information.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">2. Waitlist</h2>
            <p>Joining the waitlist does not guarantee access to ShelfReady at launch. Waitlist positions are offered at our discretion. We reserve the right to limit, modify, or cancel waitlist access at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">3. Use of Information</h2>
            <p>By submitting your email address, you consent to receive communications from ShelfReady including launch announcements, product updates, and early access invitations. You may unsubscribe at any time using the link in any email we send.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">4. Intellectual Property</h2>
            <p>All content on this website — including the ShelfReady name, logo, copy, and design — is the intellectual property of ShelfReady. You may not reproduce or use it without written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">5. Disclaimer</h2>
            <p>ShelfReady is a pre-launch product. Features, pricing, and availability are subject to change. We make no warranties, express or implied, regarding the final product.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">6. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, ShelfReady shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website or participation in the waitlist.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">7. Governing Law</h2>
            <p>These terms are governed by the laws of the jurisdiction in which ShelfReady operates. Any disputes shall be resolved in the courts of that jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">8. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the waitlist after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-2">9. Contact</h2>
            <p>For any questions about these terms, contact us at <span className="text-brand">hello@shelfready.store</span>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
