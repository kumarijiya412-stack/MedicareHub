# MediCare Hub — Personal & Family Health Companion

> A production-style, privacy-first healthcare web application designed to help individuals and families manage clinical history, track symptoms with specialist triage, evaluate hereditary risks, receive preventive screening test reminders, book verified hospital doctors, and save on medicines via certified multi-seller price comparisons.

---

## Highlights & Key Features

### 1. Medical History Vault
- Full CRUD for chronic conditions, past surgeries, verified drug allergies, and active medications.
- Track diagnosis dates, clinical status (*Active*, *Managed*, *Resolved*), triggers, and hospital notes.
- Family member isolation: Switch view to inspect records for yourself or dependents.

### 2. Symptoms Tracker with Specialist Triage
- Log physical symptoms with severity (*Mild*, *Moderate*, *Severe*), duration, and onset dates.
- Interactive chronological timeline grouped by date.
- **Intelligent Specialist Recommender:** Automatically directs users to relevant medical specialists (e.g. Neurologist for tension headaches, Cardiologist for chest tightness, Dermatologist for hives).
- **Mandatory Clinical Disclaimer:** Prominently states that triage suggestions are informational and do not replace professional physician consultations.

### 3. Family Medical History & Hereditary Risk Engine
- Biological relative health registry (parents, siblings, grandparents).
- **Automated Hereditary Analysis:** Detects familial predispositions for:
  - Coronary Artery & Cardiovascular Disease
  - Type 2 Diabetes Mellitus
  - Primary Arterial Hypertension
  - Familial Oncology Awareness
- Provides clinical risk levels (*Moderate*, *Elevated*), affected relatives list, specific preventive screening actions (ApoB, HbA1c, CAC scoring), and prompts to discuss with your doctor.

### 4. Recommended Preventive Tests
- Clinical preventive screening suggestions based on adult guidelines (Complete Blood Count, Comprehensive Lipid Profile, HbA1c, Thyroid Stimulating Hormone, Vitamin D & B12).
- One-click **Due / Completed** status toggling.
- Customizable reminder switches and custom test addition.

### 5. Doctor Check-ups & Appointments
- Seeded top hospital specialists across New Delhi, Mumbai, Bangalore, Gurgaon, Hyderabad.
- View doctor qualifications, hospital affiliations, consultation fees, and patient ratings.
- Real-time time slot booking, collision prevention, rescheduling, and cancellation.
- **"Suggested Doctors for You"** section tailored to your active symptoms or medical conditions.

### 6. Encrypted Medical Reports Vault
- Upload lab PDFs, X-ray scans, and discharge summaries (with MIME-type and 10MB size validation).
- Categorized by type (*Lab Test*, *Radiology*, *Prescription*, *Discharge Summary*).
- Instant in-browser modal preview and secure direct download.

### 7. Verified Patient ID Card
- Unique digital patient identity (e.g. `MCH-2026-78421`).
- Authentic SVG QR Code containing verification portal metadata.
- Official green **"Verified Patient"** badge once email is confirmed.
- One-click print layout and clipboard copy.

### 8. Medicine Store with Multi-Seller Price Comparison
- Catalog with composition, dosage form, packaging, manufacturer, and CDSCO/WHO-GMP verified batch numbers.
- **Compare Prices Panel:** Displays live pricing across 3+ certified sellers (*Apollo Pharmacy*, *Tata 1mg*, *Netmeds*, *PharmEasy*), automatically highlighting the lowest seller with a **"Best Price"** tag.
- **Prescription Gate:** Items flagged as prescription-required (*Rx*) mandate uploading a physician prescription file before checkout.
- **Mock Payment Gateway:** Structured integration point simulating UPI, Credit/Debit Cards, Net Banking, and COD.
- **Live Order Tracking Timeline:** 5-stage progression (*Ordered* -> *Pharmacist Verified* -> *Packed* -> *Shipped* -> *Delivered*).

### 9. Family Profile Switcher & Settings
- Switch between managing your own health records and any linked family member (*Child*, *Parent*, *Spouse*, *Sibling*, *Other*).
- Data privacy: Export complete health records in JSON format.
- Account deletion with password confirmation.

---

## Design System

| Element | Specification |
| :--- | :--- |
| **Primary Color** | Pinkish Red (`#E11D48` / `#F43F5E`) for headers, active tabs, buttons, highlights |
| **Secondary Color** | Medical Green (`#10B981` / `#059669`) for verified badges, health success states, pharmacy |
| **Backgrounds** | Clean white (`#FFFFFF`) and soft pink-tinted off-white (`#FFF8F9`, `#FFF1F3`) |
| **Borders & Shadows** | Soft rounded cards (`rounded-3xl`), gentle shadows (`shadow-soft`) |
| **Typography** | Modern sans-serif via Google Fonts (`Inter` and `Poppins`) |
| **Dashboard Modules** | Clear section cards for all 9 health modules |

