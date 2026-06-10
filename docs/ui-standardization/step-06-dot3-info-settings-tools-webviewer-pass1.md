# UI Standardization - Step 06 Dot 3 (Info/Settings/Tools/WebViewer) Pass 1

Date: 2026-03-04

## Scope completed
- `src/screens/Info.tsx`
- `src/screens/Settings.tsx`
- `src/screens/Tools.tsx`
- `src/screens/WebViewerScreen.tsx`

## What changed

### 1) Replaced raw color literals with semantic theme tokens
- Removed all direct `rgba(...)` / `#hex` literals in Dot 3 files.
- `Settings.tsx` switch colors now use theme tokens:
  - `warningSoftBorder`, `primaryBorderStrong`, `backdropSoft`
- Button text and OTA text switched to `colors.onPrimary`.

### 2) Standardized radius usage
- Replaced numeric `borderRadius` with `radius.*` in `Info.tsx` and `Settings.tsx`.
- Result: no numeric `borderRadius` literals remain in Dot 3 files.

### 3) Standardized disabled opacity usage
- Replaced direct `opacity: 0.6` in `Settings.tsx` with `componentMetrics.buttonDisabledOpacity`.
- Removed ad-hoc `opacity: 0.7` in `Tools.tsx` caption and used tokenized text color.

## Measured impact (hardcode count)

Detection pattern:
- `#hex`, `rgba(...)`, `fontSize`, `padding*`, `margin*`, `borderRadius: <number>`, `opacity: <number>`

Before:
- Info: `8`
- Settings: `51`
- Tools: `1`
- WebViewer: `0`
- Total Dot 3: `60`

After:
- Info: `7`
- Settings: `37`
- Tools: `0`
- WebViewer: `0`
- Total Dot 3: `44`

Reduction:
- `-16` matches total (`~26.7%` reduction for Dot 3 in pass 1)

Raw color literals only (`#hex` / `rgba(...)`) in Dot 3 files:
- Before: `5`
- After: `0`

Numeric `borderRadius` literals only in Dot 3 files:
- Before: `8`
- After: `0`

Opacity numeric literals only in Dot 3 files:
- Before: `3`
- After: `0`

## Validation
- `pnpm exec eslint src/screens/Info.tsx src/screens/Settings.tsx src/screens/Tools.tsx src/screens/WebViewerScreen.tsx` -> PASS
- `pnpm typecheck` -> PASS
- `pnpm exec jest --passWithNoTests` -> PASS (3 suites / 15 tests)
- Screenshot regression intentionally not used as gate for this step (per current direction).

## Next
- Move to quality gates:
  - Lint rule/pattern check to prevent new raw `rgba/#hex` in `src/screens/*`
  - Lint rule/pattern check to prevent new numeric `borderRadius` in screen styles
  - PR checklist update for token + shared component usage
