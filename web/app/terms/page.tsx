import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — whoreadtos',
  description: 'Simple, honest terms for using whoreadtos.',
};

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-[#1D9E75] text-lg tracking-tight">whoreadtos</Link>
            <Link href="/rankings" className="text-sm font-medium text-gray-600 hover:text-[#1D9E75] transition-colors">Rankings</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-sm text-gray-400 mb-2">Last updated: June 18, 2026</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-10">Plain English. No legal tricks.</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">What is whoreadtos?</h2>
            <p>
              whoreadtos is a free browser extension and website that helps you understand Terms of Service and Privacy
              Policy documents from third-party companies. You give us the text of a document (either by visiting a TOS
              page directly or pasting it manually), and we summarize the key points in plain English with a grade from
              A (very safe) to F (very risky).
            </p>
            <p className="mt-3">
              We also maintain a public ranking of analyzed TOS documents from well-known companies. That data is
              aggregated and public — it contains nothing about you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No account required</h2>
            <p>
              You do not need to create an account, provide an email address, or log in to use whoreadtos. The extension
              works entirely without identifying you. We do not know who you are, and we have no interest in finding out.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">What happens to the text you analyze</h2>
            <p>
              When you analyze a document, the text is sent to our server and then forwarded to a third-party AI API
              for processing. The analysis result is returned to you immediately. <strong>We do not store the text you
              submit linked to any identity</strong> — not your IP address, not a user ID, not a cookie. Once the
              analysis is returned, we have no record of what you submitted.
            </p>
            <p className="mt-3">
              The third-party AI provider processes the text under their own terms. We use a provider with a commercial
              API that does not train on API inputs by default.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Not legal advice</h2>
            <p>
              whoreadtos is an informational tool. The summaries and grades we generate are produced by an AI model and
              may be incomplete, inaccurate, or outdated. <strong>Nothing on this site is legal advice.</strong> Do not
              rely solely on our analysis to make legal, financial, or business decisions. When it matters, read the
              original document and consult a qualified professional.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No warranties</h2>
            <p>
              The service is provided <strong>"as is"</strong> without warranties of any kind. We do not guarantee
              uptime, accuracy, completeness, or fitness for any particular purpose. We are not liable for any damages
              arising from your use of whoreadtos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the service to abuse, overload, or interfere with our infrastructure.</li>
              <li>Attempt to reverse-engineer or scrape our API at scale for commercial purposes.</li>
              <li>Submit content that is illegal or that you do not have the right to share.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Changes to this service</h2>
            <p>
              We may modify, suspend, or discontinue whoreadtos at any time. If we make material changes to these terms,
              we will update the date at the top of this page. Continued use after changes means you accept them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Contact</h2>
            <p>
              Questions? Email us at{' '}
              <a href="mailto:josepablomujica@gmail.com" className="text-[#1D9E75] hover:underline">
                josepablomujica@gmail.com
              </a>
              . We are a small independent project and we read every email.
            </p>
          </section>

        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-6 py-8 flex flex-wrap gap-4 items-center justify-between text-sm text-gray-400 border-t border-gray-100 mt-6">
        <Link href="/" className="hover:text-[#1D9E75] transition-colors">← whoreadtos</Link>
        <div className="flex gap-4">
          <Link href="/terms" className="text-[#1D9E75]">Terms</Link>
          <Link href="/privacy" className="hover:text-[#1D9E75] transition-colors">Privacy</Link>
          <Link href="/contact" className="hover:text-[#1D9E75] transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
