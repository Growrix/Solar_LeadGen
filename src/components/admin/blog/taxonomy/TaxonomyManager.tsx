'use client';

import React from 'react';
import Button from '@/components/Button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';

export type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  title: string;
  items: TaxonomyItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onCreate: (input: { name: string }) => Promise<void>;
  onUpdate: (id: string, patch: { name: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function TaxonomyManager(props: Props) {
  const { title, items, loading, error, onRefresh, onCreate, onUpdate, onDelete } = props;

  const [createName, setCreateName] = React.useState('');
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState('');

  const startEdit = (item: TaxonomyItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const submitCreate = async () => {
    const name = createName.trim();
    if (!name) return;

    setBusyId('CREATE');
    try {
      await onCreate({ name });
      setCreateName('');
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const submitUpdate = async () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) return;

    setBusyId(editingId);
    try {
      await onUpdate(editingId, { name });
      cancelEdit();
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const submitDelete = async (id: string) => {
    setBusyId(id);
    try {
      await onDelete(id);
      if (editingId === id) cancelEdit();
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-heading-3 text-foreground">{title}</h2>
          <p className="text-body-small text-muted-foreground mt-1">Create, rename, or remove items.</p>
        </div>

        <Button variant="secondary" onClick={onRefresh} disabled={loading || busyId !== null}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="mt-4 bg-error/10 border border-error/20 rounded-2xl p-4">
          <p className="text-body text-error">{error}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <NeumorphicInput
            label="New name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={() => {
              void submitCreate();
            }}
            disabled={loading || busyId !== null || !createName.trim()}
          >
            Add
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-body">
          <thead>
            <tr className="text-body-small text-muted-foreground">
              <th className="text-left py-2 pr-3">Name</th>
              <th className="text-left py-2 pr-3">Slug</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-muted-foreground">
                  No items yet.
                </td>
              </tr>
            ) : null}

            {items.map((item) => {
              const isEditing = editingId === item.id;
              const isBusy = busyId === item.id;

              return (
                <tr key={item.id} className="border-t border-border">
                  <td className="py-3 pr-3">
                    {isEditing ? (
                      <NeumorphicInput
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                    ) : (
                      <span className="text-foreground">{item.name}</span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">{item.slug}</td>
                  <td className="py-3 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={cancelEdit}
                          disabled={loading || isBusy}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => {
                            void submitUpdate();
                          }}
                          disabled={loading || isBusy || !editingName.trim()}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => startEdit(item)}
                          disabled={loading || busyId !== null}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          className="border border-error/30 text-error"
                          onClick={() => {
                            void submitDelete(item.id);
                          }}
                          disabled={loading || isBusy || busyId === 'CREATE'}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
