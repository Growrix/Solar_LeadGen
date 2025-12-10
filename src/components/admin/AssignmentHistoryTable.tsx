'use client';

/**
 * AssignmentHistoryTable Component
 * 
 * Purpose: Display and manage lead assignment history for admins
 * Features:
 * - Shows all installers assigned to a lead
 * - Display assignment metadata (date, assigned by, notes)
 * - Status tracking (pending/accepted/removed)
 * - Remove assignment action
 */

import { useState } from 'react';
import { format } from 'date-fns';

interface Assignment {
  id: string;
  installerId: string;
  installerName: string;
  installerEmail: string;
  assignedAt: string;
  assignedByName: string;
  notes: string | null;
  status: 'pending' | 'accepted' | 'removed';
}

interface AssignmentHistoryTableProps {
  assignments: Assignment[];
  leadId: string;
  onRemoveAssignment: (installerId: string) => Promise<void>;
}

export default function AssignmentHistoryTable({
  assignments,
  leadId,
  onRemoveAssignment,
}: AssignmentHistoryTableProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (installerId: string, installerName: string) => {
    if (!confirm(`Remove assignment from ${installerName}?`)) return;

    setRemovingId(installerId);
    setError(null);

    try {
      await onRemoveAssignment(installerId);
    } catch (err: any) {
      setError(err.message || 'Failed to remove assignment');
    } finally {
      setRemovingId(null);
    }
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 bg-surface rounded-lg border border-border">
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-body-small text-muted-foreground">
          No assignments yet
        </p>
        <p className="text-caption text-muted-foreground">
          Click &ldquo;Assign to Installer&rdquo; to assign this lead
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-error/10 p-4">
          <p className="text-body-small text-error">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface">
            <tr>
              <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                Installer
              </th>
              <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                Assigned Date
              </th>
              <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                Assigned By
              </th>
              <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-right text-caption text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="hover:bg-surface-hover">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-body-small text-foreground">
                      {assignment.installerName}
                    </div>
                    <div className="text-body-small text-muted-foreground">
                      {assignment.installerEmail}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-body-small text-foreground">
                  {format(new Date(assignment.assignedAt), 'MMM d, yyyy')}
                  <div className="text-caption text-muted-foreground">
                    {format(new Date(assignment.assignedAt), 'h:mm a')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-body-small text-foreground">
                  {assignment.assignedByName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {assignment.status === 'pending' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-warning/20 text-warning">
                      Pending
                    </span>
                  )}
                  {assignment.status === 'accepted' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-success/20 text-success">
                      Accepted
                    </span>
                  )}
                  {assignment.status === 'removed' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-surface text-foreground">
                      Removed
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-body-small text-foreground">
                  {assignment.notes ? (
                    <div className="max-w-xs truncate" title={assignment.notes}>
                      {assignment.notes}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-body-small">
                  {assignment.status === 'pending' && (
                    <button
                      onClick={() => handleRemove(assignment.installerId, assignment.installerName)}
                      disabled={removingId === assignment.installerId}
                      className="text-error hover:text-error/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {removingId === assignment.installerId ? 'Removing...' : 'Remove'}
                    </button>
                  )}
                  {assignment.status !== 'pending' && (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-body-small text-muted-foreground">
        <span>
          Total Assignments: {assignments.length}
        </span>
        <span>
          Pending: {assignments.filter(a => a.status === 'pending').length} • 
          Accepted: {assignments.filter(a => a.status === 'accepted').length} • 
          Removed: {assignments.filter(a => a.status === 'removed').length}
        </span>
      </div>
    </div>
  );
}