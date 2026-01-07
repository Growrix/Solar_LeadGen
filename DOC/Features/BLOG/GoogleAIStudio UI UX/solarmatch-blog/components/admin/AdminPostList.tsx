
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit2, Eye, Trash2, AlertCircle, 
  RefreshCw, FileText, CheckCircle, RotateCcw, 
  Clock, Archive, LayoutGrid, List, MoreVertical,
  Calendar, User, GripVertical, AlertTriangle,
  Send, Tag, Settings, SlidersHorizontal, X, Check
} from 'lucide-react';
import { AdminPost, ViewState, PostStatus, TrashedPost } from '../../types';
import { useBlog } from '../../context/BlogContext';
import SkeletonAdminTable from './SkeletonAdminTable';
import ConfirmationModal from './ConfirmationModal';
import BulkTagModal from './BulkTagModal';

interface AdminPostListProps {
  isTabbed?: boolean;
  currentRoute?: string;
}

const AdminPostList: React.FC<AdminPostListProps> = ({ isTabbed = false, currentRoute }) => {
  const { posts, trashedPosts, movePostToTrash, restorePostFromTrash, permanentlyDeletePost, updatePost } = useBlog();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PostStatus | 'deleted'>('all');
  
  // View Mode with Persistence
  const [viewMode, setViewMode] = useState<'list' | 'board'>(() => {
    const saved = localStorage.getItem('adminPostViewMode');
    return (saved === 'board' || saved === 'list') ? saved : 'list';
  });

  // View Options State
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('adminPostVisibleColumns');
    return saved ? new Set(JSON.parse(saved)) : new Set(['status', 'category', 'author', 'date']);
  });
  const [visibleBoardFields, setVisibleBoardFields] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('adminPostVisibleBoardFields');
    return saved ? new Set(JSON.parse(saved)) : new Set(['coverImage', 'author', 'date']);
  });

  // Inline Editing State
  const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null);
  const [tempEditValue, setTempEditValue] = useState('');

  useEffect(() => {
    localStorage.setItem('adminPostViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('adminPostVisibleColumns', JSON.stringify(Array.from(visibleColumns)));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem('adminPostVisibleBoardFields', JSON.stringify(Array.from(visibleBoardFields)));
  }, [visibleBoardFields]);
  
  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal & Notification State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Move to trash
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false); // Delete from trash
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  
  const [itemToAction, setItemToAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Bulk Action State
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkRestoreModalOpen, setIsBulkRestoreModalOpen] = useState(false);
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Drag & Drop State
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PostStatus | null>(null);
  
  // Ref for indeterminate checkbox
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Handle routing based filter
  useEffect(() => {
    if (currentRoute) {
      if (currentRoute.endsWith('/trash')) {
        setStatusFilter('deleted');
        setViewMode('list'); // Force list view for trash
      } else if (statusFilter === 'deleted') {
        setStatusFilter('all');
      }
    }
  }, [currentRoute]);

  // Initial Data "Loading" Simulation
  useEffect(() => {
    setViewState('loading');
    const timer = setTimeout(() => {
      setViewState('success');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Toast Timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filter Logic
  const activeList: (AdminPost | TrashedPost)[] = statusFilter === 'deleted' ? trashedPosts : posts;

  const filteredItems = activeList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'deleted') {
      return matchesSearch;
    } else {
      const p = item as AdminPost;
      const matchesStatus = viewMode === 'board' ? true : (statusFilter === 'all' || p.status === statusFilter);
      return matchesSearch && matchesStatus;
    }
  });

  // Calculate Stats
  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    review: posts.filter(p => p.status === 'needs_review').length,
  };

  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = filteredItems.map(p => p.id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const toggleColumn = (col: string) => {
    const newSet = new Set(visibleColumns);
    if (newSet.has(col)) newSet.delete(col);
    else newSet.add(col);
    setVisibleColumns(newSet);
  };

  const toggleBoardField = (field: string) => {
    const newSet = new Set(visibleBoardFields);
    if (newSet.has(field)) newSet.delete(field);
    else newSet.add(field);
    setVisibleBoardFields(newSet);
  };

  // Inline Editing Handlers
  const startEdit = (id: string, field: string, currentValue: string) => {
    // Disable editing in trash
    if (statusFilter === 'deleted') return;
    setEditingCell({ id, field });
    setTempEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingCell) return;
    const { id, field } = editingCell;

    if (field === 'tags') {
      const tags = tempEditValue.split(',').map(t => t.trim()).filter(Boolean);
      updatePost(id, { tags });
    } else {
      updatePost(id, { [field]: tempEditValue });
    }

    setEditingCell(null);
    setNotification({ message: 'Updated successfully', type: 'success' });
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setTempEditValue('');
  };

  // Checkbox Indeterminate State
  useEffect(() => {
    if (headerCheckboxRef.current) {
      const visibleSelectedCount = filteredItems.filter(i => selectedIds.has(i.id)).length;
      const allSelected = filteredItems.length > 0 && visibleSelectedCount === filteredItems.length;
      const someSelected = visibleSelectedCount > 0 && visibleSelectedCount < filteredItems.length;
      headerCheckboxRef.current.indeterminate = someSelected;
      headerCheckboxRef.current.checked = allSelected;
    }
  }, [selectedIds, filteredItems]);

  const handleAddNew = () => {
    window.location.hash = '#/admin/blog/new';
  };

  const handleEdit = (id: string) => {
    // Only navigate if we aren't currently inline editing that item
    if (editingCell?.id !== id) {
      window.location.hash = `#/admin/blog/${id}`;
    }
  };

  const handlePreview = (id: string) => {
    window.location.hash = `#/admin/blog/${id}/preview`;
  };

  // Action Handlers
  const initiateTrash = (id: string) => {
    setItemToAction(id);
    setIsDeleteModalOpen(true);
  };

  const initiateRestore = (id: string) => {
    setItemToAction(id);
    setIsRestoreModalOpen(true);
  };

  const initiatePermanentDelete = (id: string) => {
    setItemToAction(id);
    setIsPermanentDeleteModalOpen(true);
  };

  const initiateBulkAction = () => {
    setIsBulkDeleteModalOpen(true);
  };

  const initiateBulkRestore = () => {
    setIsBulkRestoreModalOpen(true);
  };

  const confirmTrash = () => {
    if (!itemToAction) return;
    setIsProcessing(true);
    setTimeout(() => {
      movePostToTrash(itemToAction);
      if (selectedIds.has(itemToAction)) {
        const newSelected = new Set(selectedIds);
        newSelected.delete(itemToAction);
        setSelectedIds(newSelected);
      }
      setIsProcessing(false);
      setIsDeleteModalOpen(false);
      setItemToAction(null);
      setNotification({ message: 'Post moved to trash.', type: 'success' });
    }, 500);
  };

  const confirmRestore = () => {
    if (!itemToAction) return;
    setIsProcessing(true);
    setTimeout(() => {
      restorePostFromTrash(itemToAction);
      if (selectedIds.has(itemToAction)) {
        const newSelected = new Set(selectedIds);
        newSelected.delete(itemToAction);
        setSelectedIds(newSelected);
      }
      setIsProcessing(false);
      setIsRestoreModalOpen(false);
      setItemToAction(null);
      setNotification({ message: 'Post restored.', type: 'success' });
    }, 500);
  };

  const confirmPermanentDelete = () => {
    if (!itemToAction) return;
    setIsProcessing(true);
    setTimeout(() => {
      permanentlyDeletePost(itemToAction);
      if (selectedIds.has(itemToAction)) {
        const newSelected = new Set(selectedIds);
        newSelected.delete(itemToAction);
        setSelectedIds(newSelected);
      }
      setIsProcessing(false);
      setIsPermanentDeleteModalOpen(false);
      setItemToAction(null);
      setNotification({ message: 'Post permanently deleted.', type: 'success' });
    }, 500);
  };

  const confirmBulkAction = () => {
    setIsBulkProcessing(true);
    setTimeout(() => {
      selectedIds.forEach(id => {
        if (statusFilter === 'deleted') {
          permanentlyDeletePost(id);
        } else {
          movePostToTrash(id);
        }
      });
      
      const count = selectedIds.size;
      setNotification({ message: `${count} posts ${statusFilter === 'deleted' ? 'deleted forever' : 'moved to trash'}.`, type: 'success' });
      
      setSelectedIds(new Set());
      setIsBulkProcessing(false);
      setIsBulkDeleteModalOpen(false);
    }, 1000);
  };

  const confirmBulkRestore = () => {
    setIsBulkProcessing(true);
    setTimeout(() => {
      selectedIds.forEach(id => restorePostFromTrash(id));
      setNotification({ message: `${selectedIds.size} posts restored.`, type: 'success' });
      setSelectedIds(new Set());
      setIsBulkProcessing(false);
      setIsBulkRestoreModalOpen(false);
    }, 1000);
  };

  // Bulk Status Changes
  const handleBulkPublish = () => {
    selectedIds.forEach(id => updatePost(id, { status: 'published' }));
    setNotification({ message: `${selectedIds.size} posts published.`, type: 'success' });
    setSelectedIds(new Set());
  };

  const handleBulkArchive = () => {
    selectedIds.forEach(id => updatePost(id, { status: 'archived' }));
    setNotification({ message: `${selectedIds.size} posts archived.`, type: 'success' });
    setSelectedIds(new Set());
  };

  const handleBulkAddTags = (newTags: string[]) => {
    selectedIds.forEach(id => {
      const post = posts.find(p => p.id === id);
      if (post) {
        const existingTags = post.tags || [];
        // Merge unique tags
        const mergedTags = [...new Set([...existingTags, ...newTags])];
        updatePost(id, { tags: mergedTags });
      }
    });
    setNotification({ message: `Tags added to ${selectedIds.size} posts.`, type: 'success' });
    setSelectedIds(new Set());
  };

  const handleTabChange = (status: string) => {
    if (status === 'deleted') {
      window.location.hash = '#/admin/blog/trash';
    } else {
      window.location.hash = '#/admin/blog';
      setStatusFilter(status as 'all' | PostStatus);
    }
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedPostId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, status: PostStatus) => {
    e.preventDefault(); // Allows drop
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: PostStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedPostId) {
      const post = posts.find(p => p.id === draggedPostId);
      if (post && post.status !== targetStatus) {
        updatePost(draggedPostId, { status: targetStatus });
        setNotification({ 
          message: `Post moved to ${targetStatus.replace('_', ' ')}`, 
          type: 'success' 
        });
      }
      setDraggedPostId(null);
    }
  };

  // Helper to validate post metadata
  const getPostIssues = (post: AdminPost) => {
    const issues: string[] = [];
    if (!post.coverImage) issues.push('Missing cover image');
    if (!post.excerpt) issues.push('Missing excerpt');
    if (!post.category) issues.push('Missing category');
    return issues;
  };

  const StatusPill: React.FC<{ status: PostStatus }> = ({ status }) => {
    const statusConfig: Record<PostStatus, { bg: string, text: string, border: string, icon?: React.ReactNode }> = {
      published: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: <Clock className="w-3 h-3 mr-1" /> },
      archived: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200', icon: <Archive className="w-3 h-3 mr-1" /> },
      needs_review: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      error: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
    };

    const config = statusConfig[status] || statusConfig['draft'];
      
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} capitalize`}>
        {config.icon}
        {status.replace('_', ' ')}
      </span>
    );
  };

  const tabItems: Array<'all' | PostStatus | 'deleted'> = [
    'all', 'published', 'draft', 'scheduled', 'needs_review', 'archived', 'deleted'
  ];

  // Helper for board view
  const renderBoardColumn = (columnStatus: PostStatus, title: string, colorClass: string) => {
    const columnItems = filteredItems.filter(item => (item as AdminPost).status === columnStatus) as AdminPost[];
    const isDragOver = dragOverColumn === columnStatus;
    
    return (
      <div 
        className={`flex flex-col min-w-[280px] w-80 rounded-xl border h-full max-h-[calc(100vh-280px)] transition-colors duration-200 ${
          isDragOver ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-200' : 'bg-slate-50 border-slate-200'
        }`}
        onDragOver={(e) => handleDragOver(e, columnStatus)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, columnStatus)}
      >
        <div className={`p-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 rounded-t-xl ${isDragOver ? 'bg-slate-100' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
            <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
            <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs font-medium text-slate-500">
              {columnItems.length}
            </span>
          </div>
        </div>
        
        <div className="p-2 overflow-y-auto flex-1 space-y-3 min-h-[100px]">
          {columnItems.map(post => {
            const isDragging = draggedPostId === post.id;
            const isSelected = selectedIds.has(post.id);
            const issues = getPostIssues(post);
            
            const isEditingTitle = editingCell?.id === post.id && editingCell?.field === 'title';
            const isEditingTags = editingCell?.id === post.id && editingCell?.field === 'tags';

            return (
              <div 
                key={post.id} 
                draggable={!editingCell} // Disable dragging when editing
                onDragStart={(e) => handleDragStart(e, post.id)}
                className={`bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all group cursor-grab active:cursor-grabbing relative ${
                  isDragging ? 'opacity-50 scale-95 rotate-1 border-slate-300' : 
                  isSelected ? 'border-solar-500 ring-1 ring-solar-500 bg-solar-50/10' : 'border-slate-200'
                }`}
                onClick={() => handleEdit(post.id)}
              >
                {/* Selection Checkbox */}
                <div 
                  className={`absolute top-2 left-2 z-10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => handleSelectRow(post.id)}
                    className="w-4 h-4 rounded border-slate-300 text-solar-600 focus:ring-solar-500 cursor-pointer shadow-sm bg-white"
                  />
                </div>

                {visibleBoardFields.has('coverImage') && (
                  <div className="flex justify-between items-start mb-2">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" className="w-full h-24 object-cover rounded-md mb-2 pointer-events-none" />
                    ) : (
                      <div className="w-full h-24 bg-slate-100 rounded-md mb-2 flex items-center justify-center text-slate-300 relative">
                        <FileText className="w-8 h-8" />
                        {/* Explicit No Image Indicator for Board Card Placeholder */}
                        <div className="absolute top-1 right-1 text-amber-500">
                           <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-start gap-1">
                  {isEditingTitle ? (
                    <input 
                      autoFocus
                      type="text" 
                      value={tempEditValue}
                      onChange={(e) => setTempEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full font-semibold text-slate-800 text-sm mb-1 px-1 py-0.5 border border-solar-500 rounded focus:outline-none focus:ring-2 focus:ring-solar-200"
                    />
                  ) : (
                    <h4 
                      className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2 flex-grow cursor-pointer hover:text-solar-600 border border-transparent hover:border-slate-200 rounded px-0.5 -mx-0.5"
                      onDoubleClick={(e) => { e.stopPropagation(); startEdit(post.id, 'title', post.title); }}
                      title="Double click to edit title"
                    >
                      {post.title}
                    </h4>
                  )}
                  {issues.length > 0 && post.coverImage && (
                    <div className="flex-shrink-0 relative group/tooltip pt-0.5">
                       <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                       <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 text-white text-[10px] rounded p-2 z-50 hidden group-hover/tooltip:block shadow-lg pointer-events-none">
                          <div className="font-semibold mb-1 text-amber-400">Issues:</div>
                          <ul className="list-disc list-inside">
                              {issues.map((issue, i) => <li key={i}>{issue}</li>)}
                          </ul>
                       </div>
                    </div>
                  )}
                </div>

                {visibleBoardFields.has('excerpt') && post.excerpt && (
                   <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-2 leading-relaxed">{post.excerpt}</p>
                )}

                {(visibleBoardFields.has('category') || visibleBoardFields.has('tags')) && (
                   <div className="flex flex-wrap gap-1 mt-1 mb-2">
                      {visibleBoardFields.has('category') && (
                         <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                           {post.category}
                         </span>
                      )}
                      
                      {visibleBoardFields.has('tags') && (
                        isEditingTags ? (
                          <input 
                            autoFocus
                            type="text"
                            value={tempEditValue}
                            onChange={(e) => setTempEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Tags..."
                            className="w-full text-xs px-1 py-0.5 border border-solar-500 rounded focus:outline-none"
                          />
                        ) : (
                          <div 
                            className="flex flex-wrap gap-1 cursor-pointer min-h-[1.25rem] w-full"
                            onDoubleClick={(e) => { e.stopPropagation(); startEdit(post.id, 'tags', post.tags?.join(', ') || ''); }}
                            title="Double click to edit tags"
                          >
                            {post.tags?.length ? (
                              post.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-300 italic">No tags</span>
                            )}
                          </div>
                        )
                      )}
                   </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-50">
                  {visibleBoardFields.has('author') && (
                    <div className="flex items-center gap-1.5">
                       {typeof post.author !== 'string' && (
                         <img src={post.author.avatar} alt="" className="w-5 h-5 rounded-full pointer-events-none bg-slate-100" />
                       )}
                       <span>{typeof post.author === 'string' ? post.author : post.author.name}</span>
                    </div>
                  )}
                  {visibleBoardFields.has('date') && (
                    <span className="ml-auto">{post.publishedAt || post.updatedAt}</span>
                  )}
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); initiateTrash(post.id); }}
                    className="p-1.5 bg-white/90 rounded shadow-sm text-slate-400 hover:text-red-500 hover:bg-white"
                    title="Trash"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {columnItems.length === 0 && (
            <div className={`text-center py-10 text-slate-400 text-xs border-2 border-dashed rounded-lg ${isDragOver ? 'border-slate-400 bg-slate-200/50' : 'border-slate-100'}`}>
              {isDragOver ? 'Drop here' : 'No posts'}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 relative ${isTabbed ? '' : 'pt-0'}`}>
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
             <CheckCircle className="w-5 h-5 text-green-400" />
             <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmTrash}
        isLoading={isProcessing}
        title="Move to Trash?"
        message="Are you sure you want to move this post to trash?"
        confirmLabel="Move to Trash"
        isDestructive={true}
      />

      <ConfirmationModal 
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={confirmRestore}
        isLoading={isProcessing}
        title="Restore post?"
        message="This will move the post back to your Posts list."
        confirmLabel="Restore"
        isDestructive={false}
      />

      <ConfirmationModal 
        isOpen={isPermanentDeleteModalOpen}
        onClose={() => setIsPermanentDeleteModalOpen(false)}
        onConfirm={confirmPermanentDelete}
        isLoading={isProcessing}
        title="Delete permanently?"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Permanently"
        isDestructive={true}
      />

      <ConfirmationModal 
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkAction}
        isLoading={isBulkProcessing}
        title={statusFilter === 'deleted' ? "Permanently delete selected?" : "Move selected to trash?"}
        message={`Are you sure you want to ${statusFilter === 'deleted' ? 'permanently delete' : 'trash'} ${selectedIds.size} items?`}
        confirmLabel={statusFilter === 'deleted' ? "Delete Forever" : "Move to Trash"}
        isDestructive={true}
      />

      <ConfirmationModal 
        isOpen={isBulkRestoreModalOpen}
        onClose={() => setIsBulkRestoreModalOpen(false)}
        onConfirm={confirmBulkRestore}
        isLoading={isBulkProcessing}
        title="Restore selected posts?"
        message={`Are you sure you want to restore ${selectedIds.size} posts?`}
        confirmLabel="Restore"
        isDestructive={false}
      />

      <BulkTagModal 
        isOpen={isBulkTagModalOpen}
        onClose={() => setIsBulkTagModalOpen(false)}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkAddTags}
      />

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up w-[90%] max-w-4xl">
          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border border-slate-700">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start pl-2">
              <span className="bg-white text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {selectedIds.size}
              </span>
              <span className="text-sm font-medium whitespace-nowrap">Selected</span>
            </div>
            
            <div className="h-px w-full sm:h-8 sm:w-px bg-slate-700"></div>
            
            <div className="flex items-center gap-2 flex-wrap justify-center w-full sm:w-auto">
               {statusFilter !== 'deleted' ? (
                 <>
                   <button onClick={handleBulkPublish} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                     <Send className="w-4 h-4" /> Publish
                   </button>
                   <button onClick={handleBulkArchive} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                     <Archive className="w-4 h-4" /> Archive
                   </button>
                   <button onClick={() => setIsBulkTagModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                     <Tag className="w-4 h-4" /> Tag
                   </button>
                   <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block"></div>
                   <button onClick={initiateBulkAction} className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                     <Trash2 className="w-4 h-4" /> Trash
                   </button>
                 </>
               ) : (
                 <>
                   <button onClick={initiateBulkRestore} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                     <RotateCcw className="w-4 h-4" /> Restore
                   </button>
                   <button onClick={initiateBulkAction} className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                     <Trash2 className="w-4 h-4" /> Delete Forever
                   </button>
                 </>
               )}
               
               <button onClick={handleClearSelection} className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap ml-2">
                 Clear
               </button>
            </div>
          </div>
        </div>
      )}

      {!isTabbed && (
        <div className="bg-white border-b border-slate-200 px-6 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Posts</h1>
              <p className="text-slate-500 text-sm mt-1">Manage and organize your blog content.</p>
            </div>
            <button onClick={handleAddNew} className="inline-flex items-center justify-center px-4 py-2 bg-solar-600 hover:bg-solar-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:ring-4 focus:ring-solar-100">
              <Plus className="w-4 h-4 mr-2" /> Add New
            </button>
          </div>
        </div>
      )}

      <div className={`${isTabbed ? 'max-w-7xl' : 'max-w-6xl'} mx-auto px-6 py-8 pb-32`}>
        
        {/* Stats Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
               <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Posts</span>
               <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
             </div>
             <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex flex-col relative overflow-hidden">
               <div className="absolute right-0 top-0 p-3 opacity-10"><CheckCircle className="w-8 h-8 text-green-600" /></div>
               <span className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">Published</span>
               <span className="text-2xl font-bold text-slate-900">{stats.published}</span>
             </div>
             <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col relative overflow-hidden">
               <div className="absolute right-0 top-0 p-3 opacity-10"><Clock className="w-8 h-8 text-blue-600" /></div>
               <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Scheduled</span>
               <span className="text-2xl font-bold text-slate-900">{stats.scheduled}</span>
             </div>
             <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col relative overflow-hidden">
               <div className="absolute right-0 top-0 p-3 opacity-10"><AlertCircle className="w-8 h-8 text-amber-600" /></div>
               <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">In Review</span>
               <span className="text-2xl font-bold text-slate-900">{stats.review}</span>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
               <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Drafts</span>
               <span className="text-2xl font-bold text-slate-900">{stats.draft}</span>
             </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
          
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
             {viewMode === 'list' && (
               <div className="flex p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                  {tabItems.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleTabChange(status)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                        statusFilter === status
                          ? 'bg-slate-100 text-slate-900 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      } capitalize`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
               </div>
             )}
             
             {/* View Switcher */}
             {statusFilter !== 'deleted' && (
                <div className="flex p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('board')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                    title="Board View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
             )}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             
             {/* View Options Toggle */}
             <div className="relative">
                <button 
                   onClick={() => setShowViewOptions(!showViewOptions)}
                   className={`p-2 rounded-lg border transition-colors ${showViewOptions ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'}`}
                   title="Customize View"
                >
                   <SlidersHorizontal className="w-4 h-4" />
                </button>
                
                {showViewOptions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowViewOptions(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in-up">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {viewMode === 'list' ? 'Columns' : 'Card Fields'}
                        </h4>
                        <button onClick={() => setShowViewOptions(false)} className="text-slate-400 hover:text-slate-600"><Settings className="w-3 h-3" /></button>
                      </div>
                      <div className="p-2 space-y-1">
                         {viewMode === 'list' ? (
                           <>
                             {['status', 'category', 'author', 'date'].map(col => (
                               <label key={col} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                 <input 
                                   type="checkbox" 
                                   checked={visibleColumns.has(col)} 
                                   onChange={() => toggleColumn(col)} 
                                   className="w-4 h-4 rounded border-slate-300 text-solar-600 focus:ring-solar-500"
                                 />
                                 <span className="text-sm text-slate-700 capitalize">{col}</span>
                               </label>
                             ))}
                           </>
                         ) : (
                           <>
                             {['coverImage', 'category', 'author', 'date', 'excerpt', 'tags'].map(field => (
                               <label key={field} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                 <input 
                                   type="checkbox" 
                                   checked={visibleBoardFields.has(field)} 
                                   onChange={() => toggleBoardField(field)} 
                                   className="w-4 h-4 rounded border-slate-300 text-solar-600 focus:ring-solar-500"
                                 />
                                 <span className="text-sm text-slate-700 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                               </label>
                             ))}
                           </>
                         )}
                      </div>
                    </div>
                  </>
                )}
             </div>

             <div className="relative flex-grow md:flex-grow-0 md:w-72">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-slate-400" />
               </div>
               <input
                 type="text"
                 placeholder={statusFilter === 'deleted' ? "Search trash..." : "Search posts..."}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-500 focus:ring-1 focus:ring-solar-500 focus:border-solar-500 sm:text-sm transition-shadow"
               />
             </div>
             
             {isTabbed && statusFilter !== 'deleted' && (
                <button 
                  onClick={handleAddNew}
                  className="inline-flex items-center justify-center px-4 py-2 bg-solar-600 hover:bg-solar-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:ring-4 focus:ring-solar-100 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Post
                </button>
             )}
          </div>
        </div>

        {viewState === 'loading' && <SkeletonAdminTable />}

        {viewState === 'success' && filteredItems.length === 0 && (
          <div className="bg-white rounded-lg border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
             <div className="bg-slate-50 p-4 rounded-full mb-4">
               {statusFilter === 'deleted' ? <Trash2 className="w-8 h-8 text-slate-400" /> : <FileText className="w-8 h-8 text-slate-400" />}
             </div>
             <h3 className="text-lg font-medium text-slate-900 mb-1">
               {statusFilter === 'deleted' ? 'Trash is empty' : 'No posts found'}
             </h3>
             <p className="text-slate-500 text-sm mb-6">
               {statusFilter === 'deleted' 
                 ? 'Deleted posts will appear here.' 
                 : `No ${statusFilter === 'all' ? '' : statusFilter.replace('_', ' ')} posts found.`
               }
             </p>
             {statusFilter !== 'deleted' && (
               <button onClick={handleAddNew} className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                 Create Post
               </button>
             )}
          </div>
        )}

        {viewState === 'success' && filteredItems.length > 0 && (
          <>
            {viewMode === 'list' ? (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="w-12 px-6 py-3 text-left">
                           <input 
                             type="checkbox"
                             ref={headerCheckboxRef}
                             onChange={handleSelectAll}
                             className="rounded border-slate-300 text-solar-600 focus:ring-solar-500 w-4 h-4 cursor-pointer"
                           />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                        {visibleColumns.has('status') && statusFilter !== 'deleted' && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">{statusFilter === 'deleted' ? 'Prev Status' : 'Status'}</th>
                        )}
                        {visibleColumns.has('category') && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                        )}
                        {visibleColumns.has('author') && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Author</th>
                        )}
                        {visibleColumns.has('date') && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">{statusFilter === 'deleted' ? 'Trashed At' : 'Updated'}</th>
                        )}
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredItems.map((post) => {
                        const isSelected = selectedIds.has(post.id);
                        const isDeleted = statusFilter === 'deleted';
                        const prevStatus = isDeleted ? (post as TrashedPost).previousStatus : (post as AdminPost).status;
                        const dateDisplay = isDeleted ? (post as TrashedPost).trashedAt : (post as AdminPost).updatedAt;
                        const issues = !isDeleted ? getPostIssues(post as AdminPost) : [];
                        
                        const isEditingTitle = editingCell?.id === post.id && editingCell?.field === 'title';
                        const isEditingStatus = editingCell?.id === post.id && editingCell?.field === 'status';

                        return (
                          <tr key={post.id} className={`transition-colors group ${isSelected ? 'bg-solar-50/50 hover:bg-solar-50' : 'hover:bg-slate-50'}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(post.id)} className="rounded border-slate-300 text-solar-600 focus:ring-solar-500 w-4 h-4 cursor-pointer" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    {isEditingTitle ? (
                                      <input 
                                        autoFocus
                                        type="text"
                                        value={tempEditValue}
                                        onChange={(e) => setTempEditValue(e.target.value)}
                                        onBlur={saveEdit}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') saveEdit();
                                          if (e.key === 'Escape') cancelEdit();
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-sm font-medium text-slate-900 border border-solar-500 rounded px-2 py-1 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-solar-200"
                                      />
                                    ) : (
                                      <span 
                                        className="text-sm font-medium text-slate-900 cursor-pointer hover:text-solar-600 border-b border-transparent hover:border-dashed hover:border-slate-400"
                                        onDoubleClick={(e) => { e.stopPropagation(); startEdit(post.id, 'title', post.title); }}
                                        title="Double click to edit title"
                                      >
                                        {post.title}
                                      </span>
                                    )}
                                    
                                    {issues.length > 0 && (
                                        <div className="group/tooltip relative">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 cursor-help" />
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 bg-slate-800 text-white text-[10px] rounded p-2 z-50 hidden group-hover/tooltip:block shadow-lg pointer-events-none">
                                                <div className="font-semibold mb-1 text-amber-400">Attention Needed:</div>
                                                <ul className="list-disc list-inside">
                                                    {issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-slate-500 flex items-center mt-1 sm:hidden">
                                  {/* Mobile fallback for hidden columns */}
                                  {!visibleColumns.has('author') && `by ${typeof post.author === 'string' ? post.author : post.author.name}`}
                                </span>
                              </div>
                            </td>
                            {visibleColumns.has('status') && statusFilter !== 'deleted' && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                {isEditingStatus ? (
                                  <select
                                    autoFocus
                                    value={tempEditValue}
                                    onChange={(e) => {
                                      setTempEditValue(e.target.value);
                                      // Optional: Auto-save on change for dropdowns to be snappier
                                    }}
                                    onBlur={saveEdit}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEdit();
                                      if (e.key === 'Escape') cancelEdit();
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs font-medium border border-solar-500 rounded px-2 py-1 focus:outline-none"
                                  >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="needs_review">Needs Review</option>
                                    <option value="archived">Archived</option>
                                  </select>
                                ) : (
                                  <div 
                                    onDoubleClick={(e) => { e.stopPropagation(); startEdit(post.id, 'status', prevStatus); }} 
                                    className="cursor-pointer inline-block"
                                    title="Double click to change status"
                                  >
                                    <StatusPill status={prevStatus} />
                                  </div>
                                )}
                              </td>
                            )}
                            {visibleColumns.has('category') && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{post.category}</td>
                            )}
                            {visibleColumns.has('author') && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{typeof post.author === 'string' ? post.author : post.author.name}</td>
                            )}
                            {visibleColumns.has('date') && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{dateDisplay}</td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                {statusFilter === 'deleted' ? (
                                  <>
                                    <button onClick={() => initiateRestore(post.id)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Restore"><RotateCcw className="w-4 h-4" /></button>
                                    <button onClick={() => initiatePermanentDelete(post.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Forever"><Trash2 className="w-4 h-4" /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handlePreview(post.id)} className="p-1.5 text-slate-400 hover:text-solar-600 hover:bg-solar-50 rounded transition-colors" title="Preview"><Eye className="w-4 h-4" /></button>
                                    <button onClick={() => handleEdit(post.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => initiateTrash(post.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Trash"><Trash2 className="w-4 h-4" /></button>
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
                {/* Pagination Placeholder */}
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
                   <span className="text-xs text-slate-500">Showing {filteredItems.length} items</span>
                   <div className="flex gap-1">
                     <button disabled className="px-2 py-1 text-xs text-slate-400 border border-slate-200 rounded bg-white cursor-not-allowed">Previous</button>
                     <button disabled className="px-2 py-1 text-xs text-slate-400 border border-slate-200 rounded bg-white cursor-not-allowed">Next</button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 items-start h-[calc(100vh-320px)] snap-x">
                {renderBoardColumn('draft', 'Drafts', 'bg-slate-400')}
                {renderBoardColumn('needs_review', 'Needs Review', 'bg-amber-500')}
                {renderBoardColumn('scheduled', 'Scheduled', 'bg-blue-500')}
                {renderBoardColumn('published', 'Published', 'bg-green-500')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPostList;
