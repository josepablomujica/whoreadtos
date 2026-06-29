'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import KofiLink from '@/app/components/KofiLink';
import Nav from '@/app/components/Nav';

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
  analyzed_at: string | null;
  items: Item[] | null;
  word_count: number | null;
}

const GRADE_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, F: 4 };

const GRADE_STYLE: Record<string, string> = {
  A: 'bg-[#1D9E75] text-white',
  B: 'bg-[#7CBE42] text-white',
  C: 'bg-[#F5C518] text-gray-900',
  D: 'bg-[#F07C28] text-white',
  F: 'bg-[#E53E3E] text-white',
};

const GRADE_BG: Record<string, string> = {
  A: 'bg-[#1D9E75]', B: 'bg-[#7CBE42]', C: 'bg-[#F5C518]', D: 'bg-[#F07C28]', F: 'bg-[#E53E3E]',
};
const GRADE_TEXT: Record<string, string> = {
  A: 'text-white', B: 'text-white', C: 'text-gray-900', D: 'text-white', F: 'text-white',
};
const GRADE_LABEL: Record<string, string> = {
  A: 'Very safe', B: 'Safe', C: 'Moderate', D: 'Risky', F: 'Very risky',
};
const RISK_DOT: Record<string, string> = {
  high: 'bg-[#e53e3e]', medium: 'bg-[#f5a623]', positive: 'bg-[#1D9E75]',
};
const RISK_ORDER: Record<string, number> = { high: 0, medium: 1, positive: 2 };

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function Rankings() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sector, setSector] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [comparing, setComparing] = useState(false);

  const selectedCompanies = companies.filter(c => selected.has(c.id));

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else if (next.size < 4) { next.add(id); }
      return next;
    });
  }

  useEffect(() => {
    fetch('/api/companies')
      .then(r => r.json())
      .then(data => {
        const sorted = [...data].sort((a, b) => {
          const ga = GRADE_ORDER[a.score] ?? 99;
          const gb = GRADE_ORDER[b.score] ?? 99;
          return ga !== gb ? ga - gb : a.name.localeCompare(b.name);
        });
        setCompanies(sorted);
      })
      .catch(() => setError('Failed to load rankings.'))
      .finally(() => setLoading(false));
  }, []);

  const sectors = ['All', ...Array.from(new Set(companies.map(c => c.sector))).sort()];

  const filtered = companies
    .filter(c => sector === 'All' || c.sector === sector)
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <Nav />

      {/* Comparison overlay */}
      {comparing && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto" style={{ fontFamily: 'system-ui, sans-serif' }}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Comparing {selectedCompanies.length} companies
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {selectedCompanies.map((c, i) => (
                    <span key={c.id}>
                      {i > 0 && <span className="mx-1.5 text-gray-300">·</span>}
                      {c.name}{c.score && <span className="ml-1 font-semibold text-gray-600">({c.score})</span>}
                    </span>
                  ))}
                </p>
              </div>
              <button
                onClick={() => setComparing(false)}
                className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                ← Back to rankings
              </button>
            </div>
            <div className="overflow-x-auto">
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${selectedCompanies.length}, minmax(240px, 1fr))` }}
              >
                {selectedCompanies.map(company => (
                  <div key={company.id} className="border border-gray-200 rounded-2xl p-5 relative">
                    <button
                      onClick={() => { const willHaveOne = selected.size <= 2; toggleSelect(company.id); if (willHaveOne) setComparing(false); }}
                      className="absolute top-3 right-3 text-gray-300 hover:text-gray-600 transition-colors text-xl leading-none"
                      aria-label={`Remove ${company.name}`}
                    >
                      ×
                    </button>
                    <div
                      className="h-1 rounded-full mb-4"
                      style={{ backgroundColor: company.logo_color ?? '#1D9E75' }}
                    />
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{company.sector}</p>
                        <h3 className="font-extrabold text-gray-900 leading-tight text-lg">{company.name}</h3>
                      </div>
                      {company.score && (
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-2xl ${GRADE_BG[company.score] ?? 'bg-gray-300'} ${GRADE_TEXT[company.score] ?? 'text-white'}`}>
                            {company.score}
                          </div>
                          <span className="text-[10px] text-gray-400">{GRADE_LABEL[company.score]}</span>
                        </div>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {[...(company.items ?? [])].sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk]).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-[5px] ${RISK_DOT[item.risk] ?? 'bg-gray-300'}`} />
                          <div>
                            <p className="text-sm text-gray-900 leading-snug">{item.text}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{item.section}</p>
                          </div>
                        </li>
                      ))}
                      {!company.items?.length && (
                        <li className="text-sm text-gray-400">No findings available.</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className={`max-w-5xl mx-auto px-6 py-10 ${selected.size >= 2 ? 'pb-24' : ''}`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">TOS Rankings</h1>
          <p className="mt-2 text-gray-500">
            {loading ? 'Loading…' : `${filtered.length} companies analyzed — graded A (safest) to F (riskiest)`}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            This is free and we don&apos;t sell your data. If it helped,{' '}
            <KofiLink />
          </p>
        </div>

        {/* Search */}
        {!loading && !error && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search companies…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full sm:w-72 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
            />
          </div>
        )}

        {/* Sector pills */}
        {!loading && !error && (
          <div className="flex flex-wrap gap-2 mb-6">
            {sectors.map(s => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  sector === s
                    ? 'bg-[#1D9E75] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <svg className="animate-spin h-6 w-6 mr-3 text-[#1D9E75]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Loading rankings…
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-500">{error}</div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-3 w-8"></th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium w-10">#</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Company</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden sm:table-cell">Sector</th>
                  <th className="text-center px-4 py-3 text-gray-600 font-semibold w-20">Grade</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((company, i) => (
                  <tr
                    key={company.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(company.id)}
                        disabled={!selected.has(company.id) && selected.size >= 4}
                        onChange={() => toggleSelect(company.id)}
                        className="w-4 h-4 rounded accent-[#1D9E75] cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-300 tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/rankings/${toSlug(company.name)}`}
                          className="font-medium text-gray-900 hover:text-[#1D9E75] transition-colors"
                        >
                          {company.name}
                        </Link>
                        {company.name === 'whoreadtos' && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#f0fdf9] text-[#1D9E75] border border-[#a7f3d0] whitespace-nowrap">
                            That&apos;s us
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{company.sector}</td>
                    <td className="px-4 py-3 text-center">
                      {company.score ? (
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${GRADE_STYLE[company.score] ?? 'bg-gray-200 text-gray-600'}`}
                        >
                          {company.score}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <Link href={`/rankings/${toSlug(company.name)}`} className="hover:text-[#1D9E75]">
                        →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                {query ? 'No companies match your search.' : 'No companies in this sector.'}
              </div>
            )}
          </div>
        )}
        {/* Floating compare bar */}
        {selected.size >= 2 && !comparing && (
          <div className="fixed bottom-6 inset-x-0 flex justify-center gap-2 z-40 pointer-events-none">
            <button
              onClick={() => setComparing(true)}
              className="pointer-events-auto px-6 py-3 bg-[#1D9E75] text-white text-sm font-semibold rounded-full shadow-xl hover:bg-[#178a63] transition-colors"
            >
              Compare ({selected.size})
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="pointer-events-auto px-4 py-3 bg-white text-gray-600 text-sm font-medium rounded-full shadow-xl hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-gray-400 border-t border-gray-100 mt-10">
        <Link href="/" className="hover:text-[#1D9E75] transition-colors">← Who Read ToS</Link>
        <span>This is free and we don&apos;t sell your data. If it helped,{' '}<KofiLink /></span>
      </footer>
    </div>
  );
}
