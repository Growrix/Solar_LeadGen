'use client';

/**
 * Admin Installers Page
 * Phase 7.5.13 - T342
 * 
 * Main page for managing installer verification and profiles.
 * Integrates all installer management components.
 */

import React from 'react';
import InstallersTable from '@/components/admin/InstallersTable';

export default function AdminInstallersPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Title & Subtitle */}
      <div className="mb-8">
        <h1 className="text-heading-1 text-foreground mb-2">Installers Management</h1>
        <p className="text-heading-4 text-muted-foreground">View, add, and manage solar installers in the system.</p>
      </div>
      <InstallersTable />
    </div>
  );
}
