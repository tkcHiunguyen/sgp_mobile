# Theme QA Checklist (iOS)

## Scope
- Verify both theme modes: `light`, `dark`
- Verify UI states per screen:
  - default
  - pressed
  - disabled
  - error
  - success/warning
  - modal/dropdown/picker

## Route Order
1. Login
2. Register
3. Loading
4. Home
5. Scanner
6. Devices
7. History
8. Tools
9. Info
10. WebViewer
11. Settings
12. AdminUsers
13. Me

## Checks By Screen
- Login
  - Inputs, error box, forgot-password modal, success modal
  - Ghost/secondary actions contrast in both themes
- Register
  - Header chips, form fields, error box, success modal
  - Modal hint/ghost buttons contrast in both themes
- Loading
  - Circle border, retry buttons, text contrast while status changes
- Home
  - Menu tile border/icon/label ready vs disabled
  - Pressed animation + badge visibility
- Scanner
  - Camera overlay/mask legibility
  - Flash button, popup cards, history panel, add-history action modal
- Devices
  - Search/filter dropdown, chips, checkbox active/inactive
  - Device rows, highlighted text, history modal card states
- History
  - Search/filter/date range interactions
  - Section headers, highlight text, top-device modal
  - iOS date range picker layout and colors
- Tools
  - Empty/info state contrast
- Info
  - Card background, shadow, title/description contrast
- WebViewer
  - Back button contrast above webview
- Settings
  - Input lock/unlock icon states
  - Theme switch + mode badges pressable states
  - OTA button/progress bar + danger confirm modal
- AdminUsers
  - Tabs, cards, status badges, role modal, confirm/session modals
- Me
  - Profile card/avatar fallback, action tiles, logout danger panel
  - Change-password + permission/confirm modals

## Critical Flows
- iOS pickers:
  - `DateRangeFilterIOSDark`
  - `SingleDatePickerIOSDark`
  - Verify center alignment and no left/right clipping
- Scanner overlay:
  - Verify contrast stays usable in both themes
- Back button:
  - Verify no offset/circle artifacts and good contrast

## Result Log
- [ ] Light mode full pass
- [ ] Dark mode full pass
- [ ] No clipping/misalignment in iOS date pickers
- [ ] No unreadable text in modal/dropdown states
- [ ] No regressions in scanner overlay controls
