/**
 * Installer Marketplace Page
 * 
 * T060: Display available leads for purchase
 * Features:
 * - Grid of available public leads
 * - Contact masking (hidden until purchase)
 * - Lead price display
 * - Purchase button (requires verification)
 * - Real-time countdown timer
 * - Filter by quote type
 * 
 * 🔴 DEV MODE: Uses STRIPE_BYPASS_MODE for testing without payment
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Card, Icon, Skeleton, Clock, DollarSign, EyeOff, MapPin, ShieldAlert, Zap } from '@/ds';
import { LiveCountdownBar } from '@/components/LiveCountdownBar';

interface Lead {
  id: string;
  quoteType: string;
  status: string;
  visibility: string;
  purchaseStatus: string;
  leadPrice: number | null;
  createdAt: string;
  expiresAt: string | null;
  homeowner: {
    id: string;
    name: string;
    // Contact details masked
  };
  location?: string;
  propertyType?: string;
  roofType?: string;
  estimatedBudget?: number;
}

export default function InstallerMarketplacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Redirect if not authenticated or not installer
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'INSTALLER') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch marketplace leads
  useEffect(() => {
    if (status === 'authenticated') {
      fetchMarketplaceLeads();
    }
  }, [status]);

  async function fetchMarketplaceLeads() {
    try {
      setLoading(true);
      const response = await fetch('/api/leads?marketplace=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace leads');
      }

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle lead purchase
  async function handlePurchase(leadId: string) {
    if (!session?.user?.installerVerified) {
      alert('You must be verified to purchase leads. Please complete installer verification.');
      router.push('/installer/dashboard'); // Redirect to dashboard where verification is shown
      return;
    }

    setPurchasing(leadId);

    try {
      // Step 1: Initiate purchase (bypass mode will skip Stripe)
      const initiateResponse = await fetch(`/api/leads/${leadId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initiate' })
      });

      if (!initiateResponse.ok) {
        const errorData = await initiateResponse.json();
        throw new Error(errorData.error || 'Failed to initiate purchase');
      }

      const initiateData = await initiateResponse.json();

      // In bypass mode, immediately confirm
      if (initiateData.bypassed) {
        console.log('🔧 Bypass mode: Skipping Stripe payment');
        
        // Step 2: Confirm purchase (bypass mode)
        const confirmResponse = await fetch(`/api/leads/${leadId}/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'confirm',
            paymentIntentId: 'bypass_mock' 
          })
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.error || 'Failed to confirm purchase');
        }

        const confirmData = await confirmResponse.json();
        
        alert(`✅ Lead purchased successfully! (Dev mode - no payment required)\n\nYou can now view the full contact details in"Purchased Leads".`);
        
        // Refresh leads list
        fetchMarketplaceLeads();
        
        // Redirect to canonical leads page (Purchased tab)
        router.push('/installer/leads?tab=purchased');
      } else {
        // Production mode: Would show Stripe payment form here
        // TODO: Implement Stripe Elements payment form
        alert('Production mode: Stripe payment form would appear here');
      }

    } catch (err: any) {
      console.error('Purchase error:', err);
      alert(`Purchase failed: ${err.message}`);
    } finally {
      setPurchasing(null);
    }
  }

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    if (filter === 'ALL') return true;
    return lead.quoteType === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="max-w-sm">
              <Skeleton lines={1} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton lines={6} />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-error/10 border border-error rounded-lg p-6">
            <p className="text-error">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-heading-1 text-foreground mb-2">
            Lead Marketplace
          </h1>
          <p className="text-muted">
            Browse and purchase available solar installation leads
          </p>
        </div>

        {/* Verification Warning */}
        {!session?.user?.installerVerified && (
          <div className="mb-6 bg-warning/10 border border-warning rounded-lg p-4">
            <div className="flex items-center">
              <Icon icon={ShieldAlert} size="md" className="text-warning mr-2" aria-hidden />
              <p className="text-warning">
                Verification Required
              </p>
            </div>
            <p className="text-warning text-body-small mt-1">
              You must complete installer verification before purchasing leads.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['ALL', 'CALL_VISIT', 'WRITTEN_QUOTE', 'BIDDING'].map(type => (
            <Button
              key={type}
              onClick={() => setFilter(type)}
              variant={filter === type ? 'primary' : 'secondary'}
              size="sm"
            >
              {type === 'ALL' ? 'All Leads' : type.replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Leads Grid */}
        {filteredLeads.length === 0 ? (
          <div className="bg-surface rounded-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <Icon icon={Zap} size="xl" className="text-muted" aria-hidden />
            </div>
            <p className="text-muted">
              No leads available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map(lead => (
              <div
                key={lead.id}
                className="bg-surface rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow"
              >
                {/* Countdown Timer */}
                {lead.expiresAt && (
                  <div className="mb-4">
                    <LiveCountdownBar
                      expiresAt={lead.expiresAt}
                      leadId={lead.id}
                      leadStatus={lead.status}
                      quoteType={lead.quoteType}
                      position="inline"
                    />
                  </div>
                )}

                {/* Quote Type Badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-caption bg-brand-100 text-brand-800">
                    {lead?.quoteType?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>

                {/* Lead Info */}
                <div className="space-y-3 mb-4">
                  {/* Masked Homeowner Name */}
                  <div className="flex items-center text-body-small">
                    <Icon icon={EyeOff} size="sm" className="text-muted mr-2" aria-hidden />
                    <span className="text-muted">
                      Homeowner: {lead.homeowner.name.split(' ')[0]}*** {/* Mask last name */}
                    </span>
                  </div>

                  {/* Location (if available) */}
                  {lead.location && (
                    <div className="flex items-center text-body-small">
                      <Icon icon={MapPin} size="sm" className="text-muted mr-2" aria-hidden />
                      <span className="text-muted">{lead.location}</span>
                    </div>
                  )}

                  {/* Property Type */}
                  {lead.propertyType && (
                    <div className="text-body-small text-muted">
                      Property: {lead.propertyType}
                    </div>
                  )}

                  {/* Estimated Budget */}
                  {lead.estimatedBudget && (
                    <div className="text-body-small text-muted">
                      Budget: £{lead.estimatedBudget.toLocaleString()}
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center text-body-small">
                    <Icon icon={Clock} size="sm" className="text-muted mr-2" aria-hidden />
                    <span className="text-muted">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Price & Purchase Button */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Icon icon={DollarSign} size="md" className="text-brand-600 mr-1" aria-hidden />
                      <span className="text-heading-2 text-foreground">
                        {lead.leadPrice || 50}
                      </span>
                    </div>
                    <span className="text-caption text-muted">per lead</span>
                  </div>

                  <Button
                    onClick={() => handlePurchase(lead.id)}
                    disabled={!session?.user?.installerVerified || purchasing === lead.id}
                    isLoading={purchasing === lead.id}
                    loadingText="Processing..."
                    className="w-full"
                  >
                    Purchase Lead
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dev Mode Notice */}
        {process.env.NEXT_PUBLIC_STRIPE_BYPASS_MODE === 'true' && (
          <div className="mt-8 bg-primary/10 border border-primary rounded-lg p-4">
            <p className="text-primary text-body-small">
              🔧 <strong>Development Mode:</strong> Purchases are simulated without payment processing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
