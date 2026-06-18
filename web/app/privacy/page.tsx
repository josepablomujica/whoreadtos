import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — whoreadtos',
  description: 'We do not collect personal data. Here is exactly what we do and do not do.',
};

export default function Privacy() {
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
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-10">Short version: we do not collect personal data. Here is the long version.</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section className="p-4 bg-[#f0fdf9] border border-[#a7f3d0] rounded-xl">
            <p className="font-semibold text-[#1D9E75]">The one-sentence summary</p>
            <p className="mt-1 text-gray-700">
              We do not know who you are, we do not want to know, and we have no mechanism to find out.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">What we do NOT collect</h2>
            <ul className="space-y-2">
              {[
                'Your name, email address, or any identifier.',
                'Your IP address (we do not log or store it).',
                'Cookies for tracking or advertising.',
                'Browser fingerprints or device identifiers.',
                'The text you submit for analysis, linked to any identity.',
                'Analytics about which pages you visit or how long you stay.',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#1D9E75] font-bold mt-0.5">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">What happens when you analyze a document</h2>
            <p>
              When you submit text for analysis (either from a TOS page or pasted manually), the following happens:
            </p>
            <ol className="list-decimal pl-5 mt-3 space-y-2">
              <li>The text is sent over HTTPS to our server (hosted on Vercel).</li>
              <li>Our server forwards the text to a third-party AI API for analysis.</li>
              <li>The AI returns a structured analysis (grade + key findings).</li>
              <li>We return that analysis to your browser.</li>
              <li>
                <strong>The text is not stored</strong> in any database after the request completes. We retain no
                record of what you submitted or when.
              </li>
            </ol>
            <p className="mt-3 text-sm text-gray-500">
              The third-party AI provider we use has a commercial API policy that does not train models on API inputs.
              We do not name the provider here to allow us to switch providers without updating this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Cookies</h2>
            <p>
              whoreadtos does not use tracking cookies, advertising cookies, or any third-party cookie. The only
              technical storage that may occur is browser-native caching to improve performance — this is controlled
              by your browser and contains no personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">The /rankings database</h2>
            <p>
              Our public rankings page contains TOS analysis data for well-known companies. This data is:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Aggregated and public — it describes companies, not users.</li>
              <li>Collected by our automated scraper visiting publicly accessible TOS pages.</li>
              <li>Not linked to any individual user or analysis session.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Infrastructure and hosting</h2>
            <p>
              Our website and API run on Vercel (United States). Vercel may log standard server metadata (request
              timestamps, response codes) for infrastructure purposes. We do not control or access Vercel&apos;s
              infrastructure logs. You can read{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#1D9E75] hover:underline">
                Vercel&apos;s privacy policy
              </a>
              {' '}for details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Children</h2>
            <p>
              whoreadtos is not directed at children under 13. We do not knowingly collect data from anyone — children
              or adults.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Changes to this policy</h2>
            <p>
              If we ever change our data practices in a way that collects more information, we will update this page
              and the date above. We will never quietly start tracking you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Contact</h2>
            <p>
              Questions or concerns? Email{' '}
              <a href="mailto:josepablomujica@gmail.com" className="text-[#1D9E75] hover:underline">
                josepablomujica@gmail.com
              </a>
              .
            </p>
          </section>

        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-6 py-8 flex flex-wrap gap-4 items-center justify-between text-sm text-gray-400 border-t border-gray-100 mt-6">
        <Link href="/" className="hover:text-[#1D9E75] transition-colors">← whoreadtos</Link>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-[#1D9E75] transition-colors">Terms</Link>
          <Link href="/privacy" className="text-[#1D9E75]">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
