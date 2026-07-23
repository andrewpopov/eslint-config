'use strict';

/**
 * Ratchet-only preset: the shared file-size cap, for consumers that want the
 * god-file limit without adopting the full base() ruleset. Pair with ESLint's
 * native bulk suppressions (`eslint --suppress-rule max-lines`) so existing
 * offenders are grandfathered and the suppressions file may only shrink.
 *
 * @param {{ max?: number, files?: string[] }} [opts]
 * @returns {import('eslint').Linter.Config[]}
 */
function maxLines(opts = {}) {
  const { max = 500, files = ['**/*.{ts,tsx}'] } = opts;
  return [
    {
      files,
      rules: {
        'max-lines': ['error', { max, skipBlankLines: true, skipComments: true }],
      },
    },
  ];
}

module.exports = maxLines;
