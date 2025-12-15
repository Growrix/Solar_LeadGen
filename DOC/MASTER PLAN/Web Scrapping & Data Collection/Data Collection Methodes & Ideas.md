Great — below is a **complete, practical, legal, scalable plan** to collect the installer contact data you want (company name, website, address/postcode, phone, email when publicly available) for NSW & VIC — and then scale Australia-wide. It includes **sources**, **tools (SEO / research / enrichment / verification)**, an **engineering pipeline** you can implement, **cost & time estimates**, data quality controls, and several non-scraping alternatives (partnerships, buy lists, product-driven capture) so you can reach the largest, cleanest dataset possible while reducing legal and operational risk.

I’ve written this as an actionable guide for a senior SaaS developer / data lead so you can hand it to your team or an external vendor and get results.

---

# TL;DR — Quick approach

1. **Collect authoritative seed lists first**: government registries, accreditation lists (CEC/Solar Accreditation / state registers), ABN Lookup exports.
2. **Enrich via paid APIs**: Google Places API, Yellow Pages APIs, Bing, LinkedIn Sales Navigator, Hunter/Clearbit/ZoomInfo etc.
3. **Crawl public directories where allowed**: YellowPages, TrueLocal, Hotfrog, Oneflare, SolarDirectory, ENF, Hipages (respect ToS).
4. **Crawl company websites (where allowed) to get emails & phones**; verify with Hunter/Twilio.
5. **Buy vetted lists where needed**: data vendors / local Chambers / industry associations.
6. **Grow & verify organically**: funnel installers to claim profiles using free credits (product-led collection).
7. **Clean, dedupe, validate, store** in Postgres; export to CSV/Google Sheets.

Estimate first pass (NSW+VIC solar installers): **several thousand entries** achievable in a few weeks using the combined approach. Nationwide expansion follows the same pipeline.

---

# 1) Prioritized source list (start here — highest value → lower value)

### Tier A — Official / Authoritative (highest priority)

* **Clean Energy Regulator / REC Registry / Solar Accreditation Australia** — lists of accredited installers & registered participants. (Authoritative for solar/battery). Use manual export, published CSVs or APIs if available.
* **State government registries** (NSW Service NSW licence lookup, Energy Safe Victoria, Victorian Building Authority) — for verification and addresses.
* **ABN Lookup (Australian Business Register API)** — get legal company name, business address, ABN. Useful to tie identities.
  Why: high trust, compliance, easily verifiable.

### Tier B — Major directories & marketplaces (large coverage)

* **Google Places API / Google My Business (GMB)** — business name, website, phone, address. (Paid API; best quality for businesses).
* **YellowPages / TrueLocal / AussieWeb / Hotfrog / PureLocal** — large national coverage. Many include phone & address. Check for API or data-partner options.
* **Trade marketplaces**: **hipages**, **Oneflare**, **ServiceSeeking**, **Airtasker**, **SolarQuotes**, **SolarDirectory**, **ENF solar directory**. These show many installer profiles (often with website & phone).
  Why: big coverage; some require navigation of ToS.

### Tier C — Company websites & social

* Extract emails/contact pages from installers’ own websites (patterned addresses like [info@company.com](mailto:info@company.com)). Check `robots.txt` and ToS.
* **LinkedIn / LinkedIn Sales Navigator** — find company pages + owner contacts.
  Why: direct contact & website verification.

### Tier D — Data vendors & enrichment APIs (fast scale)

* **Hunter.io, Snov.io, Clearbit, ZoomInfo, Apollo.io, Seamless.AI** — find email formats, corporate contacts, enrichment.
* **Phone validation / carrier lookup**: Twilio Lookup, Numverify.
  Why: fast enrichment and validation; paid but effective.

### Tier E — Purchase lists & partnerships

* Buy installer lists from **data providers**, YellowPages data partners, local Chambers of Commerce, or specialized vendors.
* Form partnerships with wholesalers, manufacturers, component distributors (they have installer networks). Offer lead-sharing co-marketing for access.

### Tier F — Product-led capture

* **Claim-your-profile** workflow: create public installer listings and give free credits to installers who claim/update their profile (collect all contact details directly, verified by ABN/insurance). This is the cleanest long-term source.

---

# 2) Tools (SEO / marketing / research / data collection)

### SEO & Research tools

