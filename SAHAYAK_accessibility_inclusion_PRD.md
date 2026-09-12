# SAHAYAK — Add-On PRD: Accessibility & Inclusion Layer
### Implementation instructions for editing the existing website (non-destructive to current UI/CSS)

**Ties into:** PRD v1 (§9 onboarding, §28 multilingual), PRD v2 (§6 voice-first path), RBAC Guide (§1 roles), Beneficiary Dashboard Spec, USP discussion (Household View, WhatsApp/IVR)

**Ground rule (same as every prior add-on):** every change here is additive on top of the existing site. Do not modify `tailwind.config.*`, global stylesheets, or existing component visual styles. New audio/icon/assisted-mode elements must be built from existing `components/ui/` primitives (buttons, cards, progress bars) — only their *content and interaction pattern* changes, not their visual language.

---

## 1. Scope of This PRD

This covers editing the **existing onboarding, recommendation, and dashboard screens already built** to add:
1. Audio-first question delivery
2. Icon/tap-only answer paths (removing free-text where avoidable)
3. "Confirm your answer back" pattern
4. Assisted-mode / proxy-fill support
5. A new lightweight `FIELD_AGENT` role
6. WhatsApp channel (secondary entry point)
7. IVR channel (secondary entry point, spec-level for hackathon)

Each section below states exactly what existing files/components to touch and what new files to add, so Antigravity can work directly against the current codebase without redesigning anything.

---

## 2. Audio-First Question Delivery

### What to change
In the existing onboarding flow (each question screen from PRD v1 §11–13), add:
- A `speakQuestion()` call on screen mount, using the Web Speech API (`SpeechSynthesisUtterance`) in the user's selected language — no new library required, this is browser-native
- A visible (existing button style) **replay audio** icon next to the question text, for users who want to hear it again
- Audio plays automatically once; never forces the user to listen before they can answer — this must stay optional-but-default, not a gate

### Files to touch
- Existing onboarding question component(s) — add a `useEffect`/mount hook that calls a new small utility, do not restructure the component's layout or styling
- New file: `lib/accessibility/speak.ts` — thin wrapper around `SpeechSynthesisUtterance`, takes `(text, langCode)`

### What NOT to change
- Do not alter the existing question text styling, spacing, or card layout — audio is additive to what's already rendered, not a replacement of the visible text.

---

## 3. Icon/Tap-Only Answer Paths

### What to change
Audit existing onboarding fields (income, category, purpose, etc.) and, wherever a field is currently a free-text or dropdown input, replace with a large tappable icon-card grid using the **existing card component already used elsewhere** (e.g., the onboarding category cards from PRD v1 §11 already establish this pattern — extend it to more fields rather than inventing a new pattern).

- Numeric fields that can't be icon-based (e.g., exact income) should use a **slider or stepped range-picker** (₹0–1L, ₹1–2L, ₹2–3L, ₹3L+) instead of a free-text number field — reduces both literacy and numeracy burden, and is still precise enough for eligibility matching
- Retain free-text only where genuinely unavoidable (e.g., name) — even there, offer voice-to-text as an alternative input via the existing Web Speech API (`SpeechRecognition`)

### Files to touch
- Existing onboarding field components — swap input type, reuse existing `Card`/`Button` components from `components/ui/`
- New file: `components/onboarding/RangeIconPicker.tsx` — reuses existing card/button styling, no new CSS

---

## 4. "Confirm Your Answer Back" Pattern

### What to change
After each onboarding answer is captured, insert a lightweight confirmation step before advancing:
```
You said: ₹2.5 lakh per year
[✓ Yes, correct]   [✗ No, change it]
```
Spoken aloud via the same `speak.ts` utility, and shown using the existing card/button components. This is a **flow change**, not a visual redesign — insert it as an intermediate state in the existing onboarding step machine (whatever state management is already used — likely a step index in React state or a form library).

### Files to touch
- Onboarding flow controller (wherever step progression logic currently lives) — add a `confirming` sub-state per question
- No new components needed beyond reusing existing `Card`, `Button`, and the `speak.ts` utility from §2

---

## 5. Assisted-Mode / Proxy-Fill Support

### What to change
Add a toggle at the very start of onboarding: **"Filling this in for someone else?"** (existing toggle/switch component). When enabled:
- Question phrasing swaps from first-person to third-person via the existing i18n system (PRD v1 §28) — add a parallel set of string keys (e.g., `income_question_self` vs `income_question_proxy`) rather than dynamic string manipulation, since i18n-driven text swaps are more maintainable and already fit the existing translation-file pattern
- No layout change — purely a text-source swap plus one additional field ("Whose information is this?") at the top

### Files to touch
- `i18n/en.json`, `i18n/hi.json` (and any other language files already present) — add proxy-mode string keys
- Onboarding flow controller — read a `isProxyMode` boolean, select the correct string key set

---

## 6. New `FIELD_AGENT` Role (CSC operator / NGO field worker)

