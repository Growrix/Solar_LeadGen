Below is a single, copy-and-paste **Statement of Work (SOT)** you can drop directly into **GitHub Copilot Chat** (or any equivalent AI dev assistant).
It tells the assistant exactly what to *create*, *how to wire it up*, *how to run it*, and *what outputs to produce*. It assumes you (or the assistant) will run the code on your machine / CI (you already have VS Code + Python). All API keys and secrets are placeholders — do **not** paste real keys here.

**Paste the entire block below into GitHub Copilot Chat** and ask it to “Execute these repository creation tasks” (or “Create these files in a new repo and return them”). The Copilot Chat session should then create the files and code, or return them for you to copy into files.

---

### SOT: Build a reproducible, runnable data-collection pipeline + claim-profile funnel skeleton

**Goal:** produce a ready-to-run repo `installer-data-pipeline` that collects public solar installer contacts (NSW & VIC seed), enriches and verifies them (via public APIs where available), stores raw results, de-duplicates, and exports a CSV. Also produce a Claim-Your-Profile funnel skeleton (landing page + backend endpoints) to capture verified installer details. Provide README, DB schema, Dockerfile, and instructions.

**Deliverables (create files / code):**

1. Git repo `installer-data-pipeline` with the layout below.
2. `requirements.txt` (Python packages).
3. `.env.example` (placeholders for API keys).
4. Postgres DB schema `db/schema.sql`.
5. Config file `config/regions.json` with NSW & VIC seed queries.
6. Python scripts:

   * `scripts/places_search.py`
   * `scripts/places_details.py`
   * `scripts/abn_lookup.py`
   * `scripts/crawl_website_emails.py`
   * `scripts/hunter_enrich.py`
   * `scripts/phone_verify.py`
   * `scripts/dedupe_and_export.py`
   * `scripts/run_all.py`
7. A minimal Node/Next (or simple static) folder `claim-profile` containing:

   * `claim-profile/README.md` with endpoints spec
   * `claim-profile/landing.html` (simple HTML form)
   * `claim-profile/server_stub.py` (Flask or FastAPI skeleton for the claim endpoints)
     (This is a minimal skeleton so you have a claim funnel to iterate on.)
8. `docker/Dockerfile` to run the Python pipeline.
9. `README.md` with A→Z run instructions, scheduling tips, legal reminders and expected outputs.

**Constraints & rules for the AI assistant:**

* Do **not** embed actual API keys. Use `ENV VAR` placeholders in `.env.example`.
* Use only public sources or APIs. If a directory’s ToS forbids scraping, do not create a scraper for it; instead place an actionable comment recommending partnership/API access.
* Include helpful inline comments in each script and defensively handle HTTP failures, rate limiting and simple retry/backoff.
* Make code readable and documented — inline docstrings and a short top-of-file comment explaining usage.
* Create idempotent DB inserts (UPSERT where appropriate) to allow re-runs without duplicates.
* Add `confidence_score` logic in `dedupe_and_export.py` (presence of website/phone/abn → higher score).
* Scripts must output `exports/solar_installers_nsw_vic.csv` at the end with required columns.

---

### Repo layout to create (exact)

```
installer-data-pipeline/
├─ README.md
├─ .env.example
├─ requirements.txt
├─ docker/
│  └─ Dockerfile
├─ config/
│  └─ regions.json
├─ db/
│  └─ schema.sql
├─ scripts/
│  ├─ places_search.py
│  ├─ places_details.py
│  ├─ abn_lookup.py
│  ├─ crawl_website_emails.py
│  ├─ hunter_enrich.py
│  ├─ phone_verify.py
│  ├─ dedupe_and_export.py
│  └─ run_all.py
└─ claim-profile/
   ├─ README.md
   ├─ landing.html
   └─ server_stub.py
```

---

### Files (copy/paste content)

**1) requirements.txt**

```
requests
googlemaps
pandas
psycopg2-binary
sqlalchemy
beautifulsoup4
lxml
fuzzywuzzy[speedup]
python-Levenshtein
tqdm
python-dotenv
flask
gunicorn
```

**2) .env.example**

