'use strict';

/**
 * Astro preset: wraps eslint-plugin-astro's flat recommended config (which also
 * wires astro-eslint-parser for `.astro` files).
 *
 * `eslint-plugin-astro` is NOT a dependency of this kit — it's only needed by
 * Astro consumers — so it's resolved lazily from the CONSUMER's context and a
 * clear error is thrown if it isn't installed.
 *
 * @param {{ recommended?: string }} [opts] - override the plugin config key
 * @returns {import('eslint').Linter.Config[]}
 */
function astro(opts = {}) {
  const { recommended = 'flat/recommended' } = opts;

  let astroPlugin;
  try {
    astroPlugin = require(require.resolve('eslint-plugin-astro', { paths: [process.cwd()] }));
  } catch {
    throw new Error(
      '@andrewpopov/eslint-config: astro() preset requires eslint-plugin-astro (and astro-eslint-parser) to be installed'
    );
  }

  const configs = astroPlugin.configs || {};
  const selected = configs[recommended] || configs.recommended;
  if (!selected) {
    throw new Error(
      `@andrewpopov/eslint-config: eslint-plugin-astro has no "${recommended}" config (available: ${Object.keys(configs).join(', ')})`
    );
  }

  return Array.isArray(selected) ? selected : [selected];
}

module.exports = astro;
