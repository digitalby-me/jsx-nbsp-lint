# Rollout scripts

Used to roll the jsx-nbsp workflow + local ESLint wiring out to a React repo.

`rollout-prepare.sh <owner/repo>` clones the repo into `$ROLLOUT_ROOT`
(default `/tmp/jsxnbsp-rollout`), creates a `chore/jsx-nbsp` branch, drops in the
caller workflow, wires the local ESLint plugin where a config exists (flat config
via a rename-and-wrap, legacy `.eslintrc.json` via a small JSON edit), refreshes
the lockfile, and commits. It does **not** push or open a PR.

That split is deliberate: the push gate must stay in force. A script that ran
`git push` itself would bypass the PreToolUse gate. So the flow is three steps,
the last two run by hand so the gate sees them:

```
scripts/rollout-prepare.sh digitalby-me/<repo>
cd /tmp/jsxnbsp-rollout/<repo> && npx --no-install tsc --noEmit   # or `npm test` — a recognised, passing verify at HEAD
cd /tmp/jsxnbsp-rollout/<repo> && git push -u origin chore/jsx-nbsp && gh pr create --head chore/jsx-nbsp --title "..." --body "..."
```

## Rollout rules
- For the digitalby<->digitalby-me mirror pairs, target the **digitalby-me source**; the mirror auto-syncs.
- Skip third-party forks (e.g. `ray-so`) so we don't diverge from upstream.
- Repos with no ESLint config get the caller workflow only (the Action is standalone).

## helpers (`scripts/lib/`)
- `write-flat-wrapper.mjs` — rewrites `eslint.config.<ext>` to spread the renamed
  `eslint.config.base.<ext>` and append the jsx-nbsp rules (shape-agnostic; ESM or CJS).
- `wire-legacy-json.mjs` — adds the plugin + rules to a legacy `.eslintrc.json`.
- `add-devdep.mjs` — adds `eslint-plugin-jsx-nbsp` as a `github:` devDependency, pinned to v1.