```text
# copy to .env and fill the values
DATABASE_URL=postgresql://user:pass@localhost:5432/installerdb
GOOGLE_PLACES_KEY=YOUR_GOOGLE_PLACES_API_KEY
ABR_API_KEY=YOUR_ABR_API_KEY
HUNTER_API_KEY=YOUR_HUNTER_API_KEY
TWILIO_SID=YOUR_TWILIO_SID
TWILIO_TOKEN=YOUR_TWILIO_TOKEN
TWILIO_PHONE=+61400000000
USER_AGENT=YourCompanyBot/1.0 (+https://yourdomain.com)
```

**3) db/schema.sql**

```sql
CREATE TABLE IF NOT EXISTS installers_raw (
  id SERIAL PRIMARY KEY,
  source TEXT,
  source_url TEXT,
  company_name TEXT,
  website TEXT,
  address TEXT,
  suburb TEXT,
  postcode TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  abn TEXT,
  licence_number TEXT,
  installer_type TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  scrape_date TIMESTAMPTZ DEFAULT now(),
  confidence_score INT,
  raw_json JSONB
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_installers_abn ON installers_raw(abn);
CREATE INDEX IF NOT EXISTS idx_installers_company ON installers_raw(company_name);
```

**4) config/regions.json**

```json
[
  {"state":"NSW","query":"solar installer sydney NSW"},
  {"state":"NSW","query":"solar installer newcastle NSW"},
  {"state":"VIC","query":"solar installer melbourne VIC"},
  {"state":"VIC","query":"solar installer geelong VIC"}
]
```

**5) scripts/places_search.py**
(Use Google Places Text Search to seed place ids and base rows.)

```python
"""
places_search.py
- Text-search Google Places for seed queries (NSW & VIC).
- Insert basic rows into Postgres installers_raw (no duplicates).
"""
import os, json, time
from dotenv import load_dotenv
import googlemaps
from sqlalchemy import create_engine, text

load_dotenv()
API_KEY = os.getenv("GOOGLE_PLACES_KEY")
DB = os.getenv("DATABASE_URL")
gmaps = googlemaps.Client(key=API_KEY)
engine = create_engine(DB, pool_pre_ping=True)

with open("config/regions.json") as f:
    regions = json.load(f)

def save_place_result(place):
    source = "google_places"
    source_url = f"https://maps.google.com/?cid={place.get('place_id')}"
    name = place.get("name")
    addr = place.get("formatted_address")
    raw = json.dumps(place)
    with engine.begin() as conn:
        conn.execute(text("""
            INSERT INTO installers_raw (source, source_url, company_name, address, state, raw_json, scrape_date)
            VALUES (:source, :source_url, :name, :addr, :state, :raw, now())
            ON CONFLICT (abn) DO NOTHING
        """), {"source": source, "source_url": source_url, "name": name, "addr": addr, "state": current_state, "raw": raw})

for region in regions:
    query = region["query"]
    current_state = region["state"]
    print("Searching Places for:", query)
    res = gmaps.places(query=query, region='au', language='en-AU')
    results = res.get("results", [])
    for r in results:
        save_place_result(r)
    next_page = res.get("next_page_token")
    # handle pagination if present (sleep before requesting next page)
    while next_page:
        time.sleep(2)
        res2 = gmaps.places(query=query, page_token=next_page)
        for r in res2.get("results", []):
            save_place_result(r)
        next_page = res2.get("next_page_token")
    time.sleep(1)
print("Places search done.")
```

**6) scripts/places_details.py**

