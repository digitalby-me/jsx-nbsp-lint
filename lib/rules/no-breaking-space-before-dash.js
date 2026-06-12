'use strict';

const {
  DEFAULT_IGNORE_ELEMENTS,
  isInIgnoredElement,
  isWhitespaceOnlyExpression,
} = require('../util');

// En dash (U+2013) and em dash (U+2014). Hyphen-minus is intentionally excluded:
// it appears in ranges, lists and compounds where a breaking space is correct.
const DEFAULT_DASHES = ['–', '—'];

function toUnicodeClass(chars) {
  return `[${chars
    .map((c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
    .join('')}]`;
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a non-breaking space before an em/en dash in JSX so the dash never wraps to the start of the next line.',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          dashes: {
            type: 'array',
            items: { type: 'string', minLength: 1, maxLength: 1 },
            uniqueItems: true,
          },
          ignoreElements: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      breakingSpaceBeforeDash:
        'Breaking space before "{{dash}}" lets the dash wrap to the start of the next line. Use a non-breaking space.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const dashes =
      options.dashes && options.dashes.length ? options.dashes : DEFAULT_DASHES;
    const ignored = new Set(options.ignoreElements || DEFAULT_IGNORE_ELEMENTS);
    const sourceCode = context.sourceCode || context.getSourceCode();
    const dashClass = toUnicodeClass(dashes);
    // A single breaking space (space or tab) immediately followed by a dash.
    const spaceBeforeDash = new RegExp(`[ \\t](?=${dashClass})`, 'g');
    const startsWithDash = new RegExp(`^${dashClass}`);

    return {
      JSXText(node) {
        if (isInIgnoredElement(node, ignored)) {
          return;
        }
        const raw = sourceCode.getText(node);
        let match;
        spaceBeforeDash.lastIndex = 0;
        while ((match = spaceBeforeDash.exec(raw)) !== null) {
          const start = node.range[0] + match.index;
          const dash = raw[match.index + 1];
          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(start),
              end: sourceCode.getLocFromIndex(start + 1),
            },
            messageId: 'breakingSpaceBeforeDash',
            data: { dash },
            fix(fixer) {
              return fixer.replaceTextRange([start, start + 1], '&nbsp;');
            },
          });
        }
      },

      JSXExpressionContainer(node) {
        if (!isWhitespaceOnlyExpression(node)) {
          return;
        }
        if (isInIgnoredElement(node, ignored)) {
          return;
        }
        const parent = node.parent;
        if (!parent || !Array.isArray(parent.children)) {
          return;
        }
        const next = parent.children[parent.children.indexOf(node) + 1];
        if (!next || next.type !== 'JSXText') {
          return;
        }
        const nextRaw = sourceCode.getText(next);
        if (!startsWithDash.test(nextRaw)) {
          return;
        }
        context.report({
          node,
          messageId: 'breakingSpaceBeforeDash',
          data: { dash: nextRaw[0] },
          fix(fixer) {
            return fixer.replaceText(node, '{"\\u00A0"}');
          },
        });
      },
    };
  },
};
