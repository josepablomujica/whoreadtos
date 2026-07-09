'use client';

import { useState, useSyncExternalStore } from 'react';

function getVisitorId(): string {
  const key = 'wrt_visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// localStorage never changes from outside this tab, so there's nothing to subscribe to —
// re-renders after handleLike writes to it are what surface the new value.
function subscribe() {
  return () => {};
}

export default function LikeButton({ slug, initialCount }: { slug: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const liked = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(`wrt_liked_${slug}`) === '1',
    () => false
  );

  async function handleLike() {
    if (liked || loading) return;

    setLoading(true);
    localStorage.setItem(`wrt_liked_${slug}`, '1');
    setCount(c => c + 1);

    try {
      const res = await fetch(`/api/blog/${slug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: getVisitorId() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') setCount(data.count);
      } else if (res.status !== 409) {
        // real failure (not "already liked") — roll back the optimistic update
        localStorage.removeItem(`wrt_liked_${slug}`);
        setCount(c => c - 1);
      }
    } catch {
      localStorage.removeItem(`wrt_liked_${slug}`);
      setCount(c => c - 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={liked || loading}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:cursor-default ${
        liked ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 22V11M2 13v7a2 2 0 0 0 2 2h13.4a2 2 0 0 0 2-1.7l1.4-9A2 2 0 0 0 18.8 9H14V4a2 2 0 0 0-2-2 1 1 0 0 0-1 1 9.7 9.7 0 0 1-2.2 5.4L7 11" />
      </svg>
      {liked ? 'Liked' : 'Like'}
      {count > 0 && <span className="text-xs text-gray-400">{count}</span>}
    </button>
  );
}
