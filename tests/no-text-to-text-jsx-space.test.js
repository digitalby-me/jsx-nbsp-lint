'use strict';

const test = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../lib/rules/no-text-to-text-jsx-space');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

test('no-text-to-text-jsx-space', () => {
  ruleTester.run('no-text-to-text-jsx-space', rule, {
    valid: [
      // Legitimate: preserves a space between two elements (Prettier emits this).
      { code: 'const x = <p><a>a</a>{" "}<b>b</b></p>;' },
      // Text then element: still a real inter-node space.
      { code: 'const x = <p>foo{" "}<b>b</b></p>;' },
      // Element then text.
      { code: 'const x = <p><b>b</b>{" "}foo</p>;' },
      // A plain literal space needs no flag.
      { code: 'const x = <p>foo bar</p>;' },
      // Inside an ignored element.
      { code: 'const x = <code>foo{" "}bar</code>;' },
      // The dash case is owned by the other rule.
      { code: 'const x = <p>work{" "}— and</p>;' },
    ],
    invalid: [
      {
        code: 'const x = <p>foo{" "}bar</p>;',
        errors: [{ messageId: 'textToTextSpace' }],
      },
      {
        code: "const x = <p>foo{' '}bar</p>;",
        errors: [{ messageId: 'textToTextSpace' }],
      },
    ],
  });
});
