/**
 * Quote Type Definitions
 * 
 * Purpose: TypeScript types for installer quotes
 * Used for: Quote submission, acceptance, rejection workflows
 * 
 * Quote Lifecycle:
 * 1. Installer purchases lead → Can submit quotes
 * 2. Installer submits INFORMAL quote (quick estimate) or FORMAL quote (detailed)
 * 3. Homeowner reviews quotes → Accepts or rejects
 * 4. Accepted quote → Installation coordination begins
 */

import { Quote, QuoteType } from '@prisma/client';

/**
 * Create quote input
 * Used when installer submits a new quote
 */
export interface CreateQuoteInput {
  leadId: string;
  quoteType: QuoteType;

  // System specs
  systemSize: number; // kW
  panelBrand?: string;
  inverterBrand?: string;
  batteryBrand?: string;
  batteryCapacity?: number; // kWh

  // Pricing
  totalPrice: number; // £
  federalRebate?: number;
  stateRebate?: number;
  finalPrice: number; // After rebates

  // Details
  description?: string;
  paybackYears?: number;
  annualSavings?: number; // £/year
  warranty?: string;
  installTimeline?: string;

  // Attachments
  attachments?: File[]; // Uploaded files (PDFs, images)
}

/**
 * Quote with installer details
 * Used when displaying quotes to homeowners
 */
export interface QuoteWithInstaller extends Quote {
  installer: {
    id: string;
    name: string;
    companyName?: string;
    image?: string;
    phone?: string;
  };
  attachmentUrls: string[]; // Presigned S3 URLs
}

/**
 * Quote acceptance input
 */
export interface AcceptQuoteInput {
  quoteId: string;
  message?: string; // Optional message to installer
}

/**
 * Quote rejection input
 */
export interface RejectQuoteInput {
  quoteId: string;
  reason: string;
}

/**
 * Quote statistics (for installer dashboard)
 */
export interface QuoteStatistics {
  totalQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  pendingQuotes: number;
  acceptanceRate: number; // %
  averageResponseTime: number; // Hours to submit quote after purchase
  averageQuoteValue: number; // £
}

/**
 * Quote comparison view
 * Used when homeowner compares multiple quotes
 */
export interface QuoteComparison {
  leadId: string;
  quotes: Array<{
    id: string;
    installerName: string;
    installerCompany?: string;
    quoteType: QuoteType;
    systemSize: number;
    totalPrice: number;
    finalPrice: number;
    paybackYears?: number;
    annualSavings?: number;
    warranty?: string;
    installTimeline?: string;
    createdAt: Date;
    status: string;
  }>;
}

/**
 * Quote attachment upload response
 */
export interface QuoteAttachmentUpload {
  s3Key: string;
  fileName: string;
  fileSize: number;
  presignedUrl: string; // For direct browser upload
}
