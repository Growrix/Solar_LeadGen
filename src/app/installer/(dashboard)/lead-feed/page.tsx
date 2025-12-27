'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import InstallerLeadFeed from '@/components/InstallerLeadFeed';
import type { InstallerProfile as APIInstallerProfile, AssignedLead } from '@/types/installer';
import type { InstallerProfile as ComponentInstallerProfile, Lead } from '@/components/InstallerLeadFeed';

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
    status: isLocked ? 'new' : 'unlocked',
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
      email: isLocked ? '***LOCKED***' : (apiLead.homeowner.email || '***LOCKED***'),
      phone: apiLead.homeowner.phone || '***LOCKED***'
    },
    unlockPrice: apiLead.leadPrice || 0,
    isUnlocked: !isLocked,
    unlockedBy: !isLocked ? [1] : [],
    quotesReceived: apiLead.quotesCount || 0,
    expiresAt: apiLead.expiresAt ? new Date(apiLead.expiresAt) : null,
    priority: 'medium',
    notes: apiLead.assignmentNotes || undefined,
    quoteData: apiLead.quoteData || null,
    bids: (apiLead as any).bids || undefined,
    installerId: (apiLead as any).installerId || null,
    writtenQuotes: (apiLead as any).writtenQuotes || undefined
  };
}

export default function LeadFeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [installer, setInstaller] = useState<ComponentInstallerProfile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAssignedLeads = async () => {
    const leadsRes = await fetch('/api/installer/leads/assigned');
    if (!leadsRes.ok) {
      throw new Error('Failed to fetch assigned leads');
    }
    const leadsData = await leadsRes.json();
    const mappedLeads = (leadsData.leads || []).map(mapAssignedLeadToComponentLead);
    setLeads(mappedLeads);
  };

  // Redirect if not authenticated or not installer
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'INSTALLER') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch installer profile and assigned leads
  useEffect(() => {
    async function fetchData() {
      if (status !== 'authenticated' || session?.user?.role !== 'INSTALLER') {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch installer profile
        const profileRes = await fetch('/api/installer/profile');
        if (!profileRes.ok) {
          throw new Error('Failed to fetch installer profile');
        }
        const profileData = await profileRes.json();
        
        // API returns { user, profile, verification, preferences }
        // Adapt to component format
        setInstaller({
          id: session.user.id as any,
          companyName: profileData.verification?.companyName || profileData.user?.name || 'Unknown',
          email: profileData.user?.email || '',
          phone: profileData.verification?.phone || profileData.user?.phone || '',
          serviceAreas: profileData.verification?.serviceAreas || [],
          isApproved: profileData.verification?.status === 'APPROVED',
          creditBalance: 0, // TODO: Add wallet balance when implemented
          totalUnlocks: 0, // TODO: Calculate from purchased leads
          successRate: 0, // TODO: Calculate from quotes
        });

        await refreshAssignedLeads();

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

      await refreshAssignedLeads();
      return true;
    } catch (error) {
      console.error('Error purchasing lead:', error);
      alert('Failed to purchase lead. Please try again.');
      return false;
    }
  };

  const handleSubmitQuote = async (leadId: string, quoteData: any): Promise<boolean> => {
    try {
      const lead = leads.find(l => String(l.id) === String(leadId));
      const apiEndpoint = lead?.type === 'written' ? '/api/written-quotes' : '/api/quotes';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quoteData,
          leadId,
          installerId: installer?.id,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit quote');
      }

      await refreshAssignedLeads();
      return true;
    } catch (error) {
      console.error('Error submitting quote:', error);
      const message = error instanceof Error ? error.message : 'Failed to submit quote. Please try again.';
      alert(message);
      return false;
    }
  };

  const handleStartChat = (leadId: string): void => {
    console.log('Start chat with lead:', leadId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading available leads...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // No installer profile
  if (!installer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-foreground-muted">No installer profile found.</p>
      </div>
    );
  }

  return (
    <InstallerLeadFeed
      installer={installer}
      leads={leads}
      onUnlockLead={handleUnlockLead}
      onSubmitQuote={handleSubmitQuote}
      onStartChat={handleStartChat}
    />
  );
}