* **Ahrefs / SEMrush / Moz / SpyFu** — find competitor landing pages, directories that rank for “solar installer [suburb]”. Use to discover directories and high-value pages to scrape or query.
* **Google advanced search / site: queries** — find business pages easily. e.g. `site:yellowpages.com.au "solar" "nsw" "phone"`.
* **Google Maps / Places API** (recommended) — authoritative business info, address, phone and website. Paid but scalable.

### Data collection & scraping stack

* **Scrapy** (Python) — framework for respectful scraping.
* **Selenium / Playwright** — for JS-heavy pages where needed (use sparingly).
* **Proxy & rotation**: Bright Data / Oxylabs / Smartproxy — if scraping at scale.
* **Crawler respect**: obey robots.txt, throttle, user-agent.
* **Address parsing**: libpostal, usaddress libs.
* **Geocoding**: Google Geocoding API or Pelias / Nominatim (open).
* **Data pipeline**: Airflow / Prefect for orchestration.

### Enrichment & verification

* **Hunter.io / Snov.io** — find & verify emails (pattern + verification).
* **Clearbit / ZoomInfo / Apollo** — enrich company & contact metadata.
* **NeverBounce / Mailgun / ZeroBounce** — email validation / hygiene.
* **Twilio Lookup** — phone verification and carrier detection.

### Data management & export

* **Postgres** (JSONB fields), **Supabase** or RDS.
* **Elasticsearch / MeiliSearch** for fast text search.
* **Pandas / Python** for CSV exports.
* **Google Sheets API** or direct CSV output.

### Manual research / people tools

* **LinkedIn Sales Navigator** — find company decision-makers, emails (when enriched).
* **Hunter Chrome extension** — single-page email discovery.

---

# 3) Legal & compliance (must read before large-scale scraping)

* **Respect robots.txt and site terms** — some directories explicitly forbid scraping; you must avoid those or request permission / paid data access.
* **Australian Privacy Principles (APPs)** — you're collecting business contact details (usually allowed), but if personal emails/phone numbers of individuals are scraped you must be careful about storage and use (marketing consent). Use double opt-in for emails.
* **Google Places**: Do *not* scrape Google search results — use the **Places API**.
* **Marketplace ToS** (hipages, Oneflare) often disallow automated collection — ask for an API or partnership.
* If you plan to cold-email / marketing, implement opt-out, honor CAN-SPAM / Australian spam laws, and use verified lists.

If you prefer a low-risk and fast route, **buying licensed lists** or **partnering** is often best.

---

# 4) Practical pipeline — step by step (implementation plan)

### Phase 0 — Prep: schema, licensing & access

* Define CSV schema (see below).
* Register & fund API accounts (Google Places, Hunter, Clearbit, Twilio).
* Identify data vendor contacts for potential buys.
* Create legal checklist and privacy policy for data usage.

**CSV schema (recommended fields)**

```
source,source_url,company_name,website,address,suburb,postcode,state,phone,email,abn,licence_number,installer_type(=solar),verified(boolean),verified_at,tags,notes,scrape_date,confidence_score
```

### Phase 1 — Authoritative seed collection (1–3 days)

* Download/parse **Clean Energy Regulator / Solar Accreditation** lists (CSV or manual copy).
* Query **ABN Lookup API** for each company name to fetch official address + ABN.
* Use **state registries** to verify license numbers.

**Deliverable:** Seed CSV ~1–2k rows (depending on registry size).

### Phase 2 — Google Places enrichment (1–7 days)

* Use Places API (Place Search by category + bounding box for NSW & VIC, or place text search `solar installer [suburb]`) to retrieve businesses and details.
* For each Place ID, call Place Details to get phone_number, website, address, lat/lon.
* Save raw JSON; map to your seed companies (fuzzy name match).
  **Costs:** Places API ~ $0.017–$0.035 per lookup (approx; check current prices). For 20k lookups plan budget accordingly.

### Phase 3 — Directory harvesting (1–3 weeks)

* Prioritize directories that allow crawling or have public pages: **SolarDirectory, ENF, YellowPages, TrueLocal, Hotfrog**.
* Build Scrapy spiders for each allowed site, throttle requests, rotate user-agent, check robots.txt.
* Extract company name, website, phone, address, source URL.
* For marketplaces that do not allow scraping, **apply for access / partnership** or use manual queries.

### Phase 4 — Website crawling & email extraction (1–3 weeks)

