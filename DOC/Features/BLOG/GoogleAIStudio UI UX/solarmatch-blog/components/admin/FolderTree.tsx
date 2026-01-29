
import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal, 
  Plus, 
  Edit2, 
  Trash2,
  HardDrive,
  FileText
} from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import ConfirmationModal from './ConfirmationModal';

interface FolderTreeProps {
  currentFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onMoveToFolder?: (folderId: string | null, itemIds: string[]) => void;
  type: 'media' | 'post';
}

const FolderTree: React.FC<FolderTreeProps> = ({ currentFolderId, onSelectFolder, onMoveToFolder, type }) => {
  const { folders, addFolder, deleteFolder, renameFolder } = useBlog();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [isAddingToId, setIsAddingToId] = useState<string | null>(null); // 'root' or folder ID
  const [newFolderName, setNewFolderName] = useState('');

  // Delete Folder Modal
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);
  const [folderIdToDelete, setFolderIdToDelete] = useState<string | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  
  // Drag State
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null | 'root'>(null);

  // Filter folders by type
  const typeFolders = folders.filter(f => f.type === type);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = (parentId: string | null) => {
    if (newFolderName.trim()) {
      addFolder(newFolderName, parentId, type);
      setNewFolderName('');
      setIsAddingToId(null);
      if (parentId) {
        setExpandedFolders(prev => new Set(prev).add(parentId));
      }
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameFolder(id, editName);
      setEditingId(null);
      setActionMenuId(null);
    }
  };

  const handleDelete = (id: string) => {
    setFolderIdToDelete(id);
    setIsDeleteFolderModalOpen(true);
    setActionMenuId(null);
  };

  const confirmDeleteFolder = () => {
    if (!folderIdToDelete) return;
    setIsDeletingFolder(true);
    setTimeout(() => {
      deleteFolder(folderIdToDelete);
      if (currentFolderId === folderIdToDelete) onSelectFolder(null);
      setIsDeletingFolder(false);
      setIsDeleteFolderModalOpen(false);
      setFolderIdToDelete(null);
    }, 400);
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
    setActionMenuId(null);
  };

  // Drag Handlers
  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    if (!onMoveToFolder) return;
    setDragOverFolderId(folderId === null ? 'root' : folderId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
    
    if (!onMoveToFolder) return;

    // Try to get data. Support both JSON (from Media Library) and plain text (from Post List/Native)
    let ids: string[] = [];
    
    try {
      const jsonStr = e.dataTransfer.getData('application/json');
      if (jsonStr) {
        const data = JSON.parse(jsonStr);
        if (data.mediaIds) ids = data.mediaIds;
        if (data.postIds) ids = data.postIds;
      } else {
        const plainId = e.dataTransfer.getData('text/plain');
        if (plainId) ids = [plainId];
      }
    } catch (err) {
      // Fallback for simple ID
      const plainId = e.dataTransfer.getData('text/plain');
      if (plainId) ids = [plainId];
    }

    if (ids.length > 0) {
      onMoveToFolder(targetFolderId, ids);
    }
  };

  const renderFolder = (folderId: string | null, depth = 0) => {
    const childFolders = typeFolders.filter(f => f.parentId === folderId);
    const isRoot = folderId === null;
    const isExpanded = isRoot ? true : expandedFolders.has(folderId);
    const folder = isRoot ? null : typeFolders.find(f => f.id === folderId);
    
    // Check if this specific folder is being hovered
    const isDragOver = isRoot ? dragOverFolderId === 'root' : dragOverFolderId === folderId;

    // Root special case
    if (isRoot) {
      return (
        <div className="select-none">
          <div 
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors mb-1 ${
              currentFolderId === null 
                ? 'bg-solar-100 text-solar-900' 
                : isDragOver 
                  ? 'bg-blue-100 ring-2 ring-blue-400 text-blue-900' 
                  : 'hover:bg-slate-100 text-slate-700'
            }`}
            onClick={() => onSelectFolder(null)}
            onDragOver={(e) => handleDragOver(e, null)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
          >
            {type === 'media' ? <HardDrive className={`w-4 h-4 ${currentFolderId === null ? 'text-solar-600' : 'text-slate-400'}`} /> : <FileText className={`w-4 h-4 ${currentFolderId === null ? 'text-solar-600' : 'text-slate-400'}`} />}
            <span className="flex-1 text-sm font-medium">{type === 'media' ? 'All Media' : 'All Posts'}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsAddingToId('root'); }}
              className="p-1 text-slate-400 hover:text-solar-600 hover:bg-slate-200 rounded"
              title="New Root Folder"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {isAddingToId === 'root' && (
            <div className="pl-6 pr-2 mb-2 flex gap-2">
              <input 
                type="text" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full text-xs px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-solar-500 outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder(null);
                  if (e.key === 'Escape') setIsAddingToId(null);
                }}
              />
            </div>
          )}

          <div className="pl-0">
            {childFolders.map(child => renderFolder(child.id, depth))}
          </div>
        </div>
      );
    }

    if (!folder) return null;

    const isActive = currentFolderId === folder.id;
    const hasChildren = childFolders.length > 0;

    return (
      <div key={folder.id} className="select-none relative">
        <div 
          className={`flex items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-colors group mb-0.5 ${
            isActive 
              ? 'bg-solar-100 text-solar-900' 
              : isDragOver
                ? 'bg-blue-100 ring-2 ring-blue-400 text-blue-900'
                : 'hover:bg-slate-100 text-slate-700'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => onSelectFolder(folder.id)}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
        >
          {/* Toggle Icon */}
          <div 
            className={`p-0.5 rounded hover:bg-black/5 ${hasChildren ? 'visible' : 'invisible'}`}
            onClick={(e) => toggleExpand(folder.id, e)}
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </div>

          {/* Folder Icon */}
          {isExpanded ? (
            <FolderOpen className={`w-4 h-4 ${isActive ? 'text-solar-600' : 'text-slate-400'}`} />
          ) : (
            <Folder className={`w-4 h-4 ${isActive ? 'text-solar-600' : 'text-slate-400'}`} />
          )}

          {/* Name or Edit Input */}
          {editingId === folder.id ? (
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 min-w-0 text-sm px-1 py-0.5 border border-slate-300 rounded focus:ring-1 focus:ring-solar-500 outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onBlur={() => handleRename(folder.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(folder.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
            />
          ) : (
            <span className="flex-1 text-sm truncate">{folder.name}</span>
          )}

          {/* Actions Menu Trigger */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === folder.id ? null : folder.id); }}
              className={`p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 ${actionMenuId === folder.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {actionMenuId === folder.id && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden text-xs">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsAddingToId(folder.id); setActionMenuId(null); setExpandedFolders(prev => new Set(prev).add(folder.id)); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" /> Subfolder
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); startEditing(folder.id, folder.name); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit2 className="w-3 h-3" /> Rename
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(folder.id); }}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Inline Add Input */}
        {isAddingToId === folder.id && (
          <div className="mb-1 pr-2 flex gap-2" style={{ paddingLeft: `${(depth + 1) * 12 + 24}px` }}>
            <input 
              type="text" 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full text-xs px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-solar-500 outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder(folder.id);
                if (e.key === 'Escape') setIsAddingToId(null);
              }}
            />
          </div>
        )}

        {/* Children */}
        {isExpanded && childFolders.length > 0 && (
          <div>
            {childFolders.map(child => renderFolder(child.id, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <ConfirmationModal
        isOpen={isDeleteFolderModalOpen}
        onClose={() => {
          if (isDeletingFolder) return;
          setIsDeleteFolderModalOpen(false);
          setFolderIdToDelete(null);
        }}
        onConfirm={confirmDeleteFolder}
        isLoading={isDeletingFolder}
        title="Delete folder?"
        message="Items inside will be moved to root."
        confirmLabel="Delete folder"
        isDestructive={true}
      />
      <div className="flex-1 overflow-y-auto">
        {renderFolder(null)}
      </div>
      
      {/* Backdrop for closing menus */}
      {actionMenuId && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActionMenuId(null)} />
      )}
    </div>
  );
};

export default FolderTree;
