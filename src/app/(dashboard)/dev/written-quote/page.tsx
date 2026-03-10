"use client";
import React, { useState } from 'react';
import { ActionPanel, CurrentStateCard, HistoryList, mockEvents, mockState } from '@/app/components/written-quote';

export default function WrittenQuoteDevPage() {
  const [role, setRole] = useState<'INSTALLER' | 'HOMEOWNER'>('HOMEOWNER');
  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-heading-1">Written Quote – UI Preview (Mock)</h1>
        <div className="flex items-center gap-2">
          <label className="text-caption text-muted-foreground">Role</label>
          <select
            aria-label="Preview role"
            className="neu-input bg-surface border border-border shadow-inner rounded-lg px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="HOMEOWNER">Homeowner</option>
            <option value="INSTALLER">Installer</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <CurrentStateCard state={mockState} />
          <HistoryList events={mockEvents} />
        </div>
        <div className="lg:col-span-1">
          <ActionPanel role={role} onMockAction={() => { /* no-op for mock */ }} />
        </div>
      </div>
    </div>
  );
}