### Why
This role lets a trained operator run assisted-mode onboarding for multiple beneficiaries in a day at a physical center — realistic given how much of India's digital-government interaction happens through Common Service Centres, not solo self-service.

### Database change (additive, extends the RBAC guide's existing enum)
```prisma
enum UserRole {
  BENEFICIARY
  FIELD_AGENT          // NEW
  PARTNER_STAFF
  STATE_COORDINATOR
  CORP_ADMIN
  MINISTRY_ADMIN
  SUPPORT_OFFICER
  SYSTEM_ADMIN
}
```
Add to `PERMISSIONS` matrix (RBAC guide §5):
```ts
FIELD_AGENT: ['onboarding:submit:on_behalf_of', 'household:manage:assisted'],
```

### UI
- Field Agent login uses the existing staff-login screen (RBAC guide §3 `staff-login/`) — no new login UI needed, just the new role value
- New route `field-agent/dashboard/` — a simple "Start New Beneficiary Entry" button + list of entries submitted that day, built from existing admin-section layout shell (reuse, per RBAC guide §4's constraint, don't create a new visual theme)
- Every onboarding submission by a `FIELD_AGENT` is tagged `submittedByAgentId` on the `Application`/`Recommendation` record, for audit purposes (ties into the existing `AuditLog` table)

---

## 7. WhatsApp Channel (Secondary Entry Point)

### Scope for hackathon
Build a minimal working version, not a full production integration:
- Use the WhatsApp Business Cloud API (Meta) sandbox/test number
- A short scripted conversation flow: greeting → language selection (button reply) → 4–5 core onboarding questions (button replies + voice notes accepted) → result sent back as a template message with top scheme match + nearest partner
- Backend: a new lightweight webhook handler (`api/whatsapp/webhook`) that maps incoming messages to the same onboarding/recommendation logic already used by the web flow — **reuse the existing recommendation engine and API**, do not duplicate eligibility logic for this channel
- Voice notes received via WhatsApp can be transcribed using the same speech-to-text approach as §3, or left as a "we'd transcribe this in production" demo note if time-constrained

### Files to add
- `api/whatsapp/webhook.ts` — new route, calls existing `recommendationService` (already specced in PRD v1 §37 folder structure)
- No frontend/CSS changes required — this channel has no web UI of its own

---

## 8. IVR Channel (Spec-Level for Hackathon, Architecture Only)

Given hackathon time constraints, this is the one channel to **spec but not fully build**:
- Document the architecture: toll-free number → IVR menu (language selection via keypress) → recorded prompts for each onboarding question → keypress or short recording per answer → SMS sent with result
- Reuses the same backend recommendation service as every other channel (web, WhatsApp) — the IVR layer is just another client calling the same core API, which is worth stating explicitly in the pitch as proof the architecture is genuinely channel-agnostic
- For the demo: a single slide + optionally a pre-recorded mock call audio clip is sufficient; do not attempt live IVR infra (e.g., Twilio/Exotel setup) unless significant time remains, since telephony integration debugging is a poor use of limited hackathon hours relative to its demo payoff

---

## 9. What NOT to Touch (repeated, because it matters most here)

- No new color tokens, fonts, or component styles anywhere in this PRD's scope — every new element (range picker, confirm-back card, field agent dashboard) is built from existing `components/ui/` primitives.
- Do not restructure the existing onboarding step flow's core logic — insert new sub-states (confirmation, proxy mode) into it, don't rewrite it.
- Do not duplicate the recommendation/eligibility logic for WhatsApp or IVR — all channels must call the same backend service the web app already uses. Divergent logic across channels is both a maintenance risk and a red flag if a judge asks "does the WhatsApp bot use the same eligibility rules?"

---

## 10. Build Priority for Hackathon Timeline

1. Audio-first questions (§2) + confirm-your-answer-back (§4) — cheap, high visible impact in the live web demo.
2. Icon/range-picker replacements for free-text fields (§3) — moderate effort, directly visible in demo.
3. Assisted-mode toggle (§5) — cheap (mostly i18n string additions).
4. `FIELD_AGENT` role + minimal dashboard (§6) — moderate effort, good for a "we thought about who actually operates this" pitch beat even with a bare-bones UI.
5. WhatsApp channel (§7) — higher effort, highest demo payoff if time allows; build last since it's independent of the rest and can be cut without affecting the core web demo.
6. IVR (§8) — spec/slide only, do not build live infra.

---

## 11. Acceptance Criteria

- Every onboarding question is spoken aloud automatically in the selected language, with a manual replay option.
- At least income and category fields use icon/range pickers instead of free-text/dropdown.
- Every answer is confirmed back to the user (visually + audibly) before the flow advances.
- Assisted mode changes question phrasing via existing i18n system, with no layout/style change.
- A `FIELD_AGENT` can log in via the existing staff-login screen and submit an onboarding entry on behalf of a beneficiary, tagged in the audit trail.
- A WhatsApp test number can complete a minimal onboarding flow and return a scheme match, using the same backend recommendation service as the web app.
- No existing CSS, component styling, or unrelated screen behavior is modified by any of the above.
