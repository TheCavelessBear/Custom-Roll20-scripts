'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

async function wipe(runtime, profile) {
  const confirmation = profile === 'all' ? ' WIPE ALL' : ' WIPE';
  await runtime.emit('chat:message', {
    type: 'api', playerid: 'GM', who: 'GM', content: `!statewipe ${profile}${confirmation}`
  });
  await runtime.flushTimers(runtime.time);
}

function addGraphic(runtime, id, properties = {}) {
  return runtime.store.add('graphic', {
    id, subtype: 'token', _pageid: 'page-test', pageid: 'page-test', layer: 'objects',
    name: id, represents: '', left: 350, top: 350, width: 70, height: 70, rotation: 0,
    statusmarkers: '', bar1_value: 10, bar1_max: 10, bar2_value: 0, bar3_value: 30,
    bar3_max: 30, ...properties
  });
}

function addPath(runtime, id) {
  return runtime.store.add('path', {
    id, _pageid: 'page-test', pageid: 'page-test', layer: 'objects', left: 350, top: 350,
    width: 70, height: 70, rotation: 0, path: '[["M",0,0],["L",70,70]]'
  });
}

function installDurableConfiguration(state) {
  const ae = state.ActionEconomyV2;
  ae.pcCharacterIds = ['char-pc'];
  ae.allyCharacterIds = ['char-ally'];
  ae.attackCounts['char-pc'] = 2;
  ae.features['char-pc'] = { durableFeature: { enabled: true } };
  ae.auras['char-pc'] = { durableAura: { radius: 10 } };
  ae.saveAdvantages['char-pc'] = { concentration: true };
  ae.terrainImmunities['token-pc'] = { lava: true };
  ae.hazardImmunities['token-pc'] = { smoke: true };
  ae.effects['token-pc'] = ae.effects['token-pc'] || {};
  ae.conditions['token-pc'] = { exhaustion: { durationOverride: 'manual' } };
  ae.conditionLevels['token-pc'] = { exhaustion: 2 };
  state.TokenTriggers.characters['char-pc'] = {
    triggers: { hpZero: { enabled: true }, bloodied: { enabled: true }, relentlessEndurance: { enabled: true } }
  };
  state.LootManager.keys['char-pc'] = { 'iron key': { name: 'Iron Key' } };
}

function assertDurableConfiguration(state) {
  const ae = state.ActionEconomyV2;
  assert.deepEqual(Array.from(ae.pcCharacterIds), ['char-pc']);
  assert.deepEqual(Array.from(ae.allyCharacterIds), ['char-ally']);
  assert.equal(ae.attackCounts['char-pc'], 2);
  assert.equal(ae.features['char-pc'].durableFeature.enabled, true);
  assert.equal(ae.auras['char-pc'].durableAura.radius, 10);
  assert.equal(ae.saveAdvantages['char-pc'].concentration, true);
  assert.equal(ae.terrainImmunities['token-pc'].lava, true);
  assert.equal(ae.hazardImmunities['token-pc'].smoke, true);
  assert.ok(ae.conditions['token-pc'].exhaustion);
  assert.equal(ae.conditionLevels['token-pc'].exhaustion, 2);
  assert.ok(state.TokenTriggers.characters['char-pc']);
  assert.equal(state.LootManager.keys['char-pc']['iron key'].name, 'Iron Key');
}

