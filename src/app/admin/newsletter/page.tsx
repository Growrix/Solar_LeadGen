'use client';

import React from 'react';
import NewsletterTable from '@/components/admin/NewsletterTable';

export default function AdminNewsletterPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Title & Subtitle */}
      <div className="mb-8">
        <h1 className="text-heading-1 text-foreground mb-2">Newsletter Subscribers</h1>
        <p className="text-heading-4 text-muted-foreground">Manage and view all newsletter subscribers.</p>
      </div>
      <NewsletterTable />
    </div>
  );
}
