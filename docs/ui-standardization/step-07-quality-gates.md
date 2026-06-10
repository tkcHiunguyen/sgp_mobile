# UI Standardization - Step 07 Quality Gates

Date: 2026-03-04

## Goal
Prevent new UI hardcode debt from entering `src/screens/*` while legacy debt is being reduced incrementally.

## Implemented

### 1) Baseline-diff guard script
- Added script: `tools/ui-hardcode-guard.sh`
- Detects:
  - Raw color literals: `rgba(...)`, `#hex`
  - Numeric `borderRadius`
  - Numeric `opacity`
- Scope: `src/screens/**/*.tsx`
- Strategy: compare current scan with baseline file and fail only on **new entries**.

### 2) Package scripts
- Added to `package.json`:
  - `pnpm ui:guard`
  - `pnpm ui:guard:update`

### 3) CI integration
- Added CI step in `.github/workflows/ci.yml`:
  - `pnpm ui:guard`

### 4) Baseline file
- Added baseline snapshot:
  - `docs/ui-standardization/ui-hardcode-baseline.txt`
- Current baseline counts:
  - `COLOR`: `9`
  - `RADIUS`: `22`
  - `OPACITY`: `12`

### 5) PR checklist
- Added team checklist:
  - `docs/ui-standardization/pr-checklist.md`

## Validation
- `pnpm ui:guard:update` -> PASS (baseline regenerated)
- `pnpm ui:guard` -> PASS
- `pnpm typecheck` -> PASS
- `pnpm exec jest --passWithNoTests` -> PASS (3 suites / 15 tests)

## Notes
- This gate does not require screenshot runs.
- To accept intentional new literals (rare), update baseline explicitly:
  - `pnpm ui:guard:update`

## Next
- Continue reducing existing baseline debt in:
  - `Scanner.tsx`
  - `LoadingScreen.tsx`
  - `index.tsx`
  - `KpiDashboard.tsx`
