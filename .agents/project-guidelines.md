# eslint-config project guidelines

Composable ESLint flat-config presets shared across andrewpopov personal
projects (savoro, rouge, bewks, smarthome). CJS package, importable from ESM
consumers via named imports.

This is a package in the shared fleet documented by `packages-meta`. Fleet-wide
architecture, maturity criteria, and composition rules live there; personal
workflow standards load from `agent_brain` via the directory tree.

## Source of truth

- This package's `presets/`, `factories/`, and `index.cjs` are authoritative
  for its behavior.
- `packages-meta` owns cross-package boundaries and the catalog entry.
- `STANDARDS.md`, `CONTRIBUTING.md`, and `RELEASING.md` in this repo govern
  code, contribution, and release mechanics.

## Rules

- Every exported preset function must return a flat-config array and stay
  composable — spread-and-append, no hidden global state or side effects at
  import time.
- Keep the public API surface deliberate: every export is a compatibility
  commitment for every consumer repo. Follow the release flow in
  `RELEASING.md` (patch-note fragments, version gates) for any user-visible
  change.
- This kit dogfoods its own config (`eslint.config.mjs`) — a preset change
  that breaks linting this repo is a signal, not an obstacle to route around.
- Run the repo's verification gate (`npm run verify`) before calling work done.
