'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

// Evidence: SaveEffects owns save damage and schedules AE only after an
// hp-positive-to-zero result (SaveEffects1.3.js:1134-1150, 1267-1322).
test('SaveEffects damage helper retains save ownership and schedules AE only for lethal result', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const target = runtime.store.getObj('graphic', 'token-pc');
  target.set({ bar1_value: 2, bar2_value: 5 });
  const apply = runtime.global('seApplyDamageToToken');
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
  assert.deepEqual(calls, [['token-ally', 'token-pc', 2, 0]]);
  assert.ok(runtime.context.state.SaveEffects, 'SaveEffects retains its own state namespace');
  assert.equal(Object.hasOwn(runtime.context.state.SaveEffects, 'conditions'), false, 'SaveEffects did not claim AE condition ownership');
});
