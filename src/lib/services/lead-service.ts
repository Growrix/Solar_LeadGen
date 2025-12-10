/**
 * Lead Service
 * 
 * Purpose: Business logic for lead management
 * Used for: Lead creation, validation, listing, status updates
 * 
 * Responsibilities:
 * - Validate lead data before creation
 * - Track lead submission counts
 * - Enforce verification requirements
 * - Handle role-based filtering
 * - Integrate with audit logging
 * - Trigger notifications
 */

import { prisma } from '@/lib/prisma';
import { LeadStatus, LeadVisibility, PurchaseStatus, UserRole } from '@prisma/client';
import { createAuditLog, AUDIT_ACTIONS } from './audit-logger';
import { createNotification } from './notification-service';
import { getSetting, getSettingAsNumber } from './settings-service';
import { canCancelLead, canEditLead } from '@/lib/utils/lead-helpers';

// 🔧 PHASE 21.3: Helper functions to inherit user data from first lead
async function getNameFromFirstLead(homeownerId: string): Promise<string | null> {
  const firstLead = await prisma.lead.findFirst({
    where: { homeownerId, name: { not: null } },
    orderBy: { createdAt: 'asc' },
    select: { name: true },
  });
  return firstLead?.name || null;
}

async function getPhoneFromFirstLead(homeownerId: string): Promise<string | null> {
  const firstLead = await prisma.lead.findFirst({
    where: { homeownerId, phoneNumber: { not: null } },
    orderBy: { createdAt: 'asc' },
    select: { phoneNumber: true },
  });
  return firstLead?.phoneNumber || null;
}

async function getAddressFromFirstLead(homeownerId: string): Promise<string | null> {
  const firstLead = await prisma.lead.findFirst({
    where: { homeownerId, address: { not: null } },
    orderBy: { createdAt: 'asc' },
    select: { address: true },
  });
  return firstLead?.address || null;
}

/**
 * Create Lead Input
 */
export interface CreateLeadInput {
  homeownerId: string;
  quoteData?: any; // InstantQuote calculation results
  quoteType: 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING';
  propertyAddress?: string;
  propertyPostcode: string;
  location: string;
  state: string;
  propertyType: string;
  roofType?: string;
  energyBill: number;
  billType: string;
  budgetRange?: string;
  desiredOffset?: number;
  batteryRequired?: boolean;
  batteryCapacity?: string;
  timeframe?: string;
  additionalNotes?: string;
  ipAddress?: string;
  userAgent?: string;
  // ✅ Phase 12 Fix: Accept name and phoneNumber from request (for authenticated first-quote flow)
  name?: string;
  phoneNumber?: string;
}

/**
 * Create Lead Result
 */
export interface CreateLeadResult {
  lead?: any;
  requiresVerification?: boolean;
  limitReached?: boolean;
  leadSubmissionCount: number;
  quoteLimit: number;
  remainingLeadAllowance: number;
}

export interface HomeownerLeadSummaryItem {
  id: string;
  quoteType: 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING';
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
  leadPrice: number | null;
  purchaseStatus: PurchaseStatus | null;
  purchasedAt: Date | null;
  visibility: LeadVisibility;
  quoteData: any | null; // Preserve instant quote inputs for pre-fill experiences
  phoneVerified: boolean; // Phone verification status for homeowner
  expiresAt: Date | null; // Countdown timer expiry timestamp
  phoneNumber: string | null; // Lead phone number (may differ from user phone)
  // Phase 1: Add all form fields for LeadEditModal prefill
  energyBill: number;
  billType: string;
  address: string | null; // propertyAddress in form, address in database
  postcode: string; // propertyPostcode in form, postcode in database
  location: string;
  state: string;
  propertyType: string;
  roofType: string;
  budgetRange: string;
  desiredOffset: number;
  batteryRequired: boolean;
  batteryCapacity: string | null;
  timeframe: string | null;
  additionalNotes: string | null;
}

export interface HomeownerLeadSummary {
  totalSubmitted: number;
  quoteLimit: number;
  remainingLeadAllowance: number;
  biddingLeadsSubmitted: number; // T263: Track BIDDING quota usage (max 1)
  biddingQuotaRemaining: number; // T263: Remaining BIDDING quota (0 or 1)
  phoneVerified: boolean;
  phoneNumber: string | null; // Phase 12: Phone from most recent lead for ContactVerificationModal prefill
  userPhone: string | null; // User's actual phone number in profile for sync detection
  requiresVerification: boolean;
  verificationThreshold: number;
  lastSubmissionAt: Date | null;
  statusBreakdown: Record<LeadStatus, number>;
  recentLeads: HomeownerLeadSummaryItem[];
}

/**
 * Create a new lead
 * 
 * @param input - Lead creation data
 * @returns Lead object or error status
 * 
 * Example:
 *   const result = await createLead({
 *     homeownerId: 'user123',
 *     quoteType: 'CALL_VISIT',
 *     propertyPostcode: '2000',
 *     location: 'Sydney',
 *     ...
 *   });
 */
