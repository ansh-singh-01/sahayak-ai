# PRD v2 — SAHAYAK
### AI-Driven Scheme Matching & Channel Partner Routing Platform
**SIH Problem Statement:** SIH26092 · **Ministry:** Social Justice & Empowerment (MoSJE) · **Theme:** Smart Automation

> **What changed from v1 and why it matters for judging:** v1 was a solid, well-organized product spec. v2 adds the things that separate a "good prototype" from a "winning SIH prototype": (1) grounding in *real* MoSJE scheme data instead of generic placeholder schemes, (2) an explicit mapping to how SIH juries actually score, (3) three genuinely novel features that address the *real* failure mode of this problem statement — last-mile, low-literacy, low-connectivity beneficiaries — and (4) tighter technical scope so a 4–6 person team can actually ship it in the hackathon window. Everything from v1 that still holds is kept; new/changed material is marked **[NEW]**.

---

## 0. Why Most Teams Will Lose This Problem Statement — And How SAHAYAK Wins **[NEW]**

SIH26092 is a *governance + inclusion* problem dressed as a fintech problem. Most teams will build a scheme-matching quiz + a map + an EMI calculator and call it done. That is table stakes, not a differentiator — it's literally described in the problem statement, so every team will have it.

The teams that place in SIH consistently win on **one of two axes**: (a) a genuinely novel mechanism the judges haven't seen five times that day, or (b) demonstrable real-world grounding (real data, real constraints, real failure modes) that shows the team understands the actual beneficiary, not just the brief.

SAHAYAK should compete on both:

| Axis | What most teams will show | What SAHAYAK shows |
|---|---|---|
| Data realism | Fictional "Term Loan Scheme," "Micro Finance Scheme" | Real NSFDC/NBCFDC/NSKFDC scheme families (see §5) with actual income caps, interest slabs, moratoriums |
| Accessibility | English + Hindi text UI | Voice-first / low-literacy onboarding path (§9), because the target beneficiary population for MoSJE schemes has materially lower literacy and smartphone fluency than the average citizen |
| Trust | A match % with no audit trail | An explainable, auditable eligibility engine with a visible "gap-to-eligibility" report (§16) |
| Channel partner problem | Static directory / map pins | A partner **reliability & load-balancing signal** (§21) that solves the *actual* operational pain: beneficiaries currently get routed to SCAs/banks that are slow, non-responsive, or have exhausted allocated funds |
| Equity | No mention | Built-in equity/inclusion analytics for the ministry (§33) — SC/ST/OBC/differently-abled/transgender/senior-citizen segment tracking, since MoSJE's mandate is explicitly about marginalized groups |

Keep this table in your pitch deck's first two minutes. It preempts the judge's obvious question: *"how is this different from myScheme.gov.in or UMANG?"*

---

## 1. Product Overview *(unchanged from v1, tightened)*

SAHAYAK is a multilingual, voice-accessible web application that takes a beneficiary from **"I need help"** to **"I know exactly which scheme, how much, what it costs me, and which office to walk into"** in under 5 minutes.

Flow: **Tell us about yourself → Tell us what you need → Rule engine + AI checks eligibility → Explainable recommendation → Financial calculator → Ranked channel-partner routing → Document checklist → Application guidance.**

It must read as a modern citizen-service fintech product — not a legacy government portal, and not a generic AI chatbot wrapper.

---

## 2. Explicit Differentiation from Existing Government Platforms **[NEW]**

Judges will know myScheme.gov.in, UMANG, and Jan Samarth exist. Address this head-on in the deck:

| | myScheme.gov.in | Jan Samarth | **SAHAYAK** |
|---|---|---|---|
| Scheme discovery | Keyword/category filter | Loan-category filter | Rule-based eligibility scoring with % match + reasons |
| Explains *why* eligible/ineligible | No | Partial | Yes — full reason list + gap-to-eligibility |
| Financial modeling | No | Basic EMI | Full amortization, moratorium-aware, scheme-limit-aware |
| Partner/lender routing | Generic bank list | Lender list, no ranking | Ranked, distance + eligibility + capacity-weighted |
| Low-literacy access | No | No | Voice-guided onboarding, icon-first UI |
| Explainability/audit trail | No | No | Every recommendation is logged with the rule trace that produced it |

