'use client';

import React from 'react';
import { AdminButton, AdminSelect, AdminModal } from '@/components/admin/ui';
import type { MediaFolder } from '@/components/admin/blog/shared/blogPrototypeStore';

export default function MoveMediaModal(props: {
  isOpen: boolean;
  folders: MediaFolder[];
  defaultFolderId: string | null;
  count: number;
  onClose: () => void;
  onMove: (folderId: string | null) => void;
}) {
  const { isOpen, folders, defaultFolderId, count, onClose, onMove } = props;
  const [folderId, setFolderId] = React.useState<string | null>(defaultFolderId);

  React.useEffect(() => {
    if (!isOpen) return;
    setFolderId(defaultFolderId);
  }, [isOpen, defaultFolderId]);

  const folderOptions = [
    { value: '', label: 'Root (No folder)' },
    ...folders.map((f) => ({ value: f.id, label: f.name })),
  ];

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Move Media"
      description={`Move ${count} item${count > 1 ? 's' : ''} to a folder.`}
      size="sm"
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            variant="primary"
            onClick={() => {
              onMove(folderId);
              onClose();
            }}
          >
            Move
          </AdminButton>
        </>
      }
    >
      <AdminSelect
        label="Destination folder"
        options={folderOptions}
        value={folderId ?? ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFolderId(e.target.value || null)}
      />
    </AdminModal>
  );
}
