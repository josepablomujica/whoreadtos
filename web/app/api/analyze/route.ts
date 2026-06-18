import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SYSTEM_PROMPT = `You are a terms-of-service analyst. You ALWAYS respond with raw JSON only — no markdown, no prose, no code fences. Your entire response must be a single valid JSON object matching this exact schema:

{
  "score": "<one letter: A, B, C, D, or F>",
  "items": [
    { "risk": "<high|medium|positive>", "text": "<max 15 words>", "section": "<section name>" },
    { "risk": "<high|medium|positive>", "text": "<max 15 words>", "section": "<section name>" },
    { "risk": "<high|medium|positive>", "text": "<max 15 words>", "section": "<section name>" },
    { "risk": "<high|medium|positive>", "text": "<max 15 words>", "section": "<section name>" },
    { "risk": "<high|medium|positive>", "text": "<max 15 words>", "section": "<section name>" }
  ]
}

The "items" array must contain EXACTLY 5 objects. Never fewer, never more. Never add extra keys.`;

const USER_PROMPT = `Analyze the terms of service below. Extract exactly 5 key points users must know before accepting. Grade overall safety A (safest) to F (riskiest). Reply with the JSON object only.

Terms:
`;

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

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin') || '';

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

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
      text = stripHtml(html).slice(0, 8000);
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

  const truncated = text.slice(0, 8000);
  const startTime = Date.now();

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: USER_PROMPT + truncated },
        { role: 'assistant', content: ASSISTANT_PREFILL },
      ],
    });

    const rawContent = message.content[0];
    if (rawContent.type !== 'text') {
      throw new Error('Unexpected response format from AI');
    }

    // Reconstruct the full JSON: prefill + model continuation
    const fullText = ASSISTANT_PREFILL + rawContent.text;

    const parsed = extractJson(fullText);

    const result = parsed as {
      score: string;
      items: Array<{ risk: string; text: string; section: string }>;
      analysis_time_ms?: number;
    };

    result.analysis_time_ms = Date.now() - startTime;

    return NextResponse.json(result, { headers: corsHeaders });
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
