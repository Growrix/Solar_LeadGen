import React from 'react';
import { PublicShell } from '@/ds';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicShell>
      {children}
    </PublicShell>
  );
}
