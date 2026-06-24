import { notFound } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/components/Nav';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';

interface Post {
  title: string;
  content: string;
  published_at: string | null;
  companies: { name: string; sector: string; logo_color: string } | null;
}

async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('title, content, published_at, companies(name, sector, logo_color)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;
  return data as unknown as Post;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post not found — Who Read ToS' };
  return {
    title: `${post.title} | Who Read ToS`,
    description: `${post.companies?.name ?? ''} Terms of Service and Privacy Policy analysis.`,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default async function BlogPost(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <Nav maxWidth="max-w-3xl" />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#1D9E75] transition-colors mb-8"
        >
          ← Back to blog
        </Link>

        <div
          className="h-1 rounded-full mb-8"
          style={{ backgroundColor: post.companies?.logo_color ?? '#1D9E75' }}
        />

        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-2">
            {post.companies?.name} · {post.companies?.sector}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">
            {post.title}
          </h1>
          {post.published_at && (
            <p className="text-sm text-gray-400 mt-3">{formatDate(post.published_at)}</p>
          )}
        </div>

        <div className="[&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_em]:text-gray-500 [&_em]:text-sm">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to blog
          </Link>
        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-gray-400 border-t border-gray-100 mt-6">
        <Link href="/" className="hover:text-[#1D9E75] transition-colors">← Who Read ToS</Link>
        <a href="https://ko-fi.com/wereadtos" target="_blank" rel="noopener noreferrer" className="hover:text-[#1D9E75]">
          ☕ Buy us a coffee
        </a>
      </footer>
    </div>
  );
}
