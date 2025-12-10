'use client';

/**
 * InstallerAssignedLeads Component
 * 
 * Purpose: Display leads assigned to installer by admin
 * Features:
 * - Fetch assigned leads from GET /api/leads?assigned=true
 * - Show"Admin Assigned" badge
 * - Display assignment metadata (date, notes)
 * - Accept assignment button (bypasses payment)
 * - View lead details
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface AssignedLead {
  id: string;
  projectType: string;
  propertyType: string;
  postcode: string;
  location: string;
  state: string;
  energyBill: number;
  budgetRange: string;
  batteryRequired: boolean;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  leadPrice: number | null;
  assignedAt: string;
  assignedByName: string;
  assignmentNotes: string | null;
  assignmentStatus: 'pending' | 'accepted';
  assignmentMode: 'exclusive' | 'competitive';
  competitorCount?: number;
}

export default function InstallerAssignedLeads() {
  const router = useRouter();
  const [leads, setLeads] = useState<AssignedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignedLeads();
  }, []);

  const fetchAssignedLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leads?assigned=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch assigned leads');
      }
      
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned leads');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async (leadId: string) => {
    if (!confirm('Accept this assignment? This will give you access to the lead details.')) return;

    try {
      setAcceptingId(leadId);
      const response = await fetch(`/api/leads/${leadId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminAssigned: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept assignment');
      }

      alert('Assignment accepted! You now have access to this lead.');
      await fetchAssignedLeads();
    } catch (err: any) {
      alert(err.message || 'Failed to accept assignment');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleViewDetails = (leadId: string) => {
    router.push(`/installer/leads/${leadId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-muted-foreground">Loading assigned leads...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-error/10 p-6 border border-error">
        <p className="text-error">Error loading assigned leads</p>
        <p className="text-error text-body-small mt-1">{error}</p>
        <button
          onClick={fetchAssignedLeads}
          className="mt-4 px-4 py-2 bg-error text-foreground-secondary rounded-lg hover:bg-error text-body-small"
        >
          Retry
        </button>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 bg-surface rounded-lg border border-border">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
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
        <h3 className="mt-4 text-heading-4 text-foreground">No Assigned Leads</h3>
        <p className="mt-2 text-body-small text-muted-foreground">
          You don&apos;t have any leads assigned by admin at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-2 text-foreground">
            Assigned Leads
          </h2>
          <p className="text-body-small text-muted-foreground mt-1">
            Leads assigned to you by the admin team
          </p>
        </div>
        <span className="px-4 py-2 bg-primary/20 text-primary rounded-full text-body-small">
          {leads.length} Lead{leads.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="bg-surface rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Header with badges */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-primary text-foreground-secondary">
                  🎯 Admin Assigned
                </span>
                {lead.assignmentMode === 'exclusive' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-success/20 text-success">
                    Exclusive
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-accent/20 text-accent">
                    Competitive {lead.competitorCount && `(${lead.competitorCount})`}
                  </span>
                )}
              </div>
              <p className="text-body-small text-gray-700">
                {lead.projectType} - {lead.propertyType}
              </p>
            </div>

            {/* Lead Details */}
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-body-small text-muted-foreground">Location</p>
                  <p className="text-body-small text-foreground">
                    {lead.location}, {lead.state} - {lead.postcode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-body-small text-muted-foreground">Budget</p>
                  <p className="text-body-small text-foreground">
                    {lead.budgetRange}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="flex-1">
                  <p className="text-body-small text-muted-foreground">Energy Bill</p>
                  <p className="text-body-small text-foreground">
                    £{lead.energyBill.toFixed(2)}
                  </p>
                </div>
              </div>

              {lead.batteryRequired && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-caption bg-accent/20 text-accent">
                  🔋 Battery Required
                </span>
              )}

              {/* Assignment Info */}
              <div className="pt-3 border-t border-border">
                <p className="text-caption text-muted-foreground">
                  Assigned by <span className="">{lead.assignedByName}</span>
                </p>
                <p className="text-caption text-muted-foreground">
                  {format(new Date(lead.assignedAt), 'MMM d, yyyy h:mm a')}
                </p>
                {lead.assignmentNotes && (
                  <div className="mt-2 p-2 bg-surface rounded text-caption text-gray-700">
                    <p className="mb-1">Admin Notes:</p>
                    <p>{lead.assignmentNotes}</p>
                  </div>
                )}
              </div>

              {/* Expiry Warning - Only show if pending */}
              {lead.expiresAt && lead.assignmentStatus === 'pending' && (
                <div className="flex items-center gap-2 text-caption text-warning">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Expires: {format(new Date(lead.expiresAt), 'MMM d, yyyy')}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 bg-surface border-t border-border space-y-2">
              {lead.assignmentStatus === 'pending' ? (
                <button
                  onClick={() => handleAcceptAssignment(lead.id)}
                  disabled={acceptingId === lead.id}
                  className="w-full px-4 py-2 bg-success text-foreground-secondary rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed text-body-small flex items-center justify-center gap-2"
                >
                  {acceptingId === lead.id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Accepting...
                    </>
                  ) : (
                    <>
                      ✓ Accept Assignment
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleViewDetails(lead.id)}
                  className="w-full px-4 py-2 bg-primary text-foreground-secondary rounded-lg hover:bg-primary text-body-small"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}