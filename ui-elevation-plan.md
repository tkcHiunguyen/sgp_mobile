# UI Elevation Plan (Phase 2)

Date: 2026-03-04
Owner: UI/Frontend

## Goal
Nang cap UI theo huong dep hon, hien dai hon, de nho hon, nhung khong pha flow nghiep vu va khong lam giam toc do app.

## Constraints
- Khong doi business logic, API flow, navigation map.
- Giu token-first architecture (`theme.ts`, shared components).
- Moi thay doi visual phai qua gate: `ui:guard`, `lint`, `typecheck`, `test`.

## Design Direction (recommended)
Direction: **Precision Tech Minimal**

DFII:
- Impact: 4
- Context Fit: 5
- Feasibility: 5
- Performance: 5
- Consistency Risk: 2
- Score: `(4 + 5 + 5 + 5) - 2 = 17` (Excellent)

Visual anchor:
- Contrast manh, card depth ro rang, typography scale co hierarchy, iconography dong bo, transition ngan gon co chu dich.

## Tasks
- [x] Task 1: Chot visual thesis + sample board (mau, type, elevation, motion) -> Verify: da tao "north star" spec (`docs/ui-standardization/ui-elevation-north-star.md`).
- [x] Task 2: Mo rong token layer (elevation, border strength, motion duration/easing, semantic text levels) -> Verify: da them token + typing trong `src/theme/theme.ts`.
- [x] Task 3: Nang cap primitive set (`AppButton`, `AppCard`, `BaseModal`, input wrappers, chips) -> Verify: da nang cap `AppButton`, `AppCard`, `BaseModal` va giu API tuong thich.
- [x] Task 4: Dinh nghia layout patterns dung lai (section header, stat row, list row, form block, empty/error blocks) -> Verify: da tao pattern catalog (`docs/ui-standardization/ui-pattern-catalog.md`).
- [x] Task 5: Pilot 3 man hinh co impact cao (`Login`, `Home/index`, `Scanner`) -> Verify: da apply visual uplift + automated checks pass (manual iOS dark/light checklist tiep tuc o Task 6).
- [x] Task 6: Chay QA/QC khong phu thuoc screenshot cho pilot (`ui:guard`, `typecheck`, `lint`, `test`, `ui:qaqc`) -> Verify: tat ca gate pass cho 3 man hinh pilot va flow doi theme.
- [ ] Task 7: Rollout theo waves (Wave A: auth/profile, Wave B: dashboard/admin, Wave C: utility/settings/tools) -> Verify: moi wave merge rieng, co note thay doi visual.
- [ ] Task 8: Regression + release hardening -> Verify: `pnpm ui:guard && pnpm lint && pnpm typecheck && pnpm test` pass + screenshot diff chap nhan duoc.

## Rollout Sequence
1. Foundation: Task 1-4
2. Pilot: Task 5-6
3. Full rollout: Task 7
4. Stabilization: Task 8

Execution log:
- Foundation pass 1: `docs/ui-standardization/step-11-ui-elevation-foundation-pass1.md`
- Pilot pass 1 (Login/Home/Scanner): `docs/ui-standardization/step-12-ui-elevation-pilot-login-home-scanner-pass1.md`
- Pilot QA/QC non-screenshot pass 1: `docs/ui-standardization/step-13-qaqc-non-screenshot-pass1.md`

## Success Metrics
- Time-to-understand man hinh chinh (Login/Home/Scanner) giam (qua internal QA feedback).
- So issue "UI khong dong bo" giam sau 2 sprint.
- Khong co tang regression bug do visual refactor.
- Guard baseline van duy tri `0` hardcode literals moi trong `src/screens/*`.

## Done When
- [ ] Toan bo screens theo style language moi nhat quan.
- [ ] Shared component map duoc su dung thay vi one-off UI blocks.
- [ ] QA dark/light pass tren iOS route checklist.
- [ ] Khong fail quality gate trong 2 sprint lien tiep.
