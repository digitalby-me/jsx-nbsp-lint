// Wires the two jsx-nbsp rules into a legacy .eslintrc.json.
import fs from 'node:fs';

const [, , rcPath] = process.argv;
const rc = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
rc.plugins = Array.from(new Set([...(rc.plugins || []), 'jsx-nbsp']));
rc.rules = rc.rules || {};
rc.rules['jsx-nbsp/no-breaking-space-before-dash'] = 'error';
rc.rules['jsx-nbsp/no-text-to-text-jsx-space'] = 'warn';
fs.writeFileSync(rcPath, JSON.stringify(rc, null, 2) + '\n');
