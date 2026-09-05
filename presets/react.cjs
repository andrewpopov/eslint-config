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
 * By default this pins the classic hooks pair —
 * `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` — as
 * explicit rules, regardless of what `eslint-plugin-react-hooks`'s own
 * `recommended` config contains. On `eslint-plugin-react-hooks@6`/`@7`,
 * `recommended` also bundles the React Compiler rule set (`set-state-in-effect`,
 * `refs`, `purity`, `immutability`, `globals`, `preserve-manual-memoization`,
 * `incompatible-library`, etc.); spreading it unconditionally surfaced 136
 * new errors in one consumer after an unrelated eslint bump forced `@7`. Pass
 * `compilerRules: true` to opt into that full `recommended` set instead (it
 * is spread before the two explicit rules, so the classic pair still wins if
 * `recommended` disagrees with them). On `eslint-plugin-react-hooks@5`,
 * `recommended` is already just the classic pair, so `compilerRules` is a
 * no-op there.
 *
 * @param {{ allowExportNames?: string[], files?: string[], compilerRules?: boolean }} [opts]
 * @returns {import('eslint').Linter.Config[]}
 */
function react(opts = {}) {
  const { allowExportNames = [], files = ['**/*.{ts,tsx}'], compilerRules = false } = opts;

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
        ...(compilerRules ? reactHooks.configs.recommended.rules : {}),
        'react-hooks/rules-of-hooks': 'error',
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
