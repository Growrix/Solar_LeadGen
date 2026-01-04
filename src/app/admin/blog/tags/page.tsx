'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

export default function AdminBlogTagsPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading-1 text-foreground mb-2">Blog Tags</h1>
          <p className="text-heading-4 text-muted-foreground">Tag management is coming next.</p>
        </div>

        <Button variant="secondary" onClick={() => router.push('/admin/blog')}>
          Back
        </Button>
      </div>

      <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
        <p className="text-body text-muted-foreground">This page is a placeholder for Phase 2.</p>
      </div>
    </div>
  );
}
