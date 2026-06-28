'use client';

import { useState, useRef } from 'react';
import KofiLink from './components/KofiLink';

interface FindingItem {
  risk: 'high' | 'medium' | 'positive';
  text: string;
  section: string;
}

interface AnalysisResult {
  score: string;
  items: FindingItem[];
  analysis_time_ms?: number;
}

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
const RISK_LABEL: Record<string, string> = {
  high: 'High risk', medium: 'Medium risk', positive: 'Positive',
};
const RISK_TEXT_COLOR: Record<string, string> = {
  high: 'text-[#e53e3e]', medium: 'text-[#f5a623]', positive: 'text-[#1D9E75]',
};

export default function AnalyzeForm() {
  const [mode, setMode] = useState<'url' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const body = mode === 'url'
      ? { url: urlInput.trim() }
      : { text: textInput.trim() };

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Analysis failed. Please try again.');
      } else {
        setResult(data);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = mode === 'url'
    ? urlInput.trim().length > 0
    : textInput.trim().length >= 100;

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'url' ? (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://example.com/terms"
              required
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="bg-[#1D9E75] text-white font-semibold px-5 py-3 rounded-xl hover:bg-[#179165] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
            >
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Paste the full text of the Terms of Service here…"
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-colors resize-y"
            />
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full bg-[#1D9E75] text-white font-semibold px-5 py-3 rounded-xl hover:bg-[#179165] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>
        )}
      </form>

      <button
        type="button"
        onClick={() => { setMode(m => m === 'url' ? 'text' : 'url'); setError(null); }}
        className="mt-2 text-xs text-gray-400 hover:text-[#1D9E75] transition-colors"
      >
        {mode === 'url' ? 'or paste the text directly →' : '← back to URL input'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-8 flex flex-col items-center gap-3 py-8">
          <svg className="animate-spin h-8 w-8 text-[#1D9E75]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm text-gray-400">Reading the fine print…</p>
        </div>
      )}

      {result && (
        <div ref={resultRef} className="mt-8">
          {/* Grade */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-3xl flex-shrink-0 ${GRADE_BG[result.score] ?? 'bg-gray-300'} ${GRADE_TEXT[result.score] ?? 'text-white'}`}
            >
              {result.score}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">{GRADE_LABEL[result.score] ?? result.score}</div>
              {result.analysis_time_ms && (
                <div className="text-xs text-gray-400 mt-0.5">
                  Analyzed in {(result.analysis_time_ms / 1000).toFixed(1)}s
                </div>
              )}
            </div>
          </div>

          {/* Findings */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key findings</h3>
          <ul className="space-y-3">
            {result.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-[5px] ${RISK_DOT[item.risk] ?? 'bg-gray-300'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-snug">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.section}</p>
                </div>
                <span className={`text-xs font-medium flex-shrink-0 ${RISK_TEXT_COLOR[item.risk] ?? 'text-gray-400'}`}>
                  {RISK_LABEL[item.risk]}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-xs text-center text-gray-400">
            This is free and we don&apos;t sell your data. If it helped,{' '}
            <KofiLink />
          </p>

          <button
            type="button"
            onClick={() => { setResult(null); setUrlInput(''); setTextInput(''); setMode('url'); }}
            className="mt-3 text-xs text-gray-400 hover:text-[#1D9E75] transition-colors"
          >
            ← Analyze another
          </button>
        </div>
      )}
    </div>
  );
}
