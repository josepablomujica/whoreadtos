import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'whoreadtos:rl:like',
});

const DEDUPE_TTL_SECONDS = 60 * 60 * 24 * 365;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests, please try again later.' }, { status: 429 });
  }

  let body: { visitorId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const visitorId = body.visitorId;
  if (!visitorId || typeof visitorId !== 'string' || visitorId.length > 100) {
    return NextResponse.json({ error: 'Missing or invalid visitorId' }, { status: 400 });
  }

  const { data: post, error: postError } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const dedupeKey = `whoreadtos:like:${slug}:${visitorId}`;
  const isFirstLike = await redis.set(dedupeKey, '1', { nx: true, ex: DEDUPE_TTL_SECONDS });
  if (!isFirstLike) {
    return NextResponse.json({ error: 'Already liked' }, { status: 409 });
  }

  const { data: newCount, error: rpcError } = await supabase.rpc('increment_post_like', {
    p_post_id: post.id,
  });

  if (rpcError) {
    return NextResponse.json({ error: 'Failed to record like' }, { status: 500 });
  }

  return NextResponse.json({ count: newCount });
}
