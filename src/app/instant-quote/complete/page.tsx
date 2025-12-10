'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DetailedInformationModal from '@/components/DetailedInformationModal';
import QuoteSuccessModal from '@/components/QuoteSuccessModal';

export default function InstantQuoteCompletePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showDetailedInfoModal, setShowDetailedInfoModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingQuoteData, setPendingQuoteData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for NextAuth session status resolution
    if (status === 'loading') return;

    // Redirect to NextAuth sign-in if not authenticated
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    // Retrieve pending quote data from sessionStorage
    const storedData = sessionStorage.getItem('pendingQuoteData');
    
    if (!storedData) {
      // No pending quote - redirect to homepage
      console.log('[InstantQuoteComplete] No pending quote data found, redirecting to homepage');
      router.push('/');
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      setPendingQuoteData(parsedData);
      
      // Show the detailed information modal
      setShowDetailedInfoModal(true);
      
      console.log('[InstantQuoteComplete] Retrieved pending quote data:', {
        quoteType: parsedData.quoteType,
        hasQuoteData: !!parsedData.quoteData
      });
    } catch (err) {
      console.error('[InstantQuoteComplete] Error parsing quote data:', err);
      router.push('/');
    }
  }, [status, router]);

  const handleDetailedInfoSubmit = async (data: {
    name: string;
    phone: string;
    address: string;
  }) => {
    if (!pendingQuoteData) {
      setError('Quote data not found. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert quoteType format: 'call_visit' -> 'CALL_VISIT', 'written' -> 'WRITTEN_QUOTE'
      const apiQuoteType = pendingQuoteData.quoteType === 'call_visit' 
        ? 'CALL_VISIT' 
        : 'WRITTEN_QUOTE';

      console.log('[InstantQuoteComplete] Submitting lead with details:', {
        quoteType: apiQuoteType,
        name: data.name,
        phone: data.phone,
        address: data.address,
        postcode: pendingQuoteData.quoteData?.postcode
      });

      // Submit lead to API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteType: apiQuoteType,
          propertyPostcode: pendingQuoteData.quoteData?.postcode || pendingQuoteData.quoteData?.propertyPostcode,
          propertyAddress: data.address,
          location: pendingQuoteData.quoteData?.location,
          state: pendingQuoteData.quoteData?.state,
          energyBill: pendingQuoteData.quoteData?.electricityValue || pendingQuoteData.quoteData?.energyBill || 0,
          propertyType: pendingQuoteData.quoteData?.propertyType || 'residential',
          roofType: pendingQuoteData.quoteData?.roofType,
          budgetRange: pendingQuoteData.quoteData?.budgetRange,
          desiredOffset: pendingQuoteData.quoteData?.desiredOffset || 100,
          batteryRequired: pendingQuoteData.quoteData?.batteryRequired || false,
          batteryCapacity: pendingQuoteData.quoteData?.batteryCapacity,
          timeframe: pendingQuoteData.quoteData?.timeframe,
          additionalNotes: pendingQuoteData.quoteData?.additionalNotes,
          billType: pendingQuoteData.quoteData?.billType || 'quarterly',
          quoteData: pendingQuoteData.quoteData
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('[InstantQuoteComplete] Lead submitted successfully:', {
          leadId: responseData.lead?.id
        });

        // Success! Clear sessionStorage
        sessionStorage.removeItem('pendingQuoteData');

        // Close detailed info modal
        setShowDetailedInfoModal(false);

        // Show success modal
        setShowSuccessModal(true);
      } else {
        console.error('[InstantQuoteComplete] Lead submission failed:', responseData);
        
        // Handle specific error cases
        if (response.status === 403 && responseData.requiresVerification) {
          setError('Phone verification required. Please complete verification from your dashboard.');
          // Still clear data and redirect to dashboard after 3 seconds
          sessionStorage.removeItem('pendingQuoteData');
          setTimeout(() => {
            router.push('/homeowner/dashboard');
          }, 3000);
        } else {
          setError(responseData.error || 'Failed to submit quote request. Please try again.');
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      console.error('[InstantQuoteComplete] Error submitting lead:', err);
      setError('An unexpected error occurred. Please try again from your dashboard.');
      setIsSubmitting(false);
      
      // Clear data and redirect after 3 seconds
      sessionStorage.removeItem('pendingQuoteData');
      setTimeout(() => {
        router.push('/homeowner/dashboard');
      }, 3000);
    }
  };

  const handleDashboardClick = () => {
    setShowSuccessModal(false);
    router.push('/homeowner/dashboard');
  };

  const handleModalClose = () => {
    // If user closes modal without submitting, redirect to homepage
    sessionStorage.removeItem('pendingQuoteData');
    router.push('/');
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while retrieving quote data
  if (!pendingQuoteData && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Retrieving your quote...</p>
        </div>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error && !showDetailedInfoModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="theme-card max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-heading-3 text-foreground mb-2">Something Went Wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/homeowner/dashboard')}
            className="theme-button-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Detailed Information Modal */}
      <DetailedInformationModal
        isOpen={showDetailedInfoModal}
        onClose={handleModalClose}
        onSubmit={handleDetailedInfoSubmit}
      />

      {/* Success Modal */}
      <QuoteSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onDashboardClick={handleDashboardClick}
      />

      {/* Background (only visible if both modals are closed) */}
      {!showDetailedInfoModal && !showSuccessModal && (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Processing...</p>
          </div>
        </div>
      )}
    </>
  );
}
