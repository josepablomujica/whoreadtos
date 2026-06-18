import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const mockAnalysis = {
    score: 'D',
    site: 'facebook.com',
    time: '1.4s',
    items: [
      { risk: 'high', text: 'Facebook can use your face in ads without extra consent', section: 'Section 2.1' },
      { risk: 'high', text: 'Your data may be sold to third parties for targeting', section: 'Section 3.4' },
      { risk: 'medium', text: 'Account deletion takes 30 days and may not remove all data', section: 'Section 4.8' },
      { risk: 'medium', text: 'Content you post remains licensed to Facebook indefinitely', section: 'Section 2.3' },
      { risk: 'positive', text: 'You can download a copy of your data anytime', section: 'Section 6.1' },
    ],
  };

  const gradeColor: Record<string, string> = {
    A: 'bg-[#1D9E75]',
    B: 'bg-[#7CBE42]',
    C: 'bg-[#F5C518]',
    D: 'bg-[#F07C28]',
    F: 'bg-[#E53E3E]',
  };

  const riskColor: Record<string, string> = {
    high: 'bg-[#e53e3e]',
    medium: 'bg-[#f5a623]',
    positive: 'bg-[#1D9E75]',
  };

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
            href="#demo"
            className="border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-lg"
          >
            See it in action ↓
          </a>
        </div>
      </section>

      {/* Demo mockup */}
      <section id="demo" className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex justify-center">
          <div className="w-[340px] rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <div className="font-bold text-[#1D9E75] text-[15px] leading-none">whoreadtos</div>
                <div className="text-[11px] text-gray-400 mt-[3px]">{mockAnalysis.site}</div>
              </div>
              <Image
                src="/icon.png"
                alt="whoreadtos"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>

            {/* Findings */}
            <ul className="px-4 py-3 space-y-[10px]">
              {mockAnalysis.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={`w-2 h-2 rounded-full mt-[5px] flex-shrink-0 ${riskColor[item.risk]}`}
                  />
                  <div>
                    <div className="text-[13px] text-gray-800 leading-snug">{item.text}</div>
                    <div className="text-[11px] text-gray-400 mt-[2px]">{item.section}</div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-300">Analyzed in {mockAnalysis.time}</span>
              <a href="#" className="text-[11px] text-[#1D9E75] hover:underline">
                Full report
              </a>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-gray-400 mt-4">
          Example analysis of facebook.com/terms
        </p>
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
        <a
          href="https://ko-fi.com/wereadtos"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1D9E75] hover:underline"
        >
          ☕ Buy me a coffee
        </a>
      </footer>
    </div>
  );
}
