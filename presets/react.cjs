'use strict';

const globals = require('globals');

/**
 * React preset: hooks rules + fast-refresh export-shape checks.
 *
 * `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` are optional
 * peers of this kit (Node-only consumers should never need to install them),
 * so they're required lazily here, resolved from the consumer context, only
 * when a repo actually calls react().
 *
 * @param {{ allowExportNames?: string[], files?: string[] }} [opts]
 * @returns {import('eslint').Linter.Config[]}
 */
function react(opts = {}) {
  const { allowExportNames = [], files = ['**/*.{ts,tsx}'] } = opts;

  let reactHooks;
  let reactRefresh;
  try {
    reactHooks = require(require.resolve('eslint-plugin-react-hooks', { paths: [process.cwd()] }));
    reactRefresh = require(
      require.resolve('eslint-plugin-react-refresh', { paths: [process.cwd()] })
    );
  } catch {
    throw new Error(
      '@andrewpopov/eslint-config: react() preset requires eslint-plugin-react-hooks and eslint-plugin-react-refresh to be installed'
    );
  }

  return [
    {
      files,
      plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
      },
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
        parserOptions: {
          ecmaFeatures: { jsx: true },
        },
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
        'react-hooks/exhaustive-deps': 'error',
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true, allowExportNames },
        ],
      },
    },
  ];
}

module.exports = react;
