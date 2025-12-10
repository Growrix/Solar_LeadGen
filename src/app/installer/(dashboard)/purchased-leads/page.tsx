/**
 * Purchased Leads Page
 * 
 * Shows leads purchased by the installer using the same Lead Feed component
 * Organized by tabs: Call/Visit, Written Quotes, Bidding
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import InstallerLeadFeed from '@/components/InstallerLeadFeed';
import InstallerMessagingModal from '@/components/InstallerMessagingModal';
import type { AssignedLead } from '@/types/installer';
import type { Lead, InstallerProfile } from '@/components/InstallerLeadFeed';

// Map API PurchasedLead to Component Lead format
function mapPurchasedLeadToComponentLead(apiLead: any): Lead {
  // API now returns lowercase: 'call_visit', 'written', 'bidding'
  const quoteTypeMap: Record<string, Lead['type']> = {
    'call_visit': 'call_visit',
    'written': 'written',
    'bidding': 'bidding',
    // Legacy uppercase support (in case old data exists)
    'CALL_VISIT': 'call_visit',
    'WRITTEN_QUOTE': 'written',
    'BIDDING': 'bidding'
  };

  return {
    id: apiLead.id,
    homeownerId: apiLead.homeownerId,
    type: quoteTypeMap[apiLead.quoteType] || 'call_visit',
    status: 'PURCHASED', // Critical: Must be PURCHASED for contact display logic
    dateSubmitted: new Date(apiLead.createdAt || apiLead.purchasedAt),
    location: {
      suburb: apiLead.location || 'Unknown',
      postcode: apiLead.postcode || '',
      state: apiLead.state || ''
    },
    systemDetails: {
      estimatedSize: apiLead.projectType || 'N/A',
      roofType: apiLead.roofType || 'N/A',
      propertyType: apiLead.propertyType || 'Residential',
      budget: apiLead.budgetRange || 'N/A'
    },
    contact: {
      name: apiLead.homeowner?.name || 'Unknown',
      email: apiLead.homeowner?.email || 'N/A',
      phone: apiLead.homeowner?.phone || 'N/A'
    },
    unlockPrice: apiLead.leadPrice || 0,
    isUnlocked: true, // Always true for purchased leads
    isPurchasedByAnother: false,
    unlockedBy: [1],
    quotesReceived: apiLead.quotesCount || 0,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    priority: 'medium',
    notes: apiLead.assignmentNotes || undefined,
    // Extended fields
    address: apiLead.address || null,
    energyBill: apiLead.energyBill || null,
    billType: apiLead.billType || null,
    desiredOffset: apiLead.desiredOffset || null,
    batteryRequired: apiLead.batteryRequired || null,
    batteryCapacity: apiLead.batteryCapacity || null,
    timeframe: apiLead.timeframe || null,
    additionalNotes: apiLead.additionalNotes || null,
    phoneNumber: apiLead.phoneNumber || null,
    phoneVerified: apiLead.phoneVerified || null,
    createdAt: apiLead.createdAt,
    approvedAt: apiLead.approvedAt || null,
    purchasedAt: apiLead.purchasedAt, // Critical: Must be set for isPaid logic (checked by component)
    quoteData: apiLead.quoteData || null
  };
}

export default function PurchasedLeadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [installer, setInstaller] = useState<InstallerProfile | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'call_visit' | 'written' | 'bidding'>('call_visit');

  // Redirect if not authenticated or not installer
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'INSTALLER') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch purchased leads
  useEffect(() => {
    async function fetchData() {
      if (status !== 'authenticated' || session?.user?.role !== 'INSTALLER') {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch purchased leads
        const leadsRes = await fetch('/api/installer/leads/purchased');
        if (!leadsRes.ok) {
          throw new Error('Failed to fetch purchased leads');
        }
        const leadsData = await leadsRes.json();

        // Map API leads to component format
        const mappedLeads = (leadsData.leads || []).map(mapPurchasedLeadToComponentLead);
        setAllLeads(mappedLeads);

        // Set installer profile (simplified for component)
        setInstaller({
          id: 1,
          companyName: session.user.name || 'Installer',
          email: session.user.email || '',
          phone: '',
          serviceAreas: [],
          isApproved: true,
          creditBalance: 1000,
          totalUnlocks: mappedLeads.length,
          successRate: 85,
        });

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [status, session]);

  // Handler stubs for purchased leads (no unlock action needed)
  const handleUnlockLead = async (leadId: string): Promise<boolean> => {
    // No unlock needed for purchased leads
    return false;
  };

  const handleSubmitQuote = async (leadId: string, quoteData: any): Promise<boolean> => {
    console.log('Submit quote for lead:', leadId, quoteData);
    // TODO: Implement actual quote submission logic
    return true;
  };

  const handleStartChat = (leadId: string): void => {
    console.log('Start chat with lead:', leadId);
    setShowMessagingModal(true);
  };

  // Filter leads by active tab
  const filteredLeads = allLeads.filter(lead => lead.type === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading your purchased leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-error mb-4">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!installer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-foreground-muted">No installer profile found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-heading-1 text-foreground mb-2">
            Purchased Leads
          </h1>
          <p className="text-body text-muted">
            View and manage leads you&apos;ve purchased
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-2 p-1 bg-surface rounded-lg border border-border shadow-neu-inset">
            {/* Call/Visit Tab */}
            <button
              onClick={() => setActiveTab('call_visit')}
              className={`flex-1 px-4 py-3 rounded-lg text-body transition-all ${
                activeTab === 'call_visit'
                  ? 'bg-accent text-background shadow-neu-outset'
                  : 'bg-transparent text-muted hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Call/Visit</span>
                {allLeads.filter(l => l.type === 'call_visit').length > 0 && (
                  <span className="text-caption bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                    {allLeads.filter(l => l.type === 'call_visit').length}
                  </span>
                )}
              </div>
            </button>

            {/* Written Quotes Tab */}
            <button
              onClick={() => setActiveTab('written')}
              className={`flex-1 px-4 py-3 rounded-lg text-body transition-all ${
                activeTab === 'written'
                  ? 'bg-accent text-background shadow-neu-outset'
                  : 'bg-transparent text-muted hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Written Quotes</span>
                {allLeads.filter(l => l.type === 'written').length > 0 && (
                  <span className="text-caption bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                    {allLeads.filter(l => l.type === 'written').length}
                  </span>
                )}
              </div>
            </button>

            {/* Bidding Tab */}
            <button
              onClick={() => setActiveTab('bidding')}
              className={`flex-1 px-4 py-3 rounded-lg text-body transition-all ${
                activeTab === 'bidding'
                  ? 'bg-accent text-background shadow-neu-outset'
                  : 'bg-transparent text-muted hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Bidding</span>
                {allLeads.filter(l => l.type === 'bidding').length > 0 && (
                  <span className="text-caption bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                    {allLeads.filter(l => l.type === 'bidding').length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Lead Feed Component (same as leads page) */}
        <InstallerLeadFeed
          installer={installer}
          leads={filteredLeads}
          onUnlockLead={handleUnlockLead}
          onSubmitQuote={handleSubmitQuote}
          onStartChat={handleStartChat}
        />
      </div>

      <InstallerMessagingModal
        isOpen={showMessagingModal}
        onClose={() => setShowMessagingModal(false)}
      />
    </>
  );
}