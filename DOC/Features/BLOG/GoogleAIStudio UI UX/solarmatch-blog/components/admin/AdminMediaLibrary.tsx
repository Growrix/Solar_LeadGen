
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Grid, 
  List, 
  Image as ImageIcon, 
  FileText, 
  Film, 
  MoreHorizontal, 
  Copy, 
  Trash2, 
  CheckCircle, 
  RotateCcw,
  FolderOpen,
  FolderInput,
  Menu,
  Edit,
  Calendar,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import SkeletonMediaGrid from './SkeletonMediaGrid';
import UploadMediaModal from './UploadMediaModal';
import ConfirmationModal from './ConfirmationModal';
import MediaDetailsModal from './MediaDetailsModal';
import FolderTree from './FolderTree';
import MoveMediaModal from './MoveMediaModal';
import BulkEditMediaModal from './BulkEditMediaModal';
import { ViewState } from '../../types';
import { useBlog, MediaItem, TrashedMediaItem } from '../../context/BlogContext';

type TabType = 'library' | 'trash';

const AdminMediaLibrary: React.FC = () => {
  const { media, trashedMedia, addMedia, moveMediaToTrash, restoreMediaFromTrash, permanentlyDeleteMedia, updateMedia, replaceMedia, renameMedia, bulkUpdateMedia, moveMediaToFolder, folders } = useBlog();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [activeTab, setActiveTab] = useState<TabType>('library');
  
  // Folder State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

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
  
  // Details Modal State
  const [detailsModalItem, setDetailsModalItem] = useState<MediaItem | null>(null);
  
  // Action Tracking
  const [actionItem, setActionItem] = useState<string | null>(null); // For single actions
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Menu State for Mobile
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
    // We don't reset currentFolderId here because you might want to see Trash then go back to same folder
  }, [activeTab]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      // Close date filter if clicking outside is handled by specific UI logic, usually separate ref approach but here simplistic
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
    // If in Library tab:
    // - If searching or filtering by date, ignore folder (search entire library)
    // - If not searching/filtering, filter by currentFolderId
    let matchesFolder = true;
    if (activeTab === 'library' && !searchQuery && !dateRange.start && !dateRange.end) {
        matchesFolder = item.folderId === currentFolderId || (currentFolderId === null && !item.folderId);
    }

    return matchesSearch && matchesType && matchesFolder && matchesDate;
  });

  // Get current folder name for display
  const currentFolderName = currentFolderId 
    ? folders.find(f => f.id === currentFolderId)?.name || 'Unknown Folder'
    : 'All Media';

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

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
    // If dragging an item that is NOT in the current selection, ignore the selection and drag just this item
    let idsToDrag = [item.id];
    if (selectedIds.has(item.id)) {
      idsToDrag = Array.from(selectedIds);
    }
    
    e.dataTransfer.setData('application/json', JSON.stringify({ mediaIds: idsToDrag }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a custom drag image if multiple items
    if (idsToDrag.length > 1) {
      const dragPreview = document.createElement('div');
      dragPreview.className = 'bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-xl absolute -top-96';
      dragPreview.textContent = `Moving ${idsToDrag.length} items`;
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 0, 0);
      setTimeout(() => document.body.removeChild(dragPreview), 0);
    }
  };

  const handleMoveToFolder = (targetFolderId: string | null, mediaIds: string[]) => {
    moveMediaToFolder(mediaIds, targetFolderId);
    setNotification({ 
      message: `${mediaIds.length} item${mediaIds.length !== 1 ? 's' : ''} moved successfully`, 
      type: 'success' 
    });
    // If we moved items out of the current view, clear selection
    if (currentFolderId !== targetFolderId) {
      setSelectedIds(new Set());
    }
  };

  // Item Click Handler (Opens Details Modal)
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
    
    // Update local snapshot for modal
    const newUrl = URL.createObjectURL(file);
    const newSize = (file.size / 1024 / 1024).toFixed(1) + ' MB';
    const newType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document';
    
    setDetailsModalItem(prev => prev ? {
        ...prev,
        name: file.name,
        url: newUrl,
        size: newSize,
        type: newType as any,
        uploadedAt: 'Just now'
    } : null);
  };

  // Actions
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

  // Single Item Action Triggers
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

  // Bulk Action Triggers
  const initiateBulkDelete = () => {
    setActionItem(null); // Null implies bulk
    setIsDeleteModalOpen(true);
  };

  const initiateBulkRestore = () => {
    setActionItem(null); // Null implies bulk
    setIsRestoreModalOpen(true);
  };

  const initiateBulkMove = () => {
    if (selectedIds.size > 0) {
      setIsMoveModalOpen(true);
    }
  };

  const initiateBulkEdit = () => {
    if (selectedIds.size > 0) {
      setIsBulkEditModalOpen(true);
    }
  };

  // Confirmations
  const confirmDelete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const idsToProcess = actionItem ? [actionItem] : Array.from(selectedIds);
      
      if (activeTab === 'library') {
        idsToProcess.forEach(id => moveMediaToTrash(id));
        setNotification({ 
          message: `${idsToProcess.length} item${idsToProcess.length > 1 ? 's' : ''} moved to trash`, 
          type: 'success' 
        });
      } else {
        idsToProcess.forEach(id => permanentlyDeleteMedia(id));
        setNotification({ 
          message: `${idsToProcess.length} item${idsToProcess.length > 1 ? 's' : ''} permanently deleted`, 
          type: 'success' 
        });
      }

      // Cleanup
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
      
      setNotification({ 
        message: `${idsToProcess.length} item${idsToProcess.length > 1 ? 's' : ''} restored`, 
        type: 'success' 
      });

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
    setNotification({ 
      message: `${idsToProcess.length} item${idsToProcess.length > 1 ? 's' : ''} moved`, 
      type: 'success' 
    });
    setSelectedIds(new Set());
  };

  const confirmBulkEdit = (updates: { altText?: string; caption?: string; tags?: string[] }) => {
    const idsToProcess = Array.from(selectedIds);
    bulkUpdateMedia(idsToProcess, updates);
    setNotification({ 
      message: `${idsToProcess.length} item${idsToProcess.length > 1 ? 's' : ''} updated`, 
      type: 'success' 
    });
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
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden relative">
      <UploadMediaModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleUploadComplete} 
      />

      <MediaDetailsModal
        isOpen={!!detailsModalItem}
        onClose={() => setDetailsModalItem(null)}
        mediaItem={detailsModalItem}
        onSave={handleSaveDetails}
        onDelete={initiateDelete}
        onReplace={handleReplaceMedia}
        onRename={handleRenameMedia}
      />

      <MoveMediaModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        selectedCount={selectedIds.size}
        onConfirm={confirmMove}
        folderType="media"
      />

      <BulkEditMediaModal 
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedCount={selectedIds.size}
        onConfirm={confirmBulkEdit}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isProcessing}
        title={activeTab === 'library' ? 'Move to Trash?' : 'Delete Permanently?'}
        message={activeTab === 'library' 
          ? `Are you sure you want to move ${actionItem ? 'this item' : `${selectedIds.size} items`} to trash?` 
          : `This action cannot be undone. ${actionItem ? 'This item' : `${selectedIds.size} items`} will be lost forever.`}
        confirmLabel={activeTab === 'library' ? 'Move to Trash' : 'Delete Forever'}
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={confirmRestore}
        isLoading={isProcessing}
        title="Restore Items?"
        message={`Are you sure you want to restore ${actionItem ? 'this item' : `${selectedIds.size} items`} to your library?`}
        confirmLabel="Restore"
        isDestructive={false}
      />

      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
             <CheckCircle className="w-5 h-5 text-green-400" />
             <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up">
          <div className="bg-slate-900 text-white pl-6 pr-4 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-slate-700">
            <div className="flex items-center gap-3">
              <span className="bg-white text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {selectedIds.size}
              </span>
              <span className="text-sm font-medium">Selected</span>
            </div>
            
            <div className="h-4 w-px bg-slate-700"></div>
            
            <div className="flex items-center gap-2">
               <button 
                 onClick={clearSelection}
                 className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
               >
                 Clear
               </button>

               {activeTab === 'trash' ? (
                   <button 
                     onClick={initiateBulkRestore}
                     className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-full transition-colors shadow-sm"
                   >
                     <RotateCcw className="w-4 h-4" />
                     Restore
                   </button>
               ) : (
                   <>
                     <button 
                       onClick={initiateBulkEdit}
                       className="flex items-center gap-2 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-full transition-colors shadow-sm"
                     >
                       <Edit className="w-4 h-4" />
                       Edit Details
                     </button>
                     <button 
                       onClick={initiateBulkMove}
                       className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-colors shadow-sm"
                     >
                       <FolderInput className="w-4 h-4" />
                       Move
                     </button>
                   </>
               )}

               <button 
                 onClick={initiateBulkDelete}
                 className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full transition-colors shadow-sm"
               >
                 <Trash2 className="w-4 h-4" />
                 {activeTab === 'library' ? 'Trash' : 'Delete'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (Folder Tree) */}
      <div className={`
        absolute inset-y-0 left-0 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 z-20
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Folders</h2>
        </div>
        <div className="p-4 h-[calc(100%-64px)] overflow-hidden">
          {activeTab === 'library' ? (
            <FolderTree 
              currentFolderId={currentFolderId} 
              onSelectFolder={(id) => { setCurrentFolderId(id); setIsSidebarOpen(false); }}
              onMoveToFolder={handleMoveToFolder}
              type="media"
            />
          ) : (
            <div className="text-sm text-slate-500 p-4 text-center">
              Folder organization is disabled in Trash view.
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-slate-900/50 z-10 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-6 flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {activeTab === 'library' ? (searchQuery || dateRange.start || dateRange.end ? 'Search Results' : currentFolderName) : 'Trash'}
                </h1>
                {activeTab === 'library' && !searchQuery && !dateRange.start && !dateRange.end && (
                  <p className="text-slate-500 text-sm mt-1">Manage files in this folder.</p>
                )}
              </div>
            </div>
            {activeTab === 'library' && (
              <div className="flex gap-3">
                <button 
                  onClick={handleUploadClick}
                  className="inline-flex items-center justify-center px-4 py-2 bg-solar-600 hover:bg-solar-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:ring-4 focus:ring-solar-100"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Media
                </button>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-6 mt-6 border-b border-transparent">
            <button
              onClick={() => setActiveTab('library')}
              className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'library' 
                  ? 'border-solar-600 text-solar-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Library
            </button>
            <button
              onClick={() => setActiveTab('trash')}
              className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'trash' 
                  ? 'border-red-600 text-red-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Trash ({trashedMedia.length})
            </button>
          </div>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Filters Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
             <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-1 no-scrollbar">
                {(['all', 'image', 'video', 'document'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all capitalize whitespace-nowrap ${
                      typeFilter === type 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {type === 'all' ? 'All Files' : type + 's'}
                  </button>
                ))}
             </div>

             <div className="flex items-center gap-3 w-full md:w-auto pr-2">
               
               {/* Thumbnail Slider */}
               {viewMode === 'grid' && (
                 <div className="hidden lg:flex items-center gap-2 px-2 border-r border-slate-200 mr-2">
                    <ZoomOut className="w-3 h-3 text-slate-400" />
                    <input 
                      type="range" 
                      min="120" 
                      max="380" 
                      step="10"
                      value={thumbnailSize}
                      onChange={(e) => setThumbnailSize(parseInt(e.target.value))}
                      className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-solar-600"
                      title="Adjust thumbnail size"
                    />
                    <ZoomIn className="w-3 h-3 text-slate-400" />
                 </div>
               )}

               {/* Date Filter Toggle */}
               <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className={`p-2 rounded-lg transition-colors border ${
                      showDateFilter || dateRange.start || dateRange.end
                        ? 'bg-solar-50 border-solar-200 text-solar-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                    title="Filter by Date"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  
                  {/* Date Popover */}
                  {showDateFilter && (
                    <div className="absolute top-full right-0 mt-2 p-4 bg-white border border-slate-200 rounded-xl shadow-xl z-20 w-72 animate-fade-in-up">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-semibold text-slate-900">Filter by Upload Date</h4>
                        <button 
                          onClick={() => {
                            setDateRange({ start: '', end: '' });
                            setShowDateFilter(false);
                          }} 
                          className="text-xs text-slate-400 hover:text-red-500"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Start Date</label>
                          <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">End Date</label>
                          <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
               </div>

               <div className="relative flex-grow md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="text"
                   placeholder="Search files..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all"
                 />
               </div>
               <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
               <div className="flex bg-slate-100 p-1 rounded-lg hidden sm:flex">
                  <button 
                     onClick={() => setViewMode('grid')}
                     className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                     <Grid className="w-4 h-4" />
                  </button>
                  <button 
                     onClick={() => setViewMode('list')}
                     className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                     <List className="w-4 h-4" />
                  </button>
               </div>
             </div>
          </div>

          {/* Content Area */}
          {viewState === 'loading' && <SkeletonMediaGrid />}

          {viewState === 'success' && filteredMedia.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-16 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                {activeTab === 'trash' ? <Trash2 className="w-8 h-8 text-slate-400" /> : <FolderOpen className="w-8 h-8 text-slate-400" />}
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                {activeTab === 'trash' ? 'Trash is empty' : 'Folder is empty'}
              </h3>
              <p className="text-slate-500 mt-1 mb-6 max-w-sm">
                {activeTab === 'trash' 
                  ? 'Deleted items will appear here.' 
                  : searchQuery || dateRange.start || dateRange.end
                    ? 'Try adjusting your filters.' 
                    : 'Upload media to populate this folder.'}
              </p>
              {activeTab === 'library' && !searchQuery && !dateRange.start && !dateRange.end && (
                <button 
                  onClick={handleUploadClick}
                  className="flex items-center gap-2 px-4 py-2 bg-solar-600 text-white font-medium rounded-lg hover:bg-solar-700 transition-colors"
                >
                  <Upload className="w-4 h-4" /> Upload Media
                </button>
              )}
            </div>
          )}

          {viewState === 'success' && filteredMedia.length > 0 && (
            <>
               {/* Select All Checkbox - Header for Grid */}
               {viewMode === 'grid' && (
                  <div className="mb-4 flex items-center px-2">
                     <label className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer">
                       <input 
                         type="checkbox" 
                         checked={filteredMedia.length > 0 && selectedIds.size === filteredMedia.length}
                         ref={input => {
                           if (input) {
                             input.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredMedia.length;
                           }
                         }}
                         onChange={handleSelectAll}
                         className="rounded border-slate-300 text-solar-600 focus:ring-solar-500 w-4 h-4 cursor-pointer"
                       />
                       {selectedIds.size > 0 
                         ? `${selectedIds.size} of ${filteredMedia.length} Selected`
                         : `Select All (${filteredMedia.length})`
                       }
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
                          {/* Checkbox Overlay - Click stops propagation to avoid opening details modal */}
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
                              <video 
                                src={item.url} 
                                className="w-full h-full object-cover" 
                                muted 
                                loop 
                                onMouseOver={(e) => e.currentTarget.play()} 
                                onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                              />
                            ) : (
                              <FileIcon type={item.type} />
                            )}
                            
                            {/* Hover Actions - Visible on hover */}
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2 backdrop-blur-[1px]">
                               {activeTab === 'library' ? (
                                 <>
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url); }}
                                     className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-sm transition-transform hover:scale-110"
                                     title="Copy URL"
                                   >
                                     <Copy className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); initiateDelete(item.id); }}
                                     className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-sm transition-transform hover:scale-110"
                                     title="Move to Trash"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                 </>
                               ) : (
                                 <>
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); initiateRestore(item.id); }}
                                     className="p-2 bg-white/90 hover:bg-white text-green-600 rounded-full shadow-sm transition-transform hover:scale-110"
                                     title="Restore"
                                   >
                                     <RotateCcw className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); initiateDelete(item.id); }}
                                     className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-sm transition-transform hover:scale-110"
                                     title="Delete Forever"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                 </>
                               )}
                            </div>
                          </div>
                          <div className="p-3 border-t border-slate-100 relative rounded-b-xl flex-grow">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-medium text-slate-700 truncate w-full" title={item.name}>{item.name}</h4>
                              <div className="relative sm:hidden">
                                <button 
                                  onClick={(e) => handleMenuToggle(e, item.id)}
                                  className="text-slate-400 hover:text-slate-600 p-1 -mr-1"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                {openMenuId === item.id && (
                                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden animate-fade-in">
                                    {activeTab === 'library' ? (
                                      <>
                                        <button onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                          <Copy className="w-3.5 h-3.5" /> Copy URL
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); initiateDelete(item.id); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                          <Trash2 className="w-3.5 h-3.5" /> Trash
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button onClick={(e) => { e.stopPropagation(); initiateRestore(item.id); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-green-600 hover:bg-green-50 flex items-center gap-2">
                                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); initiateDelete(item.id); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                          <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                              <span>{item.type.toUpperCase()}</span>
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
                             <input 
                               type="checkbox"
                               checked={filteredMedia.length > 0 && selectedIds.size === filteredMedia.length}
                               ref={input => {
                                 if (input) {
                                   input.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredMedia.length;
                                 }
                               }}
                               onChange={handleSelectAll}
                               className="rounded border-slate-300 text-solar-600 focus:ring-solar-500 w-4 h-4 cursor-pointer"
                             />
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {activeTab === 'library' ? 'Uploaded' : 'Trashed'}
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                         {filteredMedia.map((item) => {
                            const isSelected = selectedIds.has(item.id);
                            return (
                              <tr 
                                key={item.id} 
                                className={`transition-colors group hover:bg-slate-50 ${isSelected ? 'bg-solar-50/30' : ''} cursor-pointer`}
                                onClick={() => handleItemClick(item)}
                                draggable={activeTab === 'library'}
                                onDragStart={(e) => handleDragStart(e, item)}
                              >
                                 <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <input 
                                      type="checkbox" 
                                      checked={isSelected}
                                      onChange={(e) => { handleSelectOne(item.id, e); }}
                                      className="rounded border-slate-300 text-solar-600 focus:ring-solar-500 w-4 h-4 cursor-pointer"
                                    />
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                       <div className="h-10 w-10 flex-shrink-0 mr-4 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                                          {item.type === 'image' ? (
                                             <img className="h-full w-full object-cover" src={item.url} alt="" />
                                          ) : (
                                             <FileIcon type={item.type} className="w-5 h-5" />
                                          )}
                                       </div>
                                       <div className="text-sm font-medium text-slate-900 truncate max-w-xs" title={item.name}>{item.name}</div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                                       {item.type}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {item.size}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {activeTab === 'library' ? item.uploadedAt : (item as TrashedMediaItem).trashedAt}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-2">
                                       {activeTab === 'library' ? (
                                         <>
                                           <button 
                                             onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url); }}
                                             className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                                             title="Copy URL"
                                           >
                                              <Copy className="w-4 h-4" />
                                           </button>
                                           <button 
                                             onClick={(e) => { e.stopPropagation(); initiateDelete(item.id); }}
                                             className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                                             title="Trash"
                                           >
                                              <Trash2 className="w-4 h-4" />
                                           </button>
                                         </>
                                       ) : (
                                         <>
                                           <button 
                                             onClick={(e) => { e.stopPropagation(); initiateRestore(item.id); }}
                                             className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" 
                                             title="Restore"
                                           >
                                              <RotateCcw className="w-4 h-4" />
                                           </button>
                                           <button 
                                             onClick={(e) => { e.stopPropagation(); initiateDelete(item.id); }}
                                             className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                                             title="Delete Forever"
                                           >
                                              <Trash2 className="w-4 h-4" />
                                           </button>
                                         </>
                                       )}
                                    </div>
                                 </td>
                              </tr>
                            );
                         })}
                      </tbody>
                    </table>
                  </div>
               )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMediaLibrary;
