# UI Standardization - Step 02 Token Freeze

Date: 2026-03-03
Goal: Freeze token set based on CURRENT UI (no visual redesign), so migration can replace hardcoded literals safely.

## Updated file
- `src/theme/theme.ts`

## New token groups added

### Overlay / backdrop
- `overlayStrong` -> `rgba(0,0,0,0.6)`
- `overlayMedium` -> `rgba(0,0,0,0.5)`
- `overlaySoft` -> `rgba(0,0,0,0.35)`
- `backdropStrong` -> `rgba(15,23,42,0.85)`
- `backdropSoft` -> `rgba(15,23,42,0.35)`

### Semantic status surfaces
- `successSoftBg` / `successSoftBorder`
- `dangerSoftBg` / `dangerSoftBorder`
- `warningSoftBg` / `warningSoftBorder`

### Text on solid
- `onPrimary` -> `#F8FAFC`

### Spacing extensions
- `spacing.xxl` -> `32`
- `spacing.screen` -> `20`

## Why this step first
- Repeated raw values from screens/components are now mapped to semantic tokens.
- Next PRs can migrate hotspots (`History`, `Me`, `Scanner`, `Devices`, `AdminUsers`) with lower risk.
- Prevents creating new hardcoded variants during migration.

## Next step (Step 03)
- Apply these tokens in shared UI components (`AppButton`, `BaseModal`, `HeaderBar`, `AppCard`) first.
- Then migrate screens by priority order from Step 01 audit.
