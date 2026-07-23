import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ESLint } from 'eslint';

import {
  base,
  maxLines,
  astro,
  react,
  next,
  node,
  tests,
  strict,
  layerBoundary,
  exemptFilesFromRule,
} from '../index.cjs';

const require = createRequire(import.meta.url);
const kit = require('../index.cjs');

const PRESET_NAMES = ['base', 'maxLines', 'astro', 'react', 'next', 'node', 'tests', 'strict'];
const esmPresets = { base, maxLines, astro, react, next, node, tests, strict };
const SIMPLE_PRESETS = ['base', 'maxLines', 'react', 'node', 'tests', 'strict'];

function assertValidFlatConfigArray(configArray, label) {
  assert.ok(Array.isArray(configArray), `${label} should return an Array`);
  for (const [i, entry] of configArray.entries()) {
    assert.equal(typeof entry, 'object', `${label}[${i}] should be a plain object`);
    assert.notEqual(entry, null, `${label}[${i}] should not be null`);
    assert.equal(Array.isArray(entry), false, `${label}[${i}] should not itself be an array`);
  }
}

test('CJS require: index.cjs exposes all named exports', () => {
  for (const name of [...PRESET_NAMES, 'layerBoundary', 'exemptFilesFromRule']) {
    assert.equal(typeof kit[name], 'function', `kit.${name} should be a function`);
  }
});

test('ESM import: index.cjs exposes all named exports', () => {
  for (const name of PRESET_NAMES) {
    assert.equal(typeof esmPresets[name], 'function', `named import ${name} should be a function`);
  }
  assert.equal(typeof layerBoundary, 'function');
  assert.equal(typeof exemptFilesFromRule, 'function');
});

test('each preset (except next) is a function returning a valid flat-config array under require()', () => {
  for (const name of SIMPLE_PRESETS) {
    const preset = kit[name];
    assert.equal(typeof preset, 'function', `${name} should be a function`);
    const configArray = preset();
    assertValidFlatConfigArray(configArray, `require('${name}')()`);
  }
});

test('each preset (except next) is a function returning a valid flat-config array under import', () => {
  for (const name of SIMPLE_PRESETS) {
    const preset = esmPresets[name];
    assert.equal(typeof preset, 'function', `${name} should be a function`);
    const configArray = preset();
    assertValidFlatConfigArray(configArray, `import { ${name} }()`);
  }
});

test('astro() is a function (not exercised — eslint-plugin-astro is not installed here)', () => {
  assert.equal(typeof kit.astro, 'function');
  assert.equal(typeof astro, 'function');
  assert.throws(() => astro(), /requires eslint-plugin-astro/);
});

test('next() is a function (not exercised — eslint-config-next is not installed here)', () => {
  assert.equal(typeof kit.next, 'function');
  assert.equal(typeof next, 'function');
});

test('base() contains the shared max-lines rule', () => {
  const configArray = base();
  const withMaxLines = configArray.find(
    (entry) => entry.rules && Object.prototype.hasOwnProperty.call(entry.rules, 'max-lines')
  );
  assert.ok(withMaxLines, 'expected a config entry with a max-lines rule');
  assert.deepEqual(withMaxLines.rules['max-lines'], [
    'error',
    { max: 500, skipBlankLines: true, skipComments: true },
  ]);
});

test('base({ anySeverity: "warn" }) sets no-explicit-any to warn', () => {
  const configArray = base({ anySeverity: 'warn' });
  // Multiple entries touch this rule (tseslint's own recommended config sets it too);
  // flat-config resolves last-match-wins, so assert on the LAST entry that sets it —
  // the kit's own conventions block.
  const settingBlocks = configArray.filter(
    (entry) =>
      entry.rules &&
      Object.prototype.hasOwnProperty.call(entry.rules, '@typescript-eslint/no-explicit-any')
  );
  assert.ok(settingBlocks.length > 0, 'expected a block setting no-explicit-any');
  const last = settingBlocks[settingBlocks.length - 1];
  assert.equal(last.rules['@typescript-eslint/no-explicit-any'], 'warn');
});

test('node({ toolingGlobs: [] }) emits no empty-files block (valid flat config)', () => {
  const cfg = node({ toolingGlobs: [] });
  for (const entry of cfg) {
    assert.notEqual(
      Array.isArray(entry.files) && entry.files.length === 0,
      true,
      'node() must not emit a config with an empty files array'
    );
  }
  // still provides node globals
  assert.ok(cfg.some((e) => e.languageOptions && e.languageOptions.globals));
  // default still includes the tooling carve-out
  assert.ok(node().some((e) => Array.isArray(e.files) && e.files.length > 0));
});

