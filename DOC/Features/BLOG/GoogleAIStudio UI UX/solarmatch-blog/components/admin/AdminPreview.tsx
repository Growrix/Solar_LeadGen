
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, AlertCircle } from 'lucide-react';
import { AdminPost, ViewState } from '../../types';
import { useBlog } from '../../context/BlogContext';
import BlogPostDetail from '../BlogPostDetail';
import SkeletonDetail from '../SkeletonDetail';

interface AdminPreviewProps {
  id: string;
}

const AdminPreview: React.FC<AdminPreviewProps> = ({ id }) => {
  const { posts } = useBlog();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [post, setPost] = useState<AdminPost | null>(null);

  useEffect(() => {
    setViewState('loading');
    // Simulate fetch delay slightly to feel realistic
    setTimeout(() => {
      const found = posts.find(p => p.id === id);
      if (found) {
        setPost(found);
        setViewState('success');
      } else {
        setViewState('error');
      }
    }, 500);
  }, [id, posts]);

  const handleBackToEdit = () => {
    window.location.hash = `/admin/blog/${id}`;
  };

  const handlePublicBack = () => {
    window.location.hash = '#/admin/blog';
  };

  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-slate-900 text-white px-6 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-2 text-sm font-medium opacity-80">
             <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
             Loading Preview...
           </div>
        </div>
        <SkeletonDetail />
      </div>
    );
  }

  if (viewState === 'error' || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-50 flex items-center gap-4">
           <button onClick={handleBackToEdit} className="flex items-center gap-2 hover:text-solar-400 transition-colors">
             <ArrowLeft className="w-4 h-4" /> Back to Editor
           </button>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-red-50 p-4 rounded-full mb-4">
             <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Preview Not Available</h2>
          <p className="text-slate-500 mb-6">We couldn't find the post you requested.</p>
          <button 
            onClick={handleBackToEdit}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Return to Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Control Bar */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sticky top-0 z-50 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackToEdit}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-sm font-medium transition-all group"
          >
            <Edit2 className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Editor
          </button>
          <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
          <span className="text-slate-300 text-xs sm:text-sm hidden sm:flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${post.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            {post.status === 'published' ? 'Published Version' : 'Draft Preview'}
          </span>
        </div>
        <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-none">
          Viewing as Public User
        </div>
      </div>

      {/* Render the public component */}
      <div className="bg-white">
        <BlogPostDetail 
          initialPost={post} 
          onBack={handlePublicBack} 
        />
      </div>
    </div>
  );
};

export default AdminPreview;
