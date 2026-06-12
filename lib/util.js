'use strict';

const DEFAULT_IGNORE_ELEMENTS = ['code', 'pre', 'kbd', 'samp', 'script', 'style'];

/**
 * Walk a node's JSX ancestors and report whether it sits inside an element
 * whose tag name is in `ignored` (e.g. <code>, <pre>), where typographic
 * spacing should be left exactly as written.
 *
 * @param {import('eslint').Rule.Node} node
 * @param {Set<string>} ignored
 * @returns {boolean}
 */
function isInIgnoredElement(node, ignored) {
  let current = node.parent;
  while (current) {
    if (
      current.type === 'JSXElement' &&
      current.openingElement &&
      current.openingElement.name &&
      current.openingElement.name.type === 'JSXIdentifier' &&
      ignored.has(current.openingElement.name.name)
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/**
 * True when a JSXExpressionContainer holds a string literal made of nothing but
 * breaking spaces/tabs, i.e. `{" "}` (any quote style, one or more spaces).
 *
 * @param {import('eslint').Rule.Node} node
 * @returns {boolean}
 */
function isWhitespaceOnlyExpression(node) {
  const expr = node.expression;
  return (
    !!expr &&
    expr.type === 'Literal' &&
    typeof expr.value === 'string' &&
    /^[ \t]+$/.test(expr.value)
  );
}

module.exports = {
  DEFAULT_IGNORE_ELEMENTS,
  isInIgnoredElement,
  isWhitespaceOnlyExpression,
};
