# UI Pattern Catalog (Elevation Phase)

Date: 2026-03-04

## Purpose
Provide reusable UI composition patterns so new screens/features stay visually consistent with the elevation system.

## Pattern 01: Screen Header Block
- Structure:
  - `AppScreen`
  - top utility row (sync/action)
  - `ScreenTitle`
  - optional subtitle/meta text
- Use for:
  - Home, dashboard-like entry screens.

## Pattern 02: Action Card
- Structure:
  - `AppCard`
  - title + icon
  - supporting text
  - 1 primary action (`AppButton`)
  - optional secondary action (`AppButton variant="secondary"`)
- Use for:
  - Feature cards, quick tools, status widgets.

## Pattern 03: Form Block
- Structure:
  - section title
  - labeled inputs with inline icon
  - inline validation text
  - submit button row
- Use for:
  - Login/Register/Profile/Settings forms.

## Pattern 04: Confirm/Danger Modal
- Structure:
  - `BaseModal`
  - title + body
  - 2 actions:
    - cancel (`secondary`)
    - confirm (`danger` or `primary`)
- Use for:
  - Reset/clear/delete/logout confirmation.

## Pattern 05: State Container
- Structure:
  - empty state: `EmptyState`
  - loading state: centered indicator + caption
  - error state: semantic warning/danger box + retry button
- Use for:
  - Any async list/data-fetching screen.

## Mapping To Pilot Screens
- `Login`: Pattern 03 + Pattern 04
- `Home/index`: Pattern 01 + Pattern 02
- `Scanner`: Pattern 02 + Pattern 04 + Pattern 05

## Enforcement
- Prefer these patterns before creating one-off layout blocks.
- If a new pattern is needed, add it here first, then apply to screens.
