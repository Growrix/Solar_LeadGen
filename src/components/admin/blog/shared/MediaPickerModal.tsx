'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { X, Image as ImageIcon, Search } from 'lucide-react';

type MediaPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
};

type ApiMediaAsset = {
  id: string;
  name: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  url: string;
  createdAt: string;
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string'
        ? (data as any).error
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

type PickerItem = { id: string; name: string; url: string };

function isImageAsset(asset: ApiMediaAsset): boolean {
  return asset.type === 'IMAGE' && typeof asset.url === 'string' && asset.url.trim().length > 0;
}

export function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<PickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          setIsLoading(true);
          setError(null);

          const params = new URLSearchParams();
          params.set('status', 'ACTIVE');
          params.set('type', 'IMAGE');
          params.set('limit', '100');
          params.set('page', '1');
          if (effectiveQuery) params.set('q', effectiveQuery);

          const data = await requestJson<{ assets: ApiMediaAsset[] }>(`/api/admin/media/assets?${params.toString()}`);
          if (cancelled) return;

          const nextItems = (data.assets ?? []).filter(isImageAsset).map((a) => ({
            id: a.id,
            name: a.name,
            url: a.url,
          }));

          setItems(nextItems);
        } catch (e) {
          if (cancelled) return;
          setItems([]);
          setError(e instanceof Error ? e.message : 'Failed to load images');
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, effectiveQuery]);

  const images = items;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-overlay/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-surface rounded-modal shadow-modal w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-alt">
          <h3 className="text-heading-4 text-foreground flex items-center gap-2">
            <ImageIcon className="icon-sm text-accent" />
            Select Image
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X className="icon-sm" />
          </button>
        </div>

        <div className="p-4 border-b border-border bg-surface">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 icon-sm text-muted-foreground" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-input text-body-small text-foreground bg-background-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-background-alt">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="relative bg-surface border border-border rounded-card overflow-hidden shadow-card aspect-square animate-pulse"
                >
                  <div className="absolute inset-0 bg-muted" />
                </div>
              ))}
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group relative cursor-pointer bg-surface border border-border rounded-card overflow-hidden shadow-card hover:ring-2 hover:ring-accent/40 transition aspect-square"
                >
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-surface/90 backdrop-blur-sm p-2">
                    <p className="text-caption text-foreground truncate">{item.name}</p>
                  </div>
                  <div className="absolute inset-0 bg-overlay/0 group-hover:bg-overlay/10 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-foreground-muted">
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-body">{error ? error : 'No images found.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