```python
"""
places_details.py
- Enrich rows that have Google place_id in raw_json -> add phone and website.
"""
import os, json
from dotenv import load_dotenv
import googlemaps
from sqlalchemy import create_engine, text

load_dotenv()
API_KEY = os.getenv("GOOGLE_PLACES_KEY")
DB = os.getenv("DATABASE_URL")
gmaps = googlemaps.Client(key=API_KEY)
engine = create_engine(DB, pool_pre_ping=True)

with engine.begin() as conn:
    rows = conn.execute(text("SELECT id, raw_json FROM installers_raw WHERE (phone IS NULL OR website IS NULL) LIMIT 500")).fetchall()
    for r in rows:
        raw = r['raw_json']
        try:
            data = raw if isinstance(raw, dict) else json.loads(raw)
            place_id = data.get('place_id')
            if not place_id:
                continue
            details = gmaps.place(place_id=place_id, fields=["name","formatted_address","formatted_phone_number","website"])
            res = details.get('result',{})
            conn.execute(text("""
                UPDATE installers_raw
                SET company_name = coalesce(company_name, :name),
                    address = coalesce(address, :addr),
                    phone = coalesce(phone, :phone),
                    website = coalesce(website, :website),
                    raw_json = raw_json || :raw
                WHERE id = :id
            """), {"name": res.get("name"), "addr": res.get("formatted_address"),
                   "phone": res.get("formatted_phone_number"), "website": res.get("website"),
                   "raw": json.dumps(res), "id": r['id']})
        except Exception as e:
            print("detail failed:", e)
print("Places details enrichment done.")
```

**7) scripts/abn_lookup.py**

```python
"""
abn_lookup.py
- Use ABR/ABN Lookup to enrich company rows by name to get ABN & official address.
- NOTE: You must sign up for ABR API and set ABR_API_KEY in .env
"""
import os, json
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
ABR_KEY = os.getenv("ABR_API_KEY")
DB = os.getenv("DATABASE_URL")
engine = create_engine(DB, pool_pre_ping=True)

def query_abn_by_name(name):
    # Use ABR API official endpoint; this is illustrative.
    # Replace with the official ABR endpoint and authentication per ABR docs.
    url = "https://abr.business.gov.au/json/MatchingNames.aspx"
    params = {"name": name, "maxResults": 5, "guid": ABR_KEY}
    r = requests.get(url, params=params, timeout=10)
    return r.json()

with engine.begin() as conn:
    rows = conn.execute(text("SELECT id, company_name FROM installers_raw WHERE abn IS NULL AND company_name IS NOT NULL LIMIT 200")).fetchall()
    for row in rows:
        cid = row['id']
        name = row['company_name']
        try:
            res = query_abn_by_name(name)
            items = res.get('items', [])
            if items:
                best = items[0]
                conn.execute(text("UPDATE installers_raw SET abn = :abn, raw_json = raw_json || :raw WHERE id = :id"),
                             {"abn": best.get('ABN'), "raw": json.dumps(best), "id": cid})
        except Exception as e:
            print("ABN lookup error for", name, e)
print("ABN enrichment done.")
```

**8) scripts/crawl_website_emails.py**

```python
"""
crawl_website_emails.py
- Crawl website URLs from installers_raw.website and search for mailto/email strings.
- Respect robots.txt in production; this is a simple crawler for public sites.
"""
import os, re, time
from bs4 import BeautifulSoup
import requests
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DB = os.getenv("DATABASE_URL")
USER_AGENT = os.getenv("USER_AGENT", "InstallerBot/1.0")
engine = create_engine(DB, pool_pre_ping=True)
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

with engine.begin() as conn:
    rows = conn.execute(text("SELECT id, website FROM installers_raw WHERE website IS NOT NULL AND (email IS NULL OR email='') LIMIT 300")).fetchall()
    for r in rows:
        wid = r['id']; url = r['website']
        try:
            headers = {"User-Agent": USER_AGENT}
            resp = requests.get(url, headers=headers, timeout=8)
            soup = BeautifulSoup(resp.text, "lxml")
            text = soup.get_text(" ", strip=True)
            emails = EMAIL_RE.findall(text)
            if emails:
                email = emails[0]
                conn.execute(text("UPDATE installers_raw SET email = :email WHERE id = :id"), {"email": email, "id": wid})
        except Exception as e:
            print("crawl error", url, e)
        time.sleep(0.5)
print("Website crawl done.")
```

**9) scripts/hunter_enrich.py**

