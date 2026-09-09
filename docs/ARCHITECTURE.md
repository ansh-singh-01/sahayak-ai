# System Architecture & Technical Specifications
## SAHAYAK (सहायक) · MoSJE Citizen-Centric Social Welfare Platform

---

## 1. Architectural Philosophy
SAHAYAK is designed as a **resilient, offline-capable, citizen-first platform** connecting marginalized citizens (SC, OBC, Safai Karamcharis, EBC, DNT) to credit-linked enterprise and education schemes managed by the Ministry of Social Justice and Empowerment (MoSJE) through apex corporations:
- **NSFDC** (National Scheduled Castes Finance & Development Corporation)
- **NBCFDC** (National Backward Classes Finance & Development Corporation)
- **NSKFDC** (National Safai Karamcharis Finance & Development Corporation)

### Core Tenets:
1. **Deterministic Matching (Zero-Hallucination)**: Eligibility evaluation is executed via a deterministic rule engine (`eligibilityEngine.ts`), guaranteeing 100% adherence to MoSJE statutory guidelines without generative hallucinations.
2. **Multilingual Voice-First Inclusivity**: Low-literacy beneficiaries can interact using voice in 11 Indian languages, supported by browser-native Web Speech STT/TTS and localized NLU fallback.
3. **Data Privacy & Ephemeral Sessions (DPDP Act 2023 Enforced)**: Zero persistent tracking without explicit informed consent. PII is stored strictly client-side or redacted via tokenized sessions.
4. **Last-Mile Banking Connectivity**: Integrates geospatial channel partner routing (`partnerRouter.ts`) to connect beneficiaries to district lead bank branches (SCA / RRB / PSU / State Channelizing Agencies).

---

## 2. High-Level System Architecture

```mermaid
graph TD
    subgraph Client ["Client Layer (React 18 + Vite + Tailwind CSS)"]
        UI[Responsive Modern UI]
        Chatbot[Multilingual AI Chatbot & Voice]
        Wizard[Find My Scheme Wizard]
        Checklist[DigiLocker & Document Hub]
        Calc[Amortization & Subsidy Calculator]
        Store[LocalStorage Session / Auth State]
    end

    subgraph CoreEngine ["In-Memory / Client Services Engine"]
        Engine[Deterministic Eligibility Engine]
        Router[Geospatial Partner Router]
        I18n[i18n Localization Engine 11 Languages]
        Voice[Web Speech STT / TTS Voice Pipeline]
    end

    subgraph BackendProxy ["Node.js / Express 5 API Proxy (Port 5000)"]
        DPDP[DPDP Statutory Middleware]
        SchemesAPI[/api/schemes]
        EligibilityAPI[/api/eligibility]
        CalcAPI[/api/calculator]
        PartnersAPI[/api/partners]
        AuthAPI[/api/auth]
        AIProxy[/api/ai/chat]
    end

    subgraph ExternalServices ["External & Government Integrations"]
        DigiLocker[DigiLocker API Sandbox]
        MyScheme[myScheme Public API]
        SMS[State SMS Gateway]
    end

    UI --> Store
    UI --> Engine
    UI --> Router
    UI --> I18n
    Chatbot --> Voice
    Chatbot --> AIProxy
    Wizard --> Engine
    Checklist --> DigiLocker
    UI --> BackendProxy
    BackendProxy --> DPDP
    BackendProxy --> ExternalServices
```

---

## 3. Directory Layout & Module Responsibilities

