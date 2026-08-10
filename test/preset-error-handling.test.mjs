import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { astro, next } from '../index.cjs';

// astro.cjs and next.cjs deliberately resolve their consumer packages
// (eslint-plugin-astro / eslint-config-next) from process.cwd() — neither is
// a real dependency of this kit. These tests build throwaway
// node_modules/<pkg> fixtures under a temp directory and chdir into it for
// the duration of the assertion, so the resolution + config-selection logic
// can be exercised without adding either package as a real devDependency.

function makeFixtureDir(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-config-fixture-'));
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

// ---------------------------------------------------------------------------
// Finding 1 (astro.cjs): an explicit, unavailable `recommended` key must
// throw the descriptive error, not silently fall back to configs.recommended.
// ---------------------------------------------------------------------------

const ASTRO_PLUGIN_MODERN = {
  'node_modules/eslint-plugin-astro/package.json': JSON.stringify({
    name: 'eslint-plugin-astro',
    version: '0.0.0-test',
    main: 'index.js',
  }),
  'node_modules/eslint-plugin-astro/index.js': `
    module.exports = {
      configs: {
        recommended: [{ rules: { 'astro/no-set-html-directive': 'error' } }],
        'flat/recommended': [{ rules: { 'astro/no-set-html-directive': 'error' } }],
      },
    };
  `,
};

// Mimics an older eslint-plugin-astro release that only ships the generic
// "recommended" key, not "flat/recommended" — the case the fallback exists
// to support.
const ASTRO_PLUGIN_LEGACY_SHAPE = {
  'node_modules/eslint-plugin-astro/package.json': JSON.stringify({
    name: 'eslint-plugin-astro',
    version: '0.0.0-test',
    main: 'index.js',
  }),
  'node_modules/eslint-plugin-astro/index.js': `
    module.exports = {
      configs: {
        recommended: [{ rules: { 'astro/no-set-html-directive': 'error' } }],
      },
    };
  `,
};

test('astro({ recommended: <unknown key> }) throws instead of silently using configs.recommended', async () => {
  await withFixture(ASTRO_PLUGIN_MODERN, () => {
    assert.throws(
      () => astro({ recommended: 'flat/does-not-exist' }),
      /eslint-plugin-astro has no "flat\/does-not-exist" config/,
      'an explicit, unavailable key must throw the descriptive error, not fall back to configs.recommended'
    );
  });
});

test('astro({ recommended: "flat/recommended" }) throws when explicitly requested but unavailable, even though it matches the default string', async () => {
  await withFixture(ASTRO_PLUGIN_LEGACY_SHAPE, () => {
    assert.throws(
      () => astro({ recommended: 'flat/recommended' }),
      /eslint-plugin-astro has no "flat\/recommended" config/,
      'an explicitly-requested key is never treated as "omitted", even if it happens to equal the default'
    );
  });
});

test('astro() (omitted) and astro({ recommended: undefined }) still fall back to configs.recommended gracefully', async () => {
  await withFixture(ASTRO_PLUGIN_LEGACY_SHAPE, () => {
    const omitted = astro();
    const explicitUndefined = astro({ recommended: undefined });
    assert.ok(Array.isArray(omitted) && omitted.length > 0, 'astro() should fall back and return the legacy config');
    assert.deepEqual(explicitUndefined, omitted, 'explicit undefined must behave identically to omitted');
  });
});

test('astro({ recommended: "recommended" }) (explicit, available key) still resolves normally', async () => {
  await withFixture(ASTRO_PLUGIN_MODERN, () => {
    const result = astro({ recommended: 'recommended' });
    assert.ok(Array.isArray(result) && result.length > 0);
  });
});

// ---------------------------------------------------------------------------
// Finding 2 (next.cjs): a legacy-shaped native export must still take the
// FlatCompat bridge; a genuinely-throwing native load must propagate its
// ORIGINAL error, not an unrelated FlatCompat failure.
// ---------------------------------------------------------------------------

const NEXT_LEGACY_SHAPED = {
  'node_modules/eslint-config-next/package.json': JSON.stringify({
    name: 'eslint-config-next',
    version: '0.0.0-test',
    main: 'index.js',
  }),
  'node_modules/eslint-config-next/core-web-vitals.js': `
    module.exports = { rules: { 'no-console': 'warn' } };
  `,
};

const NATIVE_ERROR_MESSAGE = 'native core-web-vitals entry exploded during require() for testing';

const NEXT_NATIVE_LOAD_ERROR = {
  'node_modules/eslint-config-next/package.json': JSON.stringify({
    name: 'eslint-config-next',
    version: '0.0.0-test',
    main: 'index.js',
  }),
  'node_modules/eslint-config-next/core-web-vitals.js': `
    throw new Error(${JSON.stringify(NATIVE_ERROR_MESSAGE)});
  `,
};

test('next() bridges a legacy-shaped (non-array) native export via FlatCompat', async () => {
  await withFixture(NEXT_LEGACY_SHAPED, () => {
    const result = next();
    assert.ok(Array.isArray(result) && result.length > 0, 'the FlatCompat bridge should produce a non-empty flat-config array');
  });
});

test('next() propagates the ORIGINAL error when the native entry genuinely throws, instead of a wrapped FlatCompat failure', async () => {
  await withFixture(NEXT_NATIVE_LOAD_ERROR, () => {
    assert.throws(
      () => next(),
      (err) => {
        assert.equal(
          err.message,
          NATIVE_ERROR_MESSAGE,
          'the thrown error message must be exactly the original native error, not rewrapped'
        );
        assert.ok(
          !/Cannot read config file/.test(err.message),
          'the error must not carry the FlatCompat "Cannot read config file" wrapper'
        );
        return true;
      }
    );
  });
});
