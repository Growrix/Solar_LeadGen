
import React, { useState, useEffect } from 'react';
import { BlogPost, ViewState } from './types';
import { MOCK_POSTS } from './constants';
import PostCard from './components/PostCard';
import SkeletonCard from './components/SkeletonCard';
import BlogPostDetail from './components/BlogPostDetail';
import LegacyBlogPost from './components/LegacyBlogPost';
import AdminDashboard from './components/admin/AdminDashboard';
import { RefreshCw, Sun, Loader2 } from 'lucide-react';
import { BlogProvider } from './context/BlogContext';

const App: React.FC = () => {
  // Routing State
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);
  
  // List View State
  const [listViewState, setListViewState] = useState<ViewState>('loading');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  
  // Load More State
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  
  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simulate fetching data for the list
  const fetchListData = (shouldFail = false, isEmpty = false) => {
    setListViewState('loading');
    setAllLoaded(false); // Reset load more state on refresh
    setTimeout(() => {
      if (shouldFail) {
        setListViewState('error');
      } else if (isEmpty) {
        setPosts([]);
        setListViewState('empty');
      } else {
        setPosts(MOCK_POSTS);
        setListViewState('success');
      }
    }, 1500); // 1.5s delay to show skeleton
  };

  useEffect(() => {
    // Only fetch list data if we are on the home route (or init)
    // and haven't fetched yet (optimization)
    if (posts.length === 0) {
      fetchListData();
    }
  }, []);

  const handlePostClick = (slug: string) => {
    window.location.hash = `/blog/${slug}`;
  };

  const handleBackToHome = () => {
    window.location.hash = ''; // or #/blog if you prefer, treating empty as home
  };

  const handleLoadMore = () => {
    setIsLoadMoreLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoadMoreLoading(false);
      setAllLoaded(true);
    }, 1000);
  };

  // Admin Route Check
  // Delegate all admin routing to the AdminDashboard component
  if (currentRoute.startsWith('#/admin')) {
    return (
      <BlogProvider>
        <AdminDashboard currentRoute={currentRoute} />
      </BlogProvider>
    );
  }

  const isLegacyRoute = currentRoute === '#/blog/post';
  const isDetailView = !isLegacyRoute && currentRoute.startsWith('#/blog/');
  const currentSlug = isDetailView ? currentRoute.split('/blog/')[1] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="cursor-pointer" onClick={handleBackToHome}>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="text-solar-500 w-8 h-8" />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SolarMatch Blog</h1>
              </div>
              <p className="text-slate-500 text-sm max-w-2xl">
                Insights, guides, and news for a brighter, sustainable future.
              </p>
            </div>
            
            {/* Debug Controls - Only show on list view for simplicity */}
            {!isDetailView && !isLegacyRoute && (
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-200">
                 <span className="font-semibold uppercase mr-2">Debug List:</span>
                 <button onClick={() => fetchListData(false, false)} className="hover:text-solar-600 underline">Success</button>
                 <button onClick={() => fetchListData(true, false)} className="hover:text-red-600 underline">Error</button>
                 <button onClick={() => fetchListData(false, true)} className="hover:text-blue-600 underline">Empty</button>
                 <span className="mx-1">|</span>
                 <button onClick={() => window.location.hash = '#/admin/blog'} className="hover:text-purple-600 underline font-semibold">Admin Dashboard</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full">
        
        {isLegacyRoute ? (
          // Legacy Compatibility View
          <LegacyBlogPost onBack={handleBackToHome} />
        ) : isDetailView && currentSlug ? (
          // Standard Detail View
          <BlogPostDetail slug={currentSlug} onBack={handleBackToHome} />
        ) : (
          // List View
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Loading State */}
            {listViewState === 'loading' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {listViewState === 'error' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                  <RefreshCw className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load posts</h3>
                <p className="text-slate-500 mb-6 max-w-md">
                  We encountered an issue while retrieving the latest updates. Please check your connection and try again.
                </p>
                <button 
                  onClick={() => fetchListData()}
                  className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors focus:ring-4 focus:ring-slate-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {listViewState === 'empty' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <Sun className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No posts found</h3>
                <p className="text-slate-500 max-w-sm">
                  We haven't published any articles yet. Check back soon for updates on solar technology!
                </p>
              </div>
            )}

            {/* Success State */}
            {listViewState === 'success' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                  {posts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onClick={handlePostClick} 
                    />
                  ))}
                </div>

                {/* Load More Button (UI Only) */}
                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={handleLoadMore}
                    disabled={isLoadMoreLoading || allLoaded}
                    className={`flex items-center gap-2 px-8 py-3 font-medium rounded-lg shadow-sm transition-all focus:ring-4 focus:ring-slate-100 ${
                      allLoaded 
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    {isLoadMoreLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : allLoaded ? (
                      'End of results (Demo)'
                    ) : (
                      'Load More Articles'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer - Minimal */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} SolarMatch. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
