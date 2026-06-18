import Link from 'next/link';
import AnalyzeForm from './AnalyzeForm';

export default function Home() {

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-[#1D9E75] text-lg tracking-tight">whoreadtos</span>
            <Link href="/rankings" className="text-sm font-medium text-gray-600 hover:text-[#1D9E75] transition-colors">
              Rankings
            </Link>
          </div>
          <a
            href="#"
            className="bg-[#1D9E75] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#179165] transition-colors"
          >
            Add to Chrome — it&apos;s free
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Who reads TOS?
          <br />
          <span className="text-[#1D9E75]">We do.</span>
        </h1>
        <p className="mt-5 text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
          Know what you&apos;re agreeing to before you click accept.
          Get a plain-English breakdown of any Terms of Service in seconds.
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
          <h2 className="text-2xl font-bold text-gray-900">Try it now</h2>
          <p className="mt-2 text-gray-500 text-sm">Paste any TOS link and get an instant breakdown</p>
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

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
        <span>Free forever. No ads. No tracking. No irony.</span>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-[#1D9E75] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#1D9E75] transition-colors">Privacy</Link>
          <a
            href="https://ko-fi.com/wereadtos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D9E75] hover:underline"
          >
            ☕ Buy me a coffee
          </a>
        </div>
      </footer>
    </div>
  );
}
