'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import NewsletterSignup from '@/components/NewsletterSignup';
import { fetchPublicNewsBySlug, type PublicNewsItemDetail } from '@/lib/news-engine/client';
import Button from '@/components/ui/button';

// Icon Components (mirrors BlogPostPageClient styling)
const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 mr-2"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-muted-foreground"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const LinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
  </svg>
);

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.className = 'sr-only';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function PublicNewsDetailPage({ params }: { params: { slug: string } }) {

  const router = useRouter();
  const [item, setItem] = React.useState<PublicNewsItemDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showSEO, setShowSEO] = React.useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [isShareOpen, setIsShareOpen] = useState(false);

  React.useEffect(() => {
    let alive = true;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    (async () => {
      setIsLoading(true);
      try {
        const found = await fetchPublicNewsBySlug(params.slug);
        if (!alive) return;
        setItem(found);
      } catch {
        if (!alive) return;
        setItem(null);
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [params.slug]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center border-b border-border animate-pulse">
          <div className="h-4 bg-surface rounded w-20" />
        </div>
        <div className="max-w-3xl mx-auto px-6 pt-16 space-y-8 animate-pulse">
          <div className="h-4 bg-surface rounded w-24" />
          <div className="h-16 bg-surface rounded w-full" />
          <div className="aspect-[16/9] bg-surface rounded-3xl w-full" />
          <div className="space-y-4">
            <div className="h-4 bg-surface rounded w-full" />
            <div className="h-4 bg-surface rounded w-full" />
            <div className="h-4 bg-surface rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center text-muted-foreground mb-8 border border-border">
          <span className="text-heading-2">⚠️</span>
        </div>
        <h1 className="text-heading-2 text-foreground mb-3 tracking-tighter">Story Not Found</h1>
        <p className="text-muted-foreground max-w-sm mb-10 text-body-large leading-relaxed">
          The story you are looking for may have been archived or moved to another section.
        </p>
        <button 
          onClick={() => router.push('/news')}
          className="px-10 py-4 bg-primary text-background text-body-small rounded-2xl shadow-xl shadow-primary/10 hover:scale-105 transition-colors uppercase tracking-widest active:scale-95"
        >
          Return to News Feed
        </button>
      </div>
    );
  }


  const shareUrl = typeof window === 'undefined' ? '' : window.location.href;
  const handleCopyLink = async () => {
    setCopyStatus('idle');
    const ok = await copyToClipboard(shareUrl);
    setCopyStatus(ok ? 'copied' : 'failed');
    window.setTimeout(() => setCopyStatus('idle'), 2000);
  };

  // ShareModal adapted for repo theming
  function ShareModal({ isOpen, onClose, url, title }: { isOpen: boolean; onClose: () => void; url: string; title: string }) {
    const [copied, setCopied] = useState(false);
    if (!isOpen) return null;
    const handleCopy = () => {
      copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const openShareUrl = (href: string) => {
      try {
        window.open(href, '_blank', 'noopener,noreferrer');
      } catch {
        window.location.href = href;
      }
    };

    const encode = (value: string) => encodeURIComponent(value);
    const shareText = title ? `${title}` : '';

    const socialLinks = [
      { name: 'Twitter', onClick: () => openShareUrl(`https://twitter.com/intent/tweet?text=${encode(shareText)}&url=${encode(url)}`), icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.7 1.64 1.15c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.94 3.65A4.48 4.48 0 01.96 6v.06c0 2.13 1.52 3.91 3.54 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.7 2.16 2.94 4.07 2.97A9.05 9.05 0 010 21.54a12.8 12.8 0 006.95 2.04c8.34 0 12.9-6.91 12.9-12.9 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z" /></svg>
      ), color: 'hover:bg-primary/80 hover:text-background' },
      { name: 'LinkedIn', onClick: () => openShareUrl(`https://www.linkedin.com/sharing/share-offsite/?url=${encode(url)}`), icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" /><rect width="4" height="12" x="2" y="9" /></svg>
      ), color: 'hover:bg-primary/80 hover:text-background' },
      { name: 'Facebook', onClick: () => openShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`), icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><path d="M18 2h-3a5 5 0 00-5 5v3H6v4h4v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
      ), color: 'hover:bg-primary/80 hover:text-background' },
      { name: 'WhatsApp', onClick: () => openShareUrl(`https://wa.me/?text=${encode(`${shareText} ${url}`.trim())}`), icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><path d="M20 11.5a8.5 8.5 0 0 1-12.74 7.33L4 20l1.25-3.09A8.5 8.5 0 1 1 20 11.5Z" /><path d="M8.8 8.9c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.3l.7 1.7c.1.3.1.5 0 .7l-.4.5c-.1.2-.2.3 0 .6.2.3.8 1.3 1.8 2.1 1.2.9 2.2 1.2 2.5 1.3.3.1.5.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 1.2-.7 2.3-1.8 2.6-1 .3-2.3.2-4.4-.9-2.4-1.3-4-3.3-4.6-4.6-.6-1.3-.7-2.4-.5-3.2Z" /></svg>
      ), color: 'hover:bg-primary/80 hover:text-background' },
      { name: 'Email', onClick: () => (window.location.href = `mailto:?subject=${encode(shareText)}&body=${encode(`${shareText}\n\n${url}`.trim())}`), icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>
      ), color: 'hover:bg-primary/80 hover:text-background' },
    ];
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
        {/* Modal Container */}
        <div className="relative bg-background w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-border">
          {/* Header */}
          <header className="px-8 py-6 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-background shadow-lg">
                <LinkIcon />
              </div>
              <div>
                <h2 className="text-heading-2 text-foreground tracking-tight">Copy Share Link</h2>
                <p className="text-caption text-muted-foreground uppercase tracking-widest mt-0.5">Primary Intent: Distribution</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-full transition-colors">
              <span className="sr-only">Close</span>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>
          {/* Content */}
          <div className="px-8 pb-10 space-y-8">
            <div className="space-y-4">
              <div className={`p-1.5 rounded-2xl border-2 transition-colors duration-300 flex items-center gap-2 ${copied ? 'border-success bg-success/10 ring-4 ring-success/10' : 'border-border bg-surface focus-within:border-primary/50'}`}>
                <div className="flex-1 px-4 py-3 min-w-0">
                  <p className="text-caption text-muted-foreground uppercase tracking-widest mb-1">Article Permalink</p>
                  <p className={`text-body-small truncate transition-colors ${copied ? 'text-success' : 'text-foreground'}`}>{url}</p>
                </div>
                <button onClick={handleCopy} className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-body-small transition-colors active:scale-95 ${copied ? 'bg-success text-background shadow-xl shadow-success/20' : 'bg-primary text-background hover:bg-primary/80 shadow-xl shadow-primary/20'}`}>
                  {copied ? (
                    <>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" className="inline-block"><path d="M5 13l4 4L19 7" /></svg>
                      Link Copied
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
                      Copy URL
                    </>
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-caption text-success uppercase tracking-[0.2em] text-center animate-in fade-in slide-in-from-top-1">Successfully added to clipboard</p>
              )}
            </div>
            <div className="pt-8 border-t border-border space-y-4">
              <p className="text-caption text-muted-foreground uppercase tracking-[0.2em] text-center">Secondary Distribution Channels</p>
              <div className="flex justify-center gap-3 flex-wrap">
                {socialLinks.map((social) => (
                  <button
                    key={social.name}
                    type="button"
                    onClick={social.onClick}
                    className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface text-muted-foreground border border-border ${social.color} transition-colors shadow-sm active:scale-95`}
                    title={`Share on ${social.name}`}
                  >
                    {social.icon}
                    <span className="text-caption uppercase tracking-widest">{social.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Footer */}
          <footer className="px-8 py-4 bg-surface/50 border-t border-border flex justify-center">
            <button onClick={onClose} className="text-caption text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors py-2 px-4">Dismiss Dialog</button>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans animate-in fade-in duration-700">
      {/* Article Navigation */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.push('/news')}
            className="group flex items-center gap-2 text-body-small text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="p-1.5 rounded-full group-hover:bg-surface transition-colors">
              <ArrowLeftIcon />
            </div>
            Back to Feed
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsShareOpen(true)}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              title="Share Story"
            >
              <span className="sr-only">Share</span>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><circle cx="10" cy="10" r="8" /><path d="M14 10a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" /></svg>
            </button>
          </div>
        </div>
      </nav>
      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-caption text-primary uppercase tracking-widest mb-6">
            <span className="bg-primary/10 px-2 py-0.5 rounded-md">{item.category}</span>
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="text-muted-foreground flex items-center gap-1.5">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><rect width="10" height="10" x="1" y="1" rx="2" /></svg>
              {formatDateTime(item.publishedAt)}
            </span>
          </div>
          <h1 className="text-heading-1 text-foreground leading-[1.1] mb-8 tracking-tighter">
            {item.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-6 py-8 border-y border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-background shadow-lg">
                <span className="text-label">SM</span>
              </div>
              <div>
                <p className="text-body-small text-foreground tracking-tight">SolarMatch News</p>
                <div className="flex items-center gap-2 text-caption text-muted-foreground">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><circle cx="6" cy="6" r="5" /></svg>
                  Calculated Read: 4 min
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-caption text-muted-foreground uppercase tracking-widest">Share Story</span>
              <button onClick={() => setIsShareOpen(true)} className="p-2.5 rounded-full bg-surface text-muted-foreground hover:bg-primary hover:text-background transition-colors shadow-sm" title="Copy Link">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" /></svg>
              </button>
            </div>
          </div>
        </header>
        {/* Feature Visual */}
        <div className="aspect-[21/9] md:aspect-[16/7] rounded-3xl shadow-neu-outset overflow-hidden mb-12 relative bg-gradient-to-br from-primary/80 to-accent/60">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <span className="text-heading-1 text-background">SM</span>
          </div>
          <div className="absolute inset-0 bg-background/5 backdrop-blur-[1px]" />
        </div>
        {/* Article Body */}
        <div className="max-w-2xl mx-auto">
          <div className="prose prose-neutral prose-lg max-w-none font-serif text-foreground leading-[1.8] prose-headings:font-sans prose-headings:text-heading-2 prose-headings:tracking-tighter prose-headings:text-foreground prose-h3:text-heading-3 prose-h3:mt-16 prose-h3:mb-8 prose-p:mb-8 prose-strong:text-foreground prose-strong:text-heading-2">
            <div className="space-y-8">
              <p className="text-body-large text-muted-foreground italic border-l-4 border-primary pl-6 mb-12 leading-relaxed">
                {item.summary}
              </p>
              {/* Render real AI-generated HTML content from DB */}
              {item.contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
              ) : (
                <p className="text-muted-foreground">No content available for this article.</p>
              )}
            </div>
          </div>
          {/* Tags */}
          <div className="mt-16 flex flex-wrap gap-2.5">
            {(item.tags?.length ? item.tags : ['Analysis', 'Intelligence', 'Strategic', 'SaaS']).map(tag => (
              <span key={tag} className="px-3.5 py-1.5 bg-surface text-muted-foreground hover:text-primary hover:bg-primary/10 text-body-small rounded-xl transition-colors cursor-pointer flex items-center gap-2 border border-transparent hover:border-primary/20">
                #{tag}
              </span>
            ))}
          </div>
          {/* Collapsible SEO Panel and End of Analysis section removed as per user request */}
          {/* Subscribe CTA (optional, can be removed or replaced) */}
        </div>
        {/* Newsletter Signup Section */}
        <section className="w-full py-16 lg:py-24 bg-background">
          <NewsletterSignup />
        </section>
      </main>
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} url={shareUrl} title={item.title} />
      <Footer
        onBecomePartnerClick={() => router.push('/installer')}
        onPartnerSignInClick={() => router.push('/installer')}
        onScrollToQuote={() => router.push('/#calculator-section')}
        onScrollToRebate={() => router.push('/#calculator-section')}
        onBlogClick={() => router.push('/blog')}
        onGovernmentNewsClick={() => router.push('/blog')}
      />
    </div>
  );
}