test('StateWipe preview is GM-only, exact, and dry-run does not mutate state or objects', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const state = runtime.context.state;
  state.AttackDamageResolver.attackTargets.stale = 'missing-token';
  state.ActionEconomyV2.economy['token-pc'] = { action: false };
  const beforeState = JSON.stringify(state);
  const beforeToken = runtime.store.getObj('graphic', 'token-pc').toJSON();

  const preview = runtime.global('PersistentStateManager').preview('combat');
  const adr = preview.find((entry) => entry.owner === 'AttackDamageResolver');
  assert.ok(adr.actions.some((action) => action.includes('combat/attack runtime')));
  assert.equal(JSON.stringify(state), beforeState);
  assert.deepEqual(runtime.store.getObj('graphic', 'token-pc').toJSON(), beforeToken);

  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', who: 'GM', content: '!statewipe combat' });
  assert.equal(JSON.stringify(state), beforeState);
  assert.ok(runtime.chat.messages.at(-1).content.includes('preview summary'));
  assert.ok(runtime.chat.messages.some((message) => message.content.includes('Affected state/actions')));

  await runtime.emit('chat:message', { type: 'api', playerid: 'PLAYER', who: 'Player', content: '!statewipe combat WIPE' });
  assert.equal(JSON.stringify(state), beforeState);
  assert.ok(runtime.chat.messages.at(-1).content.includes('GM only'));
});

test('owner maintenance APIs return stable summaries and dry-run counts match prune execution', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const state = runtime.context.state;
  state.ActionEconomyV2.economy.missing = { action: false };
  state.AttackDamageResolver.attackTargets.missing = 'missing-target';
  state.SaveEffects.sources = { GM: 'missing-source' };
  state.AoEBoom.templates.missing = { pathId: 'missing-path' };
  state.SmartAoE.links.push(null);
  state.TokenTriggers.tokens.missing = { bloodied: { active: true } };
  state.TokenAnimator.tokens.missing = { width: 0, height: 0 };
  state.LootManager.keys.missing = { key: { name: 'Key' } };
  state.DoorSounds.doors.missing = { group: 'none' };

  const apis = [
    'ActionEconomyV2API', 'AttackDamageResolverAPI', 'SaveEffectsAPI', 'AoEBoom',
    'SmartAoE', 'TokenTriggers', 'TokenAnimator', 'LootManager', 'DoorSounds'
  ].map((name) => [name, runtime.global(name)]);
  const before = JSON.stringify(state);
  const previews = apis.map(([name, api]) => [name, api.maintainState({ profile: 'prune', dryRun: true })]);
  assert.equal(JSON.stringify(state), before);

  previews.forEach(([name, summary]) => {
    assert.equal(summary.status, 'ok', name);
    ['removed', 'restored', 'preserved'].forEach((field) => assert.equal(typeof summary[field], 'number', `${name}.${field}`));
    ['actions', 'preservedDetails', 'warnings'].forEach((field) => assert.ok(Array.isArray(summary[field]), `${name}.${field}`));
    const executed = apis.find(([apiName]) => apiName === name)[1].maintainState({ profile: 'prune', dryRun: false });
    assert.equal(executed.removed, summary.removed, `${name}.removed`);
    assert.equal(executed.restored, summary.restored, `${name}.restored`);
    assert.deepEqual(Array.from(executed.actions), Array.from(summary.actions), `${name}.actions`);
  });
});

