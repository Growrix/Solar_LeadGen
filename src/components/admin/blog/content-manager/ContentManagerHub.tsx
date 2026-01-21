'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import PostList from '@/components/admin/blog/content-manager/PostList';
import CategoryList from '@/components/admin/blog/content-manager/CategoryList';
import TagList from '@/components/admin/blog/content-manager/TagList';

type TabKey = 'posts' | 'categories' | 'tags';

function TabButton(props: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`px-4 py-2 rounded-full text-body-small shadow-neu-outset transition-colors ${
        props.active ? 'bg-background text-foreground' : 'bg-surface text-muted-foreground hover:text-foreground'
      }`}
    >
      {props.label}
    </button>
  );
}

export default function ContentManagerHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<TabKey>('posts');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading-1 text-foreground mb-2">Content Manager</h1>
          <p className="text-heading-4 text-muted-foreground">Posts, categories, and tags (prototype-mirror).</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => router.push('/admin/blog')}>
            All Posts
          </Button>
          <Button variant="primary" onClick={() => router.push('/admin/blog/new')}>
            New Post
          </Button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-neu-outset p-6 mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-body text-foreground">Workspace</div>
            <div className="text-body-small text-muted-foreground">
              Prototype-first: structure mirrored first, then tokenization.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <TabButton label="Posts" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
            <TabButton label="Categories" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
            <TabButton label="Tags" active={activeTab === 'tags'} onClick={() => setActiveTab('tags')} />
          </div>
        </div>
      </div>

      {activeTab === 'posts' ? <PostList /> : null}
      {activeTab === 'categories' ? <CategoryList /> : null}
      {activeTab === 'tags' ? <TagList /> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => router.push('/admin/blog/media')}>
          Media Library
        </Button>
        <Button variant="secondary" onClick={() => router.push('/admin/blog/comments')}>
          Comments
        </Button>
      </div>
    </div>
  );
}