Position SAHAYAK as a **decision-support and routing layer that could sit in front of or alongside** these portals — not a rip-and-replace. This is both more credible to judges and more realistic as a deployment story.

---

## 3. Problem Statement Restated With Real Stakes **[NEW]**

MoSJE runs its credit-linked schemes largely through three Public Sector Undertakings and their State Channelizing Agencies (SCAs):

- **NSFDC** (National Scheduled Castes Finance & Development Corporation)
- **NBCFDC** (National Backward Classes Finance & Development Corporation)
- **NSKFDC** (National Safai Karamcharis Finance & Development Corporation)

Each runs multiple, differently-configured loan products (general term loans, women-specific schemes, micro-credit, education loans, skill-training-linked schemes), each delivered through a *different* SCA/bank network per state. A beneficiary in, say, Indore who qualifies for an NBCFDC scheme has no simple way today to know: which of ~8–10 active products they fit, what the *current* interest slab and moratorium is for their loan size, or which local SCA/bank branch is actually taking new applications versus sitting on an exhausted allocation. That three-part gap (which scheme → how much it costs → who to go to) is the actual problem SAHAYAK solves.

---

## 4. Product Goals *(unchanged from v1)*

Primary: simplify scheme discovery, reduce misrouted applications, improve financial literacy, explain eligibility/ineligibility, route to the right partner, work across languages and literacy levels, demonstrate credible automation.

Secondary: transparent/explainable recommendations, extensible scheme+partner data model.

---

## 5. Seed Scheme Data — Use Real Families, Clearly Marked as Demo Data **[NEW / CRITICAL]**

Do not invent "Term Loan Scheme" and "Micro Finance Scheme" as if they were official names — a judge who knows the space will flag this immediately as ungrounded. Instead, model the **real scheme families** below, and label the seed data explicitly as *"illustrative figures based on publicly available scheme information; confirm current terms with the SCA before applying."*

**NSFDC (Scheduled Castes, family income ≤ ₹3 lakh/year for most products)**
- General Term Loan — up to ~₹50 lakh project cost via SCAs/banks
- Mahila Samriddhi Yojana (MSY) — micro-credit for SC women, up to ₹1.5 lakh
- Mahila Kisan Yojana (MKY) — agriculture-linked loans for SC women
- Green Business Scheme — up to ~₹27 lakh for eco-friendly income-generating units, also serving Safai Karamchari dependents
- Udyam Nidhi Yojana — projects up to ₹5 lakh
- Skill Development Training Programme — no income criterion, training-linked, non-credit

**NBCFDC (Other Backward Classes, family income ≤ ₹3 lakh/year)**
- General Loan Scheme (GLS) — up to ₹15 lakh, slab interest 6% (≤₹5L) / 7% (₹5–10L) / 8% (₹10–15L), 8-year repayment, 6-month moratorium
- New Swarnima Scheme for Women — up to ₹2 lakh, concessional rate
- Mahila Samriddhi Yojana (NBCFDC variant) — micro-credit for OBC women

**NSKFDC (Safai Karamcharis, manual scavengers, and dependents)**
- Term loan and skill-linked schemes for rehabilitation into alternate livelihoods

**Design implication:** the eligibility engine's rule set must key off **caste/community category, annual family income, project type, and gender** as first-class fields, because that is how the *real* scheme universe is actually partitioned — not just "purpose" as v1 implied. Add a `beneficiary_category` field (SC / OBC / Safai Karamchari-linked / open) driven by self-declaration + documentary proof, handled with the same care as income data (see §34 privacy notes).

Keep 8–10 of the above as seed data with realistic, clearly-labeled figures. This alone will visibly separate SAHAYAK from every team that ships "Scheme A / Scheme B / Scheme C."

---

## 6–34. Core Product Sections *(retained from v1, only diffs called out)*

