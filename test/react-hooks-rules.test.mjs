import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { react } from '../index.cjs';

// react.cjs resolves eslint-plugin-react-hooks / eslint-plugin-react-refresh
// from process.cwd() (same mechanism astro.cjs / next.cjs use, exercised in
// preset-error-handling.test.mjs). These tests build a throwaway
// node_modules/eslint-plugin-react-hooks fixture whose `recommended` config
// deliberately mixes the classic hooks pair with a couple of React Compiler
// rules (the shape eslint-plugin-react-hooks@6/@7's `recommended` actually
// has) — real @5.2.0 installed here doesn't have compiler rules to
// misbehave with, so without this fixture the default-excludes-compiler-
// rules assertion could pass vacuously.

function makeFixtureDir(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-config-react-hooks-fixture-'));
  for (const [relPath, contents] of Object.entries(files)) {
    const full = path.join(dir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, contents);
  }
  return dir;
}

async function withFixture(files, fn) {
  const dir = makeFixtureDir(files);
  const originalCwd = process.cwd();
  process.chdir(dir);
  try {
    await fn();
  } finally {
    process.chdir(originalCwd);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const COMPILER_RULE_NAMES = [
  'react-hooks/set-state-in-effect',
  'react-hooks/purity',
  'react-hooks/immutability',
  'react-hooks/globals',
  'react-hooks/refs',
  'react-hooks/preserve-manual-memoization',
  'react-hooks/incompatible-library',
];

const REACT_HOOKS_V7_LIKE = {
  'node_modules/eslint-plugin-react-hooks/package.json': JSON.stringify({
    name: 'eslint-plugin-react-hooks',
    version: '7.1.1-test',
    main: 'index.js',
  }),
  'node_modules/eslint-plugin-react-hooks/index.js': `
    module.exports = {
      configs: {
        recommended: {
          rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
            'react-hooks/set-state-in-effect': 'error',
            'react-hooks/purity': 'error',
            'react-hooks/immutability': 'error',
            'react-hooks/globals': 'error',
            'react-hooks/refs': 'error',
            'react-hooks/preserve-manual-memoization': 'error',
            'react-hooks/incompatible-library': 'error',
          },
        },
      },
    };
  `,
  'node_modules/eslint-plugin-react-refresh/package.json': JSON.stringify({
    name: 'eslint-plugin-react-refresh',
    version: '0.0.0-test',
    main: 'index.js',
  }),
  'node_modules/eslint-plugin-react-refresh/index.js': `
    module.exports = { rules: {} };
  `,
};

function findRulesEntry(configArray) {
  return configArray.find((entry) => entry.rules)?.rules;
}

test('react() yields exactly the classic hooks pair (plus react-refresh), even when the installed plugin recommended config bundles React Compiler rules', async () => {
  await withFixture(REACT_HOOKS_V7_LIKE, () => {
    const rules = findRulesEntry(react());
    assert.ok(rules, 'expected a config entry with rules');

    assert.equal(rules['react-hooks/rules-of-hooks'], 'error');
    assert.equal(rules['react-hooks/exhaustive-deps'], 'error');
    assert.ok(
      Object.prototype.hasOwnProperty.call(rules, 'react-refresh/only-export-components'),
      'expected react-refresh/only-export-components to be present'
    );

    for (const compilerRule of COMPILER_RULE_NAMES) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(rules, compilerRule),
        false,
        `${compilerRule} must not be enabled by default`
      );
    }

    const hooksRuleNames = Object.keys(rules).filter((name) => name.startsWith('react-hooks/'));
    assert.deepEqual(
      hooksRuleNames.sort(),
      ['react-hooks/exhaustive-deps', 'react-hooks/rules-of-hooks'],
      'default react() must enable exactly the classic hooks pair, nothing else'
    );
  });
});

test('react({ compilerRules: true }) opts into the full recommended set, including a React Compiler rule', async () => {
  await withFixture(REACT_HOOKS_V7_LIKE, () => {
    const rules = findRulesEntry(react({ compilerRules: true }));
    assert.ok(rules, 'expected a config entry with rules');

    assert.equal(rules['react-hooks/rules-of-hooks'], 'error');
    assert.equal(rules['react-hooks/exhaustive-deps'], 'error');
    assert.equal(
      rules['react-hooks/set-state-in-effect'],
      'error',
      'compilerRules:true should spread in the plugin recommended set, which includes set-state-in-effect'
    );
  });
});
