#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$(cd "$ROOT_DIR/../../ios" && pwd)/screenshots-missing-no-scanner"

mkdir -p "$OUT_DIR"
export PATH="$HOME/.maestro/bin:/usr/local/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"

# Canonical flow set for "missing-no-scanner".
# Keep this list as the single source of truth to avoid extra screenshots.
CAPTURES=(
  "capture-login-main.yaml|07-login-main.png"
  "capture-login-forgot-step1.yaml|08-login-forgot-step1.png"
  "capture-home-main.yaml|10-home-main.png"
  "capture-home-bottom.yaml|11-home-bottom.png"
  "capture-kpi-main.yaml|12-kpi-main.png"
  "capture-kpi-clear-confirm.yaml|13-kpi-clear-confirm.png"
  "capture-adminusers-main.yaml|14-adminusers-main.png"
  "capture-me-main.yaml|16-me-main.png"
  "capture-settings-main.yaml|19-settings-main.png"
  "capture-devices-group-modal.yaml|23-devices-group-modal.png"
  "capture-history-main-selected.yaml|25-history-main-selected.png"
  "capture-history-date-filter.yaml|26-history-date-filter.png"
  "capture-history-device-filter.yaml|27-history-device-filter.png"
)

rm -f "$OUT_DIR/_failed.txt"

# Remove stale screenshots not present in the canonical flow set.
declare -A KEEP_FILES=()
for item in "${CAPTURES[@]}"; do
  out_file="${item#*|}"
  KEEP_FILES["$out_file"]=1
done

for file in "$OUT_DIR"/*.png; do
  [[ -e "$file" ]] || break
  base_name="$(basename "$file")"
  if [[ -z "${KEEP_FILES[$base_name]+x}" ]]; then
    rm -f "$file"
  fi
done

capture() {
  local flow="$1"
  local out="$2"

  echo "[capture] $flow -> $out"
  if "$HOME/.maestro/bin/maestro" test "$ROOT_DIR/$flow"; then
    xcrun simctl io booted screenshot "$OUT_DIR/$out" >/dev/null
  else
    echo "$flow" >> "$OUT_DIR/_failed.txt"
  fi
}

for item in "${CAPTURES[@]}"; do
  flow="${item%%|*}"
  out="${item#*|}"
  capture "$flow" "$out"
done

echo "Done: $OUT_DIR"
if [[ -s "$OUT_DIR/_failed.txt" ]]; then
  echo "Some flows failed. See: $OUT_DIR/_failed.txt"
else
  rm -f "$OUT_DIR/_failed.txt"
fi
