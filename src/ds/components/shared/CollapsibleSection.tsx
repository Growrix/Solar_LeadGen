"use client";

import * as React from "react";

import { Accordion, AccordionItem } from "./Accordion";

export type CollapsibleSectionProps = {
  /** Stable id for the internal accordion item. */
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
  /** Whether the section is open by default. */
  defaultOpen?: boolean;
  className?: string;
};

/**
 * Collapsible section wrapper (single-item accordion).
 * Uses existing DS accordion behavior + token-driven styling.
 */
export function CollapsibleSection({ id, title, children, defaultOpen, className }: CollapsibleSectionProps) {
  return (
    <Accordion type="single" defaultValue={defaultOpen ? id : undefined} className={className}>
      <AccordionItem value={id} title={title}>
        {children}
      </AccordionItem>
    </Accordion>
  );
}
