'use strict';

const globals = require('globals');

/**
 * Node preset: node globals everywhere, with relaxed require/console rules
 * for tooling directories (scripts, deploy config, etc).
 *
 * @param {{ toolingGlobs?: string[] }} [opts]
 * @returns {import('eslint').Linter.Config[]}
 */
function node(opts = {}) {
  const { toolingGlobs = ['**/scripts/**', '**/deploy/**'] } = opts;

  return [
    {
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
    },
    {
      files: toolingGlobs,
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'no-console': 'off',
      },
    },
  ];
}

module.exports = node;
