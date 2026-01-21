
---
**Post-Feature Test & Documentation Prompt**

After E2E implementation and audit, follow these steps:

1. Use the audit prompt at:
	DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md
	to perform a full post-implementation feature audit.

2. Prepare the final user guide, tooltips, functionality map, and checklist using the template at:
	DOC/PROMPTS/PROMPTS & TEMPLATES/POST FEATURE/feature-post-implementation-doc-template.md

	**Documentation completeness requirement (mandatory):**
	- Document the feature **section-by-section** for every main tab/section in the UI.
	- For each tab/section, explain **what it does**, **why it exists**, **who uses it**, and **how it impacts the system end-to-end**.
	- Cover the template’s key concepts (e.g., routing/automation, configuration profiles, secret/key handling, review/provenance), plus:
	  - Typical E2E flows (input → processing → output/publish equivalent)
	  - How to know the system is working end-to-end
	  - Common errors/blockers and exact resolution steps
	  - Limitations/edge cases and what to verify after each release

3. Prepare the documentation in:
	DOC\FEATURES\NEWS ENGINE\POST FEATURE
   
This ensures the feature is fully tested, documented, and ready for production.