Everything in v1 sections 6–34 (design direction, navigation, onboarding, screens, calculator, partner locator, document checklist, AI assistant, multilingual support, database structure, recommendation engine, AI architecture, admin dashboard, analytics, security) **still applies**. Keep them as-is except for the following upgrades:

### 9. Onboarding — add a voice/low-literacy path **[NEW]**
Alongside the card-based text onboarding, add a secondary entry point: **"Prefer to speak?"** — a guided, icon + audio-prompt flow (record a short answer per question, or tap an icon) that collects the same structured fields. This does not need full speech-to-intent NLU for the hackathon; a scripted sequence of audio prompts with tap/hold-to-record responses and on-device speech-to-text (Web Speech API) is enough to *demo* the concept credibly, and it directly addresses the accessibility mandate implicit in an MoSJE problem statement (elderly, low-literacy, differently-abled beneficiaries).

### 16. Recommendation screen — add Gap-to-Eligibility **[NEW]**
For every scheme the user is *not* currently eligible for, don't just hide it — show:
```
Udyam Nidhi Yojana — Not currently eligible
✗ Family income ₹3.8L exceeds the ₹3L limit for this scheme
→ You would qualify if family income were at or below ₹3,00,000
```
This single feature does three things judges will notice: it's more honest than a black-box match score, it's more *useful* to a real beneficiary than a binary yes/no, and it's a natural place to plug in AI-generated plain-language explanation without letting the AI touch the actual eligibility math (rule engine still decides; AI only phrases the reason).

### 21–24. Partner ranking — add a Reliability Signal **[NEW]**
Add a `partner_reliability_score` field, computed from (illustratively, using seed/demo data clearly marked as such): average response time to past applications, fund-utilization rate (avoid routing users to an SCA that has exhausted its allocation), and complaint/grievance rate if available. This is the actual operational failure mode ministries deal with — beneficiaries get sent to a partner that's technically "eligible" but functionally unresponsive. Surfacing this, even with seed/demo numbers, is a strong, concrete "we understand the real bureaucratic friction" signal to judges.

### 27. AI Assistant — tighten the guardrail language **[unchanged, keep as-is]**
v1's "never let the AI invent numbers" rule is correct and important — keep it verbatim. Add one operational detail: every AI-generated explanation must cite the specific rule-engine output (scheme id + rule id) it is paraphrasing, so a reviewer can always trace an explanation back to the underlying rule. Log this trace with the recommendation record (§29/§16 data model).

### 33. Analytics — add equity/inclusion metrics **[NEW]**
Because this is MoSJE, not a generic lending platform, the admin analytics dashboard should include: recommendations and completed routings broken down by beneficiary category (SC/OBC/Safai Karamchari-linked), gender, and district — so the ministry can see whether the tool is actually reaching the groups it's meant for, and where drop-off happens in the funnel (onboarding → recommendation → partner view → document checklist). This is the kind of slide that makes a jury from a ministry background sit up.

### 34. Security & Privacy — align to DPDP Act 2023 explicitly **[NEW]**
Since caste category and income are sensitive personal data under India's Digital Personal Data Protection Act, 2023, explicitly state in the PRD (and the pitch): purpose-limited collection, consent capture before storing category/income, data minimization (don't persist raw documents, only derived eligibility flags where possible), and a clear data-retention/deletion policy. Naming DPDP Act compliance by name is a low-effort, high-credibility line in a ministry-context hackathon.

---

## 7. Recommendation Engine — Refined Logic **[UPDATED]**

```
for each active scheme:
    check hard eligibility (category, income ceiling, purpose, age, gender-specific rules)
    if eligible:
        score = weighted_match(
            purpose_fit, income_headroom, project_cost_fit,
            requested_amount_vs_scheme_band, category_specific_bonus
        )
        attach reasons[]
    else:
        compute gap_to_eligibility (which field, by how much)
        attach as "near miss" if gap is small (e.g. income within 15% of ceiling)

rank eligible schemes by score
return top 3 eligible + up to 2 "near miss" schemes with gap explanation
```

