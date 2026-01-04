
import React, { useState, useMemo } from 'react';
import { MediaItem, MediaType } from '../types';
import { MOCK_MEDIA } from '../constants';
import { geminiService } from '../services/geminiService';

const MediaLibrary: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>(MOCK_MEDIA);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<MediaType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesFilter = filter === 'all' || item.type === filter;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.filename.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [items, filter, searchQuery]);

  const handleUpdateItem = (id: string, updates: Partial<MediaItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleGenerateAlt = async () => {
    if (!selectedItem) return;
    setIsGenerating(true);
    try {
      const altText = await geminiService.generateAltText(selectedItem.title, selectedItem.caption);
      handleUpdateItem(selectedItem.id, { alt: altText });
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this asset permanently?')) {
      setItems(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const renderThumbnail = (item: MediaItem) => {
    if (item.type === 'image') {
      return <img src={item.url} className="w-full h-full object-cover" alt={item.title} />;
    }
    if (item.type === 'video') {
      return (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <svg className="h-10 w-10 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Main Library Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Media</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
            <input 
              type="text" 
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
            />
          </div>
          <button className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Add New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`relative aspect-square rounded-lg overflow-hidden border-4 transition-all ${
                  selectedItem?.id === item.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:border-gray-200'
                }`}
              >
                {renderThumbnail(item)}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-[10px] text-white truncate font-medium">{item.filename}</p>
                </div>
              </button>
            ))}
          </div>
          {filteredItems.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 italic">
              <svg className="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              No media found.
            </div>
          )}
        </div>
      </div>

      {/* Details Sidebar */}
      {selectedItem && (
        <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Attachment Details</h3>
            <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="aspect-video bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex items-center justify-center">
               {selectedItem.type === 'image' ? (
                 <img src={selectedItem.url} className="max-h-full object-contain" alt="" />
               ) : renderThumbnail(selectedItem)}
            </div>

            <div className="space-y-1">
               <p className="text-xs font-bold text-gray-900 truncate">{selectedItem.filename}</p>
               <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                 {selectedItem.uploadedDate} • {selectedItem.size} {selectedItem.dimensions && `• ${selectedItem.dimensions}`}
               </p>
               <button onClick={() => handleDelete(selectedItem.id)} className="text-[10px] text-red-600 font-bold uppercase hover:underline">
                 Delete Permanently
               </button>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Title</label>
                <input 
                  type="text" 
                  value={selectedItem.title} 
                  onChange={(e) => handleUpdateItem(selectedItem.id, { title: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Alternative Text</label>
                  {selectedItem.type === 'image' && (
                    <button 
                      onClick={handleGenerateAlt}
                      disabled={isGenerating}
                      className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold hover:bg-indigo-200 disabled:opacity-50"
                    >
                      {isGenerating ? 'Analyzing...' : 'AI Suggest'}
                    </button>
                  )}
                </div>
                <textarea 
                  rows={3}
                  value={selectedItem.alt} 
                  onChange={(e) => handleUpdateItem(selectedItem.id, { alt: e.target.value })}
                  placeholder="Describe the purpose of the image..."
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Caption</label>
                <textarea 
                  rows={3}
                  value={selectedItem.caption} 
                  onChange={(e) => handleUpdateItem(selectedItem.id, { caption: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">File URL</label>
                <div className="flex space-x-1">
                  <input 
                    type="text" 
                    readOnly
                    value={selectedItem.url} 
                    className="flex-1 bg-gray-100 border border-gray-200 rounded px-2 py-1 text-[10px] text-gray-500 outline-none"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedItem.url);
                      alert('URL copied!');
                    }}
                    className="bg-white border border-gray-200 px-2 rounded text-[10px] font-bold hover:bg-gray-50"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
