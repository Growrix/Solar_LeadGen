'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlignLeft, Check, Loader2, Tag, Type, X } from 'lucide-react';

interface BulkEditMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (data: { altText?: string; caption?: string; tags?: string[] }) => void;
}

export function BulkEditMediaModal({ isOpen, onClose, selectedCount, onConfirm }: BulkEditMediaModalProps) {
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');

  const [updateAlt, setUpdateAlt] = useState(false);
  const [updateCaption, setUpdateCaption] = useState(false);
  const [updateTags, setUpdateTags] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setAltText('');
    setCaption('');
    setTags('');
    setUpdateAlt(false);
    setUpdateCaption(false);
    setUpdateTags(false);
    setIsProcessing(false);
  }, [isOpen]);

  const hasUpdates = useMemo(() => updateAlt || updateCaption || updateTags, [updateAlt, updateCaption, updateTags]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsProcessing(true);

    const updates: { altText?: string; caption?: string; tags?: string[] } = {};
    if (updateAlt) updates.altText = altText;
    if (updateCaption) updates.caption = caption;
    if (updateTags) updates.tags = tags.split(',').map(t => t.trim()).filter(Boolean);

    setTimeout(() => {
      onConfirm(updates);
      setIsProcessing(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-overlay/60 backdrop-blur-sm transition-opacity"
        onClick={!isProcessing ? onClose : undefined}
      />

      <div className="relative bg-surface rounded-modal shadow-modal w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-alt">
          <div>
            <h3 className="text-heading-4 text-foreground">Bulk Edit Metadata</h3>
            <p className="text-body-small text-muted-foreground">Editing {selectedCount} items</p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-body-small text-muted-foreground bg-info/10 p-3 rounded-card border border-info/20 mb-4">
            Select the fields you want to update. Only checked fields will be overwritten for all selected items.
          </p>

          <div className={`space-y-2 p-4 border rounded-card transition-colors ${updateAlt ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={updateAlt}
                onChange={(e) => setUpdateAlt(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              />
              <span className="text-body-small text-foreground flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground" /> Alt Text (SEO)
              </span>
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              disabled={!updateAlt}
              placeholder="Descriptive text for screen readers..."
              className="w-full px-3 py-2 border border-input rounded-input bg-background text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:bg-muted/20 disabled:text-muted-foreground"
            />
          </div>

          <div className={`space-y-2 p-4 border rounded-card transition-colors ${updateCaption ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={updateCaption}
                onChange={(e) => setUpdateCaption(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              />
              <span className="text-body-small text-foreground flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-muted-foreground" /> Caption
              </span>
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={!updateCaption}
              placeholder="Display caption..."
              className="w-full px-3 py-2 border border-input rounded-input bg-background text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 resize-none disabled:bg-muted/20 disabled:text-muted-foreground"
            />
          </div>

          <div className={`space-y-2 p-4 border rounded-card transition-colors ${updateTags ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={updateTags}
                onChange={(e) => setUpdateTags(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              />
              <span className="text-body-small text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" /> Tags
              </span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={!updateTags}
              placeholder="e.g. solar, outdoor, installation (comma separated)"
              className="w-full px-3 py-2 border border-input rounded-input bg-background text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:bg-muted/20 disabled:text-muted-foreground"
            />
            <p className="text-body-small text-muted-foreground pl-6">Replaces existing tags on selected items.</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-background-alt border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-surface border border-border rounded-button text-button text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || !hasUpdates}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-background rounded-button text-button transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Update {selectedCount} Items
          </button>
        </div>
      </div>
    </div>
  );
}
