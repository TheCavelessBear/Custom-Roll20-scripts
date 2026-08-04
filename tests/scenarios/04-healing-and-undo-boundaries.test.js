'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

// Evidence: HPManager handleHeal/applyHealing writes bar 1 and Beacon hp only
// (HPManager1.1.1.js); it does not call AE damage processing.
test('HPManager healing caps HP and does not invoke AE damage processing', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const token = runtime.store.getObj('graphic', 'token-pc');
  token.set('bar1_value', 18);
  const ae = runtime.global('ActionEconomyV2API');
  const original = ae.processDamageResult;
  const calls = [];
  ae.processDamageResult = (...args) => { calls.push(args); return original(...args); };
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!hp heal token-pc 10 Harness Healing' });
  await Promise.resolve();
  assert.equal(token.get('bar1_value'), 20);
  assert.ok(runtime.beacon.writes.some((write) => write.characterId === 'char-pc' && write.name === 'hp' && write.value === 20));
  assert.equal(calls.length, 0);
});

// Evidence: ADR stores the pre-damage bar snapshot and `!adr undo` restores
// bars plus represented Beacon current/max HP and temp HP
// (AttackDamageResolver1.3.1.js).
test('ADR undo restores owned bars and represented Beacon values', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const token = runtime.store.getObj('graphic', 'token-pc');
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!adr attack token-ally token-pc' });
  runtime.global('cacheDefaultTemplateDamageRoll')({ type: 'general', playerid: 'GM', content: '&{template:default} {{name=Undo Damage}}{{Damage Type=Fire}}{{Damage=$[[0]]}}', inlinerolls: [{ results: { total: 7 } }] });
  await runtime.global('applyCachedDamage')({ playerid: 'GM' }, ['!adr', 'apply', 'token-pc', 'Fire', 'Undo', 'Damage']);
  assert.equal(token.get('bar1_value'), 8);
  assert.equal(token.get('bar2_value'), 0);
  assert.ok(runtime.context.state.AttackDamageResolver.lastDamageUndo);
  assert.equal(runtime.context.state.AttackDamageResolver.lastDamageUndo.bar1After, 8);

  runtime.beacon.writes.length = 0;
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!adr undo' });
  await Promise.resolve();
  assert.equal(token.get('bar1_value'), 10);
  assert.equal(token.get('bar1_max'), 20);
  assert.equal(token.get('bar2_value'), 5);
  assert.equal(token.get('bar2_max'), 5);
  assert.equal(runtime.context.state.AttackDamageResolver.lastDamageUndo, undefined);
  assert.deepEqual(runtime.beacon.writes.map(({ name, value, valueType }) => ({ name, value, valueType })), [
    { name: 'hp', value: 10, valueType: 'current' }, { name: 'hp', value: 20, valueType: 'max' },
    { name: 'hp_temp', value: 5, valueType: 'current' }, { name: 'hp_temp', value: 5, valueType: 'max' }
  ]);
});
