# Research – Quote Builder Modal Enhancement (Existing)

Resolved clarifications and design decisions sourced from:
- DOC/Features/Quote Builder Modal/QUOTE-BUILDER-IMPROVEMENT-PLAN.md
- DOC/Features/Quote Builder Modal/Main Plan/ChatGPT_CalculationLogic.md
- DOC/Features/Quote Builder Modal/Main Plan/ChatGPT_research.md
- DOC/Guidelines/AI-IMPLEMENTATION-GUIDELINES.md

## Decisions

### FiT escalation (FR-011)
- Decision: Feed-in Tariff remains flat unless explicitly configured per lead.
- Rationale: Many AU retailers keep FiT stable; escalation conflates retail price impacts with export compensation.
- Alternatives: Escalate with retail price; Rejected due to overestimation risk.

### VIC interest-free loan presentation (FR-012)
- Decision: Display VIC interest-free loan as financing information only; do not deduct from Total.
- Rationale: Loans affect cash flow, not contract price; prevents misleading “discounted” totals.
- Alternatives: Deduct from Total; Rejected to maintain pricing integrity.

### Default assumptions source (FR-013)
- Decision: Use defaults from QUOTE-BUILDER-IMPROVEMENT-PLAN.md; allow per-lead override.
- Rationale: Keeps consistency across proposals while enabling case-by-case customization.
- Alternatives: Global fixed defaults; Rejected due to variability across leads.

## Best Practices & Patterns
- Single calculator module: one source of truth for totals and ROI.
- Multi-option management: snapshot assumptions per option to ensure consistent recompute.
- Compliance validation: inline errors per artefact; block submit until resolved.
- Autosave drafts: persist per lead ID + option set; restore fully.

## Unknowns – Resolved
- None pending. All NEEDS CLARIFICATION items addressed above.
