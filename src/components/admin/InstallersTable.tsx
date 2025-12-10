'use client';

/**
 * InstallersTable Component
 * 
 * Displays all installer users in a table with:
 * - Search functionality (email, name, phone, company, address)
 * - Filter by phone verification status
 * - Filter by installer verification status
 * - Pagination
 * - Real-time updates
 * - Dark mode support
 */

import React, { useState, useEffect, useCallback } from 'react';
import styles from './InstallersTable.module.css';
import Image from 'next/image';
import Button from '@/components/ui/button';

// F15: InstallerVerification data structure
interface InstallerVerification {
  companyName: string;
  representativeName: string;
  phone: string;
  address: string | null;
  postcodes: string[];
  status: string;
}

interface Installer {
  id: string;
  email: string;
  phoneVerified: boolean;
  installerVerified: boolean;
  isActive: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  installerVerification: InstallerVerification | null; // F15: Source of truth for business data
}

interface InstallersResponse {
  installers: Installer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const InstallersTable: React.FC = () => {
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneVerifiedFilter, setPhoneVerifiedFilter] = useState<string>('all');
  const [installerVerifiedFilter, setInstallerVerifiedFilter] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Fetch installers
  const fetchInstallers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (phoneVerifiedFilter !== 'all') {
        params.append('phoneVerified', phoneVerifiedFilter);
      }

      if (installerVerifiedFilter !== 'all') {
        params.append('installerVerified', installerVerifiedFilter);
      }

