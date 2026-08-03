'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');
const manifest = require('../fixtures/active-script-manifest');

// Evidence: active exports are enumerated in Architecture/Command-and-API-Registry.md.
test('documented public APIs are exposed and TokenTriggersAPI remains absent', async () => {
  const { runtime } = await startedRuntime();
  for (const contract of manifest.publicApis) assert.ok(runtime.global(contract.global), `${contract.global} should exist`);
  assert.ok(runtime.global('TokenTriggers'));
  assert.equal(runtime.global('TokenTriggersAPI'), undefined, 'do not mask the ADR/SE TokenTriggersAPI mismatch');
});
