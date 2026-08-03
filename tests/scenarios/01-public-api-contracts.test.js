'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');
const manifest = require('../fixtures/active-script-manifest');

// Evidence: active exports are enumerated in Architecture/Command-and-API-Registry.md.
test('documented public APIs, including the TokenTriggers integration hook, are exposed', async () => {
  const { runtime } = await startedRuntime();
  for (const contract of manifest.publicApis) assert.ok(runtime.global(contract.global), `${contract.global} should exist`);
  assert.ok(runtime.global('TokenTriggers'));
  assert.equal(typeof runtime.global('TokenTriggersAPI').processBar1Change, 'function');
});