export async function createLead(input: CreateLeadInput): Promise<CreateLeadResult> {
  // Fetch homeowner with current submission count and phone verification status
  const homeowner = await prisma.user.findUnique({
    where: { id: input.homeownerId },
    select: {
      id: true,
      name: true, // ✅ Phase 21 Fix: Need name for lead.name fallback
      phone: true, // Phase 4.13: For copying to lead
      phoneVerified: true, // Phase 4.13: For copying to lead
      leadSubmissionCount: true,
      leadSubmissionLimit: true,
    },
  }) as any; // Type assertion to work around Prisma type cache
  
  // Manually add biddingLeadsSubmitted since type cache hasn't updated
  const homeownerWithBidding = homeowner as typeof homeowner & { biddingLeadsSubmitted: number };

  if (!homeowner) {
    throw new Error('Homeowner not found');
  }

  const currentCount = homeowner.leadSubmissionCount;

  // Check BIDDING quota limit (max 1 per user)
  if (input.quoteType === 'BIDDING') {
    if (homeownerWithBidding.biddingLeadsSubmitted >= 1) {
      throw new Error('BIDDING quota exceeded. You can only create 1 bidding quote per account.');
    }
  }


  // Get max submission limits from settings
  const maxBeforeVerification = await getSettingAsNumber('MAX_LEAD_SUBMISSIONS_BEFORE_VERIFICATION');
  const submissionLimit = homeowner.leadSubmissionLimit ?? await getSettingAsNumber('MAX_LEAD_SUBMISSIONS_TOTAL');

  // Check if phone verification is required
  if (!homeowner.phoneVerified && currentCount >= maxBeforeVerification) {
    return {
      requiresVerification: true,
      leadSubmissionCount: currentCount,
      quoteLimit: submissionLimit,
      remainingLeadAllowance: Math.max(submissionLimit - currentCount, 0),
    };
  }

  // Check if total limit reached (even after verification)
  if (currentCount >= submissionLimit) {
    return {
      limitReached: true,
      leadSubmissionCount: currentCount,
      quoteLimit: submissionLimit,
      remainingLeadAllowance: 0,
    };
  }

  // Get default pricing from settings
  let priceKey: string;
  if (input.quoteType === 'CALL_VISIT') {
    priceKey = 'LEAD_PRICE_CALL_VISIT';
  } else if (input.quoteType === 'WRITTEN_QUOTE') {
    priceKey = 'LEAD_PRICE_WRITTEN_QUOTE';
  } else {
    priceKey = 'LEAD_PRICE_BIDDING'; // For BIDDING type
  }
  const defaultPrice = await getSettingAsNumber(priceKey);

  // Calculate lead expiry date
  const expiryDays = await getSettingAsNumber('LEAD_EXPIRY_DAYS');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  // Create lead in database
  const lead = await prisma.lead.create({
    data: {
      homeownerId: input.homeownerId,
      quoteType: input.quoteType as any, // Type assertion for BIDDING enum
      projectType: input.propertyType,
      propertyType: input.propertyType,
      postcode: input.propertyPostcode,
      location: input.location,
      state: input.state,
      // 🔧 PHASE 21.3: Inherit address from first lead if not provided
      address: input.propertyAddress || await getAddressFromFirstLead(input.homeownerId),
      energyBill: input.energyBill,
      billType: input.billType,
      roofType: input.roofType || 'unknown',
      budgetRange: input.budgetRange || 'unknown',
      desiredOffset: input.desiredOffset || 100,
      batteryRequired: input.batteryRequired || false,
      batteryCapacity: input.batteryCapacity,
      timeframe: input.timeframe,
      additionalNotes: input.additionalNotes,
      leadPrice: defaultPrice,
      expiresAt,
      status: LeadStatus.PENDING_APPROVAL, // Show in dashboards immediately, awaiting admin approval
      visibility: LeadVisibility.HIDDEN, // Visible to homeowner/admin, hidden from installers until approved
      quoteData: input.quoteData || null, // Phase 4.5: Store complete instant quote data
      phoneVerified: homeowner?.phoneVerified || false, // Phase 4.13: Copy verification status from homeowner
      
      // 🔧 PHASE 21.3: Inherit user data from first lead if homeowner.name is NULL
      // If user signed up directly (not via guest flow), homeowner.name/phone will be NULL
      // Solution: Copy name/phoneNumber from their first lead
      name: input.name || homeowner?.name || await getNameFromFirstLead(input.homeownerId),
      phoneNumber: input.phoneNumber || homeowner?.phone || await getPhoneFromFirstLead(input.homeownerId),
    },
    include: {
      homeowner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          phoneVerified: true,
        },
      },
    },
  });

  // Increment lead submission count
  const updateData: any = { leadSubmissionCount: currentCount + 1 };
  
  // Increment BIDDING counter if this is a bidding lead
  if (input.quoteType === 'BIDDING') {
    updateData.biddingLeadsSubmitted = { increment: 1 };
  }
  
  // ✅ PHASE 21.4: Update User model with name/phone from first lead (if User.name/phone are null)
  // This ensures User model has contact info after first lead generation
  if (!homeowner?.name && lead.name) {
    updateData.name = lead.name;
  }
  if (!homeowner?.phone && lead.phoneNumber) {
    updateData.phone = lead.phoneNumber;
  }
  
  await prisma.user.update({
    where: { id: input.homeownerId },
    data: updateData,
  });

  // Log audit trail
  await createAuditLog({
    action: AUDIT_ACTIONS.LEAD_CREATED,
    entityType: 'lead',
    entityId: lead.id,
    leadId: lead.id,
    userId: input.homeownerId,
    metadata: {
      quoteType: input.quoteType,
      postcode: input.propertyPostcode,
      location: input.location,
      leadPrice: defaultPrice,
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  // Send notification to admin
  const adminEmail = await getSetting('ADMIN_EMAIL');
  await createNotification({
    userId: adminEmail, // Will lookup admin user by email
    type: 'NEW_LEAD',
    title: 'New Lead Submitted',
    message: `New ${input.quoteType} lead in ${input.location} (${input.propertyPostcode})`,
    actionUrl: `/admin/leads/${lead.id}`,
    metadata: {
      leadId: lead.id,
      quoteType: input.quoteType,
      postcode: input.propertyPostcode,
    },
  });

  return {
    lead,
    leadSubmissionCount: currentCount + 1,
    quoteLimit: submissionLimit,
    remainingLeadAllowance: Math.max(submissionLimit - (currentCount + 1), 0),
  };
}

/**
 * Get Leads Input
 */
export interface GetLeadsInput {
  userId: string;
  userRole: string;
  filters: {
    status?: string;
    quoteType?: string;
    postcode?: string;
    marketplace?: boolean;
    purchased?: boolean;
    assigned?: boolean;
    page: number;
    limit: number;
  };
}

/**
 * Get leads with role-based filtering
 * 
 * @param input - User ID, role, and filters
 * @returns Paginated list of leads
 * 
 * Role-based visibility:
 * - HOMEOWNER: Only their own leads
 * - INSTALLER: Only approved/available leads + their purchased leads
 * - ADMIN: All leads
 */
export async function getLeads(input: GetLeadsInput) {
  const { userId, userRole, filters } = input;
  const { page, limit, status, quoteType, postcode, marketplace, purchased, assigned } = filters;

  const skip = (page - 1) * limit;

  // If installer requests assigned leads, use dedicated function
  if (userRole === 'INSTALLER' && assigned) {
    const assignedLeads = await getInstallerAssignedLeads(userId);
    return {
      leads: assignedLeads.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total: assignedLeads.length,
        totalPages: Math.ceil(assignedLeads.length / limit),
      },
    };
  }

  // Build where clause based on role
  let whereClause: any = {};

  if (userRole === 'HOMEOWNER') {
    // Homeowners see only their own leads
    whereClause.homeownerId = userId;
  } else if (userRole === 'INSTALLER') {
    // Handle marketplace filter (available leads only)
    if (marketplace) {
      whereClause.visibility = LeadVisibility.PUBLIC;
      whereClause.status = LeadStatus.APPROVED; // Only approved leads
      whereClause.installerId = null; // Not yet purchased
    } 
    // Handle purchased filter (purchased leads only)
    else if (purchased) {
      whereClause.installerId = userId; // Their purchased leads
      whereClause.purchaseStatus = PurchaseStatus.COMPLETED; // Successfully purchased
    }
    // Default: Show both available and purchased leads
    else {
      whereClause.OR = [
        {
          visibility: LeadVisibility.PUBLIC,
          status: LeadStatus.APPROVED,
          installerId: null, // Not yet purchased
        },
        {
          installerId: userId, // Their purchased leads
          purchaseStatus: PurchaseStatus.COMPLETED,
        },
      ];
    }
  }
  // ADMIN sees all leads (no filter)

  // Apply additional filters
  if (status) {
    whereClause.status = status as LeadStatus;
  }
  if (quoteType) {
  whereClause.quoteType = quoteType as 'CALL_VISIT' | 'WRITTEN_QUOTE';
  }
  if (postcode) {
    whereClause.postcode = postcode;
  }

  // Fetch leads with pagination
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        visibility: true,
        phoneVerified: true, // Phase 4.13: Include lead verification status
        phoneNumber: true, // Phase 4.13: Include lead phone number
        quoteType: true,
        postcode: true,
        location: true,
        energyBill: true,
        leadPrice: true,
        createdAt: true,
        approvedAt: true,
        expiresAt: true, // Countdown timer feature
        homeowner: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneVerified: true,
          },
        },
        installer: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
          },
        },
      },
    }),
    prisma.lead.count({ where: whereClause }),
  ]);

  return {
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Build homeowner dashboard summary including quota metadata and recent leads.
 */
export async function getHomeownerLeadSummary(userId: string): Promise<HomeownerLeadSummary> {
  const homeowner = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phone: true, // Fetch user's actual phone number
      phoneVerified: true,
      leadSubmissionCount: true,
      leadSubmissionLimit: true,
      biddingLeadsSubmitted: true, // T263: Fetch BIDDING quota usage
    },
  });
  
  if (!homeowner) {
    throw new Error('Homeowner not found');
  }

  const [verificationThreshold, recentLeads, groupedStatuses] = await Promise.all([
    getSettingAsNumber('MAX_LEAD_SUBMISSIONS_BEFORE_VERIFICATION'),
    prisma.lead.findMany({
      where: { homeownerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        quoteType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        leadPrice: true,
        purchaseStatus: true,
        purchasedAt: true,
        visibility: true,
        quoteData: true,
        expiresAt: true, // Countdown timer feature
        phoneVerified: true, // For verification status
        phoneNumber: true, // Phase 12: For ContactVerificationModal prefill
        // Phase 1: Add all form fields for LeadEditModal prefill
        energyBill: true,
        billType: true,
        address: true, // propertyAddress in form, address in database
        postcode: true, // propertyPostcode in form, postcode in database
        location: true,
        state: true,
        propertyType: true,
        roofType: true,
        budgetRange: true,
        desiredOffset: true,
        batteryRequired: true,
        batteryCapacity: true,
        timeframe: true,
        additionalNotes: true,
      },
    }),
    prisma.lead.groupBy({
      by: ['status'],
      where: { homeownerId: userId },
      _count: {
        status: true,
      },
    }),
  ]);

  const quoteLimit = homeowner.leadSubmissionLimit ?? await getSettingAsNumber('MAX_LEAD_SUBMISSIONS_TOTAL');
  const remainingLeadAllowance = Math.max(quoteLimit - homeowner.leadSubmissionCount, 0);
  const biddingQuotaRemaining = Math.max(1 - homeowner.biddingLeadsSubmitted, 0); // T263: Calculate from actual field
  const requiresVerification = !homeowner.phoneVerified && homeowner.leadSubmissionCount >= verificationThreshold;

  const statusBreakdown = Object.values(LeadStatus).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<LeadStatus, number>);

  for (const group of groupedStatuses) {
    statusBreakdown[group.status as LeadStatus] = group._count.status;
  }

  return {
    totalSubmitted: homeowner.leadSubmissionCount,
    quoteLimit,
    remainingLeadAllowance,
    biddingLeadsSubmitted: homeowner.biddingLeadsSubmitted, // T263: Return BIDDING usage count
    biddingQuotaRemaining, // T263: Return remaining BIDDING quota (0 or 1)
    phoneVerified: homeowner.phoneVerified,
    phoneNumber: recentLeads.length > 0 ? recentLeads[0].phoneNumber : null, // Phase 12: For ContactVerificationModal prefill
    userPhone: homeowner.phone, // User's actual phone number for sync detection
    requiresVerification,
    verificationThreshold,
    lastSubmissionAt: recentLeads.length > 0 ? recentLeads[0].createdAt : null,
    statusBreakdown,
    recentLeads: recentLeads.map(lead => ({
      id: lead.id,
      quoteType: lead.quoteType as 'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING',
      status: lead.status,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      leadPrice: lead.leadPrice,
      purchaseStatus: lead.purchaseStatus,
      purchasedAt: lead.purchasedAt,
      visibility: lead.visibility,
      quoteData: lead.quoteData,
      phoneVerified: lead.phoneVerified,
      expiresAt: lead.expiresAt,
      phoneNumber: lead.phoneNumber,
      // Phase 1: Map all form fields for LeadEditModal prefill
      energyBill: lead.energyBill,
      billType: lead.billType,
      address: lead.address, // Maps to propertyAddress in form
      postcode: lead.postcode, // Maps to propertyPostcode in form
      location: lead.location,
      state: lead.state,
      propertyType: lead.propertyType,
      roofType: lead.roofType,
      budgetRange: lead.budgetRange,
      desiredOffset: lead.desiredOffset,
      batteryRequired: lead.batteryRequired,
      batteryCapacity: lead.batteryCapacity,
      timeframe: lead.timeframe,
      additionalNotes: lead.additionalNotes,
    })),
  };
}