test('prune removes stale suite references, rebuilds map indexes, and preserves unsafe AE rollback records', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const state = runtime.context.state;
  const smartControl = addGraphic(runtime, 'smart-stale-control');
  const smartPath = addPath(runtime, 'smart-stale-path');
  const boomMarker = addPath(runtime, 'boom-stale-marker');
  const aeControl = addGraphic(runtime, 'ae-stale-control');

  state.ActionEconomyV2.economy['missing-token'] = { action: false };
  state.ActionEconomyV2.summons['missing-summon'] = { casterTokenId: 'token-pc' };
  state.ActionEconomyV2.originalSpeeds['missing-character'] = 30;
  state.ActionEconomyV2.effects['missing-token'] = { manual: { durationOverride: 'manual' } };
  state.ActionEconomyV2.saveAdvantages['missing-character'] = { dexterity: true };
  state.ActionEconomyV2.aoeControls[aeControl.id] = { casterTokenId: 'missing-caster' };
  state.AttackDamageResolver.attackTargets['missing-attacker'] = 'missing-target';
  state.AttackDamageResolver.lastDamageUndo = { targetId: 'missing-target', amount: 5 };
  state.SaveEffects.sources = {};
  state.SaveEffects.sources.GM = 'missing-source';
  state.AoEBoom.templates['missing-template'] = { pathId: 'missing-template', markerPathId: boomMarker.id };
  state.SmartAoE.links.push({ controlTokID: smartControl.id, originTokID: 'missing-origin', pathIDs: [smartPath.id], aoeType: 'circle' });
  state.Executioner['missing-token'] = { form: 'Spear' };
  state.TokenTriggers.characters['missing-character'] = { triggers: {} };
  state.TokenTriggers.tokens['missing-token'] = { bloodied: { active: true } };
  state.TokenAnimator.tokens['missing-token'] = { width: 70, height: 70 };
  state.LootManager.keys['missing-character'] = { key: { name: 'Key' } };
  state.LootManager.keys['char-pc'] = { ' IRON   KEY ': { name: ' Iron Key ' }, broken: {} };
  state.DoorSounds.groups.keep = { tracks: ['Door'] };
  state.DoorSounds.doors['missing-door'] = { group: 'keep' };
  state.MapChange.config.marker = '[GM]';
  state.MapChange.blockedPlayers = ['player-pc'];
  state.MapChange.publicMaps = { stale: 'missing-page' };
  state.BeaconAttributeTester.snapshots.stale = { characterId: 'missing-character' };

  await wipe(runtime, 'prune');

  assert.equal(state.ActionEconomyV2.economy['missing-token'], undefined);
  assert.equal(state.ActionEconomyV2.summons['missing-summon'], undefined);
  assert.equal(state.ActionEconomyV2.originalSpeeds['missing-character'], 30);
  assert.ok(state.ActionEconomyV2.effects['missing-token'].manual);
  assert.equal(state.ActionEconomyV2.saveAdvantages['missing-character'], undefined);
  assert.equal(state.ActionEconomyV2.aoeControls[aeControl.id], undefined);
  assert.equal(runtime.store.getObj('graphic', aeControl.id), undefined);
  assert.equal(state.AttackDamageResolver.attackTargets['missing-attacker'], undefined);
  assert.equal(state.AttackDamageResolver.lastDamageUndo, undefined);
  assert.equal(state.SaveEffects.sources.GM, undefined);
  assert.equal(state.AoEBoom.templates['missing-template'], undefined);
  assert.equal(runtime.store.getObj('path', boomMarker.id), undefined);
  assert.equal(state.SmartAoE.links.length, 0);
  assert.equal(runtime.store.getObj('graphic', smartControl.id), undefined);
  assert.equal(runtime.store.getObj('path', smartPath.id), undefined);
  assert.equal(state.Executioner['missing-token'], undefined);
  assert.equal(state.TokenTriggers.characters['missing-character'], undefined);
  assert.equal(state.TokenTriggers.tokens['missing-token'], undefined);
  assert.equal(state.TokenAnimator.tokens['missing-token'], undefined);
  assert.equal(state.LootManager.keys['missing-character'], undefined);
  assert.equal(state.LootManager.keys['char-pc']['iron key'].name, 'Iron Key');
  assert.equal(state.DoorSounds.doors['missing-door'], undefined);
  assert.ok(state.DoorSounds.groups.keep);
  assert.deepEqual(Array.from(state.MapChange.blockedPlayers), ['player-pc']);
  assert.equal(state.MapChange.publicMaps['Roll20 API Test Ground'], 'page-test');
  assert.equal(state.BeaconAttributeTester.snapshots.stale, undefined);

  const warnings = runtime.global('PersistentStateManager').preview('prune')
    .find((entry) => entry.owner === 'ActionEconomyV2').warnings;
  assert.ok(warnings.some((warning) => warning.includes('reversal is not provable')));
  await wipe(runtime, 'prune');
  assert.equal(runtime.exceptions.length, 0);
});

