import Link from 'next/link';
import Nav from '@/app/components/Nav';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Who Read ToS',
  description: 'Plain-language breakdowns of Terms of Service and Privacy Policies.',
};

const GRADE_STYLE: Record<string, string> = {
  A: 'bg-[#1D9E75] text-white',
  B: 'bg-[#7CBE42] text-white',
  C: 'bg-[#F5C518] text-gray-900',
  D: 'bg-[#F07C28] text-white',
  F: 'bg-[#E53E3E] text-white',
};

interface Post {
  slug: string;
  title: string;
  published_at: string;
  companies: { name: string; sector: string; logo_color: string } | null;
  analyses: { score: string } | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, title, published_at, companies(name, sector, logo_color), analyses!blog_posts_analysis_id_fkey(score)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error || !data) return [];
  return data as unknown as Post[];
}

export default async function BlogIndex() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <Nav />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Blog</h1>
          <p className="mt-2 text-gray-500">
            {posts.length > 0
              ? `${posts.length} plain-language breakdown${posts.length === 1 ? '' : 's'} of Terms of Service and Privacy Policies`
              : 'Plain-language breakdowns of Terms of Service and Privacy Policies.'}
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No posts yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <div className="h-full rounded-xl border border-gray-100 group-hover:border-gray-200 group-hover:shadow-sm transition-all overflow-hidden flex flex-col">
                  <div className="h-1 flex-shrink-0" style={{ backgroundColor: post.companies?.logo_color ?? '#1D9E75' }} />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">{post.companies?.sector}</span>
                      {post.analyses?.score && (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${GRADE_STYLE[post.analyses.score] ?? 'bg-gray-200 text-gray-600'}`}>
                          {post.analyses.score}
                        </span>
                      )}
                    </div>
                    <h2 className="font-semibold text-gray-900 leading-snug line-clamp-3 flex-1">
                      {post.title}
                    </h2>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">
                      <span className="font-medium text-gray-500">{post.companies?.name}</span>
                      <span>{post.published_at ? formatDate(post.published_at) : ''}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-gray-400 border-t border-gray-100 mt-10">
        <Link href="/" className="hover:text-[#1D9E75] transition-colors">← Who Read ToS</Link>
        <a href="https://ko-fi.com/wereadtos" target="_blank" rel="noopener noreferrer" className="hover:text-[#1D9E75]">
          This is free and we don&apos;t sell your data. If it helped, want to buy us a coffee?
        </a>
      </footer>
    </div>
  );
}
