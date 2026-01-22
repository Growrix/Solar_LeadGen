
import React from 'react';
import { X, Mail, Calendar, Shield } from 'lucide-react';
import { AuthorProfile } from '../../types';

interface AuthorPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: AuthorProfile | null;
}

const AuthorPreviewModal: React.FC<AuthorPreviewModalProps> = ({ isOpen, onClose, author }) => {
  if (!isOpen || !author) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Cover Banner */}
        <div className="h-32 bg-gradient-to-r from-solar-500 to-orange-600 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <img 
              src={author.avatar} 
              alt={author.name} 
              className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 object-cover shadow-md"
            />
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm mb-2 ${
               author.status === 'active' 
                 ? 'bg-green-50 text-green-700 border-green-200' 
                 : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {author.status}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{author.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize border ${
                author.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                author.role === 'editor' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <Shield className="w-3 h-3" />
                {author.role}
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                 <Mail className="w-4 h-4" />
              </div>
              <a href={`mailto:${author.email}`} className="hover:text-solar-600 transition-colors">
                {author.email}
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                 <Calendar className="w-4 h-4" />
              </div>
              <span>Joined {author.joinedAt}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">About</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {author.bio || "No bio provided yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorPreviewModal;