Returning "near miss" schemes with an honest gap explanation (rather than only showing what the user already qualifies for) is a meaningfully more useful product than v1's original design, and costs almost nothing extra to implement since the eligibility check already computes the comparison.

---

## 8. Technical Stack *(unchanged from v1 — confirmed sound for a hackathon timeline)*

Frontend: React/Vite or Next.js, TypeScript, Tailwind, shadcn/ui, Recharts.
Backend: Node/Express or Next.js API routes.
DB: PostgreSQL + Prisma (Supabase acceptable for MVP speed).
Maps: Mapbox or Google Maps.
AI: any LLM API with structured output, used strictly for phrasing/explanation, never for eligibility decisions.

**Scope discipline for the hackathon window:** build the rule engine, calculator, and partner ranking as plain deterministic backend logic *first*, fully working with seed data, before touching the LLM integration. A jury can fail a team that has a beautiful chat UI wrapped around an eligibility engine that silently doesn't work; they will not fail a team whose AI explanation layer is simple but whose core logic is airtight and demonstrably correct on stage.

---

## 9. Judging-Criteria Alignment Cheat Sheet **[NEW — use this to structure the pitch]**

| Typical SIH judging axis | Where SAHAYAK answers it |
|---|---|
| Innovation/novelty | Gap-to-eligibility reporting, partner reliability signal, voice-first onboarding |
| Technical feasibility | Deterministic rule engine (not LLM-dependent for correctness), standard stack, working demo with seed data |
| Real-world relevance | Grounded in actual NSFDC/NBCFDC/NSKFDC scheme structures, not fictional schemes |
| Scalability | Config-driven schemes/partners (admin CRUD, not hardcoded), multilingual architecture, extensible to any ministry's credit-linked schemes |
| Social impact | Direct alignment with MoSJE's marginalized-community mandate; equity analytics for the ministry itself |
| Presentation/demo | Sub-5-minute guided demo story (§10 below), explainability visible at every step |

Put a version of this table on one pitch slide. Juries score against a rubric; showing you know the rubric and hit every line is worth more than people expect.

---

## 10. Demo Script — Updated With Real Scheme Names **[UPDATED]**

1. Open SAHAYAK → **Find My Scheme**.
2. Select **Start a Business**, then select community category (e.g., OBC) and enter: family income ₹2.8L, project cost ₹4L, location Indore.
3. Rule engine runs live (short, honest animation — no fake "AI thinking" theatrics).
4. Result: **NBCFDC General Loan Scheme — 91% match**, with reasons (income within ₹3L ceiling, project cost within ₹15L band, category matches).
5. Show one **near-miss** scheme too (e.g., a scheme requiring SC category) with a gap explanation — this is the moment to call out live: *"most tools would just hide this scheme; we tell you exactly why you don't qualify."*
6. **Calculate My Loan** → amortization table + donut chart, moratorium clearly explained, warning if amount exceeds scheme ceiling.
7. **Find My Partner** → map with ranked SCAs/banks, reliability signal visibly factored in — call out live: *"this partner is 4.1 km away and closer, but we rank this one first because it's currently accepting applications and has a faster average turnaround."*
8. Document checklist, driven by scheme config.
9. Close on the equity analytics view for the "admin/ministry" persona — a 10-second cut to show the ministry-side value, not just the citizen-side value.

Target: 4–5 minutes, one continuous flow, no reloads or context switches.

---

## 11. What NOT to Build *(unchanged from v1 — still correct)*

No generic chatbot-as-the-product, no fake real-time data presented as real, no fabricated official rates presented as verified, no scope creep into social/crypto features. Depth on scheme matching + calculator + partner routing beats breadth across ten shallow features.

---

## 12. Final Product Principle *(unchanged from v1)*

The application must let a beneficiary answer, within 5 minutes: **What can I get? Why? How much? Where do I go? What do I need?** — and now, additionally: **if not eligible today, what would make me eligible?**

That last question is the single highest-leverage addition in this revision: it costs little to build, no other team is likely to have it, and it's the most honest, most beneficiary-centered feature in the whole product.