test('maxLines() yields the shared 500-line rule, and base() sources the same value', () => {
  const findRule = (arr) =>
    arr.find((e) => e.rules && Object.prototype.hasOwnProperty.call(e.rules, 'max-lines'))?.rules[
      'max-lines'
    ];
  const expected = ['error', { max: 500, skipBlankLines: true, skipComments: true }];
  assert.deepEqual(findRule(maxLines()), expected);
  assert.deepEqual(findRule(base()), expected, 'base() must source max-lines from maxLines()');
  // custom max is honoured
  const [, opts] = findRule(maxLines({ max: 300 }));
  assert.equal(opts.max, 300);
});

test('react({ allowExportNames: ["useX"] }) forwards allowExportNames', () => {
  const configArray = react({ allowExportNames: ['useX'] });
  const withRefreshRule = configArray.find(
    (entry) =>
      entry.rules &&
      Object.prototype.hasOwnProperty.call(entry.rules, 'react-refresh/only-export-components')
  );
  assert.ok(withRefreshRule, 'expected a config entry with react-refresh/only-export-components');
  const [, ruleOptions] = withRefreshRule.rules['react-refresh/only-export-components'];
  assert.ok(ruleOptions.allowExportNames.includes('useX'));
});

// "Is an array of plain objects" (assertValidFlatConfigArray, above) doesn't
// catch plugin-registration bugs — a config with a dangling rule reference to
// an unregistered plugin is still a valid-looking array, and even
// `calculateConfigForFile` resolves happily without ever loading the rule
// implementations. Only actually linting text (which forces ESLint to look up
// every configured rule against its registered plugins) surfaces a
// "Could not find plugin" / "Definition for rule ... was not found" error.
// The target file path must match a `files` pattern the preset actually
// scopes its rules to (or ESLint's default JS-only matching silently skips
// the file and the check would pass even with the plugin missing).
async function assertConfigLoads(configArray, filePath, label) {
  const eslint = new ESLint({
    cwd: process.cwd(),
    overrideConfigFile: true,
    overrideConfig: configArray,
  });
  await assert.doesNotReject(
    () => eslint.lintText('const unused = 1;\n', { filePath }),
    `${label}: expected ESLint to lint ${filePath} without throwing`
  );
}

test('base() loads through the ESLint API', async () => {
  await assertConfigLoads(base(), 'src/example.ts', 'base()');
});

test('react() loads through the ESLint API (plugins present as devDeps)', async () => {
  await assertConfigLoads(react(), 'src/Example.tsx', 'react()');
});

test('node() loads through the ESLint API', async () => {
  await assertConfigLoads(node(), 'src/example.js', 'node()');
});

test('tests() loads through the ESLint API', async () => {
  await assertConfigLoads([...base(), ...tests()], 'src/example.test.ts', 'tests()');
});

test('strict() loads through the ESLint API standalone (self-registers its plugin)', async () => {
  await assertConfigLoads(strict(), 'src/example.js', 'strict()');
});

test('composed base()+react()+node()+tests() loads through the ESLint API', async () => {
  const composed = [...base(), ...react(), ...node(), ...tests()];
  await assertConfigLoads(composed, 'src/Example.tsx', 'base()+react()+node()+tests()');
});

test('layerBoundary(...) yields a no-restricted-imports error rule', () => {
  const configArray = layerBoundary({ files: ['a'], patterns: ['b'], message: 'm' });
  assertValidFlatConfigArray(configArray, 'layerBoundary(...)');
  const [entry] = configArray;
  assert.deepEqual(entry.files, ['a']);
  const [severity, options] = entry.rules['no-restricted-imports'];
  assert.equal(severity, 'error');
  assert.deepEqual(options.patterns, [{ group: ['b'], message: 'm' }]);
});

test('exemptFilesFromRule(...) turns the given rule off for the given files', () => {
  const configArray = exemptFilesFromRule('no-console', ['x.ts']);
  assertValidFlatConfigArray(configArray, 'exemptFilesFromRule(...)');
  const [entry] = configArray;
  assert.deepEqual(entry.files, ['x.ts']);
  assert.equal(entry.rules['no-console'], 'off');
});
