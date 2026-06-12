#!/usr/bin/env bash
# Re-apply the FIXED wiring to a repo already wired by rollout-prepare.sh:
#   - devDep -> git+https spec (npm `github:` resolved to an unfetchable git+ssh URL)
#   - flat wrapper regenerated (adds ecmaFeatures.jsx so .jsx parses)
#   - lockfile refreshed
# Usage: rollout-fix.sh <owner/repo> [existing-branch]
#   no branch  -> clones default branch, creates fix/jsx-nbsp-https (for already-merged repos)
#   branch arg -> updates that branch in place (for still-open chore/jsx-nbsp PRs)
set -euo pipefail

REPO="$1"; BRANCH="${2:-}"
NAME="${REPO##*/}"
ROOT="${ROLLOUT_ROOT:-/tmp/jsxnbsp-fix}"
TOOL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$ROOT"; cd "$ROOT"; rm -rf "$NAME"
gh repo clone "$REPO" "$NAME" -- -q --depth=1 >/dev/null 2>&1
cd "$ROOT/$NAME"
if [ -n "$BRANCH" ]; then
  git fetch -q origin "$BRANCH"
  git checkout -q "$BRANCH"
  WORKBRANCH="$BRANCH"
else
  git checkout -q -b fix/jsx-nbsp-https
  WORKBRANCH="fix/jsx-nbsp-https"
fi

if [ -f bun.lock ] || [ -f bun.lockb ]; then PM=bun
elif [ -f pnpm-lock.yaml ]; then PM=pnpm
elif [ -f yarn.lock ]; then PM=yarn
else PM=npm; fi

if node -e "const p=require('./package.json');process.exit((p.devDependencies&&p.devDependencies['eslint-plugin-jsx-nbsp'])?0:1)" 2>/dev/null; then
  node "$TOOL/scripts/lib/add-devdep.mjs" package.json
fi
for ext in js mjs cjs ts; do
  if [ -f "eslint.config.base.$ext" ] && [ -f "eslint.config.$ext" ]; then
    node "$TOOL/scripts/lib/write-flat-wrapper.mjs" "eslint.config.$ext" "eslint.config.base.$ext"
    break
  fi
done

case "$PM" in
  bun)  bun install >/dev/null 2>&1 ;;
  pnpm) pnpm install >/dev/null 2>&1 ;;
  yarn) yarn install >/dev/null 2>&1 ;;
  npm)  npm install >/dev/null 2>&1 ;;
esac

git add -A
if git diff --cached --quiet; then
  echo "NOCHANGE $REPO (already https / no devDep)"
  exit 0
fi
git commit -q -m "fix: https git spec for jsx-nbsp devDep and enable jsx parsing"
echo "FIXED $REPO | pm=$PM | branch=$WORKBRANCH | head=$(git rev-parse --short HEAD)"
