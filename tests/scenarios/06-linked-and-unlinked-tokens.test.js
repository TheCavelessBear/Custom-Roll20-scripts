'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

// Evidence: ADR/SE/HPManager guard Beacon writes with token.get('represents');
// see the ownership registry's linked-versus-unlinked row descriptions.
test('fixture separates linked Beacon PC bars from unlinked NPC bar-only storage', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const pc = runtime.store.getObj('graphic', 'token-pc');
  const npc = runtime.store.getObj('graphic', 'token-npc');
  assert.equal(pc.get('represents'), 'char-pc');
  assert.equal(npc.get('represents'), '');
  const applyDamageToToken = runtime.global('applyDamageToToken');
  await applyDamageToToken(pc, 2);
  const writesAfterPc = runtime.beacon.writes.length;
  await applyDamageToToken(npc, 7);
  assert.equal(pc.get('bar2_value'), 3);
  assert.equal(npc.get('bar2_value'), 0);
  assert.equal(npc.get('bar1_value'), 8);
  assert.ok(writesAfterPc > 0, 'represented token mirrors Beacon values');
  assert.equal(runtime.beacon.writes.length, writesAfterPc, 'unlinked NPC path does not call Beacon');
});
