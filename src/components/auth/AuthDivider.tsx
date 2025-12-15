'use client';

import React from 'react';

export interface AuthDividerProps {
  text?: string;
  className?: string;
}

/**
 * AuthDivider - Divider with centered text for auth forms
 * Commonly used between social login and email/password sections
 * Uses design system tokens only
 */
export const AuthDivider: React.FC<AuthDividerProps> = ({
  text = 'or',
  className = '',
}) => {
  return (
    <div className={`relative my-6 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border"></div>
      </div>
      <div className="relative flex justify-center text-body-small">
        <span className="px-3 bg-background text-subtle">
          {text}
        </span>
      </div>
    </div>
  );
};

export default AuthDivider;
