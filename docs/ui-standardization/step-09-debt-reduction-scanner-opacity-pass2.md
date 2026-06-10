# UI Standardization - Step 09 Debt Reduction (Scanner + Opacity Cleanup) Pass 2

Date: 2026-03-04

## Scope completed
- `src/screens/Scanner.tsx`
- `src/screens/Login.tsx`
- `src/screens/Register.tsx`
- `src/screens/Me.tsx`
- `src/screens/AdminUsers.tsx`
- `src/screens/KpiDashboard.tsx`
- `src/theme/theme.ts`

## What changed

### 1) Scanner screen tokenization completed
- Replaced all raw overlay/success colors in `Scanner.tsx` with semantic tokens:
  - `colors.overlayStrong`
  - `colors.overlayMedium`
  - `colors.successSoftBg`
  - `colors.successSoftBorder`
- Replaced all numeric `borderRadius` literals in `Scanner.tsx` with `radius.*`.

### 2) Removed remaining numeric opacity literals in screens
- Replaced remaining `opacity: 0.95` with `componentMetrics.subtleTextOpacity`.
- Replaced remaining `opacity: 0.9` with `componentMetrics.pressFeedbackOpacity`.
- Replaced remaining busy/disabled `opacity: 0.7` with `componentMetrics.buttonBusyOpacity` / `componentMetrics.mutedContentOpacity`.

### 3) Extended shared UI metrics
- Added new theme metrics in `componentMetrics`:
  - `buttonBusyOpacity`
  - `mutedContentOpacity`
  - `subtleTextOpacity`
  - `pressFeedbackOpacity`

### 4) Baseline cleanup to zero for current guard rules
- Updated `docs/ui-standardization/ui-hardcode-baseline.txt`.
- Current guard counts:
  - `COLOR: 0`
  - `RADIUS: 0`
  - `OPACITY: 0`

## Measured impact (this pass scope)

Detection pattern:
- `#hex`, `rgba(...)`, `borderRadius: <number>`, `opacity: <number>`

Before (scope files): `31`

After (scope files): `0`

Reduction: `-31` (`100%` for this pass scope)

## Validation
- `pnpm ui:guard` -> PASS (`COLOR:0 RADIUS:0 OPACITY:0`)
- `pnpm lint` -> PASS
- `pnpm typecheck` -> PASS
- `pnpm exec jest --passWithNoTests` -> PASS (3 suites / 15 tests)
- `pnpm ui:guard:update` -> PASS (baseline refreshed)

## Next
- Continue Step 7 regression checks as needed (`pnpm screenshots` for high visual-risk changes).
- Move to Step 8 final operating guide consolidation.
