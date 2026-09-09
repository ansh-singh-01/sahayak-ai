# SAHAYAK — Add-On: Beneficiary Dashboard Spec
### For a returning, signed-in citizen user (distinct from first-time onboarding flow)

**Ground rule (same as the RBAC guide):** build this screen entirely from existing `components/ui/` and layout primitives already in the codebase. No new colors, fonts, or component styles — this is a new route (`/dashboard` or `/home`, matching existing convention), not a new design system.

---

## 1. Purpose

The dashboard is the landing screen for a **returning** beneficiary — someone who has already signed in at least once. It should answer one question at a glance: **"What do I do next?"** It is action-oriented, not a passive analytics view (that style belongs to admin roles only — see RBAC guide §5).

First-time users still go through the existing onboarding flow (PRD v1 §11–13). Only after onboarding is at least started should the dashboard become the default landing route for that user.

---

## 2. Layout — Card Blocks (top to bottom, mobile-first single column; desktop can use 2-column grid)

### 2.1 Header
```
Namaste, [Name] 👋
[Status line — one of:]
"You have 1 active application"
"Complete your profile to see your matches"
"No active applications — start when you're ready"
```
**Data source:** `User.name`, derived from latest `Recommendation`/`Application` status.

---

### 2.2 Application Status Tracker *(primary block — render first/largest)*

One card per active application:
```
[Scheme Name]
Stage: Recommended → Documents Pending → Submitted → Under Review → Approved/Rejected
                                    ●─────────○─────────○─────────○
Last updated: [date]
[View Details →]
```
**Data source:** `Application.status`, updated live by `PARTNER_STAFF` in the partner portal (RBAC guide §6). This is the field that makes the dashboard feel "alive" rather than static — no separate polling needed, just read the same status field the partner updates.

If no active application: show an empty-state card with CTA → "Find My Scheme."

---

### 2.3 Your Recommended Scheme(s)

- If onboarding/recommendation already completed: show top match card (scheme name, match %, one-line "why") + `View Full Recommendation →`
- If not completed: prominent CTA card, visually distinct (not buried below other cards) — "Find My Scheme" — since a meaningful share of users will land on the dashboard before finishing the flow

**Data source:** latest `Recommendation` record for `user_id`.

---

### 2.4 Document Checklist Progress

```
Documents  4 / 7 ready
████████░░░░
[Continue Checklist →]
```
**Data source:** existing document checklist state (PRD v1 §26), scoped to the user's active scheme.

---

### 2.5 Your Channel Partner

Once a partner is assigned/routed:
```
[Partner Name] · [Distance]
[Contact] · [Working hours]
[Get Directions] [Contact Partner]
```
**Data source:** `Application.partnerId` → `ChannelPartner` record. If no partner assigned yet, omit this card rather than showing an empty one.

---

### 2.6 Quick Actions (row of icon buttons/cards)

- **Recalculate Loan** — reopens calculator pre-filled with saved inputs
- **Compare Other Schemes** — shows near-miss/alternative schemes (PRD v2 §7 gap-to-eligibility)
- **Ask Sahayak** — opens AI assistant
- **Start New Application** — for a different purpose/category (business vs. education vs. income-generating)

Use existing button/card components; this is a horizontal scroll row on mobile, inline row on desktop.

---

### 2.7 Notifications / Updates

Short list, most recent first:
```
🔔 Your partner responded to your application — 2 days ago
🔔 Document verified: Income Certificate — 5 days ago
🔔 You may now qualify for [Scheme] based on updated info — 1 week ago
```
**Data source:** new lightweight `Notification` table (or reuse `AuditLog` if already present from RBAC guide §2, filtered to user-relevant events). The "you may now qualify" case should trigger when a re-run of the eligibility engine (e.g., after profile edit) produces a newly-eligible scheme that wasn't eligible before — reuses the existing rule engine, no new logic needed, just re-invoke it on profile update.

---

### 2.8 Profile & Settings (icon/link, not a full card — keep this light on the dashboard itself)

Links out to a separate settings page:
- Edit personal info
- Language preference
- Accessibility mode (voice-first toggle, per PRD v2 §6)
- Linked phone/email
- Data & privacy controls — view/delete stored data (ties to DPDP Act note, PRD v2 §34)

---

### 2.9 Help / Support (footer-level, not prominent)

- FAQ
- Contact SCA / grievance link
- "Talk to Sahayak" (same entry point as §2.6)

---

## 3. Explicitly Out of Scope for This Screen

Do not include on the beneficiary dashboard:
- Admin-style analytics/charts (equity analytics, funnel drop-off — those belong to `MINISTRY_ADMIN` only, per RBAC guide)
- Partner performance data or queue views (`PARTNER_STAFF` only)
- Scheme management/editing controls (`CORP_ADMIN`/`MINISTRY_ADMIN` only)

Keeping this boundary clean matters for the demo: it shows the same platform genuinely serves three different roles with three different, appropriately-scoped views — rather than one dashboard with role-based visibility toggles bolted on.

---

## 4. Data Sources Summary

| Block | Reads from |
|---|---|
| Status tracker | `Application.status` (written by Partner Staff) |
| Recommended scheme | `Recommendation` (written by rule engine) |
| Document checklist | Document checklist state, scoped to active scheme |
| Channel partner | `Application.partnerId` → `ChannelPartner` |
| Notifications | New `Notification` table or filtered `AuditLog` |
| Quick actions | No new data — links to existing calculator/recommendation/AI assistant routes |

No new backend logic is required beyond a `Notification` table and wiring the dashboard to read existing tables — this is primarily a UI composition task over data your recommendation engine, calculator, and partner portal already produce.