/**
 * Get Lead By ID Input
 */
export interface GetLeadByIdInput {
  leadId: string;
  userId: string;
  userRole: string;
}

/**
 * Get single lead by ID with role-based visibility
 * 
 * @param input - Lead ID, user ID, and role
 * @returns Lead object or null if not found/unauthorized
 * 
 * Visibility rules:
 * - HOMEOWNER: Only if they own the lead
 * - INSTALLER: Only if lead is public or they purchased it
 * - ADMIN: Always visible
 */
export async function getLeadById(input: GetLeadByIdInput) {
  const { leadId, userId, userRole } = input;

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      homeowner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          phoneVerified: true,
          leadSubmissionLimit: true,
          leadSubmissionCount: true,
        },
      },
      installer: {
        select: {
          id: true,
          name: true,
          companyName: true,
          email: true,
          phone: true,
        },
      },
      assignments: {
        include: {
          installer: {
            select: {
              id: true,
              email: true,
              installerVerified: true,
              installerVerification: {
                select: {
                  companyName: true,
                  representativeName: true,
                  phone: true,
                  address: true,
                  postcodes: true,
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!lead) {
    return null;
  }

  // Check access based on role
  if (userRole === 'HOMEOWNER' && lead.homeownerId !== userId) {
    return null; // Homeowners can only see their own leads
  }

  if (userRole === 'INSTALLER') {
    // Installers can see:
    // 1. PUBLIC leads (not yet purchased)
    // 2. Leads they have purchased (installerId === userId)
    // 3. Leads assigned to them via LeadAssignment (for bidding/multi-installer leads)
    const isAssignedToInstaller = lead.assignments?.some(
      (assignment) => assignment.installerId === userId
    );
    
    const canAccess =
      (lead.visibility === LeadVisibility.PUBLIC && !lead.installerId) ||
      lead.installerId === userId ||
      isAssignedToInstaller; // NEW: Check assignments table

    if (!canAccess) {
      return null;
    }

    // Hide sensitive homeowner details if not purchased
    // Show technical data but mask contact info (phone, email, full address)
    if (lead.installerId !== userId) {
      // Mask contact details for unpurchased/unawarded leads
      lead.homeowner.phone = 'HIDDEN';
      lead.homeowner.email = `${lead.homeowner.email[0]}***@***`;
      if (lead.address) {
        lead.address = `${lead.location}, ${lead.state}`; // Hide exact address, keep suburb/city
      }
      // Also mask lead-level contact fields
      if (lead.phoneNumber) {
        lead.phoneNumber = 'HIDDEN';
      }
      if (lead.name) {
        lead.name = 'Hidden until purchased';
      }
    }
  }

  return lead;
}

/**
}

/**
 * Update Lead Input
 */
export interface UpdateLeadInput {
  // Location fields
  propertyAddress?: string;
  propertyPostcode?: string;
  location?: string;
  state?: string;
  propertyType?: string;
  
  // Energy usage
  energyBill?: number;
  billType?: string;
  
  // Property details
  roofType?: string;
  budgetRange?: string;
  panelOrientation?: string;
  roofTilt?: string;
  shadingLevel?: string;
  usagePattern?: string;
  
  // System preferences
  desiredOffset?: number;
  hasExistingSystem?: boolean;
  existingSystemSize?: string;
  timeframe?: string;
  
  // Battery storage
  batteryRequired?: boolean;
  batteryCapacity?: string;
  batteryBrand?: string;
  batteryUsage?: string;
  backupCritical?: string;
  includeVPP?: boolean;
  
  // Additional features
  includeEVCharging?: boolean;
  includeSmartHome?: boolean;
  includeGridServices?: boolean;
  
  // Equipment preferences
  panelBrand?: string;
  systemSizeOverride?: string;
  includeOptimizers?: boolean;
  includeMicroinverters?: boolean;
  
  // Tariff details
  retailer?: string;
  tariffPlan?: string;
  customRetailRate?: number;
  customFeedInRate?: number;
  
  // Commercial fields
  peakDemand?: number;
  isThreePhase?: boolean;
  projectPriority?: string;
  
  // Additional notes (optional)
  additionalNotes?: string;
  
  // Complete form data
  quoteData?: any;
}

/**
 * Update an existing lead
 * 
 * @param leadId - Lead ID
 * @param userId - User ID (for authorization)
 * @param input - Updated lead data
 * @returns Updated lead object
 * 
 * Validations:
 * - Lead must exist
 * - User must be the lead owner
 * - Lead status must be PENDING_APPROVAL (cannot edit after approval)
 * 
 * Example:
 *   const updated = await updateLead('lead123', 'user456', {
 *     energyBill: 500,
 *     batteryRequired: true
 *   });
 */
export async function updateLead(
  leadId: string,
  userId: string,
  input: UpdateLeadInput,
  ipAddress?: string,
  userAgent?: string
) {
  // Fetch existing lead
  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      homeownerId: true,
      status: true,
      quoteType: true,
      postcode: true,
      location: true,
    },
  });

  if (!existingLead) {
    throw new Error('Lead not found');
  }

  // Verify ownership
  if (existingLead.homeownerId !== userId) {
    throw new Error('Unauthorized: You can only edit your own leads');
  }

  // Verify editable status
  if (!canEditLead(existingLead)) {
    throw new Error('Lead cannot be edited after admin approval');
  }

  // Update lead in database
  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      address: input.propertyAddress,
      postcode: input.propertyPostcode,
      location: input.location,
      state: input.state,
      propertyType: input.propertyType,
      projectType: input.propertyType,
      roofType: input.roofType,
      energyBill: input.energyBill,
      billType: input.billType,
      budgetRange: input.budgetRange,
      desiredOffset: input.desiredOffset,
      batteryRequired: input.batteryRequired,
      batteryCapacity: input.batteryCapacity,
      timeframe: input.timeframe,
      additionalNotes: input.additionalNotes,
      quoteData: input.quoteData,
      updatedAt: new Date(),
    },
    include: {
      homeowner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Log audit trail
  await createAuditLog({
    action: AUDIT_ACTIONS.LEAD_CREATED, // Using LEAD_CREATED for updates as LEAD_UPDATED doesn't exist
    entityType: 'lead',
    entityId: leadId,
    leadId: leadId,
    userId: userId,
    metadata: {
      updatedFields: Object.keys(input),
      quoteType: existingLead.quoteType,
      postcode: input.propertyPostcode || existingLead.postcode,
    },
    ipAddress,
    userAgent,
  });

  return updatedLead;
}

/**
 * Cancel a lead
 * 
 * @param leadId - Lead ID
 * @param userId - User ID (for authorization)
 * @param reason - Cancellation reason
 * @returns Cancelled lead object
 * 
 * Business Logic:
 * - Lead status changes to CANCELLED
 * - Homeowner's quota balance is restored (+1)
 * - Cancellation is logged with timestamp, reason, and user
 * - Cannot cancel if lead has been purchased by installer
 * 
 * Example:
 *   const cancelled = await cancelLead('lead123', 'user456', 'Changed my mind');
 */
export async function cancelLead(
  leadId: string,
  userId: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string
) {
  // Fetch existing lead
  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      homeownerId: true,
      status: true,
      quoteType: true,
      postcode: true,
      location: true,
    },
  });

  if (!existingLead) {
    throw new Error('Lead not found');
  }

  // Verify ownership
  if (existingLead.homeownerId !== userId) {
    throw new Error('Unauthorized: You can only cancel your own leads');
  }

  // Verify cancellable status
  if (!canCancelLead(existingLead)) {
    throw new Error('Lead cannot be cancelled after installer purchase');
  }

  // Update lead status to CANCELLED
  // @ts-ignore - Prisma type cache issue with new cancellation fields
  const cancelledLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: LeadStatus.CANCELLED,
      cancelledBy: userId,
      updatedAt: new Date(),
      cancelledAt: new Date(),
      cancelledReason: reason,
    },
    include: {
      homeowner: {
        select: {
          id: true,
          name: true,
          email: true,
          leadSubmissionCount: true,
          leadSubmissionLimit: true,
        },
      },
    },
  });

  // Restore quota to homeowner ONLY for BIDDING leads
  // BIDDING leads are paid requests that should refund the quota
  // INSTANT leads are free and should not affect quota
  const shouldRestoreQuota = existingLead.quoteType === 'BIDDING';
  
  if (shouldRestoreQuota) {
    await prisma.user.update({
      where: { id: existingLead.homeownerId },
      data: {
        leadSubmissionCount: {
          decrement: 1,
        },
      },
    });
  }

  // Log audit trail
  await createAuditLog({
    action: AUDIT_ACTIONS.LEAD_CANCELLED,
    entityType: 'lead',
    entityId: leadId,
    leadId: leadId,
    userId: userId,
    metadata: {
      reason,
      quoteType: existingLead.quoteType,
      postcode: existingLead.postcode,
      location: existingLead.location,
      quotaRestored: shouldRestoreQuota,
    },
    ipAddress,
    userAgent,
  });

  return cancelledLead;
}

