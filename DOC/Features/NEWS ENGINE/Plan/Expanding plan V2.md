# News Engine Expansion Plan (2026)

This document outlines the brief, actionable expansion plan for the News Engine feature. It is designed for clarity and direct implementation by any AI or developer.

---

## 1. News Image Sourcing & Reliability
- Use free, relevant images from the internet for each news post; fallback to AI-generated images if none found.
- Regularly check for broken image links and automatically replace with the news URL or an AI-generated image if needed.

## 2. Unified Research Center
- Aggregate research from RSS, web scraping, search engines, Google Trends, and social media APIs.
- Support both manual (prompt-based) and automated (keyword-list) research jobs.
- Store all research in a single, unified center and distribute to News and Blog pipelines as needed.

## 3. Advanced AI Content Generation
- Provide a UI for admins to prompt AI with topic, keywords, audience, and tone.
- Allow creation and management of keyword lists for automated research and content generation.
- Enforce strict admin-defined rules for research and drafting; flag violations for review.
- Integrate fact-checking and originality scoring (AI or external APIs); support human review for sensitive content.

## 4. Automation & Scheduling
- Integrate n8n for workflow automation (research, AI, publishing, notifications).
- Fully support all scheduling options (priority, expiry, featured, recurring, batch publishing).

## 5. UI/UX & Analytics
- Ensure all UI controls are wired to real data.
- Provide dashboards for research coverage, content pipeline, and analytics (performance, accuracy, engagement).
- Expand audit logs to capture all actions with full actor identity; support CSV export and advanced filtering.

## 6. Operational Hardening
- Enforce DB migrations, key vault, and cron secret setup at deployment.
- Add system health checks and alerting for automation or research failures.

---

*Prepared: 2026-01-12 — Brief expansion plan for direct implementation.*