test('combat clears combat runtime and ADR module cache while preserving durable, manual, scene, and defeated state', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const state = runtime.context.state;
  const ae = state.ActionEconomyV2;
  installDurableConfiguration(state);

  ae.economy['token-pc'] = { action: false };
  ae.attacksRemaining['token-pc'] = 0;
  ae.movement['token-pc'] = { spent: 15 };
  ae.effects['token-pc'].round = { durationOverride: 'endOfTurn' };
  ae.effects['token-pc'].manual = { durationOverride: 'manual' };
  ae.effects['token-pc'].concentrate = { durationOverride: 'manual' };
  ae.ongoingDamage['token-pc'] = {
    fire: { duration: 'combat' }, curse: { duration: 'manual' }
  };
  ae.lastActiveTokenId = 'token-pc';
  state.AttackDamageResolver.attackTargets['token-pc'] = 'token-target';
  state.AttackDamageResolver.targetSlots.one = { attackerId: 'token-pc', targetId: 'token-target' };
  state.AttackDamageResolver.lastAttack = { attackerId: 'token-pc', targetId: 'token-target' };
  state.AttackDamageResolver.lastDamageUndo = { targetId: 'token-target', amount: 5 };
  state.SaveEffects.sources = {};
  state.SaveEffects.sources.GM = 'token-pc';
  state.TokenTriggers.tokens['token-pc'] = {
    hpZero: { active: true }, bloodied: { pending: true }, relentlessEndurance: { usedThisCombat: true }
  };
  state.TokenTriggers.lastActiveTokenId = 'token-pc';
  state.TokenAnimator.tokens['token-pc'] = { width: 70, height: 70 };

  const smartControl = addGraphic(runtime, 'smart-combat-control');
  const smartPath = addPath(runtime, 'smart-combat-path');
  state.SmartAoE.links.push({ controlTokID: smartControl.id, originTokID: 'token-pc', pathIDs: [smartPath.id], aoeType: 'circle' });
  const boomPath = addPath(runtime, 'boom-combat-path');
  state.AoEBoom.templates[boomPath.id] = { pathId: boomPath.id, casterTokenId: 'token-pc' };

  runtime.global('cacheDefaultTemplateDamageRoll')({
    type: 'general', playerid: 'GM', content: '&{template:default} {{name=Cached Strike}} {{Damage Type=Fire}} {{Damage=$[[0]]}}',
    inlinerolls: [{ results: { total: 7 } }]
  });

  await wipe(runtime, 'combat');

  assertDurableConfiguration(state);
  assert.equal(Object.keys(ae.economy).length, 0);
  assert.equal(Object.keys(ae.attacksRemaining).length, 0);
  assert.equal(Object.keys(ae.movement).length, 0);
  assert.equal(ae.effects['token-pc'].round, undefined);
  assert.ok(ae.effects['token-pc'].manual);
  assert.ok(ae.effects['token-pc'].concentrate);
  assert.equal(ae.ongoingDamage['token-pc'].fire, undefined);
  assert.ok(ae.ongoingDamage['token-pc'].curse);
  assert.equal(ae.lastActiveTokenId, null);
  assert.equal(runtime.store.getObj('graphic', 'token-pc').get('bar3_value'), '');
  assert.equal(Object.keys(state.AttackDamageResolver.attackTargets).length, 0);
  assert.equal(Object.keys(state.AttackDamageResolver.targetSlots).length, 0);
  assert.equal(state.AttackDamageResolver.lastAttack, undefined);
  assert.equal(state.AttackDamageResolver.lastDamageUndo, undefined);
  assert.equal(Object.keys(state.SaveEffects.sources).length, 0);
  assert.ok(state.TokenTriggers.tokens['token-pc'].hpZero);
  assert.equal(state.TokenTriggers.tokens['token-pc'].bloodied, undefined);
  assert.equal(state.TokenTriggers.tokens['token-pc'].relentlessEndurance, undefined);
  assert.equal(state.TokenTriggers.lastActiveTokenId, null);
  assert.equal(state.SmartAoE.links.length, 1, 'combat preserves valid active SmartAoE scene links');
  assert.ok(runtime.store.getObj('graphic', smartControl.id));
  assert.equal(state.AoEBoom.templates[boomPath.id], undefined);
  assert.equal(runtime.store.getObj('path', boomPath.id), undefined);
  assert.ok(state.TokenAnimator.tokens['token-pc']);

  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', who: 'GM', content: '!adr status' });
  assert.ok(runtime.chat.messages.at(-1).content.includes('Cached Damage=None'));
  await wipe(runtime, 'combat');
  assert.equal(runtime.exceptions.length, 0);
});