/**
 * ========================================
 * PHASE 7: ADMIN LEAD ASSIGNMENT FUNCTIONS
 * ========================================
 */

/**
 * Assign Lead Input
 */
export interface AssignLeadInput {
  leadId: string;
  installerIds: string[];
  assignedBy: string; // Admin user ID
  notes?: string;
  mode: 'exclusive' | 'competitive';
  notifyInstallers?: boolean;
}

/**
 * Assign lead to specific installer(s) - ADMIN ONLY
 * Sets visibility to PRIVATE so only assigned installers see it
 * 
 * @param input - Assignment parameters
 * @returns Created LeadAssignment records
 */
export async function assignLeadToInstallers(input: AssignLeadInput) {
  const { leadId, installerIds, assignedBy, notes, mode, notifyInstallers = true } = input;

  // Validate exclusive mode
  if (mode === 'exclusive' && installerIds.length > 1) {
    throw new Error('Exclusive mode allows only one installer');
  }

  // Update lead visibility to PRIVATE and set assignment metadata
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      visibility: LeadVisibility.PRIVATE,
      assignedAt: new Date(),
      assignedBy: assignedBy,
      assignmentNotes: notes,
    },
    include: {
      homeowner: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Create or update LeadAssignment records for each installer (UPSERT to handle existing assignments)
  const assignments = await Promise.all(
    installerIds.map((installerId) =>
      prisma.leadAssignment.upsert({
        where: {
          leadId_installerId: {
            leadId,
            installerId,
          },
        },
        update: {
          assignedBy,
          notes,
          notified: false,
          assignedAt: new Date(), // Update timestamp when reassigning
        },
        create: {
          leadId,
          installerId,
          assignedBy,
          notes,
          notified: false,
        },
        include: {
          installer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    )
  );

  // Send notifications to assigned installers
  if (notifyInstallers) {
    await Promise.all(
      assignments.map((assignment) =>
        createNotification({
          userId: assignment.installerId,
          type: 'LEAD_ASSIGNED',
          title: 'New Lead Assigned',
          message: `You have been assigned a new lead by admin${notes ? ': ' + notes : ''}`,
          metadata: {
            leadId,
            assignmentMode: mode,
            homeownerName: lead.homeowner.name,
            location: lead.location,
            quoteType: lead.quoteType,
          },
        })
      )
    );

    // Mark assignments as notified
    await prisma.leadAssignment.updateMany({
      where: {
        id: { in: assignments.map((a) => a.id) },
      },
      data: {
        notified: true,
      },
    });
  }

  // Create audit log
  await createAuditLog({
    action: AUDIT_ACTIONS.LEAD_ASSIGNED,
    entityType: 'lead',
    entityId: leadId,
    leadId,
    userId: assignedBy,
    metadata: {
      installerIds,
      installerNames: assignments.map((a) => a.installer.name),
      mode,
      notes,
      visibility: 'PRIVATE',
    },
  });

  return assignments;
}

/**
 * Get leads assigned to specific installer
 * 
 * @param installerId - Installer user ID
 * @returns Leads with assignment metadata
 */
export async function getInstallerAssignedLeads(installerId: string) {
  const assignments = await prisma.leadAssignment.findMany({
    where: {
      installerId,
      lead: {
        installerId: null, // Only show leads not yet accepted
        archivedAt: null, // Exclude archived leads
      },
    },
    include: {
      lead: {
        include: {
          homeowner: {
            select: {
              name: true,
              email: true,
            },
          },
          assignments: {
            select: {
              installerId: true,
            },
          },
        },
      },
      admin: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      assignedAt: 'desc',
    },
  });

  return assignments.map((assignment) => ({
    ...assignment.lead,
    assignmentMetadata: {
      assignedAt: assignment.assignedAt,
      assignedBy: assignment.assignedBy,
      assignedByName: assignment.admin.name,
      notes: assignment.notes,
      mode: assignment.lead.assignments.length > 1 ? 'competitive' : 'exclusive',
      competitorCount: assignment.lead.assignments.length,
    },
  }));
}

/**
 * Remove lead assignment from specific installer
 * 
 * @param leadId - Lead ID
 * @param installerId - Installer user ID
 * @param removedBy - Admin user ID
 * @returns Success status
 */
export async function removeLeadAssignment(
  leadId: string,
  installerId: string,
  removedBy: string
) {
  // Delete the assignment
  await prisma.leadAssignment.delete({
    where: {
      leadId_installerId: {
        leadId,
        installerId,
      },
    },
  });

  // Check if this was the last assignment
  const remainingAssignments = await prisma.leadAssignment.count({
    where: { leadId },
  });

  // If no assignments left, set visibility to HIDDEN
  if (remainingAssignments === 0) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        visibility: LeadVisibility.HIDDEN,
      },
    });
  }

  // Notify installer
  await createNotification({
    userId: installerId,
    type: 'ASSIGNMENT_REMOVED',
    title: 'Lead Assignment Removed',
    message: `Your assignment to lead #${leadId.slice(-8)} has been removed by admin`,
    metadata: {
      leadId,
    },
  });

  // Create audit log
  await createAuditLog({
    action: AUDIT_ACTIONS.ASSIGNMENT_REMOVED,
    entityType: 'lead',
    entityId: leadId,
    leadId,
    userId: removedBy,
    metadata: {
      installerId,
      remainingAssignments,
      visibilityChanged: remainingAssignments === 0 ? 'HIDDEN' : 'unchanged',
    },
  });

  return { success: true, remainingAssignments };
}

