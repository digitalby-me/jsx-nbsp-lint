// Adds eslint-plugin-jsx-nbsp as a git devDependency, pinned to v1.
import fs from 'node:fs';

const [, , pkgPath] = process.argv;
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.devDependencies = pkg.devDependencies || {};
// Use an HTTPS release-tarball URL, NOT the `github:` shorthand and NOT a
// git+https spec: npm rewrites both to `github:` -> git+ssh in the lockfile,
// which `npm ci` cannot fetch in keyless environments (e.g. Vercel) even for a
// public repo. A plain https tarball needs no key and npm records it verbatim,
// pinned to an immutable tag (so the lockfile integrity hash never drifts).
pkg.devDependencies['eslint-plugin-jsx-nbsp'] =
  'https://github.com/digitalby-me/jsx-nbsp-lint/archive/refs/tags/v1.0.0.tar.gz';
// Keep devDependencies sorted so the diff is minimal and stable.
pkg.devDependencies = Object.fromEntries(
  Object.entries(pkg.devDependencies).sort(([a], [b]) => a.localeCompare(b)),
);
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
