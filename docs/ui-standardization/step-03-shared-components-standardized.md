# UI Standardization - Step 03 Shared Components

Date: 2026-03-03
Goal: Standardize shared UI components to consume central tokens/metrics and remove duplicated hardcoded values.

## Files updated
- `src/theme/theme.ts`
- `src/components/ui/AppButton.tsx`
- `src/components/ui/BaseModal.tsx`
- `src/components/ui/AppCard.tsx`
- `src/components/ui/HeaderBar.tsx`
- `src/components/ui/AppScreen.tsx`

## What was standardized

### 1) Centralized shared metrics
Added `componentMetrics` in `theme.ts`:
- Button paddings/disabled opacity
- AppCard padding
- Header paddings/title margin
- Modal overlay paddings + animation metrics
- AppScreen default top/horizontal padding

### 2) Replaced hardcoded color/surface literals in shared components
- `AppButton`: `#F8FAFC` -> `colors.onPrimary`
- `BaseModal`: `rgba(...)` backdrop literals -> `colors.backdropStrong`

### 3) Replaced hardcoded numeric style literals with central metrics
- Button/Card/Header/Modal/AppScreen spacing + radii-related metrics now read from `componentMetrics` or tokens.

## Validation results

### Static checks
- `pnpm typecheck` -> PASS
- `eslint` on updated files -> PASS

### Hardcode checks (shared components set)
- Raw color literals (`#hex`, `rgba(...)`) in:
  - `AppButton`, `BaseModal`, `AppCard`, `HeaderBar`, `AppScreen` -> **0 matches**
- Direct numeric spacing/radius literals in the same files -> **0 matches**

### Runtime / visual checks
- `pnpm exec jest --passWithNoTests` -> PASS (3 suites / 15 tests)
- `pnpm screenshots` -> PASS (full capture flow completed)
- Latest screenshots generated successfully under `docs/screenshots/output/latest/`

## Observed effect
- Visual output remains aligned with current UI style (no redesign).
- Shared UI layer now has a single source of truth for common spacing/color behavior.
- Ready for Step 04+ screen migration with lower risk and clearer review diffs.