/**
 * Resell lead - clear installer and optionally return to marketplace
 * 
 * @param leadId - Lead ID
 * @param toMarketplace - If true, set visibility to PUBLIC
 * @param resoldBy - Admin user ID
 * @returns Updated lead
 */
export async function resellLead(
  leadId: string,
  toMarketplace: boolean,
  resoldBy: string
) {
  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      installer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!existingLead) {
    throw new Error('Lead not found');
  }

  if (!existingLead.installerId) {
    throw new Error('Lead has not been purchased');
  }

  const previousInstallerId = existingLead.installerId;

  // Clear purchase data but keep assignment history for audit
  const resoldLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      installerId: null,
      purchaseStatus: null,
      purchasedAt: null,
      stripePaymentIntentId: null,
      visibility: toMarketplace ? LeadVisibility.PUBLIC : LeadVisibility.HIDDEN,
    },
  });

  // Notify previous installer
  await createNotification({
    userId: previousInstallerId,
    type: 'LEAD_RESOLD',
    title: 'Lead Resold',
    message: `Lead #${leadId.slice(-8)} has been resold by admin and removed from your purchased leads`,
    metadata: {
      leadId,
      returnedToMarketplace: toMarketplace,
    },
  });

  // Create audit log
  await createAuditLog({
    action: AUDIT_ACTIONS.LEAD_RESOLD,
    entityType: 'lead',
    entityId: leadId,
    leadId,
    userId: resoldBy,
    metadata: {
      previousInstallerId,
      previousInstallerName: existingLead.installer?.name,
      toMarketplace,
      newVisibility: resoldLead.visibility,
    },
  });

  return resoldLead;
}

