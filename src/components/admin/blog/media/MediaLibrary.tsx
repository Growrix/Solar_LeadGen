'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, LayoutGrid, List, RefreshCw, AlertCircle, 
  Image as ImageIcon, Film, FileText, CheckCircle, Trash2,
  Eye
} from 'lucide-react';
import { SkeletonMediaGrid } from './SkeletonMediaGrid';
import { UploadMediaModal } from './UploadMediaModal';
import { MediaDetailsModal } from './MediaDetailsModal';
import { ConfirmationModal } from '@/components/admin/blog/shared/ConfirmationModal';

type ViewState = 'loading' | 'success' | 'error' | 'empty';
type ViewMode = 'grid' | 'list';
type MediaType = 'ALL' | 'image' | 'video' | 'document';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size?: string;
  uploadedAt: string;
  altText?: string;
  caption?: string;
  tags?: string[];
}

const mockMedia: MediaItem[] = [
  { id: '1', name: 'solar-panels-hero.webp', type: 'image', url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800', size: '245 KB', uploadedAt: 'Jan 15, 2025', altText: 'Solar panels on roof', tags: ['hero', 'solar'] },
  { id: '2', name: 'team-photo.webp', type: 'image', url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800', size: '180 KB', uploadedAt: 'Jan 14, 2025', altText: 'Team meeting' },
  { id: '3', name: 'installation-guide.pdf', type: 'document', url: '#', size: '2.1 MB', uploadedAt: 'Jan 12, 2025' },
  { id: '4', name: 'product-demo.mp4', type: 'video', url: '#', size: '15.3 MB', uploadedAt: 'Jan 10, 2025' },
  { id: '5', name: 'roof-installation.webp', type: 'image', url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800', size: '312 KB', uploadedAt: 'Jan 8, 2025', altText: 'Roof installation', tags: ['installation'] },
  { id: '6', name: 'energy-savings-chart.webp', type: 'image', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', size: '95 KB', uploadedAt: 'Jan 5, 2025', altText: 'Energy savings' },
];

export function MediaLibrary() {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaType>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  const fetchData = useCallback(async () => {
    setViewState('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMedia(mockMedia);
      setViewState(mockMedia.length === 0 ? 'empty' : 'success');
    } catch {
      setViewState('error');
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleUpload = () => {
    setNotification({ message: 'Files uploaded successfully.', type: 'success' });
    void fetchData();
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleViewDetails = (item: MediaItem) => {
    setSelectedMediaItem(item);
    setIsDetailsModalOpen(true);
  };

  const handleSaveDetails = (id: string, data: { altText: string; caption: string; tags: string[] }) => {
    setMedia(prev => prev.map(item => 
      item.id === id 
        ? { ...item, altText: data.altText, caption: data.caption, tags: data.tags }
        : item
    ));
    setNotification({ message: 'Media updated successfully.', type: 'success' });
  };

  const initiateDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMedia(prev => prev.filter(item => item.id !== itemToDelete));
      setNotification({ message: 'Media deleted successfully.', type: 'success' });
    } catch {
      setNotification({ message: 'Failed to delete media.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const typeFilters: Array<{ key: MediaType; label: string }> = [
    { key: 'ALL', label: 'All' },
    { key: 'image', label: 'Images' },
    { key: 'video', label: 'Videos' },
    { key: 'document', label: 'Documents' },
  ];

  const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'video': return <Film className="w-8 h-8 text-red-500" />;
      case 'document': return <FileText className="w-8 h-8 text-blue-500" />;
      default: return <ImageIcon className="w-8 h-8 text-purple-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
             <CheckCircle className="w-5 h-5 text-green-400" />
             <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <UploadMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <MediaDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        mediaItem={selectedMediaItem}
        onSave={handleSaveDetails}
        onDelete={initiateDelete}
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Media?"
        message="Are you sure you want to delete this file? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
      />

      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm transition-colors focus:ring-4 focus:ring-orange-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Media
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4">
          <div className="flex items-center gap-4 flex-wrap">
            {typeFilters.map(filter => (
              <button
                key={filter.key}
                onClick={() => setTypeFilter(filter.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === filter.key
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-500 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-shadow"
              />
            </div>

            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {viewState === 'loading' && <SkeletonMediaGrid />}

        {viewState === 'error' && (
          <div className="bg-white rounded-lg border border-red-100 p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-red-50 p-3 rounded-full mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Could not load media</h3>
            <button onClick={() => fetchData()} className="text-sm font-medium text-slate-600 hover:text-slate-900 underline flex items-center">
              <RefreshCw className="w-3 h-3 mr-1" /> Retry
            </button>
          </div>
        )}

        {viewState === 'empty' && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <ImageIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No media found</h3>
            <p className="text-slate-500 text-sm mb-6">Upload your first file to get started.</p>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Upload Media
            </button>
          </div>
        )}

        {viewState === 'success' && filteredMedia.length === 0 && (
          <div className="bg-white rounded-lg border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
            <p className="text-slate-500">No media found matching your filters</p>
            <button 
              onClick={() => { setSearchQuery(''); setTypeFilter('ALL'); }} 
              className="mt-2 text-orange-600 font-medium text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {viewState === 'success' && filteredMedia.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white border rounded-lg overflow-hidden aspect-square flex flex-col cursor-pointer transition-all hover:shadow-lg group ${
                  selectedIds.has(item.id) ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200'
                }`}
                onClick={() => handleViewDetails(item)}
              >
                <div className="flex-grow bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.altText || item.name} className="w-full h-full object-cover" />
                  ) : (
                    getMediaIcon(item.type)
                  )}
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleViewDetails(item); }}
                      className="p-2 bg-white rounded-full shadow-lg"
                    >
                      <Eye className="w-4 h-4 text-slate-700" />
                    </button>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelectItem(item.id); }}
                    className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      selectedIds.has(item.id) 
                        ? 'bg-orange-500 border-orange-500 text-white' 
                        : 'bg-white/80 border-slate-300 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {selectedIds.has(item.id) && <CheckCircle className="w-3 h-3" />}
                  </button>
                </div>
                <div className="p-3 border-t border-slate-100 bg-white">
                  <p className="text-xs font-medium text-slate-900 truncate" title={item.name}>{item.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.size}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewState === 'success' && filteredMedia.length > 0 && viewMode === 'list' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(filteredMedia.map(m => m.id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                      Size
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                      Uploaded
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredMedia.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                            {item.type === 'image' ? (
                              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              getMediaIcon(item.type)
                            )}
                          </div>
                          <span className="text-sm font-medium text-slate-900 truncate max-w-xs">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-500 capitalize">{item.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {item.size || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {item.uploadedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleViewDetails(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => initiateDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
