'use client';

import React from 'react';
import { GoogleIcon, AppleIcon } from '@/components/icons/auth';
import { AuthButton } from './AuthButton';

export interface SocialAuthButtonsProps {
  onGoogleSignIn?: () => void;
  onAppleSignIn?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * SocialAuthButtons - Google and Apple sign-in buttons
 * Neumorphic styled social authentication options
 * Uses design system tokens only
 */
export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGoogleSignIn,
  onAppleSignIn,
  disabled = false,
  loading = false,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {onGoogleSignIn && (
        <AuthButton
          variant="social"
          onClick={onGoogleSignIn}
          disabled={disabled || loading}
          icon={<GoogleIcon />}
        >
          Continue with Google
        </AuthButton>
      )}

      {onAppleSignIn && (
        <AuthButton
          variant="social"
          onClick={onAppleSignIn}
          disabled={disabled || loading}
          icon={<AppleIcon />}
        >
          Continue with Apple
        </AuthButton>
      )}
    </div>
  );
};

export default SocialAuthButtons;
