// Adds eslint-plugin-jsx-nbsp as a git devDependency, pinned to v1.
import fs from 'node:fs';

const [, , pkgPath] = process.argv;
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.devDependencies = pkg.devDependencies || {};
pkg.devDependencies['eslint-plugin-jsx-nbsp'] = 'github:digitalby-me/jsx-nbsp-lint#v1';
// Keep devDependencies sorted so the diff is minimal and stable.
pkg.devDependencies = Object.fromEntries(
  Object.entries(pkg.devDependencies).sort(([a], [b]) => a.localeCompare(b)),
);
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
