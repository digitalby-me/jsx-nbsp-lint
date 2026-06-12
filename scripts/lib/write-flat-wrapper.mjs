// Writes a thin flat-config wrapper that spreads the repo's original config
// (renamed to eslint.config.base.<ext>) and appends the jsx-nbsp rules. This is
// shape-agnostic: it works whether the base default-exports an array,
// tseslint.config(...), or defineConfig([...]) — anything spreadable.
import fs from 'node:fs';

const [, , targetPath, baseFile] = process.argv;
const baseContent = fs.readFileSync(baseFile, 'utf8');
const isCjs = /module\.exports\s*=/.test(baseContent) && !/export\s+default/.test(baseContent);
const importPath = './' + baseFile;

const block = `  {
    files: ["**/*.{jsx,tsx}"],
    plugins: { "jsx-nbsp": jsxNbsp },
    rules: {
      "jsx-nbsp/no-breaking-space-before-dash": "error",
      "jsx-nbsp/no-text-to-text-jsx-space": "warn",
    },
  },`;

const content = isCjs
  ? `const base = require(${JSON.stringify(importPath)});
const jsxNbsp = require("eslint-plugin-jsx-nbsp");

const baseConfig = Array.isArray(base) ? base : [base];

module.exports = [
  ...baseConfig,
${block}
];
`
  : `import base from ${JSON.stringify(importPath)};
import jsxNbsp from "eslint-plugin-jsx-nbsp";

const baseConfig = Array.isArray(base) ? base : [base];

export default [
  ...baseConfig,
${block}
];
`;

fs.writeFileSync(targetPath, content);
