'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import InstallerLeadFeed from '@/components/InstallerLeadFeed';
import InstallerMessagingModal from '@/components/InstallerMessagingModal';
import type { AssignedLead } from '@/types/installer';
import type { Lead, InstallerProfile } from '@/components/InstallerLeadFeed';

// Map API AssignedLead to Component Lead format
function mapAssignedLeadToComponentLead(apiLead: AssignedLead): Lead {
  const isLocked = apiLead.homeowner.name === '***LOCKED***';
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
    status: isLocked ? 'new' : 'unlocked', // TODO: map backend LeadStatus to UI statuses
    dateSubmitted: new Date(apiLead.createdAt),
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
      name: apiLead.homeowner.name || '***LOCKED***',
      email: apiLead.homeowner.email || '***LOCKED***',
      phone: apiLead.homeowner.phone || '***LOCKED***'
    },
    unlockPrice: apiLead.leadPrice || 0,
    isUnlocked: !isLocked,
    isPurchasedByAnother: apiLead.isPurchasedByAnother || false,
    unlockedBy: !isLocked ? [1] : [],
    quotesReceived: apiLead.quotesCount || 0,
    expiresAt: apiLead.expiresAt ? new Date(apiLead.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    notes: apiLead.assignmentNotes || undefined,
    // Add all extended fields from API (available after purchase)
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
    purchasedAt: apiLead.purchasedAt || null,
    quoteData: apiLead.quoteData || null,
    // T196: Map bids data for winner/loser detection
    bids: apiLead.bids || undefined,
    installerId: apiLead.installerId || null
  };
}

export default function InstallerLeadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [installer, setInstaller] = useState<InstallerProfile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'INSTALLER') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchData() {
      if (status !== 'authenticated' || session?.user?.role !== 'INSTALLER') {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch assigned leads
        const leadsRes = await fetch('/api/installer/leads/assigned');
        if (!leadsRes.ok) {
          throw new Error('Failed to fetch assigned leads');
        }
        const leadsData = await leadsRes.json();
        
        // Map API leads to component format
        const mappedLeads = (leadsData.leads || []).map(mapAssignedLeadToComponentLead);
        setLeads(mappedLeads);

        // Set installer profile (simplified for component)
        setInstaller({
          id: session.user.id as any, // T196: Use actual user ID for bid matching
          companyName: session.user.name || 'Installer',
          email: session.user.email || '',
          phone: '',
          serviceAreas: [],
          isApproved: true,
          creditBalance: 1000,
          totalUnlocks: mappedLeads.filter((l: Lead) => l.isUnlocked).length,
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

  const handleUnlockLead = async (leadId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/installer/leads/${leadId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Purchase failed:', errorData.error);
        alert(errorData.error || 'Failed to purchase lead');
        return false;
      }

      const data = await response.json();
      console.log('Lead purchased successfully:', data);

      // Refresh leads to show updated contact info
      const leadsRes = await fetch('/api/installer/leads/assigned');
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        const mappedLeads = (leadsData.leads || []).map(mapAssignedLeadToComponentLead);
        setLeads(mappedLeads);
      }

      return true;
    } catch (error) {
      console.error('Error purchasing lead:', error);
      alert('Failed to purchase lead. Please try again.');
      return false;
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading your assigned leads...</p>
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
      <InstallerLeadFeed
        installer={installer}
        leads={leads}
        onUnlockLead={handleUnlockLead}
        onSubmitQuote={handleSubmitQuote}
        onStartChat={handleStartChat}
      />
      <InstallerMessagingModal
        isOpen={showMessagingModal}
        onClose={() => setShowMessagingModal(false)}
      />
    </>
  );
}
