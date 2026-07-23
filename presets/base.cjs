'use strict';

const tseslint = require('typescript-eslint');

/**
 * Base preset: TypeScript recommended + stylistic rules, plus a small set of
 * project-wide conventions shared across all consuming repos.
 *
 * @param {{ anySeverity?: string, ignores?: string[], files?: string[] }} [opts]
 * @returns {import('eslint').Linter.Config[]}
 */
function base(opts = {}) {
  const { anySeverity = 'error', ignores = [], files = ['**/*.{ts,tsx}'] } = opts;

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
        'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      },
    },
  ];
}

module.exports = base;
