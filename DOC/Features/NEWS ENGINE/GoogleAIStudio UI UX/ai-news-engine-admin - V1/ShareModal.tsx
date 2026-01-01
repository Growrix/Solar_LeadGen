
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
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <header className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Share2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Share Analysis</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Spread the insight</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <LinkIcon size={16} className="text-slate-400" />
              Article Permalink
            </p>
            <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl group focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
              <input 
                type="text" 
                readOnly 
                value={url}
                className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-slate-600 font-medium focus:ring-0 outline-none overflow-hidden text-ellipsis"
              />
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-black text-xs transition-all ${
                  copied 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Or share via</p>
            <div className="flex justify-center gap-4">
              {socialLinks.map((social) => (
                <button 
                  key={social.name}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ${social.color} hover:text-white transition-all shadow-sm active:scale-95`}
                  title={`Share on ${social.name}`}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button 
            onClick={onClose}
            className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors py-2 px-4"
          >
            Close Dialog
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ShareModal;
