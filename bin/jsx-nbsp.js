#!/usr/bin/env node
'use strict';

// Lint (and optionally --fix) a target directory's JSX/TSX using only the two
// jsx-nbsp rules, via the bundled standalone config. Used by the reusable
// Action and runnable locally: `npx eslint-plugin-jsx-nbsp --fix <dir>`.
//
// Exit code is 1 only when the error-level rule (no-breaking-space-before-dash)
// still reports after fixing; warnings (no-text-to-text-jsx-space) never fail.

const path = require('node:path');
const { ESLint } = require('eslint');

async function main() {
  const argv = process.argv.slice(2);
  const fix = argv.includes('--fix');
  const positional = argv.filter((a) => !a.startsWith('--'));
  const cwd = path.resolve(positional[0] || process.cwd());
  const configPath = path.join(__dirname, '..', 'eslint.bundled.config.mjs');

  const eslint = new ESLint({
    cwd,
    overrideConfigFile: configPath,
    fix,
    errorOnUnmatchedPattern: false,
  });

  const results = await eslint.lintFiles(['**/*.{jsx,tsx}']);
  if (fix) {
    await ESLint.outputFixes(results);
  }

  // This tool reports ONLY its own two rules. The target repo's unrelated inline
  // directives (e.g. `// eslint-disable-next-line @next/next/no-img-element`)
  // make ESLint emit "Definition for rule '...' was not found" because that
  // plugin isn't registered in the bundled config; those foreign messages must
  // not fail the run. Keep jsx-nbsp/* messages plus genuine fatal parse errors,
  // drop everything else, and recompute counts from the filtered set.
  const filtered = results.map((r) => {
    const messages = r.messages.filter(
      (m) => m.fatal || (m.ruleId && m.ruleId.startsWith('jsx-nbsp/')),
    );
    const errorCount = messages.filter((m) => m.severity === 2).length;
    const warningCount = messages.filter((m) => m.severity === 1).length;
    return { ...r, messages, errorCount, warningCount };
  });

  const formatter = await eslint.loadFormatter('stylish');
  const output = await formatter.format(filtered);
  if (output.trim()) {
    process.stdout.write(output + '\n');
  }

  const errorCount = filtered.reduce((n, r) => n + r.errorCount, 0);
  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
