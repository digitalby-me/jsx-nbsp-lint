'use strict';

const {
  DEFAULT_IGNORE_ELEMENTS,
  isInIgnoredElement,
  isWhitespaceOnlyExpression,
} = require('../util');

// Dashes owned by no-breaking-space-before-dash; do not double-report them here.
const DASH = /^[–—]/;

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Flag {" "} placed directly between text (a likely typo for a literal space); leaves the legitimate {" "} that preserves a space between JSX elements alone.',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
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
      textToTextSpace:
        '{" "} between text renders an ordinary breaking space. Write a literal space, or a non-breaking space ({"\\u00A0"} / &nbsp;) if the words must stay together.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const ignored = new Set(options.ignoreElements || DEFAULT_IGNORE_ELEMENTS);
    const sourceCode = context.sourceCode || context.getSourceCode();

    return {
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
        const index = parent.children.indexOf(node);
        const prev = parent.children[index - 1];
        const next = parent.children[index + 1];
        // Only a {" "} wedged between two text runs is suspect; between elements
        // (or element-and-text) it is the legitimate, Prettier-emitted form.
        if (!prev || prev.type !== 'JSXText' || !/\S$/.test(sourceCode.getText(prev))) {
          return;
        }
        if (!next || next.type !== 'JSXText' || !/^\S/.test(sourceCode.getText(next))) {
          return;
        }
        // The dash case is owned by no-breaking-space-before-dash.
        if (DASH.test(sourceCode.getText(next))) {
          return;
        }
        context.report({ node, messageId: 'textToTextSpace' });
      },
    };
  },
};