/**
 * Archive lead - soft delete
 * 
 * @param leadId - Lead ID
 * @param archivedBy - Admin user ID
 * @param reason - Optional reason for archiving
 * @returns Archived lead
 */
export async function archiveLead(
  leadId: string,
  archivedBy: string,
  reason?: string
) {
  const archivedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      archivedAt: new Date(),
    },
  });

  // Create audit log
  await createAuditLog({
    action: AUDIT_ACTIONS.LEAD_ARCHIVED,
    entityType: 'lead',
    entityId: leadId,
    leadId,
    userId: archivedBy,
    metadata: {
      reason,
      postcode: archivedLead.postcode,
      status: archivedLead.status,
    },
  });

  return archivedLead;
}

/**
 * Unarchive lead - restore from soft delete
 * 
 * @param leadId - Lead ID
 * @param unarchivedBy - Admin user ID
 * @returns Restored lead
 */
export async function unarchiveLead(leadId: string, unarchivedBy: string) {
  const restoredLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      archivedAt: null,
    },
  });

  // Create audit log
  await createAuditLog({
    action: AUDIT_ACTIONS.LEAD_UNARCHIVED,
    entityType: 'lead',
    entityId: leadId,
    leadId,
    userId: unarchivedBy,
    metadata: {
      postcode: restoredLead.postcode,
      status: restoredLead.status,
      visibility: restoredLead.visibility,
    },
  });

  return restoredLead;
}

