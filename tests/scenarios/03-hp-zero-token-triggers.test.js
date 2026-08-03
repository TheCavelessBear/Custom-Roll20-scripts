'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

// Evidence: TokenTriggers' only native threshold subscription is
// change:graphic:bar1_value, and handleBar1Change returns when represents is
// empty (TokenTriggers1.3.3.js:1461-1471).
test('TokenTriggers listens to bar 1 and ignores an unrepresented generic NPC', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const npc = runtime.store.getObj('graphic', 'token-enemy');
  const before = { ...npc.toJSON() };
  npc.set('bar1_value', 0);
  await runtime.emit('change:graphic:bar1_value', npc, before);
  assert.equal(runtime.eventBus.count('change:graphic:bar1_value'), 2);
  assert.equal(runtime.context.state.TokenTriggers.tokens['token-enemy'], undefined);
  assert.equal(npc.get('bar1_value'), 0);
});

// Evidence: `!tokentrigger enable TOKEN_ID` creates/enables the represented
// character's ordinary HP-zero config. A positive Bar 1 -> 0 transition stores
// active presentation state and schedules Bar 1 clearing
// (TokenTriggers1.3.3.js:66-75, 861-904, 1403-1450, 1843-1857).
test('configured represented token activates ordinary HP-zero presentation', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const token = runtime.store.getObj('graphic', 'token-pc');
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!tokentrigger enable token-pc' });
  assert.equal(runtime.global('TokenTriggers').getHpZeroConfig('char-pc').enabled, true);
  assert.equal(runtime.global('TokenTriggers').getRelentlessEnduranceConfig('char-pc'), null);

  const beforeHp = { ...token.toJSON() };
  token.set('bar1_value', 0);
  await runtime.emit('change:graphic:bar1_value', token, beforeHp);
  const hpZero = runtime.context.state.TokenTriggers.tokens['token-pc'].hpZero;
  assert.equal(hpZero.active, true);
  assert.equal(hpZero.originalBar1Value, 0);
  assert.equal(hpZero.originalBar1Max, 20);
  assert.equal(token.get('currentSide'), 1);
  await runtime.flushTimers(runtime.time);
  assert.equal(hpZero.bar1Cleared, true);
  assert.equal(token.get('bar1_value'), '');
  assert.equal(token.get('bar1_max'), '');

  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!tokentrigger restore token-pc' });
  assert.equal(runtime.context.state.TokenTriggers.tokens['token-pc'], undefined);
  assert.equal(token.get('currentSide'), 0);
  assert.equal(token.get('bar1_value'), 0);
  assert.equal(token.get('bar1_max'), 20);
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!hp set token-pc full HP Zero Reset' });
  assert.equal(token.get('bar1_value'), 20);
});

// Evidence: active HP-zero recovery in TokenTriggers1.3.3 intentionally runs
// before an invalid old-HP rejection because its own defeated presentation
// clears Bar 1, making the next positive transition's previous value blank.
test('blank-to-positive Bar 1 change recovers active HP-zero presentation', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const token = runtime.store.getObj('graphic', 'token-pc');
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!tokentrigger enable token-pc' });

  const beforeHp = { ...token.toJSON() };
  token.set('bar1_value', 0);
  await runtime.emit('change:graphic:bar1_value', token, beforeHp);
  await runtime.flushTimers(runtime.time);
  assert.equal(token.get('bar1_value'), '');

  const beforeRecovery = { ...token.toJSON() };
  token.set('bar1_value', 5);
  await runtime.emit('change:graphic:bar1_value', token, beforeRecovery);

  assert.equal(token.get('bar1_value'), 5);
  assert.equal(token.get('bar1_max'), 20);
  assert.equal(token.get('currentSide'), 0);
  assert.equal(runtime.context.state.TokenTriggers.tokens['token-pc'], undefined);
});

