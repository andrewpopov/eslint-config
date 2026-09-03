#!/usr/bin/env node
/**
 * Consumer-side release smoke test.
 *
 * Packs the package exactly as `npm publish` / a `github:` install would expose
 * it, installs the tarball into a throwaway project, and requires it the way a
 * consumer does. Catches the failure class that unit tests miss: a preset or
 * factory left out of `files`, a broken `main`, or a dependency that only
 * resolves inside the source tree.
 *
 * Modelled on db-backup's scripts/verify-pack.mjs (same no-build, CJS-with-
 * dual-export-map shape). Run locally with `npm run verify:pack`.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const repoRoot = process.cwd();
const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));

// The preset/factory surface consumers actually import (index.cjs's
// module.exports keys). A preset missing from `files` still requires fine
// from the source tree, so only a packed-tarball install catches it.
const EXPECTED = [
  'base',
  'maxLines',
  'astro',
  'react',
  'next',
  'node',
  'tests',
  'strict',
  'layerBoundary',
  'exemptFilesFromRule',
];

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8', ...opts });
}

const scratch = mkdtempSync(join(tmpdir(), 'verify-pack-'));
let tarballPath;
let failed = false;
try {
  // 1. Pack the tarball the way a publish/github install would.
  const packJson = run('npm', ['pack', '--json'], { cwd: repoRoot });
  const tarball = JSON.parse(packJson)[0].filename;
  tarballPath = join(repoRoot, tarball);
  console.log(`[verify-pack] packed ${tarball}`);

  // 2. Install it into a throwaway consumer project.
  writeFileSync(
    join(scratch, 'package.json'),
    JSON.stringify({ name: 'verify-pack-consumer', version: '0.0.0', private: true }, null, 2),
  );
  console.log(`[verify-pack] installing tarball into ${scratch}`);
  run('npm', ['install', '--no-audit', '--no-fund', tarballPath], { cwd: scratch });

  // 3. Require it as a consumer would and assert every preset/factory resolves.
  //    (Peer-dep-only requires like eslint-plugin-react-hooks live INSIDE
  //    react()/astro(), not at module load, so this stays peer-dep-free.)
  const cjsSmoke = `
    const t = require('${pkg.name}');
    const expected = ${JSON.stringify(EXPECTED)};
    const missing = expected.filter((k) => typeof t[k] !== 'function');
    if (missing.length) { throw new Error('missing exports: ' + missing.join(', ')); }
    console.log('[verify-pack] exports OK: ' + expected.join(', '));
  `;
  run('node', ['-e', cjsSmoke], { cwd: scratch, stdio: 'inherit' });

  // 3b. Require it the way an ESM consumer does: `import { x } from pkg`. This
  //     exercises Node's cjs-module-lexer, which only detects named exports in
  //     identifier/shorthand form — a `key: obj.fn` export is invisible here
  //     even though CJS `require` sees it. Catches the ESM/CJS interop gap.
  const esmSmoke = `
    import * as ns from '${pkg.name}';
    const expected = ${JSON.stringify(EXPECTED)};
    const missing = expected.filter((k) => typeof ns[k] !== 'function');
    if (missing.length) { throw new Error('missing ESM named exports: ' + missing.join(', ')); }
    console.log('[verify-pack] ESM named exports OK');
  `;
  writeFileSync(join(scratch, 'esm-smoke.mjs'), esmSmoke);
  run('node', [join(scratch, 'esm-smoke.mjs')], { cwd: scratch, stdio: 'inherit' });

  console.log('[verify-pack] PASS');
} catch (err) {
  failed = true;
  console.error('[verify-pack] FAIL:', err.message);
} finally {
  rmSync(scratch, { recursive: true, force: true });
  if (tarballPath) rmSync(tarballPath, { force: true });
}

process.exit(failed ? 1 : 0);