```
├── docs/                       # Architectural specs, PRD, RBAC, and ingestion manuals
│   ├── ARCHITECTURE.md         # Comprehensive system architecture document
│   ├── PRD.md                  # Detailed product requirements and user personas
│   ├── BENEFICIARY_DASHBOARD.md# Beneficiary portal specifications
│   ├── RBAC_IMPLEMENTATION.md  # Multi-tier role-based access control guide
│   └── MYSCHEME_INGESTION.md   # Scheme synchronization & rule extraction notes
├── scripts/                    # Ingestion and evaluation automation
│   └── evaluate_myscheme.cjs   # MyScheme API parser and JSON normalizer
├── server/                     # Express 5 backend API & proxy
│   ├── db/                     # In-memory data store with mock persistence
│   ├── middleware/             # DPDP compliance & audit trail middleware
│   ├── routes/                 # REST routes (auth, schemes, partners, calc, ai)
│   └── index.ts                # API server entrypoint (port 5000)
├── src/                        # React 18 frontend source code
│   ├── components/             # Domain-segregated UI components
│   │   ├── ai/                 # Sahayak AI floating chatbot & voice widget
│   │   ├── analytics/          # Ministry KPI & disbursement equity dashboards
│   │   ├── auth/               # Mobile OTP sign-in, signup, and onboarding flow
│   │   ├── beneficiary/        # Beneficiary profile & tracking components
│   │   ├── calculator/         # Amortization, subsidy & moratorium calculators
│   │   ├── checklist/          # Aadhaar, Caste, and Income document uploaders
│   │   ├── landing/            # Accessible hero page & scheme discovery
│   │   ├── layout/             # Sticky navigation, language switcher, footer
│   │   ├── onboarding/         # 4-step interactive eligibility wizard
│   │   ├── partners/           # Channel partner locator & contact directory
│   │   └── recommendations/    # Matched scheme cards & application drawers
│   ├── data/                   # Ground-truth datasets
│   │   ├── demoProfiles.ts     # Standardized demo persona records
│   │   ├── partnersData.ts     # District channel partner banking network
│   │   └── schemesData.ts      # 12 central MoSJE statutory schemes
│   ├── services/               # Core business logic & SDK abstractions
│   │   ├── apiClient.ts        # Resilient HTTP client with local fallback
│   │   ├── chatbotService.ts   # Rule-grounded NLU and intent classifier
│   │   ├── eligibilityEngine.ts# Deterministic eligibility matcher
│   │   ├── i18nService.ts      # 11 Indian languages translation dictionary
│   │   ├── loanCalculator.ts   # PM-DAKSH, Term Loan, and composite calculators
│   │   ├── partnerRouter.ts    # Geospatial channel partner ranker
│   │   └── voiceService.ts     # Web Speech API recognition & speech synthesis
│   ├── types/                  # Strict TypeScript domain interfaces
│   ├── App.tsx                 # Main application controller and tab routing
│   ├── index.css               # Modern Tailwind styling & animations
│   └── main.tsx                # Application mounting entrypoint
├── .env.example                # Environment configuration template
├── .gitignore                  # Production-grade Git ignore patterns
├── index.html                  # Accessible HTML5 root template
├── package.json                # NPM manifest & unified scripts
├── tsconfig.json               # TypeScript strict configuration
└── vite.config.ts              # Vite bundler configuration
```

---

## 4. Key Subsystems

### A. Deterministic Eligibility Matching Engine (`eligibilityEngine.ts`)
- Evaluates citizen criteria:
  - **Category**: Scheduled Caste (NSFDC), Other Backward Classes / EBC (NBCFDC), Safai Karamchari / Waste Picker (NSKFDC).
  - **Income Group**: BPL / Antyodaya / Rural / Urban without hardcoded disqualifications.
  - **Gender / Age / Occupation**: Target women entrepreneurs (Mahila Samriddhi), sanitation workers, transport operators, and artisans.
  - **Purpose**: Micro-finance, term loan, vocational education, assistive technology.
- Outputs scored recommendations with breakdown of reasons, subsidies, and required documents.

### B. Multilingual Voice Assistant (`chatbotService.ts` & `voiceService.ts`)
- Supports Hindi, English, Punjabi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Odia.
- Dual-mode architecture:
  - **Primary**: Local rule-grounded NLU matching intents directly against scheme rules.
  - **Secondary**: Optional cloud-assisted proxy via `/api/ai/chat` for general explanations.

### C. Identity & Document Verification
- Direct integration with DigiLocker sandbox for 1-click retrieval of Aadhaar and Certificates.
- Client-side drag-and-drop file upload with format validation (PDF/PNG/JPEG) and document redaction previews.

---

## 5. Security & Statutory Compliance
- **DPDP Act 2023 Compliant**:
  - Purpose limitation headers (`X-MoSJE-Purpose`).
  - No permanent server-side retention of citizen biometric or identity tokens.
  - Visual consent modal with clear revocation pathways.
- **Sanitized Secrets**: Zero committed API keys; all environment configs loaded securely via `.env`.
