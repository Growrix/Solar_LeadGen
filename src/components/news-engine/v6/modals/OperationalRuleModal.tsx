'use client';

import React from 'react';
import { Layers, X } from 'lucide-react';

export type OperationalRuleType = 'Limit' | 'Filter' | 'Constraint';

export type OperationalRule = {
  id: number;
  type: OperationalRuleType;
  label: string;
  value: string;
  desc: string;
  isActive: boolean;
};

type Props = {
  onClose: () => void;
  onSave: (rule: OperationalRule) => void;
};

export function OperationalRuleModal({ onClose, onSave }: Props) {
  const [type, setType] = React.useState<OperationalRuleType>('Limit');
  const [label, setLabel] = React.useState('');
  const [value, setValue] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

  const canSave = label.trim().length > 0 && value.trim().length > 0;

  const Toggle = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border border-border ${
        checked ? 'bg-accent' : 'bg-surface'
      }`}
      aria-pressed={checked}
      aria-label="Active"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const handleSave = () => {
    if (!canSave) return;

    onSave({
      id: Date.now(),
      type,
      label: label.trim(),
      value: value.trim(),
      desc: desc.trim(),
      isActive,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="operational-rule-modal-title"
    >
      <div
        className="relative bg-surface w-full max-w-lg rounded-3xl shadow-neu-outset flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-xl shadow-neu-inset text-brand-accent">
              <Layers size={20} />
            </div>
            <h2 id="operational-rule-modal-title" className="text-heading-3 text-foreground">
              Add Operational Rule
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground bg-background rounded-lg shadow-neu-inset transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-body-small text-muted-foreground uppercase tracking-widest" htmlFor="rule-type">
              Type
            </label>
            <div className="relative">
              <select
                id="rule-type"
                value={type}
                onChange={(e) => setType(e.target.value as OperationalRuleType)}
                className="w-full appearance-none px-4 py-3 bg-background border border-border rounded-xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="Limit">Limit</option>
                <option value="Filter">Filter</option>
                <option value="Constraint">Constraint</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-body-small text-muted-foreground uppercase tracking-widest" htmlFor="rule-label">
              Label
            </label>
            <input
              id="rule-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="e.g. Max Stories Per Day"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body-small text-muted-foreground uppercase tracking-widest" htmlFor="rule-value">
              Value
            </label>
            <input
              id="rule-value"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="e.g. 15 Stories"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body-small text-muted-foreground uppercase tracking-widest" htmlFor="rule-desc">
              Description
            </label>
            <textarea
              id="rule-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 min-h-[110px]"
              placeholder="Short explanation for admins"
            />
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-body text-foreground">Active</p>
              <p className="text-body-small text-muted-foreground">Inactive rules remain visible but do not apply.</p>
            </div>
            <Toggle checked={isActive} onToggle={() => setIsActive((v) => !v)} />
          </div>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-background border border-border rounded-xl text-body text-foreground hover:bg-surface shadow-neu-outset transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-xl shadow-neu-outset hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
