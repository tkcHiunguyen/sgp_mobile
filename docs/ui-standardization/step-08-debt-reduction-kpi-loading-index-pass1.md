# UI Standardization - Step 08 Debt Reduction (KPI/Loading/Home) Pass 1

Date: 2026-03-04

## Scope completed
- `src/screens/KpiDashboard.tsx`
- `src/screens/LoadingScreen.tsx`
- `src/screens/index.tsx`

## What changed

### 1) Fixed lint regression in KPI screen
- Resolved `react-hooks/rules-of-hooks` error by removing conditional `useMemo` call path.
- `totalEvents` now computed safely before early-return branch.

### 2) Replaced hardcoded radius/color with tokens
- Migrated numeric `borderRadius` literals to `radius.*` in KPI/Loading/Home.
- Replaced Loading screen text hardcoded white (`#F8FAFC`) with `colors.onPrimary`.
- Removed stale inline comment containing old hex color reference.

### 3) Tightened quality gate baseline
- Re-ran `pnpm ui:guard:update` after debt reduction.
- Baseline counts updated:
  - `COLOR`: `9 -> 7`
  - `RADIUS`: `22 -> 12`
  - `OPACITY`: `12 -> 12`

## Measured impact (target files)

Detection pattern:
- `#hex`, `rgba(...)`, `borderRadius: <number>`, `opacity: <number>`

Before:
- KPI: `5`
- Loading: `5`
- Home (`index.tsx`): `3`
- Total: `13`

After:
- KPI: `1`
- Loading: `0`
- Home (`index.tsx`): `0`
- Total: `1`

Reduction:
- `-12` matches (`~92.3%` reduction in this pass scope)

## Validation
- `pnpm exec eslint src/screens/KpiDashboard.tsx src/screens/LoadingScreen.tsx src/screens/index.tsx` -> PASS
- `pnpm lint` -> PASS
- `pnpm typecheck` -> PASS
- `pnpm exec jest --passWithNoTests` -> PASS (3 suites / 15 tests)
- `pnpm ui:guard` -> PASS
- `pnpm ui:guard:update` -> PASS (baseline refreshed)

## Next
- Continue baseline debt reduction on:
  - `src/screens/Scanner.tsx` (largest remaining hotspot)
