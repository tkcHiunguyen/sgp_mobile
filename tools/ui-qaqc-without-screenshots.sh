#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[ui:qaqc] Non-visual QA/QC started"

echo "[ui:qaqc] Gate 1/5: hardcode guard"
pnpm ui:guard

echo "[ui:qaqc] Gate 2/5: typecheck"
pnpm typecheck

echo "[ui:qaqc] Gate 3/5: lint"
pnpm lint

echo "[ui:qaqc] Gate 4/5: tests"
pnpm test --runInBand

echo "[ui:qaqc] Gate 5/5: pilot structure checks"
PILOT_SCREENS=(
  "src/screens/Login.tsx"
  "src/screens/index.tsx"
  "src/screens/Scanner.tsx"
)

for file in "${PILOT_SCREENS[@]}"; do
  if ! rg -q "useThemedStyles\\(createStyles\\)" "$file"; then
    echo "[ui:qaqc] FAIL: missing themed styles hook in $file" >&2
    exit 1
  fi

  if ! rg -q "ThemeColors" "$file"; then
    echo "[ui:qaqc] FAIL: missing ThemeColors typing in $file" >&2
    exit 1
  fi
done

if ! rg -q "handleThemeSwitch" "src/screens/Settings.tsx"; then
  echo "[ui:qaqc] FAIL: missing theme switch handler in Settings screen" >&2
  exit 1
fi

if ! rg -q "setMode\\(" "src/screens/Settings.tsx"; then
  echo "[ui:qaqc] FAIL: missing setMode call in Settings screen" >&2
  exit 1
fi

echo "[ui:qaqc] PASS: non-visual QA/QC checks completed."
