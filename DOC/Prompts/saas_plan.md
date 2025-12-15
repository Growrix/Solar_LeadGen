I am using vs code copilot AI models for building my saas web application. my pain points are : 

- The AI is not consistent most of the time.
- The AI often suggests code that does not align with my existing codebase or architecture.
- It do hardcoding most of the time instead of using existing theming system.
- It often suggests code that uses deprecated methods or libraries.
- While fixing issues, it sometimes introduces new bugs or breaks existing functionality. 
- It does not follow the coding standards and guidelines defined in my project.
- And there are a lot of other issues as well. 

***What I want:***
I want a comprehensive developer guidelines which will be a multiple sections document covering all the best practices, coding standards, architecture guidelines, theming system usage, testing protocols, deployment procedures, and maintenance routines for my saas web application. This document should serve as a definitive guide for both human developers and AI models like copilot to ensure consistency, quality, and alignment with the project's goals and standards.
The document should be structured in a way that is easy to navigate, with clear headings and subheadings for each section. Each section should provide detailed explanations, examples, and references to relevant resources or documentation. The guidelines should be practical and actionable, providing developers with clear instructions on how to implement best practices in their daily work.


- But I need a Index file and I will always refer that index file to get the relevant sections of the guidelines. The indes file may have tons of files directions. But it will be the mother file of all my massive guidelines. 
- But there should be a compact instruction on the top of the index : that instruction is to guide which files to read for which specific purposes. As the AI models has token usage limits , so giving it too much contexts is also not wise and the result is not that good. So, we need to handle it precisely. 
- I want it to follow all the best Industry Standard practices for the complete development. 
- My blueprint shold be like a master Brain of everything that a pro level senior web developer does. 
- There should be a minimal testing methods , so that the AI never gives any false information. e.g the AI most of the time give false information that , this issues are solved , but in real they are not. The live testing has the same issues even tried multiple fixing. 
- I need to create my own constitution file for any AI to follow . 
- my development stacks are now : next.js , react, prisma, docker db, postgreSQL, Typescript, Tailwindcss.
- I also need integration guidelines . e.g stripe, S3, trillo, pusher,  sendgrid , n8n etc. 


***The Goal*** I have explaied above about a lot of issues and areas just to give you an understanding of my thoughts. but the main goal is to control the AI 100% within my grip, guidelines, instructions. your Job is to Act as Pro Level Senior Saas web application developer who will create all the industry standard guidelines for a project from A to Z. first you can build a Index and then build all the .md files in a organized way. e.g Create frontend Folder/frontend files.md . each major sections should have its own foloder. So that the AI also can easy detect and read the necessary files, instead of reading the whole bunch of files and get halucinated. 

***before preparing the guidelines*** I need a plan tree to see it first and then will move furhter before focusing on each induvidual guidelines. 


---------------------------------------------------------------------------------------
You are the Documentation Generator for my SINGLE SaaS project.

Your job is to generate a full, professional, industry-grade documentation system.  
This documentation is intended for:
- Human developers  
- AI models (Copilot, ChatGPT, Claude)  
…so consistency and clarity are critical.

You MUST follow the rules below.

==============================================================
==  GLOBAL RULES (ABSOLUTELY REQUIRED)                      ==
==============================================================

1. ONLY generate what is inside the Documentation Tree.
2. NEVER invent tech stacks or libraries.
3. ALWAYS follow this tech stack:
     - Web: Next.js (App Router) + TypeScript + Tailwind CSS  
     - Backend: Node runtimes + PostgreSQL (Supabase)  
     - Auth: Supabase Auth  
     - Storage: Supabase Storage  
     - Payments: Stripe  
     - Testing: Vitest/Jest + Playwright + React Testing Library  
     - CI/CD: GitHub + Vercel  
4. No hardcoding. Always use theme tokens, config, env variables, and utilities.
5. All generated guidelines must be:
     - Actionable  
     - Opinionated  
     - Written like senior architects write internal engineering guides  
6. Use examples, folder paths, code snippets, diagrams, and checklists where useful.
7. Structure MUST MATCH the Documentation Tree exactly.
8. Every section must include:
     - What it is  
     - Why it matters  
     - Best practices  
     - Code examples  
     - Pitfalls / anti-patterns  
     - AI guidance: “How to ask Copilot for help for this section”  

==============================================================
==  BEGIN DOCUMENTATION TREE                               ==
==============================================================

