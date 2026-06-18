import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

interface Item {
  risk: 'high' | 'medium' | 'positive';
  text: string;
  section: string;
}

interface Company {
  id: string;
  name: string;
  sector: string;
  tos_url: string;
  logo_color: string;
  score: string | null;
  items: Item[] | null;
  word_count: number | null;
  analyzed_at: string | null;
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function getCompany(slug: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from('company_rankings')
    .select('id, name, sector, tos_url, logo_color, score, items, word_count, analyzed_at');

  if (error || !data) return null;
  return (data as Company[]).find(c => toSlug(c.name) === slug) ?? null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) return { title: 'Company not found — whoreadtos' };
  return {
    title: `${company.name} TOS — Grade ${company.score} | whoreadtos`,
    description: `See what ${company.name}'s Terms of Service really say. Grade: ${company.score}.`,
  };
}

const GRADE_BG: Record<string, string> = {
  A: 'bg-[#1D9E75]',
  B: 'bg-[#52c997]',
  C: 'bg-[#f5a623]',
  D: 'bg-[#e8722a]',
  F: 'bg-[#e53e3e]',
};

const GRADE_LABEL: Record<string, string> = {
  A: 'Very safe',
  B: 'Safe',
  C: 'Moderate',
  D: 'Risky',
  F: 'Very risky',
};

const RISK_DOT: Record<string, string> = {
  high:     'bg-[#e53e3e]',
  medium:   'bg-[#f5a623]',
  positive: 'bg-[#1D9E75]',
};

const RISK_LABEL: Record<string, string> = {
  high:     'High risk',
  medium:   'Medium risk',
  positive: 'Positive',
};

export default async function CompanyDetail(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company) notFound();

  const items: Item[] = company.items ?? [];
  const date = company.analyzed_at
    ? new Date(company.analyzed_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-[#1D9E75] text-lg tracking-tight">
              whoreadtos
            </Link>
            <Link href="/rankings" className="text-sm font-medium text-gray-600 hover:text-[#1D9E75] transition-colors">
              Rankings
            </Link>
          </div>
          <a
            href="#"
            className="bg-[#1D9E75] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#179165] transition-colors"
          >
            Add to Chrome
          </a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/rankings"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#1D9E75] transition-colors mb-8"
        >
          ← Back to rankings
        </Link>

        {/* Company header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-400 mb-1">{company.sector}</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{company.name}</h1>
            <a
              href={company.tos_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-[#1D9E75] transition-colors mt-1 inline-block"
            >
              View original TOS ↗
            </a>
          </div>

          {company.score && (
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-4xl ${GRADE_BG[company.score] ?? 'bg-gray-300'}`}
              >
                {company.score}
              </div>
              <span className="text-xs text-gray-400">{GRADE_LABEL[company.score]}</span>
            </div>
          )}
        </div>

        {/* Meta strip */}
        {(date || company.word_count) && (
          <div className="flex gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
            {date && <span>Analyzed {date}</span>}
            {company.word_count && <span>{company.word_count.toLocaleString()} words analyzed</span>}
          </div>
        )}

        {/* Findings */}
        {items.length > 0 ? (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Key findings
            </h2>
            <ul className="space-y-4">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-[5px] ${RISK_DOT[item.risk] ?? 'bg-gray-300'}`}
                    title={RISK_LABEL[item.risk]}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 leading-snug">{item.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.section}</p>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${
                    item.risk === 'high'     ? 'text-[#e53e3e]' :
                    item.risk === 'medium'   ? 'text-[#f5a623]' :
                    'text-[#1D9E75]'
                  }`}>
                    {RISK_LABEL[item.risk]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-400">No findings available for this company.</p>
        )}

        {/* Back button */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to rankings
          </Link>
        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-gray-400 border-t border-gray-100 mt-6">
        <Link href="/" className="hover:text-[#1D9E75] transition-colors">← whoreadtos</Link>
        <a href="https://ko-fi.com/wereadtos" target="_blank" rel="noopener noreferrer" className="hover:text-[#1D9E75]">
          ☕ Buy us a coffee
        </a>
      </footer>
    </div>
  );
}
