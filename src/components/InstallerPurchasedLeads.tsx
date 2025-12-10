/**
 * Installer Purchased Leads Component
 * 
 * T061: Display leads purchased by the installer
 * Features:
 * - Full contact details revealed (phone, email)
 * - Purchase status and date
 * - Lead details and instant quote data
 * - Action buttons (contact, view details)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyPoundIcon,
  CalendarIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface PurchasedLead {
  id: string;
  quoteType: string;
  status: string;
  purchaseStatus: string;
  purchasedAt: string;
  leadPrice: number;
  homeowner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  location?: string;
  propertyType?: string;
  roofType?: string;
  estimatedBudget?: number;
  electricityBill?: number;
  roofArea?: number;
  quoteData?: any;
}

export default function InstallerPurchasedLeads() {
  const router = useRouter();
  const [leads, setLeads] = useState<PurchasedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch purchased leads
  useEffect(() => {
    fetchPurchasedLeads();
  }, []);

  async function fetchPurchasedLeads() {
    try {
      setLoading(true);
      const response = await fetch('/api/leads?purchased=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchased leads');
      }

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle contact actions
  function handleCall(phone: string) {
    window.location.href = `tel:${phone}`;
  }

  function handleEmail(email: string) {
    window.location.href = `mailto:${email}`;
  }

  function handleViewDetails(leadId: string) {
    router.push(`/installer/leads/${leadId}`);
  }

  // Calculate stats
  const totalPurchased = leads.length;
  const totalSpent = leads.reduce((sum, lead) => sum + (lead.leadPrice || 0), 0);
  const thisMonth = leads.filter(lead => {
    const purchaseDate = new Date(lead.purchasedAt);
    const now = new Date();
    return purchaseDate.getMonth() === now.getMonth() && 
           purchaseDate.getFullYear() === now.getFullYear();
  }).length;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border border-error rounded-lg p-6">
        <p className="text-error">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-heading-2 text-foreground mb-2">
          Purchased Leads
        </h1>
        <p className="text-muted">
          View and manage leads you&apos;ve purchased
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-small text-muted">Total Purchased</p>
              <p className="text-heading-1 text-foreground mt-2">{totalPurchased}</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-success" />
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-small text-muted">Total Spent</p>
              <p className="text-heading-1 text-foreground mt-2">£{totalSpent}</p>
            </div>
            <CurrencyPoundIcon className="h-12 w-12 text-info" />
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-small text-muted">This Month</p>
              <p className="text-heading-1 text-foreground mt-2">{thisMonth}</p>
            </div>
            <CalendarIcon className="h-12 w-12 text-accent" />
          </div>
        </div>
      </div>

      {/* Leads List */}
      {leads.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <CheckCircleIcon className="h-12 w-12 text-muted mx-auto mb-3" />
          <h3 className="text-heading-4 text-foreground mb-1">
            No purchased leads yet
          </h3>
          <p className="text-muted mb-4">
            Browse the marketplace to find your first lead
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-surface rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Lead Info */}
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-caption bg-success/20 text-success">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Purchased
                    </span>
                    <span className="text-body-small text-muted">
                      {new Date(lead.purchasedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-2">
                    <h3 className="text-heading-4 text-foreground">
                      {lead.homeowner.name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-body-small text-muted">
                      <a href={`tel:${lead.homeowner.phone}`} className="flex items-center space-x-2 hover:text-info">
                        <PhoneIcon className="h-4 w-4" />
                        <span>{lead.homeowner.phone}</span>
                      </a>
                      <a href={`mailto:${lead.homeowner.email}`} className="flex items-center space-x-2 hover:text-info">
                        <EnvelopeIcon className="h-4 w-4" />
                        <span>{lead.homeowner.email}</span>
                      </a>
                      {lead.location && (
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{lead.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lead Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-body-small">
                    {lead.propertyType && (
                      <div>
                        <p className="text-muted">Property</p>
                        <p className="text-foreground capitalize">{lead.propertyType}</p>
                      </div>
                    )}
                    {lead.roofType && (
                      <div>
                        <p className="text-muted">Roof</p>
                        <p className="text-foreground capitalize">{lead.roofType}</p>
                      </div>
                    )}
                    {lead.estimatedBudget && (
                      <div>
                        <p className="text-muted">Budget</p>
                        <p className="text-foreground">£{lead.estimatedBudget.toLocaleString()}</p>
                      </div>
                    )}
                    {lead.electricityBill && (
                      <div>
                        <p className="text-muted">Bill</p>
                        <p className="text-foreground">£{lead.electricityBill}/mo</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[160px]">
                  <button
                    onClick={() => handleCall(lead.homeowner.phone)}
                    className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-success hover:bg-success text-foreground-secondary rounded-lg transition-colors"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    <span>Call Now</span>
                  </button>
                  <button
                    onClick={() => handleEmail(lead.homeowner.email)}
                    className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-primary hover:bg-primary text-foreground-secondary rounded-lg transition-colors"
                  >
                    <EnvelopeIcon className="h-5 w-5" />
                    <span>Send Email</span>
                  </button>
                  <button
                    onClick={() => handleViewDetails(lead.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-surface text-foreground-secondary rounded-lg transition-colors"
                  >
                    <EyeIcon className="h-5 w-5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>

              {/* Purchase Info */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-body-small">
                <span className="text-muted">Purchase Price:</span>
                <span className="text-foreground">£{lead.leadPrice}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}