'use client';

import { useEffect } from 'react';

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || !slug) return;

    fetch(`${apiUrl}/blog-posts/public/${encodeURIComponent(slug)}/view`, {
      method: 'POST',
    }).catch(() => undefined);
  }, [slug]);

  return null;
}
