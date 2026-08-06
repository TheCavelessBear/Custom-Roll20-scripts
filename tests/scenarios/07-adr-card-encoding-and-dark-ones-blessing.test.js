'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

const malformedMarkers = /(?:â|Â|ï¿½|�)/;
const assertCleanCard = (message) => {
  assert.match(message, /&\{template:default\}/);
  assert.doesNotMatch(message, malformedMarkers);
};

// Evidence: AttackDamageResolver1.3.2.js escapes component values before
// composing Roll20 template markup; literal <br> separators remain markup.
test('ADR card strings escape dynamic values and contain no committed mojibake', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const attacker = runtime.store.getObj('graphic', 'token-ally');
  const target = runtime.store.getObj('graphic', 'token-pc');
  attacker.set('name', "Aster's & {Guide|@<>");
  target.set('name', "Bram's & {Target|@<>");
  const ae = runtime.global('ActionEconomyV2API');
  ae.getAttackRollModifiers = () => ({ advantage: true, penaltyDice: [{ dice: '1d4', label: 'Fog & {Mist|@<>' }], notes: ['Fire Shield — Warm & {note|@<>'] });

  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!adr attack token-ally token-pc' });
  const guidance = runtime.chat.messages.at(-1).content;
  assertCleanCard(guidance);
  assert.match(guidance, /Aster's &amp; &#123;Guide&#124;&#64;&lt;&gt;/);
  assert.match(guidance, /Fire Shield — Warm &amp; &#123;note&#124;&#64;&lt;&gt;/);

  runtime.global('cacheDefaultTemplateDamageRoll')({
    type: 'general', playerid: 'GM',
    content: '&{template:default} {{name=Blade &amp; {One|@<>}}{{Damage Type=Fire &amp; {Type|@<>}}{{Damage=$[[0]]}}',
    inlinerolls: [{ results: { total: 3 } }]
  });
  ae.modifyDamageForTraits = async () => ({ amount: 2, note: 'Resistance & {Note|@<>' });
  await runtime.global('applyCachedDamage')({ playerid: 'GM' }, ['!adr', 'apply', 'token-pc', 'Fire & {Type|@<>', 'Blade', '&', '{One|@<>']);
  const damage = runtime.chat.messages.at(-1).content;
  assertCleanCard(damage);
  assert.match(damage, /Resistance &amp; &#123;Note&#124;&#64;&lt;&gt;/);

  runtime.context.state.AttackDamageResolver.lastDamageUndo = {
    targetId: target.id, amount: 4, bar1Value: 10, bar1Max: 20, bar2Value: 0, bar2Max: 0, bar1After: 6, bar2After: 0
  };
  target.set({ bar1_value: 6, bar2_value: 0 });
  await runtime.global('handleUncannyDodge')({ who: 'GM' }, ['!adr', 'uncanny', target.id]);
  assertCleanCard(runtime.chat.messages.at(-1).content);

  runtime.context.state.AttackDamageResolver.lastDamageUndo = {
    targetId: target.id, amount: 4, bar1Value: 10, bar1Max: 20, bar2Value: 0, bar2Max: 0, bar1After: 8, bar2After: 0
  };
  target.set({ bar1_value: 8, bar2_value: 0 });
  await runtime.global('handleDamageReduction')({ who: 'GM' }, ['!adr', 'reduce', target.id, '1', '--label', 'Guard & {Ward|@<>']);
  assertCleanCard(runtime.chat.messages.at(-1).content);

  runtime.context.state.AttackDamageResolver.lastAttack = { attackerId: attacker.id, targetId: target.id };
  ae.hasEffect = (token, name) => token.id === target.id && name === 'fireshieldwarm';
  ae.modifyDamageForTraits = async () => ({ amount: 1, note: 'Immunity & {Note|@<>' });
  await runtime.global('applyFireShieldRetaliationDamage')(attacker, target, runtime.global('getFireShieldRetaliation')(target));
  assertCleanCard(runtime.chat.messages.at(-1).content);
  assert.match(runtime.chat.messages.at(-1).content, /Fire Shield — Warm Retaliation/);
});

// Evidence: ActionEconomyV2.8.3.js reads Beacon `level` and `charisma_mod`
// asynchronously and applies Dark One's Blessing only to the greater temp HP.
test("Dark One's Blessing uses current total level and charisma modifier", async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const aeState = runtime.context.state.ActionEconomyV2;
  const source = runtime.store.getObj('graphic', 'token-pc');
  const dead = runtime.store.getObj('graphic', 'token-enemy');
  aeState.features['char-pc'] = { darkonesblessing: true };
  await runtime.beacon.setSheetItem('char-pc', 'level', 7);
  await runtime.beacon.setSheetItem('char-pc', 'charisma_mod', 4);
  source.set({ bar2_value: 0, bar2_max: 0 });
  runtime.beacon.reads.length = 0;
  runtime.global('ActionEconomyV2API').recordDamageSource(source.id, dead.id);
  await runtime.global('ActionEconomyV2API').processDamageResult(source.id, dead.id, 8, 0);
  assert.equal(source.get('bar2_value'), 11);
  assert.deepEqual(runtime.beacon.reads.slice(-2).map(({ name }) => name), ['level', 'charisma_mod']);

  const { runtime: updated } = await startedRuntime({ fixtures: true });
  const updatedState = updated.context.state.ActionEconomyV2;
  const updatedSource = updated.store.getObj('graphic', 'token-pc');
  const updatedDead = updated.store.getObj('graphic', 'token-enemy');
  updatedState.features['char-pc'] = { darkonesblessing: true };
  await updated.beacon.setSheetItem('char-pc', 'level', 8);
  await updated.beacon.setSheetItem('char-pc', 'charisma_mod', -1);
  updatedSource.set({ bar2_value: 12, bar2_max: 12 });
  updated.global('ActionEconomyV2API').recordDamageSource(updatedSource.id, updatedDead.id);
  await updated.global('ActionEconomyV2API').processDamageResult(updatedSource.id, updatedDead.id, 8, 0);
  assert.equal(updatedSource.get('bar2_value'), 12);

  const { runtime: fallback } = await startedRuntime({ fixtures: true });
  const fallbackState = fallback.context.state.ActionEconomyV2;
  const fallbackSource = fallback.store.getObj('graphic', 'token-pc');
  const fallbackDead = fallback.store.getObj('graphic', 'token-enemy');
  fallbackState.features['char-pc'] = { darkonesblessing: true };
  await fallback.beacon.setSheetItem('char-pc', 'level', 12);
  await fallback.beacon.setSheetItem('char-pc', 'charisma_mod', 'invalid');
  await fallback.beacon.setSheetItem('char-pc', 'charisma', 18);
  fallbackSource.set({ bar2_value: 0, bar2_max: 0 });
  fallback.global('ActionEconomyV2API').recordDamageSource(fallbackSource.id, fallbackDead.id);
  await fallback.global('ActionEconomyV2API').processDamageResult(fallbackSource.id, fallbackDead.id, 8, 0);
  assert.equal(fallbackSource.get('bar2_value'), 16);
});

// Evidence: processDarkOnesBlessingDeathTrigger excludes friendly dead tokens
// and separately awards a nearby qualified holder when no recorded killer exists.
test("Dark One's Blessing preserves friendly-death exclusion and nearby awards", async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const aeState = runtime.context.state.ActionEconomyV2;
  const source = runtime.store.getObj('graphic', 'token-pc');
  const ally = runtime.store.getObj('graphic', 'token-ally');
  const dead = runtime.store.getObj('graphic', 'token-enemy');
  aeState.features['char-pc'] = { darkonesblessing: true };
  aeState.features['char-ally'] = { darkonesblessing: true };
  await runtime.beacon.setSheetItem('char-pc', 'level', 7); await runtime.beacon.setSheetItem('char-pc', 'charisma_mod', 4);
  await runtime.beacon.setSheetItem('char-ally', 'level', 5); await runtime.beacon.setSheetItem('char-ally', 'charisma_mod', 3);
  source.set({ left: 350, bar2_value: 0, bar2_max: 0 }); ally.set({ left: 420, bar2_value: 0, bar2_max: 0 }); dead.set({ left: 490, bar1_value: 8 });
  await runtime.global('ActionEconomyV2API').processDamageResult(null, dead.id, 8, 0);
  assert.equal(source.get('bar2_value'), 11);
  assert.equal(ally.get('bar2_value'), 8);

  runtime.context.state.ActionEconomyV2.pcCharacterIds.push('char-target');
  const friendlyDead = runtime.store.getObj('graphic', 'token-target');
  friendlyDead.set({ bar1_value: 0 });
  source.set({ bar2_value: 0, bar2_max: 0 });
  await runtime.global('ActionEconomyV2API').processDamageResult(null, friendlyDead.id, 20, 0);
  assert.equal(source.get('bar2_value'), 0);
});
