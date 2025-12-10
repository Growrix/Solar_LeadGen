'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/button';

// --- Icon Components ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const LoaderIcon = () => <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

interface Homeowner {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  postcode: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  phoneVerified: boolean;
  leadSubmissionCount: number;
  leadSubmissionLimit: number;
  remainingLeadAllowance: number;
  signupIp: string | null;
  primaryAddress: string | null;
  residentialLeadCount: number;
  commercialLeadCount: number;
}

interface ApiResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Homeowner[];
}

interface FilterState {
  q: string;
  postcode: string;
  status: string;
  from: string;
  to: string;
  quota: string;
}

export default function AdminHomeownersList() {
  const [homeowners, setHomeowners] = useState<Homeowner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    q: '',
    postcode: '',
    status: '',
    from: '',
    to: '',
    quota: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch homeowners
  const fetchHomeowners = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedSearch) params.append('q', debouncedSearch);
      if (filters.postcode) params.append('postcode', filters.postcode);
      if (filters.status) params.append('status', filters.status);
      if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.quota) params.append('quota', filters.quota);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      const response = await fetch(`/api/admin/homeowners?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to view this data');
        }
        throw new Error(`Failed to load homeowners: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      setHomeowners(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load homeowners');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filters, page, pageSize]);

  useEffect(() => {
    fetchHomeowners();
  }, [fetchHomeowners]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const toggleQuotaFilter = (value: string) => {
    setFilters(prev => ({ ...prev, quota: prev.quota === value ? '' : value }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ q: '', postcode: '', status: '', from: '', to: '', quota: '' });
    setPage(1);
  };

  const hasActiveFilters =
    searchInput ||
    filters.postcode ||
    filters.status ||
    filters.from ||
    filters.to ||
    filters.quota;

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const quotaChipOptions = [
    { value: 'available', label: 'Has Remaining Quota' },
    { value: 'exhausted', label: 'At Limit' },
  ];

  const handleEditClick = (homeowner: Homeowner) => {
    setEditingId(homeowner.id);
    setEditValue(homeowner.leadSubmissionLimit);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const handleSaveEdit = async (homeownerId: string) => {
    if (editValue <= 0 || !Number.isFinite(editValue)) {
      alert('Quote limit must be a positive number');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/homeowners/${homeownerId}/lead-limit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteLimit: editValue, notify: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update quote limit');
      }

      // Refresh the list
      await fetchHomeowners();
      setEditingId(null);
      setEditValue(0);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update quote limit');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Button Only */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div></div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="secondary"
        >
          <FilterIcon />
          <span className="ml-2">Filters</span>
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-info text-info-foreground text-caption rounded-full">
              Active
            </span>
          )}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search by name, email, phone, or postcode..."
          className="w-full pl-10 pr-4 py-3 bg-surface shadow-neu-inset border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Quota Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-body-small text-muted-foreground">Quota:</span>
        {quotaChipOptions.map((option) => {
          const isActive = filters.quota === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleQuotaFilter(option.value)}
              className={`px-3 py-1.5 rounded-full text-body-small transition-colors border ${
                isActive
                  ? 'bg-primary text-foreground-secondary border-primary shadow-sm'
                  : 'bg-surface border-border text-muted-foreground hover:bg-surface/50'
              }`}
            >
              {option.label}
            </button>
          );
        })}
        {filters.quota && (
          <button
            type="button"
            onClick={() => toggleQuotaFilter(filters.quota)}
            className="text-caption text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-surface shadow-neu-inset border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Postcode Filter */}
            <div>
              <label className="block text-body-small text-muted-foreground mb-2">
                Postcode
              </label>
              <input
                type="text"
                value={filters.postcode}
                onChange={(e) => handleFilterChange('postcode', e.target.value)}
                placeholder="e.g. SW1A"
                className="w-full px-3 py-2 bg-surface shadow-neu-inset border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-body-small text-muted-foreground mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-surface shadow-neu-inset border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-body-small text-muted-foreground mb-2">
                Registered From
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full px-3 py-2 bg-surface shadow-neu-inset border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-body-small text-muted-foreground mb-2">
                Registered To
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full px-3 py-2 bg-surface shadow-neu-inset border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1.5 text-body-small text-muted-foreground hover:text-foreground transition-colors"
              >
                <XIcon />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-surface shadow-neu-outset border border-error rounded-lg p-4">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoaderIcon />
          <span className="ml-3 text-muted-foreground">Loading homeowners...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && homeowners.length === 0 && (
        <div className="bg-surface rounded-lg border border-border p-12 text-center">
          <div className="text-muted-foreground mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-heading-4 text-foreground mb-2">No homeowners found</h3>
          <p className="text-muted-foreground">
            {hasActiveFilters ? 'Try adjusting your search or filters' : 'No homeowners have registered yet'}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && homeowners.length > 0 && (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                    Homeowner
                  </th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                    Postcode
                  </th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                    Quote Type
                  </th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                    Lead Usage
                  </th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {homeowners.map((homeowner) => (
                  <tr key={homeowner.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Image
                            src={homeowner.image || 'https://picsum.photos/seed/default-avatar/200'}
                            alt={homeowner.name || 'User'}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-body-small text-foreground">
                            {homeowner.name || 'No name'}
                          </div>
                          <div className="text-body-small text-muted-foreground">
                            {homeowner.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-body-small text-foreground">
                          {homeowner.phone || 'No phone'}
                        </span>
                        {homeowner.phone && (
                          <span className={`mt-1 inline-flex items-center gap-1 text-caption ${
                            homeowner.phoneVerified
                              ? 'text-success'
                              : 'text-muted-foreground'
                          }`}>
                            <span className={`inline-block h-2 w-2 rounded-full ${
                              homeowner.phoneVerified ? 'bg-success' : 'bg-muted-foreground'
                            }`}></span>
                            {homeowner.phoneVerified ? 'Verified' : 'Unverified'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-body-small text-foreground">
                        {homeowner.postcode || 'Not set'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-body-small text-foreground max-w-xs truncate" title={homeowner.primaryAddress || undefined}>
                        {homeowner.primaryAddress || <span className="text-muted-foreground">No address</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-body-small text-foreground font-mono">
                        {homeowner.signupIp || <span className="text-muted-foreground">Not captured</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {homeowner.residentialLeadCount > 0 && (
                          <span className="inline-flex items-center px-2 py-1 text-caption rounded-full bg-info/10 text-info border border-info/20">
                            R: {homeowner.residentialLeadCount}
                          </span>
                        )}
                        {homeowner.commercialLeadCount > 0 && (
                          <span className="inline-flex items-center px-2 py-1 text-caption rounded-full bg-warning/10 text-warning border border-warning/20">
                            C: {homeowner.commercialLeadCount}
                          </span>
                        )}
                        {homeowner.residentialLeadCount === 0 && homeowner.commercialLeadCount === 0 && (
                          <span className="text-caption text-muted-foreground">No leads</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-caption rounded-full ${
                        homeowner.isActive
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-error/10 text-error border border-error/20'
                      }`}>
                        {homeowner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-body-small text-foreground">
                          {homeowner.leadSubmissionCount}/
                          {editingId === homeowner.id ? (
                            <input
                              type="number"
                              min="1"
                              value={editValue}
                              onChange={(e) => setEditValue(Number(e.target.value))}
                              className="w-16 px-2 py-1 text-body-small border border-info rounded focus:ring-2 focus:ring-info bg-surface"
                              disabled={updating}
                            />
                          ) : (
                            homeowner.leadSubmissionLimit
                          )}
                        </span>
                        {editingId === homeowner.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveEdit(homeowner.id)}
                              disabled={updating}
                              className="px-2 py-1 text-caption bg-success text-success-foreground rounded hover:bg-success/90 disabled:opacity-50"
                            >
                              {updating ? '...' : '✓'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={updating}
                              className="px-2 py-1 text-caption bg-muted-foreground text-foreground-secondary rounded hover:bg-muted-foreground/80 disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditClick(homeowner)}
                            className="px-2 py-1 text-caption bg-info text-info-foreground rounded hover:bg-info/90"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-caption rounded-full ${
                        homeowner.remainingLeadAllowance > 0
                          ? 'bg-success text-success-foreground'
                          : 'bg-surface/50 text-muted-foreground'
                      }`}>
                        {homeowner.remainingLeadAllowance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-body-small text-muted-foreground">
                      {formatDate(homeowner.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {homeowners.map((homeowner) => (
              <div key={homeowner.id} className="p-4">
                <div className="flex items-center mb-3">
                  <Image
                    src={homeowner.image || 'https://picsum.photos/seed/default-avatar/200'}
                    alt={homeowner.name || 'User'}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="ml-3 flex-1">
                    <div className="text-body-small text-foreground">
                      {homeowner.name || 'No name'}
                    </div>
                    <div className="text-caption text-muted-foreground">
                      {homeowner.email}
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-caption rounded-full ${
                    homeowner.isActive
                      ? 'bg-success text-success-foreground'
                      : 'bg-error text-error-foreground'
                  }`}>
                    {homeowner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-body-small">
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <div className="text-foreground">{homeowner.phone || 'No phone'}</div>
                    {homeowner.phone && (
                      <div className={`text-caption ${
                        homeowner.phoneVerified
                          ? 'text-success'
                          : 'text-muted-foreground'
                      }`}>
                        {homeowner.phoneVerified ? 'Verified' : 'Unverified'}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Postcode:</span>
                    <div className="text-foreground">{homeowner.postcode || 'Not set'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>
                    <div className="text-foreground text-caption">
                      {homeowner.primaryAddress || <span className="text-muted-foreground">No address</span>}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">IP Address:</span>
                    <div className="text-foreground font-mono text-caption">
                      {homeowner.signupIp || <span className="text-muted-foreground">Not captured</span>}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Quote Type:</span>
                    <div className="flex gap-1 mt-1">
                      {homeowner.residentialLeadCount > 0 && (
                        <span className="inline-flex items-center px-2 py-1 text-caption rounded-full bg-info/10 text-info border border-info/20">
                          Residential: {homeowner.residentialLeadCount}
                        </span>
                      )}
                      {homeowner.commercialLeadCount > 0 && (
                        <span className="inline-flex items-center px-2 py-1 text-caption rounded-full bg-warning/10 text-warning border border-warning/20">
                          Commercial: {homeowner.commercialLeadCount}
                        </span>
                      )}
                      {homeowner.residentialLeadCount === 0 && homeowner.commercialLeadCount === 0 && (
                        <span className="text-caption text-muted-foreground">No leads</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lead Usage:</span>
                    <div className="text-foreground">
                      {homeowner.leadSubmissionCount}/{homeowner.leadSubmissionLimit}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining:</span>
                    <div className="text-foreground">{homeowner.remainingLeadAllowance}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Registered:</span>
                    <div className="text-foreground">{formatDate(homeowner.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && homeowners.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <label className="text-body-small text-muted-foreground">Show:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-surface shadow-neu-inset border border-border rounded-lg text-body-small focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-body-small text-muted-foreground">per page</span>
            </div>

            {/* Page Info */}
            <div className="text-body-small text-muted-foreground">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-border rounded-lg hover:bg-surface/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    pageNumber = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`px-3 py-1.5 text-body-small rounded-lg transition-colors ${
                        page === pageNumber
                          ? 'bg-primary text-foreground-secondary'
                          : 'border border-border hover:bg-surface/50 text-muted-foreground'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-border rounded-lg hover:bg-surface/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}