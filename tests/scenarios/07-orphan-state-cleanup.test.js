'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

function containsId(value, id, seen = new Set()) {
  if (!value || typeof value !== 'object') return value === id;
  if (seen.has(value)) return false;
  seen.add(value);
  return Object.keys(value).some((key) => key === id || containsId(value[key], id, seen));
}

test('graphic destruction locally prunes every typed AE token record without StateWipe', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const stale = 'token-pc';
  const live = 'token-npc';
  const independent = 'token-ally';
  const telekinesisCaster = 'token-target';
  const ae = runtime.context.state.ActionEconomyV2;
  const directStores = ['economy', 'attacksRemaining', 'movement', 'ignoreNextMove', 'movementLocked', 'effects', 'conditions', 'disarmedItems', 'droppedItemTokens', 'mounts', 'attributeModifiers', 'abilityScoreModifiers', 'aidHp', 'conditionLevels', 'economyLocks', 'ongoingDamage', 'summons', 'aoeControls', 'aoeHazards', 'aoeHazardTurnHits', 'tokenSizes', 'visualLinks', 'directionalHazards', 'directionalHazardTurnHits', 'difficultTerrain', 'terrainImmunities', 'hazardImmunities', 'damageSources', 'saveModifiers', 'telekinesis'];
  directStores.forEach((store) => { ae[store][stale] = { sourceTokenId: stale, targetTokenId: stale }; });
  ae.mounts[live] = { mountId: stale };
  ae.summons[live] = { casterTokenId: stale, summonTokenId: live };
  ae.aoeControls[live] = { casterTokenId: stale };
  ae.aoeHazards[live] = { sourceTokenId: stale };
  ae.visualLinks[live] = { casterTokenId: stale };
  ae.directionalHazards[live] = { casterTokenId: stale, sourceTokenId: stale };
  ae.droppedItemTokens[live] = { ownerTokenId: stale };
  ae.damageSources[live] = { sourceTokenId: stale };
  ae.saveModifiers[live] = { staleModifier: { sourceTokenId: stale } };
  ae.telekinesis[telekinesisCaster] = { casterTokenId: telekinesisCaster, targetTokenId: stale, targetType: 'creature', restrained: true };
  ae.disarmedItems[live] = { record: { droppedTokenId: stale } };
  ae.effects[independent] = { manual: { sourceTokenId: stale }, concentration: { sourceTokenId: stale, durationOverride: 'concentration' } };
  ae.conditions[independent] = { manual: { sourceTokenId: stale }, concentration: { sourceTokenId: stale, durationOverride: 'concentration' } };
  ae.ongoingDamage[independent] = { manual: { sourceTokenId: stale }, concentration: { sourceTokenId: stale, duration: 'concentration' } };
  ae.aoeHazardTurnHits[live] = { [stale]: true };
  ae.directionalHazardTurnHits[live] = { turn: { [stale]: true } };
  ae.speeds[stale] = 30;
  ae.originalSpeeds[stale] = 30;
  ae.speeds['char-pc'] = 30;
  ae.originalSpeeds['char-pc'] = 30;
  ae.pendingSummons.GM = [{ casterTokenId: stale, existingTokenIds: { [stale]: true } }];
  ae.pendingVisualLinks.unknown = { casterTokenId: telekinesisCaster, existingTokenIds: { [stale]: true } };
  ae.pendingDirectionalHazards.AoEBoom = { casterTokenId: telekinesisCaster, sourceTokenId: telekinesisCaster, existingTokenIds: { [stale]: true } };
  ae.lastActiveTokenId = stale;
  ae.attackCounts['char-pc'] = 2;
  ae.features['char-pc'] = { test: true };
  ae.auras['char-pc'] = { test: true };
  ae.saveAdvantages['char-pc'] = { dex: true };
  ae.sheetCache['char-pc'] = { hp: 10 };
  runtime.context.state.TokenTriggers.lastActiveTokenId = stale;
  runtime.context.state.Executioner = { [stale]: { form: 'Spear' } };
  runtime.context.state.AttackDamageResolver.attackTargets = { [stale]: live };
  runtime.context.state.SaveEffects.sources = { GM: stale };
  runtime.global('PersistentStateManager').pruneOwner = function() { throw new Error('Owner handlers must not use the coordinator.'); };

  const token = runtime.store.getObj('graphic', stale);
  token.remove();
  await runtime.emit('destroy:graphic', token);

  assert.equal(containsId(ae, stale), false, 'the deleted token ID is absent from typed AE state');
  assert.equal(ae.telekinesis[telekinesisCaster].targetTokenId, null, 'a surviving telekinesis caster retains a cleared target record');
  assert.deepEqual(ae.effects[independent], { manual: {} });
  assert.deepEqual(ae.conditions[independent], { manual: {} });
  assert.deepEqual(ae.ongoingDamage[independent], { manual: {} });
  assert.equal(ae.pendingVisualLinks.unknown.existingTokenIds[stale], undefined);
  assert.equal(ae.pendingDirectionalHazards.AoEBoom.existingTokenIds[stale], undefined);
  assert.ok(ae.attackCounts['char-pc']);
  assert.ok(ae.features['char-pc']);
  assert.ok(ae.auras['char-pc']);
  assert.ok(ae.saveAdvantages['char-pc']);
  assert.ok(ae.sheetCache['char-pc']);
  assert.equal(runtime.context.state.TokenTriggers.lastActiveTokenId, null);
  assert.equal(runtime.context.state.Executioner[stale], undefined);
  assert.equal(runtime.context.state.AttackDamageResolver.attackTargets[stale], undefined);
  assert.equal(runtime.context.state.SaveEffects.sources.GM, undefined);

  const character = runtime.store.getObj('character', 'char-pc');
  character.remove();
  await runtime.emit('destroy:character', character);
  ['attackCounts', 'features', 'auras', 'saveAdvantages', 'sheetCache', 'speeds', 'originalSpeeds'].forEach((store) => {
    assert.equal(ae[store]['char-pc'], undefined, store + ' is removed when its character is destroyed');
  });
});