* For companies with `website` field, crawl the site for `contact`, `mailto:` links and structured `schema.org/LocalBusiness` markup.
* Use regex + heuristics to extract emails; many will be generic (info@) but useful.
* Respect robots.txt; obey `noindex` if present.

### Phase 5 — Enrichment & verification (1–7 days)

* Use **Hunter/Clearbit** to lookup emails by domain (domain search) and person search.
* Use **Twilio Lookup** for phone validation.
* Run **NeverBounce** for email hygiene.
* Append ABN lookup and license details.

### Phase 6 — Dedupe, scoring & export (1–3 days)

* Use fuzzy matching (fuzzywuzzy or trigram) to dedupe by company name + ABN + address.
* Assign `confidence_score` based on number of sources, presence of website, phone, verified ABN.
* Export CSV / upload to Google Sheets (via Sheets API).

### Phase 7 — Quality & human validation (ongoing)

* For top-value leads (solar installers in metro areas), run manual verification calls / emails for 5–10% sample to estimate accuracy.
* Use crowdsourced verification or hire a VA team for spot checks.

### Phase 8 — Growth & keep fresh (ongoing)

* Schedule **monthly jobs**: re-run Places searches for new businesses and re-validate changed data.
* Provide "claim your profile" CTA on your site — verified installers who claim profiles get free credits; data goes direct to your system and is highest quality.

---

# 5) Non-technical / business routes (fast & legal)

* **Buy lists** from YellowPages data partners, InfoGroup, or local data brokers. Pros: fast. Cons: cost and possible duplicate/old records.
* **Partnerships**:

  * **Distributors / wholesalers (e.g., Solar wholesalers)** — they often maintain installer lists and may partner to send leads.
  * **Industry associations** (Master Electricians, Master Plumbers, CEC/SAustralia) — negotiate co-branded listing / member directory access.
* **Paid Ads → Signup Capture** — run targeted ads to installers offering free credits to sign up and verify ABN — easiest way to get verified emails/phones and scale a clean list.
* **Events & Trade Shows** — collect business cards and scan them into CSV.

---

# 6) Tools vs cost estimate (rough) — first-pass NSW+VIC project

> Assumptions: 10k–30k companies to collect; team: 1 backend dev, 1 data engineer, 1 part-time VA for verification.

**One-off / Setup**

* Dev (2–4 weeks): $6k–$20k depending rates.
* Proxy service (if needed): $200–$1,000/month.
* Google Places API budget (20k lookups): ~$500–$1,000.
* Hunter / Clearbit credits (5k lookups): $200–$1,000.
* Twilio Lookup/Phone validation (5k lookups): $50–$200.
* Data vendor purchase (optional): $500–$5,000+ depending quality.

**Ongoing**

* API calls & hosting: $200–$1,500/mo.
* Monthly re-validation job: same APIs cost prorated.
* VA verification (part-time): $500–$1,200/mo.

Total initial budget realistic: **$7k–$30k** depending on scope and whether you purchase lists.

---

# 7) Expected scale & timeframe

* **Seed authoritative list** (registries + ABN): 2–5 days. Expect hundreds–low thousands of solar installers depending on coverage.
* **Google Places enrichment + directories scraping**: 1–3 weeks to get **several thousand** records in NSW+VIC. (Exact count depends on how you filter — e.g., only "solar installer" vs general electricians who do solar).
* **Full email enrichment & verification**: additional 1–2 weeks.
* **Total to usable CSV for NSW+VIC solar**: **2–6 weeks**.
* Nationwide expansion: multiply time & cost; once pipelines are in place expansion to all states is mostly additional API costs and scraping cycles.

---

# 8) Data quality & storage — best practices

* Keep `source_url` and `raw_json` for traceability.
* Keep `registerVersion` when using official sources (e.g., CER register date).
* Store `confidence_score` (0–100) and `history` of changes.
* Record `last_verified` timestamp.
* Provide `unsubscribe` and opt-out mechanism for outbound emails.

---

# 9) Outreach & conversion: turn data into value

* Use the collected data for:

  * **Lead selling**: deliver only verified, high-confidence leads to paid installers (charge premium).
  * **Installer onboarding**: email + call installers to invite to claim their profile; offer 1–2 free exclusive leads to get them to confirm phone/email.
  * **Partnership outreach**: sell white-label feeds to council/retailer partners.

Make sure your outreach follows anti-spam laws and best practices (double opt-in for email marketing).

---

# 10) Quick starter implementation snippets & examples

Below are *examples* (pseudocode) you can give to your dev to start.

