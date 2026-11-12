# AccessAudit – Automated Website Accessibility Auditor

**AccessAudit** is a full-stack, enterprise-grade web application that empowers developers to audit website accessibility, evaluate compliance against **WCAG 2.2 guidelines (Levels A, AA, AAA)**, calculate heuristic accessibility scores out of 100, and generate actionable code corrections using **Playwright**, **axe-core**, and an intelligent **AI remediation engine**.

---

## 🚀 Key Features

### 1. Modern SaaS UI/UX Design
- Inspired by **Linear**, **Vercel**, and **Stripe**.
- Crisp slate-navy palette with vibrant indigo/purple accents.
- Responsive sidebar navigation, stat KPI cards, interactive SVG circular score gauges, and smooth animations.

### 2. Comprehensive WCAG 2.2 Auditing Engine
- Uses **Playwright** headless Chromium and **axe-core (v4.10)** to analyze real DOM trees and rendered CSS styles.
- Evaluates:
  - Missing image alternative text (`image-alt` - WCAG 1.1.1)
  - Insufficient color contrast (`color-contrast` - WCAG 1.4.3)
  - Missing form labels (`label` - WCAG 1.3.1, 4.1.2)
  - Buttons without accessible names (`button-name` - WCAG 4.1.2)
  - Links without discernible text (`link-name` - WCAG 2.4.4)
  - Missing document language (`html-has-lang` - WCAG 3.1.1)
  - Heading hierarchy jumps (`heading-order` - WCAG 1.3.1)
  - Missing page title (`document-title` - WCAG 2.4.2)
  - Invalid ARIA attributes & unsupported roles (`aria-valid-attr`, `aria-roles` - WCAG 4.1.2)

### 3. Weighted Heuristic Scoring Algorithm
- Scores websites from **0 to 100** based on normalized severity weights (Critical, Serious, Moderate, Minor).
- Visual grading: **A+ (95–100)**, **A (85–94)**, **B (70–84)**, **C (50–69)**, **D (30–49)**, **F (0–29)**.
- Clearly identified as an **AccessAudit Heuristic Score**, distinguishing automated automated testing from legal WCAG certification.
- Principle conformance breakdown across: **Perceivable**, **Operable**, **Understandable**, and **Robust**.

### 4. Before-and-After Regression Comparison
- Compare two audits of the same or different websites side-by-side.
- Computes exact score deltas (`+18` improvement vs `-6` regression).
- Highlights **Resolved Issues** (fixed violations), **Newly Introduced Regressions**, and **Persistent Remaining Issues**.

### 5. AI & Rule-Based Remediation
- Built-in expert rule engine explaining why each violation impairs users with assistive devices.
- Provides copyable, corrected HTML snippets and CSS color contrast recommendations.
- Optional live **Google Gemini API** integration (`GEMINI_API_KEY`) for deep semantic code generation.

### 6. Executive PDF Report Generation
- Powered by `jsPDF` and `jspdf-autotable`.
- Generates downloadable, multi-page executive audit reports including score badges, severity breakdowns, WCAG references, selectors, and recommended fixes.

### 7. Bank-Grade Security & Anti-SSRF Defenses
- Rejects loopback (`127.0.0.0/8`, `::1`), private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`), and carrier-grade NAT.
- Blocks cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`).
- Intercepts subrequests and redirects during headless browser evaluation.
- Rate limiting on API routes and scanning concurrency locks.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, Canvas-Confetti |
| **Backend** | Node.js (ESM), Express.js, JWT, bcryptjs, ipaddr.js |
| **Database** | MongoDB & Mongoose (with seamless embedded JSON/memory datastore fallback) |
| **Scanning Engine** | Playwright (Chromium headless), axe-core |
| **PDF Reporting** | jsPDF, jspdf-autotable |

---

## 🏁 Quick Start & Running the Application

### 1. Install Dependencies
Dependencies are already installed in `backend/` and `frontend/`. If running on a new machine:
```bash
npm --prefix backend install
npx --prefix backend playwright install chromium
npm --prefix frontend install
npm --prefix frontend run build
```

### 2. Start the Unified Server
```bash
node backend/server.js
```
The server will start on **http://localhost:5000**.
It serves both the complete REST API (`/api/*`) and the built React frontend application.

### 3. (Optional) Run Vite Dev Server with Hot-Reload
For frontend development with live reloading:
```bash
npm --prefix frontend run dev
```
Open **http://localhost:5173** (proxies API requests to port 5000).

---

## 🔐 Credentials & Evaluation
- **Instant 1-Click Demo Login**: Click the *"Instant Demo Access (1-Click)"* button on the login screen to immediately explore pre-populated audits, charts, and comparison views.
- **Custom Account**: You can also register any email and password on the Registration page.

---

## 📁 Project Structure

```
fsd/
├── backend/
│   ├── server.js                     # Express app & static server
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── config/db.js              # MongoDB & persistent fallback connection
│       ├── controllers/
│       │   ├── authController.js     # Register, login, demo, me
│       │   └── auditController.js    # Scan, list, detail, compare, AI advice, stats
│       ├── middleware/
│       │   ├── auth.js               # JWT bearer verification
│       │   └── rateLimiter.js        # Express rate limiting
│       ├── models/
│       │   ├── User.js               # User model
│       │   ├── Audit.js              # Audit model
│       │   ├── Issue.js              # Issue model
│       │   └── storeFallback.js      # Robust zero-dependency store fallback
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── auditRoutes.js
│       └── services/
│           ├── scannerService.js     # Playwright + axe-core runner
│           ├── scoringService.js     # Weighted heuristic score calculation
│           ├── aiService.js          # AI and rule-based remediation generator
│           └── ssrfGuard.js          # SSRF prevention & DNS validation
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx            # Header & quick scan input
│       │   ├── Sidebar.jsx           # Responsive sidebar navigation
│       │   ├── StatsCard.jsx         # KPI metric card
│       │   ├── ScoreGauge.jsx        # SVG circular gauge (0-100)
│       │   ├── IssueCard.jsx         # Violation card with copyable code
│       │   ├── ScanProgressModal.jsx # Multi-stage animated scan dialog
│       │   └── AiRemediationModal.jsx# AI advice modal
│       ├── context/AuthContext.jsx   # Authentication context & tokens
│       ├── pages/
│       │   ├── Dashboard.jsx         # Dashboard with Recharts & KPI
│       │   ├── NewScan.jsx           # Audit configuration page
│       │   ├── AuditDetail.jsx       # Report page with severity filters
│       │   ├── AuditHistory.jsx      # Audit table & multi-select compare
│       │   ├── Comparison.jsx        # Before-and-after visual diff
│       │   ├── WcagReference.jsx     # WCAG 2.2 cheatsheet & code examples
│       │   ├── Login.jsx             # Sign in
│       │   └── Register.jsx          # Sign up
│       └── services/
│           ├── api.js                # Axios client & endpoints
│           └── pdfReportGenerator.js # jsPDF export service
└── README.md
```