test('scene removes owner-created encounter objects while preserving summons, mounts, and character-attached manual state', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const state = runtime.context.state;
  const ae = state.ActionEconomyV2;
  installDurableConfiguration(state);
  ae.effects['token-pc'].manual = { durationOverride: 'manual' };
  ae.effects['token-pc'].concentrate = { durationOverride: 'manual' };
  ae.mounts['token-rider'] = 'token-mount';
  ae.summons['scene-summon'] = { casterTokenId: 'token-pc', concentration: false };
  const summon = addGraphic(runtime, 'scene-summon');
  const control = addGraphic(runtime, 'ae-scene-control');
  const hazard = addGraphic(runtime, 'ae-scene-hazard');
  const directional = addGraphic(runtime, 'ae-scene-directional');
  const visual = addGraphic(runtime, 'ae-scene-visual');
  const terrain = addGraphic(runtime, 'ae-scene-terrain');
  ae.aoeControls[control.id] = { casterTokenId: 'token-pc' };
  ae.aoeHazards[hazard.id] = { sourceTokenId: 'token-pc' };
  ae.directionalHazards[directional.id] = { casterTokenId: 'token-pc' };
  ae.visualLinks[visual.id] = { casterTokenId: 'token-pc', effectName: 'manual' };
  ae.difficultTerrain[terrain.id] = { name: 'Rubble', shape: 'token' };
  ae.telekinesis['token-pc'] = { targetTokenId: 'token-target' };
  ae.pendingSummons.GM = [{ casterTokenId: 'token-pc' }];
  ae.pendingVisualLinks.GM = { casterTokenId: 'token-pc' };
  ae.pendingDirectionalHazards.GM = { casterTokenId: 'token-pc' };

  const smartControl = addGraphic(runtime, 'smart-scene-control');
  const smartPath = addPath(runtime, 'smart-scene-path');
  state.SmartAoE.links.push({ controlTokID: smartControl.id, originTokID: 'token-pc', pathIDs: [smartPath.id], aoeType: 'circle' });
  const boomPath = addPath(runtime, 'boom-scene-path');
  const boomMarker = addPath(runtime, 'boom-scene-marker');
  state.AoEBoom.templates[boomPath.id] = { pathId: boomPath.id, markerPathId: boomMarker.id, casterTokenId: 'token-pc' };

  await wipe(runtime, 'scene');

  assertDurableConfiguration(state);
  assert.ok(ae.effects['token-pc'].manual);
  assert.ok(ae.effects['token-pc'].concentrate);
  assert.equal(ae.mounts['token-rider'], 'token-mount');
  assert.ok(ae.summons[summon.id]);
  assert.ok(runtime.store.getObj('graphic', summon.id));
  [control.id, hazard.id, directional.id, visual.id, smartControl.id].forEach((id) => assert.equal(runtime.store.getObj('graphic', id), undefined));
  assert.ok(runtime.store.getObj('graphic', terrain.id), 'terrain definition clears without deleting ordinary terrain token');
  assert.equal(Object.keys(ae.difficultTerrain).length, 0);
  assert.equal(Object.keys(ae.telekinesis).length, 0);
  assert.equal(Object.keys(ae.pendingSummons).length, 0);
  assert.equal(Object.keys(ae.pendingVisualLinks).length, 0);
  assert.equal(Object.keys(ae.pendingDirectionalHazards).length, 0);
  assert.equal(state.SmartAoE.links.length, 0);
  assert.equal(runtime.store.getObj('path', smartPath.id), undefined);
  assert.equal(runtime.store.getObj('path', boomPath.id), undefined);
  assert.equal(runtime.store.getObj('path', boomMarker.id), undefined);
});

