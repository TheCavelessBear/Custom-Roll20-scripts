'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

// Evidence: ADR applyDamageToToken (AttackDamageResolver1.3.1.js) consumes
// bar 2 before bar 1, resolves Bar 1 through TokenTriggers, then mirrors the
// final resolved value to represented-token Beacon HP.
test('ADR consumes temporary HP before HP for a represented Beacon token', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const token = runtime.store.getObj('graphic', 'token-pc');
  const applyDamageToToken = runtime.global('applyDamageToToken');
  const tokenTriggers = runtime.global('TokenTriggersAPI');
  const original = tokenTriggers.processBar1Change;
  const calls = [];
  tokenTriggers.processBar1Change = (...args) => { calls.push(args); return original(...args); };
  const undo = await applyDamageToToken(token, 7);
  assert.equal(token.get('bar2_value'), 0);
  assert.equal(token.get('bar1_value'), 8);
  assert.equal(undo.targetId, 'token-pc');
  assert.equal(undo.amount, 7);
  assert.equal(undo.bar1Value, 10);
  assert.equal(undo.bar2Value, 5);
  assert.equal(undo.bar1After, 8);
  assert.deepEqual(calls.map(([, oldHp, newHp]) => [oldHp, newHp]), [[10, 8]]);
  assert.deepEqual(runtime.beacon.writes.map(({ name, value }) => ({ name, value })), [{ name: 'hp_temp', value: 0 }, { name: 'hp', value: 8 }]);
});

test('ADR preserves TokenTriggers resolved Relentless HP in Bar 1, Beacon, and undo data', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const token = runtime.store.getObj('graphic', 'token-pc');
  token.set({ bar1_value: 10, bar2_value: 0, bar2_max: 0 });
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!tokentrigger relentlessenable token-pc' });
  runtime.beacon.writes.length = 0;

  const undo = await runtime.global('applyDamageToToken')(token, 10);

  assert.equal(token.get('bar1_value'), 1);
  assert.equal(undo.bar1Value, 10);
  assert.equal(undo.bar1After, 1);
  assert.deepEqual(runtime.beacon.writes.map(({ name, value }) => ({ name, value })), [{ name: 'hp', value: 1 }]);
  assert.equal(runtime.context.state.TokenTriggers.tokens['token-pc'].relentlessEndurance.usedThisCombat, true);

  runtime.context.state.AttackDamageResolver.lastDamageUndo = undo;
  runtime.beacon.writes.length = 0;
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!adr undo' });
  assert.equal(token.get('bar1_value'), 10);
  assert.ok(runtime.beacon.writes.some((write) => write.name === 'hp' && write.value === 10));
});

// Evidence: ADR only explicitly calls AE processDamageResult on a positive-to-
// zero HP transition (AttackDamageResolver1.3.1.js). This is not a
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
  assert.equal(typeof runtime.global('TokenTriggersAPI').processBar1Change, 'function');
});
