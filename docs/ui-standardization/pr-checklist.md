# UI Standardization PR Checklist

Use this checklist for every UI-related PR.

- [ ] No new raw color literals in `src/screens/*` (`rgba(...)`, `#hex`).
- [ ] No new numeric `borderRadius` in `src/screens/*`.
- [ ] No new numeric `opacity` in `src/screens/*` unless explicitly approved.
- [ ] Prefer `theme` tokens (`colors`, `radius`, `componentMetrics`) over inline literals.
- [ ] Prefer shared UI components (`AppScreen`, `HeaderBar`, `AppButton`, `BaseModal`, `AppCard`) where applicable.
- [ ] `pnpm ui:guard` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm lint` passes for touched files.
- [ ] `pnpm test --runInBand` (or equivalent) passes.
- [ ] If visual changes are intentional, include short note in PR description.
- [ ] Screenshot regression is optional at this stage; run only when needed for visual-risk changes.
