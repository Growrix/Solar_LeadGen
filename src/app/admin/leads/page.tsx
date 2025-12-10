'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme, type Theme } from '@/components/ThemeProvider';
import { LiveCountdownBar } from '@/components/LiveCountdownBar';
import Button from '@/components/Button';

interface Lead {
  id: string;
  homeowner: {
    name: string;
    email: string;
  };
  status: string;
  visibility: string;
  phoneVerified: boolean;
  quoteType?: 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING';
  postcode: string;
  location: string;
  energyBill: number;
  leadPrice: number | null;
  createdAt: string;
  approvedAt: string | null;
  expiresAt: string | null;
}

export default function AdminLeadsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [postcodeFilter, setPostcodeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, statusFilter, verificationFilter, postcodeFilter, page]);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      fetchLeads();
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, statusFilter, verificationFilter, postcodeFilter, page]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (postcodeFilter) params.append('postcode', postcodeFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/leads?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      
      let filteredLeads = data.leads || [];
      if (verificationFilter === 'VERIFIED') {
        filteredLeads = filteredLeads.filter((l: Lead) => l.phoneVerified);
      } else if (verificationFilter === 'UNVERIFIED') {
        filteredLeads = filteredLeads.filter((l: Lead) => !l.phoneVerified);
      }
      
      setLeads(filteredLeads);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
  DRAFT: 'bg-surface text-muted-foreground',
      PENDING_PHONE: 'bg-warning text-warning-foreground',
      PENDING_APPROVAL: 'bg-warning text-warning-foreground',
      APPROVED: 'bg-success text-success-foreground',
      PURCHASED: 'bg-info text-info-foreground',
      REJECTED: 'bg-error text-error-foreground',
      EXPIRED: 'bg-surface text-muted-foreground',
      CANCELLED: 'bg-error text-error-foreground', // Ensure white text for CANCELLED
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const getQuoteTypeIcon = (type?: string) => {
    if (type === 'CALL_VISIT') return '📞';
    if (type === 'WRITTEN_QUOTE') return '📄';
    if (type === 'BIDDING') return '🏆';
    return '❓';
  };

  const getQuoteTypeLabel = (type?: string) => {
    if (type === 'CALL_VISIT') return 'Call/Visit';
    if (type === 'WRITTEN_QUOTE') return 'Written Quote';
    if (type === 'BIDDING') return 'Competitive Bidding';
    return 'Unknown';
  };

  const filteredAndSearchedLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.homeowner.name.toLowerCase().includes(query) ||
      lead.homeowner.email.toLowerCase().includes(query) ||
      lead.id.toLowerCase().includes(query)
    );
  });

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      {/* Page Title & Subtitle */}
      <div className="mb-8">
        <h1 className="text-heading-1 text-foreground mb-2">Leads Management</h1>
        <p className="text-heading-4 text-muted-foreground">View, filter, and manage all homeowner leads in the system.</p>
      </div>
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-muted-foreground">Loading leads...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error text-error-foreground px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-surface rounded-2xl shadow-neu-outset p-6 mb-6">
        <form className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
          <div className="flex-1 flex flex-col gap-2 min-w-[220px]">
            <label className="block text-body-small text-foreground">Search Leads</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by homeowner name, email, or quote ID..."
                className="form-input w-full h-12 pl-10 pr-10 rounded-2xl shadow-neu-inset text-body"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 min-w-[180px]">
            <label className="block text-body-small text-foreground">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select w-full h-12 rounded-2xl shadow-neu-inset text-body"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_PHONE">Pending Phone</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="PURCHASED">Purchased</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col gap-2 min-w-[180px]">
            <label className="block text-body-small text-foreground">Verification</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="form-select w-full h-12 rounded-2xl shadow-neu-inset text-body"
            >
              <option value="ALL">All</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="UNVERIFIED">Unverified Only</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col gap-2 min-w-[180px]">
            <label className="block text-body-small text-foreground">Postcode</label>
            <input
              type="text"
              value={postcodeFilter}
              onChange={(e) => setPostcodeFilter(e.target.value)}
              placeholder="e.g., SW1A"
              className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body pl-4 placeholder:text-left placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex-1 flex items-end min-w-[180px]">
            <Button
              onClick={fetchLeads}
              disabled={loading}
              variant="secondary"
              className="w-full h-12"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2">Loading...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="ml-2">Refresh</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Table & Pagination */}
      {(!loading && filteredAndSearchedLeads.length > 0) && (
        <div className="bg-surface rounded-2xl shadow-neu-outset overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface shadow-neu-inset">
                <tr>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">Homeowner</th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">Quote Type</th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">Countdown</th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">Verified</th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">Energy Bill</th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-caption text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAndSearchedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-surface-hover cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/leads/${lead.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-body-small text-foreground">{lead.homeowner.name}</div>
                        <div className="text-body-small text-muted-foreground">{lead.homeowner.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-body-small text-foreground">{lead.location}</div>
                      <div className="text-body-small text-muted-foreground">{lead.postcode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-body-small">
                        <span className="text-heading-4">{getQuoteTypeIcon(lead.quoteType)}</span>
                        <span>{getQuoteTypeLabel(lead.quoteType)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-caption rounded-full ${
                        lead.status === 'APPROVED'
                          ? 'bg-success/10 text-success border border-success/20'
                          : lead.status === 'REJECTED' || lead.status === 'CANCELLED'
                            ? 'bg-error/10 text-error border border-error/20'
                            : lead.status === 'PENDING_PHONE' || lead.status === 'PENDING_APPROVAL'
                              ? 'bg-warning/10 text-warning border border-warning/20'
                              : lead.status === 'EXPIRED'
                                ? 'bg-muted text-muted-foreground border border-border'
                                : 'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {formatStatus(lead.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.expiresAt && lead.status === 'APPROVED' && (
                        <LiveCountdownBar
                          expiresAt={lead.expiresAt}
                          leadId={lead.id}
                          leadStatus={lead.status}
                          quoteType={lead.quoteType}
                          position="inline"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.phoneVerified ? (
                        <div className="flex items-center gap-1" title="Verified">
                          <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1" title="Not Verified">
                          <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-body-small text-foreground">
                      £{lead.energyBill.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-body-small text-foreground">
                      {lead.leadPrice ? `£${lead.leadPrice.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-body-small text-foreground">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-body-small">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/leads/${lead.id}`);
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border flex justify-between items-center">
              <div className="text-body-small text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-border rounded-lg text-body-small transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-border rounded-lg text-body-small transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAndSearchedLeads.length === 0 && (
        <div className="bg-surface shadow-neu-inset rounded-2xl p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground mb-4"
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
          <h3 className="text-heading-4 text-foreground mb-2">No leads found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'No leads match your search query. Try different keywords.'
              : statusFilter !== 'ALL' || postcodeFilter
              ? 'Try adjusting your filters'
              : 'Leads will appear here when homeowners submit quote requests'}
          </p>
        </div>
      )}
    </div>
  );
}