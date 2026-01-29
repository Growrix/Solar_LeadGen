# Post-Implementation Docs — News Engine (Phase 13)

## 1. Feature Overview
- **Feature Name:** News Engine — Phase 13 (AI Router + Key Vault + Provenance/Image Controls)
- **Purpose:** Reduce “static vs working” confusion by documenting what is functional end-to-end, what depends on environment/config, and how to operate the feature.
- **Key Flows:**
  - Configure AI Router defaults per pipeline task
  - Manage Key Vault keys (encrypted at rest; pooled usage)
  - Review a News Item and inspect Provenance
  - Configure and persist OG image controls
- **Release Date:** 2026-01-08

---

## 2. User Guide (English)

### 2.1 Open the News Engine Admin
1) Go to the Admin Panel.
2) Open **News Engine**.
3) Use the top tabs: **Dashboard**, **Drafts & Reviews**, **Audit Logs**, **Master Control**, **Automation Logic**, **Sources**, **Settings**.

### 2.2 Configure AI Router Defaults
1) Go to **Settings**.
2) Find the section **AI Router**.
3) For each task type (e.g. `research_deep`, `draft_longform`, `seo`, etc.), select a **Model Profile**.
4) Click **Save Configuration**.

Notes:
- The dropdown only shows **enabled** model profiles.
- If the dropdown shows only `—`, it means there are no enabled model profiles available.

Operational note:
- Model Profiles are currently managed via admin API (there is no Settings UI to create/enable profiles yet). The backing endpoint is `POST /api/admin/news-engine/model-profiles`.

### 2.3 Key Vault (Add / Manage Keys)
1) Go to **Settings**.
2) Find the section **Key Vault**.
3) Click **Add Key**.
4) Choose:
   - Provider (e.g. OpenAI)
   - Label
   - Pool (Research / Drafting / Images)
   - Enabled
   - Raw key (write-only)
5) Click **Save Key**.

Notes:
- Key Vault requires the master key env var (`NEWS_ENGINE_KEY_VAULT_MASTER_KEY` or `NEWS_KEY_VAULT_MASTER_KEY`).
- Without that env var, create/update key operations cannot succeed.

Master key formats accepted:
- 32-byte base64
- 32-byte base64url
- 64-char hex (optionally prefixed with `hex:`)

### 2.4 Review Modal: Provenance + Image Controls
1) Go to **Drafts & Reviews**.
2) Filter and open a draft item.
3) In the review modal:
   - **Research Summary** includes a Provenance section (citations and pipeline stage labels).
   - **SEO & Compliance** contains **Image controls**.
4) Under **Image controls**:
   - Toggle “Require approval before publish”
   - Set “Override image URL” to an OG image URL
5) Click **Save as Draft** and re-open the item to confirm the values persisted.

---

## 3. User Guide (Bengali / বাংলা)

### 3.1 নিউজ ইঞ্জিন অ্যাডমিন খুলুন
1) অ্যাডমিন প্যানেলে যান।
2) **News Engine** খুলুন।
3) উপরের ট্যাবগুলো ব্যবহার করুন: **Dashboard**, **Drafts & Reviews**, **Audit Logs**, **Master Control**, **Automation Logic**, **Sources**, **Settings**।

### 3.2 AI Router Defaults সেট করুন
1) **Settings** ট্যাবে যান।
2) **AI Router** সেকশন খুঁজুন।
3) প্রতিটি task type (যেমন `research_deep`, `draft_longform`, `seo` ইত্যাদি) এর জন্য একটি **Model Profile** নির্বাচন করুন।
4) **Save Configuration** ক্লিক করুন।

নোট:
- ড্রপডাউনে শুধু **enabled** model profile দেখাবে।
- যদি শুধু `—` দেখা যায়, তাহলে enabled model profile নেই।

### 3.3 Key Vault (কি যোগ/ম্যানেজ)
1) **Settings** ট্যাবে যান।
2) **Key Vault** সেকশন খুঁজুন।
3) **Add Key** ক্লিক করুন।
4) Provider, Label, Pool (Research/Drafting/Images), Enabled এবং Raw key দিন।
5) **Save Key** ক্লিক করুন।

