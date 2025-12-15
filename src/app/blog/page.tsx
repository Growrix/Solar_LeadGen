'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Button from '@/components/ui/button';
import type { Post } from '@/types/blog';
import { allArticles, categories } from '@/data/blogData';

// --- Icon Components ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

const ARTICLES_PER_PAGE = 6;

interface ArticleCardProps {
  article: Post;
  onNavigateToPost: (post: Post) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onNavigateToPost }) => (
  <article 
    onClick={() => onNavigateToPost(article)}
    className="theme-card overflow-hidden group flex flex-col cursor-pointer h-full"
    role="button"
    tabIndex={0}
    aria-label={`Read article: ${article.title}`}
    onKeyPress={(e) => e.key === 'Enter' && onNavigateToPost(article)}
  >
    <div className="relative w-full h-48">
      <Image src={article.image} alt={article.title} fill className="object-cover" />
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-caption text-primary bg-primary/10 px-3 py-1 rounded-full">{article.category}</span>
        <span className="text-caption text-muted-foreground">{article.readTime}</span>
      </div>
      <h3 className="text-heading-4 text-foreground mb-3 leading-snug group-hover:text-primary transition-colors flex-grow">
        {article.title}
      </h3>
      <p className="text-muted-foreground mb-4 leading-relaxed text-body-small">{article.excerpt}</p>
      <div className="flex items-center justify-between text-body-small text-muted-foreground mt-auto pt-4 border-t border-border">
        <div className="flex items-center space-x-2"><UserIcon /><span>{article.author}</span></div>
        <div className="flex items-center space-x-2"><CalendarIcon /><span>{article.date}</span></div>
      </div>
      <div className="text-primary group-hover:text-primary/80 transition-colors inline-flex items-center space-x-2 mt-4">
        <span>Read Article</span><ArrowRightIcon />
      </div>
    </div>
  </article>
);

export default function BlogPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);

  const filteredArticles = useMemo(() => {
    return allArticles
      .filter(article => selectedCategory === 'All' || article.category === selectedCategory)
      .filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [searchTerm, selectedCategory]);

  const handleNavigateToPost = (post: Post) => {
    sessionStorage.setItem('currentBlogPost', JSON.stringify(post));
    router.push('/blog/post');
  };

  const handleBecomePartner = () => router.push('/installer');
  const handlePartnerSignIn = () => router.push('/installer');
  const handleScrollToQuote = () => router.push('/#calculator-section');
  const handleScrollToRebate = () => router.push('/#calculator-section');
  const handleBlogClick = () => router.push('/blog');
  const handleGovernmentNewsClick = () => console.log('Government news');

  return (
    <div className="min-h-screen flex flex-col blog-page-bg animate-fade-in">
      <main className="flex-grow pb-24 md:pb-0">
        {/* Hero Section */}
        <section className="py-16 sm:py-24 bg-surface/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
            <h1 className="text-heading-1 sm:text-heading-1 md:text-heading-1 text-foreground mb-4 tracking-tight">The SolarMatch Blog</h1>
            <p className="text-heading-4 sm:text-heading-3 text-muted-foreground max-w-3xl mx-auto">Your definitive guide to solar energy, rebates, and technology in Australia.</p>
          </div>
        </section>
        
        {/* Articles Grid */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.slice(0, visibleCount).map((article, index) => (
                  <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <ArticleCard article={article} onNavigateToPost={handleNavigateToPost} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-heading-2 text-foreground">No Articles Found</h3>
                <p className="mt-2 text-muted-foreground">Try adjusting your search or filter.</p>
              </div>
            )}

            {visibleCount < filteredArticles.length && (
              <div className="text-center mt-16">
                <Button 
                  onClick={() => setVisibleCount(c => c + ARTICLES_PER_PAGE)} 
                  variant="primary"
                  className="px-8 py-3 text-heading-4"
                >
                  Load More Articles
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer
        onBecomePartnerClick={handleBecomePartner}
        onPartnerSignInClick={handlePartnerSignIn}
        onScrollToQuote={handleScrollToQuote}
        onScrollToRebate={handleScrollToRebate}
        onBlogClick={handleBlogClick}
        onGovernmentNewsClick={handleGovernmentNewsClick}
      />
    </div>
  );
}
