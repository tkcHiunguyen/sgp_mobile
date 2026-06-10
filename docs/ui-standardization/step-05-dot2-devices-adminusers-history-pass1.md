# UI Standardization - Step 05 Dot 2 (Devices/AdminUsers/History) Pass 1

Date: 2026-03-04

## Scope completed
- `src/screens/Devices.tsx`
- `src/screens/AdminUsers.tsx`
- `src/screens/History.tsx`

## What changed

### 1) Replaced raw color literals with theme semantic tokens
- Removed all direct `rgba(...)` usage in Dot 2 files.
- Mapped status/overlay colors to existing tokens:
  - `successSoftBg`, `successSoftBorder`
  - `dangerSoftBg`, `dangerSoftBorder`
  - `backdropCard`

### 2) Standardized radius usage
- Replaced numeric `borderRadius` literals with `radius.*` tokens:
  - `radius.xs/sm/md/base/chip/lg/pill`
- Result: no numeric `borderRadius` literal remains in Dot 2 files.

### 3) Reduced inline state style for busy actions
- In `AdminUsers.tsx`, replaced inline `busy && { opacity: 0.7 }` with named style `busyDisabled`.
- `busyDisabled` now uses `componentMetrics.buttonDisabledOpacity`.

## Measured impact (hardcode count)

Detection pattern:
- `#hex`, `rgba(...)`, `fontSize`, `padding*`, `margin*`, `borderRadius: <number>`

Before:
- Devices: `55`
- History: `75`
- AdminUsers: `46`
- Total Dot 2: `176`

After:
- Devices: `43`
- History: `60`
- AdminUsers: `28`
- Total Dot 2: `131`

Reduction:
- `-45` matches total (`~25.6%` reduction for Dot 2 in pass 1)

Raw color literals only (`#hex` / `rgba(...)`) in Dot 2 files:
- Before: `9`
- After: `0`

Numeric `borderRadius` literals only in Dot 2 files:
- Before: `36`
- After: `0`

## Validation
- `pnpm exec eslint src/screens/Devices.tsx src/screens/History.tsx src/screens/AdminUsers.tsx` -> PASS
- `pnpm typecheck` -> PASS
- `pnpm exec jest --passWithNoTests` -> PASS (3 suites / 15 tests)
- `pnpm screenshots` -> FAILED at auth flow `01-04-auth-sequence.yaml` due `Hide Keyboard` step in Maestro flow.
  - Failure output: `docs/screenshots/output/latest/_failed.txt`
  - This is a flow-script issue (existing), not a compile/lint regression from Dot 2 code.

## Next for Dot 2 (Pass 2)
- Continue reducing remaining spacing/font-size literals where safe.
- Extract repeated list/filter row patterns into shared primitives if review approves.
