'use client';

import React from 'react';
import { Layers, X } from 'lucide-react';

export type OperationalRuleScope = 'select' | 'research' | 'draft' | 'gate' | 'schedule' | 'publish';

export type OperationalRuleAction = 'allow' | 'block' | 'require_review' | 'force_model' | 'priority';

export type OperationalRuleSeverity = 'warn' | 'block';

export type OperationalRuleConditionKind =
  | 'category'
  | 'keywords_blacklist'
  | 'min_sources'
  | 'duplicate_similarity_gt';

export type OperationalRuleCondition = {
  id: string;
  kind: OperationalRuleConditionKind;
  value: string;
};

export type OperationalRule = {
  id: number;
  scope: OperationalRuleScope;
  conditions: OperationalRuleCondition[];
  action: OperationalRuleAction;
  severity: OperationalRuleSeverity;
  enabled: boolean;
  actionValue?: string;
};

type Props = {
  onClose: () => void;
  onSave: (rule: OperationalRule) => void;
};

export function OperationalRuleModal({ onClose, onSave }: Props) {
  const makeId = React.useCallback(() => {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }, []);

  const [scope, setScope] = React.useState<OperationalRuleScope>('gate');
  const [action, setAction] = React.useState<OperationalRuleAction>('require_review');
  const [severity, setSeverity] = React.useState<OperationalRuleSeverity>('warn');
  const [enabled, setEnabled] = React.useState(true);
  const [actionValue, setActionValue] = React.useState('');

  const [conditions, setConditions] = React.useState<OperationalRuleCondition[]>([]);
  const [conditionDraftKind, setConditionDraftKind] = React.useState<OperationalRuleConditionKind>('category');
  const [conditionDraftValue, setConditionDraftValue] = React.useState<string>('');

  const whatThisDoes = React.useMemo(() => {
    const readableScope: Record<OperationalRuleScope, string> = {
      select: 'selection',
      research: 'research',
      draft: 'drafting',
      gate: 'gatekeeping',
      schedule: 'scheduling',
      publish: 'publishing',
    };

    const condSummary = conditions
      .map((c) => {
        switch (c.kind) {
          case 'category':
            return `category is “${c.value}”`;
          case 'keywords_blacklist':
            return `content contains blacklisted keywords`;
          case 'min_sources':
            return `sources ≥ ${c.value}`;
          case 'duplicate_similarity_gt':
            return `duplicate similarity > ${c.value}%`;
          default:
            return c.kind;
        }
      })
      .filter(Boolean)
      .join(', ');

    const actionLabel: Record<OperationalRuleAction, string> = {
      allow: 'allow',
      block: 'block',
      require_review: 'require manual review',
      force_model: 'force a model profile',
      priority: 'set priority',
    };

    const suffix = action === 'force_model' || action === 'priority' ? (actionValue.trim() ? ` (${actionValue.trim()})` : '') : '';
    const when = condSummary ? `When ${condSummary},` : 'When matched,';
    return `${when} ${actionLabel[action]}${suffix} during ${readableScope[scope]}. Severity: ${severity}.`;
  }, [action, actionValue, conditions, scope, severity]);

  const canSave = enabled ? scope.length > 0 && action.length > 0 && severity.length > 0 : true;

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

  const applyPreset = React.useCallback(
    (preset: 'policy_review' | 'block_keywords' | 'min_sources' | 'dedup_ignore') => {
      switch (preset) {
        case 'policy_review': {
          setScope('gate');
          setAction('require_review');
          setSeverity('warn');
          setEnabled(true);
          setActionValue('');
          setConditions([{ id: makeId(), kind: 'category', value: 'policy' }]);
          return;
        }
        case 'block_keywords': {
          setScope('draft');
          setAction('block');
          setSeverity('block');
          setEnabled(true);
          setActionValue('');
          setConditions([{ id: makeId(), kind: 'keywords_blacklist', value: 'comma,separated,keywords' }]);
          return;
        }
        case 'min_sources': {
          setScope('gate');
          setAction('require_review');
          setSeverity('warn');
          setEnabled(true);
          setActionValue('');
          setConditions([{ id: makeId(), kind: 'min_sources', value: '2' }]);
          return;
        }
        case 'dedup_ignore': {
          setScope('select');
          setAction('block');
          setSeverity('warn');
          setEnabled(true);
          setActionValue('');
          setConditions([{ id: makeId(), kind: 'duplicate_similarity_gt', value: '90' }]);
          return;
        }
      }
    },
    [makeId]
  );

  const handleAddCondition = React.useCallback(() => {
    const v = conditionDraftValue.trim();
    if (!v) return;
    setConditions((prev) => [...prev, { id: makeId(), kind: conditionDraftKind, value: v }]);
    setConditionDraftValue('');
  }, [conditionDraftKind, conditionDraftValue, makeId]);

  const handleSave = React.useCallback(() => {
    if (!canSave) return;

    onSave({
      id: Date.now(),
      scope,
      conditions,
      action,
      severity,
      enabled,
      actionValue: action === 'force_model' || action === 'priority' ? actionValue.trim() || undefined : undefined,
    });
  }, [action, actionValue, canSave, conditions, enabled, onSave, scope, severity]);

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
              Add Operational Rule (v2)
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
            <p className="text-body-small uppercase tracking-widest text-muted-foreground">Presets</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('policy_review')}
                className="px-3 py-2 rounded-xl border bg-background border-border text-body-small text-foreground hover:bg-surface shadow-neu-outset transition-colors"
              >
                Policy posts require manual review
              </button>
              <button
                type="button"
                onClick={() => applyPreset('block_keywords')}
                className="px-3 py-2 rounded-xl border bg-background border-border text-body-small text-foreground hover:bg-surface shadow-neu-outset transition-colors"
              >
                Block blacklisted keywords
              </button>
              <button
                type="button"
                onClick={() => applyPreset('min_sources')}
                className="px-3 py-2 rounded-xl border bg-background border-border text-body-small text-foreground hover:bg-surface shadow-neu-outset transition-colors"
              >
                Require ≥2 independent sources/citations
              </button>
              <button
                type="button"
                onClick={() => applyPreset('dedup_ignore')}
                className="px-3 py-2 rounded-xl border bg-background border-border text-body-small text-foreground hover:bg-surface shadow-neu-outset transition-colors"
              >
                If duplicate similarity &gt; 90% ignore
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-body-small text-muted-foreground uppercase tracking-widest" htmlFor="rule-scope">
                Scope
              </label>
              <select
                id="rule-scope"
                value={scope}
                onChange={(e) => setScope(e.target.value as OperationalRuleScope)}
                className="w-full appearance-none px-4 py-3 bg-background border border-border rounded-xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="select">select</option>
                <option value="research">research</option>
                <option value="draft">draft</option>
                <option value="gate">gate</option>
                <option value="schedule">schedule</option>
                <option value="publish">publish</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-body-small text-muted-foreground uppercase tracking-widest" htmlFor="rule-severity">
                Severity
              </label>
              <select
                id="rule-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as OperationalRuleSeverity)}
                className="w-full appearance-none px-4 py-3 bg-background border border-border rounded-xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="warn">warn</option>
                <option value="block">block</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-body-small text-muted-foreground uppercase tracking-widest" htmlFor="rule-action">
                Action
              </label>
              <select
                id="rule-action"
                value={action}
                onChange={(e) => setAction(e.target.value as OperationalRuleAction)}
                className="w-full appearance-none px-4 py-3 bg-background border border-border rounded-xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="require_review">require_review</option>
                <option value="block">block</option>
                <option value="allow">allow</option>
                <option value="force_model">force_model</option>
                <option value="priority">priority</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-body-small text-muted-foreground uppercase tracking-widest" htmlFor="rule-action-value">
                Action value (optional)
              </label>
              <input
                id="rule-action-value"
                type="text"
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                disabled={!(action === 'force_model' || action === 'priority')}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
                placeholder={action === 'force_model' ? 'e.g. gpt-4o-mini' : action === 'priority' ? 'e.g. high' : '—'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-body-small text-muted-foreground uppercase tracking-widest">Conditions</label>
              <span className="text-body-small text-muted-foreground">Simple builder (no DSL)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr_auto] gap-2 items-center">
              <select
                value={conditionDraftKind}
                onChange={(e) => setConditionDraftKind(e.target.value as OperationalRuleConditionKind)}
                className="w-full appearance-none px-3 py-2 bg-background border border-border rounded-lg text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
                aria-label="Condition kind"
              >
                <option value="category">category</option>
                <option value="keywords_blacklist">keywords_blacklist</option>
                <option value="min_sources">min_sources</option>
                <option value="duplicate_similarity_gt">duplicate_similarity_gt</option>
              </select>
              <input
                type="text"
                value={conditionDraftValue}
                onChange={(e) => setConditionDraftValue(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder={
                  conditionDraftKind === 'keywords_blacklist'
                    ? 'comma,separated,keywords'
                    : conditionDraftKind === 'min_sources'
                      ? '2'
                      : conditionDraftKind === 'duplicate_similarity_gt'
                        ? '90'
                        : 'policy'
                }
                aria-label="Condition value"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-4 py-2 rounded-lg text-body-small uppercase tracking-widest shadow-neu-outset bg-accent text-accent-foreground hover:opacity-95"
              >
                Add
              </button>
            </div>

            {conditions.length === 0 ? (
              <p className="text-body-small text-muted-foreground">No conditions yet (rule applies globally within its scope).</p>
            ) : (
              <div className="space-y-2">
                {conditions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-surface border border-border rounded-lg">
                    <div className="min-w-0">
                      <p className="text-body text-foreground truncate">{c.kind}</p>
                      <p className="text-body-small text-muted-foreground truncate">{c.value}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConditions((prev) => prev.filter((x) => x.id !== c.id))}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove condition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-background border border-border rounded-xl shadow-neu-inset space-y-1">
            <p className="text-body-small uppercase tracking-widest text-muted-foreground">What this does</p>
            <p className="text-body text-foreground leading-relaxed">{whatThisDoes}</p>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-body text-foreground">Enabled</p>
              <p className="text-body-small text-muted-foreground">Disabled rules remain visible but do not apply.</p>
            </div>
            <Toggle checked={enabled} onToggle={() => setEnabled((v) => !v)} />
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
