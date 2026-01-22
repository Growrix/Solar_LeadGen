
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Upload, 
  Grid, 
  List, 
  Image as ImageIcon, 
  FileText, 
  Film, 
  Copy, 
  Trash2, 
  CheckCircle, 
  RotateCcw,
  FolderOpen,
  FolderInput,
  Folder as FolderIcon,
  MoreHorizontal,
  Edit2,
  Calendar,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Home,
  Plus,
  ArrowUp,
  X,
  Loader2
} from 'lucide-react';
import SkeletonMediaGrid from './SkeletonMediaGrid';
import UploadMediaModal from './UploadMediaModal';
import ConfirmationModal from './ConfirmationModal';
import MediaDetailsModal from './MediaDetailsModal';
import MoveMediaModal from './MoveMediaModal';
import BulkEditMediaModal from './BulkEditMediaModal';
import { ViewState } from '../../types';
import { useBlog, MediaItem, TrashedMediaItem, Folder } from '../../context/BlogContext';

type TabType = 'library' | 'trash';

const AdminMediaLibrary: React.FC = () => {
  const { media, trashedMedia, moveMediaToTrash, restoreMediaFromTrash, permanentlyDeleteMedia, updateMedia, replaceMedia, renameMedia, bulkUpdateMedia, moveMediaToFolder, folders, addFolder, renameFolder, deleteFolder } = useBlog();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [activeTab, setActiveTab] = useState<TabType>('library');
  
  // Folder State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [thumbnailSize, setThumbnailSize] = useState(200); // px
  
  // Date Filter State
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Feedback State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  
  // Folder Management Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState<'create' | 'rename'>('create');
  const [targetFolder, setTargetFolder] = useState<Folder | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [isFolderDeleteModalOpen, setIsFolderDeleteModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  // Details Modal State
  const [detailsModalItem, setDetailsModalItem] = useState<MediaItem | null>(null);
  
  // Action Tracking
  const [actionItem, setActionItem] = useState<string | null>(null); // For single actions
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null); // Media ID or Folder ID
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Initial Load Sim
  useEffect(() => {
    setViewState('loading');
    setTimeout(() => {
      setViewState('success');
    }, 500);
  }, []);

  // Clear selection on tab change
  useEffect(() => {
    setSelectedIds(new Set());
    setSearchQuery('');
    setTypeFilter('all');
  }, [activeTab]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Toast Timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const parseDate = (dateStr: string): number => {
    if (dateStr === 'Just now') return new Date().getTime();
    return Date.parse(dateStr) || 0;
  };

  // Data Filtering
  const sourceList = activeTab === 'library' ? media : trashedMedia;
  
  // Folders Logic
  const currentSubfolders = folders.filter(f => f.parentId === currentFolderId && f.type === 'media');
  
  const filteredMedia = sourceList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    // Date Filtering
    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const itemTime = parseDate(item.uploadedAt);
      if (dateRange.start) {
        const startTime = new Date(dateRange.start).setHours(0, 0, 0, 0);
        if (itemTime < startTime) matchesDate = false;
      }
      if (dateRange.end && matchesDate) {
        const endTime = new Date(dateRange.end).setHours(23, 59, 59, 999);
        if (itemTime > endTime) matchesDate = false;
      }
    }
    
    // Folder Logic:
    let matchesFolder = true;
    if (activeTab === 'library' && !searchQuery && !dateRange.start && !dateRange.end) {
        matchesFolder = item.folderId === currentFolderId || (currentFolderId === null && !item.folderId);
    }

    return matchesSearch && matchesType && matchesFolder && matchesDate;
  });

  // Breadcrumbs Logic
  const getBreadcrumbs = () => {
    const crumbs = [];
    let current = currentFolderId;
    while (current) {
      const folder = folders.find(f => f.id === current);
      if (folder) {
        crumbs.unshift({ id: folder.id, name: folder.name });
        current = folder.parentId;
      } else {
        break;
      }
    }
    return [{ id: null, name: 'Home' }, ...crumbs];
  };
  
  const breadcrumbs = getBreadcrumbs();

  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredMedia.map(m => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Drag and Drop Logic (Media Items)
  const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
    let idsToDrag = [item.id];
    if (selectedIds.has(item.id)) {
      idsToDrag = Array.from(selectedIds);
    }
    
    e.dataTransfer.setData('application/json', JSON.stringify({ mediaIds: idsToDrag }));
    e.dataTransfer.effectAllowed = 'move';
    
    if (idsToDrag.length > 1) {
      const dragPreview = document.createElement('div');
      dragPreview.className = 'bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-xl absolute -top-96';
      dragPreview.textContent = `Moving ${idsToDrag.length} items`;
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 0, 0);
      setTimeout(() => document.body.removeChild(dragPreview), 0);
    }
  };

  // Drag Over Folder Card
  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeTab === 'library') {
      setDragOverFolderId(folderId);
    }
  };

  const handleFolderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
  };

  const handleFolderDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
    
    try {
      const jsonStr = e.dataTransfer.getData('application/json');
      if (jsonStr) {
        const data = JSON.parse(jsonStr);
        if (data.mediaIds && data.mediaIds.length > 0) {
          moveMediaToFolder(data.mediaIds, targetId);
          setNotification({ 
            message: `${data.mediaIds.length} item${data.mediaIds.length !== 1 ? 's' : ''} moved to folder`, 
            type: 'success' 
          });
          setSelectedIds(new Set());
        }
      }
    } catch (err) {
      console.error('Drop failed', err);
    }
  };

  const handleMoveToFolder = (targetFolderId: string | null, mediaIds: string[]) => {
    moveMediaToFolder(mediaIds, targetFolderId);
    setNotification({ 
      message: `${mediaIds.length} item${mediaIds.length !== 1 ? 's' : ''} moved successfully`, 
      type: 'success' 
    });
    if (currentFolderId !== targetFolderId) {
      setSelectedIds(new Set());
    }
  };

  // Folder Management
  const handleCreateFolder = () => {
    setFolderModalMode('create');
    setTargetFolder(null);
    setFolderNameInput('');
    setIsFolderModalOpen(true);
  };

  const handleRenameFolder = (folder: Folder) => {
    setFolderModalMode('rename');
    setTargetFolder(folder);
    setFolderNameInput(folder.name);
    setIsFolderModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolderToDelete(folderId);
    setIsFolderDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const submitFolderForm = () => {
    if (!folderNameInput.trim()) return;
    
    if (folderModalMode === 'create') {
      addFolder(folderNameInput, currentFolderId, 'media');
      setNotification({ message: 'Folder created', type: 'success' });
    } else if (targetFolder) {
      renameFolder(targetFolder.id, folderNameInput);
      setNotification({ message: 'Folder renamed', type: 'success' });
    }
    
    setIsFolderModalOpen(false);
  };

  const confirmDeleteFolder = () => {
    if (folderToDelete) {
      deleteFolder(folderToDelete);
      setNotification({ message: 'Folder deleted', type: 'success' });
      setIsFolderDeleteModalOpen(false);
      setFolderToDelete(null);
    }
  };

  // Other Actions
  const handleItemClick = (item: MediaItem) => {
    if (activeTab === 'library') {
      setDetailsModalItem(item);
    }
  };

  const handleSaveDetails = (id: string, data: { altText: string; caption: string; tags: string[] }) => {
    updateMedia(id, data);
    setNotification({ message: 'Media details saved successfully', type: 'success' });
  };

  const handleRenameMedia = (id: string, newName: string) => {
    renameMedia(id, newName);
    setNotification({ message: 'File renamed successfully', type: 'success' });
    setDetailsModalItem(prev => prev ? { ...prev, name: newName } : null);
  };

  const handleReplaceMedia = (id: string, file: File) => {
    replaceMedia(id, file);
    setNotification({ message: 'File replaced successfully', type: 'success' });
    const newUrl = URL.createObjectURL(file);
    const newSize = (file.size / 1024 / 1024).toFixed(1) + ' MB';
    const newType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document';
    setDetailsModalItem(prev => prev ? { ...prev, name: file.name, url: newUrl, size: newSize, type: newType as any, uploadedAt: 'Just now' } : null);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setNotification({ message: 'URL copied to clipboard', type: 'success' });
    setOpenMenuId(null);
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadComplete = () => {
    setNotification({ message: 'Files uploaded successfully', type: 'success' });
  };

  // Action Triggers
  const initiateDelete = (id: string) => {
    setActionItem(id);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const initiateRestore = (id: string) => {
    setActionItem(id);
    setIsRestoreModalOpen(true);
    setOpenMenuId(null);
  };

  const initiateBulkDelete = () => {
    setActionItem(null);
    setIsDeleteModalOpen(true);
  };

  const initiateBulkRestore = () => {
    setActionItem(null);
    setIsRestoreModalOpen(true);
  };

  const initiateBulkMove = () => {
    if (selectedIds.size > 0) setIsMoveModalOpen(true);
  };

  const initiateBulkEdit = () => {
    if (selectedIds.size > 0) setIsBulkEditModalOpen(true);
  };

  const confirmDelete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const idsToProcess = actionItem ? [actionItem] : Array.from(selectedIds);
      if (activeTab === 'library') {
        idsToProcess.forEach(id => moveMediaToTrash(id));
        setNotification({ message: `${idsToProcess.length} item(s) moved to trash`, type: 'success' });
      } else {
        idsToProcess.forEach(id => permanentlyDeleteMedia(id));
        setNotification({ message: `${idsToProcess.length} item(s) permanently deleted`, type: 'success' });
      }
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        idsToProcess.forEach(id => newSet.delete(id));
        return newSet;
      });
      setActionItem(null);
      setIsProcessing(false);
      setIsDeleteModalOpen(false);
    }, 500);
  };

  const confirmRestore = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const idsToProcess = actionItem ? [actionItem] : Array.from(selectedIds);
      idsToProcess.forEach(id => restoreMediaFromTrash(id));
      setNotification({ message: `${idsToProcess.length} item(s) restored`, type: 'success' });
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        idsToProcess.forEach(id => newSet.delete(id));
        return newSet;
      });
      setActionItem(null);
      setIsProcessing(false);
      setIsRestoreModalOpen(false);
    }, 500);
  };

  const confirmMove = (targetFolderId: string | null) => {
    const idsToProcess = Array.from(selectedIds);
    moveMediaToFolder(idsToProcess, targetFolderId);
    setNotification({ message: `${idsToProcess.length} item(s) moved`, type: 'success' });
    setSelectedIds(new Set());
  };

  const confirmBulkEdit = (updates: { altText?: string; caption?: string; tags?: string[] }) => {
    const idsToProcess = Array.from(selectedIds);
    bulkUpdateMedia(idsToProcess, updates);
    setNotification({ message: `${idsToProcess.length} item(s) updated`, type: 'success' });
    setSelectedIds(new Set());
  };

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const FileIcon = ({ type, className = "w-8 h-8" }: { type: string, className?: string }) => {
    switch (type) {
      case 'image': return <ImageIcon className={`${className} text-purple-500`} />;
      case 'video': return <Film className={`${className} text-red-500`} />;
      case 'document': return <FileText className={`${className} text-blue-500`} />;
      default: return <FileText className={`${className} text-slate-500`} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hidden Modals */}
      <UploadMediaModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUploadComplete} />
      <MediaDetailsModal isOpen={!!detailsModalItem} onClose={() => setDetailsModalItem(null)} mediaItem={detailsModalItem} onSave={handleSaveDetails} onDelete={initiateDelete} onReplace={handleReplaceMedia} onRename={handleRenameMedia} />
      <MoveMediaModal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)} selectedCount={selectedIds.size} onConfirm={confirmMove} folderType="media" />
      <BulkEditMediaModal isOpen={isBulkEditModalOpen} onClose={() => setIsBulkEditModalOpen(false)} selectedCount={selectedIds.size} onConfirm={confirmBulkEdit} />
      
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} isLoading={isProcessing} title={activeTab === 'library' ? 'Move to Trash?' : 'Delete Permanently?'} message={activeTab === 'library' ? 'Are you sure you want to move selected items to trash?' : 'This action cannot be undone.'} confirmLabel={activeTab === 'library' ? 'Move to Trash' : 'Delete Forever'} isDestructive={true} />
      <ConfirmationModal isOpen={isRestoreModalOpen} onClose={() => setIsRestoreModalOpen(false)} onConfirm={confirmRestore} isLoading={isProcessing} title="Restore Items?" message="Restore selected items to library?" confirmLabel="Restore" isDestructive={false} />
      
      {/* Folder Management Modals */}
      <ConfirmationModal isOpen={isFolderDeleteModalOpen} onClose={() => setIsFolderDeleteModalOpen(false)} onConfirm={confirmDeleteFolder} title="Delete Folder?" message="Items inside will be moved to the root directory." confirmLabel="Delete Folder" isDestructive={true} />
      
      {/* Simple Folder Form Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsFolderModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-sm animate-fade-in-up">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{folderModalMode === 'create' ? 'New Folder' : 'Rename Folder'}</h3>
            <input 
              autoFocus 
              type="text" 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-solar-500 outline-none" 
              placeholder="Folder Name"
              value={folderNameInput}
              onChange={e => setFolderNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitFolderForm()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsFolderModalOpen(false)} className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={submitFolderForm} disabled={!folderNameInput.trim()} className="px-4 py-2 bg-solar-600 text-white rounded-lg text-sm font-medium hover:bg-solar-700 disabled:opacity-50">
                {folderModalMode === 'create' ? 'Create' : 'Rename'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
             <CheckCircle className="w-5 h-5 text-green-400" />
             <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up">
          <div className="bg-slate-900 text-white pl-6 pr-4 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-slate-700">
            <div className="flex items-center gap-3">
              <span className="bg-white text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">{selectedIds.size}</span>
              <span className="text-sm font-medium">Selected</span>
            </div>
            <div className="h-4 w-px bg-slate-700"></div>
            <div className="flex items-center gap-2">
               <button onClick={clearSelection} className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Clear</button>
               {activeTab === 'trash' ? (
                   <button onClick={initiateBulkRestore} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-full transition-colors shadow-sm">
                     <RotateCcw className="w-4 h-4" /> Restore
                   </button>
               ) : (
                   <>
                     <button onClick={initiateBulkEdit} className="flex items-center gap-2 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-full transition-colors shadow-sm">
                       <Edit2 className="w-4 h-4" /> Edit
                     </button>
                     <button onClick={initiateBulkMove} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-colors shadow-sm">
                       <FolderInput className="w-4 h-4" /> Move
                     </button>
                   </>
               )}
               <button onClick={initiateBulkDelete} className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full transition-colors shadow-sm">
                 <Trash2 className="w-4 h-4" /> {activeTab === 'library' ? 'Trash' : 'Delete'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Area */}
      <div className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-20">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
               {/* Breadcrumbs */}
               <nav className="flex items-center text-sm font-medium text-slate-500 overflow-x-auto no-scrollbar whitespace-nowrap">
                 {activeTab === 'library' ? (
                   breadcrumbs.map((crumb, index) => (
                     <React.Fragment key={crumb.id || 'root'}>
                       {index > 0 && <ChevronRight className="w-4 h-4 mx-1 text-slate-300 flex-shrink-0" />}
                       <button 
                         onClick={() => setCurrentFolderId(crumb.id)}
                         className={`hover:text-solar-600 transition-colors flex items-center gap-1.5 ${index === breadcrumbs.length - 1 ? 'text-slate-900 font-bold' : ''}`}
                       >
                         {index === 0 && <Home className="w-4 h-4" />}
                         {crumb.name}
                       </button>
                     </React.Fragment>
                   ))
                 ) : (
                   <span className="flex items-center gap-2 text-slate-900 font-bold"><Trash2 className="w-4 h-4" /> Trash</span>
                 )}
               </nav>
               {activeTab === 'library' && !searchQuery && (
                 <p className="text-xs text-slate-400">
                   {currentSubfolders.length} folders, {filteredMedia.length} files
                 </p>
               )}
            </div>

            {/* Top Actions */}
            {activeTab === 'library' && (
              <div className="flex gap-2">
                <button 
                  onClick={handleCreateFolder}
                  className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors text-sm"
                >
                  <FolderInput className="w-4 h-4 mr-2" />
                  New Folder
                </button>
                <button 
                  onClick={handleUploadClick}
                  className="inline-flex items-center justify-center px-4 py-2 bg-solar-600 hover:bg-solar-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </button>
              </div>
            )}
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
             <div className="flex gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
                <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                  <button onClick={() => setActiveTab('library')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'library' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Library</button>
                  <button onClick={() => setActiveTab('trash')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'trash' ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:text-slate-700'}`}>Trash</button>
                </div>
                
                <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

                <div className="flex items-center gap-1">
                  {(['all', 'image', 'video', 'document'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize whitespace-nowrap ${
                        typeFilter === type ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-white/50'
                      }`}
                    >
                      {type === 'all' ? 'All' : type + 's'}
                    </button>
                  ))}
                </div>
             </div>

             <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative flex-grow md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                 <input
                   type="text"
                   placeholder="Search..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all"
                 />
               </div>
               
               {viewMode === 'grid' && (
                 <div className="hidden lg:flex items-center gap-2 px-2">
                    <ZoomOut className="w-3 h-3 text-slate-400" />
                    <input 
                      type="range" min="120" max="380" step="10"
                      value={thumbnailSize}
                      onChange={(e) => setThumbnailSize(parseInt(e.target.value))}
                      className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-solar-600"
                    />
                    <ZoomIn className="w-3 h-3 text-slate-400" />
                 </div>
               )}

               <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}><Grid className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}><List className="w-3.5 h-3.5" /></button>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {viewState === 'loading' && <SkeletonMediaGrid />}

        {viewState === 'success' && filteredMedia.length === 0 && currentSubfolders.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
             <div className="bg-white p-4 rounded-full shadow-sm mb-4">
               <FolderOpen className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="text-sm font-medium text-slate-900">Empty Folder</h3>
             <p className="text-xs text-slate-500 mt-1 mb-4">Drag files here or start by creating a new folder.</p>
             {activeTab === 'library' && (
               <div className="flex gap-3">
                 <button onClick={handleCreateFolder} className="text-xs font-medium text-solar-600 hover:underline">Create Folder</button>
                 <span className="text-slate-300">|</span>
                 <button onClick={handleUploadClick} className="text-xs font-medium text-solar-600 hover:underline">Upload File</button>
               </div>
             )}
          </div>
        )}

        {viewState === 'success' && (filteredMedia.length > 0 || currentSubfolders.length > 0) && (
          <>
             {/* Folders Grid */}
             {activeTab === 'library' && currentSubfolders.length > 0 && !searchQuery && (
               <div className="mb-8">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Folders</h4>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                   {currentSubfolders.map(folder => (
                     <div 
                       key={folder.id}
                       onClick={() => setCurrentFolderId(folder.id)}
                       onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                       onDragLeave={handleFolderDragLeave}
                       onDrop={(e) => handleFolderDrop(e, folder.id)}
                       className={`group relative flex flex-col p-4 bg-white border rounded-xl cursor-pointer transition-all hover:shadow-md ${dragOverFolderId === folder.id ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-slate-200 hover:border-solar-300'}`}
                     >
                       <div className="flex justify-between items-start">
                         <FolderIcon className={`w-8 h-8 mb-3 ${dragOverFolderId === folder.id ? 'text-blue-500 fill-blue-100' : 'text-yellow-400 fill-yellow-50'}`} />
                         
                         {/* Folder Menu */}
                         <div className="relative" onClick={e => e.stopPropagation()}>
                           <button 
                             onClick={() => setOpenMenuId(openMenuId === folder.id ? null : folder.id)}
                             className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-opacity"
                           >
                             <MoreHorizontal className="w-4 h-4" />
                           </button>
                           {openMenuId === folder.id && (
                             <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden text-xs py-1">
                               <button onClick={() => handleRenameFolder(folder)} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                 <Edit2 className="w-3 h-3" /> Rename
                               </button>
                               <button onClick={() => handleDeleteFolder(folder.id)} className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600">
                                 <Trash2 className="w-3 h-3" /> Delete
                               </button>
                             </div>
                           )}
                         </div>
                       </div>
                       <span className="text-sm font-medium text-slate-700 truncate" title={folder.name}>{folder.name}</span>
                       <span className="text-[10px] text-slate-400 mt-1">
                         {/* Mock item count logic */}
                         {media.filter(m => m.folderId === folder.id).length} items
                       </span>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Media Grid */}
             {filteredMedia.length > 0 && (
               <div>
                 {currentSubfolders.length > 0 && <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Files</h4>}
                 
                 {/* Select All Checkbox */}
                 {viewMode === 'grid' && (
                    <div className="mb-4 flex items-center px-1">
                       <label className="flex items-center gap-2 text-xs text-slate-500 font-medium cursor-pointer hover:text-slate-700 select-none">
                         <input 
                           type="checkbox" 
                           checked={filteredMedia.length > 0 && selectedIds.size === filteredMedia.length}
                           ref={input => { if (input) input.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredMedia.length; }}
                           onChange={handleSelectAll}
                           className="rounded border-slate-300 text-solar-600 focus:ring-solar-500 w-3.5 h-3.5 cursor-pointer"
                         />
                         {selectedIds.size > 0 ? `${selectedIds.size} Selected` : 'Select All Files'}
                       </label>
                    </div>
                 )}

                 {viewMode === 'grid' ? (
                    <div 
                      className="grid gap-4 animate-fade-in pb-20"
                      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${thumbnailSize}px, 1fr))` }}
                    >
                      {filteredMedia.map((item) => {
                        const isSelected = selectedIds.has(item.id);
                        return (
                          <div 
                            key={item.id} 
                            className={`group relative bg-white border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col ${isSelected ? 'ring-2 ring-solar-500 border-solar-500' : 'border-slate-200'}`}
                            onClick={() => handleItemClick(item)}
                            draggable={activeTab === 'library'}
                            onDragStart={(e) => handleDragStart(e, item)}
                          >
                            <div className={`absolute top-2 left-2 z-10 ${isSelected ? 'block' : 'hidden group-hover:block'}`} onClick={(e) => e.stopPropagation()}>
                               <input 
                                 type="checkbox" 
                                 checked={isSelected}
                                 onChange={(e) => { handleSelectOne(item.id, e); }}
                                 className="w-5 h-5 rounded border-slate-300 text-solar-600 focus:ring-solar-500 cursor-pointer shadow-sm"
                               />
                            </div>

                            <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center rounded-t-xl">
                              {item.type === 'image' ? (
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                              ) : item.type === 'video' ? (
                                <video src={item.url} className="w-full h-full object-cover" muted loop onMouseOver={(e) => e.currentTarget.play()} onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                              ) : (
                                <FileIcon type={item.type} />
                              )}
                              
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                 <button onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url); }} className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-sm transition-transform hover:scale-110" title="Copy URL">
                                   <Copy className="w-4 h-4" />
                                 </button>
                                 <button onClick={(e) => { e.stopPropagation(); activeTab === 'library' ? initiateDelete(item.id) : initiateRestore(item.id); }} className={`p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-transform hover:scale-110 ${activeTab === 'library' ? 'text-red-600' : 'text-green-600'}`} title={activeTab === 'library' ? 'Trash' : 'Restore'}>
                                   {activeTab === 'library' ? <Trash2 className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                                 </button>
                              </div>
                            </div>
                            <div className="p-3 border-t border-slate-100 relative rounded-b-xl flex-grow">
                              <h4 className="text-sm font-medium text-slate-700 truncate w-full" title={item.name}>{item.name}</h4>
                              <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                                <span className="uppercase">{item.type}</span>
                                <span>{item.size}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                 ) : (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in pb-20">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th scope="col" className="w-12 px-6 py-3 text-left">
                               <input type="checkbox" checked={filteredMedia.length > 0 && selectedIds.size === filteredMedia.length} ref={input => { if (input) input.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredMedia.length; }} onChange={handleSelectAll} className="rounded border-slate-300 text-solar-600 focus:ring-solar-500 w-4 h-4 cursor-pointer" />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                           {filteredMedia.map((item) => {
                              const isSelected = selectedIds.has(item.id);
                              return (
                                <tr key={item.id} className={`transition-colors group hover:bg-slate-50 ${isSelected ? 'bg-solar-50/30' : ''} cursor-pointer`} onClick={() => handleItemClick(item)} draggable={activeTab === 'library'} onDragStart={(e) => handleDragStart(e, item)}>
                                   <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <input type="checkbox" checked={isSelected} onChange={(e) => { handleSelectOne(item.id, e); }} className="rounded border-slate-300 text-solar-600 focus:ring-solar-500 w-4 h-4 cursor-pointer" />
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                         <div className="h-10 w-10 flex-shrink-0 mr-4 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                                            {item.type === 'image' ? (<img className="h-full w-full object-cover" src={item.url} alt="" />) : (<FileIcon type={item.type} className="w-5 h-5" />)}
                                         </div>
                                         <div className="text-sm font-medium text-slate-900 truncate max-w-xs" title={item.name}>{item.name}</div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 capitalize">{item.type}</span></td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.size}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{activeTab === 'library' ? item.uploadedAt : (item as TrashedMediaItem).trashedAt}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-2">
                                         <button onClick={() => handleCopyUrl(item.url)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Copy className="w-4 h-4" /></button>
                                         <button onClick={() => activeTab === 'library' ? initiateDelete(item.id) : initiateRestore(item.id)} className={`p-1.5 rounded transition-colors ${activeTab === 'library' ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}>
                                            {activeTab === 'library' ? <Trash2 className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                                         </button>
                                      </div>
                                   </td>
                                </tr>
                              );
                           })}
                        </tbody>
                      </table>
                    </div>
                 )}
               </div>
             )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMediaLibrary;
