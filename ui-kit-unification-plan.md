# UI Standardization Plan (Current UI Only)

## Goal
Chuan hoa UI hien tai cua app ma KHONG doi huong thiet ke va KHONG tao template moi.
Muc tieu la giam hardcode, dong nhat token/component, va giu man hinh sau migrate giong ban hien tai.

## Scope

- In:
  - Chuan hoa token trong `src/theme/*` theo giao dien dang co.
  - Chuan hoa component trong `src/components/ui/*` theo API on dinh.
  - Migrate man hinh trong `src/screens/*` de dung token/component thay vi style copy-paste.
  - Them quality gates de ngan UI lech chuan trong cac PR tiep theo.
- Out:
  - Tao visual template moi.
  - Rebrand, doi mau chu dao, doi style tong the.
  - Sua business logic, navigation flow, API behavior.

## Approach
Lam theo huong "freeze hien trang -> chuan hoa ky thuat -> migrate theo dot nho".
Moi thay doi UI deu phai qua screenshot regression de dam bao khong lech look-and-feel hien tai.
Neu muon nang cap visual (khong chi standardization), xem plan phase 2: `ui-elevation-plan.md`.

## Action Items

- [x] 1. Baseline hien trang UI bang screenshot va inventory
  - Chay `pnpm screenshots` de lay bo anh chuan moi nhat.
  - Tao bang inventory theo man hinh: button, input, card, modal, title, list item, empty/loading/error.
  - Danh dau cac style lap lai va hardcode nhieu nhat.
  - Verify: co 1 danh sach "Top hardcoded styles" de xu ly uu tien.
  - Output: `docs/ui-standardization/step-01-baseline-audit.md`.

- [x] 2. Freeze token tu UI hien tai trong `src/theme/*`
  - Chot token mau, spacing, radius, typography theo dung gia tri dang dung.
  - Them typing ro rang cho token key (tranh dung sai key).
  - Khong them token "du phong" neu chua can.
  - Verify: token map khop voi UI baseline, khong thay doi visual.
  - Output: `docs/ui-standardization/step-02-token-freeze.md` + update `src/theme/theme.ts`.

- [x] 3. Chuan hoa API component co san trong `src/components/ui/*`
  - Chot API cho `AppScreen`, `HeaderBar`, `AppCard`, `AppButton`, `BaseModal`, `EmptyState`, `ScreenTitle`.
  - Loai bo style trung lap giua component va screen.
  - Dam bao component chi doc token, khong hardcode mau/chu/radius.
  - Verify: moi component co contract props ngan + 1 vi du su dung.
  - Output: `docs/ui-standardization/step-03-shared-components-standardized.md`.

- [ ] 4. Tao checklist migrate theo nhom man hinh
  - Dot 1: `Login.tsx`, `Register.tsx`, `Me.tsx`
  - Dot 2: `Devices.tsx`, `AdminUsers.tsx`, `History.tsx`
  - Dot 3: `Info.tsx`, `Settings.tsx`, `Tools.tsx`, `WebViewerScreen.tsx`
  - Moi PR chi xu ly 1-2 man hinh de de review.
  - Verify: moi dot xong deu co before/after screenshot.

- [ ] 5. Migrate style hardcode -> token/component
  - Thay hardcoded `#hex`, `fontSize`, `padding/margin`, `borderRadius` bang token.
  - Thay section UI lap lai bang shared component.
  - Neu can giu style dac thu man hinh, gom vao mot object style co ten ro rang.
  - Verify: so dong hardcode giam ro rang, UI khong vo layout.
  - Progress: Dot 1 pass 1 done (`Login.tsx`, `Register.tsx`, `Me.tsx`) -> `docs/ui-standardization/step-04-dot1-login-register-me-pass1.md`.
  - Progress: Dot 2 pass 1 done (`Devices.tsx`, `AdminUsers.tsx`, `History.tsx`) -> `docs/ui-standardization/step-05-dot2-devices-adminusers-history-pass1.md`.
  - Progress: Dot 3 pass 1 done (`Info.tsx`, `Settings.tsx`, `Tools.tsx`, `WebViewerScreen.tsx`) -> `docs/ui-standardization/step-06-dot3-info-settings-tools-webviewer-pass1.md`.
  - Progress: Debt reduction pass 1 (`KpiDashboard.tsx`, `LoadingScreen.tsx`, `index.tsx`) + lint fix -> `docs/ui-standardization/step-08-debt-reduction-kpi-loading-index-pass1.md`.
  - Progress: Debt reduction pass 2 (`Scanner.tsx` + remaining opacity literals in Login/Register/Me/AdminUsers/KPI) -> `docs/ui-standardization/step-09-debt-reduction-scanner-opacity-pass2.md`.

- [x] 6. Them quality gates de giu chuan
  - Them rule lint canh bao hardcoded color trong `src/screens/*`.
  - Them PR checklist: "Dung token?", "Dung shared component?", "Co screenshot?"
  - Them checklist review visual cho QA/dev.
  - Verify: PR moi khong dua them hardcode nhieu nhu truoc.
  - Progress: Added guard script + CI + baseline + checklist -> `docs/ui-standardization/step-07-quality-gates.md`.

- [ ] 7. Regression test sau moi dot
  - Chay: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm screenshots`.
  - So sanh screenshot output voi baseline.
  - Neu lech visual > nguong chap nhan, rollback style edit va chia nho patch.
  - Verify: bo screenshot sau migrate on dinh va nhat quan.

- [x] 8. Chot tai lieu van hanh UI standardization
  - Tao tai lieu ngan: token map, component map, quy tac dat style, migration rules.
  - Them "do/don't" cho team.
  - Dinh ky review 2 tuan/lan de xu ly no ky thuat UI con ton.
  - Verify: dev moi co the follow quy trinh ma khong can hoi lai.
  - Output: `docs/ui-standardization/step-10-operating-guide-plan-step-08.md`.

## Validation Commands (per PR)
- `pnpm ui:guard`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm screenshots` (optional for high visual-risk changes)

## Done When
- [ ] Toan bo man hinh trong `src/screens/*` dung token va shared component cho phan UI co ban.
- [ ] Hardcoded styles trong screen files giam manh va khong phat sinh moi.
- [ ] Screenshot regression giu giao dien sau chuan hoa gan voi ban hien tai.
