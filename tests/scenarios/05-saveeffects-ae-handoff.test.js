'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

// Evidence: SaveEffects owns save damage and schedules AE only after an
// hp-positive-to-zero result (SaveEffects1.3.1.js).
test('SaveEffects damage helper retains save ownership and schedules AE only for lethal result', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const target = runtime.store.getObj('graphic', 'token-pc');
  target.set({ bar1_value: 2, bar2_value: 5 });
  const apply = runtime.global('seApplyDamageToToken');
  const tokenTriggers = runtime.global('TokenTriggersAPI');
  const originalTokenTriggers = tokenTriggers.processBar1Change;
  const tokenTriggerCalls = [];
  tokenTriggers.processBar1Change = (...args) => { tokenTriggerCalls.push(args); return originalTokenTriggers(...args); };
  const notify = runtime.global('safelyNotifyAeDamageResult');
  const result = await apply(target, 7);
  const ae = runtime.global('ActionEconomyV2API');
  const original = ae.processDamageResult;
  const calls = [];
  ae.processDamageResult = (...args) => { calls.push(args); return original(...args); };
  notify('token-ally', 'token-pc', result.hpBefore, result.hpAfter);
  await runtime.advanceBy(0);
  assert.equal(result.hpBefore, 2);
  assert.equal(result.hpAfter, 0);
  assert.equal(result.tempBefore, 5);
  assert.equal(result.tempAfter, 0);
  assert.deepEqual(tokenTriggerCalls.map(([, oldHp, newHp]) => [oldHp, newHp]), [[2, 0]]);
  assert.deepEqual(calls, [['token-ally', 'token-pc', 2, 0]]);
  assert.ok(runtime.context.state.SaveEffects, 'SaveEffects retains its own state namespace');
  assert.equal(Object.hasOwn(runtime.context.state.SaveEffects, 'conditions'), false, 'SaveEffects did not claim AE condition ownership');
});

test('SaveEffects persists TokenTriggers resolved Relentless HP to Bar 1 and Beacon', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const target = runtime.store.getObj('graphic', 'token-pc');
  target.set({ bar1_value: 4, bar2_value: 0, bar2_max: 0 });
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!tokentrigger relentlessenable token-pc' });
  runtime.beacon.writes.length = 0;

  const result = await runtime.global('seApplyDamageToToken')(target, 4);

  assert.equal(result.hpAfter, 1);
  assert.equal(target.get('bar1_value'), 1);
  assert.deepEqual(runtime.beacon.writes.map(({ name, value }) => ({ name, value })), [{ name: 'hp', value: 1 }]);
  assert.equal(runtime.context.state.TokenTriggers.tokens['token-pc'].relentlessEndurance.usedThisCombat, true);
});

// Evidence: SaveEffects1.3.1 schedules (but does not await) the AE lethal
// handoff. AE 2.8.3 must therefore contain Dark One's Blessing async failures.
test("SaveEffects lethal handoff contains Dark One's Blessing Beacon write failures", async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const source = runtime.store.getObj('graphic', 'token-pc');
  const dead = runtime.store.getObj('graphic', 'token-enemy');
  runtime.context.state.ActionEconomyV2.features['char-pc'] = { darkonesblessing: true };
  await runtime.beacon.setSheetItem('char-pc', 'level', 7);
  await runtime.beacon.setSheetItem('char-pc', 'charisma_mod', 4);
  const originalSetSheetItem = runtime.beacon.setSheetItem.bind(runtime.beacon);
  runtime.beacon.setSheetItem = async (characterId, name, value, valueType) => {
    if (characterId === 'char-pc' && name === 'hp_temp') throw new Error('simulated Beacon write failure');
    return originalSetSheetItem(characterId, name, value, valueType);
  };

  runtime.global('ActionEconomyV2API').recordDamageSource(source.id, dead.id);
  runtime.global('safelyNotifyAeDamageResult')(source.id, dead.id, 8, 0);
  await runtime.advanceBy(0);
  for (let index = 0; index < 20; index += 1) await Promise.resolve();

  assert.equal(runtime.exceptions.length, 0);
  assert.equal(runtime.eventBus.exceptions.length, 0);
  assert.ok(runtime.logs.some((entry) => entry.join(' ').includes("Dark One’s Blessing failed")));
  assert.equal(runtime.chat.messages.filter((entry) => entry.content.includes("Dark One’s Blessing could not be applied")).length, 1);
});
