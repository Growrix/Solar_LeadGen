import React from 'react';
import type { Post } from '../types/blog';
import Button from '@/components/ui/button';

// --- Icon Components ---
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const ArrowRightLargeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

interface BlogSectionProps {
  onSeeAllPostsClick: () => void;
  onNavigateToPost: (post: Post) => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({ onSeeAllPostsClick, onNavigateToPost }) => {
  const articles: Post[] = [
    {
      title:"2024 Solar Rebate Changes: What Australian Homeowners Need to Know",
      excerpt:"Understanding the latest updates to government solar incentives and how they affect your savings potential.",
      author:"Sarah Johnson",
      date:"March 15, 2024",
      readTime:"6 min read",
      category:"Policy Updates",
      image:"https://images.unsplash.com/photo-1509390636472-a0b5a1985799?q=80&w=800"
    },
    {
      title:"Tesla Powerwall vs Competitors: Battery Storage Comparison",
      excerpt:"An in-depth analysis of the top battery storage systems available in Australia, including costs and performance.",
      author:"Michael Chen",
      date:"March 10, 2024",
      readTime:"8 min read",
      category:"Technology",
      image:"https://images.unsplash.com/photo-1629231249110-a1a1c63740e2?q=80&w=800"
    },
    {
      title:"Summer Solar Tips: Maximizing Your System's Performance",
      excerpt:"How to get the most out of your solar panels during Australia's peak sunshine months.",
      author:"Emma Thompson",
      date:"March 5, 2024",
      readTime:"4 min read",
      category:"Maintenance",
      image:"https://images.unsplash.com/photo-1545284884-f3c914a2b9ae?q=80&w=800"
    }
  ];

  return (
    <section className="blog-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-heading-2 lg:text-heading-1 text-foreground mb-4">
            Latest Solar News & Insights
          </h2>
          <p className="text-body-large text-muted-foreground max-w-3xl mx-auto">
            Stay informed with expert insights, industry updates, and practical tips from our solar specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article, index) => (
            <article 
              key={index} 
              onClick={() => onNavigateToPost(article)}
              className="bg-background rounded-2xl shadow-neu-outset hover:shadow-neu-outset-lg overflow-hidden group cursor-pointer transition-colors duration-300"
              role="button"
              tabIndex={0}
              aria-label={`Read article: ${article.title}`}
              onKeyPress={(e) => e.key === 'Enter' && onNavigateToPost(article)}
            >
              <div className="p-6 lg:p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 bg-background shadow-neu-inset px-3 py-1.5 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-neu-inset-sm"></div>
                    <span className="text-caption text-foreground">
                      {article.category}
                    </span>
                  </div>
                  <span className="text-caption text-muted-foreground">
                    {article.readTime}
                  </span>
                </div>
                
                <h3 className="text-heading-4 text-foreground mb-4 leading-snug group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-body text-muted-foreground mb-6 leading-relaxed">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-body-small text-muted-foreground mb-6 border-t border-border pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <UserIcon />
                      <span className="text-muted-foreground">{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon />
                      <span className="text-muted-foreground">{article.date}</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="secondary" className="inline-flex items-center space-x-2 mt-auto">
                  <span>Read Article</span>
                  <ArrowRightIcon />
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={onSeeAllPostsClick}
            variant="secondary"
            className="inline-flex items-center space-x-2 px-8 py-4"
          >
            <span>See All Posts</span>
            <ArrowRightLargeIcon />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