/**
 * Reset lead timer - extend expiry date
 * 
 * @param leadId - Lead ID
 * @param days - Number of days to extend (default 7)
 * @param resetBy - Admin user ID
 * @returns Updated lead with new expiry
 */
export async function resetLeadTimer(
  leadId: string,
  days: number = 7,
  resetBy: string
) {
  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!existingLead) {
    throw new Error('Lead not found');
  }

  const newExpiryDate = new Date();
  newExpiryDate.setDate(newExpiryDate.getDate() + days);

  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      expiresAt: newExpiryDate,
      createdAt: new Date(), // Reset countdown base
    },
  });

  // Create audit log
  await createAuditLog({
    action: AUDIT_ACTIONS.TIMER_RESET,
    entityType: 'lead',
    entityId: leadId,
    leadId,
    userId: resetBy,
    metadata: {
      previousExpiry: existingLead.expiresAt,
      newExpiry: newExpiryDate,
      daysExtended: days,
    },
  });

  return {
    lead: updatedLead,
    newExpiryDate,
    daysExtended: days,
  };
}

/**
 * Update lead countdown timer to specific number of days from now
 * Unlike resetLeadTimer which ADDS days, this SETS countdown to exact days
 * @param leadId - Lead ID
 * @param days - Number of days from now (absolute, not relative)
 * @param updatedBy - Admin user ID
 */
