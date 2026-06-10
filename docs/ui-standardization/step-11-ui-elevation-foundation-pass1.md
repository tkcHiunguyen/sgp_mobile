# UI Elevation - Foundation Pass 1

Date: 2026-03-04

## Scope completed
- North-star visual spec
- Theme foundation tokens (border/elevation/motion)
- Primitive upgrades:
  - `AppButton`
  - `AppCard`
  - `BaseModal`

## Files updated
- `docs/ui-standardization/ui-elevation-north-star.md`
- `src/theme/theme.ts`
- `src/components/ui/AppButton.tsx`
- `src/components/ui/AppCard.tsx`
- `src/components/ui/BaseModal.tsx`
- `ui-elevation-plan.md`

## What changed

### 1) North-star spec added
- Added visual thesis and system intent:
  - `docs/ui-standardization/ui-elevation-north-star.md`

### 2) Theme foundation tokens extended
- Added token groups:
  - `border` (`subtle`, `strong`, `focus`)
  - `elevation` (card/button/modal shadow + elevation values)
  - `motion` (durations + press scale)
- Extended `componentMetrics` with foundation metrics:
  - button active/border tokens
  - appCard border/radius tokens
  - modal border/radius tokens

### 3) Shared primitive visual uplift
- `AppButton`:
  - Uses tokenized active opacity and depth for primary/danger.
  - Secondary uses clearer surface separation.
- `AppCard`:
  - Uses stronger border token and deeper card elevation.
- `BaseModal`:
  - Uses motion tokens for enter/exit.
  - Uses stronger modal border + depth + backdrop card tone.

## Plan progress
- `ui-elevation-plan.md`:
  - Task 1 -> done
  - Task 2 -> done
  - Task 3 -> done

## Validation
- `pnpm ui:guard` -> PASS (`COLOR:0 RADIUS:0 OPACITY:0`)
- `pnpm typecheck` -> PASS
- `pnpm lint` -> PASS
- `pnpm exec jest --passWithNoTests` -> PASS (3 suites / 15 tests)

## Next
- Pilot redesign on 3 key screens:
  - `Login`
  - `index` (Home)
  - `Scanner`
