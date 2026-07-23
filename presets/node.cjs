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

  const config = [
    {
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
    },
  ];

  // A flat-config `files` key must be a non-empty array, so only add the
  // tooling carve-out when there are globs. Passing `toolingGlobs: []` is the
  // supported way to get node globals with no relaxations.
  if (toolingGlobs.length > 0) {
    config.push({
      files: toolingGlobs,
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'no-console': 'off',
      },
    });
  }

  return config;
}

module.exports = node;
