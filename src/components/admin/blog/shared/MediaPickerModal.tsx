'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { X, Image as ImageIcon, Search } from 'lucide-react';

type MediaPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
};

const STUB_IMAGES: Array<{ id: string; name: string; url: string }> = [
  {
    id: 'img-1',
    name: 'Solar Panels (Hero)',
    url: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'img-2',
    name: 'Rooftop Solar',
    url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'img-3',
    name: 'Battery Storage',
    url: 'https://images.unsplash.com/photo-1618734159232-41b4d5f3f0f0?auto=format&fit=crop&w=1200&q=80',
  },
];

export function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const images = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return STUB_IMAGES;
    return STUB_IMAGES.filter((item) => item.name.toLowerCase().includes(q));
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-solar-600" />
            Select Image
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group relative cursor-pointer bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:ring-2 hover:ring-solar-500 transition-all aspect-square"
                >
                  <Image src={item.url} alt={item.name} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-xs text-white truncate">{item.name}</p>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              <p>No images found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
