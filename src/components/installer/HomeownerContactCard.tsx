'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { LockClosedIcon, EnvelopeIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';
import { maskEmail, maskPhone, maskName } from '@/utils/contactMasking';

/**
 * HomeownerContactCard
 * 
 * Displays homeowner contact with masking logic
 * Shows full details if lead is purchased, masked otherwise
 * 
 * Phase 4.16.14 - Sprint 4.16.14.1
 * 
 * DESIGN TOKENS: 100% semantic (neu-card, text-heading-*, bg-surface, text-muted-foreground)
 * THEME COMPLIANCE: Dark/Light/Purple verified
 * ACCESSIBILITY: WCAG 2.1 AA
 */

interface HomeownerContact {
  name: string;
  email: string;
  phone?: string;
}

interface HomeownerContactCardProps {
  contact: HomeownerContact;
  isPurchased: boolean;
}

export default function HomeownerContactCard({
  contact,
  isPurchased
}: HomeownerContactCardProps) {
  const displayName = isPurchased ? contact.name : maskName(contact.name);
  const displayEmail = isPurchased ? contact.email : maskEmail(contact.email);
  const displayPhone = isPurchased && contact.phone ? contact.phone : maskPhone(contact.phone || '');

  return (
    <Card className="neu-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-heading-3">Homeowner Contact</h3>
        {!isPurchased && (
          <div className="flex items-center space-x-1 text-muted-foreground text-body-small">
            <LockClosedIcon className="h-4 w-4" />
            <span>Purchase to unlock</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Name */}
        <div className="flex items-start space-x-2">
          <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-body-small text-muted-foreground">Name</div>
            <div className="text-body text-foreground">{displayName}</div>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start space-x-2">
          <EnvelopeIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-body-small text-muted-foreground">Email</div>
            {isPurchased ? (
              <a
                href={`mailto:${displayEmail}`}
                className="text-body text-primary hover:underline"
              >
                {displayEmail}
              </a>
            ) : (
              <div className="text-body text-muted-foreground">{displayEmail}</div>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start space-x-2">
          <PhoneIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-body-small text-muted-foreground">Phone</div>
            {isPurchased && contact.phone ? (
              <a
                href={`tel:${displayPhone}`}
                className="text-body text-primary hover:underline"
              >
                {displayPhone}
              </a>
            ) : (
              <div className="text-body text-muted-foreground">{displayPhone}</div>
            )}
          </div>
        </div>
      </div>

      {!isPurchased && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-muted">
          <p className="text-body-small text-muted-foreground text-center">
            Contact details will be revealed once you purchase this lead
          </p>
        </div>
      )}
    </Card>
  );
}
