# Changelog

## 0.3.0

- Add the standard fleet doc suite and release-kit integration
  Brings this package up to the fleet-standard repo layout: LICENSE, SECURITY.md,
  CONTRIBUTING.md, STANDARDS.md, RELEASING.md, SUPPORT.md, CODE_OF_CONDUCT.md,
  AGENTS.md/CLAUDE.md pointers, a `release-kit` integration (config, `.changes/`
  fragment flow, release scripts), and a CI workflow matching sibling kits. No
  runtime behavior change.

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
