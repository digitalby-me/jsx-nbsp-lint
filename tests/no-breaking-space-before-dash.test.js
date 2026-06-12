'use strict';

const test = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../lib/rules/no-breaking-space-before-dash');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

test('no-breaking-space-before-dash', () => {
  ruleTester.run('no-breaking-space-before-dash', rule, {
    valid: [
      // Already a non-breaking space (entity).
      { code: 'const x = <p>work&nbsp;— and</p>;' },
      // Already a non-breaking space (expression escape).
      { code: 'const x = <p>work{"\\u00A0"}— and</p>;' },
      // Legitimate inter-element {" "}, no dash involved.
      { code: 'const x = <p><a>a</a>{" "}<b>b</b></p>;' },
      // Closed em dash (no surrounding space) is fine.
      { code: 'const x = <p>work—and</p>;' },
      // Inside <code> we leave spacing exactly as written.
      { code: 'const x = <code>a — b</code>;' },
      // Hyphen-minus is not a dash (ranges/lists).
      { code: 'const x = <p>10 - 20</p>;' },
      // Space AFTER the dash does not cause a widow.
      { code: 'const x = <p>work&nbsp;—and more</p>;' },
    ],
    invalid: [
      {
        code: 'const x = <p>work — and</p>;',
        output: 'const x = <p>work&nbsp;— and</p>;',
        errors: [{ messageId: 'breakingSpaceBeforeDash' }],
      },
      {
        code: 'const x = <p>work{" "}— and</p>;',
        output: 'const x = <p>work{"\\u00A0"}— and</p>;',
        errors: [{ messageId: 'breakingSpaceBeforeDash' }],
      },
      {
        code: 'const x = <p>en – dash</p>;',
        output: 'const x = <p>en&nbsp;– dash</p>;',
        errors: [{ messageId: 'breakingSpaceBeforeDash' }],
      },
      {
        // Single-quote {' '} normalises to the escape form.
        code: "const x = <p>work{' '}— and</p>;",
        output: 'const x = <p>work{"\\u00A0"}— and</p>;',
        errors: [{ messageId: 'breakingSpaceBeforeDash' }],
      },
      {
        // Two dash widows in one text node, both fixed.
        code: 'const x = <p>a — b and c — d</p>;',
        output: 'const x = <p>a&nbsp;— b and c&nbsp;— d</p>;',
        errors: [
          { messageId: 'breakingSpaceBeforeDash' },
          { messageId: 'breakingSpaceBeforeDash' },
        ],
      },
    ],
  });
});
