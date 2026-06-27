import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const client = new Anthropic();

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(15, '1 m'),
  prefix: 'whoreadtos:rl',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const CACHE_TTL_DAYS = 30;

function normalizeDomain(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    // Only allow valid hostname chars (letters, digits, dots, hyphens).
    // Rejects anything that could alter the PostgREST .or() filter string.
    if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(hostname)) return null;
    return hostname;
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type Item = { risk: string; text: string; section: string };

function makeSystemPrompt(itemCount: number): string {
  const rows = Array.from({ length: itemCount }, () =>
    `    { "risk": "<high|medium|positive>", "text": "<max 15 words>", "section": "<section name>" }`
  ).join(',\n');
  return `You are a terms-of-service analyst. You ALWAYS respond with raw JSON only — no markdown, no prose, no code fences. Your entire response must be a single valid JSON object matching this exact schema:\n\n{\n  "score": "<one letter: A, B, C, D, or F>",\n  "items": [\n${rows}\n  ]\n}\n\nThe "items" array must contain EXACTLY ${itemCount} objects. Never fewer, never more. Never add extra keys.`;
}

function makeUserPrompt(itemCount: number): string {
  return `Analyze the document below. Extract exactly ${itemCount} key points users must know before accepting. Grade overall safety A (safest) to F (riskiest). Reply with the JSON object only.\n\nDocument:\n`;
}

// Prefill assistant turn so the model cannot output any preamble
const ASSISTANT_PREFILL = `{"score":"`;

// Find the outermost {...} block, tolerating any text before/after it.
// Walks character-by-character to find the brace that closes the first
// opening brace, so nested objects don't confuse it.
function extractJson(raw: string): unknown {
  const start = raw.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in AI response');

  let depth = 0;
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') {
      depth--;
      if (depth === 0) {
        return JSON.parse(raw.slice(start, i + 1));
      }
    }
  }
  throw new Error('Malformed JSON in AI response: unmatched braces');
}

function splitDocuments(text: string): { tosText: string; privacyText: string } | null {
  const TOS_SEP  = '=== TERMS OF SERVICE ===';
  const PRIV_SEP = '=== PRIVACY POLICY ===';
  const tosIdx  = text.indexOf(TOS_SEP);
  const privIdx = text.indexOf(PRIV_SEP);
  if (tosIdx === -1 || privIdx === -1) return null;
  return {
    tosText:     text.slice(tosIdx  + TOS_SEP.length,  privIdx).trim(),
    privacyText: text.slice(privIdx + PRIV_SEP.length).trim(),
  };
}

const SEVERITY: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, F: 5 };

function mostSevereScore(a: string, b: string): string {
  return (SEVERITY[a] ?? 0) >= (SEVERITY[b] ?? 0) ? a : b;
}

async function callClaude(text: string, itemCount: number): Promise<{ score: string; items: Item[] }> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: makeSystemPrompt(itemCount),
    messages: [
      { role: 'user',      content: makeUserPrompt(itemCount) + text },
      { role: 'assistant', content: ASSISTANT_PREFILL },
    ],
  });
  const rawContent = message.content[0];
  if (rawContent.type !== 'text') throw new Error('Unexpected response format from AI');
  const fullText = ASSISTANT_PREFILL + rawContent.text;
  return extractJson(fullText) as { score: string; items: Item[] };
}

export async function POST(req: NextRequest) {
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429, headers: corsHeaders }
    );
  }

  let body: { text?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders });
  }

  let { text, url } = body;

  // If text is absent/short but a URL is provided, fetch content server-side
  if ((!text || text.trim().length < 100) && url && typeof url === 'string') {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL.' }, { status: 400, headers: corsHeaders });
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'URL must be http or https.' }, { status: 400, headers: corsHeaders });
    }
    try {
      const fetched = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; whoreadtos/1.0)' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!fetched.ok) {
        return NextResponse.json(
          { error: `Could not fetch that URL (HTTP ${fetched.status}).` },
          { status: 422, headers: corsHeaders }
        );
      }
      const html = await fetched.text();
      text = stripHtml(html).slice(0, 15_000);
    } catch {
      return NextResponse.json({ error: 'Could not fetch that URL. Try pasting the text directly.' }, { status: 422, headers: corsHeaders });
    }
  }

  if (!text || typeof text !== 'string' || text.trim().length < 100) {
    return NextResponse.json(
      { error: 'Text must be at least 100 characters.' },
      { status: 400, headers: corsHeaders }
    );
  }

  // ── Cache lookup ──────────────────────────────────────────────────────────
  const normalizedText = text.slice(0, 15_000);
  const contentHash    = createHash('sha256').update(normalizedText).digest('hex');
  const cutoff         = new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // 1. Known company: match URL domain against companies.tos_url / companies.privacy_url,
  //    then look for a fresh analysis in the official analyses table.
  if (url) {
    const domain = normalizeDomain(url);
    if (domain) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .or(`tos_url.ilike.%${domain}%,privacy_url.ilike.%${domain}%`)
        .limit(1)
        .maybeSingle();

      if (company) {
        const { data: hit } = await supabase
          .from('analyses')
          .select('score, items')
          .eq('company_id', company.id)
          .gte('analyzed_at', cutoff)
          .order('analyzed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (hit) {
          return NextResponse.json(
            { score: hit.score, items: hit.items, cached: true },
            { headers: corsHeaders }
          );
        }
      }
    }
  }

  // 2. Adhoc cache: SHA-256 of the normalized text, valid for CACHE_TTL_DAYS.
  {
    const { data: hit } = await supabase
      .from('adhoc_analyses')
      .select('score, items')
      .eq('content_hash', contentHash)
      .gte('analyzed_at', cutoff)
      .limit(1)
      .maybeSingle();

    if (hit) {
      return NextResponse.json(
        { score: hit.score, items: hit.items, cached: true },
        { headers: corsHeaders }
      );
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const startTime = Date.now();

  try {
    const dual = splitDocuments(normalizedText);
    let score: string;
    let items: Item[];

    if (dual) {
      const [tosResult, privacyResult] = await Promise.all([
        callClaude(dual.tosText.slice(0, 15_000), 3),
        callClaude(dual.privacyText.slice(0, 15_000), 2),
      ]);
      score = mostSevereScore(tosResult.score, privacyResult.score);
      items = [...tosResult.items, ...privacyResult.items];
    } else {
      const result = await callClaude(normalizedText, 5);
      score = result.score;
      items = result.items;
    }

    // Persist to adhoc cache so the next identical request is free.
    // Non-critical: ignore insert errors to avoid failing the response.
    await supabase.from('adhoc_analyses').insert({
      source_url:   url ?? null,
      content_hash: contentHash,
      score,
      items,
      word_count:   normalizedText.trim().split(/\s+/).length,
    });

    return NextResponse.json(
      { score, items, analysis_time_ms: Date.now() - startTime },
      { headers: corsHeaders }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
