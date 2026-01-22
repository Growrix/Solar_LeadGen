
import React from 'react';
import AdminPostList from './AdminPostList';
import AdminCategoryList from './AdminCategoryList';
import AdminTagList from './AdminTagList';
import AdminCommentsList from './AdminCommentsList';
import AdminAuthorList from './AdminAuthorList';
import { FileText, FolderOpen, Tag, MessageSquare, Users } from 'lucide-react';

interface BlogEngineProps {
  currentRoute: string;
}

const BlogEngine: React.FC<BlogEngineProps> = ({ currentRoute }) => {
  // Determine active tab based on route
  let activeTab = 'posts';
  if (currentRoute.includes('/categories')) activeTab = 'categories';
  else if (currentRoute.includes('/tags')) activeTab = 'tags';
  else if (currentRoute.includes('/comments')) activeTab = 'comments';
  else if (currentRoute.includes('/authors')) activeTab = 'authors';
  // Note: '/trash' route defaults to 'posts' activeTab, which is handled by AdminPostList

  const tabs = [
    { id: 'posts', label: 'Posts', icon: FileText, route: '#/admin/blog' },
    { id: 'categories', label: 'Categories', icon: FolderOpen, route: '#/admin/blog/categories' },
    { id: 'tags', label: 'Tags', icon: Tag, route: '#/admin/blog/tags' },
    { id: 'comments', label: 'Comments', icon: MessageSquare, route: '#/admin/blog/comments' },
    { id: 'authors', label: 'Authors', icon: Users, route: '#/admin/blog/authors' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
       {/* Engine Header / Tabs */}
       <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 pt-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Blog Manager</h1>
          <div className="flex space-x-6 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => window.location.hash = tab.route}
                  className={`
                    flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${isActive 
                      ? 'border-solar-500 text-solar-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
       </div>

       {/* Content */}
       <div className="p-0">
          {activeTab === 'posts' && <AdminPostList isTabbed={true} currentRoute={currentRoute} />}
          {activeTab === 'categories' && <AdminCategoryList isTabbed={true} />}
          {activeTab === 'tags' && <AdminTagList isTabbed={true} />}
          {activeTab === 'comments' && <AdminCommentsList isTabbed={true} />}
          {activeTab === 'authors' && <AdminAuthorList isTabbed={true} />}
       </div>
    </div>
  );
};

export default BlogEngine;
