# UI Standardization - Step 01 Baseline Audit

Date: 2026-03-03
Scope: Baseline inventory from latest screenshots + style hardcode hotspots in code.

## 1) Screenshot Baseline (source of truth)

Source folder: `docs/screenshots/output/latest/`

Captured screens:
- Auth: `01-login-main`, `02-login-forgot-step1`, `03-register-top`, `04-register-mid`
- Main menu: `05-main-menu`, `06-main-menu-2`
- Info/Admin/Profile/Settings: `07-info`, `08-adminusers`, `09-account`, `10-settings`, `11-settings-2`
- Device/History + Modals: `12-device-top`, `15-device-acelli-modal`, `15-device-add-history-modal`, `16-history-top`, `17-history-acelli-main`, `18-history-date-filter`, `19-history-device-filter`

## 2) UI Inventory from images

## Layout patterns observed
- `Auth Form`: logo + welcome + form card + primary CTA + secondary text CTA.
- `Grid Menu`: 2-column quick action cards with icon badge + title.
- `Settings Sections`: vertical cards with title, description, field/action.
- `List + Filter`: filter controls on top + list rows + status chip.
- `Modal Form`: centered surface card + form fields + confirm/cancel actions.

## Reusable UI blocks to standardize first
- Screen shell: safe area, top spacing, horizontal padding.
- Header block: back button + centered title + optional sync status.
- Section card: border, radius, shadow, inner spacing.
- Input row: label + field + optional right icon/action.
- Primary/secondary button.
- Status chip (success/error/warning/info).
- Filter chip/button group.
- Empty/loading/error state container.

## Visual consistency notes from screenshots
- Dark navy background + blue border accents are consistent.
- Card radius and input radius are mostly consistent, but spacing rhythm varies across screens.
- CTA style is mostly consistent; list/filter/action controls vary more.

## 3) Hardcode hotspot audit (code)

Search pattern used:
- color literals: `#hex`, `rgba(...)`
- spacing/size literals: `fontSize`, `padding*`, `margin*`, `borderRadius`

Top files by number of hardcode matches:
1. `src/screens/History.tsx` -> 44
2. `src/screens/Me.tsx` -> 39
3. `src/screens/Scanner.tsx` -> 34
4. `src/screens/Devices.tsx` -> 32
5. `src/screens/AdminUsers.tsx` -> 29
6. `src/screens/Register.tsx` -> 26
7. `src/screens/Login.tsx` -> 26
8. `src/screens/Settings.tsx` -> 23

Most repeated raw color literals:
- `rgba(0,0,0,0.6)` (scanner overlays)
- `rgba(220,38,38,0.45)`, `rgba(220,38,38,0.18)`, `rgba(220,38,38,0.08)` (danger states)
- `#FFFFFF`, `#F8FAFC` (text on solid backgrounds)
- `rgba(22,163,74,...)` variations (success states)
- `rgba(15,23,42,...)` variations (dark overlays/surfaces)

## 4) Standardization priorities (next execution step)

Priority A (high impact, high duplication):
- Standardize list/filter/status patterns in:
  - `History.tsx`
  - `Devices.tsx`
  - `AdminUsers.tsx`

Priority B (auth consistency):
- Standardize form spacing/input/button rhythm in:
  - `Login.tsx`
  - `Register.tsx`

Priority C (specialized UI):
- `Scanner.tsx` overlays and modal chips into tokenized variants.
- `Me.tsx` profile cards/chips align with shared card/chip styles.

## 5) Exit criteria for Step 01

- Baseline screenshots are locked as visual reference.
- Inventory and hotspot list are documented.
- A ranked migration order exists for implementation.

Status: DONE