📁 **/docs**

  📄 **00-Project-Overview.md**
      - Vision, goals, constraints  
      - Feature-set summary  
      - High-level architecture diagram  
      - Tech stack justification  

  📄 **01-Architecture-Guidelines.md**
      - Modular architecture principles  
      - Folder structure (app/, lib/, components/, server/, db/)  
      - Data flow  
      - API patterns  
      - Edge vs server vs client rendering  
      - Error boundaries + retries  
      - Supabase integration patterns  

  📄 **02-Coding-Standards.md**
      - TypeScript rules  
      - Naming conventions  
      - File structure conventions  
      - React component standards  
      - Server action rules  
      - Tailwind usage rules  
      - Never-hardcode rules  
      - Accessibility (WCAG 2.2 AA)  
      - Performance budgets  

  📄 **03-Theming-System.md**
      - Design tokens  
      - Colors, spacing, typography  
      - Component-level variants  
      - Dark mode rules  
      - How to use the theme in components  
      - Forbidden patterns (inline colors, arbitrary values unless necessary)  

  📄 **04-Database-Design.md**
      - Postgres schema conventions  
      - Naming rules  
      - Migrations rules  
      - RLS security  
      - Supabase schema best practices  
      - Example schema for a SaaS (users, orgs, roles, billing, audit logs)  

  📄 **05-API-&-Backend-Guidelines.md**
      - API shape  
      - Server actions best practices  
      - Error handling  
      - Input validation  
      - Rate limiting  
      - Logging  
      - Caching  

  📄 **06-Authentication-&-Authorization.md**
      - Supabase Auth rules  
      - Row-level security  
      - Permission models  
      - Organization/team structure  
      - Session strategy  
      - Protected routes patterns  

  📄 **07-Security-Guidelines.md**
      - OWASP checklist  
      - Data protection  
      - Secrets management  
      - Supabase security configuration  
      - Stripe PCI considerations  
      - XSS/CSRF prevention  
      - SSRF/Sqli prevention  
      - Secure headers  

  📄 **08-SEO-&-Performance.md**
      - Next.js metadata  
      - Robots, sitemap, OG tags  
      - Performance budgets  
      - Image optimization rules  
      - Core Web Vitals  
      - Lighthouse score targets  
      - Anti-patterns  

  📄 **09-UI/UX-Guidelines.md**
      - Component patterns  
      - Form design rules  
      - Layout grid rules  
      - a11y rules  
      - Loading states, skeletons  

  📄 **10-State-Management.md**
      - Server-first data strategy  
      - When to use React Query  
      - When to avoid client state  
      - Local state conventions  
      - Global store rules  

  📄 **11-Testing-Guidelines.md**
      - Unit testing  
      - Integration testing  
      - E2E testing with Playwright  
      - Coverage targets  
      - Mocking rules  
      - CI testing strategy  

  📄 **12-DevOps-&-CI-CD.md**
      - GitHub Actions  
      - Branching strategy  
      - PR guidelines  
      - Required checks  
      - Deployment to Vercel  
      - Monitoring build artifacts  

  📄 **13-Deployment-&-Environments.md**
      - Env variable rules  
      - Staging vs production  
      - DB migration workflow  
      - Rollback procedures  
      - Health checks  

  📄 **14-Logging-&-Monitoring.md**
      - Error tracking (Sentry)  
      - Observability rules  
      - Metrics to monitor  
      - Alerting standards  
      - Debugging practices  

  📄 **15-Stripe-Payments-&-Billing.md**
      - Subscription model  
      - Webhooks  
      - Tax handling  
      - Invoices  
      - Upgrades/downgrades  
      - Anti-fraud guidelines  

  📄 **16-AI-Coding-Guidelines.md**
      - How AI should generate code  
      - How AI should read project context  
      - AI “never do this” list  
      - AI test-before-suggest rules  
      - Task-specific prompt templates  

  📄 **17-Maintenance-&-Lifecycle.md**
      - Dependency upgrade rules  
      - Feature deprecation rules  
      - Refactor workflow  
      - Quarterly architecture review  

  📄 **18-Project-Glossary.md**
      - Definitions for all project concepts  
      - Naming decisions  
      - Abbreviation rules  

==============================================================
==  END OF TREE                                            ==
==============================================================

Now begin generating the documentation.
Generate **one file at a time**, following the tree from top to bottom.
Start with: `00-Project-Overview.md`


-------------------------------------------------------------------------------


***additionally*** most of the time I ask AI to do audit and fix issues. so I need to create a standard prompt for that as well. 
I need a standard prompt for audit and fixing issues. here is an example that i used recently, not the best one though. sometimes it miss some points. so you need to create a perfect prompt for audit and fixing issues. here is my recent prompt i used : 

***instructions***  Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested task and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

***strict rules*** while building new components never use hardcoded ui , no inline styles, only semantic classes from the global css. always test everything after making changes. do to attempt blindly if you dont have clear picture. never touch any backend or UX even. only work with the UI when you are build the UI. only semantic approach is allowed. never do partial/incomplete work. always complete the full task as per the plan. 

***What I Want*** a precised audit report generating prompt template for any future audits. This prompt should be very detailed and cover all the necessary steps to perform a thorough audit of both frontend and backend systems. The prompt should guide the AI to identify issues, gaps, and inconsistencies in the current implementation compared to the desired state. It should also outline the process for creating a comprehensive audit report, including specific sections to include, such as identified issues, root causes, recommended fixes, and an implementation plan. Additionally, the prompt should emphasize the importance of aligning with existing coding standards, theming systems, and project guidelines. Finally, it should instruct the AI on how to document the audit findings and create actionable tasks for implementation in a structured manner.

So that I need a Instruction for the audit and also a strict rules section to follow while doing the audit and fixing. 

you can refer any other files i have shared above for reference. 

***now re-generate the tree and the prompt once again including the audit prompt as well. *** 
