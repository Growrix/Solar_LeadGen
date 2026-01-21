# Post-Implementation Docs — News Engine (Phase 13 + Production Clarity)

## 1. Feature Overview
- **Feature Name:** News Engine — Phase 13 + Production Clarity
- **Purpose:** Provide fully-operational admin tooling (not “static UI”) with validated E2E and operator scripts.
- **Key Flows:**
  - Manage Model Profiles (create/edit/enable/disable)
  - Configure AI Router defaults per pipeline task
  - Manage Key Vault keys (encrypted at rest; pooled usage)
  - Review a News Item and inspect provenance
  - Configure and persist OG image controls (approval required + override URL)
  - Run automation verification scripts
- **Release Date:** 2026-01-10

---

## 2. User Guide (English)

Below, each section starts with a short description to clarify its purpose and what you can do there.

### 2.1 Open the News Engine Admin
**What is this?**
This section explains how to access the News Engine admin area and navigate its main tabs.
1) Go to the Admin Panel.
2) Open **News Engine**.
3) Use the top tabs as needed (Dashboard / Drafts & Reviews / Audit Logs / Sources / Settings).

### 2.2 Manage Model Profiles
**What is this?**
Here you create, edit, enable, or disable AI model profiles. These profiles define which AI models (like OpenAI, Deepseek, etc.) are available for routing different tasks. Only enabled profiles can be used by the AI Router.
1) Go to **Settings** → **Model Profiles**.
2) Click **Add Profile**.
3) Fill in:
   - Display name
   - Provider
   - Model ID
   - (Optional) tags / JSON mode / max tokens (as supported in UI)
4) Save.
5) Use Enable/Disable to control availability.

Notes:
- Only **enabled** profiles are selectable by the AI Router.

### 2.3 Configure AI Router Defaults
**What is this?**
This lets you assign a default model profile for each pipeline task (e.g., research, drafting, SEO). The AI Router uses these defaults to decide which model to use for each type of work.
1) Go to **Settings** → **AI Router**.
2) For each task type (e.g. `research_deep`, `draft_longform`, `seo`, etc.), select a **Model Profile**.
3) Click **Save Configuration**.

Notes:
- Disabled model profiles are not selectable.

### 2.4 Key Vault (Add / Manage Keys)
**What is this?**
The Key Vault securely stores API keys for different providers and pools (Research, Drafting, Images). You must have a valid master key configured to add or edit keys. Keys are encrypted and only masked values are shown in the UI.
1) Go to **Settings** → **Key Vault**.
2) If you see the “Key Vault locked” banner, configure the master key env var first (see 6.1).
3) Click **Add Key**.
4) Choose:
   - Provider (e.g. OpenAI)
   - Label
   - Pool (Research / Drafting / Images)
   - Enabled
   - Raw key (write-only)
5) Click **Save Key**.

Notes:
- Raw keys are never returned by the API; the UI shows only a masked value.

### 2.5 Review Modal: Provenance + Image Controls
**What is this?**
When reviewing a news item, this modal lets you see where the content came from (provenance) and control image settings (like OG image override and approval requirement). Changes here are saved per item.
1) Go to **Drafts & Reviews**.
2) Open an item.
3) Provenance loads automatically (sources / pipeline stage metadata).
4) Open **SEO & Compliance** → **Image controls**.
5) Configure:
   - “Require approval before publish”
   - “Override image URL” (OG image)
6) Click **Save as Draft** and re-open to confirm persistence.

---

## 3. User Guide (Bengali / বাংলা)

প্রতিটি অংশের শুরুতে সংক্ষিপ্ত বর্ণনা দেওয়া হয়েছে, যাতে আপনি সহজে বুঝতে পারেন কোন অংশে কী হয়।

### 3.1 নিউজ ইঞ্জিন অ্যাডমিন খুলুন
**এটা কী?**
এখানে দেখানো হয়েছে কীভাবে নিউজ ইঞ্জিন অ্যাডমিন প্যানেল খুলবেন এবং মূল ট্যাবগুলোতে যাবেন।
1) অ্যাডমিন প্যানেলে যান।
2) **News Engine** খুলুন।
3) প্রয়োজন অনুযায়ী ট্যাব ব্যবহার করুন (Dashboard / Drafts & Reviews / Audit Logs / Sources / Settings)।

### 3.2 Model Profiles ম্যানেজ করুন
**এটা কী?**
এখানে আপনি নতুন AI মডেল প্রোফাইল তৈরি, এডিট, চালু/বন্ধ করতে পারবেন। এই প্রোফাইলগুলোই AI Router-এ ব্যবহৃত হয়। শুধু চালু (enabled) প্রোফাইলগুলোই রাউটিংয়ে ব্যবহারযোগ্য।
1) **Settings** → **Model Profiles** এ যান।
2) **Add Profile** ক্লিক করুন।
3) Display name, Provider, Model ID দিন।
4) Save করুন।
5) Enable/Disable দিয়ে কোন প্রোফাইল ব্যবহারযোগ্য হবে তা নিয়ন্ত্রণ করুন।

নোট:
- AI Router ড্রপডাউনে শুধু **enabled** প্রোফাইলগুলো নির্বাচন করা যায়।

### 3.3 AI Router Defaults সেট করুন
**এটা কী?**
এখানে প্রতিটি টাস্কের জন্য ডিফল্ট মডেল প্রোফাইল নির্ধারণ করা হয়। AI Router এই সেটিংস দেখে কোন টাস্কে কোন মডেল ব্যবহার করবে তা ঠিক করে।
1) **Settings** → **AI Router** এ যান।
2) প্রতিটি task type এর জন্য একটি **Model Profile** নির্বাচন করুন।
3) **Save Configuration** ক্লিক করুন।

