
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Link as LinkIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { BlogPost, ViewState } from '../types';
import { MOCK_POSTS } from '../constants';
import SkeletonDetail from './SkeletonDetail';

interface BlogPostDetailProps {
  slug?: string;
  initialPost?: BlogPost;
  onBack: () => void;
}

const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ slug, initialPost, onBack }) => {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [post, setPost] = useState<BlogPost | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Simulate Fetching Single Post
  const fetchPost = () => {
    setViewState('loading');
    // Scroll to top
    window.scrollTo(0, 0);
    
    // If initialPost is provided (legacy flow), use it directly
    if (initialPost) {
      // Small timeout to simulate render cycle consistency
      setTimeout(() => {
        setPost(initialPost);
        setViewState('success');
      }, 100);
      return;
    }

    // Standard flow: fetch by slug
    if (!slug) {
       setViewState('error');
       return;
    }

    setTimeout(() => {
      const foundPost = MOCK_POSTS.find(p => p.slug === slug);
      if (foundPost) {
        setPost(foundPost);
        setViewState('success');
      } else {
        setViewState('error');
      }
    }, 1000);
  };

  useEffect(() => {
    fetchPost();
  }, [slug, initialPost]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (viewState === 'loading') {
    return <SkeletonDetail />;
  }

  // Handle "Not Found" or Error
  if (viewState === 'error' || !post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Post Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          We couldn't find the article you're looking for. It might have been removed or the link is incorrect.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onBack}
            className="px-6 py-2.5 bg-slate-200 text-slate-800 font-medium rounded-lg hover:bg-slate-300 transition-colors"
          >
            Back to Articles
          </button>
          {!initialPost && (
            <button 
              onClick={fetchPost}
              className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Navigation */}
      <button 
        onClick={onBack}
        className="group flex items-center text-slate-500 hover:text-solar-600 font-medium mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
        Back to All Articles
      </button>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-solar-700 bg-solar-100 rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-xl md:text-2xl text-slate-600 mb-6 font-light leading-relaxed">
              {post.subtitle}
            </p>
          )}
          
          {/* Meta Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-6 border-y border-slate-100">
            <div className="flex items-center gap-3">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="text-sm">
                <p className="font-semibold text-slate-900">{post.author.name}</p>
                <p className="text-slate-500">Author</p>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-slate-200 mx-2"></div>
            
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.publishedAt}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full aspect-video sm:aspect-[2/1] rounded-2xl overflow-hidden bg-slate-100 mb-10 shadow-sm">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Body Content */}
        <div 
          className="prose prose-slate prose-lg max-w-none text-slate-700 mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        {/* Share Section */}
        <div className="border-t border-slate-200 pt-8 mt-12 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-900">Share this article</h3>
            <button 
              onClick={handleCopyLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                linkCopied 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              {linkCopied ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPostDetail;
