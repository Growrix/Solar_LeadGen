
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Clock, 
  Bookmark, 
  ChevronRight,
  Rss,
  AlertCircle,
  Hash,
  Copy,
  Twitter,
  Linkedin,
  Search as SearchIcon,
  Info
} from 'lucide-react';
import { NewsItem, NewsStatus } from './types';

interface PublicNewsDetailsPageProps {
  slug: string;
  onBack: () => void;
  onShare: () => void;
}

const PublicNewsDetailsPage: React.FC<PublicNewsDetailsPageProps> = ({ slug, onBack, onShare }) => {
  const [article, setArticle] = useState<NewsItem & { seoTitle?: string; seoDescription?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showSEO, setShowSEO] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(false);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (slug === 'not-found') {
          setLoading(false);
          return;
        }

        const mockArticle = {
          id: 'p1',
          title: 'The Silicon Frontier: How Photonics is Redefining Data Speed',
          seoTitle: 'Silicon Photonics Breakthrough: Redefining Cloud Data Centers | NewsEngine',
          seoDescription: 'Explore how new silicon-based laser arrays are achieving 400Gbps transmission speeds, potentially slashing cloud latency and energy consumption by 40%.',
          summary: 'Researchers at the Global Innovation Hub have successfully demonstrated a 400Gbps transmission over standard fiber using a new silicon-based laser array, potentially slashing cloud latency.',
          content: `
            <p>In a landmark development for the semiconductor industry, researchers have unveiled a new silicon photonics architecture that achieves unprecedented data transmission speeds while reducing power consumption by over 40%.</p>
            
            <p>The technology, which integrates optical components directly onto standard CMOS wafers, addresses one of the most significant bottlenecks in modern hyperscale computing. As artificial intelligence workloads continue to scale at exponential rates, the demand for faster, more efficient data transfer between processing nodes has never been higher.</p>
            
            <h3>Breaking the Electrical Barrier</h3>
            <p>Traditional copper-based electrical interconnects are increasingly hitting physical limits. At high frequencies, electrical signals suffer from significant attenuation and generate substantial heat. By moving the communication layer into the optical domain using silicon photonics, engineers can transmit data using light particles (photons) instead of electrons.</p>
            
            <p>"We are seeing a paradigm shift in how data centers are architected," says Dr. Elena Vance, Lead Researcher at the Global Innovation Hub. "This isn't just a marginal improvement; it's a fundamental rewrite of the transmission layer that will enable the next generation of generative AI models to communicate across clusters with near-zero friction."</p>

            <h3>The CMOS Advantage</h3>
            <p>What makes this specific breakthrough notable is its compatibility with standard CMOS manufacturing processes. This means the new photonic chips can be produced in existing semiconductor fabrication plants without massive re-tooling, significantly lowering the barrier to commercial adoption.</p>
            
            <p>The implications extend beyond just speed. Lower power consumption means data centers—which currently consume approximately 1-2% of global electricity—could see substantial reductions in their carbon footprint while simultaneously increasing their throughput capacity.</p>
          `,
          status: NewsStatus.PUBLISHED,
          category: 'Tech',
          relevanceScore: 98,
          aiModel: 'Gemini 3 Pro',
          createdAt: 'October 24, 2023',
          slug: 'silicon-photonics-frontier',
          tags: ['Semiconductors', 'Photonics', 'Artificial Intelligence', 'Data Centers']
        };

        setArticle(mockArticle);
        setLoading(false);
      } catch (e) {
        setError(true);
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
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
            <div className="h-24" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 mb-6">
          <AlertCircle size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">Something went wrong</h1>
        <p className="text-slate-500 max-w-sm mb-10 text-lg">We couldn't retrieve this story. Please check your connection or try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:scale-105 transition-all uppercase text-xs tracking-widest"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
          <AlertCircle size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">Story not found</h1>
        <p className="text-slate-500 max-w-sm mb-10 text-lg">The article you're looking for might have been moved or doesn't exist.</p>
        <button 
          onClick={onBack}
          className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:scale-105 transition-all uppercase text-xs tracking-widest"
        >
          Return to News
        </button>
      </div>
    );
  }

  const ShareActions = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <button 
        onClick={onShare}
        className="p-2.5 rounded-full bg-slate-50 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
        title="Share on Twitter"
      >
        <Twitter size={16} />
      </button>
      <button 
        onClick={onShare}
        className="p-2.5 rounded-full bg-slate-50 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
        title="Share on LinkedIn"
      >
        <Linkedin size={16} />
      </button>
      <button 
        onClick={onShare}
        className="p-2.5 rounded-full bg-slate-50 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
        title="Copy Link"
      >
        <Copy size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 animate-in fade-in duration-700">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="p-1.5 rounded-full group-hover:bg-slate-100 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Back
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

      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">
            <span>{article.category}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-slate-400">{article.createdAt}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.15] mb-6 tracking-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                <Rss size={18} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">The NewsEngine Feed</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Clock size={12} />
                  4 min read
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Share</span>
              <ShareActions />
            </div>
          </div>
        </header>

        <div className={`aspect-[16/9] rounded-[32px] shadow-xl overflow-hidden mb-12 relative ${
          article.category === 'Tech' ? 'bg-gradient-to-br from-indigo-600 to-blue-600' :
          article.category === 'Finance' ? 'bg-gradient-to-br from-emerald-600 to-teal-700' :
          'bg-slate-900'
        }`}>
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Rss size={140} strokeWidth={0.5} className="text-white" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div 
            className="prose prose-slate prose-lg max-w-none font-serif text-slate-800 leading-[1.8]
              prose-headings:font-sans prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
              prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6
              prose-p:mb-8
              prose-strong:text-slate-900 prose-strong:font-black"
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
          />

          <div className="mt-12 flex flex-wrap gap-2">
            {article.tags?.map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1.5">
                <Hash size={10} className="text-slate-300" />
                {tag}
              </span>
            ))}
          </div>

          {/* Minimal SEO Preview Block */}
          <div className="mt-16 pt-8 border-t border-slate-100">
            <button 
              onClick={() => setShowSEO(!showSEO)}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors mb-6"
            >
              <SearchIcon size={12} />
              {showSEO ? 'Hide Search Metadata' : 'View Search Metadata'}
            </button>
            
            {showSEO && (
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">
                  <Info size={12} />
                  Search Intelligence
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400">SEO Headline</p>
                    <p className="text-sm font-bold text-indigo-600 leading-tight">
                      {article.seoTitle || article.title}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400">SEO Description</p>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                      {article.seoDescription || article.summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimized for Discover</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 py-8 border-y border-slate-100 flex items-center justify-between">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Help others find this story</p>
            <ShareActions />
          </div>

          <div className="mt-16 p-8 md:p-10 bg-slate-950 rounded-[32px] text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <h4 className="text-2xl font-black">Enjoyed this analysis?</h4>
                <p className="text-slate-400 font-medium">Join 25,000+ readers who receive our AI-curated intelligence reports daily.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-6 py-3.5 bg-white/10 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button className="px-8 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all">
                  Subscribe
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10 rotate-12">
              <Rss size={240} className="text-white" />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 py-12 mt-20">
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center gap-8">
           <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <Rss size={16} fill="currentColor" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter">THE FEED</span>
            </div>
            <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicNewsDetailsPage;