### Google Places (Python) — Place Search + Details

```python
import requests

API_KEY = "YOUR_GOOGLE_PLACES_API_KEY"
def place_search(query, location=None, radius=50000):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": query, "key": API_KEY, "region":"au"}
    if location:
        params["location"] = f"{location['lat']},{location['lng']}"
        params["radius"] = radius
    r = requests.get(url, params=params).json()
    return r.get("results", [])

def place_details(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {"place_id": place_id, "key": API_KEY, "fields":"name,formatted_address,formatted_phone_number,website"}
    r = requests.get(url, params=params).json()
    return r.get("result", {})
```

### ABN Lookup (official)

* Use ABR API: [https://abr.business.gov.au/Documentation](https://abr.business.gov.au/Documentation) - provides businessName, ABN, addresses (requires account).

### Hunter domain search (email by domain)

```python
# hunter.io example
import requests
HUNTER_KEY = "YOUR_HUNTER_KEY"
def hunter_domain_search(domain):
    url = "https://api.hunter.io/v2/domain-search"
    params = {"domain": domain, "api_key": HUNTER_KEY}
    return requests.get(url, params=params).json()
```

### Dedupe (fuzzy match)

* Use `fuzzywuzzy` (token set ratio) or Postgres trigram index.

---

# 11) Final recommendations & next steps (what I can do for you)

I can help you in any of these immediate ways — pick one or more:

1. **Design & deliver the NSW+VIC Solar CSV** (I’ll prepare the pipeline spec & deliver the final CSV structure and the list of sources + instructions for your dev). *You will need to run the actual API calls / scraping steps in your infra or hire me to produce code snippets which your dev runs.*
2. **Provide ready-to-run scripts (Scrapy + Python + Google Places)** and config for ABN and enrichment APIs so your engineering team can run them and generate CSVs.
3. **Prepare a vendor list & negotiation email template** to buy licensed datasets (YellowPages partners, local data providers) — saves dev time.
4. **Build the "claim your profile" onboarding funnel and marketing copy** to collect direct, verified installer details (fastest high-quality source).

---

# Important legal reminder

You requested *publicly available* data — which is fine — but large-scale scraping from some directories or marketplaces may violate their Terms of Service and could cause IP blocks or legal action. For high-volume collection, prefer **official APIs and purchased/licensed data**, or permission/partnership or the product-led capture approach.

---

If you want me to **start immediately**, say which deliverable you want first:

* “Give me the runnable scripts + config to run the pipeline” (I’ll provide the code, config, and instructions).
* “Produce a prioritized vendor & API procurement list with estimated costs” (I’ll list vendors, contacts, and price ranges).
* “Design the Claim-Your-Profile onboarding flow + marketing sequence” (copy + email/landing pages to acquire verified installer data).

Which do you want me to produce now?

-----------------------------------------------------------

**Short answer: NO, you don’t need to pay for anything to do normal web scraping.**

Here’s the breakdown:

### ✅ **Free**

* Using **Python**, **VS Code**, **BeautifulSoup**, **Requests**, **Selenium** → all free
* Scraping public websites → free
* Saving results to CSV/Excel → free

### ⚠️ **Sometimes Paid (Optional)**

Only if you choose special tools:

1. **Paid rotating proxies / anti-blocking services**

   * Cost: **$10–$50/month** depending on usage
   * Reason: Some websites block IPs after many requests. Proxies rotate your IP.

2. **Paid web scraping platforms**

   * Tools like Apify, ScraperAPI, BrightData
   * Cost: usually **pay-per-request** (e.g., $5–$20 per month)
   * Reason: They provide ready-made scrapers + unblocked browsing + cloud servers.

3. **Paid SEO tools**

   * If you want SpyFu, Ahrefs, Semrush, etc.
   * Cost: **$30–$120 per month**
   * Reason: These tools give detailed competitor data, keyword data, and website lists—not scraping.

### 🎯 **For your solar installer data collection**

**You can do 100% free scraping** using Python + BeautifulSoup + Selenium.

Only pay if:

* You need **millions of pages**
* Or target sites are **blocking normal scraping**
* Or you want **heavy SEO data** from SpyFu/Ahrefs/Semrush

### 😊 Summary:

**For your current goal (collecting AU solar installer websites + contacts):
No cost required.**

If you want, I can also tell you:

* How to avoid being blocked
* How many scrapes are safe per hour
* When to use proxies

Just tell me!
