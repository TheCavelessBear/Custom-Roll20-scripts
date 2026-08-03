'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

// Evidence: ADR applyDamageToToken (AttackDamageResolver1.3.js:1420-1466)
// consumes bar 2 before bar 1 and mirrors represented-token Beacon values.
test('ADR consumes temporary HP before HP for a represented Beacon token', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const token = runtime.store.getObj('graphic', 'token-pc');
  const applyDamageToToken = runtime.global('applyDamageToToken');
  const undo = await applyDamageToToken(token, 7);
  assert.equal(token.get('bar2_value'), 0);
  assert.equal(token.get('bar1_value'), 8);
  assert.equal(undo.targetId, 'token-pc');
  assert.equal(undo.amount, 7);
  assert.equal(undo.bar1Value, 10);
  assert.equal(undo.bar2Value, 5);
  assert.deepEqual(runtime.beacon.writes.map(({ name, value }) => ({ name, value })), [{ name: 'hp_temp', value: 0 }, { name: 'hp', value: 8 }]);
});

// Evidence: ADR only explicitly calls AE processDamageResult on a positive-to-
// zero HP transition (AttackDamageResolver1.3.js:1305-1315). This is not a
// proof of live Roll20 native-event deduplication.
test('ADR makes one explicit AE handoff for a lethal cached-damage application', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const target = runtime.store.getObj('graphic', 'token-pc');
  target.set({ bar1_value: 3, bar2_value: 0, bar2_max: 0 });
  const ae = runtime.global('ActionEconomyV2API');
  const original = ae.processDamageResult;
  const calls = [];
  ae.processDamageResult = (...args) => { calls.push(args); return original(...args); };
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!adr attack token-ally token-pc' });
  // This calls ADR's active cache parser directly; selected/target/template
  // expansion is deliberately not emulated by the local harness.
  runtime.global('cacheDefaultTemplateDamageRoll')({ type: 'general', playerid: 'GM', content: '&{template:default} {{name=Harness Damage}}{{Damage Type=Fire}}{{Damage=$[[0]]}}', inlinerolls: [{ results: { total: 3 } }] });
  await runtime.global('applyCachedDamage')({ playerid: 'GM' }, ['!adr', 'apply', 'token-pc', 'Fire', 'Harness', 'Damage']);
  assert.equal(target.get('bar1_value'), 0);
  assert.equal(calls.length, 1);
  assert.deepEqual([...calls[0]], ['token-ally', 'token-pc', 3, 0]);
  assert.equal(runtime.global('TokenTriggersAPI'), undefined);
});
