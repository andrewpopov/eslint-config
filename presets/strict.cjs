'use strict';

const tseslint = require('typescript-eslint');

/**
 * Strict preset: extra style battery for repos that opt into a stricter bar
 * (originally rouge's config). Registers the @typescript-eslint plugin itself
 * so the preset is valid standalone (not just when composed after base()) —
 * it's the same plugin object base() registers, so composing the two is
 * harmless.
 *
 * @param {Record<string, unknown>} [_opts]
 * @returns {import('eslint').Linter.Config[]}
 */
function strict(_opts = {}) {
  return [
    {
      plugins: {
        '@typescript-eslint': tseslint.plugin,
      },
      rules: {
        curly: ['error', 'all'],
        eqeqeq: 'error',
        'no-else-return': 'error',
        'no-implicit-coercion': 'error',
        'no-lonely-if': 'error',
        'no-param-reassign': 'error',
        'no-return-assign': 'error',
        'no-unneeded-ternary': 'error',
        'no-useless-return': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
        'no-nested-ternary': 'error',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'max-depth': ['error', 4],
        'max-params': ['error', 8],
      },
    },
  ];
}

module.exports = strict;
