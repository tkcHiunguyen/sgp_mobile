#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$(cd "$ROOT_DIR/../../ios/screenshots-scrolled" && pwd)"

export PATH="$HOME/.maestro/bin:/usr/local/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"

capture() {
  local flow="$1"
  local out="$2"
  echo "[capture] $flow -> $out"
  maestro test "$ROOT_DIR/$flow"
  xcrun simctl io booted screenshot "$OUT_DIR/$out"
}

capture "index-top.yaml" "01-index-top.png"
capture "index-mid.yaml" "01-index-mid.png"

capture "device-top.yaml" "02-device-top.png"
capture "device-mid.yaml" "02-device-mid.png"
capture "device-bottom.yaml" "02-device-bottom.png"

capture "history-top.yaml" "03-history-top.png"

capture "info-top.yaml" "04-info-top.png"
capture "info-mid.yaml" "04-info-mid.png"
capture "info-bottom.yaml" "04-info-bottom.png"

capture "setting-top.yaml" "05-setting-top.png"
capture "setting-mid.yaml" "05-setting-mid.png"
capture "setting-bottom.yaml" "05-setting-bottom.png"

capture "register-top.yaml" "06-register-top.png"
capture "register-mid.yaml" "06-register-mid.png"
capture "register-bottom.yaml" "06-register-bottom.png"

echo "Done: $OUT_DIR"
