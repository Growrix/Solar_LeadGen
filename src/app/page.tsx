"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Hero from '../components/Hero';
import InstantQuoteForm from '../components/InstantQuoteForm';
import RebateCalculatorForm from '../components/RebateCalculatorForm';
import QuoteOptionsModal from '../components/QuoteOptionsModal';
import QuoteSuccessModal from '../components/QuoteSuccessModal';
import HomeownerSignupModal from '../components/HomeownerSignupModal';
import HomeownersInfoForm from '../components/HomeownersInfoForm';
import ContactVerificationModal from '../components/homeowner/ContactVerificationModal';
import QuoteTypeDistributionModal from '../components/homeowner/QuoteTypeDistributionModal';
import LeadLimitReachedModal from '../components/homeowner/LeadLimitReachedModal';
import FirstQuoteSuccessModal from '../components/homeowner/FirstQuoteSuccessModal';
import OTPVerificationModal from '../components/OTPVerificationModal';
import Footer from '../components/Footer';
import BlogSection from '../components/BlogSection';
import NewsletterSignup from '../components/NewsletterSignup';
import type { Post } from '../types/blog';

// Icon components
const CalculatorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2"/>
    <line x1="8" x2="16" y1="6" y2="6"/>
    <line x1="16" x2="16" y1="14" y2="18"/>
    <path d="M16 10h.01"/>
    <path d="M12 10h.01"/>
    <path d="M8 10h.01"/>
    <path d="M12 14h.01"/>
    <path d="M8 14h.01"/>
    <path d="M12 18h.01"/>
    <path d="M8 18h.01"/>
  </svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
    <path d="M7 7h.01"/>
  </svg>
);

// ✅ Phase 23: Lead submission limits (matches backend MAX_LEAD_SUBMISSIONS_TOTAL setting)
const MAX_LEADS = 5; // Users can submit up to 5 leads total