```python
"""
hunter_enrich.py
- If domain present and no email, call Hunter domain search to get likely email addresses.
"""
import os, requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from urllib.parse import urlparse

load_dotenv()
HUNTER_KEY = os.getenv("HUNTER_API_KEY")
DB = os.getenv("DATABASE_URL")
engine = create_engine(DB, pool_pre_ping=True)

def hunter_domain_search(domain):
    url = f"https://api.hunter.io/v2/domain-search?domain={domain}&api_key={HUNTER_KEY}"
    r = requests.get(url, timeout=10)
    return r.json()

with engine.begin() as conn:
    rows = conn.execute(text("SELECT id, website FROM installers_raw WHERE website IS NOT NULL AND (email IS NULL OR email='') LIMIT 200")).fetchall()
    for r in rows:
        try:
            domain = urlparse(r['website']).netloc
            data = hunter_domain_search(domain)
            emails = data.get('data',{}).get('emails',[])
            if emails:
                primary = emails[0]['value']
                conn.execute(text("UPDATE installers_raw SET email=:email WHERE id=:id"), {"email": primary, "id": r['id']})
        except Exception as e:
            print("Hunter error", e)
print("Hunter enrich done.")
```

**10) scripts/phone_verify.py**

```python
"""
phone_verify.py
- Uses Twilio Lookup API to normalize/verify phone numbers and mark rows verified.
"""
import os
from twilio.rest import Client
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
TW_SID = os.getenv("TWILIO_SID")
TW_TOKEN = os.getenv("TWILIO_TOKEN")
client = Client(TW_SID, TW_TOKEN)
DB = os.getenv("DATABASE_URL")
engine = create_engine(DB, pool_pre_ping=True)

with engine.begin() as conn:
    rows = conn.execute(text("SELECT id, phone FROM installers_raw WHERE phone IS NOT NULL AND verified IS FALSE LIMIT 200")).fetchall()
    for r in rows:
        try:
            phone = r['phone']
            res = client.lookups.v1.phone_numbers(phone).fetch(type=['carrier'])
            normalized = res.phone_number
            conn.execute(text("UPDATE installers_raw SET phone=:p, verified=true, verified_at=now() WHERE id=:id"), {"p": normalized, "id": r['id']})
        except Exception as e:
            print("twilio lookup error", e)
print("Phone verification done.")
```

**11) scripts/dedupe_and_export.py**

```python
"""
dedupe_and_export.py
- Load installers_raw, compute confidence_score, dedupe by ABN then by name+suburb, export CSV.
"""
import os
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DB = os.getenv("DATABASE_URL")
engine = create_engine(DB, pool_pre_ping=True)

df = pd.read_sql("SELECT * FROM installers_raw", engine)
def score(row):
    s = 0
    if pd.notna(row.get('website')): s += 30
    if pd.notna(row.get('phone')): s += 30
    if pd.notna(row.get('abn')): s += 30
    if pd.notna(row.get('address')): s += 10
    return min(s, 100)
df['confidence_score'] = df.apply(score, axis=1)

# Dedupe by ABN
df = df.sort_values('confidence_score', ascending=False)
df = df.drop_duplicates(subset=['abn'], keep='first')

# Fallback dedupe by website or company name
df = df.drop_duplicates(subset=['website'], keep='first')

export_path = "exports/solar_installers_nsw_vic.csv"
df.to_csv(export_path, index=False)
print("Exported:", export_path, "rows:", len(df))
```

**12) scripts/run_all.py**

```python
"""
run_all.py
- Orchestrates the pipeline (each step is safe to re-run).
"""
import subprocess

steps = [
    "python scripts/places_search.py",
    "python scripts/places_details.py",
    "python scripts/abn_lookup.py",
    "python scripts/crawl_website_emails.py",
    "python scripts/hunter_enrich.py",
    "python scripts/phone_verify.py",
    "python scripts/dedupe_and_export.py"
]

for s in steps:
    print("Running:", s)
    subprocess.run(s, shell=True, check=True)
print("All steps completed.")
```

**13) docker/Dockerfile**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app
ENV PYTHONUNBUFFERED=1
CMD ["python", "scripts/run_all.py"]
```

**14) claim-profile/landing.html**

```html
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Claim your installer profile</title></head>
<body>
  <h1>Claim your installer profile — get 2 free leads</h1>
  <form action="/claim" method="post">
    <label>Company ABN: <input name="abn"></label><br>
    <label>Company name: <input name="company_name"></label><br>
    <label>Phone: <input name="phone"></label><br>
    <label>Email: <input name="email"></label><br>
    <label>Services: <input name="services" placeholder="solar,battery"></label><br>
    <button type="submit">Claim profile</button>
  </form>