test('setting reverses transient mechanics and presentation but preserves permanent PC/Ally configuration', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const state = runtime.context.state;
  const ae = state.ActionEconomyV2;
  const pc = runtime.store.getObj('graphic', 'token-pc');
  installDurableConfiguration(state);

  ae.effects['token-pc'].manual = { durationOverride: 'manual' };
  ae.effects['token-pc'].concentrate = { durationOverride: 'manual' };
  ae.conditions['token-pc'].restrained = { durationOverride: 'manual' };
  ae.ongoingDamage['token-pc'] = { curse: { duration: 'manual' } };
  ae.originalSpeeds['char-pc'] = 30;
  ae.tokenSizes['token-pc'] = { enlarged: { width: 70, height: 70 } };
  ae.aidHp['token-pc'] = { aid: { amount: 5, originalMaxHp: 20 } };
  ae.mounts['token-rider'] = 'token-mount';
  ae.summons['setting-summon'] = { casterTokenId: 'token-pc', concentration: false };
  addGraphic(runtime, 'setting-summon');
  pc.set({ width: 140, height: 140, bar1_value: 25, bar1_max: 25, bar3_value: 60, bar3_max: 60 });
  await runtime.beacon.setSheetItem('char-pc', 'speed', 60);

  state.TokenTriggers.tokens['token-pc'] = {
    hpZero: {
      active: true, originalSide: 1, originalLayer: 'objects', originalWidth: 70,
      originalHeight: 70, originalRotation: 0, bar1Cleared: false
    },
    bloodied: { pending: true }, relentlessEndurance: { usedThisCombat: true }
  };
  state.TokenAnimator.tokens['token-pc'] = { width: 70, height: 70 };
  state.DoorSounds.config.settingSentinel = true;
  state.MapChange.config.settingSentinel = true;

  await wipe(runtime, 'setting');
  await Promise.resolve();

  assertDurableConfiguration(state);
  assert.equal(ae.effects['token-pc'] && ae.effects['token-pc'].manual, undefined);
  assert.equal(ae.effects['token-pc'] && ae.effects['token-pc'].concentrate, undefined);
  assert.equal(ae.conditions['token-pc'].restrained, undefined);
  assert.ok(ae.conditions['token-pc'].exhaustion);
  assert.equal(ae.conditionLevels['token-pc'].exhaustion, 2);
  assert.equal(Object.keys(ae.ongoingDamage).length, 0);
  assert.equal(Object.keys(ae.originalSpeeds).length, 0);
  assert.equal(Object.keys(ae.tokenSizes).length, 0);
  assert.equal(Object.keys(ae.aidHp).length, 0);
  assert.equal(Object.keys(ae.mounts).length, 0);
  assert.equal(Object.keys(ae.summons).length, 0);
  assert.equal(runtime.store.getObj('graphic', 'setting-summon'), undefined);
  assert.equal(pc.get('width'), 70);
  assert.equal(pc.get('height'), 70);
  assert.equal(pc.get('bar1_max'), 20);
  assert.equal(pc.get('bar1_value'), 20);
  assert.equal(pc.get('bar3_value'), '');
  assert.equal(await runtime.beacon.getSheetItem('char-pc', 'speed'), 30);
  assert.equal(state.TokenTriggers.tokens['token-pc'], undefined);
  assert.ok(state.TokenTriggers.characters['char-pc']);
  assert.ok(state.TokenAnimator.tokens['token-pc']);
  assert.ok(state.LootManager.keys['char-pc']);
  assert.equal(state.DoorSounds.config.settingSentinel, true);
  assert.equal(state.MapChange.config.settingSentinel, true);

  await wipe(runtime, 'setting');
  assert.equal(runtime.exceptions.length, 0);
});