export default function Home() {
  const router = useRouter();
  // ✅ Phase 23 Fix 1: Import update function for session management
  const { data: session, status, update: updateSession } = useSession();
  const [activeCalculator, setActiveCalculator] = useState<'quote' | 'rebate'>('quote');
  const [isQuoteOptionsModalOpen, setIsQuoteOptionsModalOpen] = useState(false);
  const [isHomeownersInfoFormOpen, setIsHomeownersInfoFormOpen] = useState(false);
  const [isHomeownerSignupModalOpen, setIsHomeownerSignupModalOpen] = useState(false);
  const [isQuoteSuccessModalOpen, setIsQuoteSuccessModalOpen] = useState(false);
  const [isFirstQuoteSuccessModalOpen, setIsFirstQuoteSuccessModalOpen] = useState(false);
  const [isContactVerificationModalOpen, setIsContactVerificationModalOpen] = useState(false);
  const [isQuoteTypeDistributionModalOpen, setIsQuoteTypeDistributionModalOpen] = useState(false);
  const [isLeadLimitReachedModalOpen, setIsLeadLimitReachedModalOpen] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingOTP, setPendingOTP] = useState<{ phoneNumber: string; verificationId: string; expiresAt: Date; remainingAttempts: number } | null>(null);
  const [selectedQuoteType, setSelectedQuoteType] = useState<'call_visit' | 'written' | null>(null);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [pendingQuoteData, setPendingQuoteData] = useState<any>(null);
  const [homeownerInfo, setHomeownerInfo] = useState<{ name: string; phone: string; address: string } | null>(null);
  const [userLeadCount, setUserLeadCount] = useState<number>(0);
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);
  const [remainingLeadQuota, setRemainingLeadQuota] = useState<number>(0);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string>('');
  const [hasBiddingLead, setHasBiddingLead] = useState<boolean>(false);

  // Ensure page starts at top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch user lead count and verification status for authenticated users
  useEffect(() => {
    const fetchUserLeadData = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          console.log('[Homepage useEffect] User session:', {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
          });

          // Fetch user's leads (session-based, no userId param needed)
          const response = await fetch('/api/leads');
          if (response.ok) {
            const data = await response.json();
            const leadCount = data.leads?.length || 0;
            console.log('[Homepage useEffect] Fetched lead data:', { 
              leadCount, 
              totalLeads: data.leads?.length,
              userRole: session.user.role,
              leadsPreview: data.leads?.slice(0, 3).map((l: any) => ({ 
                id: l.id, 
                homeownerId: l.homeownerId, 
                status: l.status 
              }))
            });
            setUserLeadCount(leadCount);
            // Detect if user already has a BIDDING lead (quota is max 1)
            const alreadyHasBidding = (data.leads || []).some((l: any) => l.quoteType === 'BIDDING');
            setHasBiddingLead(alreadyHasBidding);
            
            // Extract phone number from first lead as additional fallback
            const firstLeadPhone = data.leads?.[0]?.phoneNumber || '';
            
            // Fetch user verification status
            const userResponse = await fetch('/api/user/me');
            if (userResponse.ok) {
              const userData = await userResponse.json();
              console.log('[Homepage useEffect] User data from /api/user/me:', { 
                phoneVerified: userData.phoneVerified,
                phoneNumber: userData.phoneNumber 
              });
              setIsPhoneVerified(userData.phoneVerified || false);
              setUserPhoneNumber(userData.phoneNumber || session?.user?.phone || firstLeadPhone || '');
              // ✅ Phase 23 Fix 2: Calculate remaining quota (5 max leads)
              const remaining = Math.max(0, MAX_LEADS - leadCount);
              console.log('[Homepage useEffect] Quota calculated:', { leadCount, maxLeads: MAX_LEADS, remaining });
              setRemainingLeadQuota(remaining);
            } else {
              // Fallback when /api/user/me doesn't exist
              console.log('[Homepage useEffect] /api/user/me not available, using session data');
              console.log('[Homepage useEffect] Session phoneVerified:', session?.user?.phoneVerified);
              setUserPhoneNumber(session?.user?.phone || firstLeadPhone || '');
              setIsPhoneVerified(session?.user?.phoneVerified || false);
              // ✅ Phase 23 Fix 2: Use MAX_LEADS constant instead of hardcoded 3
              const remaining = Math.max(0, MAX_LEADS - leadCount);
              console.log('[Homepage useEffect] Fallback quota calculated:', { leadCount, maxLeads: MAX_LEADS, remaining });
              setRemainingLeadQuota(remaining);
            }
          }
        } catch (error) {
          console.error('Error fetching user lead data:', error);
        }
      }
    };

    fetchUserLeadData();
  }, [status, session?.user?.id]); // ✅ Phase 23 Fix 3: Optimize dependency (only user ID, not entire session)

  // Captures quote data from the form and stores it pending authentication
  const handleQuoteCalculated = useCallback((data: any) => {
    setPendingQuoteData(data);
    setQuoteData(data);
  }, []);

  // Handler for "Get Your Quotes" button - routes based on user state
  const handleProceedToDetailedQuote = () => {
    // ✅ Phase 23 Fix 4: Enhanced logging for debugging session vs local state
    console.log('[handleProceedToDetailedQuote] Flow routing decision:', {
      status,
      userLeadCount,
      isPhoneVerified, // Local state from /api/user/me or session
      sessionPhoneVerified: session?.user?.phoneVerified, // Direct from session
      remainingLeadQuota,
      maxLeads: MAX_LEADS,
      sessionUser: session?.user?.email,
    });

    // Guest users (not authenticated) - show QuoteOptionsModal
    if (status !== 'authenticated' || !session?.user) {
      console.log('[Flow 1] Guest user → QuoteOptionsModal');
      setIsQuoteOptionsModalOpen(true);
      return;
    }

    // Authenticated users - route based on lead count
    // Flow 2: First lead (0 leads) - show QuoteOptionsModal to select quote type
    if (userLeadCount === 0) {
      console.log('[Flow 2] First lead (0 leads) → QuoteOptionsModal');
      setIsQuoteOptionsModalOpen(true);
      return;
    }

    // ✅ Phase 23 Fix 2: Lead limit reached (5 leads) - block further requests
    if (userLeadCount >= MAX_LEADS) {
      console.log('[Flow 5] Lead limit reached (' + userLeadCount + '/' + MAX_LEADS + ' leads used) → LeadLimitReachedModal');
      setIsLeadLimitReachedModalOpen(true);
      return;
    }

    // Flow 3: Exactly second lead and not verified → suggest verification, but allow skip
    if (userLeadCount === 1 && !isPhoneVerified) {
      console.log('[Flow 3] Second lead, unverified phone (' + remainingLeadQuota + ' remaining) → ContactVerificationModal (optional)');
      setIsContactVerificationModalOpen(true);
      return;
    }

    // Flow 4: Second+ lead (all users) → distribution modal
    if (userLeadCount >= 1) {
      console.log('[Flow 4] Second+ lead → QuoteTypeDistributionModal');
      setIsQuoteTypeDistributionModalOpen(true);
      return;
    }

    // Fallback (should never reach here)
    console.warn('[Flow Error] No matching flow condition. State:', { userLeadCount, isPhoneVerified });
  };

  const handleQuoteOptionSelected = async (type: 'call_visit' | 'written') => {
    setSelectedQuoteType(type);
    setIsQuoteOptionsModalOpen(false);
    
    // Convert to API format: 'call_visit' -> 'CALL_VISIT', 'written' -> 'WRITTEN_QUOTE'
    const apiQuoteType = type === 'call_visit' ? 'CALL_VISIT' : 'WRITTEN_QUOTE';
    
    // Check if user is already logged in
    if (status === 'authenticated' && session?.user) {
      // ===== AUTHENTICATED USER CONDITIONAL FLOWS =====
      
      // Flow 2: First lead (0 leads) - Collect user data via HomeownersInfoForm
      if (userLeadCount === 0) {
        console.log('First lead flow - showing HomeownersInfoForm for data collection');
        setIsHomeownersInfoFormOpen(true);
        return;
      }
      
      // ✅ Lead limit reached first
      if (userLeadCount >= MAX_LEADS) {
        console.log('[Flow 5] Lead limit reached (' + userLeadCount + '/' + MAX_LEADS + ' leads) → LeadLimitReachedModal');
        setIsLeadLimitReachedModalOpen(true);
        return;
      }

      // Flow 3: Exactly second lead and not verified → verification
      if (userLeadCount === 1 && !isPhoneVerified) {
        console.log('Second lead flow (unverified) - showing ContactVerificationModal');
        setIsContactVerificationModalOpen(true);
        return;
      }
      
      // Flow 4: Verified on 2nd+ OR 3rd+ regardless → distribution
      if ((userLeadCount >= 1 && isPhoneVerified) || userLeadCount >= 2) {
        console.log('Second+ lead flow - showing QuoteTypeDistributionModal');
        setIsQuoteTypeDistributionModalOpen(true);
        return;
      }
    } else {
      // ===== GUEST USER FLOW (Flow 1) - No changes needed =====
      // User is not logged in - show HomeownersInfoForm first
      setIsHomeownersInfoFormOpen(true);
    }
  };

  const handleHomeownerInfoContinue = (info: { name: string; phone: string; address: string }) => {
    // Store homeowner info
    setHomeownerInfo(info);
    setIsHomeownersInfoFormOpen(false);
    
    // Check if user is authenticated (Flow 2) or guest (Flow 1)
    if (status === 'authenticated' && session?.user) {
      // Flow 2: Authenticated first lead - create lead directly
      handleAuthenticatedFirstLead(info);
    } else {
      // Flow 1: Guest - proceed to signup
      setIsHomeownerSignupModalOpen(true);
    }
  };

  const handleHomeownerSignupSuccess = async () => {
    // Phase 4.10: Lead creation with proper session polling
    // Ensures NextAuth session is fully established before creating lead
    setIsHomeownerSignupModalOpen(false);
    
    console.log('[Guest Flow] Signup successful, waiting for session...', { 
      quoteType: selectedQuoteType, 
      quoteData: pendingQuoteData 
    });
    
    // Session polling: Wait for NextAuth session to be ready
    let sessionReady = false;
    let attempts = 0;
    const maxAttempts = 25; // 5 seconds max (25 * 200ms)
    
    while (!sessionReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        const response = await fetch('/api/auth/session');
        const sessionData = await response.json();
        
        if (sessionData?.user?.role === 'HOMEOWNER' && sessionData?.user?.id) {
          console.log('[Guest Flow] Session ready!', { 
            userId: sessionData.user.id, 
            email: sessionData.user.email 
          });
          sessionReady = true;
          break;
        }
      } catch (error) {
        console.error('[Guest Flow] Session check error:', error);
      }
      
      attempts++;
    }
    
    if (!sessionReady) {
      console.error('[Guest Flow] Session not ready after 5 seconds');
      alert('Login successful but session not ready. Please create your quote from the dashboard.');
      router.push('/homeowner/dashboard');
      return;
    }
    
    // NOW session is ready - create lead via API
    try {
      // Convert quoteType format: 'call_visit' -> 'CALL_VISIT', 'written' -> 'WRITTEN_QUOTE'
      const apiQuoteType = selectedQuoteType === 'call_visit' ? 'CALL_VISIT' : 'WRITTEN_QUOTE';
      
      console.log('[Guest Flow] Creating lead...', {
        selectedQuoteType,
        apiQuoteType,
        postcode: pendingQuoteData?.postcode || pendingQuoteData?.propertyPostcode
      });
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteType: apiQuoteType,
          propertyPostcode: pendingQuoteData?.postcode || pendingQuoteData?.propertyPostcode,
          location: pendingQuoteData?.location,
          state: pendingQuoteData?.state,
          energyBill: pendingQuoteData?.electricityValue || pendingQuoteData?.energyBill || 0,
          name: homeownerInfo?.name, // ✅ Phase 12: Include name from HomeownersInfoForm
          phoneNumber: homeownerInfo?.phone, // ✅ Phase 12: Include phone from HomeownersInfoForm
          address: homeownerInfo?.address || pendingQuoteData?.address, // ✅ Phase 12: Include address from HomeownersInfoForm
          propertyAddress: homeownerInfo?.address || pendingQuoteData?.address, // 🆕 Use address from HomeownersInfoForm
          propertyType: pendingQuoteData?.propertyType || 'residential',
          roofType: pendingQuoteData?.roofType,
          budgetRange: pendingQuoteData?.budgetRange,
          desiredOffset: pendingQuoteData?.desiredOffset || 100,
          batteryRequired: pendingQuoteData?.batteryRequired || false,
          batteryCapacity: pendingQuoteData?.batteryCapacity,
          timeframe: pendingQuoteData?.timeframe,
          additionalNotes: pendingQuoteData?.additionalNotes,
          billType: pendingQuoteData?.billType || 'quarterly',
          quoteData: pendingQuoteData
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('[Guest Flow] Lead created successfully!', { leadId: data.lead?.id });
        setIsQuoteSuccessModalOpen(true); // Guest flow uses QuoteSuccessModal (audit: Flow 1 working, no changes needed)
        setPendingQuoteData(null);
      } else {
        console.error('[Guest Flow] Lead creation failed:', data);
        
        // Show user-friendly error message
        if (response.status === 403 && data.requiresVerification) {
          alert('Account created successfully! However, phone verification is required. Please complete verification from your dashboard.');
        } else {
          alert(data.error || 'Failed to create lead. Please try again from your dashboard.');
        }
        
        router.push('/homeowner/dashboard');
      }
    } catch (err) {
      console.error('[Guest Flow] Lead creation error:', err);
      alert('Failed to create lead. Please try again from your dashboard.');
      router.push('/homeowner/dashboard');
    }
  };

  const handleDashboardClick = () => {
    setIsQuoteSuccessModalOpen(false);
    // Navigate to homeowner dashboard
    router.push('/homeowner/dashboard');
  };

  // Handler for "Verify Contact" button in FirstQuoteSuccessModal
  const handleVerifyContactFromFirstQuote = () => {
    setIsFirstQuoteSuccessModalOpen(false);
    // Open verification modal to prepare for future leads
    setIsContactVerificationModalOpen(true);
  };

  // Handler for ContactVerificationModal OTP requested (Flow 3)
  const handleOTPRequested = (payload: { phoneNumber: string; verificationId: string; expiresAt: Date; remainingAttempts: number }) => {
    setPendingOTP(payload);
    setIsContactVerificationModalOpen(false);
    setShowOTPModal(true);
  };

  const handleOTPVerificationSuccess = async () => {
    setShowOTPModal(false);
    setPendingOTP(null);
    setIsPhoneVerified(true);
    
    // ✅ Phase 23 Fix 1: CRITICAL - Update NextAuth session with verified status
    try {
      await updateSession({
        user: {
          ...session?.user,
          phoneVerified: true,
        },
      });
      console.log('[OTP Success] ✅ Session updated with phoneVerified: true');
    } catch (error) {
      console.error('[OTP Success] ❌ Failed to update session:', error);
    }
    
    // Refresh user lead data after verification
    if (status === 'authenticated' && session?.user?.id) {
      try {
        const response = await fetch('/api/leads');
        if (response.ok) {
          const data = await response.json();
          const leadCount = data.leads?.length || 0;
          console.log('[Homepage] Refreshed lead data after verification:', { leadCount });
          setUserLeadCount(leadCount);
          // ✅ Phase 23 Fix 2: Use MAX_LEADS instead of hardcoded 3
          setRemainingLeadQuota(Math.max(0, MAX_LEADS - leadCount));
        }
      } catch (error) {
        console.error('[Homepage] Error refreshing lead data after verification:', error);
      }
    }
    
    // Show quote distribution modal after successful verification
    setIsQuoteTypeDistributionModalOpen(true);
  };

  const handleResendOTP = async (): Promise<{
    success: boolean;
    verificationId?: string;
    expiresAt?: Date;
    error?: string;
    retryAfter?: number;
  }> => {
    if (!pendingOTP?.phoneNumber) {
      return {
        success: false,
        error: 'No pending verification',
      };
    }
    
    try {
      const response = await fetch('/api/verification/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: pendingOTP.phoneNumber }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          return {
            success: false,
            error: data.error,
            retryAfter: data.retryAfter,
          };
        }
        return {
          success: false,
          error: data.error || 'Failed to resend code',
        };
      }
      
      return {
        success: true,
        verificationId: data.verificationId,
        expiresAt: new Date(data.expiresAt),
      };
    } catch (error) {
      console.error('[Homepage] Error resending OTP:', error);
      return {
        success: false,
        error: 'Failed to resend code. Please try again.',
      };
    }
  };

  // Handler called when ContactVerificationModal closes
  const handleVerificationModalClose = () => {
    setIsContactVerificationModalOpen(false);
  };

  // Handler for QuoteTypeDistributionModal submission (Flows 3 & 4)
  const handleQuoteDistributionSubmit = async (distributions: Array<{ type: 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING'; count: number }>) => {
    try {
      // Create leads based on distribution selections
      for (const dist of distributions) {
        for (let i = 0; i < dist.count; i++) {
          const apiQuoteType = dist.type; // Already in correct format: CALL_VISIT, WRITTEN_QUOTE, or BIDDING
          
          const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quoteType: apiQuoteType,
              propertyPostcode: pendingQuoteData?.postcode || pendingQuoteData?.propertyPostcode,
              location: pendingQuoteData?.location,
              state: pendingQuoteData?.state,
              energyBill: pendingQuoteData?.electricityValue || pendingQuoteData?.energyBill || 0,
              // Include propertyAddress when available for better prefill
              propertyAddress: pendingQuoteData?.address || pendingQuoteData?.propertyAddress,
              propertyType: pendingQuoteData?.propertyType || 'residential',
              roofType: pendingQuoteData?.roofType,
              budgetRange: pendingQuoteData?.budgetRange,
              desiredOffset: pendingQuoteData?.desiredOffset || 100,
              batteryRequired: pendingQuoteData?.batteryRequired || false,
              batteryCapacity: pendingQuoteData?.batteryCapacity,
              timeframe: pendingQuoteData?.timeframe,
              additionalNotes: pendingQuoteData?.additionalNotes,
              billType: pendingQuoteData?.billType || pendingQuoteData?.electricityUsageType || 'quarterly',
              quoteData: pendingQuoteData
            })
          });

          if (!response.ok) {
            const data = await response.json();
            console.error('Lead creation failed:', data);
            // Mirror dashboard-friendly error handling
            if (response.status === 403 && data.requiresVerification) {
              alert('Phone verification required. Please verify your phone number to submit more quotes.');
              setIsContactVerificationModalOpen(true);
              throw new Error('Verification required');
            }
            if (response.status === 403 && data.limitReached) {
              alert(`You have reached your quote limit (${data.quoteLimit} total).`);
              throw new Error('Limit reached');
            }
            // Current API returns 500 with details when bidding quota exceeded
            if ((data.details || data.error || '').toString().includes('BIDDING quota exceeded')) {
              alert('You have already submitted a BIDDING lead. Only 1 bidding lead is allowed per homeowner.');
              throw new Error('Bidding quota exhausted');
            }
            throw new Error(data.error || 'Failed to create lead');
          }
        }
      }

      // Success! Close distribution modal and show success
      setIsQuoteTypeDistributionModalOpen(false);
      setIsQuoteSuccessModalOpen(true);
      setPendingQuoteData(null);
      
      // Refresh user lead count
      const leadCountResponse = await fetch('/api/leads');
      if (leadCountResponse.ok) {
        const leadData = await leadCountResponse.json();
        setUserLeadCount(leadData.leads?.length || 0);
        // ✅ Phase 23 Fix 2: Use MAX_LEADS constant
        setRemainingLeadQuota(Math.max(0, MAX_LEADS - (leadData.leads?.length || 0)));
        const alreadyHasBidding = (leadData.leads || []).some((l: any) => l.quoteType === 'BIDDING');
        setHasBiddingLead(alreadyHasBidding);
      }
    } catch (error) {
      console.error('Error creating leads:', error);
      alert('Failed to create lead requests. Please try again.');
    }
  };

  // Handler for authenticated first lead (Flow 2)
  const handleAuthenticatedFirstLead = async (info: { name: string; phone: string; address: string }) => {
    setHomeownerInfo(info);
    setIsHomeownersInfoFormOpen(false);
    
    // Convert selectedQuoteType to API format
    const apiQuoteType = selectedQuoteType === 'call_visit' ? 'CALL_VISIT' : 'WRITTEN_QUOTE';
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteType: apiQuoteType,
          propertyPostcode: pendingQuoteData?.postcode || pendingQuoteData?.propertyPostcode,
          location: pendingQuoteData?.location,
          state: pendingQuoteData?.state,
          energyBill: pendingQuoteData?.electricityValue || pendingQuoteData?.energyBill || 0,
          name: info.name,
          phoneNumber: info.phone,
          address: info.address,
          propertyAddress: info.address,
          propertyType: pendingQuoteData?.propertyType || 'residential',
          roofType: pendingQuoteData?.roofType,
          budgetRange: pendingQuoteData?.budgetRange,
          desiredOffset: pendingQuoteData?.desiredOffset || 100,
          batteryRequired: pendingQuoteData?.batteryRequired || false,
          batteryCapacity: pendingQuoteData?.batteryCapacity,
          timeframe: pendingQuoteData?.timeframe,
          additionalNotes: pendingQuoteData?.additionalNotes,
          billType: pendingQuoteData?.billType || 'quarterly',
          quoteData: pendingQuoteData
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('First lead created successfully for authenticated user!');
        setIsFirstQuoteSuccessModalOpen(true); // ✅ Use FirstQuoteSuccessModal for first lead
        setPendingQuoteData(null);
        
        // Update user lead count
        setUserLeadCount(1);
        // ✅ Phase 23 Fix 2: 5 max - 1 used = 4 remaining
        setRemainingLeadQuota(MAX_LEADS - 1);
      } else {
        console.error('Lead submission error:', data.error);
        alert(data.error || 'Failed to submit lead request. Please try again.');
      }
    } catch (err) {
      console.error('Lead submission error:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleScrollToQuote = () => {
    setActiveCalculator('quote');
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToRebate = () => {
    setActiveCalculator('rebate');
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Footer handlers
  const handleBecomePartner = () => {
    router.push('/installer');
  };

  const handlePartnerSignIn = () => {
    router.push('/installer');
  };

  const handleBlogClick = () => {
    // Navigate to blog page when implemented
    console.log('Blog clicked');
  };

  const handleGovernmentNewsClick = () => {
    // Navigate to government news page when implemented
    console.log('Government news clicked');
  };

  const handleSeeAllBlogPosts = () => {
    router.push('/blog');
  };

  const handleNavigateToPost = (post: Post) => {
    // Store post in sessionStorage and navigate
    sessionStorage.setItem('currentBlogPost', JSON.stringify(post));
    router.push('/blog/post');
  };

  return (
  <main className="bg-background">
      <Hero 
        onInstantQuoteClick={handleScrollToQuote}
        onRebateCalculatorClick={handleScrollToRebate}
      />
      
      {/* Calculator Section */}
  <section id="calculator-section" className="py-16 lg:py-24 bg-background">
        {/* Removed all gradient overlays for a flat cream look in light mode */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-heading-2 lg:text-heading-1 text-foreground mb-4">
              How Much Could You Save?
            </h2>
            <p className="text-body-large text-muted-foreground max-w-3xl mx-auto">
              Find out now. Our calculators provide a transparent, no-jargon estimate of your solar savings and government incentives.
            </p>
          </div>
          
          {/* Calculator Switcher */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md bg-background shadow-neu-inset p-2 rounded-full flex border border-border">
              <div className={`absolute top-2 bottom-2 left-2 w-[calc(50%-0.25rem)] rounded-full bg-background shadow-neu-outset transition-transform duration-300 ease-in-out transform ${
                activeCalculator === 'quote' ? 'translate-x-0' : 'translate-x-full'
              }`}></div>

              <button
                onClick={() => setActiveCalculator('quote')}
                className={`relative z-10 w-1/2 py-3 text-label flex items-center justify-center gap-2 transition-colors duration-300 rounded-full ${
                  activeCalculator === 'quote' ? 'text-primary' : 'text-muted-foreground'
                }`}
                aria-pressed={activeCalculator === 'quote'}
              >
                <CalculatorIcon />
                Instant Quote
              </button>
              <button
                onClick={() => setActiveCalculator('rebate')}
                className={`relative z-10 w-1/2 py-3 text-label flex items-center justify-center gap-2 transition-colors duration-300 rounded-full ${
                  activeCalculator === 'rebate' ? 'text-primary' : 'text-muted-foreground'
                }`}
                aria-pressed={activeCalculator === 'rebate'}
              >
                <TagIcon />
                Rebate Calculator
              </button>
            </div>
          </div>
          
          {/* Calculator Forms */}
          {activeCalculator === 'quote' ? (
            <InstantQuoteForm 
              onProceedToDetailedQuote={handleProceedToDetailedQuote}
              onQuoteCalculated={handleQuoteCalculated}
              hideSubmitButton={false}
            />
          ) : (
            <RebateCalculatorForm onGetQuotesClick={() => setIsQuoteOptionsModalOpen(true)} />
          )}
        </div>
      </section>

      {/* Modals */}
      {isQuoteOptionsModalOpen && (
        <QuoteOptionsModal
          isOpen={isQuoteOptionsModalOpen}
          onClose={() => setIsQuoteOptionsModalOpen(false)}
          onSelectOption={handleQuoteOptionSelected}
          quoteData={pendingQuoteData}
        />
      )}

      {isHomeownersInfoFormOpen && (
        <HomeownersInfoForm
          isOpen={isHomeownersInfoFormOpen}
          onClose={() => setIsHomeownersInfoFormOpen(false)}
          onContinue={handleHomeownerInfoContinue}
        />
      )}

      {isHomeownerSignupModalOpen && (
        <HomeownerSignupModal
          isOpen={isHomeownerSignupModalOpen}
          onClose={() => setIsHomeownerSignupModalOpen(false)}
          onSuccess={handleHomeownerSignupSuccess}
          onSwitchToSignIn={() => setIsHomeownerSignupModalOpen(false)}
        />
      )}

      {isQuoteSuccessModalOpen && (
        <QuoteSuccessModal
          isOpen={isQuoteSuccessModalOpen}
          onClose={() => setIsQuoteSuccessModalOpen(false)}
          onDashboardClick={handleDashboardClick}
        />
      )}

      {/* FirstQuoteSuccessModal for authenticated first lead (Flow 2) */}
      {isFirstQuoteSuccessModalOpen && (
        <FirstQuoteSuccessModal
          isOpen={isFirstQuoteSuccessModalOpen}
          onClose={() => setIsFirstQuoteSuccessModalOpen(false)}
          onVerifyContact={handleVerifyContactFromFirstQuote}
          quoteType={selectedQuoteType === 'call_visit' ? 'CALL_VISIT' : 'WRITTEN_QUOTE'}
          remainingQuotes={remainingLeadQuota}
          totalQuoteLimit={MAX_LEADS}
        />
      )}

      {/* New Modals for Phase 22 */}
      {isContactVerificationModalOpen && (
        <ContactVerificationModal
          isOpen={isContactVerificationModalOpen}
          onClose={handleVerificationModalClose}
          onOTPRequested={handleOTPRequested}
          defaultPhone={userPhoneNumber || session?.user?.phone || ''}
        />
      )}

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phoneNumber={pendingOTP?.phoneNumber || session?.user?.phone || ''}
        verificationId={pendingOTP?.verificationId || ''}
        expiresAt={pendingOTP?.expiresAt || new Date()}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onResendOTP={handleResendOTP}
      />

      {isQuoteTypeDistributionModalOpen && (
        <QuoteTypeDistributionModal
          isOpen={isQuoteTypeDistributionModalOpen}
          onClose={() => setIsQuoteTypeDistributionModalOpen(false)}
          onSubmit={handleQuoteDistributionSubmit}
          remainingQuota={remainingLeadQuota}
          userAlreadyHasBiddingLead={hasBiddingLead}
        />
      )}

      {isLeadLimitReachedModalOpen && (
        <LeadLimitReachedModal
          isOpen={isLeadLimitReachedModalOpen}
          onClose={() => setIsLeadLimitReachedModalOpen(false)}
          usedQuotes={userLeadCount}
          totalQuoteLimit={MAX_LEADS}
        />
      )}

  {/* Blog Section */}
  <section className="w-full py-16 lg:py-24 bg-background">
    <BlogSection
      onSeeAllPostsClick={handleSeeAllBlogPosts}
      onNavigateToPost={handleNavigateToPost}
    />
  </section>

      {/* Newsletter Section */}
      <NewsletterSignup />

      {/* Footer */}
      <Footer
        onBecomePartnerClick={handleBecomePartner}
        onPartnerSignInClick={handlePartnerSignIn}
        onScrollToQuote={handleScrollToQuote}
        onScrollToRebate={handleScrollToRebate}
        onBlogClick={handleBlogClick}
        onGovernmentNewsClick={handleGovernmentNewsClick}
      />
    </main>
  );
}