      const response = await fetch(`/api/admin/installers/list?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch installers: ${response.statusText}`);
      }

      const data: InstallersResponse = await response.json();
      
      setInstallers(data.installers);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching installers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch installers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, phoneVerifiedFilter, installerVerifiedFilter]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchInstallers();
  }, [fetchInstallers]);

  // Reset to page 1 when filters change (setCurrentPage is stable)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, phoneVerifiedFilter, installerVerifiedFilter, currentPage]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">


      {/* Filters */}
      <div className="theme-card p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label htmlFor="search" className="block text-body-small text-foreground mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Email, name, phone, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input w-full rounded-xl bg-surface text-foreground shadow-neu-inset border border-border px-4 py-3 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Phone Verified Filter */}
          <div>
            <label htmlFor="phoneVerified" className="block text-body-small text-foreground mb-2">
              Phone Verified
            </label>
            <select
              id="phoneVerified"
              value={phoneVerifiedFilter}
              onChange={(e) => setPhoneVerifiedFilter(e.target.value)}
              className="form-select w-full rounded-xl bg-surface text-foreground shadow-neu-inset border border-border px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>
          </div>

          {/* Installer Verified Filter */}
          <div>
            <label htmlFor="installerVerified" className="block text-body-small text-foreground mb-2">
              Installer Verified
            </label>
            <select
              id="installerVerified"
              value={installerVerifiedFilter}
              onChange={(e) => setInstallerVerifiedFilter(e.target.value)}
              className="form-select w-full rounded-xl bg-surface text-foreground shadow-neu-inset border border-border px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="theme-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-2 text-body-small text-muted-foreground">Loading installers...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-error">{error}</p>
            <Button
              onClick={fetchInstallers}
              variant="primary"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : installers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No installers found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface shadow-neu-inset border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                      Company / Contact
                    </th>
                    <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                      Postcode(s)
                    </th>
                    <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {installers.map((installer) => (
                    <tr key={installer.id} className="hover:bg-surface-hover">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {installer.image ? (
                              <Image
                                src={installer.image}
                                alt={installer.installerVerification?.representativeName || 'Installer'}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-body-small">
                                  {installer.installerVerification?.companyName?.charAt(0).toUpperCase() || 'I'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-body-small text-foreground">
                              {installer.installerVerification?.companyName || 'Verification not submitted'}
                            </div>
                            <div className="text-body-small text-muted-foreground">
                              {installer.installerVerification?.representativeName || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-body-small text-foreground">
                          {installer.installerVerification?.postcodes?.[0] || 'N/A'}
                          {installer.installerVerification?.postcodes && installer.installerVerification.postcodes.length > 1 && (
                            <span className="text-muted-foreground"> +{installer.installerVerification.postcodes.length - 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-body-small text-foreground">{installer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-body-small text-foreground">
                          {installer.installerVerification?.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-body-small text-foreground truncate max-w-xs" title={installer.installerVerification?.address || 'Not provided'}>
                          {installer.installerVerification?.address || 'Not provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`${styles['badge-verify']} flex items-center gap-2 ${installer.phoneVerified === true ? 'text-success' : 'text-error'}`}> 
                            <span className={`inline-block w-2 h-2 rounded-full ${installer.phoneVerified === true ? 'bg-success' : 'bg-error'}`}></span>
                            {installer.phoneVerified === true ? <span>&#10003; Phone</span> : <span>&#10007; Phone</span>}
                          </span>
                          <span className={`${styles['badge-verify']} flex items-center gap-2 ${installer.installerVerified === true ? 'text-success' : 'text-error'}`}> 
                            <span className={`inline-block w-2 h-2 rounded-full ${installer.installerVerified === true ? 'bg-success' : 'bg-error'}`}></span>
                            {installer.installerVerified === true ? <span>&#10003; Installer</span> : <span>&#10007; Installer</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-body-small text-foreground">
                          {formatDate(installer.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-caption rounded-full ${
                          installer.isActive
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-error/10 text-error border border-error/20'
                        }`}>
                          {installer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          onClick={() => window.location.href = `/admin/installers/${installer.id}`}
                          variant="secondary"
                          className="text-body-small"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {installers.map((installer) => (
                <div key={installer.id} className="p-4 hover:bg-surface-hover">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      {installer.image ? (
                        <Image
                          src={installer.image}
                          alt={installer.installerVerification?.representativeName || 'Installer'}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary">
                            {installer.installerVerification?.companyName?.charAt(0).toUpperCase() || 'I'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-body-small text-foreground truncate">
                        {installer.installerVerification?.companyName || 'Verification not submitted'}
                      </h3>
                      <p className="text-body-small text-muted-foreground truncate">
                        {installer.installerVerification?.representativeName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-body-small">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground truncate ml-2">{installer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="text-foreground">{installer.installerVerification?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="text-foreground truncate max-w-[200px]" title={installer.installerVerification?.address || 'Not provided'}>
                        {installer.installerVerification?.address || 'Not provided'}
                      </span>
                    </div>
                    {installer.installerVerification?.postcodes && installer.installerVerification.postcodes.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Postcode(s):</span>
                        <span className="text-foreground">
                          {installer.installerVerification.postcodes[0]}
                          {installer.installerVerification.postcodes.length > 1 && (
                            <span className="text-muted-foreground"> +{installer.installerVerification.postcodes.length - 1}</span>
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Verified:</span>
                      <div className="flex gap-1">
                        <span className={`${styles['badge-verify']} flex items-center gap-2 ${installer.phoneVerified === true ? 'text-success' : 'text-error'}`}> 
                          <span className={`inline-block w-2 h-2 rounded-full ${installer.phoneVerified === true ? 'bg-success' : 'bg-error'}`}></span>
                          {installer.phoneVerified === true ? <span>&#10003; Phone</span> : <span>&#10007; Phone</span>}
                        </span>
                        <span className={`${styles['badge-verify']} flex items-center gap-2 ${installer.installerVerified === true ? 'text-success' : 'text-error'}`}> 
                          <span className={`inline-block w-2 h-2 rounded-full ${installer.installerVerified === true ? 'bg-success' : 'bg-error'}`}></span>
                          {installer.installerVerified === true ? <span>&#10003; Installer</span> : <span>&#10007; Installer</span>}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Registered:</span>
                      <span className="text-foreground">{formatDate(installer.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-caption rounded-full ${
                        installer.isActive
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-error/10 text-error border border-error/20'
                      }`}>
                        {installer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      onClick={() => window.location.href = `/admin/installers/${installer.id}`}
                      variant="secondary"
                      className="w-full text-body-small"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="theme-card flex items-center justify-between px-4 py-3 border-t border-border sm:px-6 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              className="ml-3"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-body-small text-foreground">
                Showing <span className="">{(currentPage - 1) * limit + 1}</span> to{' '}
                <span className="">{Math.min(currentPage * limit, total)}</span> of{' '}
                <span className="">{total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex gap-1" aria-label="Pagination">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="minimal"
                  className="px-3"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? 'primary' : 'minimal'}
                    className="px-4"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="minimal"
                  className="px-3"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallersTable;