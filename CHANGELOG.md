# Changelog

## 0.4.0

- Add verify:pack, the packed-tarball consumer smoke test
  Brings this package's gates in line with the fleet's shared-package standard:
  `verify:pack` packs the tarball, installs it into a throwaway consumer, and
  requires it both via CJS `require()` and native ESM `import`, asserting every
  preset/factory (`base`, `maxLines`, `astro`, `react`, `next`, `node`, `tests`,
  `strict`, `layerBoundary`, `exemptFilesFromRule`) actually ships and resolves.
  Wired into `npm run verify` (and so into `.githooks/pre-push`). No runtime
  behavior change; this package still has no type gate — documented as an
  exemption in `.githooks/pre-push` since it exports flat-config objects/
  factories consumed via plain `require()`, not a typed API.
- react() preset now pins rules-of-hooks and exhaustive-deps by default; React Compiler rules are opt-in via compilerRules
  `eslint-plugin-react-hooks@7` (forced by the `eslint@10` peer range) bundles the
  React Compiler rule set into its `recommended` config; spreading that
  unconditionally, as `react()` previously did, surfaced 136 new errors in one
  consumer that had never opted into those rules. `react()` now sets
  `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` explicitly
  instead of spreading `recommended`, so the classic pair is what ships by
  default on every installed major (`@5`, `@6`, `@7`). Pass
  `react({ compilerRules: true })` to opt into the full compiler rule set.

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
