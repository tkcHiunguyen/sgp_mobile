# UI Elevation - Pilot Pass 1 (Login / Home / Scanner)

Date: 2026-03-04

## Scope completed
- `src/screens/Login.tsx`
- `src/screens/index.tsx` (Home)
- `src/screens/Scanner.tsx`
- `docs/ui-standardization/ui-pattern-catalog.md`
- `ui-elevation-plan.md` (Task 4-5 progress)

## What changed

### 1) Login visual uplift
- Upgraded form card to stronger elevated surface.
- Upgraded logo container and primary CTA depth.
- Tightened typographic hierarchy in branding area.
- Upgraded forgot-password CTA surfaces for better action clarity.

### 2) Home visual uplift
- Added subtitle under main title for clearer context.
- Improved tile depth and border strength.
- Standardized press feedback scale using motion token.
- Improved icon container contrast and structure.

### 3) Scanner visual uplift
- Added scan hint chip for immediate guidance.
- Improved flash button depth and border treatment.
- Upgraded popup container and action buttons with elevation/border tokens.
- Increased consistency of card/header/badge surfaces in scanner popup.

### 4) Pattern catalog (Task 4)
- Added reusable layout patterns:
  - screen header block
  - action card
  - form block
  - confirm/danger modal
  - state container
- File: `docs/ui-standardization/ui-pattern-catalog.md`

## Plan progress
- `ui-elevation-plan.md`
  - Task 4 -> done
  - Task 5 -> done (manual visual QA continues in Task 6)

## Validation
- `pnpm ui:guard` -> PASS (`COLOR:0 RADIUS:0 OPACITY:0`)
- `pnpm typecheck` -> PASS
- `pnpm lint` -> PASS
- `pnpm exec jest --passWithNoTests` -> PASS (3 suites / 15 tests)

## Next
- Execute Task 6:
  - run iOS visual QA checklist for pilot screens in both light/dark
  - capture before/after artifacts for signoff
