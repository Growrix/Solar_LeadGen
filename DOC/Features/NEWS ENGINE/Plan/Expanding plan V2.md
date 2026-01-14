


# News Engine Expansion Plan (2026, Clear & User-Friendly)
---

## Visual Findings & Fixes (2026-01-14)

### 1. Manual Editing & Content Formatting
- Add full manual editing for all posts: title, body, and tags can be edited at any time before publishing.
- The editor must support rich formatting (headings, bullet points, bold, italics, links, etc.) for better readability.
- Generated content should be auto-formatted for reader-friendliness (use h1/h2/h3, lists, etc. where appropriate).

### 2. Review Modal: Clarity & Functionality
- Audit every section of the review modal:
	- Only show features that are fully working and wired to the backend.
	- Remove or hide any UI elements that are not functional (e.g., SEO analysis, readability, plagiarism check) unless implemented.
	- Prefer to implement missing features if feasible; otherwise, remove to avoid confusion.
- Clearly label all sections and provide tooltips/help where needed.

### 3. AI Image Generation & Image URL Reliability
- Ensure AI image generation works reliably in the review modal (SEO & compliance section).
- Validate all fetched image URLs before displaying; show clear error or fallback if not working.
- Allow admins to manually re-check or replace images easily.

### 4. Research Summary & Model Profile Section
- The research/model profile section in the review modal must show all relevant sources (RSS, web, trends, social), not just RSS.
- Ensure backend wiring supports this and the UI reflects the true research provenance.

### 5. Deep Review Modal Audit
- Perform a full audit of the review modal for clarity, usability, and backend integration.
- Remove any dead or misleading UI, and ensure all actions and data are live and accurate.

---

This plan gives you a simple, step-by-step guide to build a powerful, easy-to-use News Engine. Every section is written for clarity and great UX for both admins and developers.

---

## 1. News Image Sourcing & Reliability

- For every news post, try to find a free, relevant image from the web (e.g., Unsplash, Pexels). If not found, use AI to generate one.
- The system checks for broken image links regularly and replaces them automatically if needed.
- **How to build:**
	- Start with one image provider (e.g., Unsplash). Add more later if needed.
	- Save where each image came from, who owns it, and when it was last checked.
	- Set up a background job to check all published images once a day.
	- In the admin UI, show image health clearly and let admins re-check or change images with one click.

---

## 2. Unified Research Center

- All research (RSS, web scraping, Google Trends, social) is managed as simple, named jobs.
- Each job has a clear purpose, schedule, and shows its last run, errors, and results.
- All research results are stored in one place, with clear fields: source, type, title, url, summary, tags, status, and when it was found.

**How it works:**
1. **Ingest:** Each job fetches new info from its source (e.g., RSS, Google Trends, web scraping).
2. **Normalize:** All results are saved in the same format, so they’re easy to search and use.
3. **Deduplicate:** The system automatically hides or merges duplicates (by url or title).
4. **Enrich:** Optionally, add AI-generated summaries or tags.
5. **Review:** If needed, an admin can review and approve research before it’s used.

**For Google Trends & Web Scraping:**
- Use official APIs or trusted libraries. Only scrape sites you have permission for. Always respect robots.txt.
- Save both the raw data and the cleaned-up version for transparency.

**Admin UI:**
- Create/edit jobs with a simple form: pick source, keywords, schedule, and where results go (news/blog).
- See job history, errors, and how many results each job found.
- Click “Run Now” or “Pause” for any job.
- Use dashboards to see what’s new, what’s in review, and what’s published.

---


## 3. Content Creation & Drafting

- Admins can create and fully edit content: AI can generate drafts from prompts (topic, keywords, audience, tone), but users can manually edit title, body, and tags before publishing.
- The editor supports rich formatting (headings, lists, bold, italics, links, etc.) for better readability.
- Keyword lists can be managed and reused for automated research and drafting.
- The system checks for rule violations and flags anything that needs review.
- Fact-checking and originality scoring can be added later—show “pending” if not ready.

**How to build:**
	- Content Studio UI: Simple form for all needed fields, with a rich text editor and live preview.
	- “Save as Draft” links the draft to its research source for full traceability.
	- Show any compliance or originality flags clearly.
	- Ensure generated content is auto-formatted for readability (use headings, lists, etc.).

---

## 4. Automation & Scheduling

- All automation (research, drafting, publishing) is handled by a built-in runner. n8n can be added as a helper if needed, but is not required.
- Scheduling is flexible: admins can set priority, expiry, featured, recurring, or batch publish with just a few clicks.

**How to build:**
	- Keep the internal runner as the main engine. n8n is optional and can be turned on/off in settings.
	- In the schedule modal, make recurring and batch options easy to find and use.
	- The system should never publish the same item twice.

---


## 5. UI/UX & Analytics

- All controls and dashboards show real, live data—no placeholders.
- Dashboards make it easy to see research progress, content pipeline, and analytics (performance, accuracy, engagement).
- Audit logs record every action, with filters and CSV export for easy review.
- The review modal is always clear, only shows working features, and is fully wired to the backend.

**How to build:**
	- Dashboards: Show research backlog, drafts, scheduled, published, and errors in a clear, visual way.
	- Audit logs: Let users filter by who did what, when, and export results easily.
	- Review modal: Only display sections that are fully functional; remove or implement any non-working UI. Clearly label all sections and provide help/tooltips as needed.
	- Ensure research/model profile section shows all sources, not just RSS.
	- AI image generation and image URL validation must be reliable and user-friendly.

---

## 6. Operational Hardening

- The system is safe and reliable by default. All migrations, secrets, and health checks are enforced.
- If something fails (e.g., a job or runner), admins get a clear alert (email or dashboard notification).

**How to build:**
	- Health endpoints: Show last success/error for every job and runner.
	- Alerts: Let admins pick how they want to be notified (email, dashboard, etc.).

---

## 7. E2E Implementation Steps

1. **Database:**
	 - Add/extend tables for research, jobs, runs, keywords, news items, and audit logs.
	 - Make sure every record has clear fields for source, type, status, tags, and history.
2. **Backend:**
	 - Build simple, modular job runners for each source type.
	 - Add endpoints for job management, research results, content creation, image checks, and health.
3. **Frontend:**
	 - Build clean, simple UIs for research jobs, content studio, review, scheduling, dashboards, and logs.
	 - Make every action easy to find and use—no hidden features.
4. **Automation:**
	 - Internal runner is always on. n8n is optional and can be enabled in settings.
	 - Document what happens if both are enabled (internal runner takes priority).
5. **Verification:**
	 - Run typecheck, build, and DB validation on every change.
	 - Manual QA: Test the full flow—research → select → draft → schedule → publish.
	 - Simulate failures to make sure alerts work.

---

*Prepared: 2026-01-14 — Clear, user-friendly expansion plan for a robust, operator-ready News Engine.*