নোট:
- Key Vault কাজ করতে master key env var লাগবে (`NEWS_ENGINE_KEY_VAULT_MASTER_KEY` বা `NEWS_KEY_VAULT_MASTER_KEY`)।

### 3.4 Review Modal: Provenance + Image Controls
1) **Drafts & Reviews** ট্যাবে যান।
2) একটি draft item খুলুন।
3) **SEO & Compliance** ট্যাবে **Image controls** পাবেন।
4) “Require approval before publish” টগল এবং “Override image URL” সেট করুন।
5) **Save as Draft** ক্লিক করে আবার খুলে নিশ্চিত করুন যে সেটিংস সেভ হয়েছে।

---

## 4. Tooltip Reference
| UI Element | Tooltip (EN) | Tooltip (BN) |
|---|---|---|
| Settings → AI Router | Choose the default model profile for each pipeline task. | প্রতিটি pipeline task-এর জন্য ডিফল্ট model profile নির্বাচন করুন। |
| Settings → Save Configuration | Persist AI Router defaults to the backend. | AI Router defaults ব্যাকএন্ডে সেভ করুন। |
| Settings → Key Vault → Add Key | Add an encrypted API key for a specific pool (Research/Drafting/Images). | নির্দিষ্ট pool-এর জন্য (Research/Drafting/Images) এনক্রিপ্টেড API key যোগ করুন। |
| Review → Provenance | Shows sources and model stages used to produce this item. | এই আইটেম তৈরিতে ব্যবহৃত source এবং model stages দেখায়। |
| Review → Require approval before publish | Marks the item as requiring image approval before publish. | Publish করার আগে image approval প্রয়োজন এমনভাবে চিহ্নিত করে। |
| Review → Override image URL | Override the OG image URL for this item. | এই আইটেমের OG image URL override করুন। |

---

## 5. Functionality Map
| UI Trigger/Action | Connected Backend/API | Data Flow/Result |
|---|---|---|
| Open Admin → News Engine | `fetchAdminState()` via `src/lib/news-engine/client.ts` | Loads items, settings, sources, audit logs into the hub. |
| Settings tab opens | `GET /api/admin/news-engine/model-profiles` | Loads available model profiles into dropdowns. |
| Settings tab opens | `GET /api/admin/news-engine/ai-router/defaults` | Loads router defaults for each task type. |
| Settings tab opens | `GET /api/admin/news-engine/key-vault` | Loads masked vault keys + timestamps. |
| Change router dropdown | `PUT /api/admin/news-engine/ai-router/defaults` (on Save) | Persists new task→model profile mapping. |
| Add Key → Save Key | `POST /api/admin/news-engine/key-vault` | Encrypts raw key server-side and stores in DB; returns masked key only. |
| Edit Key → Save Key | `PUT /api/admin/news-engine/key-vault/[id]` | Updates label/pool/enabled/rawKey (rawKey optional). |
| Open Review modal | `GET /api/admin/news-engine/items/[id]/provenance` | Returns citations/URLs + per-stage model labels. |
| Open Review modal | `GET /api/admin/news-engine/items/[id]/image-controls` | Returns approval flag + OG override URL. |
| Review → Save as Draft | `PUT /api/admin/news-engine/items/[id]/image-controls` | Persists approval flag and OG override URL. |

---

## 6. Testing & Verification Checklist
- [ ] AI Router dropdowns show enabled model profiles
- [ ] Can save AI Router defaults (persists after reload)
- [ ] Key Vault master key env var is configured
- [ ] Can add key (masked key shown; raw key never returned)
- [ ] Review modal loads Provenance without errors
- [ ] Image controls persist after Save as Draft and reopen
- [ ] Run Phase 13 E2E: `npm run test:e2e:news-engine-phase13`
- [ ] Optional gates: `npx tsc --noEmit` and `npm run build`

---

## 7. Known Limitations / Edge Cases
- Model Profiles are currently managed via API (no Settings UI for creating/enabling/disabling profiles).
- Key Vault requires a master key env var; without it, key creation/update cannot work.

---

## 8. Final Sign-off
- [ ] All checklist items above are verified
- [ ] Feature is ready for production use
- **Sign-off by:**
- **Date:**
