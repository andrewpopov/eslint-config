import { base, node, exemptFilesFromRule } from './index.cjs';

// The kit is plain CJS/ESM JS (no .ts), so scope base()'s rule overrides to the
// file types this repo actually contains.
export default [
  ...base({ files: ['**/*.cjs', '**/*.mjs'] }),
  ...node(),
  // This kit's whole point is composing CJS presets via require() — exempt it
  // from the rule that otherwise nudges consumers toward ESM imports.
  ...exemptFilesFromRule('@typescript-eslint/no-require-imports', ['**/*.cjs']),
];
