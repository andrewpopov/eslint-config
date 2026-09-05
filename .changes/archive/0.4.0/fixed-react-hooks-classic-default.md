---
kind: fixed
summary: react() preset now pins rules-of-hooks and exhaustive-deps by default; React Compiler rules are opt-in via compilerRules
---

`eslint-plugin-react-hooks@7` (forced by the `eslint@10` peer range) bundles the
React Compiler rule set into its `recommended` config; spreading that
unconditionally, as `react()` previously did, surfaced 136 new errors in one
consumer that had never opted into those rules. `react()` now sets
`react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` explicitly
instead of spreading `recommended`, so the classic pair is what ships by
default on every installed major (`@5`, `@6`, `@7`). Pass
`react({ compilerRules: true })` to opt into the full compiler rule set.
