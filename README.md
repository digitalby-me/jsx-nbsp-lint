# eslint-plugin-jsx-nbsp

Two ESLint rules that catch breaking-space typography bugs in JSX, plus a reusable GitHub Action that autofixes them on every PR.

## Why

`{" "}` in JSX renders an **ordinary breaking space** (U+0020), not a non-breaking space. A breaking space before a dash lets the dash wrap to the start of the next line (a "dash widow"): `work — and` can become `work` / `— and`. The fix is a non-breaking space: `work&nbsp;—`.

You **cannot** just ban `{" "}`: it is legitimately needed (and [Prettier emits it](https://github.com/prettier/prettier/issues/201)) to preserve a space between inline elements across a line break, and `react/jsx-curly-brace-presence` deliberately [refuses to delete it](https://github.com/yannickcr/eslint-plugin-react/issues/2434). So this plugin targets the *breaking space before a dash* (autofixed) and *warns* on a `{" "}` wedged between plain text, leaving the legitimate inter-element form alone.

The autofix emits `&nbsp;` (in JSX text) or `{" "}` (in an expression), never a raw U+00A0 character, so it does not trip ESLint core's [`no-irregular-whitespace`](https://eslint.org/docs/latest/rules/no-irregular-whitespace).

## Rules

| Rule | Default | Fixable | Catches |
|---|---|---|---|
| `jsx-nbsp/no-breaking-space-before-dash` | error | yes | A breaking space (`{" "}` or a literal space) immediately before an em (`—`) or en (`–`) dash. |
| `jsx-nbsp/no-text-to-text-jsx-space` | warn | no | A `{" "}` between two text runs (`foo{" "}bar`), a likely typo for a literal space. Does **not** flag `{" "}` between elements. |

Hyphen-minus (`-`) is excluded by default (it appears in ranges, lists and compounds). Spacing inside `<code> <pre> <kbd> <samp> <script> <style>` is left untouched.

## Use 1: as a GitHub Action (autofix on PR)

Add `.github/workflows/jsx-nbsp.yml`:

```yaml
name: jsx-nbsp
on:
  pull_request:
permissions:
  contents: write
jobs:
  jsx-nbsp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.head_ref }}
      - uses: digitalby-me/jsx-nbsp-lint@v1
```

It lints every `.tsx`/`.jsx`, autofixes dash widows, and commits the fix back to the PR branch. It needs no ESLint setup in the target repo. Fork PRs (no write access) fail the job with the local fix command instead.

## Use 2: as a local ESLint plugin (editor squiggles + `--fix`)

Install from git:

```sh
npm i -D eslint-plugin-jsx-nbsp@github:digitalby-me/jsx-nbsp-lint#v1
```

Flat config (`eslint.config.js` / `.mjs`):

```js
import jsxNbsp from 'eslint-plugin-jsx-nbsp';

export default [
  // ...your config
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { 'jsx-nbsp': jsxNbsp },
    rules: {
      'jsx-nbsp/no-breaking-space-before-dash': 'error',
      'jsx-nbsp/no-text-to-text-jsx-space': 'warn',
    },
  },
];
```

Legacy config (`.eslintrc.json`):

```json
{
  "plugins": ["jsx-nbsp"],
  "rules": {
    "jsx-nbsp/no-breaking-space-before-dash": "error",
    "jsx-nbsp/no-text-to-text-jsx-space": "warn"
  }
}
```

## Options

Both rules accept `ignoreElements` (defaults to `code, pre, kbd, samp, script, style`). `no-breaking-space-before-dash` also accepts `dashes` (defaults to `["–", "—"]`) if you want to add e.g. a spaced hyphen.

```js
'jsx-nbsp/no-breaking-space-before-dash': ['error', { dashes: ['–', '—'], ignoreElements: ['code', 'pre'] }]
```

## CLI

```sh
npx eslint-plugin-jsx-nbsp --fix .   # fix dash widows under the current dir
npx eslint-plugin-jsx-nbsp .         # report only
```

## Develop

```sh
npm install
npm test
```