test('owner lifecycle handlers prune path, page, door, character, player, and saved-order state locally', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const path = runtime.store.add('path', { id: 'path-stale', _pageid: 'page-test' });
  const page = runtime.store.add('page', { id: 'page-stale', name: 'Stale' });
  const door = runtime.store.add('door', { id: 'door-stale', _pageid: 'page-test' });
  const player = runtime.store.add('player', { id: 'player-stale', _displayname: 'Stale' });
  const character = runtime.store.add('character', { id: 'char-stale', name: 'Stale' });
  runtime.context.state.AoEBoom.templates = { 'path-stale': { pathId: 'path-stale', casterTokenId: 'token-npc', sourceTokenId: 'token-npc', pageId: 'page-test' } };
  runtime.context.state.SmartAoE.links = [{ controlTokID: 'token-npc', originTokID: 'token-ally', pageID: 'page-test', pathIDs: ['path-stale'] }];
  ['publicMaps', 'privateMaps', 'archiveMaps', 'hiddenMaps'].forEach((store) => {
    runtime.context.state.MapChange[store].stale = 'page-stale';
  });
  runtime.context.state.MapChange.blockedPlayers = ['GM', 'player-stale'];
  runtime.context.state.DoorSounds.doors['door-stale'] = { open: 'track' };
  runtime.context.state.BeaconAttributeTester.snapshots.stale = { playerId: 'player-stale', characterId: 'char-stale' };
  runtime.context.state.LootManager.keys['char-stale'] = { key: true };
  runtime.context.state.GroupInitiative.savedTurnOrders = [{ turnorder: JSON.stringify([{ id: 'token-npc', pr: 1 }, { id: '-1', pr: 20 }, { id: 'missing-token', pr: 2 }]) }, { turnorder: 'not JSON' }];

  path.remove(); await runtime.emit('destroy:path', path);
  page.remove(); await runtime.emit('destroy:page', page);
  door.remove(); await runtime.emit('destroy:door', door);
  player.remove(); await runtime.emit('destroy:player', player);
  character.remove(); await runtime.emit('destroy:character', character);
  await runtime.emit('destroy:graphic', runtime.store.getObj('graphic', 'token-npc'));

  assert.deepEqual(runtime.context.state.AoEBoom.templates, {});
  assert.deepEqual(runtime.context.state.SmartAoE.links, []);
  ['publicMaps', 'privateMaps', 'archiveMaps', 'hiddenMaps'].forEach((store) => {
    assert.equal(runtime.context.state.MapChange[store].stale, undefined);
  });
  assert.deepEqual(runtime.context.state.MapChange.blockedPlayers, ['GM']);
  assert.equal(runtime.context.state.DoorSounds.doors['door-stale'], undefined);
  assert.equal(runtime.context.state.BeaconAttributeTester.snapshots.stale, undefined);
  assert.equal(runtime.context.state.LootManager.keys['char-stale'], undefined);
  const saved = runtime.context.state.GroupInitiative.savedTurnOrders;
  assert.equal(saved.length, 1);
  assert.deepEqual(JSON.parse(saved[0].turnorder).map((entry) => entry.id), ['-1']);
  assert.ok(runtime.context.state.MapChange.config, 'campaign configuration survives page pruning');
  assert.ok(runtime.context.state.LootManager.config, 'Loot configuration survives character pruning');
});

