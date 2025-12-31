'use client';

import React from 'react';
import Button from '@/components/Button';
import {
  createAdminBlogCategory,
  createAdminBlogTag,
  deleteAdminBlogCategory,
  deleteAdminBlogTag,
  listAdminBlogCategories,
  listAdminBlogTags,
  updateAdminBlogCategory,
  updateAdminBlogTag,
  type AdminBlogCategory,
  type AdminBlogTag,
} from '@/lib/blog/adminApiClient';
import { TaxonomyManager, type TaxonomyItem } from '@/components/admin/blog/taxonomy/TaxonomyManager';

function mapItem(value: AdminBlogCategory | AdminBlogTag): TaxonomyItem {
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
  };
}

export default function AdminBlogTaxonomyPage() {
  const [categories, setCategories] = React.useState<TaxonomyItem[]>([]);
  const [tags, setTags] = React.useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const [cats, ts] = await Promise.all([listAdminBlogCategories(), listAdminBlogTags()]);
      setCategories(cats.map(mapItem));
      setTags(ts.map(mapItem));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load taxonomy');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading-1 text-foreground mb-2">Taxonomy</h1>
          <p className="text-heading-4 text-muted-foreground">Manage categories and tags.</p>
        </div>

        <Button variant="secondary" onClick={() => void refresh()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="bg-error/10 border border-error/20 rounded-2xl p-6 shadow-neu-inset mb-6">
          <div className="text-heading-4 text-error">Unable to load taxonomy</div>
          <div className="text-body-small text-muted-foreground mt-2">{error}</div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaxonomyManager
          title="Categories"
          items={categories}
          loading={loading}
          error={null}
          onRefresh={refresh}
          onCreate={async ({ name }) => {
            await createAdminBlogCategory({ name });
          }}
          onUpdate={async (id, patch) => {
            await updateAdminBlogCategory(id, { name: patch.name });
          }}
          onDelete={async (id) => {
            await deleteAdminBlogCategory(id);
          }}
        />

        <TaxonomyManager
          title="Tags"
          items={tags}
          loading={loading}
          error={null}
          onRefresh={refresh}
          onCreate={async ({ name }) => {
            await createAdminBlogTag({ name });
          }}
          onUpdate={async (id, patch) => {
            await updateAdminBlogTag(id, { name: patch.name });
          }}
          onDelete={async (id) => {
            await deleteAdminBlogTag(id);
          }}
        />
      </div>
    </div>
  );
}
