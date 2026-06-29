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

type Company = {
  name: string;
  sector: string;
  logo_color: string;
  tos_url: string;
  privacy_url?: string | null;
};

const COMPANIES: Company[] = [
  // Big Tech
  { name: 'Apple',            sector: 'Big Tech',       logo_color: '#555555', tos_url: 'https://www.apple.com/legal/internet-services/terms/site.html' },
  { name: 'Microsoft',        sector: 'Big Tech',       logo_color: '#00A4EF', tos_url: 'https://www.microsoft.com/en-us/servicesagreement/' },
  { name: 'Google',           sector: 'Big Tech',       logo_color: '#4285F4', tos_url: 'https://policies.google.com/terms' },
  { name: 'Amazon',           sector: 'Big Tech',       logo_color: '#FF9900', tos_url: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=508088' },
  { name: 'Meta',             sector: 'Big Tech',       logo_color: '#0082FB', tos_url: 'https://www.facebook.com/terms.php', privacy_url: 'https://mbasic.facebook.com/privacy/policy/?locale=en_US' },
  { name: 'Netflix',          sector: 'Big Tech',       logo_color: '#E50914', tos_url: 'https://help.netflix.com/legal/termsofuse' },
  { name: 'Tesla',            sector: 'Big Tech',       logo_color: '#CC0000', tos_url: 'https://www.tesla.com/legal/additional-resources/terms-and-conditions' },
  { name: 'NVIDIA',           sector: 'Semiconductors', logo_color: '#76B900', tos_url: 'https://www.nvidia.com/legal/' },
  // Cloud / SaaS
  { name: 'Salesforce',       sector: 'Cloud & SaaS',   logo_color: '#00A1E0', tos_url: 'https://www.salesforce.com/company/legal/agreements/', privacy_url: 'https://www.salesforce.com/company/privacy/' },
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
  { name: 'Zscaler',          sector: 'Cybersecurity',  logo_color: '#005DAA', tos_url: 'https://www.zscaler.com/legal/end-user-subscription-agreement' },
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
  { name: 'eBay',             sector: 'E-commerce',     logo_color: '#E53238', tos_url: 'https://www.ebay.com/help/policies/member-behaviour-policies/user-agreement?id=4259', privacy_url: 'https://www.ebay.com/help/policies/member-behaviour-policies/user-privacy-notice-ebays-global-privacy-notice?id=4260' },
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
  { name: 'IBM',              sector: 'Enterprise IT',  logo_color: '#1F70C1', tos_url: 'https://www.ibm.com/us-en/legal/terms-of-use', privacy_url: 'https://www.ibm.com/us-en/privacy' },
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
  { name: 'GitHub',           sector: 'Dev Tools',      logo_color: '#181717', tos_url: 'https://docs.github.com/en/site-policy/github-terms/github-terms-of-service', privacy_url: 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement' },
  { name: 'GitLab',           sector: 'Dev Tools',      logo_color: '#FC6D26', tos_url: 'https://about.gitlab.com/handbook/legal/subscription-agreement/', privacy_url: 'https://about.gitlab.com/privacy/' },
  { name: 'Figma',            sector: 'Productivity',   logo_color: '#F24E1E', tos_url: 'https://www.figma.com/legal/tos/' },
  { name: 'Notion',           sector: 'Productivity',   logo_color: '#000000', tos_url: 'https://www.notion.com/terms' },
  { name: 'Asana',            sector: 'Productivity',   logo_color: '#F06A6A', tos_url: 'https://asana.com/terms', privacy_url: 'https://asana.com/privacy' },
  { name: 'Monday.com',       sector: 'Productivity',   logo_color: '#FF3750', tos_url: 'https://monday.com/terms/' },
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
  { name: 'Databricks',       sector: 'Cloud & SaaS',   logo_color: '#FF3621', tos_url: 'https://www.databricks.com/legal/master-cloud-services-agreement' },
  { name: 'Twitch',           sector: 'Media & Music',  logo_color: '#9146FF', tos_url: 'https://www.twitch.tv/p/en/legal/terms-of-service/' },
  { name: 'Zoom (Phone)',     sector: 'Cloud & SaaS',   logo_color: '#2D8CFF', tos_url: 'https://explore.zoom.us/en/terms/' },
  // Big Tech (additional)
  { name: 'SAP',               sector: 'Big Tech',       logo_color: '#0070F2', tos_url: 'https://www.sap.com/about/legal/terms-of-use.html' },
  { name: 'Autodesk',          sector: 'Big Tech',       logo_color: '#E2621B', tos_url: 'https://www.autodesk.com/company/terms-of-use/en/general-terms' },
  { name: 'VMware',            sector: 'Big Tech',       logo_color: '#607078', tos_url: 'https://www.broadcom.com/company/legal/licensing' },
  { name: 'Cisco',             sector: 'Big Tech',       logo_color: '#049FD9', tos_url: 'https://www.cisco.com/c/en/us/about/legal/terms-conditions.html' },
  { name: 'Lenovo',            sector: 'Big Tech',       logo_color: '#E2231A', tos_url: 'https://www.lenovo.com/us/en/legal/' },
  { name: 'Samsung',           sector: 'Big Tech',       logo_color: '#1428A0', tos_url: 'https://www.samsung.com/us/common/legal/' },
  // Cloud & SaaS (additional)
  { name: 'Zendesk',           sector: 'Cloud & SaaS',   logo_color: '#03363D', tos_url: 'https://www.zendesk.com/company/agreements-and-terms/terms-of-use/' },
  { name: 'Freshworks',        sector: 'Cloud & SaaS',   logo_color: '#25C16F', tos_url: 'https://www.freshworks.com/terms/' },
  { name: 'Airtable',          sector: 'Cloud & SaaS',   logo_color: '#2D7FF9', tos_url: 'https://www.airtable.com/company/tos' },
  { name: 'Calendly',          sector: 'Cloud & SaaS',   logo_color: '#006BFF', tos_url: 'https://calendly.com/legal/customer-terms-conditions' },
  { name: 'Miro',              sector: 'Cloud & SaaS',   logo_color: '#FFD02F', tos_url: 'https://miro.com/legal/terms-of-service/' },
  { name: 'Squarespace',       sector: 'Cloud & SaaS',   logo_color: '#000000', tos_url: 'https://www.squarespace.com/terms-of-service' },
  { name: 'Wix',               sector: 'Cloud & SaaS',   logo_color: '#0C6EFC', tos_url: 'https://www.wix.com/about/terms-of-use' },
  // Cybersecurity (additional)
  { name: 'Rapid7',            sector: 'Cybersecurity',  logo_color: '#E44C28', tos_url: 'https://www.rapid7.com/legal/website-terms-of-use/' },
  { name: 'Tenable',           sector: 'Cybersecurity',  logo_color: '#00B4E0', tos_url: 'https://www.tenable.com/legal' },
  { name: 'SentinelOne',       sector: 'Cybersecurity',  logo_color: '#7000FF', tos_url: 'https://www.sentinelone.com/legal/terms-of-service/' },
  { name: 'NortonLifeLock',    sector: 'Cybersecurity',  logo_color: '#FDB814', tos_url: 'https://us.norton.com/legal' },
  { name: 'McAfee',            sector: 'Cybersecurity',  logo_color: '#C01818', tos_url: 'https://home.mcafee.com/supportpages/termsandconditions.aspx', privacy_url: 'https://www.mcafee.com/en-us/consumer-support/policy/legal.html' },
  { name: 'Bitdefender',       sector: 'Cybersecurity',  logo_color: '#ED1C24', tos_url: 'https://www.bitdefender.com/en-us/site/view/subscription-agreement-and-terms-of-services-for-home-user-solutions' },
  { name: 'Kaspersky',         sector: 'Cybersecurity',  logo_color: '#006D5C', tos_url: 'https://www.kaspersky.com/terms-of-use' },
  { name: 'Proofpoint',        sector: 'Cybersecurity',  logo_color: '#3B3E44', tos_url: 'https://login.proofpoint.com/termsconditions/', privacy_url: 'https://www.proofpoint.com/us/legal/privacy-policy' },
  { name: 'Trend Micro',       sector: 'Cybersecurity',  logo_color: '#D71920', tos_url: 'https://www.trendmicro.com/en_us/about/legal/terms-of-use.html' },
  { name: 'Proton',            sector: 'Cybersecurity',  logo_color: '#6D4AFF', tos_url: 'https://proton.me/legal/terms' },
  { name: 'DuckDuckGo',        sector: 'Cybersecurity',  logo_color: '#DE5833', tos_url: 'https://duckduckgo.com/terms' },
  { name: 'Signal',            sector: 'Cybersecurity',  logo_color: '#3A76F0', tos_url: 'https://signal.org/legal/' },
  { name: 'NordVPN',           sector: 'Cybersecurity',  logo_color: '#4687FF', tos_url: 'https://nordvpn.com/terms-of-service/' },
  { name: 'ExpressVPN',        sector: 'Cybersecurity',  logo_color: '#DA3940', tos_url: 'https://www.expressvpn.com/tos' },
  { name: 'Tor Project',       sector: 'Cybersecurity',  logo_color: '#7D4698', tos_url: 'https://www.torproject.org/about/privacy_policy/' },
  // Dev Tools (additional)
  { name: 'Vercel',            sector: 'Dev Tools',      logo_color: '#000000', tos_url: 'https://vercel.com/legal/terms' },
  { name: 'JetBrains',         sector: 'Dev Tools',      logo_color: '#000000', tos_url: 'https://www.jetbrains.com/legal/docs/company/useterms/' },
  { name: 'Postman',           sector: 'Dev Tools',      logo_color: '#FF6C37', tos_url: 'https://www.postman.com/legal/terms/' },
  { name: 'Docker',            sector: 'Dev Tools',      logo_color: '#2496ED', tos_url: 'https://www.docker.com/legal/docker-terms-service/' },
  { name: 'Heroku',            sector: 'Dev Tools',      logo_color: '#430098', tos_url: 'https://www.heroku.com/policy/agreements/' },
  { name: 'DigitalOcean',      sector: 'Dev Tools',      logo_color: '#0080FF', tos_url: 'https://www.digitalocean.com/legal/terms-of-service-agreement' },
  { name: 'New Relic',         sector: 'Dev Tools',      logo_color: '#008C99', tos_url: 'https://newrelic.com/termsandconditions/terms', privacy_url: 'https://newrelic.com/termsandconditions/privacy' },
  { name: 'PagerDuty',         sector: 'Dev Tools',      logo_color: '#06AC38', tos_url: 'https://www.pagerduty.com/terms-of-service/' },
  { name: 'Sentry',            sector: 'Dev Tools',      logo_color: '#362D59', tos_url: 'https://sentry.io/terms/' },
  { name: 'CircleCI',          sector: 'Dev Tools',      logo_color: '#343434', tos_url: 'https://circleci.com/legal/terms-of-use' },
  { name: 'Bitbucket',         sector: 'Dev Tools',      logo_color: '#0052CC', tos_url: 'https://www.atlassian.com/legal/atlassian-customer-agreement' },
  // E-commerce (additional)
  { name: 'Wayfair',           sector: 'E-commerce',     logo_color: '#7F187F', tos_url: 'https://www.wayfair.com/terms?section=terms-of-use', privacy_url: 'https://www.wayfair.com/terms?section=privacy-policy' },
  { name: 'Chewy',             sector: 'E-commerce',     logo_color: '#0054A6', tos_url: 'https://www.chewy.com/app/content/terms' },
  { name: 'Instacart',         sector: 'E-commerce',     logo_color: '#43B02A', tos_url: 'https://www.instacart.com/terms' },
  { name: 'Walmart',           sector: 'E-commerce',     logo_color: '#0071CE', tos_url: 'https://www.walmart.com/help/article/walmart-com-terms-of-use/3b75080af40340d6bbd596f116fae5a0' },
  { name: 'Target',            sector: 'E-commerce',     logo_color: '#CC0000', tos_url: 'https://www.target.com/c/terms-conditions/-/n-4sr7l' },
  { name: 'Best Buy',          sector: 'E-commerce',     logo_color: '#003087', tos_url: 'https://www.bestbuy.com/site/help-topics/terms-and-conditions/pcmcat204400050067.c?id=pcmcat204400050067', privacy_url: 'https://www.bestbuy.com/site/help-topics/privacy-policy/pcmcat204400050062.c?id=pcmcat204400050062' },
  // Marketplace (additional)
  { name: 'Booking.com',       sector: 'Marketplace',    logo_color: '#003580', tos_url: 'https://www.booking.com/content/terms.html' },
  { name: 'Expedia',           sector: 'Marketplace',    logo_color: '#00355F', tos_url: 'https://www.expedia.com/lp/b/terms-of-service' },
  { name: 'Fiverr',            sector: 'Marketplace',    logo_color: '#1DBF73', tos_url: 'https://www.fiverr.com/legal-portal/legal-terms/terms-of-service' },
  { name: 'Upwork',            sector: 'Marketplace',    logo_color: '#14A800', tos_url: 'https://www.upwork.com/legal' },
  { name: 'TaskRabbit',        sector: 'Marketplace',    logo_color: '#00823E', tos_url: 'https://support.taskrabbit.com/hc/en-us/articles/360008913792-Taskrabbit-s-Terms-of-Service' },
  { name: 'Poshmark',          sector: 'Marketplace',    logo_color: '#C02B61', tos_url: 'https://poshmark.com/terms' },
  // EdTech (additional)
  { name: 'Chegg',             sector: 'EdTech',         logo_color: '#F26522', tos_url: 'https://www.chegg.com/en-US/termsofuse/' },
  { name: 'Khan Academy',      sector: 'EdTech',         logo_color: '#14BF96', tos_url: 'https://www.khanacademy.org/about/tos', privacy_url: 'https://www.khanacademy.org/about/privacy-policy' },
  { name: 'Skillshare',        sector: 'EdTech',         logo_color: '#00C07B', tos_url: 'https://legal.skillshare.com/hc/en-us/articles/27194932901645-Skillshare-Terms-of-Service' },
  { name: 'MasterClass',       sector: 'EdTech',         logo_color: '#000000', tos_url: 'https://www.masterclass.com/terms' },
  { name: 'Brainly',           sector: 'EdTech',         logo_color: '#B43AD2', tos_url: 'https://brainly.com/pages/terms_of_use' },
  // Fintech (additional)
  { name: 'Coinbase',          sector: 'Fintech',        logo_color: '#0052FF', tos_url: 'https://www.coinbase.com/legal/user_agreement/united_states' },
  { name: 'Robinhood',         sector: 'Fintech',        logo_color: '#00C805', tos_url: 'https://robinhood.com/us/en/about/legal/' },
  { name: 'Venmo',             sector: 'Fintech',        logo_color: '#3D95CE', tos_url: 'https://venmo.com/legal/us-user-agreement' },
  { name: 'Wise',              sector: 'Fintech',        logo_color: '#00B9FF', tos_url: 'https://wise.com/us/legal/terms-of-use-us2', privacy_url: 'https://wise.com/gb/legal/privacy-notices' },
  { name: 'Revolut',           sector: 'Fintech',        logo_color: '#0075EB', tos_url: 'https://www.revolut.com/en-US/legal/terms/' },
  { name: 'Affirm',            sector: 'Fintech',        logo_color: '#000000', tos_url: 'https://www.affirm.com/disclosures' },
  { name: 'Klarna',            sector: 'Fintech',        logo_color: '#FFB3C7', tos_url: 'https://www.klarna.com/us/terms-of-use/', privacy_url: 'https://www.klarna.com/us/privacy/' },
  { name: 'Plaid',             sector: 'Fintech',        logo_color: '#000000', tos_url: 'https://plaid.com/legal/terms-of-use/' },
  { name: 'Chime',             sector: 'Fintech',        logo_color: '#00D4AA', tos_url: 'https://www.chime.com/policies/chime/chime-user-agreement/' },
  { name: 'SoFi',              sector: 'Fintech',        logo_color: '#9D5BD2', tos_url: 'https://www.sofi.com/terms-of-use/' },
  // Social Media (additional)
  { name: 'Tumblr',            sector: 'Social Media',   logo_color: '#35465C', tos_url: 'https://www.tumblr.com/policy/en/terms-of-service' },
  { name: 'Nextdoor',          sector: 'Social Media',   logo_color: '#00B246', tos_url: 'https://nextdoor.com/terms/' },
  // Media & Music (additional)
  { name: 'Disney+',           sector: 'Media & Music',  logo_color: '#113CCF', tos_url: 'https://www.disneyplus.com/welcome/subscriber-agreement' },
  { name: 'YouTube',           sector: 'Media & Music',  logo_color: '#FF0000', tos_url: 'https://www.youtube.com/t/terms' },
  { name: 'SoundCloud',        sector: 'Media & Music',  logo_color: '#FF5500', tos_url: 'https://pages.soundcloud.com/terms-of-use' },
  { name: 'Hulu',              sector: 'Media & Music',  logo_color: '#1CE783', tos_url: 'https://www.disneyplus.com/welcome/subscriber-agreement' },
  { name: 'Max',               sector: 'Media & Music',  logo_color: '#002BE7', tos_url: 'https://www.max.com/terms-of-use' },
  { name: 'Paramount+',        sector: 'Media & Music',  logo_color: '#0064FF', tos_url: 'https://legal.paramount.com/us/en/pplus/termsofuse' },
  { name: 'Audible',           sector: 'Media & Music',  logo_color: '#F8991C', tos_url: 'https://www.audible.com/legal/conditions-of-use' },
  { name: 'Pandora',           sector: 'Media & Music',  logo_color: '#3668FF', tos_url: 'https://www.pandora.com/legal/' },
  // Gaming (additional)
  { name: 'Valve (Steam)',     sector: 'Gaming',         logo_color: '#1B2838', tos_url: 'https://store.steampowered.com/subscriber_agreement/' },
  { name: 'Activision Blizzard', sector: 'Gaming',       logo_color: '#000000', tos_url: 'https://www.activisionblizzard.com/legal/terms-of-use' },
  { name: 'Riot Games',        sector: 'Gaming',         logo_color: '#D13639', tos_url: 'https://www.riotgames.com/en/terms-of-service' },
  { name: 'Ubisoft',           sector: 'Gaming',         logo_color: '#0070C1', tos_url: 'https://www.ubisoft.com/legal/documents/termsofuse/en-US' },
  { name: 'Nintendo',          sector: 'Gaming',         logo_color: '#E4000F', tos_url: 'https://www.nintendo.com/us/terms-of-use/' },
  { name: 'PlayStation',       sector: 'Gaming',         logo_color: '#003087', tos_url: 'https://www.playstation.com/en-us/legal/terms-of-service/' },
  { name: 'Xbox',              sector: 'Gaming',         logo_color: '#107C10', tos_url: 'https://www.xbox.com/en-US/legal/xboxapptou' },
  // Productivity (additional)
  { name: 'Trello',            sector: 'Productivity',   logo_color: '#0052CC', tos_url: 'https://www.atlassian.com/legal/atlassian-customer-agreement', privacy_url: 'https://www.atlassian.com/legal/privacy-policy' },
  { name: 'Evernote',          sector: 'Productivity',   logo_color: '#00A82D', tos_url: 'https://evernote.com/legal/terms-of-service' },
  { name: 'ClickUp',           sector: 'Productivity',   logo_color: '#7B68EE', tos_url: 'https://clickup.com/terms' },
  { name: 'Basecamp',          sector: 'Productivity',   logo_color: '#1CC27D', tos_url: 'https://37signals.com/policies/terms' },
  { name: 'Todoist',           sector: 'Productivity',   logo_color: '#DB4035', tos_url: 'https://doist.com/terms-of-service' },
  { name: 'Coda',              sector: 'Productivity',   logo_color: '#FF4F00', tos_url: 'https://coda.io/trust/tos', privacy_url: 'https://coda.io/trust/privacy' },
  // Enterprise IT (additional)
  { name: 'Workato',           sector: 'Enterprise IT',  logo_color: '#16335C', tos_url: 'https://www.workato.com/terms' },
  { name: 'Zoho',              sector: 'Enterprise IT',  logo_color: '#E42527', tos_url: 'https://www.zoho.com/terms.html' },
  { name: 'Citrix',            sector: 'Enterprise IT',  logo_color: '#452170', tos_url: 'https://www.cloud.com/terms-of-use' },
  { name: 'Nutanix',           sector: 'Enterprise IT',  logo_color: '#024DA1', tos_url: 'https://www.nutanix.com/legal/terms-of-use' },
  { name: 'Pure Storage',      sector: 'Enterprise IT',  logo_color: '#FF6600', tos_url: 'https://www.purestorage.com/legal.html' },
  { name: 'NetApp',            sector: 'Enterprise IT',  logo_color: '#0067C5', tos_url: 'https://www.netapp.com/company/legal/terms-of-use/' },
  { name: 'Juniper Networks',  sector: 'Enterprise IT',  logo_color: '#84B135', tos_url: 'https://www.juniper.net/us/en/legal-notices.html' },
  // Telecom (additional)
  { name: 'Charter Spectrum',  sector: 'Telecom',        logo_color: '#0099D8', tos_url: 'https://www.spectrum.com/policies/terms-of-service' },
  { name: 'Vodafone',          sector: 'Telecom',        logo_color: '#E60000', tos_url: 'https://www.vodafone.com/site-services/terms-and-condition' },
  // Semiconductors (additional)
  { name: 'ARM',               sector: 'Semiconductors', logo_color: '#0091BD', tos_url: 'https://www.arm.com/company/policies/terms-and-conditions' },
  // Privacy Tools
  { name: 'whoreadtos',        sector: 'Privacy Tools',  logo_color: '#1D9E75', tos_url: 'https://whoreadtos.com/terms', privacy_url: 'https://whoreadtos.com/privacy' },
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

async function fetchHtml(url: string): Promise<string> {
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

  return html;
}

async function fetchDocText(url: string): Promise<string> {
  return stripHtml(await fetchHtml(url));
}

const PRIVACY_TERMS = [
  'privacy policy',
  'privacy notice',
  'privacy statement',
  'data privacy',
  'privacy',
];

function discoverPrivacyUrl(html: string, baseUrl: string): string | null {
  const anchorRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  const links: Array<{ href: string; text: string }> = [];

  while ((m = anchorRe.exec(html)) !== null) {
    const hrefMatch = /href=["']?([^"'\s>]+)["']?/i.exec(m[1]);
    if (!hrefMatch) continue;
    const href = hrefMatch[1].trim();
    if (!href || /^(javascript:|mailto:|#)/i.test(href)) continue;
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    links.push({ href, text });
  }

  for (const term of PRIVACY_TERMS) {
    const hyphen = term.replace(/\s+/g, '-');
    const under  = term.replace(/\s+/g, '_');
    for (const { href, text } of links) {
      const h = href.toLowerCase();
      if (text.includes(term) || h.includes(hyphen) || h.includes(under)) {
        try { return new URL(href, baseUrl).href; } catch { /* URL inválida, skip */ }
      }
    }
  }

  return null;
}

async function analyzeText(text: string, url: string) {
  const truncated = text.slice(0, 30_000);
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

async function upsertCompany(company: Company) {
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
  const only = process.env.ONLY?.split(',').map(s => s.trim().toLowerCase());

  const { data: dbRows } = await supabase
    .from('companies')
    .select('name, privacy_url');
  const privacyMap = new Map<string, string | null>(
    (dbRows ?? []).map(r => [r.name, r.privacy_url as string | null])
  );

  type PrivacySource = 'array' | 'db' | 'discovered' | 'none';
  const companies = COMPANIES
    .filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i)
    .filter(c => !only || only.includes(c.name.toLowerCase()))
    .map(c => {
      const fromArray = c.privacy_url ?? null;
      const fromDb    = privacyMap.get(c.name) ?? null;
      return {
        ...c,
        privacy_url:   fromArray ?? fromDb ?? null,
        privacySource: (fromArray ? 'array' : fromDb ? 'db' : 'none') as PrivacySource,
      };
    });

  const total = companies.length;
  let succeeded = 0;
  let failed = 0;

  console.log(`\n🔍 whoreadtos scraper — ${total} companies\n`);

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const label = `${company.name} (${i + 1}/${total})`;

    process.stdout.write(`Analyzing ${label}...`);

    try {
      const tosHtml = await fetchHtml(company.tos_url);
      const tosText = stripHtml(tosHtml);

      if (tosText.length < 100) {
        console.log(' ⚠ skipped (page too short, likely JS-rendered)');
        failed++;
      } else {
        let privacyUrl    = company.privacy_url;
        let privacySource: PrivacySource = company.privacySource;

        if (!privacyUrl) {
          const discovered = discoverPrivacyUrl(tosHtml, company.tos_url);
          if (discovered) {
            privacyUrl    = discovered;
            privacySource = 'discovered';
          }
        }

        if (privacySource === 'discovered') {
          process.stdout.write(` [privacy: discovered → ${privacyUrl}]`);
        } else if (privacySource !== 'none') {
          process.stdout.write(` [privacy: ${privacySource}]`);
        } else {
          process.stdout.write(' [privacy: not found — manual review]');
        }

        let privacyText: string | null = null;
        if (privacyUrl) {
          try {
            const raw = await fetchDocText(privacyUrl);
            if (raw.length >= 100) privacyText = raw;
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            process.stdout.write(` [privacy fetch: ${msg}]`);
          }
        }

        const tosSlice = tosText.slice(0, 15_000);
        const combined = privacyText
          ? `=== TERMS OF SERVICE ===\n${tosSlice}\n\n=== PRIVACY POLICY ===\n${privacyText.slice(0, 15_000)}`
          : tosSlice;

        const analysis  = await analyzeText(combined, company.tos_url);
        const { privacySource: _ps, ...companyData } = company;
        const companyId = await upsertCompany({ ...companyData, privacy_url: privacyUrl });
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
