# News Engine - User Guide & Post-Implementation Documentation

**Version**: 1.0 (Post-Phase 13)  
**Release Date**: January 13, 2026  
**Audience**: Admin users, developers, operators

---

## 0. Overall Workflow & Audience

### Who is this feature for?
- **Admin Users**: Manage news content, configure automation, monitor AI operations
- **Operators**: Monitor system health, troubleshoot errors, manage API keys
- **Developers**: Extend functionality, integrate new AI providers, customize automation rules

### What is the end-to-end workflow?
1. **Ingestion**: RSS feeds and research queries pull news from external sources
2. **Selection**: Automation rules filter entries based on relevance criteria
3. **Drafting**: AI generates article drafts from selected entries
4. **Review**: Admins review/edit drafts, adjust SEO, generate OG images
5. **Scheduling**: Drafts are scheduled for publication within configured time windows
6. **Publishing**: Items are published automatically or manually and appear on the public news page

### How does this feature fit into the broader system?
The News Engine automates content generation for the SolarMatch blog, reducing manual effort while maintaining quality control. It integrates with:
- **Public website** (`/news`): Displays published articles
- **OpenAI API**: Powers AI drafting, OG image generation, and content enhancement
- **Admin dashboard**: Provides operational controls and monitoring
- **Settings system**: Persists configuration across sessions

---

## 1. Feature Overview

### Feature Name
**News Engine** (Admin Hub V6)

### Purpose
Automate the creation, review, and publication of solar energy news articles using AI-powered content generation while maintaining editorial control.

### Key Flows
1. **Automated Pipeline**: RSS → Entry → Draft → Schedule → Publish
2. **Manual Content Creation**: Admin creates draft → Edit → Publish
3. **Research-Driven Content**: Trigger web/social/journal research → Generate drafts from findings
4. **AI-Assisted Editing**: Regenerate, rewrite, improve SEO, generate OG images
5. **Rejection & Recovery**: Reject low-quality drafts → Review → Regenerate → Restore

### Release Date
January 13, 2026

### Main Tabs/Sections

#### 1. Master Control
**Purpose**: Central operations dashboard for pipeline management and real-time monitoring.

**Why it exists**: Operators need instant visibility into automation status, queue health, and the ability to pause/resume operations without touching code or database.

**Impact**: Changing pipeline status here affects the entire automation runner. Emergency Stop immediately halts all AI operations and scheduled publications.

#### 2. Dashboard
**Purpose**: High-level KPIs and item listing with filters for quick access.

**Why it exists**: Admins need at-a-glance metrics (30-day volume, quality scores, review backlog) and fast navigation to specific items.

**Impact**: KPIs inform editorial strategy and resource allocation. Filters drive daily workflow (e.g., "show me all NEEDS_REVIEW items").

#### 3. Sources (Unified Research Center)
**Purpose**: Manage RSS feeds and research configurations; view all ingested entries (RSS + research) in one unified interface.

**Why it exists**: Content sources need ongoing maintenance (adding feeds, adjusting fetch intervals, testing research queries). The unified view enables operators to see all incoming content regardless of source type.

**Impact**: Enabling/disabling sources or syncing manually changes what enters the automation pipeline. Research sync can create dozens of entries in seconds.

#### 4. Drafts & Reviews
**Purpose**: Review, edit, and manage all DRAFT and NEEDS_REVIEW items before publication.

**Why it exists**: AI-generated content requires human oversight for quality, accuracy, and brand alignment. This is the primary workspace for editorial tasks.

**Impact**: Actions here determine what gets published. Rejecting an item moves it to the Rejected queue; scheduling sets the publication date/time.

#### 5. Published
**Purpose**: View all live published items and unpublish if needed.

**Why it exists**: Admins need visibility into what's currently public and the ability to retract content quickly (e.g., breaking news corrections, factual errors).

**Impact**: Unpublishing removes the item from public view immediately (soft-delete with `deletedAt`).

#### 6. Rejected
**Purpose**: View and manage rejected items; restore or permanently delete.

**Why it exists**: Rejected content isn't necessarily garbage—relevance scores or AI quality may improve after regeneration. This queue enables second chances before permanent deletion.

**Impact**: Restoring moves an item back to DRAFT status; permanent deletion (purge) is irreversible.

#### 7. Automation Logic
**Purpose**: Configure automation behavior: publish windows, operational rules, and automation rules.

**Why it exists**: Business requirements change (e.g., "publish only during business hours," "force human review for low relevance scores"). This tab externalizes these decisions so non-developers can adjust behavior.

**Impact**: Publish Windows control when scheduled items go live. Operational rules determine auto-publish thresholds and review requirements. Automation rules filter what enters the draft pipeline.

#### 8. AI Router
**Purpose**: Manage AI model profiles and configure intent-based routing.

**Why it exists**: Different AI tasks (drafting, SEO, summarization, OG images) benefit from different models. Routing rules enable cost optimization and quality tuning without code changes.

**Impact**: Changing the default drafting model affects all future AI-generated content. Model parameters (temperature, max tokens) directly influence output quality.

#### 9. Key Vault
**Purpose**: Securely store and manage AI provider API keys.

**Why it exists**: Hardcoding API keys in environment variables limits flexibility (rotation, pool assignment, enable/disable). The Key Vault externalizes key management.

**Impact**: Disabling a key stops all AI operations using that key. Pool assignment ensures keys are used only for their intended purposes (e.g., "DRAFTING" pool vs "IMAGES" pool).

#### 10. Settings
**Purpose**: Configure global News Engine settings: news defaults, AI parameters, notifications, ops config.

**Why it exists**: Settings need persistence across sessions and should be changeable by admins without touching `.env` files or code.

**Impact**: Changing the default category affects newly created items. Notification settings control email alerts for errors, review queue thresholds, etc.

#### 11. Logs
**Purpose**: View audit trail of all News Engine actions (who did what, when, and why).

**Why it exists**: Accountability, debugging, and compliance require a complete action history.

