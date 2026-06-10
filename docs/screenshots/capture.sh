#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FLOW_DIR="$ROOT_DIR/flows/capture-all"
FLOW_FILE="01-04-auth-sequence.yaml"
OUT_ROOT="$ROOT_DIR/output"
LATEST_DIR="$OUT_ROOT/latest"
ARCHIVE_ROOT="$OUT_ROOT/archive"

RETRY_ATTEMPTS=2
RETRY_DELAY_SECONDS=1
WARM_BOOTSTRAP=1

APP_ID="hieunguyen130701iuh.com.ruby.sgpmobile"
ACTIVE_FLOW_DIR="$FLOW_DIR"

export PATH="$HOME/.maestro/bin:/usr/local/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"

if ! command -v maestro >/dev/null 2>&1; then
  echo "Error: maestro not found in PATH" >&2
  exit 1
fi

mkdir -p "$LATEST_DIR" "$ARCHIVE_ROOT"
rm -f "$LATEST_DIR/_failed.txt"
capture() {
  local flow_file="$1"
  local attempt=1

  while [[ "$attempt" -le "$RETRY_ATTEMPTS" ]]; do
    echo "[capture] $flow_file (attempt $attempt/$RETRY_ATTEMPTS)"
    if maestro test "$ACTIVE_FLOW_DIR/$flow_file"; then
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

capture "$FLOW_FILE"

if [[ -s "$LATEST_DIR/_failed.txt" ]]; then
  echo "Some flows failed. See: $LATEST_DIR/_failed.txt"
else
  rm -f "$LATEST_DIR/_failed.txt"
fi

echo "Done: $LATEST_DIR"