// Evidence: outside active HP-zero recovery, TokenTriggers1.3.3 preserves the
// prior native handler's invalid-old-HP boundary before ordinary Bloodied or
// Relentless processing.
test('blank previous HP does not create an ordinary Bloodied transition', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const token = runtime.store.getObj('graphic', 'token-pc');
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!tokentrigger bloodiedenable token-pc' });

  const beforeHp = { ...token.toJSON(), bar1_value: '' };
  token.set('bar1_value', 5);
  await runtime.emit('change:graphic:bar1_value', token, beforeHp);

  assert.equal(runtime.context.state.TokenTriggers.tokens['token-pc'], undefined);
  assert.equal(runtime.chat.messages.some((message) => message.content.includes('Bloodied: Bloodied Trigger Ready')), false);
});

// Evidence: the active GM command route enables represented-character
// Relentless Endurance, and activateRelentlessEndurance changes only bar 1 to
// 1 on the first positive-to-zero transition (TokenTriggers1.3.3.js:1252-1273,
// 1966-1978, 2228-2285).
test('configured represented token uses Bar 1 Relentless Endurance transition', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const token = runtime.store.getObj('graphic', 'token-pc');
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!tokentrigger relentlessenable token-pc' });
  assert.equal(runtime.global('TokenTriggers').getRelentlessEnduranceConfig('char-pc').enabled, true);

  const beforeTemp = { ...token.toJSON() };
  token.set('bar2_value', 0);
  await runtime.emit('change:graphic:bar2_value', token, beforeTemp);
  assert.equal(token.get('bar1_value'), 10, 'Bar 2 changes do not trigger Relentless Endurance');
  assert.equal(runtime.context.state.TokenTriggers.tokens['token-pc'], undefined);

  const beforeHp = { ...token.toJSON() };
  token.set('bar1_value', 0);
  await runtime.emit('change:graphic:bar1_value', token, beforeHp);
  assert.equal(token.get('bar1_value'), 1);
  assert.equal(runtime.context.state.TokenTriggers.tokens['token-pc'].relentlessEndurance.usedThisCombat, true);
  assert.ok(runtime.chat.messages.some((message) => message.content.includes('Reduced to 1 HP instead of falling.')));
});

// Evidence: TokenTriggers1.3.3 routes its public processBar1Change hook and
// native Bar 1 listener through one short-lived transition record. The hook
// returns the final Bar 1 value after TokenTriggers-owned processing.
test('direct hook first and native event second process one Relentless transition', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const token = runtime.store.getObj('graphic', 'token-pc');
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!tokentrigger relentlessenable token-pc' });

  const beforeHp = { ...token.toJSON() };
  token.set('bar1_value', 0);
  const resolved = runtime.global('TokenTriggersAPI').processBar1Change(token, 10, 0);
  await runtime.emit('change:graphic:bar1_value', token, beforeHp);

  assert.equal(resolved, 1);
  assert.equal(token.get('bar1_value'), 1);
  assert.equal(runtime.chat.messages.filter((message) => message.content.includes('Reduced to 1 HP instead of falling.')).length, 1);
});

// Evidence: the same TokenTriggers-owned transition record supports the
// opposite ordering when Roll20 delivers the native event before the caller's
// explicit compatibility hook.
test('native event first and direct hook second process one Relentless transition', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const token = runtime.store.getObj('graphic', 'token-pc');
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!tokentrigger relentlessenable token-pc' });

  const beforeHp = { ...token.toJSON() };
  token.set('bar1_value', 0);
  await runtime.emit('change:graphic:bar1_value', token, beforeHp);
  const resolved = runtime.global('TokenTriggersAPI').processBar1Change(token, 10, 0);

  assert.equal(resolved, 1);
  assert.equal(token.get('bar1_value'), 1);
  assert.equal(runtime.chat.messages.filter((message) => message.content.includes('Reduced to 1 HP instead of falling.')).length, 1);
});

// Evidence: TokenTriggers1.3.3 preserves the native handler's represented-
// character boundary for the public compatibility API.
test('direct hook ignores an unrepresented generic NPC and returns requested HP', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const npc = runtime.store.getObj('graphic', 'token-enemy');
  const originalHp = npc.get('bar1_value');
  const resolved = runtime.global('TokenTriggersAPI').processBar1Change(npc, 10, 0);

  assert.equal(resolved, 0);
  assert.equal(npc.get('bar1_value'), originalHp);
  assert.equal(runtime.context.state.TokenTriggers.tokens['token-enemy'], undefined);
});
