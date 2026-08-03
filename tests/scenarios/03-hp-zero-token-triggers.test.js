'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

// Evidence: TokenTriggers' only native threshold subscription is
// change:graphic:bar1_value, and handleBar1Change returns when represents is
// empty (TokenTriggers1.3.2.js:1400-1405).
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
// (TokenTriggers1.3.2.js:63-72, 861-904, 1444-1449, 1787-1801).
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

// Evidence: the active GM command route enables represented-character
// Relentless Endurance, and activateRelentlessEndurance changes only bar 1 to
// 1 on the first positive-to-zero transition (TokenTriggers1.3.2.js:1248-1271,
// 1910-1922, 2172-2229).
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