export async function updateLeadCountdown(
  leadId: string,
  days: number,
  updatedBy: string
) {
  // 1. Validate inputs
  if (!leadId || !updatedBy) {
    throw new Error('leadId and updatedBy are required');
  }

  if (typeof days !== 'number' || days < 1 || days > 90) {
    throw new Error('days must be between 1 and 90');
  }

  // 2. Check lead exists
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      assignments: {
        include: {
          installer: {
            include: {
              installerVerification: true,
            },
          },
        },
      },
    },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  // 3. Only allow for approved/assigned leads
  if (!['APPROVED', 'ASSIGNED'].includes(lead.status)) {
    throw new Error('Can only update countdown for approved or assigned leads');
  }

  // 4. Calculate new expiry date (absolute, not relative)
  const now = new Date();
  const newExpiryDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

  // 5. Update lead
  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      expiresAt: newExpiryDate,
      updatedAt: now,
    },
    include: {
      homeowner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignments: {
        include: {
          installer: {
            include: {
              installerVerification: true,
            },
          },
        },
      },
    },
  });

  // 6. Create audit log
  await createAuditLog({
    action: AUDIT_ACTIONS.TIMER_RESET,
    entityType: 'lead',
    entityId: leadId,
    leadId,
    userId: updatedBy,
    metadata: {
      action: 'countdown_update',
      previousExpiry: lead.expiresAt,
      newExpiry: newExpiryDate,
      daysSet: days,
    },
  });

  // 7. Log action
  console.log(`✅ [Lead Service] Countdown updated for lead ${leadId}:`, {
    newExpiryDate: newExpiryDate.toISOString(),
    daysSet: days,
    updatedBy,
  });

  return {
    lead: updatedLead,
    newExpiryDate,
    daysSet: days,
  };
}


