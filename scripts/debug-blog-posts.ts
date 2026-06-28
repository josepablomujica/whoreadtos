import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL              = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY        = process.env.SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
  console.error('Missing env vars. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ANON_KEY.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anon  = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('\n=== 1. Últimos 5 blog_posts (service_role — sin RLS) ===');
  const { data: allPosts, error: e1 } = await admin
    .from('blog_posts')
    .select('id, company_id, analysis_id, slug, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (e1) console.error('Error:', e1.message);
  else console.table(allPosts);

  console.log('\n=== 2. Misma query con ANON key (como la ve el web app) ===');
  const { data: anonPosts, error: e2 } = await anon
    .from('blog_posts')
    .select('slug, title, published_at, companies(name, sector, logo_color), analyses!blog_posts_analysis_id_fkey(score)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5);

  if (e2) console.error('Error con anon key:', e2.message);
  else {
    console.log(`Registros visibles con anon key: ${anonPosts?.length ?? 0}`);
    console.table(anonPosts?.map(p => ({ slug: p.slug, published_at: p.published_at, company: (p.companies as any)?.name })));
  }

  console.log('\n=== 3. RLS policies en blog_posts ===');
  const { data: policies, error: e3 } = await admin
    .from('pg_policies')
    .select('policyname, cmd, qual')
    .eq('tablename', 'blog_posts');

  if (e3) {
    // pg_policies no es accesible via PostgREST — usar SQL directo
    const { data: rls, error: e3b } = await admin.rpc('check_blog_rls');
    if (e3b) console.log('(RLS check no disponible vía RPC — verificar en Supabase dashboard)');
    else console.table(rls);
  } else {
    console.table(policies);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
