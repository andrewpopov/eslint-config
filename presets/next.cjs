'use strict';

/**
 * Next.js preset: prefers `eslint-config-next`'s native flat-config export
 * (shipped by modern eslint-config-next releases), falling back to the
 * legacy eslintrc-shaped shareable config via FlatCompat for older releases
 * (e.g. eslint-config-next@15.x, which still ships `extends`/`env`-shaped
 * config rather than a flat array). `eslint-config-next` is NOT a dependency
 * of this kit (it's heavy and only needed by Next.js-based consumers) — it's
 * resolved from the CONSUMER's context and required lazily here, and a clear
 * error is thrown if it isn't installed at all.
 *
 * @returns {import('eslint').Linter.Config[]}
 */
function next() {
  const consumerPaths = [process.cwd()];

  let coreWebVitalsEntry;
  try {
    coreWebVitalsEntry = require.resolve('eslint-config-next/core-web-vitals', {
      paths: consumerPaths,
    });
  } catch {
    try {
      require.resolve('eslint-config-next', { paths: consumerPaths });
    } catch {
      throw new Error(
        '@andrewpopov/eslint-config: next() preset requires eslint-config-next to be installed'
      );
    }
  }

  if (coreWebVitalsEntry) {
    // Let a genuine load error (a real bug in the installed package, a
    // missing internal dependency, an environment quirk) propagate as-is —
    // it's a different condition from "this export is legacy-shaped" below,
    // and swallowing it here would replace a meaningful error with an
    // unrelated FlatCompat failure once the bridge re-attempts the same
    // broken require internally.
    const nextConfig = require(coreWebVitalsEntry);
    if (Array.isArray(nextConfig)) {
      // Modern eslint-config-next ships a native flat-config array under
      // this same subpath — use it directly, no FlatCompat bridge needed.
      return nextConfig;
    }
    // A successfully loaded but non-array export means an older release's
    // eslintrc-shaped shareable config — fall through to the FlatCompat
    // bridge below, which knows how to translate it.
  }

  // Legacy eslint-config-next (eslintrc-shaped shareable config) — bridge via
  // FlatCompat, same as before.
  const { FlatCompat } = require('@eslint/eslintrc');
  const compat = new FlatCompat({ baseDirectory: process.cwd() });

  return compat.extends('next/core-web-vitals');
}

module.exports = next;