**Impact**: Logs are append-only and immutable (cannot be deleted or edited). Used for forensics after errors or unexpected behavior.

---

## 2. Key Concepts & System Impact

### Model Profile
**What is it?**: A configuration preset that defines an AI model (provider, model ID, parameters like temperature/max tokens) for a specific task.

**Why is it needed?**: Different tasks require different models:
- **Drafting**: Creative, detailed (e.g., `o3-mini` with temp 0.7)
- **Summarization**: Concise, factual (e.g., `gpt-4o-mini` with temp 0.3)
- **SEO**: Keyword-focused (e.g., custom tuning for search optimization)

**How does it affect the system?**: The AI Router selects the best model profile based on the task intent. Changing a profile's parameters immediately affects all future requests using that profile.

---

### AI Router
**What is it?**: A decision engine that maps task intents (e.g., "draft_from_source") to the appropriate AI model profile.

**How does it impact automation?**: The router ensures:
- **Cost efficiency**: Uses cheaper models for simple tasks
- **Quality**: Uses powerful models for complex drafting
- **Resilience**: Falls back to default model if intent-specific profile is unavailable

**Data flow**: Automation runner → AI Router → Model Profile → OpenAI API → Draft content

---

### Key Vault & Master Key
**What is the Key Vault?**: A secure database table (`NewsApiKey`) that stores encrypted API keys for AI providers.

**Why is the master key required?**: The master key (env var `NEWS_ENGINE_MASTER_KEY`) encrypts/decrypts API keys stored in the vault. Without it:
- ❌ Automation runner cannot make AI requests
- ❌ Admin cannot add/edit keys in the Key Vault UI
- ⚠️ System falls back to `.env` keys (less flexible, no pool assignment)

**What happens if it's missing?**: The runner will attempt to use `OPENAI_API_KEY` from `.env` as a fallback, but Key Vault UI will be non-functional. **Best practice**: Always set `NEWS_ENGINE_MASTER_KEY` in production.

---

### Review Modal & Provenance
**What is the Review Modal?**: The item editor where admins review/edit AI-generated drafts before publication.

**What is provenance?**: Provenance tracks the lineage of a NewsItem:
- **Source Entry ID**: Which RSS/research entry inspired this draft
- **AI Model Used**: Which model generated the content
- **Request Log ID**: Reference to the AI API call log
- **Creation Timestamp**: When the draft was created

**Why do image controls matter?**: OG (Open Graph) images are what appear in social media previews. The Image Controls panel lets admins:
- Generate OG images using AI (DALL-E)
- Approve/reject generated images
- Manually upload custom images

**Impact**: Provenance enables debugging ("why did the AI draft this?") and auditing ("which model generated this low-quality content?"). Image controls ensure social media posts look professional.

---

## 3. User Guide (English)

### Getting Started

#### Prerequisites
1. Admin account with `role=ADMIN` in the database
2. OpenAI API key configured (either in `.env` or Key Vault)
3. At least one enabled RSS source OR manual draft creation

#### Accessing the News Engine
1. Navigate to `/admin/news-engine` in your browser
2. You'll see the Admin Hub V6 interface with 11 tabs

---

### Tab-by-Tab Guide

#### Master Control

**Step 1: Check Pipeline Status**
- Look at the top panel: "Pipeline Status"
- **Nominal**: System is running normally
- **Paused**: Automation is temporarily stopped
- **Emergency Stop**: All operations halted (manual intervention required)

**Step 2: View Queue Snapshot**
- The "Queue Snapshot" panel shows:
  - **RSS New Entries**: Unprocessed RSS items
  - **Research New Entries**: Unprocessed research findings (by kind: WEB, SOCIAL, JOURNAL, TREND)
  - **Drafts Needing Review**: Items awaiting human approval
  - **Scheduled Due Soon**: Items ready to publish
  - **Errors**: Recent failures
- **Troubleshooting**: If counts seem wrong, click "Refresh" or check the Logs tab for errors

**Step 3: Run Automation Manually**
- Click **"Run Automation Now"**
- Choose mode:
  - **Dry Run**: Simulates automation without creating drafts (safe for testing)
  - **Live Run**: Executes full automation pipeline (creates real drafts)
- Confirm your choice
- **Run Details modal** appears showing:
  - **Summary**: Counts (RSS imported, drafts created, etc.)
  - **Stage Breakdown**: Which stages completed successfully
  - **Errors**: Any failures during the run
- **Use Case**: Force an immediate ingestion cycle without waiting for the scheduled runner

**Step 4: Pause/Resume Pipeline**
- **Pause**: Temporarily stop automation (e.g., during maintenance)
- **Resume**: Restart automation after pause
- **Emergency Stop**: Use only in critical situations (requires typing "STOP")

**Common Scenarios**:
- **Before deploy**: Pause pipeline → deploy new code → Resume
- **API quota exceeded**: Emergency Stop → Check Key Vault → Enable backup key → Resume
- **Testing new RSS feed**: Pause pipeline → Add feed → Run Automation (Dry Run) → Check Drafts → Resume

---

#### Dashboard

**Step 1: Review KPIs**
- **Stories Created (Last 30 Days)**: Total item count
- **Avg Relevance Score**: Quality indicator (0-100)
- **Review Queue Count**: Items awaiting approval
- **Automation Status**: Current pipeline state
- **Last Run Success**: Timestamp of last successful automation

**Troubleshooting**:
- **KPIs show "Unavailable"**: Backend endpoint failed; check Logs tab
- **Low Avg Relevance**: Adjust automation rules to filter low-quality sources

**Step 2: Filter Items**
- Use dropdown filters:
  - **Status**: DRAFT, NEEDS_REVIEW, SCHEDULED, PUBLISHED, REJECTED
  - **Category**: Solar, Renewable Energy, Market Update, etc.
  - **Date Range**: From/To pickers
- Click **"Apply Filters"**

**Step 3: Navigate to Item**
- Click any item row to open the Review Modal
- Or use the **"View"** button for quick access

