# PRD — SAHAYAK Add-On: Document Verification Pipeline
### Verifying government-issued documents (identity, category, income, purpose-specific) at application stage

**Ties into:** PRD v2 (§5 scheme data, §34 privacy), RBAC Implementation Guide (§1 `PARTNER_STAFF` role), Beneficiary Dashboard Spec (§2.4 document checklist card)

> **Positioning for judges:** this is the piece of the product most teams will either skip entirely or fake with a "✓ Verified" button that does nothing. Build the honest three-layer version below — it's more credible, most of it is genuinely buildable in a hackathon window, and it directly uses infrastructure you're already required to have (the `PARTNER_STAFF` role and document checklist).

---

## 1. Problem

Once a scheme is selected, the beneficiary must submit real government documents (Aadhaar, caste certificate, income certificate, purpose-specific proofs). These currently arrive as unverified photo uploads with no trust signal — the channel partner has to manually cross-check everything from scratch, and there's no way for SAHAYAK to flag obvious problems (expired documents, name mismatches, duplicate submissions) before a human ever looks at them.

## 2. Goals

- Give every uploaded document a clear, auditable verification status.
- Use the real, production-grade Indian verification mechanism (DigiLocker) wherever possible, rather than inventing a fake verification step.
- Automatically catch cheap, high-value fraud/error signals (mismatched name/DOB, expired validity, duplicate document numbers) before human review.
- Route anything not auto-verifiable to the existing `PARTNER_STAFF` role for manual sign-off — this is the realistic, authoritative final step, not a workaround.
- Minimize retention of raw sensitive documents once verification completes, per DPDP Act 2023 obligations.

## 3. Non-Goals (explicitly out of scope)

- Building or claiming a live, production DigiLocker integration for the hackathon demo — this requires government sandbox onboarding that isn't achievable in the timeline. The demo uses a clearly-labeled simulated DigiLocker flow.
- Building a general-purpose fraud detection ML model. The auto-flag rules in §6 are deterministic and explainable, not a black-box classifier — consistent with the "rule engine decides, AI only explains" principle from PRD v2 §6.
- Verifying documents not required by the selected scheme's config (checklist stays scheme-driven, per PRD v1 §26).

---

## 4. Three-Layer Verification Architecture

### Layer 1 — DigiLocker (source-verified, highest trust)
Where the document type is available via DigiLocker (Aadhaar, and in DigiLocker-integrated states, caste/income certificates):
- Beneficiary taps **"Fetch via DigiLocker"** instead of uploading a photo
- OAuth-style consent flow → document pulled directly from the issuing authority with its digital signature
- Document is marked `VERIFIED` immediately, with `verification_source: DIGILOCKER`, issuer name, and signature reference stored — no OCR or manual review needed
- **Demo note:** implement this flow with the real DigiLocker UI pattern and API contract, but mock the actual response — label the mocked step visibly in the demo ("DigiLocker sandbox — simulated") rather than presenting it as live.

### Layer 2 — OCR + Rule-Based Sanity Checks (for uploaded scans)
Where DigiLocker isn't available/used and the beneficiary uploads a photo/scan:
- OCR extraction (Tesseract or a cloud OCR API) pulls: name, DOB, document/certificate number, issuing authority, issue date, validity/expiry if present
- Extracted fields are cross-checked against the profile data already collected at onboarding (§ of the earlier onboarding-fields discussion): name match, DOB match
- Rule-based checks run automatically (see §6)
- Result: `OCR_EXTRACTED` → either `PENDING_PARTNER_REVIEW` (clean) or `AUTO_FLAGGED` (issue found), never auto-set to `VERIFIED` — OCR alone is not sufficient trust for a government scheme application
- **This layer is fully real and buildable in the hackathon window** — prioritize shipping this working end-to-end on at least one document type (e.g., income certificate) for the live demo.

### Layer 3 — Partner Staff Manual Review (authoritative, always available as fallback)
- Every document not `VERIFIED` via DigiLocker lands in the `PARTNER_STAFF` queue (already specified in the RBAC guide) with its OCR-extracted fields and any auto-flags shown alongside the original image
- Partner staff marks `VERIFIED` or `REJECTED` (with reason, e.g., "certificate expired," "photo unreadable," "name mismatch — resubmit")
- This is not a fallback of last resort — it's the actual authoritative step in the real-world process today, and framing it that way in the PRD/pitch is more honest and more credible than pretending full automation.

---

## 5. Document Status Model

```
UPLOADED               → received, no processing yet
OCR_EXTRACTED           → fields pulled, awaiting checks
AUTO_FLAGGED            → automated check found an issue (see §6)
PENDING_PARTNER_REVIEW  → clean or flagged, awaiting human sign-off
VERIFIED                → confirmed via DigiLocker signature OR partner staff approval
REJECTED                → partner staff rejected, with reason; beneficiary can re-upload
```

