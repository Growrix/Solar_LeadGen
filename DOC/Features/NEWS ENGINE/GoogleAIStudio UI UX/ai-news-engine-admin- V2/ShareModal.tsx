
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
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <LinkIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Copy Share Link</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Primary Intent: Distribution</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </header>

        {/* Content - Streamlined Flow */}
        <div className="px-8 pb-10 space-y-8">
          <div className="space-y-4">
            <div className={`p-1.5 rounded-[24px] border-2 transition-all duration-300 flex items-center gap-2 ${
              copied 
                ? 'border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/10' 
                : 'border-slate-100 bg-slate-50 focus-within:border-indigo-500/50'
            }`}>
              <div className="flex-1 px-4 py-3 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Article Permalink</p>
                <p className={`text-sm font-bold truncate transition-colors ${copied ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {url}
                </p>
              </div>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs transition-all active:scale-95 ${
                  copied 
                    ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200'
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
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] text-center animate-in fade-in slide-in-from-top-1">
                Successfully added to clipboard
              </p>
            )}
          </div>

          <div className="pt-8 border-t border-slate-50 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Secondary Distribution Channels</p>
            <div className="flex justify-center gap-3">
              {socialLinks.map((social) => (
                <button 
                  key={social.name}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 text-slate-500 border border-slate-100 ${social.color} hover:text-white hover:border-transparent transition-all shadow-sm active:scale-95`}
                  title={`Share on ${social.name}`}
                >
                  {social.icon}
                  <span className="text-[10px] font-black uppercase tracking-widest">{social.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex justify-center">
          <button 
            onClick={onClose}
            className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors py-2 px-4"
          >
            Dismiss Dialog
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ShareModal;
