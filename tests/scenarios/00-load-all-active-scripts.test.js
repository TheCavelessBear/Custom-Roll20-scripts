'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime, assertExposureTransition, assertOwnedBindings } = require('../harness/script-loader');
const manifest = require('../fixtures/active-script-manifest');

// Evidence: the 43-file order and documented APIs are the active inventory in
// Architecture/Command-and-API-Registry.md; source handlers are traced there.
test('all active scripts load in the documented installation order', async () => {
  const { runtime, outcomes } = await startedRuntime();
  assert.equal(outcomes.length, manifest.scripts.length);
  assert.deepEqual(outcomes.map((entry) => entry.file), manifest.scripts.map((entry) => entry.file));
  assert.equal(runtime.exceptions.length, 0);
  assert.equal(runtime.eventBus.exceptions.length, 0);
  assert.equal(runtime.eventBus.count('ready'), 40);
  assert.equal(runtime.eventBus.count('chat:message'), 43);
  assert.equal(runtime.eventBus.count('change:graphic:bar1_value'), 2);
  assert.equal(runtime.eventBus.count('change:campaign:turnorder'), 4);
  assert.ok(runtime.publicGlobals.has('ActionEconomyV2API'));
  assert.ok(runtime.eventBus.registrations.every((registration) => registration.source.endsWith('.js')));
});

test('per-script global contract rejects unknown additions and overwrites', () => {
  const entry = { file: 'Synthetic.js', ownedGlobals: ['Owned'], allowedOverwrites: ['Shared'] };
  const shared = {};
  assert.doesNotThrow(() => assertExposureTransition(entry, new Map([['Shared', shared]]), new Map([['Shared', {}], ['Owned', 1]])));
  assert.throws(() => assertExposureTransition(entry, new Map(), new Map([['Unknown', 1]])), /unexpected additions: Unknown/);
  assert.throws(() => assertExposureTransition(entry, new Map([['Protected', 1]]), new Map([['Protected', 2]])), /unexpected overwrites: Protected/);
});

test('lexical ownership rejects missing and preexisting bindings', () => {
  const missing = { file: 'Missing.js', ownedGlobals: ['Claimed'], allowedOverwrites: [] };
  assert.throws(() => assertOwnedBindings(missing, new Map([['Claimed', { exists: false }]]), new Map([['Claimed', { exists: false }]])), /did not expose/);
  const wrongOwner = { file: 'Wrong.js', ownedGlobals: ['Claimed'], allowedOverwrites: [] };
  assert.throws(() => assertOwnedBindings(wrongOwner, new Map([['Claimed', { exists: true, value: 1 }]]), new Map([['Claimed', { exists: true, value: 1 }]])), /already defined by an earlier script/);
});

test('controlled underscore reduce and defer preserve accumulator and capture failures', async () => {
  const { runtime } = await startedRuntime();
  const underscore = runtime.global('_');
  assert.equal(underscore.reduce([], (total, value) => total + value, 0), 0);
  assert.equal(underscore.reduce([1, 2], (total, value) => total + value, 10), 13);
  underscore.defer(() => { throw new Error('deferred failure'); });
  await assert.rejects(runtime.flushTimers(runtime.time), /deferred failure/);
  assert.equal(runtime.exceptions.at(-1).message, 'deferred failure');
});
