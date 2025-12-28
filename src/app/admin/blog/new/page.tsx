'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDraftFromTemplate } from '@/lib/blog/cms-store';

export default function AdminBlogNewPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const draft = createDraftFromTemplate();
      router.replace(`/admin/blog/${encodeURIComponent(draft.id)}`);
    } catch (e) {
      console.error(e);
      setError('Failed to create draft.');
    }
  }, [router]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="theme-card p-6">
        <h1 className="text-heading-2 text-foreground mb-2">New post</h1>
        {error ? (
          <p className="text-body-small text-error">{error}</p>
        ) : (
          <p className="text-body-small text-muted-foreground">Creating draft…</p>
        )}
      </div>
    </div>
  );
}
