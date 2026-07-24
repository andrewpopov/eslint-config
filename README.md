# @andrewpopov/eslint-config

Composable ESLint flat-config presets shared across personal projects (savoro, rouge, bewks,
smarthome). CJS package, but importable from ESM consumers via named imports.

## Install

```bash
npm install --save-dev github:andrewpopov/eslint-config#v0.1.0
```

## What's in here

- `base(opts)` — TypeScript recommended + stylistic rules, plus shared conventions
  (unused-vars, no-explicit-any, max-lines, etc).
- `react(opts)` — `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`.
- `next(opts)` — wraps `eslint-config-next` via `FlatCompat`. Requires the consumer to have
  `eslint-config-next` installed; throws a clear error otherwise. Not a dependency of this kit.
- `node(opts)` — Node globals, with relaxed `no-console` / `no-require-imports` for tooling globs.
- `tests(opts)` — relaxes `no-explicit-any` and `react-refresh/only-export-components` in test files.
- `strict(opts)` — extra style battery (curly, eqeqeq, no-shadow, max-depth, etc).
- `layerBoundary({ files, patterns, message })` — factory for architecture-boundary
  `no-restricted-imports` blocks.
- `exemptFilesFromRule(rule, files)` — factory for turning a rule off for a set of files.

Every export is a function that returns a flat-config array — spread and append as needed.

## Usage

### Monorepo (e.g. savoro): base + react + node + tests + layerBoundary

```js
// eslint.config.mjs
import { base, react, node, tests, layerBoundary } from '@andrewpopov/eslint-config';

export default [
  ...base(),
  ...react(),
  ...node({ toolingGlobs: ['**/scripts/**'] }),
  ...tests(),
  ...layerBoundary({
    files: ['packages/web-app/**/*.{ts,tsx}'],
    patterns: ['@savoro/api/*'],
    message: 'web-app must not import API internals directly.',
  }),
];
```

### Single-package Node repo

```js
// eslint.config.cjs
const { base, node } = require('@andrewpopov/eslint-config');

module.exports = [...base(), ...node()];
```

## Development

```bash
npm install
npm test   # node --test — verifies every preset loads under both require() and import
npm run lint
```

## max-lines and test files

`maxLines()` (and `base()`, which composes it) waives the size cap for test files by default — `*.test.*`, `*.spec.*`, `__tests__/**`, `__mocks__/**`, `tests/**`, `e2e/**`. Long test suites are usually long-and-cohesive rather than god-modules. Pass `exemptTests: false` to hold tests to the cap, or `testGlobs: [...]` to waive a different set (e.g. capping test helpers while waiving the rest).