test('startup preserves MapChange configuration and migrates live TokenAnimator legacy baselines', async () => {
  const { runtime } = await startedRuntime({
    fixtures: true,
    beforeReady(runtimeBeforeReady) {
      runtimeBeforeReady.context.state.MapChange = {
        version: 1.8,
        config: { marker: '[PRIVATE]', invertedMarker: true, debug: false, gmNotify: false },
        blockedPlayers: ['GM', 'missing-player'],
        publicMaps: {}, privateMaps: {}, archiveMaps: {}, hiddenMaps: {}
      };
      runtimeBeforeReady.context.state.TokenAnimator = { tokens: {} };
      runtimeBeforeReady.context.state.TokenSizeAnimator = {
        tokens: {
          'token-pc': { width: 84, height: 84 },
          'missing-token': { width: 70, height: 70 }
        }
      };
    }
  });

  assert.equal(runtime.context.state.MapChange.config.marker, '[PRIVATE]');
  assert.equal(runtime.context.state.MapChange.config.invertedMarker, true);
  assert.deepEqual(runtime.context.state.MapChange.blockedPlayers, ['GM', 'missing-player']);
  assert.deepEqual(runtime.context.state.TokenAnimator.tokens['token-pc'], { width: 84, height: 84 });
  assert.equal(runtime.context.state.TokenAnimator.tokens['missing-token'], undefined);
  assert.equal(runtime.context.state.TokenSizeAnimator, undefined);
});

test('StateWipe preview is non-mutating and its fallback apply prunes every registered owner idempotently', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const manager = runtime.global('PersistentStateManager');
  const state = runtime.context.state;
  state.ActionEconomyV2.economy['missing-token'] = {};
  state.AttackDamageResolver.attackTargets = { 'missing-token': 'token-npc' };
  state.SaveEffects.sources = { GM: 'missing-token' };
  state.AoEBoom.templates = { missingPath: { pathId: 'missing-path', casterTokenId: 'token-npc', sourceTokenId: 'token-npc', pageId: 'page-test' } };
  state.SmartAoE.links = [{ controlTokID: 'missing-token', originTokID: 'token-npc', pageID: 'page-test', pathIDs: [] }];
  state.DoorSounds.doors['missing-door'] = {};
  state.Executioner = { 'missing-token': {} };
  state.GroupInitiative.savedTurnOrders = [{ turnorder: JSON.stringify([{ id: 'missing-token', pr: 1 }]) }];
  state.MapChange.publicMaps.missing = 'missing-page';
  state.BeaconAttributeTester.snapshots.orphan = { playerId: 'missing-player' };
  state.TokenTriggers.tokens['missing-token'] = {};
  state.TokenAnimator.tokens['missing-token'] = {};
  state.TokenSizeAnimator = { tokens: { 'missing-token': {} } };
  state.LootManager.keys['missing-character'] = {};
  const beforePreview = JSON.stringify(state);
  const preview = manager.prune(true);
  assert.deepEqual(manager.expectedPruners, preview.map((report) => report.owner));
  assert.ok(preview.every((report) => !report.error), 'all expected owners registered a fallback pruner');
  assert.ok(preview.every((report) => report.removed.length), 'each owner reports its seeded orphan');
  assert.equal(JSON.stringify(state), beforePreview, 'preview does not mutate any relevant state');
  const applied = manager.prune(false);
  assert.ok(applied.every((report) => report.removed.length));
  assert.equal(state.ActionEconomyV2.economy['missing-token'], undefined);
  assert.equal(state.AttackDamageResolver.attackTargets['missing-token'], undefined);
  assert.equal(state.SaveEffects.sources.GM, undefined);
  assert.deepEqual(state.AoEBoom.templates, {});
  assert.deepEqual(state.SmartAoE.links, []);
  assert.equal(state.DoorSounds.doors['missing-door'], undefined);
  assert.equal(state.Executioner['missing-token'], undefined);
  assert.deepEqual(state.GroupInitiative.savedTurnOrders.map((record) => JSON.parse(record.turnorder)), [[]]);
  assert.equal(state.MapChange.publicMaps.missing, undefined);
  assert.equal(state.BeaconAttributeTester.snapshots.orphan, undefined);
  assert.equal(state.TokenTriggers.tokens['missing-token'], undefined);
  assert.equal(state.TokenAnimator.tokens['missing-token'], undefined);
  assert.equal(state.TokenSizeAnimator, undefined);
  assert.equal(state.LootManager.keys['missing-character'], undefined);
  assert.ok(state.MapChange.config, 'campaign configuration survives fallback pruning');
  assert.ok(state.LootManager.config, 'Loot configuration survives fallback pruning');
  assert.ok(manager.prune(false).every((report) => report.removed.length === 0), 'a repeated prune is idempotent');

  state.Executioner['missing-again'] = {};
  await runtime.emit('chat:message', { type: 'api', content: '!statewipe prune preview', playerid: 'GM', who: 'GM' });
  assert.ok(state.Executioner['missing-again'], 'the GM preview command does not mutate state');
  assert.match(runtime.chat.messages.at(-1).content, /Will Remove/);
  await runtime.emit('chat:message', { type: 'api', content: '!statewipe prune', playerid: 'GM', who: 'GM' });
  assert.equal(state.Executioner['missing-again'], undefined);
  assert.match(runtime.chat.messages.at(-1).content, /Removed/);
  await runtime.emit('chat:message', { type: 'api', content: '!statewipe prune', playerid: 'player-pc', who: 'Player' });
  assert.match(runtime.chat.messages.at(-1).content, /GM only/);
});
