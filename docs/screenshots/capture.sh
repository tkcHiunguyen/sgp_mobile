#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FLOW_DIR="$ROOT_DIR/flows/capture-all"
OUT_ROOT="$ROOT_DIR/output"
LATEST_DIR="$OUT_ROOT/latest"
ARCHIVE_ROOT="$OUT_ROOT/archive"
MANIFEST="$FLOW_DIR/manifest.csv"

# Fixed defaults: one command, full coverage.
RETRY_ATTEMPTS=2
RETRY_DELAY_SECONDS=1
WARM_BOOTSTRAP=1

APP_ID="hieunguyen130701iuh.com.ruby.sgpmobile"
ACTIVE_FLOW_DIR="$FLOW_DIR"
TEMP_FLOW_DIR=""

export PATH="$HOME/.maestro/bin:/usr/local/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"

if ! command -v maestro >/dev/null 2>&1; then
  echo "Error: maestro not found in PATH" >&2
  exit 1
fi

mkdir -p "$LATEST_DIR" "$ARCHIVE_ROOT"
rm -f "$LATEST_DIR/_failed.txt"
TEMP_FLOW_DIR="$(mktemp -d "${TMPDIR:-/tmp}/capture-flows.XXXXXX")"
cp "$FLOW_DIR"/*.yaml "$TEMP_FLOW_DIR"/
# Rebind common-go-home to warm variant only in this run's temporary flow set.
for file in "$TEMP_FLOW_DIR"/*.yaml; do
  perl -0pi -e 's/common-go-home\.yaml/common-go-home-warm.yaml/g' "$file"
done
ACTIVE_FLOW_DIR="$TEMP_FLOW_DIR"

cleanup() {
  if [[ -n "$TEMP_FLOW_DIR" && -d "$TEMP_FLOW_DIR" ]]; then
    rm -rf "$TEMP_FLOW_DIR" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# Build fixed capture list from full manifest.
declare -a CAPTURE_ITEMS=()
declare -a KEEP_FILES=()
while IFS='|' read -r flow_file out_file section; do
  # section intentionally ignored (always full run)
  :
  [[ -z "${flow_file:-}" ]] && continue
  [[ "$flow_file" =~ ^# ]] && continue

  CAPTURE_ITEMS+=("$flow_file|$out_file|$section")
  KEEP_FILES+=("$out_file")
done < "$MANIFEST"

if [[ ${#CAPTURE_ITEMS[@]} -eq 0 ]]; then
  echo "No flows selected from manifest: $MANIFEST" >&2
  exit 1
fi

# Remove stale screenshots in latest output.
for file in "$LATEST_DIR"/*.png; do
  [[ -e "$file" ]] || break
  base_name="$(basename "$file")"
  keep_match=0
  for keep_file in "${KEEP_FILES[@]}"; do
    if [[ "$base_name" == "$keep_file" ]]; then
      keep_match=1
      break
    fi
  done
  if [[ $keep_match -eq 0 ]]; then
    rm -f "$file"
  fi
done

capture() {
  local flow_file="$1"
  local out_file="$2"
  local attempt=1

  while [[ "$attempt" -le "$RETRY_ATTEMPTS" ]]; do
    echo "[capture] $flow_file -> $out_file (attempt $attempt/$RETRY_ATTEMPTS)"
    if maestro test "$ACTIVE_FLOW_DIR/$flow_file"; then
      xcrun simctl io booted screenshot "$LATEST_DIR/$out_file" >/dev/null
      return 0
    fi

    if [[ "$attempt" -lt "$RETRY_ATTEMPTS" ]]; then
      echo "[capture] retrying $flow_file after ${RETRY_DELAY_SECONDS}s"
      sleep "$RETRY_DELAY_SECONDS"
    fi

    attempt=$((attempt + 1))
  done

  echo "$flow_file" >> "$LATEST_DIR/_failed.txt"
  return 0
}

if [[ "$WARM_BOOTSTRAP" == "1" ]]; then
  echo "[bootstrap] warm-home enabled, launching app once"
  xcrun simctl launch booted "$APP_ID" >/dev/null 2>&1 || true
fi

for item in "${CAPTURE_ITEMS[@]}"; do
  flow_file="${item%%|*}"
  rest="${item#*|}"
  out_file="${rest%%|*}"
  capture "$flow_file" "$out_file"
done

if [[ -s "$LATEST_DIR/_failed.txt" ]]; then
  echo "Some flows failed. See: $LATEST_DIR/_failed.txt"
else
  rm -f "$LATEST_DIR/_failed.txt"
fi

echo "Done: $LATEST_DIR"
