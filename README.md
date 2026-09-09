# 🏛️ SAHAYAK (सहायक)
### AI-Powered Citizen Scheme Matching & Channel Partner Routing Platform
**Ministry of Social Justice & Empowerment (MoSJE) · Smart India Hackathon (SIH)**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![DPDP Act](https://img.shields.io/badge/DPDP_Act_2023-Enforced-10B981)](#-data-privacy--dpdp-act-compliance)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Executive Summary

**SAHAYAK (सहायक)** is an intelligent, citizen-centric social welfare enablement portal engineered to bridge the last-mile gap between marginalized beneficiaries and central credit-linked welfare schemes under the **Ministry of Social Justice & Empowerment (MoSJE)**.

The platform unifies access to schemes offered by the three apex national corporations:
- **NSFDC** — National Scheduled Castes Finance & Development Corporation
- **NBCFDC** — National Backward Classes Finance & Development Corporation
- **NSKFDC** — National Safai Karamcharis Finance & Development Corporation

Through **deterministic eligibility matching**, **multilingual voice assistance**, and **offline-first channel partner routing**, SAHAYAK eliminates bureaucratic friction, eradicates predatory middlemen, and brings financial empowerment directly to citizens' hands.

---

## 🚀 Key Features & Capabilities

### 1. 🎯 Deterministic Scheme Matching (Zero-Hallucination)
- **4-Step Intuitive Wizard**: Captures category (SC / OBC / Safai Karamchari), occupation, enterprise purpose, and state/district.
- **Rule-Based Engine**: Mathematical evaluation guaranteeing zero generative hallucinations in eligibility criteria.
- **Auto-Fill from Profile**: Citizen's registered details automatically sync with the wizard.

### 2. 🎙️ Multilingual AI Voice Assistant ("Ask Sahayak")
- **Browser-Native Speech-to-Text (STT)** and **Text-to-Speech (TTS)**.
- Full conversational support across **11 Indian languages** (Hindi, English, Punjabi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Odia).
- Grounded intent recognition answering queries regarding moratoriums, subsidy percentages, documents, and nearest partner branches.

### 3. 📑 DigiLocker & Instant Beneficiary ID Hub
- **1-Click DigiLocker Fetch**: Direct digital integration to pull Aadhaar, Caste Certificate, and Income Certificate.
- **Drag-and-Drop Upload**: Clean file uploads with preview modal and automatic format checking.
- **Zero Numerical Limits**: Clean income verification without arbitrary exclusion barriers.

### 4. 🧮 Subsidy & Moratorium-Aware Loan Calculator
- Real-time amortization schedule generator factoring in government capital subsidies (up to ₹5 Lakh) and interest subventions.
- Pre-configured calculation templates for major MoSJE schemes (e.g., Mahila Samriddhi Yojana, DWO Term Loans, Swachhta Udyami Yojana).

### 5. 🗺️ Geospatial Channel Partner Router
- Offline-ready directory and locator for State Channelizing Agencies (SCAs), Regional Rural Banks (RRBs), and District Lead Banks.
- Instant routing with contact information, nodal officer names, and verified branch locations.

### 6. 🔐 Data Privacy & DPDP Act Compliance
- Adherence to India's **Digital Personal Data Protection (DPDP) Act 2023**.
- Purpose-limited requests, ephemeral session storage, and transparent consent control.

---

## 🏗️ Architecture & Technology Stack

```
[ Beneficiary / Citizen ]
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                 React 18 Frontend (Vite)                    │
│  • Lucide Icons • Tailwind CSS • i18n Localization Engine   │
│  • Web Speech STT / TTS • Interactive Decision Gateways     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐┌──────────────────────────────┐
│  Client-Side Core Engine    ││  Node.js / Express 5 Proxy   │
│  • Deterministic Matcher    ││  • DPDP Statutory Middleware │
│  • Amortization Calculator  ││  • Local Mock Database       │
│  • Geo Partner Ranker       ││  • RESTful API Endpoints     │
└─────────────────────────────┘└──────────────────────────────┘
```

For complete technical specifications and sequence diagrams, refer to [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 📂 Project Structure

```
.
├── docs/                             # Engineering documentation & specifications
│   ├── ARCHITECTURE.md               # Detailed system design & architecture
│   ├── PRD.md                        # Product requirements & user personas
│   ├── BENEFICIARY_DASHBOARD_SPEC.md # Citizen dashboard UI/UX specifications
│   ├── RBAC_IMPLEMENTATION.md        # Role-based access control guide
│   └── MYSCHEME_INGESTION.md         # Scheme synchronization guide
├── scripts/                          # Ingestion & automation utilities
│   └── evaluate_myscheme.cjs         # MyScheme API parser & evaluator
├── server/                           # Backend Express 5 REST API
│   ├── db/                           # In-memory storage & fixtures
│   ├── middleware/                   # Security & DPDP compliance middleware
│   ├── routes/                       # Modular REST endpoints (auth, schemes, etc.)
│   └── index.ts                      # Server entry point (port 5000)
├── src/                              # Frontend React application
│   ├── components/                   # Modular domain components
│   │   ├── ai/                       # Voice assistant & floating chatbot
│   │   ├── analytics/                # KPI & ministry disbursement equity views
│   │   ├── auth/                     # OTP authentication & onboarding gateway
│   │   ├── beneficiary/              # Beneficiary dashboard & profile views
│   │   ├── calculator/               # Amortization & loan repayment calculator
│   │   ├── checklist/                # Document verification & DigiLocker cards
│   │   ├── landing/                  # Homepage, hero sections & trust badges
│   │   ├── layout/                   # Navbar, language switcher, footer
│   │   ├── onboarding/               # Multi-step eligibility wizard
│   │   ├── partners/                 # Banking channel locator & directory
│   │   └── recommendations/          # Matched scheme cards & drawer details
│   ├── data/                         # Ground-truth datasets (schemes, partners)
│   ├── services/                     # Business logic, engines & API client
│   ├── types/                        # Strict TypeScript interfaces
│   ├── App.tsx                       # Root component & navigation controller
│   ├── index.css                     # Global styles & Tailwind utilities
│   └── main.tsx                      # React DOM mounting entry point
├── .env.example                      # Environment variables template
├── .gitignore                        # Comprehensive production-grade ignore rules
├── index.html                        # HTML5 document template
├── package.json                      # NPM configuration & dependencies
├── tsconfig.json                     # Strict TypeScript compiler options
└── vite.config.ts                    # Vite build configuration
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Installed and configured

### 1. Clone the Repository
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd sahayak-mosje
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
*(Default settings in `.env.example` work out of the box for local development).*

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Both Frontend & Backend Concurrently
```bash
npm run dev:all
```
- **Frontend App**: `http://localhost:3000` (or assigned Vite port)
- **Backend API**: `http://localhost:5000`

### 5. Individual Service Commands
| Command | Action |
|---------|--------|
| `npm run dev` | Starts Vite frontend dev server |
| `npm run server` | Starts Express backend with hot-reload via `tsx watch` |
| `npm run build` | Compiles TypeScript (`tsc -b`) and bundles frontend (`vite build`) |
| `npm run preview` | Previews the production bundle locally |

---

## 📡 Backend API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Service health status & statutory compliance check |
| `GET` | `/api/schemes` | Retrieve all 12 MoSJE credit-linked schemes |
| `GET` | `/api/schemes/:id` | Fetch specific scheme details by identifier |
| `POST` | `/api/eligibility/evaluate` | Deterministic eligibility rule assessment |
| `POST` | `/api/calculator/amortize` | Compute loan repayment schedule & subsidy |
| `GET` | `/api/partners/ranked` | Search & rank channel partners by district/state |
| `POST` | `/api/auth/otp/send` | Dispatch mock 6-digit SMS OTP |
| `POST` | `/api/auth/otp/verify` | Verify OTP & issue ephemeral session token |
| `POST` | `/api/ai/chat` | AI conversational endpoint with grounded fallback |

---

## 📄 Documentation

Comprehensive technical documentation is maintained in the [`docs/`](docs/) directory:
- [System Architecture Specification](docs/ARCHITECTURE.md)
- [Product Requirements Document (PRD v2)](docs/PRD.md)
- [Beneficiary Dashboard Specifications](docs/BENEFICIARY_DASHBOARD_SPEC.md)
- [Role-Based Access Control (RBAC) Guide](docs/RBAC_IMPLEMENTATION.md)
- [MyScheme Integration & Evaluation Manual](docs/MYSCHEME_INGESTION.md)

---

## 🤝 Contributing & License

Developed with ❤️ for the **Ministry of Social Justice & Empowerment (MoSJE)** and the **Smart India Hackathon**.

This project is licensed under the **MIT License**.
