# SAHAYAK — Add-On: Role-Based Sign-In & Access Control
### Implementation instructions for Antigravity (non-destructive to existing UI/CSS)

**Ground rule for every step below:** do not create new Tailwind config, new color tokens, new fonts, or new global stylesheets. Every new screen/component listed here must import and reuse the existing design system (existing Tailwind classes, existing shadcn/ui components, existing color variables) exactly as already defined in the codebase. If a needed style doesn't exist yet, extend the existing `tailwind.config` theme tokens rather than hardcoding new values — never write component-level inline styles that bypass the design system.

---

## 1. Roles to Implement

```ts
enum UserRole {
  BENEFICIARY        // citizen, default role
  PARTNER_STAFF       // channel partner branch user
  STATE_COORDINATOR   // SCA state nodal officer
  CORP_ADMIN          // NSFDC / NBCFDC / NSKFDC scheme admin
  MINISTRY_ADMIN       // MoSJE super admin, cross-corporation
  SUPPORT_OFFICER      // grievance/read-only support (optional, can skip for MVP)
  SYSTEM_ADMIN         // dev/system config, user management
}
```

For the hackathon MVP, implement fully: `BENEFICIARY`, `PARTNER_STAFF`, `MINISTRY_ADMIN`. Stub the rest as valid enum values with routes that 404/"coming soon" — this keeps the data model complete without extra build time.

---

## 2. Database Changes (Prisma — additive only, no existing table renamed)

```prisma
model User {
  id            String   @id @default(cuid())
  phone         String?  @unique
  email         String?  @unique
  passwordHash  String?          // null for OTP-only beneficiary accounts
  role          UserRole @default(BENEFICIARY)
  corporationId String?          // set for CORP_ADMIN: "NSFDC" | "NBCFDC" | "NSKFDC"
  partnerId     String?          // set for PARTNER_STAFF, FK to ChannelPartner
  stateCode     String?          // set for STATE_COORDINATOR
  createdAt     DateTime @default(now())
  lastLoginAt   DateTime?
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // e.g. "SCHEME_UPDATED", "PARTNER_STATUS_CHANGED"
  targetId  String?
  metadata  Json?
  createdAt DateTime @default(now())
}
```

Run as a new migration on top of the existing schema. Do not touch existing `Scheme`, `ChannelPartner`, `Recommendation` tables except adding the `partnerId`/`corporationId` foreign keys referenced above if not already present.

---

## 3. Auth Flow Per Role

| Role | Sign-in method | Session type |
|---|---|---|
| Beneficiary | Mobile OTP (no password) | JWT, 30-day refresh, guest mode allowed pre-signup |
| Partner Staff | Email/phone + password, invited by Corp Admin | JWT, 8-hour session |
| Corp Admin / Ministry Admin | Email + password + optional 2FA | JWT, 8-hour session, forced re-auth for destructive actions |
| System Admin | Email + password + mandatory 2FA | Short-lived session, 1-hour |

Use a single `/api/auth/*` route group (NextAuth.js or a custom JWT implementation is fine — reuse whatever auth pattern already exists in the repo if one does; don't introduce a second auth library).

---

## 4. Folder/Route Additions (new files only, nothing existing is modified)

```
src/
├── app/ (or pages/, match existing convention)
│   ├── (auth)/
│   │   ├── login/                 ← new: role-aware login screen
│   │   ├── beneficiary-otp/       ← new
│   │   └── staff-login/           ← new: shared by partner/corp/ministry, role resolved server-side
│   ├── partner-portal/            ← new, PARTNER_STAFF only
│   │   ├── dashboard/
│   │   ├── queue/                 ← incoming routed beneficiaries
│   │   └── availability/          ← toggle fund/accepting-applications status
│   ├── admin/                     ← already exists per v1 PRD; extend, don't rebuild
│   │   ├── ministry/              ← new subsection, MINISTRY_ADMIN only
│   │   │   └── equity-analytics/
│   │   └── corporation/           ← new subsection, CORP_ADMIN only, scoped by corporationId
│   └── ... (existing beneficiary-facing routes untouched)
│
├── middleware.ts                  ← new or extend existing: route guards by role
├── lib/
│   ├── auth/
│   │   ├── session.ts             ← new
│   │   ├── permissions.ts         ← new: central permission matrix (see §5)
│   │   └── withRole.ts            ← new: HOC/wrapper for role-gated pages & API routes
```

**Critical constraint:** every new page under `partner-portal/` and `admin/` must import layout wrappers, buttons, cards, and typography from the *existing* `components/ui/` and `components/layout/` folders. Do not scaffold a separate "admin theme." If the existing admin section already has its own layout shell from v1, extend that shell rather than creating a new one.

---

## 5. Central Permission Matrix (single source of truth)

```ts
// lib/auth/permissions.ts
export const PERMISSIONS: Record<UserRole, string[]> = {
  BENEFICIARY:        ['recommendation:view:own', 'application:create:own'],
  PARTNER_STAFF:      ['queue:view:own_partner', 'availability:update:own_partner', 'application:update_status:own_partner'],
  STATE_COORDINATOR:  ['partner:manage:own_state', 'partner_performance:view:own_state'],
  CORP_ADMIN:         ['scheme:manage:own_corporation', 'document_checklist:manage:own_corporation'],
  MINISTRY_ADMIN:      ['scheme:manage:*', 'partner:manage:*', 'analytics:view:*', 'equity_analytics:view:*'],
  SUPPORT_OFFICER:     ['application:view:flagged'],
  SYSTEM_ADMIN:        ['user:manage:*', 'audit_log:view:*'],
};
```

Every new API route and every new gated page checks against this matrix via `withRole()` — do not scatter `if (user.role === ...)` checks ad hoc across components; keep it centralized so it's auditable (judges/reviewers can be shown this one file as proof of a real access-control design, not just a UI toggle).

---

## 6. Wiring Into the Recommendation/Partner Features Already Built

- `PARTNER_STAFF` updating their `availability` and `application status` should write directly into the fields your existing partner-ranking algorithm already reads (`availability_status`, `processing_capacity`, and the new `partner_reliability_score` derived field from the PRD v2). No change needed to the ranking algorithm itself — just make its inputs live instead of seed-only.
- `MINISTRY_ADMIN`'s equity analytics view queries existing `Recommendation` + `User` tables grouped by `beneficiary_category`/gender/district — this is a read-only aggregation view, safe to add without touching write paths.

---

## 7. What NOT to Touch

- Do not modify `tailwind.config.*`, global CSS files, or any existing component in `components/ui/`.
- Do not change the existing beneficiary-facing onboarding, recommendation, calculator, or map screens — this feature is purely additive (new routes + new backend authorization), layered on top.
- Do not introduce a second design system "for the admin/partner side" — reuse what exists, even if it means the partner portal looks visually plainer than a bespoke admin theme would. Consistency reads better to judges than a flashier but disjointed second UI.

---

## 8. Suggested Build Order

1. Prisma migration (§2) — no UI yet.
2. `lib/auth/permissions.ts` + `withRole.ts` (§5).
3. Beneficiary OTP login (already lightweight, low risk).
4. Partner staff login + minimal queue/availability screens (unlocks the reliability-score demo).
5. Ministry admin equity analytics screen (unlocks the closing demo beat from PRD v2 §10).
6. Corp admin / state coordinator screens only if time remains — these are "architecture completeness" items, not demo-critical.
