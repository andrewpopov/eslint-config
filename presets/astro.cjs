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
  // Explicitly-passed `undefined` reads as "no preference" too — same as an
  // omitted option — under ordinary default-parameter semantics; anything
  // else the caller supplies is an explicit request that must be honoured
  // (or throw), never silently swapped for a different config.
  const optionSupplied = opts.recommended !== undefined;
  const recommended = optionSupplied ? opts.recommended : 'flat/recommended';

  let astroPlugin;
  try {
    astroPlugin = require(require.resolve('eslint-plugin-astro', { paths: [process.cwd()] }));
  } catch {
    throw new Error(
      '@andrewpopov/eslint-config: astro() preset requires eslint-plugin-astro (and astro-eslint-parser) to be installed'
    );
  }

  const configs = astroPlugin.configs || {};
  let selected = configs[recommended];
  if (selected === undefined && !optionSupplied) {
    // No explicit key was requested — fall back to the plugin's own generic
    // `recommended` config (covers older eslint-plugin-astro releases that
    // don't ship the `flat/recommended` key). An explicitly-requested key
    // that doesn't exist must throw below instead, not silently resolve to
    // a different config than the caller asked for.
    selected = configs.recommended;
  }
  if (!selected) {
    throw new Error(
      `@andrewpopov/eslint-config: eslint-plugin-astro has no "${recommended}" config (available: ${Object.keys(configs).join(', ')})`
    );
  }

  return Array.isArray(selected) ? selected : [selected];
}

module.exports = astro;
