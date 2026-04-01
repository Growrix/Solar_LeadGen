"use client";
import React, { useState } from 'react';

type Props = {
  role: 'INSTALLER' | 'HOMEOWNER';
  disabled?: boolean;
  onMockAction?: (action: 'OFFER' | 'COUNTER' | 'DONE') => void;
};

export function ActionPanel({ role, disabled, onMockAction }: Props) {
  const [amount, setAmount] = useState<string>("");

  return (
    <div className="bg-surface shadow-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <h3 className="text-heading-3 text-foreground">Actions</h3>
      {role === 'HOMEOWNER' ? (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-caption text-muted-foreground">Your counter amount (AUD)</label>
            <input
              aria-label="Your counter amount"
              type="number"
              className="ui-input w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 4800"
              disabled={disabled}
            />
          </div>
          <button
            className="ui-button ui-button--primary px-4 py-2 rounded-lg"
            disabled={disabled}
            onClick={() => onMockAction?.('COUNTER')}
          >
            Submit Counter
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
          <div className="flex-1">
            <label className="text-caption text-muted-foreground">New offer (AUD)</label>
            <input
              aria-label="New offer amount"
              type="number"
              className="ui-input w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              disabled={disabled}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="ui-button ui-button--secondary px-4 py-2 rounded-lg"
              disabled={disabled}
              onClick={() => onMockAction?.('OFFER')}
            >
              Send Offer
            </button>
            <button
              className="ui-button ui-button--primary px-4 py-2 rounded-lg"
              disabled={disabled}
              onClick={() => onMockAction?.('DONE')}
            >
              Done deal
            </button>
          </div>
        </div>
      )}
      <p className="text-caption text-muted-foreground">Note: This is a UI-only mock. No backend actions are performed.</p>
    </div>
  );
}

export default ActionPanel;
