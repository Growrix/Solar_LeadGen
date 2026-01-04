# Product Requirements Document (PRD) — SolarMatch SaaS Platform

---

## 1. Next Steps & Execution
- Review and refine feature list with stakeholders
- Audit current codebase before each implementation
- Enhance each feature with detailed specs and user stories
- Build iteratively, validating with real users after each release
- Reference `LEAD_MANAGEMENT.md` for lead journey logic

---

## 2. Future Scalability & Expansion
- Multi-region/timezone/currency/language support
- White-label/partner portals for B2B
- Public API for CRM/Zapier integrations
- Mobile app (PWA, native)
- AI-powered lead scoring, chatbots, and insights

---

## 3. Risks & Blockers
- Payment integration delays (Stripe approval)
- Email deliverability (spam, domain setup)
- Data privacy compliance (GDPR, local laws)
- Lead quality/verification (fraud prevention)
- Scalability for high lead volume

---

## 4. Quick Wins
- Add trust badges/testimonials to homepage
- Implement FAQ accordion for SEO
- Admin bulk actions (delete/export)
- Profile picture upload (Cloudinary)
- Newsletter double opt-in

---

## 5. MVP Checklist
1. Role-based auth (Homeowner, Installer, Admin)
2. Lead form (Homeowner submits, instant quote, then request installer quote)
3. Lead management (full lifecycle, admin/installer/homeowner dashboards)
4. Lead marketplace (Installer views, purchase, track leads)
5. Quote creation (Installer submits, admin approval for written quotes)
6. Basic admin dashboard (manage users, leads, audit trail)
7. Email notifications (on lead updates, purchases, messages)
8. Stripe payment for “Reveal Lead”
9. Clean responsive UI (Next.js + Tailwind)
10. Onboarding flows for all roles
11. GDPR & accessibility compliance

---

## 6. Tech + Dev Layer
- Frontend: Next.js + Tailwind CSS
- Backend: Next.js API Routes + Prisma/PostgreSQL
- Realtime: Socket.io / Pusher
- File Storage: AWS S3 / Cloudinary
- Payments: Stripe SDK
- Deployment: Vercel
- Email: Resend / SendGrid
- CMS: Sanity / Notion / Markdown
- Analytics: PostHog / Google Analytics

---

## 7. Marketing & Growth
- Landing Page (hero, benefits, testimonials)
- SEO Optimization
- Blog / Resource Hub (AI generated, auto SEO, admin approval)
- Referral Program
- Email Capture / Newsletter

---

## 8. Security & Compliance
- JWT Auth / NextAuth.js
- Rate Limiting
- Data Encryption
- Privacy & Terms Pages
- Audit Trail (all lead/user actions)
- Verification (OTP for phone, docs for installers)
- GDPR Compliance (data export, right to be forgotten)
- Accessibility (WCAG 2.1 AA, keyboard navigation, screen reader support)

---

## 9. Billing & Payments
- Stripe Integration (subscriptions, lead purchases)
- Invoice & Receipts (PDF)
- Transaction History
- Admin can refund, adjust, or override payments for leads

---

## 10. Communication Layer
- In-App Chat (real-time messaging, tracked for admin)
- Email Notifications (triggered on events, lead status, purchase, messages)
- Push Notifications (optional)

---

## 11. Admin Features
- Secure Hidden Login (admin portal)
- User Management (CRUD, suspend, hold, verify, delete)
- Lead Management (full pipeline, auto/manual approval, assign, price control, resell, archive, audit trail)
- Quote & Deal Tracking (all quotes, written quote approval, deal status)
- Revenue Dashboard
- Blog / CMS System
- System Settings & Toggles (lead caps, pricing, verification requirements)
- Support Chat System
- Audit Logs / Activity History (all lead/user actions)
- Analytics & Reporting (lead flow, conversion, installer/homeowner engagement)
- Notification Management (all roles)

---

