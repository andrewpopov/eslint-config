---
kind: added
summary: Add verify:pack, the packed-tarball consumer smoke test
---

Brings this package's gates in line with the fleet's shared-package standard:
`verify:pack` packs the tarball, installs it into a throwaway consumer, and
requires it both via CJS `require()` and native ESM `import`, asserting every
preset/factory (`base`, `maxLines`, `astro`, `react`, `next`, `node`, `tests`,
`strict`, `layerBoundary`, `exemptFilesFromRule`) actually ships and resolves.
Wired into `npm run verify` (and so into `.githooks/pre-push`). No runtime
behavior change; this package still has no type gate — documented as an
exemption in `.githooks/pre-push` since it exports flat-config objects/
factories consumed via plain `require()`, not a typed API.
