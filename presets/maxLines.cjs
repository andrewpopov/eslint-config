'use strict';

/**
 * Test-file globs waived from the size cap by default. Test files are routinely
 * long-and-cohesive rather than neglected — a 2,000-line table-driven suite is
 * not the god-module the cap exists to prevent — so capping them mostly produces
 * busywork or permanent suppressions.
 */
const DEFAULT_TEST_GLOBS = [
  '**/*.test.{ts,tsx,js,jsx,mjs,cjs}',
  '**/*.spec.{ts,tsx,js,jsx,mjs,cjs}',
  '**/__tests__/**',
  '**/__mocks__/**',
  '**/tests/**',
  '**/e2e/**',
];

/**
 * Ratchet-only preset: the shared file-size cap, for consumers that want the
 * god-file limit without adopting the full base() ruleset. Pair with ESLint's
 * native bulk suppressions (`eslint --suppress-rule max-lines`) so existing
 * offenders are grandfathered and the suppressions file may only shrink.
 *
 * Test files are exempt by default (see DEFAULT_TEST_GLOBS). Pass
 * `exemptTests: false` to hold tests to the cap too, or override `testGlobs`
 * to waive a different set — e.g. a repo that deliberately caps its test
 * helpers while waiving the rest.
 *
 * @param {{ max?: number, files?: string[], exemptTests?: boolean, testGlobs?: string[] }} [opts]
 * @returns {import('eslint').Linter.Config[]}
 */
function maxLines(opts = {}) {
  const {
    max = 500,
    files = ['**/*.{ts,tsx}'],
    exemptTests = true,
    testGlobs = DEFAULT_TEST_GLOBS,
  } = opts;

  const config = [
    {
      files,
      rules: {
        'max-lines': ['error', { max, skipBlankLines: true, skipComments: true }],
      },
    },
  ];

  // Trailing block so it wins under flat-config's last-match-wins merge. Guarded
  // because a flat-config `files` key must be a non-empty array.
  if (exemptTests && testGlobs.length > 0) {
    config.push({
      files: testGlobs,
      rules: {
        'max-lines': 'off',
      },
    });
  }

  return config;
}

module.exports = maxLines;
module.exports.DEFAULT_TEST_GLOBS = DEFAULT_TEST_GLOBS;
