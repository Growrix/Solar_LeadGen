
import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, Tag, Type, AlignLeft } from 'lucide-react';

interface BulkEditMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (data: { altText?: string; caption?: string; tags?: string[] }) => void;
}

const BulkEditMediaModal: React.FC<BulkEditMediaModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedCount, 
  onConfirm 
}) => {
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  
  const [updateAlt, setUpdateAlt] = useState(false);
  const [updateCaption, setUpdateCaption] = useState(false);
  const [updateTags, setUpdateTags] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setAltText('');
      setCaption('');
      setTags('');
      setUpdateAlt(false);
      setUpdateCaption(false);
      setUpdateTags(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsProcessing(true);
    
    const updates: { altText?: string; caption?: string; tags?: string[] } = {};
    
    if (updateAlt) updates.altText = altText;
    if (updateCaption) updates.caption = caption;
    if (updateTags) {
      // Parse comma-separated tags
      updates.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    setTimeout(() => {
      onConfirm(updates);
      setIsProcessing(false);
      onClose();
    }, 500);
  };

  const hasUpdates = updateAlt || updateCaption || updateTags;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={!isProcessing ? onClose : undefined}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Bulk Edit Metadata</h3>
            <p className="text-sm text-slate-500">Editing {selectedCount} items</p>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
            Select the fields you want to update. Only checked fields will be overwritten for all selected items.
          </p>

          {/* Alt Text Field */}
          <div className={`space-y-2 p-4 border rounded-lg transition-colors ${updateAlt ? 'border-solar-500 bg-solar-50/10' : 'border-slate-200'}`}>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={updateAlt} 
                onChange={(e) => setUpdateAlt(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-solar-600 focus:ring-solar-500"
              />
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Type className="w-4 h-4 text-slate-400" /> Alt Text (SEO)
              </span>
            </label>
            <input 
              type="text" 
              value={altText} 
              onChange={(e) => setAltText(e.target.value)}
              disabled={!updateAlt}
              placeholder="Descriptive text for screen readers..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {/* Caption Field */}
          <div className={`space-y-2 p-4 border rounded-lg transition-colors ${updateCaption ? 'border-solar-500 bg-solar-50/10' : 'border-slate-200'}`}>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={updateCaption} 
                onChange={(e) => setUpdateCaption(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-solar-600 focus:ring-solar-500"
              />
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-slate-400" /> Caption
              </span>
            </label>
            <textarea 
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={!updateCaption}
              placeholder="Display caption..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:outline-none resize-none disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {/* Tags Field */}
          <div className={`space-y-2 p-4 border rounded-lg transition-colors ${updateTags ? 'border-solar-500 bg-solar-50/10' : 'border-slate-200'}`}>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={updateTags} 
                onChange={(e) => setUpdateTags(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-solar-600 focus:ring-solar-500"
              />
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" /> Tags
              </span>
            </label>
            <input 
              type="text" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)}
              disabled={!updateTags}
              placeholder="e.g. solar, outdoor, installation (comma separated)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
            />
            <p className="text-xs text-slate-400 pl-6">Replaces existing tags on selected items.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isProcessing || !hasUpdates}
            className="px-4 py-2 bg-solar-600 text-white rounded-lg font-medium hover:bg-solar-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Update {selectedCount} Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkEditMediaModal;
