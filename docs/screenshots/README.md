# Screenshot Pipeline

## One command
- `bash docs/screenshots/capture.sh`

## Current behavior
- Always capture full set from `manifest.csv` (27 screens).
- Automatically uses warm-home navigation to reduce repeated startup work.
- Automatically retries each flow up to 2 times.
- Writes output to `docs/screenshots/output/latest/`.
- If no failures, `_failed.txt` is removed.
- If any flow fails after retries, failed flow names are written to `_failed.txt`.
