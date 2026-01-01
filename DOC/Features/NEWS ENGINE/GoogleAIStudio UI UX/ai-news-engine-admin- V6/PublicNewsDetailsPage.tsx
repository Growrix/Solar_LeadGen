
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Clock, 
  Bookmark, 
  Rss,
  AlertCircle,
  Hash,
  Copy,
  Twitter,
  Linkedin,
  Search as SearchIcon,
  Info,
  Calendar
} from 'lucide-react';
import { NewsItem, NewsStatus } from './types';

interface PublicNewsDetailsPageProps {
  news: NewsItem[];
  slug: string;
  isLoading: boolean;
  onBack: () => void;
  onShare: () => void;
}

const PublicNewsDetailsPage: React.FC<PublicNewsDetailsPageProps> = ({ news, slug, isLoading, onBack, onShare }) => {
  const [showSEO, setShowSEO] = useState(false);

  const article = useMemo(() => {
    return news.find(item => 
      (item.slug === slug || item.id === slug) && item.status === NewsStatus.PUBLISHED
    );
  }, [news, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center border-b border-slate-50 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-20" />
        </div>
        <div className="max-w-3xl mx-auto px-6 pt-16 space-y-8 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="h-16 bg-slate-100 rounded w-full" />
          <div className="aspect-[16/9] bg-slate-100 rounded-[32px] w-full" />
          <div className="space-y-4">
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-300 mb-8 border border-slate-100">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Story Not Found</h1>
        <p className="text-slate-500 max-w-sm mb-10 text-lg leading-relaxed">
          The analysis you are looking for may have been archived or moved to another section.
        </p>
        <button 
          onClick={onBack}
          className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:scale-105 transition-all uppercase text-xs tracking-widest active:scale-95"
        >
          Return to Intelligence Feed
        </button>
      </div>
    );
  }

  const ShareActions = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <button 
        onClick={onShare}
        className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
        title="Share on Twitter"
      >
        <Twitter size={16} />
      </button>
      <button 
        onClick={onShare}
        className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
        title="Share on LinkedIn"
      >
        <Linkedin size={16} />
      </button>
      <button 
        onClick={onShare}
        className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
        title="Copy Link"
      >
        <Copy size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 animate-in fade-in duration-700">
      {/* Article Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="p-1.5 rounded-full group-hover:bg-slate-100 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Back to Feed
          </button>

          <div className="flex items-center gap-3">
             <button 
              onClick={onShare}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
              title="Share Analysis"
            >
              <Share2 size={20} />
            </button>
            <button 
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
              title="Save Story"
            >
              <Bookmark size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-6">
            <span className="bg-indigo-50 px-2 py-0.5 rounded-md">{article.category}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} />
              {article.publishedAt || article.createdAt}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tighter">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6 py-8 border-y border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Rss size={20} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 tracking-tight">AI News Engine</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Clock size={12} />
                  Calculated Read: 4 min
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Share Analysis</span>
              <ShareActions />
            </div>
          </div>
        </header>

        {/* Feature Visual */}
        <div className={`aspect-[21/9] md:aspect-[16/7] rounded-[40px] shadow-2xl overflow-hidden mb-12 relative ${
          article.category === 'Tech' ? 'bg-gradient-to-br from-indigo-600 to-blue-600' :
          article.category === 'Finance' ? 'bg-gradient-to-br from-emerald-600 to-teal-700' :
          article.category === 'Science' ? 'bg-gradient-to-br from-amber-500 to-rose-600' :
          'bg-slate-900'
        }`}>
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Rss size={200} strokeWidth={0.5} className="text-white" />
          </div>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
        </div>

        {/* Article Body */}
        <div className="max-w-2xl mx-auto">
          <div 
            className="prose prose-slate prose-lg max-w-none font-serif text-slate-800 leading-[1.8]
              prose-headings:font-sans prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-slate-900
              prose-h3:text-3xl prose-h3:mt-16 prose-h3:mb-8
              prose-p:mb-8
              prose-strong:text-slate-900 prose-strong:font-black
              drop-cap:first-letter:text-7xl drop-cap:first-letter:font-black drop-cap:first-letter:float-left drop-cap:first-letter:mr-3 drop-cap:first-letter:mt-2"
          >
            {/* Using the article.content if available, otherwise falling back to summary with mock expansion */}
            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <div className="space-y-8">
                <p className="text-2xl font-medium text-slate-500 italic border-l-4 border-indigo-600 pl-6 mb-12 leading-relaxed">
                  {article.summary}
                </p>
                <p>
                  As AI governance frameworks mature globally, this development marks a critical shift in how enterprises approach the deployment of large-scale foundation models. The landmark legislation sets tiered risk categories for foundation models and strict transparency mandates, ensuring that innovation does not come at the cost of public safety or privacy.
                </p>
                <p>
                  Industry leaders have reacted with a mix of caution and optimism. While some argue that strict regulation could stifle early-stage startups, others believe that a clear legal framework is exactly what institutional investors need to commit capital to the sector at scale.
                </p>
                <h3 className="text-2xl font-black text-slate-900">The Path Forward</h3>
                <p>
                  The next twelve months will be pivotal as the specific technical standards for compliance are drafted. Organizations will need to audit their data pipelines and model training logs to meet the high-water mark of transparency required by these new rules.
                </p>
                <p>
                  This analysis confirms that we are entering an era of "Accountable AI," where the black-box nature of previous systems is no longer acceptable in high-stakes public environments.
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mt-16 flex flex-wrap gap-2.5">
            {article.tags?.length ? article.tags.map(tag => (
              <span key={tag} className="px-3.5 py-1.5 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 font-bold text-[11px] rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-transparent hover:border-indigo-100">
                <Hash size={10} className="text-slate-300" />
                {tag}
              </span>
            )) : (
              ['Analysis', 'Intelligence', 'Strategic', 'SaaS'].map(tag => (
                <span key={tag} className="px-3.5 py-1.5 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 font-bold text-[11px] rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-transparent hover:border-indigo-100">
                  <Hash size={10} className="text-slate-300" />
                  {tag}
                </span>
              ))
            )}
          </div>

          {/* Collapsible SEO Panel */}
          <div className="mt-16 pt-8 border-t border-slate-100">
            <button 
              onClick={() => setShowSEO(!showSEO)}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors mb-6 group"
            >
              <SearchIcon size={12} className="group-hover:rotate-12 transition-transform" />
              {showSEO ? 'Hide Technical Metadata' : 'View Technical Metadata'}
            </button>
            
            {showSEO && (
              <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">
                  <Info size={12} />
                  Intelligence Metadata
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Slug</p>
                      <code className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200">{article.slug || slug}</code>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Agent Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${article.relevanceScore}%` }} />
                        </div>
                        <span className="text-xs font-black text-emerald-600">{article.relevanceScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Tag</p>
                      <p className="text-sm font-bold text-slate-700">{article.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin Engine</p>
                      <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{article.aiModel}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 py-8 border-y border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End of Analysis &bull; Verified</p>
            <ShareActions />
          </div>

          {/* Subscribe CTA */}
          <div className="mt-16 p-10 md:p-12 bg-slate-900 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <h4 className="text-3xl font-black tracking-tighter">Deep Intelligence, Delivered.</h4>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">
                  Join 25,000+ industry leaders who rely on our AI-powered analysis to stay ahead of the curve.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <button className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
                  Subscribe
                </button>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center sm:text-left">
                No spam. Unsubscribe at any time. Verified data only.
              </p>
            </div>
            <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10 rotate-12 pointer-events-none">
              <Rss size={300} className="text-white" />
            </div>
          </div>
        </div>
      </main>

      {/* Basic Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-16 mt-20">
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center gap-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <Rss size={20} fill="currentColor" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Insights</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Compliance</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              &copy; 2024 NewsEngine AI &bull; Strategic Intelligence
            </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicNewsDetailsPage;