---

## Security & Privacy (Non-Negotiable Standards)

1. **Authentication:** JWT tokens stored in `httpOnly`, `sameSite: 'lax'` secure cookies; passwords encrypted with bcrypt (10 rounds).
2. **Rate Limiting:** Brute-force protection on authentication routes (`express-rate-limit`).
3. **HTTP Headers:** Hardened security response headers via `helmet`.
4. **Input Validation:** Server-side sanitization and strict validation for email, passwords, and phone numbers.
5. **Role-Based Isolation:** Database queries strictly enforce `WHERE user_id = ?` to prevent cross-account record access.
6. **Regulatory Launch Roadmap:**
   - **India DPDP Act (2023):** Explicit consent checkbox at signup, Purpose Limitation, Right to Erasure, and Right to Data Portability (JSON Export).
   - **HIPAA & GDPR Standards:** AES-256 encrypted records storage, strict access control, and complete audit readiness.
   - **Certified Pharmacy Integration:** Requirement for licensed pharmacy tripartite agreements and digital pharmacist signatures before Schedule H dispensation.

---

## Getting Started Locally

### Prerequisites
- Node.js **v18+** (Tested on Node v24)
- npm **v9+**

### 1. Clone & Install All Dependencies
From the project root:
```bash
# Install root, backend, and frontend dependencies in one command
npm run install:all
```
*(Or install manually: `npm install && cd backend && npm install && cd ../frontend && npm install`)*

### 2. Seed Database with Realistic Medical Records
```bash
# Populates doctors, multi-seller medicines, preventive tests, and demo users
npm run seed
```

### 3. Run Development Servers
```bash
npm run dev
```
This runs both servers concurrently:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## Pre-Seeded Test Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Primary Test Patient** | `alex@medicare.com` | `Password123!` | Alex Morgan (Verified ID `MCH-2026-78421`, Blood O+, 3 Family Members, History, Symptoms, Tests) |
| **Secondary Patient** | `sarah@medicare.com` | `Password123!` | Sarah Jenkins (Blood A+) |

> **Note on Testing Sign Up & OTP:** During sign up or password reset, the 6-digit verification code is logged to the backend console and also returned in the development API response (`devOtp`) for instant, frictionless testing!

---

## Repository Architecture