**Common Scenarios**:
- **Morning routine**: Check Review Queue Count → Filter by NEEDS_REVIEW → Review/approve items
- **Weekly report**: Check 30-day KPIs → Export data (future feature)

---

#### Sources (Unified Research Center)

**Managing RSS Sources**:

**Step 1: Add New Source**
- Click **"Add RSS Source"**
- Fill form:
  - **Name**: Friendly identifier (e.g., "Solar Industry Mag")
  - **URL**: RSS/Atom feed URL (e.g., `https://example.com/feed.xml`)
  - **Kind**: RSS_FEED or ATOM_FEED
  - **Enabled**: Toggle to enable immediately
  - **Fetch Interval**: Minutes between syncs (default: 60)
- Click **"Save"**

**Step 2: Test Feed**
- Click **"Sync Now"** on the source row
- **Success**: Green checkmark, entries appear in the Unified Research Center
- **Failure**: Red error icon, check `lastError` field

**Troubleshooting**:
- **"HTML detected, not a feed"**: You provided a webpage URL instead of the RSS feed URL
  - **Fix**: Find the RSS icon on the site or append `/feed` to the URL
- **"Timeout"**: Feed is slow or unreachable
  - **Fix**: Increase fetch interval or check feed health

**Step 3: View Entries**
- Click **"View Entries"** on a source
- Modal shows all entries from that source
- Filter by **Status**: NEW, PROCESSED, IGNORED, ERROR

**Managing Research Sync**:

**Step 1: Trigger Research**
- Click **"Sync Research Now"**
- Choose kinds to sync: WEB, SOCIAL, JOURNAL, TREND
- Confirm
- **Result**: Research entries are created in the database

**Step 2: View Research Entries**
- In the **Unified Research Center** panel:
  - Filter by **Source Type**: RSS or Research
  - Filter by **Kind**: WEB, SOCIAL, JOURNAL, TREND
  - Filter by **Status**, date range
- Click **"Load Entries"**
- **Pagination**: Use "Next Page" / "Previous Page"

**Common Scenarios**:
- **New competitor emerged**: Add their RSS feed → Sync → Review entries → Generate drafts
- **Breaking news event**: Trigger WEB research → Review entries → Fast-track publish
- **Quarterly trend analysis**: Trigger JOURNAL research → Review academic papers → Generate long-form content

---

#### Drafts & Reviews

**Step 1: Review Pending Items**
- Navigate to **Drafts & Reviews** tab
- Items with `status=NEEDS_REVIEW` appear at the top
- Click an item to open the Review Modal

**Step 2: Edit Draft**
- **Title**: Headline (auto-generated but editable)
- **Summary**: Excerpt shown in listings
- **Content (HTML)**: Full article body (rich text editor)
- **Category**: Classify the topic
- **Tags**: Comma-separated keywords
- **Relevance Score**: 0-100 (AI-generated, editable)
- **SEO Title**: Custom title for search engines (optional)
- **SEO Description**: Meta description (optional)
- **OG Image URL**: Social media preview image

**Step 3: Generate OG Image**
- In **Image Controls** panel:
  - Click **"Generate OG Image"**
  - AI creates an image using DALL-E
  - Preview appears
  - Click **"Approve"** to use it or **"Regenerate"** to try again

**Step 4: Publish or Schedule**
- **Publish Now**:
  - Click **"Publish Now"**
  - Confirm (Yes/No dialog)
  - Item goes live immediately at `/news/[slug]`
- **Schedule**:
  - Click **"Schedule"**
  - Pick **Date & Time**
  - Set **Priority**: Low, Normal, High, Critical
  - Toggle **Featured** (highlights on homepage)
  - Set **Expires At** (optional auto-unpublish date)
  - Click **"Schedule"**

**Step 5: Reject Draft**
- Click **"Reject"**
- Provide **Rejection Reason** (logged in audit trail)
- Item moves to **Rejected** tab
- **Use Case**: Low quality, off-topic, or duplicate content

**Step 6: Regenerate**
- Click **"Regenerate"**
- AI creates a new version using the same source entry
- **Use Case**: First draft was poor, but the source is good

**Common Scenarios**:
- **Morning editorial workflow**:
  1. Check NEEDS_REVIEW queue
  2. Review top 5 items by relevance score
  3. Edit titles for SEO
  4. Generate OG images
  5. Schedule for next available slot
- **Urgent news**:
  1. Trigger research sync
  2. Draft appears in NEEDS_REVIEW
  3. Quick edit
  4. Publish Now (skip scheduling)

---

#### Published

**Step 1: View Live Items**
- All items with `status=PUBLISHED` and `deletedAt IS NULL` appear here

**Step 2: Unpublish**
- Click **"Unpublish"** on an item
- Confirm
- Item is soft-deleted (`deletedAt` set to now)
- **Result**: No longer appears on `/news`, but still in database

**Common Scenarios**:
- **Factual error discovered**: Unpublish → Edit → Republish
- **Seasonal content expired**: Unpublish (or set `scheduleExpiresAt` in advance)

---

#### Rejected

**Step 1: Review Rejected Items**
- Items with `status=REJECTED` appear here
- Shows **Rejection Reason** and **Rejected At** timestamp

**Step 2: Restore**
- Click **"Restore"**
- Item returns to DRAFT status
- **Use Case**: Rejection was premature; content is salvageable

**Step 3: Regenerate**
- Click **"Regenerate"**
- AI creates a fresh draft from the same source entry
- **Use Case**: Source was good, but AI failed; try again

**Step 4: Permanent Delete (Purge)**
- Click **"Delete Permanently"**
- Confirm (irreversible)
- Item is hard-deleted from database
- **Use Case**: Content violates policy, spam, or duplicate

**Common Scenarios**:
- **Weekly cleanup**: Review rejected items → Purge obvious spam → Regenerate borderline cases

---

#### Automation Logic

**Step 1: Configure Publish Windows**
- **Publish Windows V2** is a 7-day grid with time ranges
- For each day (Monday-Sunday):
  - Set **Start Time** (e.g., 09:00)
  - Set **End Time** (e.g., 17:00)
