'use strict';

const tseslint = require('typescript-eslint');
const maxLines = require('./maxLines.cjs');

/**
 * Base preset: TypeScript recommended + stylistic rules, plus a small set of
 * project-wide conventions shared across all consuming repos.
 *
 * @param {{ anySeverity?: string, ignores?: string[], files?: string[], exemptTests?: boolean, testGlobs?: string[] }} [opts]
 * @returns {import('eslint').Linter.Config[]}
 */
function base(opts = {}) {
  const { anySeverity = 'error', ignores = [], files = ['**/*.{ts,tsx}'], exemptTests, testGlobs } = opts;

  return [
    {
      ignores: [
        'dist',
        'node_modules',
        'build',
        'coverage',
        '.git',
        'public',
        '**/*.d.ts',
        ...ignores,
      ],
    },
    {
      linterOptions: {
        reportUnusedDisableDirectives: 'error',
      },
    },
    ...tseslint.config({
      files,
      extends: [tseslint.configs.recommended, tseslint.configs.stylistic],
    }),
    {
      files,
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-explicit-any': anySeverity,
        '@typescript-eslint/no-non-null-assertion': 'warn',
        'no-debugger': 'warn',
        '@typescript-eslint/no-empty-object-type': 'warn',
        '@typescript-eslint/consistent-type-definitions': 'warn',
        '@typescript-eslint/no-require-imports': 'warn',
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': [
          'error',
          { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
        ],
      },
    },
    // Single-source the file-size cap from the maxLines() preset so base() and a
    // ratchet-only adoption can never drift on the limit.
    ...maxLines({ files, ...(exemptTests !== undefined && { exemptTests }), ...(testGlobs && { testGlobs }) }),
  ];
}

module.exports = base;
