'use strict';

/**
 * Factory for architecture-boundary import restrictions. One portable
 * primitive replacing the bespoke `no-restricted-imports` blocks each
 * consuming repo used to hand-roll.
 *
 * @param {{ files: string[], patterns: string[], message: string }} args
 * @returns {import('eslint').Linter.Config[]}
 */
function layerBoundary({ files, patterns, message }) {
  return [
    {
      files,
      rules: {
        'no-restricted-imports': ['error', { patterns: [{ group: patterns, message }] }],
      },
    },
  ];
}

module.exports = layerBoundary;
