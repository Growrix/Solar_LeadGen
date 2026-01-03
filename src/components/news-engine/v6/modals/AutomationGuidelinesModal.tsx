'use client';

import React from 'react';
import { ModalShell } from '../shared';

type Props = {
  onClose: () => void;
};

export function AutomationGuidelinesModal({ onClose }: Props) {
  return (
    <ModalShell title="Automation Guidelines" description="These controls are UI-only and require manual review." onClose={onClose}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-heading-3 text-foreground">Manual approval is required</h3>
          <p className="text-body text-muted-foreground leading-relaxed">
            AI-generated drafts should be reviewed for accuracy, tone, and compliance before publishing. Automation can
            assist with drafting and scheduling, but it does not replace editorial oversight.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-heading-3 text-foreground">What these toggles do</h3>
          <ul className="list-disc pl-5 text-body text-muted-foreground space-y-2">
            <li>Auto-Research &amp; Draft: simulates creating drafts when new sources appear.</li>
            <li>Auto-Schedule: simulates adding reviewed items to a schedule queue.</li>
            <li>Auto-Publish: remains disabled by default; publishing should be a deliberate, manual action.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-background p-4 shadow-neu-inset">
          <p className="text-body-small text-muted-foreground">
            Tip: Use the Audit Logs tab to track system actions and understand why something changed.
          </p>
        </div>
      </div>
    </ModalShell>
  );
}
