# Step 13 - QA/QC Non-Screenshot Pass 1

Date: 2026-03-04
Scope: Pilot UI elevation screens (`Login`, `Home/index`, `Scanner`) without screenshot automation.

## Why this step
- Screenshot flow on iOS simulator was unstable (camera route return issues).
- QA/QC switched to code-driven gates and repeatable structural checks.

## What changed
- Added new command: `pnpm ui:qaqc`
- Added script: `tools/ui-qaqc-without-screenshots.sh`
  - Runs:
    - `pnpm ui:guard`
    - `pnpm typecheck`
    - `pnpm lint`
    - `pnpm test --runInBand`
  - Verifies pilot conformance:
    - `Login`, `Home/index`, `Scanner` keep themed style pattern (`useThemedStyles(createStyles)` + `ThemeColors`)
    - `Settings` keeps theme switching path (`handleThemeSwitch`, `setMode(...)`)

## Verification run (this pass)
- `pnpm ui:guard` -> PASS (`COLOR:0 RADIUS:0 OPACITY:0`)
- `pnpm typecheck` -> PASS
- `pnpm lint` -> PASS
- `pnpm test --runInBand` -> PASS (3 suites / 15 tests)
- `pnpm ui:qaqc` -> PASS

## Outcome
- Task 6 (pilot QA/QC gate) can proceed without screenshot dependency.
- Quality evidence now comes from deterministic code + test gates.

## Notes
- This does not replace full visual acceptance for all routes.
- For release hardening (Task 8), continue using `ui:guard + lint + typecheck + test` as mandatory gate.
