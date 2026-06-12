'use strict';

const noBreakingSpaceBeforeDash = require('./rules/no-breaking-space-before-dash');
const noTextToTextJsxSpace = require('./rules/no-text-to-text-jsx-space');

const { version } = require('../package.json');

const plugin = {
  meta: {
    name: 'eslint-plugin-jsx-nbsp',
    version,
  },
  rules: {
    'no-breaking-space-before-dash': noBreakingSpaceBeforeDash,
    'no-text-to-text-jsx-space': noTextToTextJsxSpace,
  },
};

// Flat-config preset. Consumers spread this into their eslint.config.* after
// providing a JSX/TSX-capable parser (e.g. @typescript-eslint/parser).
plugin.configs = {
  recommended: {
    plugins: { 'jsx-nbsp': plugin },
    rules: {
      'jsx-nbsp/no-breaking-space-before-dash': 'error',
      'jsx-nbsp/no-text-to-text-jsx-space': 'warn',
    },
  },
};

module.exports = plugin;
