import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const SUPABASE_URL              = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase  = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic();

// ── Types ─────────────────────────────────────────────────────────────────────

interface CompanyRow {
  id:          string;
  name:        string;
  sector:      string;
  logo_color:  string;
  analysis_id: string;
  score:       string;
  items:       Array<{ risk: string; text: string; section: string }>;
  word_count:  number | null;
  analyzed_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const RISK_ICON: Record<string, string> = {
  high:     '🔴',
  medium:   '🟡',
  positive: '🟢',
};

const ASSISTANT_PREFILL = '{"title":"';

function extractJson(raw: string): unknown {
  const start = raw.indexOf('{');
  if (start === -1) throw new Error('No JSON object in response');
  let depth = 0;
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') {
      depth--;
      if (depth === 0) return JSON.parse(raw.slice(start, i + 1));
    }
  }
  throw new Error('Malformed JSON in response: unmatched braces');
}

// ── Prompts ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the voice of whoreadtos.com. Match this exact tone, based on the site's real copy:

- Short, declarative sentences. State things, don't explain them. Example: 'Nobody reads the terms. We do.'
- Use the 'No X. No Y. No Z.' rhythm where it fits naturally. Example: 'No signup, no legal jargon, just a straight answer.'
- Dry, deadpan humor. Never forced or jokey. Example: 'Free forever. No ads. No tracking. No irony.'
- First person plural with attitude when relevant. Example: 'Not because we're lawyers. Because somebody has to keep score.'
- No legal jargon, ever. No corporate softening language ('it's worth noting', 'one might consider').
- No exclamation points. No hype words ('amazing', 'incredible', 'shocking').
- Never mention AI, Claude, or any underlying model.
- Controlled indignation when a finding is genuinely bad — let the fact speak, don't editorialize with adjectives like 'shocking' or 'outrageous'.
- When expanding on a finding, stick to consequences and implications already entailed by the finding's own wording. Do not introduce specific legal terms (e.g. 'perpetual license', 'indemnification', 'irrevocable', 'unlimited', 'worldwide') unless that exact term or a clear synonym already appears in the finding text provided.

You will receive a company name, sector, a safety score (A-F), and exactly 5 findings (risk level, short text, source section). Write ONLY from these facts — never invent, infer, or add details not present in the findings.

Output ONLY valid JSON: { "title": "...", "content": "..." }

title: a short, punchy headline in the site's voice (not 'Analysis of X\\'s Terms of Service' — more like the H1 style: direct and a little blunt)
content: Markdown body with: a short intro (1-3 sentences, declarative), one sentence of context on what the company does, then the 5 findings each with its risk icon (🔴🟡🟢) and a one-line plain-language explanation expanding slightly on the given text (still grounded only in the given finding, no invented specifics), then a short closing line. Keep it tight — this is a skimmable blog post, not an essay.`;

function buildUserMessage(company: CompanyRow): string {
  const findings = company.items
    .map((item, i) => {
      const icon = RISK_ICON[item.risk] ?? '⚪';
      return `${i + 1}. ${icon} ${item.text} (${item.section}) — ${item.risk}`;
    })
    .join('\n');

  return `Company: ${company.name}
Sector: ${company.sector}
Safety Grade: ${company.score} (A = safest, F = riskiest)

Findings:
${findings}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Find eligible companies: have an analysis, no blog post ever
  const [rankingsResult, postsResult] = await Promise.all([
    supabase
      .from('company_rankings')
      .select('id, name, sector, logo_color, analysis_id, score, items, word_count, analyzed_at')
      .not('score', 'is', null),
    supabase
      .from('blog_posts')
      .select('id, company_id'),
  ]);

  if (rankingsResult.error) throw new Error(`Rankings query: ${rankingsResult.error.message}`);
  if (postsResult.error)    throw new Error(`Blog posts query: ${postsResult.error.message}`);

  const postedIds   = new Set((postsResult.data ?? []).map(r => r.company_id));
  const onlyCompany = process.env.ONLY_COMPANY?.trim().toLowerCase();
  const regenerate  = process.env.REGENERATE === '1';

  const eligible = (rankingsResult.data as CompanyRow[])
    .filter(c => regenerate || !postedIds.has(c.id))
    .filter(c => !onlyCompany || c.name.toLowerCase() === onlyCompany);

  if (eligible.length === 0) {
    console.log('No hay empresas disponibles para generar post.');
    return;
  }

  // 2. Pick one at random
  const company = eligible[Math.floor(Math.random() * eligible.length)];
  console.log(`\n${regenerate ? 'Regenerating' : 'Generating'} post for: ${company.name} (grade ${company.score})\n`);

  // 3. Generate post with Claude Haiku
  const message = await anthropic.messages.create({
    model:      'claude-haiku-4-5',
    max_tokens: 2048,
    system:     SYSTEM_PROMPT,
    messages: [
      { role: 'user',      content: buildUserMessage(company) },
      { role: 'assistant', content: ASSISTANT_PREFILL },
    ],
  });

  const rawContent = message.content[0];
  if (rawContent.type !== 'text') throw new Error('Unexpected response type from Claude');

  const fullText = ASSISTANT_PREFILL + rawContent.text;
  const parsed   = extractJson(fullText) as { title: string; content: string };

  // 4. Append disclaimer in code (not generated by Claude)
  const disclaimer   = `\n\n*This breakdown is based on ${company.name}'s publicly available Terms of Service and/or Privacy Policy. It may contain mistakes. Spot one? [Let us know](/contact).*`;
  const finalContent = parsed.content + disclaimer;

  // 5. Validate
  const slug   = `${toSlug(company.name)}-terms-of-service-privacy-policy-analysis`;
  const valid  = Boolean(parsed.title?.trim()) && finalContent.length >= 500;
  const status = valid ? 'published' : 'failed_validation';

  if (!valid) {
    console.warn(`⚠ Validation failed — title: "${parsed.title?.slice(0, 60)}", content length: ${finalContent.length}`);
  }

  // 6. Insert or update blog_posts
  let dbError: { message: string } | null;
  if (regenerate) {
    const existing = (postsResult.data ?? []).find(r => r.company_id === company.id);
    if (!existing) throw new Error(`REGENERATE=1 but no existing post found for ${company.name}`);
    const { error } = await supabase
      .from('blog_posts')
      .update({
        analysis_id:  company.analysis_id,
        title:        parsed.title,
        content:      finalContent,
        status,
        published_at: valid ? new Date().toISOString() : null,
      })
      .eq('id', existing.id);
    dbError = error;
  } else {
    const { error } = await supabase.from('blog_posts').insert({
      company_id:   company.id,
      analysis_id:  company.analysis_id,
      slug,
      title:        parsed.title,
      content:      finalContent,
      status,
      published_at: valid ? new Date().toISOString() : null,
    });
    dbError = error;
  }

  if (dbError) throw new Error(`${regenerate ? 'Update' : 'Insert'} failed: ${dbError.message}`);

  console.log(`✓ ${status}: "${parsed.title}"`);
  console.log(`  slug:    ${slug}`);
  console.log(`  length:  ${finalContent.length} chars\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
