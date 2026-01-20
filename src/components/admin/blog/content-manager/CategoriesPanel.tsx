'use client';

import React from 'react';
import Button from '@/components/Button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import {
  createAdminBlogCategory,
  deleteAdminBlogCategory,
  listAdminBlogCategories,
  updateAdminBlogCategory,
  type AdminBlogCategory,
} from '@/lib/blog/adminApiClient';

export default function CategoriesPanel() {
  const [items, setItems] = React.useState<AdminBlogCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [newName, setNewName] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState('');
  const [savingId, setSavingId] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const categories = await listAdminBlogCategories();
      setItems(categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;

    setCreating(true);
    try {
      await createAdminBlogCategory({ name });
      setNewName('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (cat: AdminBlogCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) return;

    setSavingId(editingId);
    try {
      await updateAdminBlogCategory(editingId, { name });
      cancelEdit();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this category?');
    if (!ok) return;

    setSavingId(id);
    try {
      await deleteAdminBlogCategory(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <NeumorphicInput
            label="New Category"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Solar Basics"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => void handleCreate()} disabled={creating || !newName.trim()}>
            {creating ? 'Adding…' : 'Add'}
          </Button>
          <Button variant="secondary" onClick={() => void refresh()} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {error ? <div className="mt-4 text-body text-destructive">{error}</div> : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No categories yet.</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-surface shadow-neu-inset">
              <tr>
                <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-right text-body-small text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((cat) => {
                const isEditing = editingId === cat.id;
                const busy = savingId === cat.id;

                return (
                  <tr key={cat.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full rounded-xl bg-background px-3 py-2 text-body text-foreground shadow-neu-inset border border-border"
                        />
                      ) : (
                        <div className="text-body text-foreground">{cat.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-body-small text-muted-foreground">{cat.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        {isEditing ? (
                          <>
                            <Button
                              variant="primary"
                              className="px-4 py-2"
                              disabled={busy || !editingName.trim()}
                              onClick={() => void saveEdit()}
                            >
                              {busy ? 'Saving…' : 'Save'}
                            </Button>
                            <Button variant="secondary" className="px-4 py-2" onClick={cancelEdit} disabled={busy}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="secondary" className="px-4 py-2" onClick={() => startEdit(cat)}>
                              Edit
                            </Button>
                            <Button
                              variant="secondary"
                              className="px-4 py-2"
                              disabled={busy}
                              onClick={() => void handleDelete(cat.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
