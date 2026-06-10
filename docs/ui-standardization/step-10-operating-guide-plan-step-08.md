# UI Standardization Operating Guide (Plan Step 08)

Date: 2026-03-04

## Goal
Provide one short, practical operating guide so any developer can implement UI changes without reintroducing hardcode debt.

## Source Of Truth
- Tokens: `src/theme/theme.ts`
- Typography helpers: `src/theme/typography.ts`
- Shared UI components: `src/components/ui/*`
- Guard baseline: `docs/ui-standardization/ui-hardcode-baseline.txt`
- PR gate checklist: `docs/ui-standardization/pr-checklist.md`
- iOS visual QA checklist: `docs/theme-ios-qa-checklist.md`

## Token Map

### Colors (`ThemeColors`)
- Surfaces/backgrounds: `background`, `backgroundAlt`, `surface`, `surfaceAlt`
- Text: `text`, `textMuted`, `textSoft`, `textAccent`, `onPrimary`
- Semantic: `primary`, `accent`, `success`, `warning`, `danger`
- Borders/overlays/backdrops:
  - `primarySoftBorder`, `primaryBorderStrong`
  - `overlayStrong`, `overlayMedium`, `overlaySoft`
  - `backdropStrong`, `backdropSoft`, `backdropCard`
- Semantic soft states:
  - `successSoftBg`, `successSoftBorder`, `successStrongBg`
  - `dangerSoftBg`, `dangerSoftBorder`, `dangerSubtleBg`, `dangerSubtleBorder`
  - `warningSoftBg`, `warningSoftBorder`

### Spacing / Radius
- Spacing: `spacing.xs/sm/md/lg/xl/xxl/screen`
- Radius: `radius.xs/sm/md/base/chip/lg/xl/xxl/pill`

### Component Metrics (`componentMetrics`)
- Button: paddings, disabled/busy/feedback opacity
- Header/AppCard/AppScreen: standard paddings
- Modal: overlay padding, max height, enter animation values
- Text opacity helpers:
  - `mutedContentOpacity`
  - `subtleTextOpacity`

## Shared Component Map
- `AppScreen`
  - Use for every screen root with safe area + theme background.
  - Key props: `withHorizontalPadding`, `topPadding`.
- `HeaderBar`
  - Use for screen title + back + sync indicator row.
  - Key props: `title`, `onBack`.
- `AppCard`
  - Use for standard card blocks with shared border/shadow/radius.
  - Key props: `style` override for layout only.
- `AppButton`
  - Use for common primary/secondary/danger actions.
  - Key props: `variant`, `disabled`, `onPress`.
- `BaseModal`
  - Use for all standard modals with unified backdrop + animation.
  - Key props: `visible`, `onClose`, `width`, `style`.
- `EmptyState`
  - Use for empty list/content fallback.
  - Key props: `title`, `message`.
- `ScreenTitle`
  - Use for large section/page heading text.

## Style Rules
- Always write themed styles via `useThemedStyles(createStyles)`.
- Screen styles only consume tokens/helpers, not raw literals.
- Forbidden in `src/screens/*`:
  - Raw color literals: `rgba(...)`, `#hex`
  - Numeric `borderRadius`
  - Numeric `opacity` (unless explicitly approved)
- Prefer `componentMetrics` for shared behavior values (disabled/busy/pressed opacity).
- Keep screen-specific styles local, with clear names; avoid copy-paste blocks across screens.

## Migration Rules (for any touched screen)
1. Replace raw style literals with `colors/radius/spacing/componentMetrics`.
2. Replace repeated patterns with shared components where possible.
3. Keep visual behavior unchanged unless requirement explicitly says otherwise.
4. Run validation:
   - `pnpm ui:guard`
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm test`
5. If high visual-risk, run screenshots and check against:
   - `docs/theme-ios-qa-checklist.md`

## Do / Don't
- Do:
  - Use semantic tokens (meaning-based keys) over visual guesses.
  - Keep PR scope small (1-2 screens per PR when possible).
  - Document intentional visual deviations in PR description.
- Don't:
  - Add new hardcoded UI literals to `src/screens/*`.
  - Introduce new one-off button/modal/card patterns if shared components already fit.
  - Update baseline to bypass guard without technical reason and review note.

## 2-Week Review Cadence
- Every 2 weeks:
  1. Run guard and quality commands:
     - `pnpm ui:guard`
     - `pnpm typecheck`
     - `pnpm lint`
     - `pnpm test`
  2. Review top remaining debt hotspots (if any) and plan next pass.
  3. Re-check shared component API drift vs screen usage.
  4. Refresh this guide only when rules/tokens/components actually change.

## Verification For Step 08
- New developer can answer these without asking maintainers:
  - Where are tokens defined?
  - Which shared component to use for screen/header/button/modal/card/empty state?
  - Which checks must pass before merge?
  - What is allowed vs forbidden in `src/screens/*`?
