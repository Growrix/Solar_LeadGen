You are an expert developer integrating n8n Community Edition into a SaaS project.

**My stack:**
- Frontend: React (Next.js, TypeScript)
- Backend: Node.js (TypeScript)
- Database: PostgreSQL

**Goal:**
Integrate the free n8n Community Edition as a backend workflow automation engine for my SaaS. Do NOT embed the n8n UI/editor for end users (to avoid paid licenses). Instead, trigger n8n workflows via webhooks or API calls from backend code only.

**Instructions:**
- Automate the entire integration step-by-step, generating all code, config, and instructions for use in VS Code.
- Use TypeScript for all backend code.
- PostgreSQL should be used for n8n persistence.
- If anything needs manual input, prompt me clearly.

**Steps to cover:**
1. **Install n8n Community Edition** (preferably locally via npm, with Docker setup for production notes).
2. **Project Structure:**
	- Integrate n8n into a /n8n or /backend/n8n subfolder.
	- Configure PostgreSQL for n8n (env vars, .env file).
	- Set up basic auth for n8n dashboard.
3. **VS Code Setup:**
	- List recommended extensions (Node.js, Docker, n8n utils if available).
	- Provide commands to run n8n locally and access dashboard (http://localhost:5678).
4. **Integration:**
	- Show how to create a sample workflow in n8n (e.g., onboarding email).
	- Provide a TypeScript code snippet (using axios/fetch) to trigger an n8n webhook from a Next.js API route.
	- Handle responses and errors securely.
	- Ensure n8n is backend-only (no user-facing UI).
5. **Testing & Debugging:**
	- Commands to start/stop n8n in VS Code terminal.
	- How to debug n8n custom nodes if needed.
	- Test end-to-end: Next.js API → n8n webhook → workflow runs.
6. **Production Notes:**
	- Brief on deploying n8n (e.g., Railway, Vercel, DigitalOcean) with Docker.
	- Ensure free tier compliance (no multi-tenant UI embedding).

**Format:**
- Generate all code/files as suggestions I can accept via Copilot.
- Be explicit and step-by-step.

Start now!
