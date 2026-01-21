
import React, { useState } from 'react';
import { X, FolderInput, Loader2, Folder as FolderIcon } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

interface MoveMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (folderId: string | null) => void;
  folderType?: 'media' | 'post';
}

const MoveMediaModal: React.FC<MoveMediaModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedCount, 
  onConfirm,
  folderType = 'media'
}) => {
  const { folders } = useBlog();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(selectedFolderId);
      setIsProcessing(false);
      onClose();
    }, 500);
  };

  // Filter folders by type
  const typeFolders = folders.filter(f => f.type === folderType);

  // Helper to render indent options
  const renderFolderOptions = (parentId: string | null = null, depth = 0) => {
    const childFolders = typeFolders.filter(f => f.parentId === parentId);
    if (childFolders.length === 0) return null;

    return childFolders.map(folder => (
      <React.Fragment key={folder.id}>
        <option value={folder.id}>
          {'\u00A0\u00A0'.repeat(depth)} 📁 {folder.name}
        </option>
        {renderFolderOptions(folder.id, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={!isProcessing ? onClose : undefined}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderInput className="w-5 h-5 text-solar-600" />
            Move {selectedCount} Item{selectedCount !== 1 ? 's' : ''}
          </h3>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Destination Folder</label>
          <div className="relative">
             <select 
               value={selectedFolderId || 'root'}
               onChange={(e) => setSelectedFolderId(e.target.value === 'root' ? null : e.target.value)}
               className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:outline-none appearance-none bg-white"
             >
               <option value="root">🏠 Root</option>
               {renderFolderOptions(null)}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
               <FolderIcon className="w-4 h-4 text-slate-400" />
             </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Items will be moved from their current location to the selected folder.
          </p>
        </div>

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
            disabled={isProcessing}
            className="px-4 py-2 bg-solar-600 text-white rounded-lg font-medium hover:bg-solar-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderInput className="w-4 h-4" />}
            Move Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveMediaModal;
