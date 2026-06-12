// Standalone flat config used by the reusable Action (and `bin/jsx-nbsp.js`) to
// lint a target repo's JSX/TSX regardless of whether that repo has its own
// ESLint setup. Run with ESLint's `overrideConfigFile` so the repo's own
// config is ignored and only these two rules apply.
import tsParser from '@typescript-eslint/parser';
import jsxNbsp from './lib/index.js';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/out/**',
      '**/.output/**',
      '**/.vercel/**',
      '**/.turbo/**',
      '**/coverage/**',
    ],
  },
  {
    files: ['**/*.{jsx,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'jsx-nbsp': jsxNbsp },
    rules: {
      'jsx-nbsp/no-breaking-space-before-dash': 'error',
      'jsx-nbsp/no-text-to-text-jsx-space': 'warn',
    },
  },
];