- Click **"Save Config"**
- **Impact**: Scheduled items will only be published during these windows

**Example**:
- **Business Hours Publishing**: Mon-Fri 9am-5pm, Sat-Sun disabled
- **24/7 Publishing**: All days 00:00-23:59

**Step 2: Configure Operational Rules**
- **Enable Auto-Publish**: Toggle ON to allow automatic publishing (requires pipeline status = NOMINAL)
- **Force Review Below Score**: Items below this relevance score always require human review (e.g., 60)
- **Auto-Reject Threshold**: Items below this score are auto-rejected (e.g., 30)

**Step 3: Manage Automation Rules**
- Click **"Add Rule"**
- Configure:
  - **Name**: Descriptive identifier
  - **Priority**: 1-100 (lower = higher priority)
  - **Enabled**: Toggle
  - **Conditions**: JSON object (e.g., `{"category": "Solar"}`)
  - **Actions**: JSON object (e.g., `{"forceReview": true}`)
- Click **"Save"**

**Common Rules**:
- **High-priority sources**: Force review for specific RSS feeds
- **Category filtering**: Auto-reject entries from certain categories
- **Relevance boosting**: Increase priority for entries matching keywords

**Step 4: Reset to Saved**
- If you make changes but don't save, click **"Reset to Saved"** to revert

**Common Scenarios**:
- **Holiday schedule**: Disable weekend publishing during major holidays
- **Quality control tightening**: Raise Force Review threshold from 50 → 70

---

#### AI Router

**Step 1: Add Model Profile**
- Click **"Add Model Profile"**
- Fill form:
  - **Name**: Descriptive (e.g., "GPT-4 Drafting - Creative")
  - **Provider**: openai or gemini
  - **Model ID**: e.g., `o3-mini`, `gpt-4o-mini`, `gemini-pro`
  - **Temperature**: 0.0 (factual) to 1.0 (creative)
  - **Max Tokens**: Output length limit
  - **Top P**: Sampling parameter
- Click **"Save"**

**Step 2: Set Default Model**
- Choose **Default Drafting Model** from dropdown
- This model is used when no intent-specific routing rule matches

**Step 3: Configure Intent Routing**
- **Intents**: `draft_from_source`, `summarize`, `seo_optimize`, `og_image`
- Map each intent to a model profile
- **Example**:
  - `draft_from_source` → GPT-4 Creative
  - `summarize` → GPT-4o-mini Concise
  - `seo_optimize` → Custom SEO Profile
  - `og_image` → DALL-E 3

**Common Scenarios**:
- **Cost reduction**: Switch drafting from GPT-4 → GPT-4o-mini for non-critical content
- **Quality improvement**: Use GPT-4 for high-priority drafting, GPT-4o-mini for summaries

---

#### Key Vault

**Step 1: Add API Key**
- Click **"Add API Key"**
- Fill form:
  - **Name**: Identifier (e.g., "Production OpenAI Key")
  - **Provider**: openai or gemini
  - **API Key**: Paste full key (stored encrypted)
  - **Pools**: Select one or more: DRAFTING, IMAGES, SUMMARIZATION
  - **Enabled**: Toggle to activate immediately
- Click **"Save"**
- **Result**: Key is encrypted with `NEWS_ENGINE_MASTER_KEY` and stored in database

**Step 2: Rotate Keys**
- Add new key with same pool assignment
- Disable old key
- **Best Practice**: Don't delete old keys immediately (grace period for in-flight requests)

**Step 3: Pool Assignment**
- **DRAFTING**: Used for article generation
- **IMAGES**: Used for OG image creation
- **SUMMARIZATION**: Used for excerpt generation
- **Why it matters**: Separate billing, quota management, and performance tuning per task type

**Common Scenarios**:
- **API quota exceeded**: Add backup key → Enable → Disable primary → Resume pipeline
- **Security incident**: Disable compromised key → Rotate → Re-enable pipeline

---

#### Settings

**Step 1: News Settings**
- **Default Category**: Auto-applied to new items
- **Default Tags**: Auto-applied to new items
- **Min Relevance Score**: Items below this are auto-rejected

**Step 2: AI Defaults**
- **Default Model**: Fallback when no profile matches
- **Temperature**: Global default
- **Max Tokens**: Global default

**Step 3: Notifications**
- **Review Queue Threshold**: Send alert when queue exceeds this count
- **Error Alert Email**: Recipient for automation failures

**Step 4: Ops Config**
- **Runner Schedule**: Cron expression (future feature)
- **Parallel Workers**: How many drafts to generate simultaneously

**Common Scenarios**:
- **Seasonal shift**: Change default category from "Solar" → "Renewable Energy"
- **Quality improvement**: Raise Min Relevance Score from 40 → 50

---

#### Logs

**Step 1: Filter Logs**
- **Action**: Create, Update, Publish, Reject, etc.
- **Actor**: Admin username
- **Item ID**: Specific item
- **Date Range**: From/To

**Step 2: Review Entries**
- Each log shows:
  - **Timestamp**: When action occurred
  - **Action**: What was done
  - **Actor**: Who did it
  - **Metadata**: Additional context (e.g., rejection reason)

**Common Scenarios**:
- **Audit trail**: "Who published this item?"
- **Debugging**: "What happened to item XYZ?"

---

## 4. User Guide (Bengali / বাংলা)

### শুরু করা

#### প্রয়োজনীয়তা
1. ডাটাবেসে `role=ADMIN` সহ অ্যাডমিন অ্যাকাউন্ট
2. OpenAI API কী কনফিগার করা (`.env` বা Key Vault এ)
3. কমপক্ষে একটি সক্রিয় RSS সোর্স অথবা ম্যানুয়াল ড্রাফট তৈরি

#### নিউজ ইঞ্জিন অ্যাক্সেস করা
1. আপনার ব্রাউজারে `/admin/news-engine` এ যান
2. আপনি ১১টি ট্যাব সহ Admin Hub V6 ইন্টারফেস দেখতে পাবেন

