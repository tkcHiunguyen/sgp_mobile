#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASELINE_FILE="$ROOT_DIR/docs/ui-standardization/ui-hardcode-baseline.txt"

TMP_RAW="$(mktemp)"
TMP_CURRENT="$(mktemp)"
trap 'rm -f "$TMP_RAW" "$TMP_CURRENT"' EXIT

cd "$ROOT_DIR"

scan() {
  local label="$1"
  local pattern="$2"

  rg -n --no-heading --color=never --glob '*.tsx' "$pattern" src/screens \
    | sed "s#^#${label}#g" || true
}

{
  scan "COLOR|" '#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})|rgba\('
  scan "RADIUS|" 'borderRadius\s*:\s*[0-9]+'
  scan "OPACITY|" 'opacity\s*:\s*[0-9.]+'
} > "$TMP_RAW"

# Normalize line numbers to make baseline robust to file movement.
sed -E 's/^([A-Z]+\|[^:]+):[0-9]+:/\1:/' "$TMP_RAW" \
  | sort \
  | uniq -c \
  > "$TMP_CURRENT"

color_count="$(grep -c '^COLOR|' "$TMP_RAW" || true)"
radius_count="$(grep -c '^RADIUS|' "$TMP_RAW" || true)"
opacity_count="$(grep -c '^OPACITY|' "$TMP_RAW" || true)"

if [[ "${1:-}" == "--update-baseline" ]]; then
  mkdir -p "$(dirname "$BASELINE_FILE")"
  cp "$TMP_CURRENT" "$BASELINE_FILE"
  echo "[ui:guard] baseline updated: $BASELINE_FILE"
  echo "[ui:guard] current counts -> COLOR:$color_count RADIUS:$radius_count OPACITY:$opacity_count"
  exit 0
fi

if [[ ! -f "$BASELINE_FILE" ]]; then
  echo "[ui:guard] baseline missing: $BASELINE_FILE"
  echo "[ui:guard] run: pnpm ui:guard:update"
  exit 1
fi

new_entries="$(comm -13 <(sort "$BASELINE_FILE") <(sort "$TMP_CURRENT") || true)"
resolved_entries="$(comm -23 <(sort "$BASELINE_FILE") <(sort "$TMP_CURRENT") || true)"

if [[ -n "$new_entries" ]]; then
  echo "[ui:guard] FAIL: detected new hardcoded UI literals in src/screens/*"
  echo
  echo "$new_entries"
  echo
  echo "[ui:guard] fix by using theme tokens (colors/radius/componentMetrics),"
  echo "or if intentional and accepted, refresh baseline: pnpm ui:guard:update"
  exit 1
fi

echo "[ui:guard] PASS: no new hardcoded UI literals compared to baseline."
echo "[ui:guard] current counts -> COLOR:$color_count RADIUS:$radius_count OPACITY:$opacity_count"

if [[ -n "$resolved_entries" ]]; then
  echo "[ui:guard] Note: some historical literals were removed. You can refresh baseline:"
  echo "pnpm ui:guard:update"
fi
