# jsx-nbsp-lint — agent notes

Central tool that polices JSX breaking-space typography across all the user's React repos. One engine, two consumption paths (reusable Action + local ESLint plugin). Same central-repo pattern as `codex-gate` / `android-l10n-dashboard`.

## Layout
- `lib/rules/*` — the two rules. `lib/util.js` — shared helpers. `lib/index.js` — plugin entry + `recommended` flat preset.
- `eslint.bundled.config.mjs` — standalone flat config (tseslint parser) the Action/CLI use to lint a target repo without its own config.
- `bin/jsx-nbsp.js` — CLI wrapper (`npx eslint-plugin-jsx-nbsp --fix <dir>`), used by the Action.
- `action.yml` — composite action: install, `--fix` the workspace, commit fixes back to the PR branch as `github-actions[bot]`.
- `templates/caller-workflow.yml` — dropped into each repo as `.github/workflows/jsx-nbsp.yml`.
- `scripts/rollout.sh` — per-repo: sweep existing widows + install caller workflow + wire local plugin + open PR.

## Verify
`npm test` (node --test + ESLint RuleTester). This is the push-gate verify command.

## Rules of the rule
- Autofix emits `&nbsp;` / `{" "}`, NEVER a raw U+00A0 char (would trip `no-irregular-whitespace`).
- Hyphen-minus is intentionally NOT a dash (ranges/lists). Only en/em.
- Legitimate inter-element `{" "}` (Prettier-emitted) must stay untouched — `no-text-to-text-jsx-space` only flags text-to-text.

## Releasing
Bump `package.json` version, commit, then move the `v1` tag forward (consumers pin `@v1`):
`git tag -f v1 && git push -f origin v1`. Breaking changes get a new major tag (`v2`), not a moved `v1`.

## Rollout caveats
- 4 mirror pairs auto-sync digitalby-me -> digitalby via `mirror.yml`; roll out to the **digitalby-me source** only.
- Skip third-party forks/vendored upstreams (e.g. `ray-so`) so we don't diverge from upstream.
- Repos with no ESLint get the caller workflow only (the Action is standalone); the local-plugin wiring applies only to repos that already have ESLint.
