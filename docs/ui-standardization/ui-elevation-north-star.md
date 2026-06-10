# UI Elevation North Star Spec

Date: 2026-03-04

## Intent
Build a cleaner, more premium interface language that feels precise and consistent across all screens, while preserving current navigation and feature behavior.

## Aesthetic Thesis
Direction: **Precision Tech Minimal**

Design principles:
- High contrast hierarchy (title -> content -> metadata)
- Controlled depth (clear card/button/modal layering)
- Minimal but meaningful motion (quick, purposeful transitions)
- Strong semantic consistency (same component = same visual behavior)

## Visual System

### Color story
- Keep existing brand core (`primary`, `accent`) as identity anchor.
- Increase visual clarity by using stronger borders on raised surfaces.
- Use semantic soft backgrounds for status chips and info blocks.

### Typography hierarchy
- Display: strong weight for page/screen headers.
- Body: compact readable text sizes for dense mobile content.
- Meta: muted text with explicit `subtle/muted` opacity tokens.

### Depth and surfaces
- Primary surfaces use layered depth tokens (card/button/modal elevation).
- Borders are semantic (`subtle` vs `strong`) instead of ad-hoc values.
- Modal and card separation should be visible in both dark and light themes.

### Motion
- Short durations by default.
- Modal uses dedicated in/out timings.
- Press interaction keeps opacity feedback consistent across app.

## Component Intent
- `AppButton`: clear action priority, stronger affordance on primary/danger.
- `AppCard`: readable grouping with stronger border + cleaner depth.
- `BaseModal`: clearer focus plane with upgraded backdrop and elevation.

## Rollout Rule
- Foundation first: tokens + primitives.
- Then pilot screens (`Login`, `Home`, `Scanner`).
- Expand by waves only after QA pass.

## Review Questions
- Is the screen readable in <3 seconds?
- Is action priority obvious without extra explanation?
- Do repeated UI blocks look like one coherent system?
