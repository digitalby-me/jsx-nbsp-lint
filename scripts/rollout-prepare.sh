#!/usr/bin/env bash
# Prepare (clone + wire + install + commit) ONE repo on a chore/jsx-nbsp branch.
# Does NOT push and does NOT verify — the caller runs the repo's own verify
# (so the push gate records it) and then pushes + opens the PR. This keeps the
# push gate in force (it would be bypassed if a script ran `git push` directly).
set -euo pipefail

REPO="$1"                       # owner/name
NAME="${REPO##*/}"
ROOT="${ROLLOUT_ROOT:-/tmp/jsxnbsp-rollout}"
TOOL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$ROOT"
cd "$ROOT"
rm -rf "$NAME"
gh repo clone "$REPO" "$NAME" -- -q --depth=1 >/dev/null 2>&1
cd "$ROOT/$NAME"
git checkout -q -b chore/jsx-nbsp

# 1. caller workflow (the actual enforcement; every target gets it)
mkdir -p .github/workflows
cp "$TOOL/templates/caller-workflow.yml" .github/workflows/jsx-nbsp.yml

# 2. package manager
if   [ -f bun.lock ] || [ -f bun.lockb ]; then PM=bun
elif [ -f pnpm-lock.yaml ]; then PM=pnpm
elif [ -f yarn.lock ]; then PM=yarn
else PM=npm; fi

# 3. local ESLint plugin wiring (editor DX) where a config exists
WIRED=workflow-only
DO_DEP=0
FLAT=""
for f in eslint.config.js eslint.config.mjs eslint.config.cjs eslint.config.ts; do
  [ -f "$f" ] && FLAT="$f" && break
done
if [ -n "$FLAT" ]; then
  ext="${FLAT##*.}"
  base="eslint.config.base.$ext"
  git mv "$FLAT" "$base"
  node "$TOOL/scripts/lib/write-flat-wrapper.mjs" "$FLAT" "$base"
  WIRED="flat($FLAT)"; DO_DEP=1
elif [ -f .eslintrc.json ]; then
  node "$TOOL/scripts/lib/wire-legacy-json.mjs" .eslintrc.json
  WIRED="legacy-json"; DO_DEP=1
elif [ -f .eslintrc.cjs ] || [ -f .eslintrc.js ]; then
  WIRED="legacy-js-SKIPPED-wire-manually"
fi

if [ "$DO_DEP" = 1 ]; then
  node "$TOOL/scripts/lib/add-devdep.mjs" package.json
fi

# 4. refresh the lockfile (needed for the gate verify too)
case "$PM" in
  bun)  bun install >/dev/null 2>&1 ;;
  pnpm) pnpm install >/dev/null 2>&1 ;;
  yarn) yarn install >/dev/null 2>&1 ;;
  npm)  npm install >/dev/null 2>&1 ;;
esac

MSG="chore: add jsx-nbsp autofix workflow"
[ "$DO_DEP" = 1 ] && MSG="chore: add jsx-nbsp autofix workflow and eslint rule"
git add -A
git commit -q -m "$MSG"
echo "PREPARED $REPO | pm=$PM | wiring=$WIRED | head=$(git rev-parse --short HEAD)"
