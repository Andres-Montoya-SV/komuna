#!/usr/bin/env bash
# Fails if blocklisted dependency namespaces appear in manifests or the lockfile.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BLOCKED=(
  "@tanstack/"
  "@squawk/"
  "@mistralai/"
)

scan_file() {
  local f=$1
  if [[ ! -f "$f" ]]; then
    return 0
  fi
  local b
  for b in "${BLOCKED[@]}"; do
    if grep -qF "$b" "$f"; then
      echo "Supply chain blocklist: forbidden reference '${b}' in ${f}" >&2
      exit 1
    fi
  done
}

while IFS= read -r -d $'\0' f; do
  scan_file "$f"
done < <(find "$ROOT" -name package.json -not -path "*/node_modules/*" -print0)

if [[ -f "$ROOT/pnpm-lock.yaml" ]]; then
  scan_file "$ROOT/pnpm-lock.yaml"
fi

echo "Supply chain blocklist check: OK"