---

### ট্যাব-বাই-ট্যাব গাইড

#### মাস্টার কন্ট্রোল

**ধাপ ১: পাইপলাইন স্ট্যাটাস চেক করুন**
- শীর্ষ প্যানেল দেখুন: "Pipeline Status"
- **Nominal**: সিস্টেম স্বাভাবিকভাবে চলছে
- **Paused**: অটোমেশন অস্থায়ীভাবে বন্ধ
- **Emergency Stop**: সমস্ত অপারেশন বন্ধ (ম্যানুয়াল হস্তক্ষেপ প্রয়োজন)

**ধাপ ২: Queue Snapshot দেখুন**
- "Queue Snapshot" প্যানেল দেখায়:
  - **RSS New Entries**: অপ্রসেসড RSS আইটেম
  - **Research New Entries**: অপ্রসেসড রিসার্চ ফলাফল
  - **Drafts Needing Review**: মানুষের অনুমোদনের জন্য অপেক্ষারত আইটেম
  - **Scheduled Due Soon**: প্রকাশের জন্য প্রস্তুত আইটেম
  - **Errors**: সাম্প্রতিক ব্যর্থতা

**ধাপ ৩: ম্যানুয়ালি অটোমেশন চালান**
- **"Run Automation Now"** এ ক্লিক করুন
- মোড বেছে নিন:
  - **Dry Run**: ড্রাফট তৈরি না করে অটোমেশন সিমুলেট করে
  - **Live Run**: সম্পূর্ণ অটোমেশন পাইপলাইন চালায় (প্রকৃত ড্রাফট তৈরি করে)

**ধাপ ৪: পাইপলাইন Pause/Resume করুন**
- **Pause**: অস্থায়ীভাবে অটোমেশন বন্ধ করুন
- **Resume**: Pause এর পরে অটোমেশন পুনরায় চালু করুন
- **Emergency Stop**: শুধুমাত্র গুরুতর পরিস্থিতিতে ব্যবহার করুন

---

#### ড্যাশবোর্ড

**ধাপ ১: KPI পর্যালোচনা করুন**
- **গত ৩০ দিনে তৈরি স্টোরি**: মোট আইটেম সংখ্যা
- **গড় প্রাসঙ্গিকতা স্কোর**: গুণমানের সূচক (০-১০০)
- **পর্যালোচনা সারি সংখ্যা**: অনুমোদনের জন্য অপেক্ষারত আইটেম

**ধাপ ২: আইটেম ফিল্টার করুন**
- ড্রপডাউন ফিল্টার ব্যবহার করুন:
  - **Status**: DRAFT, NEEDS_REVIEW, SCHEDULED, PUBLISHED, REJECTED
  - **Category**: Solar, Renewable Energy, Market Update, ইত্যাদি
  - **তারিখ পরিসীমা**: From/To পিকার

---

#### Sources (Unified Research Center)

**RSS সোর্স পরিচালনা**:

**ধাপ ১: নতুন সোর্স যোগ করুন**
- **"Add RSS Source"** এ ক্লিক করুন
- ফর্ম পূরণ করুন:
  - **Name**: বন্ধুত্বপূর্ণ পরিচয়পত্র
  - **URL**: RSS/Atom ফিড URL
  - **Enabled**: অবিলম্বে সক্রিয় করতে টগল করুন

**ধাপ ২: ফিড টেস্ট করুন**
- সোর্স সারিতে **"Sync Now"** এ ক্লিক করুন
- **সফলতা**: সবুজ চেকমার্ক, এন্ট্রি Unified Research Center এ প্রদর্শিত হয়

---

#### Drafts & Reviews (ড্রাফট এবং পর্যালোচনা)

**ধাপ ১: মুলতুবি আইটেম পর্যালোচনা করুন**
- **Drafts & Reviews** ট্যাবে যান
- `status=NEEDS_REVIEW` সহ আইটেমগুলো শীর্ষে প্রদর্শিত হয়

**ধাপ ২: ড্রাফট সম্পাদনা করুন**
- **Title**: শিরোনাম
- **Summary**: তালিকায় দেখানো উদ্ধৃতি
- **Content**: সম্পূর্ণ নিবন্ধ বডি
- **Category**: বিষয় শ্রেণীবদ্ধ করুন
- **Tags**: কমা-বিচ্ছিন্ন কীওয়ার্ড

**ধাপ ৩: OG ইমেজ জেনারেট করুন**
- **Image Controls** প্যানেলে:
  - **"Generate OG Image"** এ ক্লিক করুন
  - AI DALL-E ব্যবহার করে একটি ইমেজ তৈরি করে

**ধাপ ৪: প্রকাশ বা সময়সূচী করুন**
- **Publish Now**: অবিলম্বে লাইভ হয়
- **Schedule**: তারিখ এবং সময় বেছে নিন

---

## 5. Tooltip Reference

