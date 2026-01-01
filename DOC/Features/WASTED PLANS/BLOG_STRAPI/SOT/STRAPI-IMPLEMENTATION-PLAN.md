---
description: "Step-by-step instructions and implementation plan for creating and integrating a separate Strapi project for BLOG_STRAPI."
---

# Strapi Implementation Plan (Separate Project)

## 1. Project Structure & Location
- Strapi will be created as a **separate project folder** (not inside your Next.js SaaS repo).
- Example structure:
  - `/solarmatch/` (your SaaS)
  - `/blog-strapi-cms/` (new Strapi project)

## 2. Next.js SaaS Setup (solarmatch)
1. Clone or set up your Next.js SaaS project (`solarmatch`).
2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```
3. Create a `.env.local` file in the root of `solarmatch` with at least:
   ```
   STRAPI_URL=http://localhost:1337
   STRAPI_TOKEN=your_strapi_token
   # Add any other required SaaS env vars here
   ```
4. (Optional) Set up Prisma/Postgres if your SaaS uses a database:
   - Configure `DATABASE_URL` in `.env.local`
   - Run `npx prisma generate` and `npx prisma migrate dev` as needed

## 3. Strapi Project Creation (Local Setup)
1. Go to your workspace root (not inside solarmatch).
2. Run:
   ```
   npx create-strapi-app@latest blog-strapi-cms --quickstart
   ```
3. Wait for Strapi to install and launch. Open http://localhost:1337/admin and create your admin user.

## 4. Content Model Setup
1. In Strapi Admin, create the following Collection Types:
   - **Post**: title, slug, excerpt, content, coverImage, publishedAt, seoTitle, seoDescription, category (relation), tags (relation)
   - **Category**: name, slug
   - **Tag**: name, slug
2. Set required fields and relations as per your SOT runbook.

## 5. API Token & Permissions
1. In Strapi Admin, go to Settings > API Tokens.
2. Create a new token (read-only for public content).
3. In Content-Type Builder, set public permissions for GET on Post, Category, Tag (or use token auth only).

## 6. Connect Strapi to SaaS (Next.js)
- In your Next.js backend/server utilities, use `process.env.STRAPI_URL` and `process.env.STRAPI_TOKEN` to fetch data from Strapi (never expose token to client).
- Example fetch utility:
  ```js
  // src/lib/blog/strapi.ts
  export async function getBlogPosts() {
    const res = await fetch(`${process.env.STRAPI_URL}/api/posts`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` },
    });
    return res.json();
  }
  ```
- Use fallback to local data if Strapi is unreachable.

## 7. Development Workflow
- Start Strapi (Docker or local):
  - `docker-compose up -d` in `/blog-strapi-cms/`
- Start Next.js SaaS:
  - `npm run dev` or `yarn dev` in `/solarmatch/`
- Both should run on different ports (e.g., 1337 for Strapi, 3000 for Next.js).
- Test integration by visiting `/blog` in your SaaS app.

## 8. Production Hosting
- **Option 1: Separate Subdomain**
  - Host Strapi at `cms.yoursite.com` and SaaS at `app.yoursite.com` or `yoursite.com`.
- **Option 2: Same Domain, Different Ports (for internal use)**
  - Use a reverse proxy (Nginx, Caddy) to route `/cms` to Strapi and `/` to SaaS.
  - Example: `yoursite.com/cms` → Strapi, `yoursite.com/` → SaaS.
  - Note: Strapi admin UI works best on its own subdomain, but API can be proxied.
- **Option 3: Docker Compose**
  - Use Docker Compose to run both services, expose on different ports or behind a proxy.

## 9. All-in-One Domain Option
- You can use a reverse proxy to serve both SaaS and Strapi from one domain:
  - `yoursite.com` → Next.js SaaS
  - `yoursite.com/cms` or `cms.yoursite.com` → Strapi
- For best UX and security, admin UI should be on a subdomain, but API can be proxied under the main domain.

## 10. Backup & Maintenance
- Regularly backup Strapi database (Postgres, SQLite, etc.).
- Keep Strapi and its plugins up to date.
- Secure admin panel (strong password, IP allowlist if possible).

## 11. E2E Summary Checklist
- [ ] Create Strapi project in a separate folder (Docker recommended)
- [ ] Set up Strapi content types and permissions
- [ ] Generate Strapi API token
- [ ] Set up Next.js SaaS project and install dependencies
- [ ] Add `.env.local` with STRAPI_URL and STRAPI_TOKEN to SaaS
- [ ] Implement Strapi fetch utilities in SaaS backend
- [ ] Run both projects in dev and prod
- [ ] (Optional) Set up reverse proxy for all-in-one domain
- [ ] Document and automate backup
- [ ] Test end-to-end: create a post in Strapi, verify it appears in SaaS blog

---

**Note:**
- This SOT is now a single source of truth for both Strapi and SaaS integration. Follow all steps in order for a working E2E setup.
- Never copy Strapi’s code into your SaaS repo. Always keep it as a separate service.
- For all-in-one domain, use a reverse proxy (Nginx, Caddy, etc.) to route traffic as needed.
- If you want a fully custom CMS, you can build your own backend, but you lose Strapi’s admin UI and ecosystem.

## Docker-Based Strapi Development Workflow (Recommended)

If you have Docker installed, you can run Strapi for development using Docker. This keeps your environment clean and makes it easy to reset or share with your team.

### 1. Create a Strapi Project Directory
- In your workspace (not inside your SaaS repo), create a new folder for Strapi:
  - Example: `/blog-strapi-cms/`

### 2. Add a docker-compose.yml File
- Inside `/blog-strapi-cms/`, create a `docker-compose.yml` file with the following content:

```yaml
version: '3'
services:
  strapi:
    image: strapi/strapi
    environment:
      DATABASE_CLIENT: sqlite
      DATABASE_FILENAME: /data/data.db
      # For Postgres, see Strapi docs for more env vars
    ports:
      - '1337:1337'
    volumes:
      - ./app:/srv/app
      - ./data:/data
```

### 3. Start Strapi with Docker Compose
- In the `/blog-strapi-cms/` folder, run:
  ```
  docker-compose up -d
  ```
- This will pull the Strapi image, create the necessary folders, and start Strapi at http://localhost:1337

### 4. First-Time Setup
- Open http://localhost:1337/admin in your browser and create your admin user.
- Proceed to set up content types and API tokens as described above.

### 5. Development Tips
- All Strapi project files will be in `/blog-strapi-cms/app/` (mounted from the container).
- Database (SQLite) will be in `/blog-strapi-cms/data/`.
- To stop Strapi: `docker-compose down`
- To reset: delete the `app/` and `data/` folders and restart.

### 6. Using Postgres (Optional)
- For production-like setup, you can use Postgres instead of SQLite. See Strapi docs for the required environment variables and service definitions in `docker-compose.yml`.

---

**Note:**
- Never copy Strapi’s code into your SaaS repo. Always keep it as a separate service.
- For all-in-one domain, use a reverse proxy (Nginx, Caddy, etc.) to route traffic as needed.
- If you want a fully custom CMS, you can build your own backend, but you lose Strapi’s admin UI and ecosystem.

# E2E Implementation Plan: Mirroring Strapi Blog Feature into Your SaaS (Custom Blog CMS)

This section describes how to replicate (“mirror”) Strapi’s blog features directly into your SaaS, so you own the CMS, admin UI, and API—no external Strapi service required.

## 1. What Does “Mirroring” Mean?
- You will **recreate** the blog content model, admin UI, and API endpoints that Strapi provides, but inside your own SaaS codebase.
- You do NOT run Strapi as a separate service; instead, you build equivalent features using your stack (e.g., Next.js + Prisma + React).

## 2. Pros and Cons
**Pros:**
- Single deployment, no extra hosting or domains
- Full control over features, UI, and data
- No vendor lock-in or external dependencies
- Easier to deeply integrate with your SaaS (users, AI, analytics, etc.)

**Cons:**
- More initial development work (admin UI, API, validation, media)
- You must maintain and update your CMS features
- No “out-of-the-box” admin UI like Strapi

## 3. E2E Mirroring Plan (Step-by-Step)

### Step 1: Analyze Strapi Blog Model
- Download Strapi repo or use the content model from your current Strapi instance.
- Document all fields for Post, Category, Tag (see below for starter schema).

### Step 2: Define Database Schema (Prisma Example)
```prisma
model Post {
  id           String   @id @default(uuid())
  title        String
  slug         String   @unique
  excerpt      String?
  content      String
  coverImage   String?
  publishedAt  DateTime?
  seoTitle     String?
  seoDescription String?
  category     Category? @relation(fields: [categoryId], references: [id])
  categoryId   String?
  tags         Tag[]    @relation("PostTags")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Category {
  id    String  @id @default(uuid())
  name  String
  slug  String  @unique
  posts Post[]
}

model Tag {
  id    String  @id @default(uuid())
  name  String
  slug  String  @unique
  posts Post[]  @relation("PostTags")
}
```

### Step 3: Build Admin UI
- Create admin pages in your SaaS for:
  - Listing, creating, editing, deleting Posts
  - Managing Categories and Tags
  - Uploading cover images (optional: use S3, local, or a service)
- Use your existing authentication/authorization for access control.

### Step 4: Build API Endpoints
- Create API routes for CRUD operations on Posts, Categories, Tags.
- Add validation, error handling, and pagination as needed.

### Step 5: Implement SEO Features
- Generate canonical URLs, meta tags, Open Graph, and structured data for each post.
- Add sitemap.xml and RSS feed endpoints.

### Step 6: Migrate Existing Content (Optional)
- Export posts, categories, and tags from Strapi (CSV, JSON, or API).
- Write a migration script to import data into your new schema.

### Step 7: Integrate AI Features (Optional)
- Add AI-powered suggestions, summaries, or auto-tagging in your admin UI or API.

### Step 8: Test E2E
- Create/edit posts in your new admin UI.
- Verify they appear on your public blog pages with correct SEO.
- Test all CRUD, search, and listing features.

### Step 9: Remove Strapi Dependency
- Once your mirrored CMS is live and data is migrated, decommission Strapi.

## 4. Mirroring Checklist
- [ ] Analyze and document Strapi blog model
- [ ] Define and migrate database schema
- [ ] Build admin UI for blog management
- [ ] Build API endpoints for blog data
- [ ] Implement SEO and public blog pages
- [ ] Migrate existing content
- [ ] Integrate AI features (optional)
- [ ] Test and launch

## 5. Discussion: Is This the Right Approach?
- **Best for:** Teams wanting full control, single deployment, and deep integration.
- **Not ideal for:** Teams needing rapid setup, advanced editorial workflows, or non-dev editors.
- **Tip:** Start with minimal features (just posts/tags/categories, basic admin UI) and iterate.

---

**You do NOT need to copy Strapi’s source code.**
- Use Strapi as a reference for your schema and features.
- Build your own implementation using your SaaS stack (Next.js, Prisma, React, etc.).
- This gives you a maintainable, integrated, and future-proof blog CMS.
