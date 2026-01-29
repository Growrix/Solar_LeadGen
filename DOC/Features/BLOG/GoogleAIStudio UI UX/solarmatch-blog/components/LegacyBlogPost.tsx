import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types';
import BlogPostDetail from './BlogPostDetail';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface LegacyBlogPostProps {
  onBack: () => void;
}

const LegacyBlogPost: React.FC<LegacyBlogPostProps> = ({ onBack }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to read from sessionStorage
    try {
      const storedData = sessionStorage.getItem('currentBlogPost');
      
      if (storedData) {
        const parsedPost: BlogPost = JSON.parse(storedData);
        
        // If a slug exists, redirect to the canonical URL
        if (parsedPost.slug) {
          window.location.hash = `/blog/${parsedPost.slug}`;
          return;
        }
        
        // Otherwise, render the content
        setPost(parsedPost);
        setLoading(false);
      } else {
        // No payload found
        setError(true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to parse legacy blog post payload:', err);
      setError(true);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-white"></div>; // Or return Skeleton
  }

  if (error || !post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Post Selected</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          We couldn't find the blog post data in your session. Please return to the blog listing to select an article.
        </p>
        <button 
          onClick={onBack}
          className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </button>
      </div>
    );
  }

  return <BlogPostDetail initialPost={post} onBack={onBack} />;
};

export default LegacyBlogPost;