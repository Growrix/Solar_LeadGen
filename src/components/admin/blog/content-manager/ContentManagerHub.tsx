'use client';

import React from 'react';
import Button from '@/components/Button';
import { PostList } from '@/components/admin/blog/content-manager/PostList';
import { CategoryList } from '@/components/admin/blog/content-manager/CategoryList';
import { TagList } from '@/components/admin/blog/content-manager/TagList';

type TabKey = 'POSTS' | 'CATEGORIES' | 'TAGS';

export function ContentManagerHub() {
  const [active, setActive] = React.useState<TabKey>('POSTS');

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'POSTS', label: 'Posts' },
    { key: 'CATEGORIES', label: 'Categories' },
    { key: 'TAGS', label: 'Tags' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl shadow-neu-outset p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                className={
                  active === t.key
                    ? 'btn-neu px-3 py-2 text-ui shadow-neu-inset'
                    : 'btn-neu px-3 py-2 text-ui'
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = '/admin/blog/new';
              }}
            >
              New Post
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = '/admin/blog';
              }}
            >
              Existing Blog Pages
            </Button>
          </div>
        </div>
      </div>

      {active === 'POSTS' ? <PostList /> : null}
      {active === 'CATEGORIES' ? <CategoryList /> : null}
      {active === 'TAGS' ? <TagList /> : null}
    </div>
  );
}
