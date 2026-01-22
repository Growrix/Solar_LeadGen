'use client';

import React from 'react';
import {
  createAdminBlogCategory,
  deleteAdminBlogCategory,
  listAdminBlogCategories,
  updateAdminBlogCategory,
} from '@/lib/blog/adminApiClient';
import { TaxonomyManager, type TaxonomyItem } from '@/components/admin/blog/taxonomy/TaxonomyManager';

export function CategoryList() {
  const [items, setItems] = React.useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const categories = await listAdminBlogCategories();
      setItems(categories);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <TaxonomyManager
      title="Categories"
      items={items}
      loading={loading}
      error={error}
      onRefresh={() => {
        void refresh();
      }}
      onCreate={async (input) => {
        await createAdminBlogCategory(input);
      }}
      onUpdate={async (id, patch) => {
        await updateAdminBlogCategory(id, patch);
      }}
      onDelete={async (id) => {
        await deleteAdminBlogCategory(id);
      }}
    />
  );
}
