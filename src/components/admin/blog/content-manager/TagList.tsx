'use client';

import React from 'react';
import {
  createAdminBlogTag,
  deleteAdminBlogTag,
  listAdminBlogTags,
  updateAdminBlogTag,
} from '@/lib/blog/adminApiClient';
import { TaxonomyManager, type TaxonomyItem } from '@/components/admin/blog/taxonomy/TaxonomyManager';

export function TagList() {
  const [items, setItems] = React.useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tags = await listAdminBlogTags();
      setItems(tags);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <TaxonomyManager
      title="Tags"
      items={items}
      loading={loading}
      error={error}
      onRefresh={() => {
        void refresh();
      }}
      onCreate={async (input) => {
        await createAdminBlogTag(input);
      }}
      onUpdate={async (id, patch) => {
        await updateAdminBlogTag(id, patch);
      }}
      onDelete={async (id) => {
        await deleteAdminBlogTag(id);
      }}
    />
  );
}
