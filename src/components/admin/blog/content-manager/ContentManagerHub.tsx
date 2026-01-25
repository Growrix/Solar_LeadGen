'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, FolderOpen, MessageSquare, Tag, Users } from 'lucide-react';
import { PostList } from './PostList';
import { CategoryList } from './CategoryList';
import { TagList } from './TagList';
import { CommentsList } from './CommentsList';
import { AuthorList } from './AuthorList';

type TabKey = 'posts' | 'categories' | 'tags' | 'comments' | 'authors';

function isTabKey(value: string | null): value is TabKey {
  return value === 'posts' || value === 'categories' || value === 'tags' || value === 'comments' || value === 'authors';
}

export function ContentManagerHub() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = useMemo<TabKey>(() => {
    const tabParam = searchParams?.get('tab') ?? null;
    return isTabKey(tabParam) ? tabParam : 'posts';
  }, [searchParams]);

  const tabs: Array<{ id: TabKey; label: string; icon: React.ElementType }> = [
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'authors', label: 'Authors', icon: Users },
  ];

  const setTab = (tab: TabKey) => {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    next.set('tab', tab);
    router.replace(`?${next.toString()}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 pt-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Blog Manager</h1>
        <div className="flex space-x-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`
                  flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                  ${isActive 
                      ? 'border-solar-500 text-solar-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-0">
        {activeTab === 'posts' && <PostList isTabbed={true} />}
        {activeTab === 'categories' && <CategoryList isTabbed={true} />}
        {activeTab === 'tags' && <TagList isTabbed={true} />}
        {activeTab === 'comments' && <CommentsList isTabbed={true} />}
        {activeTab === 'authors' && <AuthorList isTabbed={true} />}
      </div>
    </div>
  );
}