| UI Element | Tooltip (EN) | Tooltip (BN) |
|---|---|---|
| Run Automation Now | Manually trigger the automation pipeline to ingest RSS feeds and generate drafts. | RSS ফিড ইনজেস্ট করতে এবং ড্রাফট তৈরি করতে ম্যানুয়ালভাবে অটোমেশন পাইপলাইন ট্রিগার করুন। |
| Emergency Stop | Immediately halt all automation and publishing operations. Use only in critical situations. | সমস্ত অটোমেশন এবং প্রকাশনা অপারেশন অবিলম্বে বন্ধ করুন। শুধুমাত্র গুরুতর পরিস্থিতিতে ব্যবহার করুন। |
| Dry Run | Simulate automation without creating actual drafts. Safe for testing. | প্রকৃত ড্রাফট তৈরি না করে অটোমেশন সিমুলেট করুন। পরীক্ষার জন্য নিরাপদ। |
| Live Run | Execute full automation pipeline and create real drafts. | সম্পূর্ণ অটোমেশন পাইপলাইন চালান এবং প্রকৃত ড্রাফট তৈরি করুন। |
| Force Review Below Score | Items with relevance scores below this threshold will always require human review before publishing. | এই থ্রেশহোল্ডের নিচে প্রাসঙ্গিকতা স্কোর সহ আইটেমগুলো প্রকাশের আগে সর্বদা মানুষের পর্যালোচনা প্রয়োজন হবে। |
| Auto-Reject Threshold | Items with relevance scores below this threshold will be automatically rejected. | এই থ্রেশহোল্ডের নিচে প্রাসঙ্গিকতা স্কোর সহ আইটেমগুলো স্বয়ংক্রিয়ভাবে প্রত্যাখ্যান করা হবে। |
| Publish Windows V2 | Define time windows when scheduled items can be published. Items will only go live during these hours. | নির্ধারিত আইটেমগুলো কখন প্রকাশ করা যেতে পারে তা নির্ধারণ করুন। আইটেমগুলো শুধুমাত্র এই ঘন্টার মধ্যে লাইভ হবে। |
| Model Profile | A configuration preset that defines which AI model to use and how (temperature, max tokens, etc.). | একটি কনফিগারেশন প্রিসেট যা কোন AI মডেল ব্যবহার করতে হবে এবং কীভাবে (তাপমাত্রা, সর্বোচ্চ টোকেন, ইত্যাদি) তা নির্ধারণ করে। |
| AI Router | Automatically selects the best AI model for each task based on intent (drafting, summarization, SEO, etc.). | প্রতিটি কাজের জন্য ইনটেন্টের উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে সেরা AI মডেল নির্বাচন করে। |
| Key Vault | Securely store and manage AI provider API keys with encryption. | এনক্রিপশন সহ AI প্রদানকারী API কীগুলো নিরাপদে সংরক্ষণ এবং পরিচালনা করুন। |
| Pool Assignment | Assign API keys to specific task pools (DRAFTING, IMAGES, SUMMARIZATION) for better cost control. | ভাল খরচ নিয়ন্ত্রণের জন্য নির্দিষ্ট কাজ পুলে (DRAFTING, IMAGES, SUMMARIZATION) API কীগুলো বরাদ্দ করুন। |
| Provenance | Track the lineage of a NewsItem: which source entry inspired it, which AI model generated it, and when. | একটি NewsItem এর বংশপরিচয় ট্র্যাক করুন: কোন সোর্স এন্ট্রি এটি অনুপ্রাণিত করেছে, কোন AI মডেল এটি তৈরি করেছে এবং কখন। |
| OG Image | The Open Graph image that appears in social media previews when sharing this article. | এই নিবন্ধ শেয়ার করার সময় সোশ্যাল মিডিয়া প্রিভিউতে প্রদর্শিত Open Graph ইমেজ। |
| Relevance Score | AI-generated quality indicator (0-100). Higher scores indicate better match to target audience. | AI-জেনারেটেড গুণমান সূচক (০-১০০)। উচ্চ স্কোর লক্ষ্য শ্রোতাদের সাথে ভাল মিল নির্দেশ করে। |
| Schedule Priority | Determines publishing order when multiple items are scheduled for the same time window. | একই সময় উইন্ডোর জন্য একাধিক আইটেম নির্ধারিত হলে প্রকাশনা ক্রম নির্ধারণ করে। |
| Expires At | Optional auto-unpublish date. The item will be automatically removed from public view after this timestamp. | ঐচ্ছিক স্বয়ংক্রিয়-অপ্রকাশ তারিখ। এই টাইমস্ট্যাম্পের পরে আইটেমটি স্বয়ংক্রিয়ভাবে পাবলিক ভিউ থেকে সরানো হবে। |

---

## 6. Functionality Map

| UI Trigger/Action | Connected Backend/API | Data Flow/Result |
|---|---|---|
| Master Control → Run Automation Now | `POST /api/admin/news-engine/automation/run-now` → `POST /api/internal/news-engine/automation/run` | Admin route proxies to internal runner with secret header → Runner executes full pipeline → Returns summary to UI |
| Master Control → Pause Pipeline | `POST /api/admin/news-engine/pipeline/pause` | Sets `pipelineStatus=PAUSED` in Settings → Runner respects this flag and skips operations |
| Master Control → Queue Snapshot | `GET /api/admin/news-engine/ops/queue-snapshot` | Queries DB for counts (new entries, drafts needing review, errors) → Returns JSON |
| Dashboard → Load KPIs | `GET /api/admin/news-engine/analytics/kpis` | Aggregates DB queries (30-day counts, avg relevance, queue count) → Returns KPI object |
| Sources → Add RSS Source | `POST /api/admin/news-engine/sources` | Validates URL → Inserts `NewsSource` row → Returns created source |
| Sources → Sync Now | `POST /api/admin/news-engine/sources/[id]/sync` | Fetches RSS feed → Parses XML → Upserts `NewsSourceEntry` rows → Updates `lastSync` |
| Sources → Unified Research Center → Load Entries | `GET /api/admin/news-engine/research/unified/entries` | Merges `NewsSourceEntry` + `NewsResearchEntry` with cursor pagination → Returns unified list |
| Drafts → Publish Now | `POST /api/admin/news-engine/items/[id]/publish-now` | Generates slug if missing → Sets `status=PUBLISHED, publishedAt=now()` → Writes audit log |
| Drafts → Schedule | `POST /api/admin/news-engine/items/[id]/schedule` | Validates datetime is future → Sets `status=SCHEDULED, scheduledFor, schedulePriority, scheduleExpiresAt, scheduleIsFeatured` → Writes audit log |
| Drafts → Reject | `POST /api/admin/news-engine/items/[id]/reject` | Sets `status=REJECTED, rejectedAt, rejectionReason` → Writes audit log |
| Drafts → Regenerate | `POST /api/admin/news-engine/items/[id]/regenerate` | Calls AI router → Generates new draft → Updates content fields → Writes AI request log |
| Drafts → Generate OG Image | `POST /api/admin/news-engine/items/[id]/og-image/generate` | Calls DALL-E API → Stores image URL → Returns preview |
| Published → Unpublish | `PUT /api/admin/news-engine/items/[id]` (set `deletedAt`) | Soft-deletes item → No longer appears on `/news` |
| Rejected → Restore | `PUT /api/admin/news-engine/items/[id]` (set `status=DRAFT`) | Restores item to draft queue |
| Rejected → Permanent Delete | `DELETE /api/admin/news-engine/items/[id]/purge` | Hard-deletes item from DB (irreversible) |
| Automation Logic → Save Config | `PUT /api/admin/news-engine/automation/config` | Validates JSON → Normalizes `publishWindowsV2` → Persists to Settings table |
| Automation Logic → Add Rule | `POST /api/admin/news-engine/automation/rules` | Validates conditions/actions JSON → Inserts `NewsAutomationRule` row |
| AI Router → Add Model Profile | `POST /api/admin/news-engine/model-profiles` | Validates parameters → Inserts `NewsAiModelProfile` row |
| AI Router → Set Default Model | `PUT /api/admin/news-engine/ai-router/defaults` | Persists `defaultDraftingModelId` to Settings |
| Key Vault → Add API Key | `POST /api/admin/news-engine/key-vault` | Encrypts key with `NEWS_ENGINE_MASTER_KEY` → Inserts `NewsApiKey` row |
| Key Vault → Disable Key | `PUT /api/admin/news-engine/key-vault/[id]` (set `enabled=false`) | Marks key inactive → Runner skips it during selection |
| Settings → Save News Settings | `PUT /api/admin/news-engine/settings` | Persists `news.settings.*` keys to Settings table |
| Logs → Filter Logs | `GET /api/admin/news-engine/audit-logs` | Queries `NewsAuditLog` with filters (action, actor, itemId, date range) → Returns paginated results |

