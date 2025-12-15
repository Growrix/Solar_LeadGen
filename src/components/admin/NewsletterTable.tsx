'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/Button';

// Icon Components
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
);

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
  unsubscribedAt: string | null;
}

export default function NewsletterTable() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/newsletter/subscribe');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.subscribers)) {
        setSubscribers(data.subscribers);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
      setError('Failed to load subscribers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div className="theme-card p-4">
            <p className="text-body-small text-muted-foreground mb-1">Total</p>
            <p className="text-heading-2 text-foreground">{subscribers.length}</p>
          </div>
          <div className="theme-card p-4">
            <p className="text-body-small text-muted-foreground mb-1">Active</p>
            <p className="text-heading-2 text-success">
              {subscribers.filter(s => s.isActive).length}
            </p>
          </div>
          <div className="theme-card p-4">
            <p className="text-body-small text-muted-foreground mb-1">Unsubscribed</p>
            <p className="text-heading-2 text-error">
              {subscribers.filter(s => !s.isActive).length}
            </p>
          </div>
        </div>
        <Button
          onClick={fetchSubscribers}
          disabled={loading}
          variant="secondary"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <RefreshIcon />
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="theme-card p-4">
        <div className="flex items-center gap-3">
          <MailIcon />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input flex-1 rounded-xl bg-surface text-foreground shadow-neu-inset border border-border px-4 py-3 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <div className="theme-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading subscribers...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-error mb-4">{error}</p>
            <Button
              onClick={fetchSubscribers}
              variant="secondary"
            >
              Try Again
            </Button>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex p-4 bg-surface rounded-full mb-4">
              <MailIcon />
            </div>
            <p className="text-muted-foreground">
              {searchQuery ? 'No subscribers match your search.' : 'No subscribers yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-caption text-muted-foreground uppercase">
                      Email Address
                    </th>
                    <th className="px-6 py-4 text-left text-caption text-muted-foreground uppercase">
                      Subscribed Date
                    </th>
                    <th className="px-6 py-4 text-left text-caption text-muted-foreground uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <MailIcon />
                          </div>
                          <span className="text-foreground">
                            {subscriber.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(subscriber.subscribedAt)}
                      </td>
                      <td className="px-6 py-4">
                        {subscriber.isActive ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-caption bg-success/10 text-success">
                            ● Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-caption bg-error/10 text-error">
                            ● Unsubscribed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {filteredSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="p-4 hover:bg-surface transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MailIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate">
                        {subscriber.email}
                      </p>
                      <p className="text-body-small text-muted-foreground mt-1">
                        {formatDate(subscriber.subscribedAt)}
                      </p>
                      <div className="mt-2">
                        {subscriber.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-caption bg-success/10 text-success">
                            ● Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-caption bg-error/10 text-error">
                            ● Unsubscribed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Count */}
            <div className="px-6 py-4 bg-surface border-t border-border text-center text-body-small text-muted-foreground">
              Showing {filteredSubscribers.length} of {subscribers.length} subscribers
            </div>
          </>
        )}
      </div>
    </div>
  );
}