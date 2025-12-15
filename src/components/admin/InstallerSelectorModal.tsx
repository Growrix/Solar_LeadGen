'use client';

/**
 * InstallerSelectorModal Component
 * 
 * Purpose: Admin modal to select installers for lead assignment
 * Features:
 * - Multi-select with search
 * - Verification status badges
 * - Exclusive vs Competitive mode selection
 * - Assignment notes
 * -"All Verified Installers" quick select
 */

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';

interface Installer {
  id: string;
  name: string | null;
  email: string;
  companyName: string | null;
  installerVerified: boolean;
  postcode: string | null;
}

interface InstallerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: {
    installerIds: string[];
    mode: 'exclusive' | 'competitive';
    notes?: string; // Optional notes
    notifyInstallers: boolean;
  }) => Promise<void>;
  leadId: string;
}

export default function InstallerSelectorModal({
  isOpen,
  onClose,
  onAssign,
  leadId,
}: InstallerSelectorModalProps) {
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mode, setMode] = useState<'exclusive' | 'competitive'>('exclusive');
  const [notes, setNotes] = useState('');
  const [notifyInstallers, setNotifyInstallers] = useState(true);
  const [includeUnverified, setIncludeUnverified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch installers on mount
  useEffect(() => {
    if (isOpen) {
      fetchInstallers();
    }
  }, [isOpen, includeUnverified]);

  const fetchInstallers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users?role=INSTALLER&verified=${!includeUnverified}`);
      if (!response.ok) throw new Error('Failed to fetch installers');
      const data = await response.json();
      setInstallers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter installers by search query
  const filteredInstallers = installers.filter((installer) => {
    const query = searchQuery.toLowerCase();
    return (
      installer.name?.toLowerCase().includes(query) ||
      installer.email.toLowerCase().includes(query) ||
      installer.companyName?.toLowerCase().includes(query) ||
      installer.postcode?.toLowerCase().includes(query)
    );
  });

  // Toggle installer selection
  const toggleInstaller = (installerId: string) => {
    setSelectedIds((prev) =>
      prev.includes(installerId)
        ? prev.filter((id) => id !== installerId)
        : [...prev, installerId]
    );
  };

  // Select all verified installers
  const selectAllVerified = () => {
    const verifiedIds = installers
      .filter((i) => i.installerVerified)
      .map((i) => i.id);
    setSelectedIds(verifiedIds);
    setMode('competitive');
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one installer');
      return;
    }

    if (mode === 'exclusive' && selectedIds.length > 1) {
      setError('Exclusive mode allows only one installer');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onAssign({
        installerIds: selectedIds,
        mode,
        notes: notes.trim() || undefined,
        notifyInstallers,
      });
      
      // Reset and close on success
      setSelectedIds([]);
      setNotes('');
      setMode('exclusive');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign lead');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-3xl rounded-lg bg-surface shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-heading-3 text-foreground">
              Assign Lead to Installer(s)
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-muted-foreground"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Error Alert */}
            {error && (
              <div className="rounded-md bg-error/10 p-4">
                <p className="text-body-small text-error">{error}</p>
              </div>
            )}

            {/* Search & Filters */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search by name, email, company, or postcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border px-4 py-2 bg-surface text-foreground focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeUnverified}
                    onChange={(e) => setIncludeUnverified(e.target.checked)}
                    className="rounded border-border text-success focus:ring-success"
                  />
                  <span className="text-body-small text-gray-700">
                    Include Unverified Installers
                  </span>
                </label>

                <button
                  onClick={selectAllVerified}
                  className="text-body-small text-success hover:underline"
                >
                  Select All Verified ({installers.filter(i => i.installerVerified).length})
                </button>
              </div>
            </div>

            {/* Assignment Mode */}
            <div className="space-y-2">
              <label className="block text-body-small text-gray-700">
                Assignment Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('exclusive')}
                  className={`px-4 py-3 rounded-md border-2 text-body-small transition-colors ${
                    mode === 'exclusive'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-border bg-surface text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="">Exclusive</div>
                  <div className="text-caption mt-1">Only one installer can accept</div>
                </button>
                <button
                  onClick={() => setMode('competitive')}
                  className={`px-4 py-3 rounded-md border-2 text-body-small transition-colors ${
                    mode === 'competitive'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-border bg-surface text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="">Competitive</div>
                  <div className="text-caption mt-1">First to accept wins</div>
                </button>
              </div>
            </div>

            {/* Installer List */}
            <div className="space-y-2">
              <label className="block text-body-small text-gray-700">
                Select Installers ({selectedIds.length} selected)
              </label>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading installers...
                </div>
              ) : filteredInstallers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No installers found
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-md p-2">
                  {filteredInstallers.map((installer) => (
                    <label
                      key={installer.id}
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                        selectedIds.includes(installer.id)
                          ? 'bg-emerald-50 border border-emerald-300'
                          : 'bg-surface hover:bg-surface border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(installer.id)}
                        onChange={() => toggleInstaller(installer.id)}
                        className="rounded border-border text-success focus:ring-success"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground truncate">
                            {installer.name || 'No Name'}
                          </span>
                          {installer.installerVerified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-caption bg-success/20 text-success">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-body-small text-muted-foreground">
                          {installer.companyName && <span>{installer.companyName} • </span>}
                          <span>{installer.email}</span>
                          {installer.postcode && <span> • {installer.postcode}</span>}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Assignment Notes */}
            <div className="space-y-2">
              <label className="block text-body-small text-gray-700">
                Assignment Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or context for the installer(s)..."
                rows={3}
                className="w-full rounded-md border border-border px-4 py-2 bg-surface text-foreground focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Notify Installers */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifyInstallers}
                onChange={(e) => setNotifyInstallers(e.target.checked)}
                className="rounded border-border text-success focus:ring-success"
              />
              <span className="text-body-small text-gray-700">
                Send notifications to assigned installers
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-body-small text-gray-700 hover:bg-surface rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedIds.length === 0}
              className="px-4 py-2 text-body-small text-foreground-secondary bg-success hover:bg-success/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Assigning...' : `Assign to ${selectedIds.length} Installer${selectedIds.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}