test('setting safely clears bar-only runtime and token presentation for an unlinked NPC', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const state = runtime.context.state;
  const ae = state.ActionEconomyV2;
  const npc = runtime.store.getObj('graphic', 'token-npc');
  const beaconWritesBefore = runtime.beacon.writes.length;

  ae.economy['token-npc'] = { action: false };
  ae.movement['token-npc'] = { spent: 20 };
  ae.effects['token-npc'] = { manual: { durationOverride: 'manual' } };
  ae.conditions['token-npc'] = { restrained: { durationOverride: 'manual' } };
  ae.tokenSizes['token-npc'] = { enlarged: { width: 70, height: 70 } };
  npc.set({ width: 140, height: 140, bar3_value: 60, bar3_max: 60 });
  state.TokenTriggers.tokens['token-npc'] = {
    hpZero: {
      active: true, originalLayer: 'objects', originalWidth: 70, originalHeight: 70,
      originalRotation: 0, bar1Cleared: false
    }
  };

  await wipe(runtime, 'setting');

  assert.equal(npc.get('width'), 70);
  assert.equal(npc.get('height'), 70);
  assert.equal(npc.get('bar3_value'), '');
  assert.equal(ae.effects['token-npc'], undefined);
  assert.equal(ae.conditions['token-npc'], undefined);
  assert.equal(state.TokenTriggers.tokens['token-npc'], undefined);
  assert.equal(runtime.beacon.writes.length, beaconWritesBefore, 'unlinked NPC cleanup does not invent Beacon writes');
});

test('campaign resets gameplay and progression while preserving installed-tool configuration', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const state = runtime.context.state;
  installDurableConfiguration(state);
  state.ActionEconomyV2.effects['token-pc'].manual = { durationOverride: 'manual' };
  state.Executioner['token-pc'] = { form: 'Spear' };
  state.HPManager.pending = { test: true };
  state.AttackDamageResolver.attackTargets['token-pc'] = 'token-target';
  state.SaveEffects.sources = {};
  state.SaveEffects.sources.GM = 'token-pc';
  state.TokenAnimator.tokens['token-pc'] = { width: 70, height: 70 };
  state.BeaconAttributeTester.snapshots.live = { characterId: 'char-pc' };
  state.LootManager.config.campaignSentinel = true;
  state.DoorSounds.config.campaignSentinel = true;
  state.MapChange.config.campaignSentinel = true;
  state.GroupInitiative.campaignSentinel = true;
  state.simpleSound.campaignSentinel = true;
  state.TheAaron = { unowned: true };

  const smartControl = addGraphic(runtime, 'smart-campaign-control');
  const smartPath = addPath(runtime, 'smart-campaign-path');
  state.SmartAoE.links.push({ controlTokID: smartControl.id, originTokID: 'token-pc', pathIDs: [smartPath.id], aoeType: 'circle' });
  const boomPath = addPath(runtime, 'boom-campaign-path');
  state.AoEBoom.templates[boomPath.id] = { pathId: boomPath.id, casterTokenId: 'token-pc' };

  await wipe(runtime, 'campaign');

  const ae = state.ActionEconomyV2;
  assert.equal(ae.pcCharacterIds.length, 0);
  assert.equal(ae.allyCharacterIds.length, 0);
  ['attackCounts', 'features', 'auras', 'saveAdvantages', 'conditions', 'effects', 'conditionLevels', 'terrainImmunities', 'hazardImmunities'].forEach((key) => assert.equal(Object.keys(ae[key]).length, 0, key));
  assert.equal(Object.keys(state.TokenTriggers.characters).length, 0);
  assert.equal(Object.keys(state.TokenTriggers.tokens).length, 0);
  assert.equal(Object.keys(state.Executioner).length, 0);
  assert.equal(Object.keys(state.HPManager).length, 0);
  assert.equal(Object.keys(state.AttackDamageResolver.attackTargets).length, 0);
  assert.equal(Object.keys(state.SaveEffects.sources).length, 0);
  assert.equal(Object.keys(state.AoEBoom.templates).length, 0);
  assert.equal(state.SmartAoE.links.length, 0);
  assert.equal(Object.keys(state.TokenAnimator.tokens).length, 0);
  assert.equal(Object.keys(state.LootManager.keys).length, 0);
  assert.equal(Object.keys(state.BeaconAttributeTester.snapshots).length, 0);
  assert.equal(runtime.store.getObj('graphic', smartControl.id), undefined);
  assert.equal(runtime.store.getObj('path', smartPath.id), undefined);
  assert.equal(runtime.store.getObj('path', boomPath.id), undefined);
  assert.equal(state.LootManager.config.campaignSentinel, true);
  assert.equal(state.DoorSounds.config.campaignSentinel, true);
  assert.equal(state.MapChange.config.campaignSentinel, true);
  assert.equal(state.GroupInitiative.campaignSentinel, true);
  assert.equal(state.simpleSound.campaignSentinel, true);
  assert.equal(state.TheAaron.unowned, true);

  await wipe(runtime, 'campaign');
  assert.equal(runtime.exceptions.length, 0);
});

