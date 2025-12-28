'use client';

import React from 'react';
import AdminBlogEditor from '@/components/admin/blog/AdminBlogEditor';

export default function AdminBlogPostEditorPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminBlogEditor postId={decodeURIComponent(params.id)} />
    </div>
  );
}
