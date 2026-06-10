# UI Standardization - Step 04 Dot 1 (Login/Register/Me) Pass 1

Date: 2026-03-03

## Scope completed
- `src/screens/Login.tsx`
- `src/screens/Register.tsx`
- `src/screens/Me.tsx`

## What changed

### 1) Replaced raw color literals with theme semantic tokens
- Removed direct `rgba(...)` usage in Dot 1 files.
- Mapped status/background colors to:
  - `dangerSoftBg`, `dangerSoftBorder`, `dangerSubtleBg`, `dangerSubtleBorder`
  - `successSoftBg`, `successSoftBorder`, `successStrongBg`
  - `backdropCard`

### 2) Reduced direct numeric styling where repetitive
- Replaced common literal radii with `radius.*` tokens (`xs/base/chip/lg/xl/xxl/pill`).
- Replaced repeated disabled opacity with `componentMetrics.buttonDisabledOpacity`.
- Replaced inline `ScrollView` padding in `Me.tsx` with named style `scrollContent`.

### 3) Token freeze extension (for current UI parity)
- Extended `ThemeColors` and `radius` in `src/theme/theme.ts` to support currently-used visual states without redesign.

## Measured impact (hardcode count)

Detection pattern:
- `#hex`, `rgba(...)`, `fontSize`, `padding*`, `margin*`, `borderRadius`

Before:
- Login: `26`
- Register: `26`
- Me: `39`
- Total Dot 1: `91`

After:
- Login: `23`
- Register: `23`
- Me: `30`
- Total Dot 1: `76`

Reduction:
- `-15` matches total (`~16.5%` reduction for Dot 1 in pass 1)

Raw color literals only (`#hex` / `rgba(...)`) in Dot 1 files:
- After: `0`

## Validation
- `pnpm exec eslint src/theme/theme.ts src/screens/Login.tsx src/screens/Register.tsx src/screens/Me.tsx` -> PASS
- `pnpm typecheck` -> PASS
- `pnpm screenshots` -> PASS

Visual check snapshots:
- `docs/screenshots/output/latest/01-login-main.png`
- `docs/screenshots/output/latest/03-register-top.png`
- `docs/screenshots/output/latest/09-account.png`

No visible layout regressions observed in captured screens.

## Next for Dot 1 (Pass 2)
- Continue replacing remaining spacing/radius literals in these 3 files.
- Push more form/list row styles into shared primitives where possible.