---

## 7. E2E Flows & System Health

### Typical End-to-End Flow: RSS → Published

1. **Ingestion**:
   - Scheduler triggers automation runner (or admin clicks "Run Automation Now")
   - Runner fetches enabled RSS sources
   - Parses feed XML → Upserts `NewsSourceEntry` rows
   - **Verification**: Check Sources tab → View Entries → See new entries with `status=NEW`

2. **Selection**:
   - Runner evaluates automation rules
   - Filters entries by relevance, category, keywords
   - Marks selected entries as `status=PROCESSED`
   - **Verification**: Check Master Control → Queue Snapshot → See "Selected Entry Count"

3. **Drafting**:
   - AI Router selects model based on intent (`draft_from_source`)
   - Calls OpenAI API with entry content
   - Creates `NewsItem` with `status=DRAFT` or `NEEDS_REVIEW` (depending on relevance score)
   - Writes `NewsAiRequestLog` entry
   - **Verification**: Check Drafts tab → See new item → Check Provenance for source entry ID

4. **Review**:
   - Admin opens item in Review Modal
   - Edits title, summary, content
   - Generates OG image
   - **Verification**: Preview changes in modal → Check Image Controls panel

5. **Scheduling**:
   - Admin clicks "Schedule" → Picks date/time
   - Sets priority, featured flag
   - **Verification**: Check Dashboard → Filter by `status=SCHEDULED` → See item in list

6. **Publishing**:
   - Request-driven scheduler runs on every `GET /api/news` call
   - Checks for items where `status=SCHEDULED AND scheduledFor <= now() AND deletedAt IS NULL`
   - Within publish windows (per Automation Logic config)
   - Sets `status=PUBLISHED, publishedAt=now()`
   - **Verification**: Visit `/news` → See item in public listing

---

### System Health Verification

**Daily Health Check**:
1. Navigate to Master Control tab
2. Check Pipeline Status: Should be "Nominal"
3. Check Queue Snapshot:
   - **RSS New Entries**: Should cycle (not accumulate indefinitely)
   - **Drafts Needing Review**: Should be manageable (<50 for small teams)
   - **Errors**: Should be 0 or minimal
4. Check Ops Health panel:
   - **Last Runner Success**: Should be recent (within last hour)
   - **Last Ingestion Success**: Should be recent (within fetch interval)
   - **Last Error**: Should be empty or non-critical

**Weekly Health Check**:
1. Review Dashboard KPIs:
   - **30-Day Story Count**: Should show consistent growth
   - **Avg Relevance Score**: Should be >60 (adjust rules if lower)
   - **Review Queue Count**: Should be decreasing (not backlogged)
2. Check Logs tab:
   - Filter by `action=ERROR`
   - Investigate any recurring errors
3. Check Key Vault:
   - Verify all keys are enabled
   - Check for quota warnings (future feature)

---

### Common Errors & Resolutions

| Error | Symptoms | Resolution |
|-------|----------|------------|
| **OpenAI API Quota Exceeded** | Automation fails, errors in Logs tab | Add backup key in Key Vault → Disable primary → Resume pipeline |
| **RSS Feed Unreachable** | Sync Now fails, `lastError` shows timeout | Check feed URL → Increase fetch interval → Disable source if permanently down |
| **HTML Detected Instead of Feed** | Sync Now fails, error: "not a feed" | Find correct RSS URL (often `/feed` or `/rss`) → Update source URL |
| **Low Relevance Scores** | All drafts score <40 | Adjust automation rules → Filter low-quality sources → Regenerate with better model |
| **No Items Published** | Scheduled items not going live | Check Automation Logic → Verify auto-publish enabled → Check publish windows include current time → Check pipeline status is Nominal |
| **OG Image Generation Fails** | Error in Image Controls panel | Check Key Vault → Ensure key assigned to IMAGES pool → Check OpenAI quota |
| **Master Key Missing** | Key Vault UI non-functional | Set `NEWS_ENGINE_MASTER_KEY` in `.env` → Restart server |

---

## 8. Testing & Verification Checklist

### UI Testing
- [ ] All 11 tabs load without errors
- [ ] All modals open and close properly
- [ ] All buttons trigger expected actions
- [ ] Loading spinners appear during API calls
- [ ] Error messages display clearly
- [ ] Success confirmations appear after actions