### 3.4 Key Vault (কি যোগ/ম্যানেজ)
**এটা কী?**
Key Vault-এ বিভিন্ন provider-এর API key নিরাপদে সংরক্ষণ করা হয়। এখানে key যোগ/এডিট করতে master key লাগবে। key গুলো এনক্রিপ্টেড থাকে এবং UI-তে শুধু masked value দেখা যায়।
1) **Settings** → **Key Vault** এ যান।
2) যদি “Key Vault locked” দেখায়, আগে master key env var কনফিগার করুন (৬.১ দেখুন)।
3) **Add Key** ক্লিক করুন।
4) Provider/Label/Pool/Enabled এবং Raw key দিন।
5) **Save Key** ক্লিক করুন।

নোট:
- Raw key কখনোই UI/API-তে ফেরত আসে না—শুধু masked value দেখাবে।

### 3.5 Review Modal: Provenance + Image Controls
**এটা কী?**
কোনো নিউজ আইটেম রিভিউ করার সময়, এখানে আপনি content-এর উৎস (provenance) ও ইমেজ সেটিংস (OG image override, approval) কনফিগার করতে পারবেন। প্রতিটি আইটেমের জন্য আলাদাভাবে সংরক্ষিত হয়।
1) **Drafts & Reviews** ট্যাবে যান।
2) একটি item খুলুন।
3) Provenance অটো লোড হবে।
4) **SEO & Compliance** → **Image controls** এ গিয়ে সেটিংস দিন।
5) **Save as Draft** করে আবার খুলে নিশ্চিত করুন সেভ হয়েছে।

---

## 4. Tooltip Reference
| UI Element | Tooltip (EN) | Tooltip (BN) |
|---|---|---|
| Settings → Model Profiles | Create and manage available AI model profiles. | AI model profile তৈরি ও ম্যানেজ করুন। |
| Settings → AI Router | Choose the default model profile for each pipeline task. | প্রতিটি pipeline task-এর জন্য ডিফল্ট model profile নির্বাচন করুন। |
| Settings → Save Configuration | Persist AI Router defaults to the backend. | AI Router defaults ব্যাকএন্ডে সেভ করুন। |
| Settings → Key Vault | Store API keys encrypted at rest; choose pool for usage. | API key এনক্রিপ্ট করে সংরক্ষণ করুন; ব্যবহার অনুযায়ী pool নির্বাচন করুন। |
| Review → Provenance | Shows sources and model stages used to produce this item. | এই আইটেম তৈরিতে ব্যবহৃত source এবং model stages দেখায়। |
| Review → Image controls | Configure approval requirement and OG image override. | approval requirement এবং OG image override সেট করুন। |

---

## 5. Functionality Map
| UI Trigger/Action | Connected Backend/API | Data Flow/Result |
|---|---|---|
| Settings opens | `GET /api/admin/news-engine/model-profiles` | Loads profiles for router selection and CRUD table. |
| Add/Edit/Disable model profile | `POST/PUT/DELETE /api/admin/news-engine/model-profiles` | Persists profile state; affects router availability. |
| Router dropdown + Save | `GET/PUT /api/admin/news-engine/ai-router/defaults` | Saves task → profile mapping. |
| Key Vault list | `GET /api/admin/news-engine/key-vault` | Returns masked keys + `masterKeyConfigured` for guardrails. |
| Add/Edit key | `POST/PUT /api/admin/news-engine/key-vault` | Encrypts raw key server-side; stores encrypted. |
| Review modal opens | `GET /api/admin/news-engine/items/[id]/provenance` | Loads citations/stage metadata. |
| Load image controls | `GET /api/admin/news-engine/items/[id]/image-controls` | Loads approval required + OG override URL. |
| Save as Draft | `PUT /api/admin/news-engine/items/[id]/image-controls` | Persists image control fields. |

---

## 6. Testing & Verification Checklist
- [ ] `npm run test:e2e:news-engine-phase13` returns 3 passed
- [ ] `npx tsx scripts/news-engine-rss-http-test.ts` passes (runner HTTP path)
- [ ] `npx tsx scripts/news-engine-e2e-automation-test.ts` passes (OpenAI + DB path)
- [ ] Key Vault master key is configured (see 6.1)
- [ ] Can add a Key Vault key and it appears masked in the table
- [ ] Can create/enable a Model Profile and select it in AI Router
- [ ] Review modal loads provenance
- [ ] Image controls persist after Save as Draft
- [ ] Optional gates: `npx tsc --noEmit` and `npm run build`

### 6.1 Required Environment Variables
- Key Vault master key (required to add/edit vault keys):
  - `NEWS_ENGINE_KEY_VAULT_MASTER_KEY` (preferred) or `NEWS_KEY_VAULT_MASTER_KEY`
  - Accepted formats: 32-byte base64/base64url, or 64-char hex (optional `hex:` prefix)
- Automation runner HTTP test:
  - `NEWS_ENGINE_CRON_SECRET`
- OpenAI script test:
  - `OPENAI_API_KEY`

---

## 7. Known Limitations / Edge Cases
- Key Vault is intentionally disabled when the master key env var is missing/invalid.
- Script-based tests require external connectivity to the model provider.

---

## 8. Final Sign-off
- [ ] All checklist items above are verified
- [ ] Feature is ready for production use
- **Sign-off by:**
- **Date:**
