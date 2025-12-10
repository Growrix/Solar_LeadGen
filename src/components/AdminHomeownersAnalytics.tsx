'use client';

import React, { useState, useEffect } from 'react';

// --- Icon Components ---
const LoaderIcon = () => <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

interface PostcodeData {
  postcode: string | null;
  count: number;
  percentage: number;
}

interface LocationData {
  location: string;
  count: number;
  percentage: number;
}

interface AnalyticsData {
  window: string;
  totals: {
    homeowners: number;
  };
  byPostcode: PostcodeData[];
  byLocation: LocationData[];
}

type TimeWindow = 'all' | '30d' | '90d';

export default function AdminHomeownersAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('all');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/homeowners/analytics?window=${timeWindow}`);

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to view this data');
          }
          throw new Error(`Failed to load analytics: ${response.statusText}`);
        }

        const data: AnalyticsData = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeWindow]);

  const getTimeWindowLabel = (window: TimeWindow): string => {
    switch (window) {
      case 'all': return 'All Time';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      default: return 'All Time';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Window Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-2 text-foreground">Homeowner Analytics</h1>
          <p className="text-body-small text-muted mt-1">
            Overview of homeowner distribution and statistics
          </p>
        </div>

        {/* Time Window Tabs */}
        <div className="inline-flex bg-slate-100 rounded-lg p-1">
          {(['all', '30d', '90d'] as TimeWindow[]).map((window) => (
            <button
              key={window}
              onClick={() => setTimeWindow(window)}
              className={`px-4 py-2 text-body-small rounded-md transition-colors ${
                timeWindow === window
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {getTimeWindowLabel(window)}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-error/10 border border-error rounded-lg p-4">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoaderIcon />
          <span className="ml-3 text-muted">Loading analytics...</span>
        </div>
      )}

      {/* Analytics Content */}
      {!isLoading && analytics && (
        <>
          {/* Total Homeowners Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-foreground-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground-secondary text-body-small mb-1">Total Homeowners</p>
                <p className="text-heading-1">{analytics.totals.homeowners.toLocaleString()}</p>
                <p className="text-foreground-secondary text-caption mt-2">{getTimeWindowLabel(timeWindow)}</p>
              </div>
              <div className="bg-surface/20 p-4 rounded-lg">
                <UsersIcon />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Postcode */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <h2 className="text-heading-4 text-foreground mb-4">By Postcode</h2>
              
              {analytics.byPostcode.length === 0 ? (
                <p className="text-muted text-center py-8">No data available</p>
              ) : (
                <div className="space-y-3">
                  {analytics.byPostcode.slice(0, 10).map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-body-small">
                        <span className="text-foreground">
                          {item.postcode || 'Not set'}
                        </span>
                        <span className="text-muted">
                          {item.count} ({item.percentage?.toFixed(1) || '0.0'}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-colors duration-500"
                          style={{ width: `${item.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {analytics.byPostcode.length > 10 && (
                <p className="text-caption text-muted mt-4 text-center">
                  Showing top 10 of {analytics.byPostcode.length} postcodes
                </p>
              )}
            </div>

            {/* By Location */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <h2 className="text-heading-4 text-foreground mb-4">By Location</h2>
              
              {analytics.byLocation.length === 0 ? (
                <p className="text-muted text-center py-8">No data available</p>
              ) : (
                <div className="space-y-3">
                  {analytics.byLocation.slice(0, 10).map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-body-small">
                        <span className="text-foreground">
                          {item.location}
                        </span>
                        <span className="text-muted">
                          {item.count} ({item.percentage?.toFixed(1) || '0.0'}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-success h-full rounded-full transition-colors duration-500"
                          style={{ width: `${item.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {analytics.byLocation.length > 10 && (
                <p className="text-caption text-muted mt-4 text-center">
                  Showing top 10 of {analytics.byLocation.length} locations
                </p>
              )}
            </div>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Postcode Table */}
            <div className="bg-surface rounded-lg border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-label text-foreground">All Postcodes</h3>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-caption text-muted uppercase">
                        Postcode
                      </th>
                      <th className="px-6 py-3 text-right text-caption text-muted uppercase">
                        Count
                      </th>
                      <th className="px-6 py-3 text-right text-caption text-muted uppercase">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {analytics.byPostcode.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-body-small text-foreground">
                          {item.postcode || 'Not set'}
                        </td>
                        <td className="px-6 py-3 text-body-small text-foreground text-right">
                          {item.count}
                        </td>
                        <td className="px-6 py-3 text-body-small text-muted text-right">
                          {item.percentage?.toFixed(1) || '0.0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Location Table */}
            <div className="bg-surface rounded-lg border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-label text-foreground">All Locations</h3>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-caption text-muted uppercase">
                        Location
                      </th>
                      <th className="px-6 py-3 text-right text-caption text-muted uppercase">
                        Count
                      </th>
                      <th className="px-6 py-3 text-right text-caption text-muted uppercase">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {analytics.byLocation.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-body-small text-foreground">
                          {item.location}
                        </td>
                        <td className="px-6 py-3 text-body-small text-foreground text-right">
                          {item.count}
                        </td>
                        <td className="px-6 py-3 text-body-small text-muted text-right">
                          {item.percentage?.toFixed(1) || '0.0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}