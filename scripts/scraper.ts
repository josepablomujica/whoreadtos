import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const ANALYZE_API       = process.env.ANALYZE_API ?? 'https://whoreadtos.com/api/analyze';
const RATE_LIMIT_MS     = 2000;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Company list ─────────────────────────────────────────────────────────────

const COMPANIES = [
  // Big Tech
  { name: 'Apple',            sector: 'Big Tech',       logo_color: '#555555', tos_url: 'https://www.apple.com/legal/internet-services/terms/site.html' },
  { name: 'Microsoft',        sector: 'Big Tech',       logo_color: '#00A4EF', tos_url: 'https://www.microsoft.com/en-us/servicesagreement/' },
  { name: 'Google',           sector: 'Big Tech',       logo_color: '#4285F4', tos_url: 'https://policies.google.com/terms' },
  { name: 'Amazon',           sector: 'Big Tech',       logo_color: '#FF9900', tos_url: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=508088' },
  { name: 'Meta',             sector: 'Big Tech',       logo_color: '#0082FB', tos_url: 'https://www.facebook.com/terms.php' },
  { name: 'Netflix',          sector: 'Big Tech',       logo_color: '#E50914', tos_url: 'https://help.netflix.com/legal/termsofuse' },
  { name: 'Tesla',            sector: 'Big Tech',       logo_color: '#CC0000', tos_url: 'https://www.tesla.com/legal/additional-resources/terms-and-conditions' },
  { name: 'NVIDIA',           sector: 'Semiconductors', logo_color: '#76B900', tos_url: 'https://www.nvidia.com/en-us/about-nvidia/legal-info/terms-of-service/' },
  // Cloud / SaaS
  { name: 'Salesforce',       sector: 'Cloud & SaaS',   logo_color: '#00A1E0', tos_url: 'https://www.salesforce.com/company/legal/agreements/' },
  { name: 'Adobe',            sector: 'Cloud & SaaS',   logo_color: '#FF0000', tos_url: 'https://www.adobe.com/legal/terms.html' },
  { name: 'ServiceNow',       sector: 'Cloud & SaaS',   logo_color: '#62D84E', tos_url: 'https://www.servicenow.com/terms-of-service.html' },
  { name: 'Zoom',             sector: 'Cloud & SaaS',   logo_color: '#2D8CFF', tos_url: 'https://explore.zoom.us/en/terms/' },
  { name: 'Dropbox',          sector: 'Cloud & SaaS',   logo_color: '#0061FF', tos_url: 'https://www.dropbox.com/terms' },
  { name: 'Box',              sector: 'Cloud & SaaS',   logo_color: '#0061D5', tos_url: 'https://www.box.com/legal/termsofservice' },
  { name: 'DocuSign',         sector: 'Cloud & SaaS',   logo_color: '#FFCC33', tos_url: 'https://www.docusign.com/company/terms-and-conditions' },
  { name: 'HubSpot',          sector: 'Cloud & SaaS',   logo_color: '#FF7A59', tos_url: 'https://legal.hubspot.com/terms-of-service' },
  { name: 'Twilio',           sector: 'Cloud & SaaS',   logo_color: '#F22F46', tos_url: 'https://www.twilio.com/en-us/legal/tos' },
  { name: 'Shopify',          sector: 'Cloud & SaaS',   logo_color: '#96BF48', tos_url: 'https://www.shopify.com/legal/terms' },
  { name: 'Atlassian',        sector: 'Cloud & SaaS',   logo_color: '#0052CC', tos_url: 'https://www.atlassian.com/legal/cloud-terms-of-service' },
  { name: 'RingCentral',      sector: 'Cloud & SaaS',   logo_color: '#0073AE', tos_url: 'https://www.ringcentral.com/legal/eulatos.html' },
  { name: 'Workday',          sector: 'Cloud & SaaS',   logo_color: '#F5A623', tos_url: 'https://www.workday.com/en-us/legal/candidate-privacy-statement.html' },
  { name: 'Veeva Systems',    sector: 'Cloud & SaaS',   logo_color: '#F26724', tos_url: 'https://www.veeva.com/terms-of-service/' },
  // Semiconductors
  { name: 'Intel',            sector: 'Semiconductors', logo_color: '#0071C5', tos_url: 'https://www.intel.com/content/www/us/en/legal/terms-of-use.html' },
  { name: 'Qualcomm',         sector: 'Semiconductors', logo_color: '#3253DC', tos_url: 'https://www.qualcomm.com/site/terms-of-use' },
  { name: 'Broadcom',         sector: 'Semiconductors', logo_color: '#CC0000', tos_url: 'https://www.broadcom.com/company/legal/terms-of-use' },
  { name: 'Texas Instruments',sector: 'Semiconductors', logo_color: '#C00000', tos_url: 'https://www.ti.com/legal/termsofsale.html' },
  { name: 'Applied Materials',sector: 'Semiconductors', logo_color: '#003D79', tos_url: 'https://www.appliedmaterials.com/us/en/legal.html' },
  { name: 'Micron Technology',sector: 'Semiconductors', logo_color: '#004B87', tos_url: 'https://www.micron.com/about/legal/terms-and-conditions-of-use' },
  { name: 'AMD',              sector: 'Semiconductors', logo_color: '#ED1C24', tos_url: 'https://www.amd.com/en/legal/terms-and-conditions.html' },
  { name: 'Analog Devices',   sector: 'Semiconductors', logo_color: '#003057', tos_url: 'https://www.analog.com/en/about-adi/legal-and-risk-oversight/adi-website-terms-of-use.html' },
  // Cybersecurity
  { name: 'Palo Alto Networks',sector: 'Cybersecurity', logo_color: '#FA582D', tos_url: 'https://www.paloaltonetworks.com/legal-notices/terms-of-use' },
  { name: 'Fortinet',         sector: 'Cybersecurity',  logo_color: '#EE3124', tos_url: 'https://www.fortinet.com/corporate/about-us/legal.html' },
  { name: 'CrowdStrike',      sector: 'Cybersecurity',  logo_color: '#E3001B', tos_url: 'https://www.crowdstrike.com/terms-conditions/' },
  { name: 'Okta',             sector: 'Cybersecurity',  logo_color: '#007DC1', tos_url: 'https://www.okta.com/terms-of-service/' },
  { name: 'Zscaler',          sector: 'Cybersecurity',  logo_color: '#005DAA', tos_url: 'https://www.zscaler.com/legal/terms-of-service' },
  { name: 'Cloudflare',       sector: 'Cybersecurity',  logo_color: '#F48120', tos_url: 'https://www.cloudflare.com/terms/' },
  { name: 'Datadog',          sector: 'Cybersecurity',  logo_color: '#632CA6', tos_url: 'https://www.datadoghq.com/legal/terms/' },
  { name: 'Splunk',           sector: 'Cybersecurity',  logo_color: '#65A637', tos_url: 'https://www.splunk.com/en_us/legal/splunk-general-terms.html' },
  // E-commerce & Fintech
  { name: 'PayPal',           sector: 'Fintech',        logo_color: '#003087', tos_url: 'https://www.paypal.com/us/legalhub/useragreement-full' },
  { name: 'Block (Square)',   sector: 'Fintech',        logo_color: '#3E4348', tos_url: 'https://squareup.com/us/en/legal/general/ua' },
  { name: 'Visa',             sector: 'Fintech',        logo_color: '#1A1F71', tos_url: 'https://usa.visa.com/legal/privacy-policy.html' },
  { name: 'Mastercard',       sector: 'Fintech',        logo_color: '#EB001B', tos_url: 'https://www.mastercard.us/en-us/about-mastercard/what-we-do/terms-of-use.html' },
  { name: 'Stripe',           sector: 'Fintech',        logo_color: '#635BFF', tos_url: 'https://stripe.com/legal/ssa' },
  { name: 'Intuit',           sector: 'Fintech',        logo_color: '#236CFF', tos_url: 'https://www.intuit.com/legal/terms/' },
  { name: 'eBay',             sector: 'E-commerce',     logo_color: '#E53238', tos_url: 'https://www.ebay.com/help/policies/member-behaviour-policies/user-agreement?id=4259' },
  { name: 'Etsy',             sector: 'E-commerce',     logo_color: '#F56400', tos_url: 'https://www.etsy.com/legal/terms-of-use' },
  // Gig economy
  { name: 'Airbnb',           sector: 'Marketplace',    logo_color: '#FF5A5F', tos_url: 'https://www.airbnb.com/help/article/2908' },
  { name: 'Uber',             sector: 'Marketplace',    logo_color: '#000000', tos_url: 'https://www.uber.com/legal/en/document/?name=general-terms-of-use&country=united-states&lang=en' },
  { name: 'Lyft',             sector: 'Marketplace',    logo_color: '#FF00BF', tos_url: 'https://www.lyft.com/terms' },
  { name: 'DoorDash',         sector: 'Marketplace',    logo_color: '#FF3008', tos_url: 'https://help.doordash.com/consumers/s/terms-of-service-us' },
  // Social & Media
  { name: 'Pinterest',        sector: 'Social Media',   logo_color: '#E60023', tos_url: 'https://policy.pinterest.com/en/terms-of-service' },
  { name: 'Snap',             sector: 'Social Media',   logo_color: '#FFFC00', tos_url: 'https://snap.com/en-US/terms' },
  { name: 'Reddit',           sector: 'Social Media',   logo_color: '#FF4500', tos_url: 'https://www.redditinc.com/policies/user-agreement' },
  { name: 'Discord',          sector: 'Social Media',   logo_color: '#5865F2', tos_url: 'https://discord.com/terms' },
  { name: 'TikTok',           sector: 'Social Media',   logo_color: '#000000', tos_url: 'https://www.tiktok.com/legal/page/us/terms-of-service/en' },
  { name: 'X (Twitter)',      sector: 'Social Media',   logo_color: '#000000', tos_url: 'https://twitter.com/en/tos' },
  { name: 'LinkedIn',         sector: 'Social Media',   logo_color: '#0A66C2', tos_url: 'https://www.linkedin.com/legal/user-agreement' },
  // Enterprise IT
  { name: 'Oracle',           sector: 'Enterprise IT',  logo_color: '#C74634', tos_url: 'https://www.oracle.com/legal/terms.html' },
  { name: 'IBM',              sector: 'Enterprise IT',  logo_color: '#1F70C1', tos_url: 'https://www.ibm.com/us-en/legal/terms-of-use' },
  { name: 'Dell Technologies',sector: 'Enterprise IT',  logo_color: '#007DB8', tos_url: 'https://www.dell.com/learn/us/en/uscorp1/terms-conditions' },
  { name: 'HP Inc',           sector: 'Enterprise IT',  logo_color: '#0096D6', tos_url: 'https://www.hp.com/us-en/privacy/privacy.html' },
  { name: 'Akamai',           sector: 'Enterprise IT',  logo_color: '#009BDE', tos_url: 'https://www.akamai.com/legal/compliance/acceptable-use-policy' },
  { name: 'Gartner',          sector: 'Enterprise IT',  logo_color: '#005B99', tos_url: 'https://www.gartner.com/en/about/policies/terms-of-use' },
  // Gaming
  { name: 'Electronic Arts',  sector: 'Gaming',         logo_color: '#000000', tos_url: 'https://tos.ea.com/legalapp/WEBTERMS/US/en/PC/' },
  { name: 'Take-Two Interactive', sector: 'Gaming',     logo_color: '#C8102E', tos_url: 'https://www.take2games.com/legal' },
  { name: 'Roblox',           sector: 'Gaming',         logo_color: '#E2231A', tos_url: 'https://en.help.roblox.com/hc/en-us/articles/115004647846' },
  { name: 'Epic Games',       sector: 'Gaming',         logo_color: '#313131', tos_url: 'https://www.epicgames.com/site/en-US/tos' },
  // Telecom
  { name: 'Verizon',          sector: 'Telecom',        logo_color: '#CD040B', tos_url: 'https://www.verizon.com/about/terms-conditions/overview' },
  { name: 'AT&T',             sector: 'Telecom',        logo_color: '#00A8E0', tos_url: 'https://www.att.com/legal/terms.termsOfService.html' },
  { name: 'T-Mobile',         sector: 'Telecom',        logo_color: '#E20074', tos_url: 'https://www.t-mobile.com/responsibility/legal/terms-and-conditions' },
  { name: 'Comcast',          sector: 'Telecom',        logo_color: '#DA2128', tos_url: 'https://www.xfinity.com/corporate/customers/policies/subscriberagreement' },
  // Productivity & Dev Tools
  { name: 'Spotify',          sector: 'Media & Music',  logo_color: '#1DB954', tos_url: 'https://www.spotify.com/us/legal/end-user-agreement/' },
  { name: 'Slack',            sector: 'Productivity',   logo_color: '#4A154B', tos_url: 'https://slack.com/terms-of-service' },
  { name: 'GitHub',           sector: 'Dev Tools',      logo_color: '#181717', tos_url: 'https://docs.github.com/en/site-policy/github-terms/github-terms-of-service' },
  { name: 'GitLab',           sector: 'Dev Tools',      logo_color: '#FC6D26', tos_url: 'https://about.gitlab.com/handbook/legal/subscription-agreement/' },
  { name: 'Figma',            sector: 'Productivity',   logo_color: '#F24E1E', tos_url: 'https://www.figma.com/legal/tos/' },
  { name: 'Notion',           sector: 'Productivity',   logo_color: '#000000', tos_url: 'https://www.notion.com/terms' },
  { name: 'Asana',            sector: 'Productivity',   logo_color: '#F06A6A', tos_url: 'https://asana.com/terms' },
  { name: 'Monday.com',       sector: 'Productivity',   logo_color: '#FF3750', tos_url: 'https://monday.com/l/tos/' },
  { name: 'Canva',            sector: 'Productivity',   logo_color: '#00C4CC', tos_url: 'https://www.canva.com/policies/terms-of-service/' },
  { name: 'Grammarly',        sector: 'Productivity',   logo_color: '#15C39A', tos_url: 'https://www.grammarly.com/terms' },
  // Identity & Security tools
  { name: '1Password',        sector: 'Cybersecurity',  logo_color: '#1A8CFF', tos_url: 'https://1password.com/legal/terms-of-service/' },
  { name: 'LastPass',         sector: 'Cybersecurity',  logo_color: '#D32D27', tos_url: 'https://www.lastpass.com/terms' },
  // EdTech
  { name: 'Duolingo',         sector: 'EdTech',         logo_color: '#58CC02', tos_url: 'https://www.duolingo.com/terms' },
  { name: 'Coursera',         sector: 'EdTech',         logo_color: '#0056D2', tos_url: 'https://www.coursera.org/about/terms' },
  { name: 'Udemy',            sector: 'EdTech',         logo_color: '#A435F0', tos_url: 'https://www.udemy.com/terms/' },
  // Healthcare IT
  { name: 'Epic Systems',     sector: 'Healthcare IT',  logo_color: '#C2002F', tos_url: 'https://www.epic.com/terms' },
  { name: 'Cerner (Oracle)',  sector: 'Healthcare IT',  logo_color: '#007A73', tos_url: 'https://www.cerner.com/terms-of-use' },
  // Cloud infra
  { name: 'Cloudinary',       sector: 'Cloud & SaaS',   logo_color: '#3448C5', tos_url: 'https://cloudinary.com/tos' },
  { name: 'Fastly',           sector: 'Cloud & SaaS',   logo_color: '#FF282D', tos_url: 'https://www.fastly.com/terms' },
  { name: 'MongoDB',          sector: 'Dev Tools',      logo_color: '#4DB33D', tos_url: 'https://www.mongodb.com/legal/terms-of-use' },
  { name: 'Elastic',          sector: 'Dev Tools',      logo_color: '#FEC514', tos_url: 'https://www.elastic.co/legal/elastic-cloud-account-terms' },
  { name: 'HashiCorp',        sector: 'Dev Tools',      logo_color: '#7B42BC', tos_url: 'https://www.hashicorp.com/terms-of-service' },
  { name: 'Confluent',        sector: 'Dev Tools',      logo_color: '#0176D3', tos_url: 'https://www.confluent.io/confluent-cloud-tos/' },
  // Miscellaneous
  { name: 'Palantir',         sector: 'Enterprise IT',  logo_color: '#101113', tos_url: 'https://www.palantir.com/terms-of-service/' },
  { name: 'UiPath',           sector: 'Enterprise IT',  logo_color: '#FA4616', tos_url: 'https://www.uipath.com/legal/trust-and-security/legal-terms' },
  { name: 'Snowflake',        sector: 'Cloud & SaaS',   logo_color: '#29B5E8', tos_url: 'https://www.snowflake.com/legal/terms-of-service/' },
  { name: 'Databricks',       sector: 'Cloud & SaaS',   logo_color: '#FF3621', tos_url: 'https://www.databricks.com/legal/databricksterms' },
  { name: 'Twitch',           sector: 'Media & Music',  logo_color: '#9146FF', tos_url: 'https://www.twitch.tv/p/en/legal/terms-of-service/' },
  { name: 'Zoom (Phone)',     sector: 'Cloud & SaaS',   logo_color: '#2D8CFF', tos_url: 'https://explore.zoom.us/en/terms/' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function fetchTosText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; whoreadtos-bot/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const contentType = res.headers.get('content-type') ?? '';
  const html = await res.text();

  if (!contentType.includes('text')) throw new Error('Non-text response');

  return stripHtml(html);
}

async function analyzeText(text: string, url: string) {
  const truncated = text.slice(0, 8000);
  const wordCount = truncated.split(/\s+/).filter(Boolean).length;

  const res = await fetch(ANALYZE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: truncated, url }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err.slice(0, 100)}`);
  }

  const data = await res.json() as {
    score: string;
    items: Array<{ risk: string; text: string; section: string }>;
  };

  return { ...data, wordCount };
}

async function upsertCompany(company: typeof COMPANIES[0]) {
  const { data, error } = await supabase
    .from('companies')
    .upsert({ ...company }, { onConflict: 'name' })
    .select('id')
    .single();

  if (error) throw new Error(`DB upsert: ${error.message}`);
  return data.id as string;
}

async function insertAnalysis(companyId: string, analysis: { score: string; items: unknown; wordCount: number }) {
  const { error } = await supabase.from('analyses').insert({
    company_id: companyId,
    score: analysis.score,
    items: analysis.items,
    word_count: analysis.wordCount,
  });

  if (error) throw new Error(`DB insert: ${error.message}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Deduplicate by name in case of list duplicates
  const companies = COMPANIES.filter(
    (c, i, arr) => arr.findIndex(x => x.name === c.name) === i
  );

  const total = companies.length;
  let succeeded = 0;
  let failed = 0;

  console.log(`\n🔍 whoreadtos scraper — ${total} companies\n`);

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const label = `${company.name} (${i + 1}/${total})`;

    process.stdout.write(`Analyzing ${label}...`);

    try {
      const text = await fetchTosText(company.tos_url);

      if (text.length < 100) {
        console.log(' ⚠ skipped (page too short, likely JS-rendered)');
        failed++;
      } else {
        const analysis = await analyzeText(text, company.tos_url);
        const companyId = await upsertCompany(company);
        await insertAnalysis(companyId, analysis);
        console.log(` ✓ grade ${analysis.score}`);
        succeeded++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(` ✗ ${msg}`);
      failed++;
    }

    if (i < companies.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  console.log(`\n✅ Done — ${succeeded} succeeded, ${failed} failed\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
