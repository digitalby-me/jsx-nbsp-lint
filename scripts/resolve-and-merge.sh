#!/usr/bin/env bash
# Post an addressing comment, resolve all unresolved review threads, then
# rebase-merge a PR. Used to land the rollout PRs after Codex's review has been
# addressed (real findings fixed in code; the rest explained).
# Usage: resolve-and-merge.sh <owner/repo> <pr-number> <comment-body>
set -euo pipefail

REPO="$1"; PR="$2"; COMMENT="${3:-}"
OWNER="${REPO%/*}"; NAME="${REPO#*/}"

if [ -n "$COMMENT" ]; then
  gh pr comment "$PR" --repo "$REPO" --body "$COMMENT" >/dev/null
fi

ids=$(gh api graphql -f query="query{repository(owner:\"$OWNER\",name:\"$NAME\"){pullRequest(number:$PR){reviewThreads(first:100){nodes{id isResolved}}}}}" \
  --jq '.data.repository.pullRequest.reviewThreads.nodes[]|select(.isResolved==false)|.id')
n=0
for id in $ids; do
  gh api graphql -f query="mutation{resolveReviewThread(input:{threadId:\"$id\"}){thread{id}}}" >/dev/null
  n=$((n+1))
done

if out=$(gh pr merge "$PR" --repo "$REPO" --rebase --delete-branch 2>&1); then
  echo "MERGED  $REPO #$PR (resolved $n threads)"
else
  echo "FAIL    $REPO #$PR (resolved $n threads) :: $(printf '%s' "$out" | tr '\n' ' ' | cut -c1-120)"
fi
