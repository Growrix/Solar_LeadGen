
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Bot, Server, FileText, AlertCircle } from 'lucide-react';

export interface ModelProfileData {
  id: string;
  name: string;
  provider: string;
  description: string;
  enabled: boolean;
}

interface ModelProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ModelProfileData, 'id'>) => void;
  initialData?: ModelProfileData | null;
  isLoading?: boolean;
}

const ModelProfileModal: React.FC<ModelProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    provider: 'Google (Vertex AI)',
    description: '',
    enabled: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          provider: initialData.provider,
          description: initialData.description,
          enabled: initialData.enabled
        });
      } else {
        setFormData({
          name: '',
          provider: 'Google (Vertex AI)',
          description: '',
          enabled: true
        });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Model Name is required');
      return;
    }
    if (!formData.provider.trim()) {
      setError('Provider is required');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-solar-600" />
            {initialData ? 'Edit Model Profile' : 'Add Model Profile'}
          </h3>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Model Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Gemini 1.5 Pro"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Provider <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={formData.provider}
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all bg-white"
              >
                <option value="Google (Vertex AI)">Google (Vertex AI)</option>
                <option value="OpenAI">OpenAI</option>
                <option value="Anthropic">Anthropic</option>
                <option value="Custom/Self-Hosted">Custom / Self-Hosted</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Briefly describe the use case (e.g. 'High reasoning for complex drafts')"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all resize-none text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
             <input 
               type="checkbox"
               id="model-enabled"
               checked={formData.enabled}
               onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
               className="w-4 h-4 rounded border-slate-300 text-solar-600 focus:ring-solar-500 cursor-pointer"
             />
             <label htmlFor="model-enabled" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
               Enable this profile for automation workflows
             </label>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-solar-600 text-white rounded-lg font-medium hover:bg-solar-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelProfileModal;