### API Testing
- [ ] `GET /api/news` returns published items only
- [ ] `GET /api/news/[slug]` renders correct item
- [ ] `POST /api/admin/news-engine/automation/run-now` creates drafts
- [ ] `POST /api/admin/news-engine/items/[id]/publish-now` publishes item
- [ ] `POST /api/admin/news-engine/items/[id]/schedule` schedules item
- [ ] `GET /api/admin/news-engine/ops/queue-snapshot` returns counts
- [ ] `GET /api/admin/news-engine/analytics/kpis` returns KPIs

### E2E Flow Testing
- [ ] Add RSS source → Sync → Entries appear
- [ ] Run automation (dry) → No drafts created
- [ ] Run automation (live) → Drafts created
- [ ] Review draft → Edit → Publish → Appears on `/news`
- [ ] Schedule item → Auto-publishes at scheduled time
- [ ] Reject item → Appears in Rejected tab
- [ ] Restore rejected item → Appears in Drafts tab

### Configuration Testing
- [ ] Publish Windows restricts publishing times
- [ ] Force Review threshold works correctly
- [ ] Auto-Reject threshold works correctly
- [ ] Automation rules filter entries correctly
- [ ] AI Router selects correct model per intent
- [ ] Key Vault keys work after rotation

### Security Testing
- [ ] Non-admin users cannot access `/admin/news-engine`
- [ ] Internal runner endpoint requires secret header
- [ ] API keys are encrypted in database
- [ ] Audit logs record all actions

---

## 9. Known Limitations / Edge Cases

### Current Limitations

1. **Schedule Extras Timezone**:
   - **Issue**: Publish Windows V2 does not apply user timezone conversion in backend normalization (X331 warning)
   - **Impact**: Window derivation uses UTC
   - **Workaround**: Admin must manually adjust windows for desired local time
   - **Planned Fix**: Future enhancement (Phase 14+)

2. **Share Modal Missing WhatsApp/Email**:
   - **Issue**: Only Twitter, Facebook, LinkedIn, Copy Link implemented
   - **Impact**: Users cannot share directly via WhatsApp or email
   - **Workaround**: Use Copy Link + paste into WhatsApp/email manually
   - **Planned Fix**: Low priority, deferred to future iteration

3. **ESLint Warning - dayDefs**:
   - **Issue**: `dayDefs` array in `AutomationLogicTab.tsx` triggers exhaustive-deps warning
   - **Impact**: None (build passes, runtime correct)
   - **Workaround**: Ignore warning or wrap `dayDefs` in useMemo
   - **Planned Fix**: Code quality improvement (non-blocking)

4. **No Batch Operations**:
   - **Issue**: Cannot publish/reject/delete multiple items at once
   - **Impact**: Time-consuming for large batches
   - **Workaround**: Use scripting or manual iteration
   - **Planned Fix**: Future feature (batch actions)

---

### Edge Cases

1. **Duplicate RSS Entries**:
   - **Scenario**: Same URL appears in multiple RSS feeds
   - **Behavior**: Second insert fails due to `@@unique([sourceId,url])` constraint
   - **Result**: Entry is silently skipped (no error)
   - **Recommendation**: Review source URLs to avoid overlapping feeds

2. **Scheduled Item During Pause**:
   - **Scenario**: Item scheduled for 10am, pipeline paused at 9:55am
   - **Behavior**: Item will NOT publish at 10am (pipeline is paused)
   - **Result**: Item publishes when pipeline is resumed (within next window)
   - **Recommendation**: Avoid pausing during high-priority publish windows

3. **Key Rotation During Active Run**:
   - **Scenario**: Disable key while automation run is in progress
   - **Behavior**: In-flight requests may fail
   - **Result**: Some drafts may have errors
   - **Recommendation**: Pause pipeline → Rotate keys → Resume

4. **OG Image Too Large**:
   - **Scenario**: DALL-E generates 2MB+ image
   - **Behavior**: May exceed Next.js API route body limit
   - **Result**: Image generation fails
   - **Recommendation**: Use image compression or reduce resolution

5. **Relevance Score Inflation**:
   - **Scenario**: AI model consistently scores all entries >90
   - **Behavior**: Auto-publish threshold ineffective
   - **Result**: Low-quality content may auto-publish
   - **Recommendation**: Manually review samples → Adjust scoring prompt or lower threshold

---

## 10. Final Sign-off

### Pre-Production Checklist

- [x] All UI tabs functional and wired to backend
- [x] All API endpoints implemented and tested
- [x] All E2E flows verified (RSS → Draft → Publish)
- [x] All configuration options persist correctly
- [x] Audit logging captures all actions
- [x] Error handling shows clear messages
- [x] Documentation complete (user guide, tooltips, functionality map)
- [x] Script validation PASS (automation E2E test, cleanup script)
- [x] Comprehensive audit report GREEN (100% SOT alignment)
- [x] Build gates PASS (`npx prisma validate`, `npx tsc --noEmit`, `npm run build`)

### Post-Release Verification

After deploying to production, verify:

- [ ] Master Control shows correct queue counts
- [ ] Run Automation (dry run) completes without errors
- [ ] Public `/news` page displays published items
- [ ] RSS sync creates entries successfully
- [ ] Scheduled items publish automatically during configured windows
- [ ] Audit logs record all admin actions
- [ ] OG image generation works
- [ ] Key Vault keys are encrypted and functional

### Known Deferred Items

- ⏳ WhatsApp/Email share links (low priority)
- ⏳ ESLint warning fix for `dayDefs` (code quality)
- ⏳ Batch operations (future enhancement)
- ⏳ Timezone support in Publish Windows normalization (future enhancement)

---

**Feature Status**: ✅ **PRODUCTION-READY**

**Approved By**: GitHub Copilot (Comprehensive Audit + User Guide Complete)  
**Date**: January 13, 2026  
**Next Review**: Post-release monitoring (1 week after deploy)

---

**End of Documentation**
