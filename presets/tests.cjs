'use strict';

/**
 * Tests preset: relaxes rules that are legitimately noisy in test files
 * (mocking with `any`, test-only exports tripping fast-refresh checks).
 *
 * @param {{ files?: string[] }} [opts]
 * @returns {import('eslint').Linter.Config[]}
 */
function tests(opts = {}) {
  const {
    files = ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
  } = opts;

  return [
    {
      files,
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'react-refresh/only-export-components': 'off',
      },
    },
  ];
}

module.exports = tests;
