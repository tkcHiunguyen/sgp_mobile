# Screenshot Pipeline

## One command
- `npm run screenshots`

## Current behavior
- Runs the current single flow: `01-04-auth-sequence.yaml`.
- Automatically launches app once (warm bootstrap) before capture.
- Automatically retries each flow up to 2 times.
- Writes output to `docs/screenshots/output/latest/`.
- If no failures, `_failed.txt` is removed.
- If any flow fails after retries, failed flow names are written to `_failed.txt`.