State transitions are logged to the `AuditLog` table already introduced in the RBAC guide (`action: "DOCUMENT_STATUS_CHANGED"`, `metadata: { from, to, reason, reviewedBy }`).

---

## 6. Automated Flag Rules (deterministic, explainable)

| Check | Flag raised |
|---|---|
| Name on document vs. profile name | `NAME_MISMATCH` |
| DOB on document vs. profile DOB | `DOB_MISMATCH` |
| Income certificate issue date older than scheme's freshness window (typically 6–12 months) | `DOCUMENT_STALE` |
| Document/certificate number already associated with a different `User.id` | `DUPLICATE_DOCUMENT` |
| Issuing authority not on the recognized-issuer list for that document type/state | `UNRECOGNIZED_ISSUER` |
| OCR confidence below threshold on a required field | `LOW_OCR_CONFIDENCE` — routed straight to manual review, not auto-flagged as fraud |

Each flag is shown to `PARTNER_STAFF` as a plain-language reason, not a raw error code — reuse the same "explain the rule trace" principle from PRD v2 §6 (AI assistant guardrails): flags are generated by deterministic rules, and any AI-generated phrasing of the flag must cite which rule fired.

---

## 7. Data Model

```prisma
model Document {
  id                String   @id @default(cuid())
  userId            String
  schemeId          String
  documentType      String            // e.g. "INCOME_CERTIFICATE", "CASTE_CERTIFICATE"
  status            DocumentStatus    // enum per §5
  verificationSource String           // "DIGILOCKER" | "OCR_MANUAL" | null
  extractedFields   Json?             // OCR output: name, dob, certNumber, issueDate, etc.
  flags             String[]          // e.g. ["NAME_MISMATCH", "DOCUMENT_STALE"]
  reviewedBy        String?           // PARTNER_STAFF user id
  reviewedAt        DateTime?
  rejectionReason   String?
  filePath          String?           // see §8 retention policy — nullable post-verification
  createdAt         DateTime @default(now())
}

enum DocumentStatus {
  UPLOADED
  OCR_EXTRACTED
  AUTO_FLAGGED
  PENDING_PARTNER_REVIEW
  VERIFIED
  REJECTED
}
```

Ties into existing `ChannelPartner`/`Application` tables via `userId`/`schemeId` — no changes to those tables required.

---

## 8. Privacy & Retention (DPDP Act 2023 alignment)

- Store `extractedFields` (structured metadata) as the primary record, not the raw file, once a document reaches `VERIFIED`.
- Retain the raw uploaded file (`filePath`) only until the application reaches a terminal state (approved/rejected/withdrawn) or a fixed retention window (e.g., 90 days post-verification) — then null it out, keeping only the verification metadata and audit trail.
- Explicit consent capture before document upload begins, same consent pattern already required for category/income collection (PRD v2 §34).
- The recommendation/eligibility engine and AI assistant never read `Document.filePath` or raw OCR text directly — only the boolean `status === VERIFIED` and derived eligibility flags, consistent with the "AI never touches raw sensitive data" principle already established.

---

## 9. UI Touchpoints (build using existing design system only — no new component styles)

- **Beneficiary side:** document checklist card (already specced in Dashboard Spec §2.4) gains a per-document status chip (`Uploaded` / `Under Review` / `Verified` / `Rejected — resubmit`), plus the "Fetch via DigiLocker" option shown first, upload-a-photo as secondary path.
- **Partner Staff side:** new queue view (already scoped in RBAC guide §4, `partner-portal/queue/`) gains a document review panel per application — shows original image, OCR-extracted fields side by side, any auto-flags, and Approve/Reject actions.

---

## 10. Acceptance Criteria

- A beneficiary can upload a document and see its status change from `Uploaded` → `Under Review` → `Verified`/`Rejected` without a page reload.
- At least one document type (recommend: income certificate) runs real OCR extraction and at least two of the automated flag rules from §6 end-to-end in the demo.
- The DigiLocker path is present in the UI and clearly labeled as a simulated/sandbox flow in the demo, not presented as a live government integration.
- Partner staff can see and act on a flagged document, and that action updates the beneficiary-facing status in real time (same live-status pattern as the application tracker in the Dashboard Spec).
- No raw document file is readable by the recommendation engine or AI assistant at any point.

---

## 11. Build Priority for Hackathon Timeline

1. `Document` table + status enum (no UI yet).
2. Upload flow + OCR extraction + auto-flag rules for **one** document type, fully working.
3. Partner Staff review queue panel (Approve/Reject), wired to update beneficiary-facing status live.
4. Beneficiary-side status chips on the document checklist card.
5. DigiLocker UI flow, mocked response, clearly labeled.
6. Additional document types (extend the same pipeline — no new architecture needed) if time remains.