test('all requires WIPE ALL, deletes every registered and obsolete suite root, preserves unowned roots, and is idempotent', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const state = runtime.context.state;
  const manager = runtime.global('PersistentStateManager');
  state.TheAaron = { help: true };
  state.UnownedExtension = { keep: true };
  state.TokenSizeAnimator = { tokens: { 'token-pc': { width: 70, height: 70 } } };
  state.AuraToggle = { obsolete: true };

  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', who: 'GM', content: '!statewipe all WIPE' });
  assert.ok(state.ActionEconomyV2, 'ordinary WIPE is not strong enough for all');
  assert.ok(runtime.chat.messages.at(-1).content.includes('WIPE ALL'));
  const previewCounts = runtime.chat.messages.at(-1).content.match(/Remove (\d+); Restore\/reverse (\d+); Preserve (\d+); Warnings (\d+)/);
  assert.ok(previewCounts, 'factory preview reports aggregate counts');

  await wipe(runtime, 'all');
  const completionCounts = runtime.chat.messages.at(-1).content.match(/Removed (\d+); Restored\/reversed (\d+); Preserved (\d+); Warnings (\d+)/);
  assert.deepEqual(completionCounts && completionCounts.slice(1), previewCounts.slice(1), 'all preview and execution summaries match');
  manager.inventory.forEach((entry) => assert.equal(state[entry.root], undefined, entry.root));
  assert.equal(state.TokenSizeAnimator, undefined);
  assert.equal(state.AuraToggle, undefined);
  assert.equal(state.TheAaron.help, true);
  assert.equal(state.UnownedExtension.keep, true);
  assert.ok(runtime.chat.messages.at(-1).content.includes('Restart the Mod sandbox'));

  assert.equal(runtime.exceptions.length, 0);

  const { runtime: restartedRuntime } = await startedRuntime({ fixtures: true });
  restartedRuntime.context.state.TheAaron = { help: true };
  await wipe(restartedRuntime, 'all');
  assert.equal(restartedRuntime.context.state.TheAaron.help, true);
  assert.equal(restartedRuntime.exceptions.length, 0);
});

test('statelist reports the complete inventory with owners, classifications, profile effects, and exception sections', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  runtime.context.state.UnownedExtension = { keep: true };
  runtime.context.state.TokenSizeAnimator = { tokens: {} };
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', who: 'GM', content: '!statelist' });
  const output = runtime.chat.messages.map((message) => message.content).join('\n');
  assert.ok(output.includes('state.ActionEconomyV2'));
  assert.ok(output.includes('ActionEconomyV2.9.0.js'));
  assert.ok(output.includes('state.torii'));
  assert.ok(output.includes('framework/config'));
  assert.ok(output.includes('combat:'));
  assert.ok(output.includes('Legacy'));
  assert.ok(output.includes('TokenSizeAnimator'));
  assert.ok(output.includes('Unrecognized'));
  assert.ok(output.includes('UnownedExtension'));
  assert.ok(output.includes('Protected unowned'));
});