## 12. Installer Features
- Lead Marketplace (browse, filter, purchase leads; only verified installers unless admin override)
- Dual Access Options (reveal now, quote now)
- Smart Quote Builder (pricing, attachments)
- Quote Status Control (draft, submitted, negotiation)
- Chat System (with homeowners after purchase)
- Analytics / Insights (win rate, ROI, lead quality feedback)
- Subscription / Credit System
- Payment Gateway Integration (Stripe)
- Profile & Verification (certifications, company info, OTP verification)
- Reviews Management
- Purchased Leads Dashboard (track all purchased leads, status, chat, quote history)

---

## 13. Homeowner Features
- Lead Submission Form (step-based, property & budget info)
- Lead Tracking Dashboard (status, installer responses, full lead history)
- Quote Comparison (multi-installer offers)
- Messaging / Chat with Installers (after lead purchase)
- Lead Status Updates (full lifecycle, real-time)
- Notifications (email + in-app)
- Profile / Preferences
- Reviews & Ratings (for installers)

---

## 14. Lead Management & Journey (All Roles)
- Lead Journey: Homeowners submit instant quote, then request Call/Visit or Written Quote from installer
- Homeowner can request up to 5 quotes (admin can grant more)
- Homeowner must verify phone via OTP for "Verified Homeowner" badge (unlocks more requests)
- Lead status: New, Pending, In Progress, Deal Closed, Void, No Response (full lifecycle tracked)
- Homeowner contact details hidden until lead is purchased (Call/Visit)
- After purchase, internal chat and quote exchange enabled (privacy & traceability)
- Admin dashboard: full lead pipeline, auto/manual approval, price control (global & per-lead), assign to installers, resell, archive
- Admin can set lead as "hot", assign to specific installers, or make available to all
- Admin can monitor all chats, quotes, and lead actions (full audit trail)
- Installer must verify account (OTP, docs) to access/purchase leads (admin can override)
- Purchased leads tracked in installer dashboard, with full quote/lead data
- Installer can chat and submit quotes after purchase; all actions logged
- Written quotes: installer submits for admin review before homeowner sees
- All actions (creation, purchase, chat, status) logged and visible to relevant roles
- Verification status (homeowner/installer) always displayed
- Admin can suspend/hold/verify any account
- Notifications for all key actions (purchase, quote, message, status change)
- Lead lifecycle ends only when admin archives

---

## 15. Core SaaS Structure (Universal Essentials)
- Authentication System (email/password, OAuth, password reset)
- Role-Based Access Control (Homeowner, Installer, Admin)
- User Dashboard (personalized for each role)
- Database (users, leads, quotes, payments, messages)
- API Layer (Next.js API routes)
- Responsive UI / Theme (mobile, dark mode)
- Notifications System (email, in-app)
- Settings & Profile Management

---

## 16. Onboarding Flows (All Roles)
- Homeowner: Welcome tour, instant quote intro, phone/email verification, dashboard walkthrough
- Installer: Guided signup, document/OTP verification, profile completion, lead access intro
- Admin: Secure login, dashboard overview, quick actions guide

---

## 17. Vision & Goals
- Build the most trusted, efficient, and scalable solar lead generation platform for homeowners, installers, and admins
- Deliver a seamless, transparent, and secure experience for all users
- Enable rapid growth, automation, and future expansion (AI, mobile, API, white-label)

---

## 18. Success Metrics
- Time to first lead submission (homeowner onboarding speed)
- Lead-to-quote conversion rate
- Installer purchase-to-deal close rate
- Admin intervention rate (manual vs. auto-approved leads)
- User retention (repeat logins, active users)
- NPS (Net Promoter Score) from all roles
- Platform uptime and error rate
- Compliance audit pass rate (GDPR, accessibility)

---

## 19. Stakeholders
- Founders/Product Owners
- Engineering Team
- Design/UI/UX Team
- Marketing & Growth
- Customer Support
- Legal/Compliance
- End Users: Homeowners, Installers, Admins

---

## 20. Appendix & References
- See `BRAINSTORM_SHORT.md` and `LEAD_MANAGEMENT.md` for full feature breakdowns and logic
- Competitive analysis: EnergySage, SolarQuotes, other SaaS lead gen platforms
- Tech stack docs: Next.js, Prisma, Stripe, Tailwind, etc.

---

# End of PRD
