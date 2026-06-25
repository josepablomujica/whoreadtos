import Link from 'next/link';
import AnalyzeForm from './AnalyzeForm';
import Nav from '@/app/components/Nav';

export default function Home() {

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <Nav hideCtaOnMobile ctaText="Add to Chrome — it's free" />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Nobody reads the terms.
          <br />
          <span className="text-[#1D9E75]">We do.</span>
        </h1>
        <p className="mt-5 text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
          Install the extension. We break down any Terms of Service into plain,
          simple language, before you click &ldquo;I agree.&rdquo;
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#"
            className="bg-[#1D9E75] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#179165] transition-colors text-lg"
          >
            Add to Chrome — it&apos;s free
          </a>
          <a
            href="#analyze"
            className="border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-lg"
          >
            See it in action ↓
          </a>
        </div>
      </section>

      {/* Live analyze form */}
      <section id="analyze" className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Got your own ToS? See where it stands.</h2>
          <p className="mt-2 text-gray-500 text-sm">Paste it below and get the same grade everyone else gets. No signup, no legal jargon, just a straight answer.</p>
        </div>
        <AnalyzeForm />
      </section>

      {/* Features strip */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-12 grid sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: '⚡', title: 'Instant', desc: 'Results in under 2 seconds on any TOS page' },
            { icon: '🔒', title: 'Private', desc: 'Nothing is stored. No account needed. Ever.' },
            { icon: '🆓', title: 'Free', desc: 'No paywalls. No premium tier. Just install and go.' },
          ].map((f) => (
            <div key={f.title}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="font-bold text-gray-800">{f.title}</div>
              <div className="text-gray-500 text-sm mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Rankings promo */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-snug">
            We&apos;re building the largest public scoreboard of Terms of Service on the internet.
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            Every company that&apos;s ever made you click &ldquo;I agree&rdquo; without reading it,
            we&apos;re putting them all in one place: graded, ranked, and tracked over time.
            Not because we&apos;re lawyers. Because somebody has to keep score.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/rankings"
              className="inline-flex items-center justify-center bg-[#1D9E75] text-white font-semibold px-5 py-3 rounded-xl hover:bg-[#179165] transition-colors text-sm"
            >
              See the rankings
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border border-gray-200 text-gray-600 font-medium px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Don&apos;t see your company? Tell us, we&apos;ll grade it.
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
        <span>Free forever. No ads. No tracking. No irony.</span>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-[#1D9E75] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#1D9E75] transition-colors">Privacy</Link>
          <Link href="/contact" className="hover:text-[#1D9E75] transition-colors">Contact</Link>
          <a
            href="https://ko-fi.com/wereadtos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D9E75] hover:underline"
          >
            This is free and we don&apos;t sell your data. If it helped, want to buy us a coffee?
          </a>
        </div>
      </footer>
    </div>
  );
}
