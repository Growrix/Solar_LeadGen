
import React, { useState } from 'react';
import { X, Copy, Check, Share2, Link as LinkIcon, Twitter, Linkedin, Facebook } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, title }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { name: 'Twitter', icon: <Twitter size={18} />, color: 'hover:bg-[#1DA1F2]' },
    { name: 'LinkedIn', icon: <Linkedin size={18} />, color: 'hover:bg-[#0077B5]' },
    { name: 'Facebook', icon: <Facebook size={18} />, color: 'hover:bg-[#1877F2]' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header - Focused Intent */}
        <header className="px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-accent-foreground shadow-neu-outset">
              <LinkIcon size={24} />
            </div>
            <div>
              <h2 className="text-heading-3 text-foreground tracking-tight">Copy Share Link</h2>
              <p className="text-caption text-muted-foreground uppercase tracking-widest mt-0.5">Primary Intent: Distribution</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-full"
          >
            <X size={24} />
          </button>
        </header>

        {/* Content - Streamlined Flow */}
        <div className="px-8 pb-10 space-y-8">
          <div className="space-y-4">
            <div className={`p-1.5 rounded-[24px] border-2 flex items-center gap-2 ${
              copied 
                ? 'border-success bg-success/10 ring-4 ring-success/10' 
                : 'border-border bg-surface focus-within:border-accent/50'
            }`}>
              <div className="flex-1 px-4 py-3 min-w-0">
                <p className="text-caption text-muted-foreground uppercase tracking-widest mb-1">Article Permalink</p>
                <p className={`text-body-small font-semibold truncate ${copied ? 'text-success' : 'text-foreground'}`}>
                  {url}
                </p>
              </div>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-body-small font-semibold active:scale-95 ${
                  copied 
                    ? 'bg-success text-success-foreground shadow-neu-outset' 
                    : 'bg-foreground text-background hover:bg-foreground/90 shadow-neu-outset'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={18} strokeWidth={3} />
                    Link Copied
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy URL
                  </>
                )}
              </button>
            </div>
            
            {copied && (
              <p className="text-caption text-success uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-1">
                Successfully added to clipboard
              </p>
            )}
          </div>

          <div className="pt-8 border-t border-border space-y-4">
            <p className="text-caption text-muted-foreground uppercase tracking-widest text-center">Secondary Distribution Channels</p>
            <div className="flex justify-center gap-3">
              {socialLinks.map((social) => (
                <button 
                  key={social.name}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface text-muted-foreground border border-border hover:bg-accent/80 hover:text-accent-foreground hover:border-transparent shadow-neu-outset active:scale-95`}
                  title={`Share on ${social.name}`}
                >
                  {social.icon}
                  <span className="text-caption font-semibold uppercase tracking-widest">{social.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 py-4 bg-surface border-t border-border flex justify-center">
          <button 
            onClick={onClose}
            className="text-caption text-muted-foreground hover:text-foreground uppercase tracking-widest py-2 px-4"
          >
            Dismiss Dialog
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ShareModal;