```text
Medicare/
├── package.json              # Root orchestrator with concurrently
├── README.md                 # Complete documentation & run guide
├── backend/
│   ├── .env.example          # Environment template
│   ├── .env                  # Development environment configuration
│   ├── package.json          # Express, better-sqlite3, bcryptjs, jwt
│   ├── uploads/              # Local encrypted storage for PDF/image reports
│   ├── data/
│   │   └── medicare.db       # SQLite Database (WAL mode enabled)
│   └── src/
│       ├── config/
│       │   └── db.js         # SQLite connection & 15-table schema
│       ├── middleware/
│       │   ├── auth.js       # JWT httpOnly cookie verification
│       │   ├── errorHandler.js # Centralized error handler
│       │   ├── rateLimiter.js# Auth & API brute-force limiters
│       │   └── upload.js     # Multer file validator (10MB, PDF/images)
│       ├── routes/
│       │   ├── auth.js       # Signup, 6-digit OTP, login, reset password
│       │   ├── profile.js    # Personal vitals, family members CRUD, export, delete
│       │   ├── medicalHistory.js # Conditions, surgeries, allergies, meds
│       │   ├── symptoms.js   # Symptom logs, timeline, specialist triage
│       │   ├── familyGenetic.js  # Genetic conditions & hereditary risk engine
│       │   ├── recommendedTests.js# Preventive tests with Due/Done toggle
│       │   ├── patientId.js  # Digital card & QR verification endpoint
│       │   ├── doctors.js    # Specialists list, search, suggested doctors
│       │   ├── appointments.js# Book, reschedule, cancel consultations
│       │   ├── reports.js    # Upload, tag, preview, download reports
│       │   ├── medicines.js  # Catalog & multi-seller price compare
│       │   ├── cart.js       # Shopping cart management
│       │   └── orders.js     # Checkout, Rx check, mock payment, order tracker
│       ├── seeds/
│       │   └── seedData.js   # Clinical seed script
│       ├── utils/
│       │   └── validators.js # Password rules, email, phone sanitizers
│       └── server.js         # Express app entry point
└── frontend/
    ├── .env.example          # Frontend API URL configuration
    ├── .env
    ├── package.json          # React, Vite, Tailwind CSS, Lucide, QRCode
    ├── tailwind.config.js    # Custom pinkish-red & medical green design tokens
    ├── postcss.config.js
    ├── index.html            # MediCare Hub title, meta tags, SVG favicon
    └── src/
        ├── index.css         # Inter/Poppins fonts, custom scrollbars, animations
        ├── App.jsx           # Client-side router & protected routes
        ├── main.jsx
        ├── context/
        │   └── AuthContext.jsx # Session state, active profile switcher, toasts
        ├── components/
        │   ├── Navbar.jsx    # Responsive nav, brand logo, profile switcher, cart badge
        │   ├── Footer.jsx    # Emergency disclaimer, links, legal credentials
        │   ├── Modal.jsx     # Accessible dialog with ESC listener & focus trap
        │   ├── SectionCard.jsx# Colored pastel cards with icons
        │   ├── HealthOverviewStrip.jsx # Next checkup, tests due, recent report
        │   ├── MedicalDisclaimer.jsx # Reusable clinical information warning
        │   ├── Skeleton.jsx  # Shimmering loading placeholders
        │   ├── EmptyState.jsx# Illustrated empty states with actions
        │   └── ToastContainer.jsx # Floating auto-dismiss notifications
        ├── services/
        │   └── api.js        # Centralized fetch API client
        └── pages/
            ├── LandingPage.jsx       # Hero, features, how it works, trust badges
            ├── LoginPage.jsx         # Sign in, 1-click demo login, forgot password modal
            ├── SignupPage.jsx        # Real-time password strength meter & 6-digit OTP
            ├── DashboardPage.jsx     # Greeting card ("Hey, what's up"), 9 sections
            ├── MedicalHistoryPage.jsx# Categorized clinical history CRUD
            ├── SymptomsTrackerPage.jsx# Symptom timeline & specialist triage
            ├── FamilyGeneticPage.jsx # Hereditary risk panel & relative conditions
            ├── RecommendedTestsPage.jsx # Preventive tests with Due/Done toggle
            ├── AppointmentsPage.jsx  # Consultations, rescheduling, calendar
            ├── MedicalReportsPage.jsx# Upload lab reports, preview & download
            ├── PatientIdPage.jsx     # Digital health ID card with official QR code
            ├── FindDoctorsPage.jsx   # Search specialists & booking modal
            ├── MedicineStorePage.jsx # Multi-seller price compare, Rx upload & order tracking
            ├── ProfilePage.jsx       # Personal vitals, family members CRUD, export JSON
            └── LegalPrivacyPage.jsx  # DPDP Act, HIPAA, Terms & Privacy policy
```

---

## Comprehensive Feature Checklist

- [x] **Tech Stack:** React + Vite + Tailwind CSS, Node.js + Express, SQLite with WAL mode, JWT in httpOnly cookies, bcrypt hashing.
- [x] **Design Tokens:** Primary pinkish red (`#E11D48`), secondary medical green (`#10B981`), rounded-3xl cards, Inter/Poppins fonts.
- [x] **Landing Page:** Hero with trust badges, how it works 4-step guide, 9 feature spotlights, call to action.
- [x] **Authentication:** Full name, email, phone, DOB, password strength meter, password match, 6-digit OTP verification, forgot/reset password flow, rate-limited attempts.
- [x] **Dashboard Greeting Card:** Matches *"Hey, what's up"*, user's name in large text, then *"Hope you're doing fine"* underneath.
- [x] **Health Overview Strip:** Upcoming appointment, tests due count, latest medical report.
- [x] **9 Section Cards:**
  1. `Medical History` (Conditions, surgeries, allergies, medications)
  2. `Symptoms Tracker` (Severity, duration, timeline, specialist recommendation, disclaimer)
  3. `Family Medical History` (Relatives conditions, hereditary risk analysis, screening advice)
  4. `Recommended Tests` (Preventive suggestions, Due/Done toggle, reminders)
  5. `Doctor Check-ups` (Book, reschedule, cancel, time slots)
  6. `Medical Reports` (PDF/Image upload, validation, preview, download)
  7. `Verified Patient ID` (Unique ID, QR code, green verified badge, print layout)
  8. `Find Doctors` (Specialty, city, disease, rating filters, suggested doctors)
  9. `Medicine Store` (Catalog, verified badge, 3+ seller price comparison highlighting lowest price, prescription check, mock payment, order tracking)
- [x] **Family Profile Switcher:** Seamlessly switch active view between primary account and spouse, child, or parent profiles.
- [x] **Security & Privacy:** Explicit signup consent, data export in JSON, account deletion, medical disclaimers, and DPDP/HIPAA launch roadmap notes.

---

## Legal & Medical Disclaimer
*MediCare Hub is an informational health companion application. It does not provide medical diagnoses, clinical treatment, or emergency triage. For medical emergencies, always contact local emergency services immediately.*
