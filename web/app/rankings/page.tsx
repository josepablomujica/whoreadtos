'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import KofiLink from '@/app/components/KofiLink';
import Nav from '@/app/components/Nav';

interface Company {
  id: string;
  name: string;
  sector: string;
  tos_url: string;
  logo_color: string;
  score: string | null;
  analyzed_at: string | null;
}

const GRADE_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, F: 4 };

const GRADE_STYLE: Record<string, string> = {
  A: 'bg-[#1D9E75] text-white',
  B: 'bg-[#7CBE42] text-white',
  C: 'bg-[#F5C518] text-gray-900',
  D: 'bg-[#F07C28] text-white',
  F: 'bg-[#E53E3E] text-white',
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function Rankings() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sector, setSector] = useState('All');
  const [query, setQuery] = useState('');

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

      <main className="max-w-5xl mx-auto px-6 py-10">
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
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-gray-400 border-t border-gray-100 mt-10">
        <Link href="/" className="hover:text-[#1D9E75] transition-colors">← Who Read ToS</Link>
        <span>This is free and we don&apos;t sell your data. If it helped,{' '}<KofiLink /></span>
      </footer>
    </div>
  );
}
