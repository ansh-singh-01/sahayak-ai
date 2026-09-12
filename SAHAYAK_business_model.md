# SAHAYAK — Business & Sustainability Model
### For SIH26092 pitch deck (B2G / GovTech model)

> **Note on framing:** SAHAYAK is a citizen-service platform for a ministry, not a consumer product — so "business model" here means **how it gets funded, deployed, and sustained**, not how it extracts revenue from beneficiaries. Never propose charging citizens for scheme access — that would directly undermine MoSJE's mandate and will read as tone-deaf to judges. The model below is standard for successful GovTech platforms in India (B2G licensing + SI partnerships + platform reuse across ministries).

---

## 1. Core Positioning

SAHAYAK is not a one-off app — it's a **reusable eligibility-matching and routing engine** that happens to launch with MoSJE's NSFDC/NBCFDC/NSKFDC schemes as its first deployment. The business model should be pitched around this reusability, because it's what makes the project fundable and scalable beyond a single hackathon demo.

**One-line pitch:** *"SAHAYAK is infrastructure for scheme discovery and channel-partner routing — MoSJE is the first customer, not the only one."*

---

## 2. Stakeholders & Value Proposition

| Stakeholder | What they get |
|---|---|
| **Beneficiary (citizen)** | Free access, clearer path to the right scheme, less time wasted at wrong offices |
| **MoSJE (Ministry)** | Better scheme reach, equity/inclusion analytics, reduced misrouted applications, audit trail for compliance |
| **NSFDC/NBCFDC/NSKFDC (Corporations)** | Higher-quality applications reaching their SCAs (pre-screened for eligibility), less manual triage |
| **Channel Partners (SCAs/Banks/NBFC-MFIs)** | Better-qualified leads, reduced processing overhead from ineligible applications |
| **State Governments** | A ready-made layer to plug their own state-level welfare schemes into, without building from scratch |

---

## 3. Revenue / Funding Model (B2G — Business-to-Government)

Since the end user (citizen) must never pay, revenue comes from the institutional side. Standard, credible GovTech revenue streams:

### 3.1 Primary — Government Licensing / SaaS Contract
- MoSJE (or the National Informatics Centre, NIC, which typically hosts government platforms) licenses SAHAYAK as a managed platform, either:
  - **One-time development + deployment grant** (common for hackathon-to-pilot transitions — MeitY/NIC/Digital India-linked grants exist for exactly this), or
  - **Annual maintenance & hosting contract** once live, covering uptime, updates, scheme-data upkeep, and support
- This is the primary, most realistic near-term path: most successful SIH projects that get adopted move through exactly this route (pilot grant → ministry-hosted deployment).

### 3.2 Secondary — Multi-Ministry / Multi-Scheme Platform Licensing
- The underlying eligibility-engine + partner-routing architecture is not MoSJE-specific — it generalizes to any ministry running credit-linked or benefit-linked schemes (e.g., Ministry of Minority Affairs, Ministry of Skill Development, state-level welfare boards)
- Once proven with MoSJE, offer the same platform (white-labeled/re-skinned, same architecture) to other ministries/state governments as a **"Scheme-as-a-Service" layer** — this is the actual scaling story to put in the pitch, and it's what makes the project sound like a platform rather than a single app
- Revenue: per-ministry/per-state onboarding fee + annual maintenance, same B2G model as §3.1

### 3.3 Tertiary — System Integrator (SI) Partnership Model
- Large GovTech deployments in India typically go through an empanelled System Integrator (e.g., under CSC e-Governance, or a NIC-approved vendor) for actual rollout and support
- SAHAYAK's team can position as the **product/IP owner**, partnering with an SI for large-scale deployment/support contracts, rather than trying to run field operations across 28+ states directly — this is a realistic division of labor and answers the "how would you actually scale this" question judges ask

### 3.4 Non-Monetary but Strategically Valuable — Aggregate Policy Insights
- The equity/inclusion analytics (Ministry Admin Dashboard §4.2/§4.3) produce genuinely valuable, anonymized, aggregate insight for policy-making (where schemes underperform, where equity gaps persist) — this isn't a revenue line, but it's a strong retention/renewal argument: the ministry gets ongoing value beyond the initial rollout, which supports contract renewal rather than a one-off engagement.

---

## 4. Cost Structure

| Cost category | Notes |
|---|---|
| Cloud hosting & infrastructure | Postgres, backend compute, storage — scales with user volume, can start on government-approved cloud (MeghRaj/NIC cloud) for compliance |
| Maps/geolocation API costs | Mapbox/Google Maps — usage-based, partner-locator feature |
| OCR/verification pipeline | Cloud OCR API calls (Document Verification PRD) — usage-based |
| LLM/AI assistant API costs | Usage-based, bounded since AI only handles explanation/phrasing, not core logic (keeps this cost line small and predictable — worth stating explicitly, since unbounded LLM costs are a common reason GovTech pilots get shelved) |
| Scheme data maintenance | Ongoing effort to keep scheme terms current as corporations update rates/limits — likely a small ops team, not automatable |
| Partner/state onboarding support | Human effort to onboard each new SCA/bank into the partner network initially |
| Security/compliance audits | Required for any platform handling caste/income data under DPDP Act — periodic audit cost |

**Framing for judges:** the AI-cost-discipline point (bounded LLM usage because AI never does the core eligibility computation) is worth saying out loud — it's both a technical design choice and a cost-sustainability argument, and few teams connect those two dots explicitly.

---

## 5. Go-to-Market / Adoption Path

```
Phase 0 (Hackathon)     → Working prototype, MoSJE schemes, single-state demo (Indore/MP)
Phase 1 (Pilot)          → MoSJE-sponsored pilot in 1–2 states, real SCA partners onboarded,
                            real (non-mocked) DigiLocker integration pursued
Phase 2 (Scale-up)        → National rollout across NSFDC/NBCFDC/NSKFDC network,
                            SI partnership for field onboarding/support
Phase 3 (Platform)         → Extend architecture to additional ministries/state welfare boards
                            as a general-purpose scheme-matching layer
```

This phased path matters for the pitch because it shows judges you're not claiming the hackathon prototype *is* the finished product — you're showing a credible, government-realistic path from prototype to deployed platform, which is usually the actual differentiator between SIH projects that place and ones that don't.

---

## 6. Why This Is Sustainable Long-Term (Not Just Grant-Dependent)

- Once past initial development, the **marginal cost of adding a new state or scheme is low** (config-driven scheme/partner data model from PRD v1 §29–30) — this keeps the ongoing cost-to-value ratio favorable for a renewing government contract
- The **multi-ministry reuse story (§3.2)** means the platform isn't tied to a single scheme's political/budget lifecycle — if one ministry's engagement stalls, the architecture retains value elsewhere
- Aggregate equity analytics create genuine, ongoing decision-making value for the ministry beyond the initial "does it work" question, supporting renewal over a one-off pilot

---

## 7. What NOT to Say in the Pitch

- Don't propose freemium/paid-tier access for beneficiaries, ads, or selling user data — any of these are disqualifying in a govt-welfare context and will actively hurt credibility with judges.
- Don't overclaim current DigiLocker/live-government-API integration — be explicit that it's architected for it and demoed with a clearly labeled simulation (consistent with the Document Verification PRD's honesty framing).
- Don't present the multi-ministry platform vision as already built — frame it as the roadmap, with Phase 0/1 being the credible, immediately achievable part.
