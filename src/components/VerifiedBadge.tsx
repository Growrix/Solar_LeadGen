/**
 * T038: Verified Badge Component
 * 
 * Displays a verified checkmark badge for users who have completed phone verification
 * - Can be used inline or as a tooltip
 * - Shows verification status
 * - Responsive design
 */

'use client'

import React from 'react';

// --- Icon Components ---
const ShieldCheckIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="inline"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="inline"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

interface VerifiedBadgeProps {
  /** Verification status */
  verified: boolean;
  /** Display variant */
  variant?: 'inline' | 'badge' | 'icon-only';
  /** Size of the badge */
  size?: 'sm' | 'md' | 'lg';
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Custom text for verified state */
  verifiedText?: string;
  /** Custom text for unverified state */
  unverifiedText?: string;
  /** Icon style (shield or check) */
  iconStyle?: 'shield' | 'check';
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  verified,
  variant = 'inline',
  size = 'md',
  showTooltip = true,
  verifiedText = 'Verified',
  unverifiedText = 'Not Verified',
  iconStyle = 'check'
}) => {
  // Size classes
  const sizeClasses = {
    sm: {
      text: 'text-caption',
      padding: 'px-2 py-0.5',
      icon: 'w-3 h-3'
    },
    md: {
      text: 'text-body-small',
      padding: 'px-2.5 py-1',
      icon: 'w-4 h-4'
    },
    lg: {
      text: 'text-body',
      padding: 'px-3 py-1.5',
      icon: 'w-5 h-5'
    }
  };

  const sizeClass = sizeClasses[size];

  // Color classes based on verification status
  const colorClasses = verified
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : 'text-muted bg-slate-100 border-border';

  // Tooltip text
  const tooltipText = verified
    ? 'Phone number verified'
    : 'Phone number not verified';

  // Icon component
  const Icon = iconStyle === 'shield' ? ShieldCheckIcon : CheckCircleIcon;

  // Render based on variant
  if (variant === 'icon-only') {
    return (
      <span 
        className={`inline-flex items-center ${verified ? 'text-emerald-600' : 'text-muted'}`}
        title={showTooltip ? tooltipText : undefined}
      >
        <span className={sizeClass.icon}>
          <Icon />
        </span>
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span 
        className={`inline-flex items-center gap-1 ${sizeClass.text} ${verified ? 'text-emerald-600' : 'text-muted'}`}
        title={showTooltip ? tooltipText : undefined}
      >
        <span className={sizeClass.icon}>
          <Icon />
        </span>
        <span className="">
          {verified ? verifiedText : unverifiedText}
        </span>
      </span>
    );
  }

  // variant === 'badge'
  return (
    <span 
      className={`inline-flex items-center gap-1.5 ${sizeClass.text} ${sizeClass.padding} ${colorClasses} border rounded-full transition-colors`}
      title={showTooltip ? tooltipText : undefined}
    >
      <span className={sizeClass.icon}>
        <Icon />
      </span>
      <span>
        {verified ? verifiedText : unverifiedText}
      </span>
    </span>
  );
};

export default VerifiedBadge;
