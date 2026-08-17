# Changelog

## 0.2.0

This changelog starts here — future releases are managed by
[`release-kit`](https://github.com/andrewpopov/release-kit) from fragments
under `.changes/unreleased/` (see `.changes/README.md`). Summary of history to
date, from `git log`:

- `maxLines()` ratchet-only preset; `base()` single-sources the size limit and
  waives the cap for test files by default.
- `node()`: omit the tooling carve-out when `toolingGlobs` is empty.
- `astro()` preset for Astro consumers, via `FlatCompat`.
- Fixed `astro()` ignoring an explicit `key` option and `next()` swallowing
  config-load errors instead of surfacing them.
- Initial release: `base`, `react`, `next`, `node`, `tests`, `strict` presets
  plus the `layerBoundary` and `exemptFilesFromRule` factories.
