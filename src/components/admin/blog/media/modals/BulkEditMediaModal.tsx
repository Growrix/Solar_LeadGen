'use client';

import React from 'react';
import { AdminButton, AdminInput, AdminModal } from '@/components/admin/ui';

export default function BulkEditMediaModal(props: {
  isOpen: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (updates: { altText?: string; caption?: string; tags?: string[] }) => void;
}) {
  const { isOpen, count, onClose, onConfirm } = props;
  const [altText, setAltText] = React.useState('');
  const [caption, setCaption] = React.useState('');
  const [tags, setTags] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setAltText('');
    setCaption('');
    setTags('');
  }, [isOpen]);

  const tagList = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Edit"
      description={`Apply updates to ${count} selected item${count > 1 ? 's' : ''}.`}
      size="md"
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            variant="primary"
            onClick={() => {
              onConfirm({
                altText: altText.trim() || undefined,
                caption: caption.trim() || undefined,
                tags: tagList.length ? tagList : undefined,
              });
              onClose();
            }}
          >
            Apply Changes
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        <AdminInput
          label="Alt text"
          value={altText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAltText(e.target.value)}
          placeholder="Describe the images for accessibility..."
          hint="Leave empty to keep existing values"
        />
        <AdminInput
          label="Caption"
          value={caption}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaption(e.target.value)}
          placeholder="Optional caption text..."
          hint="Leave empty to keep existing values"
        />
        <AdminInput
          label="Tags (comma-separated)"
          value={tags}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
          hint="Leave empty to keep existing values"
        />
      </div>
    </AdminModal>
  );
}
