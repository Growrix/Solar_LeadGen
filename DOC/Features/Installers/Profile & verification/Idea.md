Below is **a clean, structured, fully-organized blueprint** for both:

✅ **Installer Verification Form (modal / multi-step)**
✅ **Installer Profile Management Page (dashboard page)**

This version is **industry-standard**, logical, implementation-ready, and broken into:

* **UX Structure**
* **Backend/Database Requirements**
* **Front-End Component Guidelines**
* **Validation & Verification Logic**
* **Admin Panel Integration**

---

# ✅ PART 1 — INSTALLER VERIFICATION FORM (MODAL)

This is the form installers must submit for admin approval.
Recommended: **Multi-step modal** to increase completion rate.

---

## **A. UX FLOW (multi-step modal)**

### **Step 1 — Personal & Company Identity**

* Company Name (required)
* Representative Name (required)
* Designation (required)
* Email (required)
* Contact Number (required)

Buttons: **Next**

---

### **Step 2 — Business Legal Details**

* ABN / License Number (required)
* Company Established Year (required)
* Employee Count (required)

Optional uploads (file inputs):

* Upload License Document
* Upload ABN Document

Buttons: **Back | Next**

---

### **Step 3 — Services & Coverage Areas**

Required:

* Types of Services Offered → multi-select (installation, maintenance, inspection…)
* Service Areas → multi-select (suburbs, cities, regions)
* Postcodes Served → allow multiple entries

Optional:

* Website URL
* Social Media links
* Company Logo upload
* Company Description (“About Us”)

Buttons: **Back | Submit Application**

---

## **B. LOGIC FLOW**

### **1. Installer submits verification form → status becomes:**

`status = "submitted_pending_admin_review"`

### **2. Admin reviews → status options**

* **Approved** → installer becomes “Verified Installer”
* **Rejected** → installer receives reason + option to re-submit
* **Needs More Info** → admin requests additional files/details

### **3. Installer receives notifications**

Email + dashboard alert:

* “Your verification is under review”
* “Approved”
* “Rejected (with instructions)”

---

## **C. DATABASE STRUCTURE (Supabase / PostgreSQL)**

### `installers_verification`

| field               | type      | notes                         |
| ------------------- | --------- | ----------------------------- |
| id                  | uuid      | primary key                   |
| installer_id        | uuid      | FK to users                   |
| company_name        | text      | required                      |
| representative_name | text      | required                      |
| designation         | text      | required                      |
| email               | text      | required                      |
| phone               | text      | required                      |
| abn_license         | text      | required                      |
| est_year            | integer   | required                      |
| employee_count      | integer   | required                      |
| services            | text[]    | required                      |
| service_areas       | text[]    | required                      |
| post_codes          | text[]    | required                      |
| website             | text      | optional                      |
| social_links        | jsonb     | optional                      |
| company_description | text      | optional                      |
| license_doc_url     | text      | optional                      |
| abn_doc_url         | text      | optional                      |
| logo_url            | text      | optional                      |
| status              | text      | pending / approved / rejected |
| admin_notes         | text      | optional                      |
| created_at          | timestamp |                               |
| updated_at          | timestamp |                               |

---

## **D. FRONT-END IMPLEMENTATION GUIDELINES**

### Components Needed

* `<VerificationModal />`
* `<MultiStepForm />`
* `<FileUploader />`
* `<MultiSelect />`
* `<AddressSelector />`
* `<FormValidationSchema />` (Zod/Yup)
* `<StatusBanner />`

### Validation (recommended: Zod)

* Check required fields
* Validate phone
* Validate ABN/license format
* Validate website/social URLs
* Validate file types (png,jpg,pdf)

---

## **E. ADMIN PANEL VIEW**

**Admin Dashboard → Verify Installers → Detailed Application View**

Admin actions:

* Approve
* Reject (with reason)
* Ask for more information

Admin audit trail stored in a separate table: `installer_verification_log`.

---

# ✅ PART 2 — INSTALLER PROFILE MANAGEMENT PAGE

This is a dedicated page inside the installer dashboard where they can view/edit their data.

URL example:
`/installer/dashboard/profile`

---

## **A. PAGE STRUCTURE (UI Sections)**

### **1. Header**

* Profile photo or company logo
* Verification badge (if approved):
  ✔️ Verified Installer
  or
  ⏳ Pending Approval
  ❗ Rejected – Resubmit Form

---

### **2. Profile Overview (Read-only by default)**

Displays all details in separate sections:

#### **A. Personal Details**

* Representative Name
* Designation
* Contact Number
* Email Address
* Profile picture (optional)

#### **B. Company Details**

* Company Name
* ABN/license number
* Established year
* Employee count
* Logo
* Company description

#### **C. Services & Areas**

* Services offered (chips/tags)
* Service areas (chips/tags)
* Postcodes served
* Website, Social links

---

## **3. Edit Mode**

When user clicks **"Edit Profile"**:

* Switch sections to form mode
* Pre-fill all fields
* Form validation
* Buttons: **Save | Cancel**

### **UI Pattern**

* Use section cards
* Use accordions for mobile
* Group fields logically
* Use shadcn/ui form components

---

## **4. Password Change Section**

* Current Password
* New Password
* Confirm New Password
* Password strength indicator
* “Save Password” button

Validation rules:

* Min 8 characters
* At least 1 number
* At least 1 special character

---

## **5. Notification Preferences**

Toggle-based UI:

**Lead Alerts**

* New Lead Available
* Lead Updates
* Admin Messages

**System Alerts**

* Verification status updates
* Account activity alerts

Stored in: `installer_preferences` table.

---

## **6. Email & Contact Verification**

### Email Verification:

* “Verify Email” button
* Sends OTP or link
* Verified state shown as ✔️

### Phone Verification:

* OTP-based
* Status shown in profile

---

## **7. Responsive Design Guidelines**

* Use grid layout → 1 column mobile, 2 columns tablet & desktop
* Accordions for section grouping
* File uploads must work on mobile
* Text inputs optimized for mobile keyboards

---

# 📌 TECH IMPLEMENTATION SUMMARY (copy-paste friendly)

## **Front-end (Next.js + React + Tailwind)**

* Pages

  * `/installer/dashboard/profile`
* Components

  * `ProfileView.tsx`
  * `ProfileEditForm.tsx`
  * `PasswordChange.tsx`
  * `NotificationsForm.tsx`
  * `VerificationModal.tsx`
* Validation

  * Zod schemas
* State

  * React Query or Zustand for profile data
* UI

  * shadcn/ui form, card, tabs, badge, modal components

---

## **Backend**

* Supabase for database, storage, email OTP
* API routes:

  * GET `/api/installer/profile`
  * PUT `/api/installer/profile/update`
  * PUT `/api/installer/password`
  * PUT `/api/installer/preferences`
  * POST `/api/installer/verification/submit`

---

# 🎯 FINAL RESULT

You now have:

### ✔ A fully organized Installer Verification Form (multi-step modal)

### ✔ A complete Installer Profile Management Page blueprint

### ✔ Full UI breakdown

### ✔ Full backend/database structure

### ✔ Validation logic

### ✔ Admin panel workflow

### ✔ Fully implementation-ready architecture

---

If you want, I can also generate:
✅ **Full UI Screens (Figma-style structure)**
✅ **Actual shadcn/ui React code**
✅ **Supabase table scripts**
✅ **API route code (server actions)**
Just tell me **“Generate UI”**, “Generate database scripts”, or “Generate API code.”