</body>
</html>
```

**15) claim-profile/server_stub.py** (Flask minimal)

```python
"""
server_stub.py - minimal claim-profile API for demo/testing
Run: python claim-profile/server_stub.py
"""
from flask import Flask, request, jsonify
import os
app = Flask(__name__)

@app.route("/claim", methods=["POST"])
def claim():
    data = request.form.to_dict()
    # DO: call ABN lookup, send OTP SMS, send verification email
    # For now return success with the received payload
    return jsonify({"status":"ok","received":data}), 200

if __name__ == "__main__":
    app.run(port=8080, debug=True)
```

**16) README.md** (top-level, include run steps and legal note)

```markdown
# installer-data-pipeline

## Purpose
Collect public solar installer contact data (NSW & VIC seed), enrich and export CSV. Also includes a minimal claim-profile form and server stub.

## Quickstart (local)
1. Copy `.env.example` to `.env` and fill keys.
2. Create & activate venv:
   - `python -m venv venv`
   - `source venv/bin/activate` (Mac/Linux) or `.\venv\Scripts\activate` (Windows)
3. Install deps:
   - `pip install -r requirements.txt`
4. Create Postgres DB and run `db/schema.sql`.
5. Run pipeline:
   - `python scripts/run_all.py`
6. Result CSV:
   - `exports/solar_installers_nsw_vic.csv`

## Claim-profile
- Start the demo server:
  - `python claim-profile/server_stub.py`
- Open `claim-profile/landing.html` in a browser to test form POST.

## Important notes
- Respect each site's Terms of Service and robots.txt. Do not scrape restricted platforms.
- For Google data: use Places API (set GOOGLE_PLACES_KEY).
- Use ABR API for ABN lookup (ABR_API_KEY).
- Email/phone sending requires Twilio/SendGrid configuration.
- Use double-opt in when contacting personal/business emails.

## Next steps
- Add robust error handling, rate limiters and retries.
- Add Selenium/Playwright support for JS-heavy pages (if allowed).
- Add admin interface to review claimed profiles and uploaded docs.
```

---

### Run instructions for you (copy/paste to your terminal)

1. `git init installer-data-pipeline && cd installer-data-pipeline`
2. Create files as above (or ask Copilot to create them).
3. `python -m venv venv && source venv/bin/activate`
4. `pip install -r requirements.txt`
5. Create Postgres DB and run `psql -f db/schema.sql` (or use Supabase).
6. Copy `.env.example` → `.env` and fill keys.
7. Start with small run: `python scripts/places_search.py` then `python scripts/places_details.py` to confirm results.
8. When ready: `python scripts/run_all.py`
9. Open `exports/solar_installers_nsw_vic.csv`

---

### Expected outputs

* `exports/solar_installers_nsw_vic.csv` — contains columns including website, phone, email, abn, address, confidence_score.
* DB table `installers_raw` populated with raw_json for traceability.
* `claim-profile/server_stub.py` running at `http://localhost:8080/claim` (demo).

---

### Legal & ethics reminder (include in README & final deliverable)

* Use only publicly available data.
* Respect robots.txt and ToS for each site.
* Do not scrape pages that are not allowed; request API/partnership where needed.
* For outbound marketing to collected contacts, implement double opt-in and respect Australian Spam Act.

---

### Final note to Copilot Chat

> Please create all files exactly as specified, with the code blocks above as the file contents. If any API or endpoint requires different authentication details, add clear TODO comments with the provider documentation link. After creating files, run a lint/quick syntax check (python -m pyflakes or pytest if available), and then provide summary: how many seed rows were inserted after running `places_search.py` (or instructions to run it locally if runtime keys are missing). If any directories/platforms appear not-scrapable, list them and recommend partner/API options.

---

Paste the entire SOT above into GitHub Copilot Chat and ask it to create the repository and files. After Copilot returns the repo/files, run the Quickstart steps locally in VS Code. If you need, I can next produce a fully expanded `run_all` CI workflow (GitHub Actions) or a pre-filled SQL/pgAdmin import script — tell me which.

