
import React, { useState } from 'react';
import { NavigationTab, BlogPost } from './types';
import { INITIAL_POSTS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PostList from './components/PostList';
import Editor from './components/Editor';
import Comments from './components/Comments';
import Taxonomy from './components/Taxonomy';
import MediaLibrary from './components/MediaLibrary';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Dashboard);
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setActiveTab(NavigationTab.Editor);
  };

  const handleCreateNew = () => {
    setEditingPost(null);
    setActiveTab(NavigationTab.Editor);
  };

  const handleSavePost = (savedPost: BlogPost) => {
    setPosts((prev) => {
      const exists = prev.find(p => p.id === savedPost.id);
      if (exists) {
        return prev.map(p => p.id === savedPost.id ? savedPost : p);
      }
      return [savedPost, ...prev];
    });
    setActiveTab(NavigationTab.Posts);
  };

  const renderContent = () => {
    switch (activeTab) {
      case NavigationTab.Dashboard:
        return <Dashboard />;
      case NavigationTab.Posts:
        return <PostList posts={posts} onEdit={handleEditPost} onCreateNew={handleCreateNew} />;
      case NavigationTab.Editor:
        return <Editor post={editingPost} onSave={handleSavePost} onCancel={() => setActiveTab(NavigationTab.Posts)} />;
      case NavigationTab.Comments:
        return <Comments />;
      case NavigationTab.Taxonomy:
        return <Taxonomy />;
      case NavigationTab.Media:
        return <MediaLibrary />;
      case NavigationTab.Settings:
        return (
          <div className="max-w-2xl bg-white p-8 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold mb-6">CMS Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Site Title</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg" defaultValue="Lumina Blog" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Email</label>
                <input type="email" className="w-full px-4 py-2 border rounded-lg" defaultValue="admin@lumina.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">API Endpoint</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg bg-gray-50" readOnly value="https://api.lumina.cms/v1" />
              </div>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Save Settings</button>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  const getTabLabel = (tab: NavigationTab) => {
    switch(tab) {
      case NavigationTab.Taxonomy: return "Categories & Tags";
      case NavigationTab.Media: return "Media Library";
      default: return tab.charAt(0).toUpperCase() + tab.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 flex flex-col">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getTabLabel(activeTab)}</h2>
            <p className="text-sm text-gray-500">Managing content with Lumina CMS intelligence.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative group hidden sm:block">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors relative">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 animate-in fade-in duration-700">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
