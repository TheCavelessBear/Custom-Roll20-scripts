'use strict';

// Source: Guides and Notes/Architecture/Command-and-API-Registry.md.
// Order, owned globals, and the small set of active-source overwrites are
// explicit so additions and collisions cannot be silently accepted.
const files = [
  'GroupInitiative.js', 'SimpleSound.js', 'TokenMod.js', 'ScriptCards.js', 'MathOps.js', 'Plugger.js', 'libTable.js', 'Muler.js', 'SelectManager.js', 'VectorMath.js', 'MatrixMath.js', 'libInline.js', 'PathMath.js', 'checkLightLevel.js', 'libTokenMarkers.js', 'Messenger.js', 'SmartAoE.js', 'DoorSounds.js', 'Fetch.js', 'TurnMarker1.js', 'APILogic.js', 'ActionEconomyV2.8.2.js', 'ZeroFrame.js', 'SaveEffects1.3.1.js', 'MetaScriptToolbox.js', 'Executioner.js', 'HPManager1.1.1.js', 'Auras.js', 'AttackDamageResolver1.3.1.js', 'SpawnDefaultTokenV1.1.2.js', 'Dismiss.js', 'AoEBoom1.1.2.js', 'MapChange.js', 'TokenActionBuilder0.4.0.js', 'Audit.js', 'StateWipe.js', 'BeaconAttributeTester.js', 'DoorControl.js', 'TokenTriggers1.3.3.js', 'TokenAnimator1.3.js', 'HandoutAccess1.1.js', 'TargetReport1.0.js', 'LootManager1.3.js'
];

const scripts = files.map((file) => ({ file, ownedGlobals: [], allowedOverwrites: [], bindingPhases: {} }));
// Scripts may mutate these shared containers, but replacing either container is
// still an unexpected overwrite and fails the per-script transition check.
const sharedMutableGlobals = ['API_Meta', 'state'];
const byFile = Object.fromEntries(scripts.map((entry) => [entry.file, entry]));
const own = (file, names, allowedOverwrites = []) => {
  byFile[file].ownedGlobals.push(...names);
  byFile[file].allowedOverwrites.push(...allowedOverwrites);
};

own('GroupInitiative.js', ['GroupInitiative']);
own('SimpleSound.js', ['simpleSound']);
own('TokenMod.js', ['TokenMod']);
own('ScriptCards.js', ['ScriptCards', 'scriptCardsStashedScripts']);
own('MathOps.js', ['MathOps']); own('Plugger.js', ['Plugger']); own('libTable.js', ['libTable']); own('Muler.js', ['Muler']); own('SelectManager.js', ['SelectManager']);
own('VectorMath.js', ['VecMath']); own('MatrixMath.js', ['MatrixMath']); own('libInline.js', ['libInline']); own('PathMath.js', ['PathMath']); own('checkLightLevel.js', ['checkLightLevel']); own('libTokenMarkers.js', ['libTokenMarkers']); own('Messenger.js', ['Messenger']);
own('SmartAoE.js', ['SmartAoE']); own('DoorSounds.js', ['DoorSounds']); own('Fetch.js', ['Fetch']); own('TurnMarker1.js', ['TurnMarker', 'TurnOrder']); own('APILogic.js', ['APILogic']); own('ActionEconomyV2.8.2.js', ['ActionEconomyV2API']); byFile['ActionEconomyV2.8.2.js'].bindingPhases.ActionEconomyV2API = 'ready'; own('ZeroFrame.js', ['ZeroFrame']);

const saveEffectsGlobals = ['handleLifeDrain', 'handleRegistrySaveEffect', 'setSavedSourceToken', 'getSavedSourceTokenId', 'clearSavedSourceToken', 'handleSelectedOngoingDamage', 'handleSelectedOngoingDamageRemove', 'getOptionWords', 'getSaveHooks', 'runSaveHook', 'runSaveHooks', 'handleBatchDamageSave', 'handleDamageConditionSave', 'handleSingleDamageSave', 'handleSelectedDamageSave', 'rollAndApplyDamageConditionSave', 'rollAndApplyDamageSave', 'safelyNotifyAeDamageResult', 'publicDamageResultCard', 'publicDamageBatchCard', 'getAeSaveBonusModifier', 'getAeSaveDamageResult', 'seGetAeModifiedDamage', 'getSuccessDamage', 'seProcessTokenTriggersBar1Change', 'seApplyDamageToToken', 'rollDamageFormula', 'handleSelectedSaveEffect', 'handleGenericSaveEffect', 'handleForcedMovementSave', 'rollAndApplySaveEffect', 'publicSaveResultCard', 'publicSaveBatchCard', 'getAeSaveRollMode', 'getAeConditionImmunity', 'rollSimpleSave', 'buildAeConditionCommand', 'showSaveEffectsMenu', 'showTargetCountMenu', 'showNamedSaveMenu', 'showNamedTargetCountMenu', 'showConditionsMenu', 'cleanSkillKey', 'cleanCheckTitle', 'getSkillBonus', 'spendAeAction', 'handleCheckSave', 'handleSkillCheck', 'getSaveBonus', 'resolveDc', 'getSpellSaveDc', 'getBeaconSheetValue', 'getOptionValue', 'getSelectedTokens', 'getPositionalArgs', 'seReplaceInlineRolls', 'SaveEffectsAPI'];
own('SaveEffects1.3.1.js', saveEffectsGlobals);

const hpManagerGlobals = ['handleHeal', 'showAdminMenu', 'handleAdjust', 'handleSet', 'handleSelected', 'applyHpAdjustment', 'applyHpSet', 'setTokenHp', 'handlePotion', 'handleLayOnHands', 'isFriendlyHealingTarget', 'applyHealing', 'rollPotionDice', 'hpReplaceInlineRolls'];
own('HPManager1.1.1.js', hpManagerGlobals);

own('MetaScriptToolbox.js', ['MetaScriptToolbox']); own('Executioner.js', []); own('Auras.js', ['AURA_TOGGLES']);
const adrGlobals = ['cacheDamageRoll', 'cacheDefaultTemplateDamageRoll', 'handleApplyDamage', 'handleAttackRoll', 'handleSetTargetSlots', 'getTargetSlot', 'handleApplySlotDamage', 'handleSlotTargetCommand', 'handleSlotTargetFx', 'handleSlotTargetRayFx', 'handleSlotTargetMissileFx', 'spawnRayFx', 'spawnMissileFx', 'getCustomFxIdByName', 'getSelectedToken', 'showTargetSlots', 'clearTargetSlots', 'handleRememberedTargetCommand', 'handleRememberedTargetFx', 'handleRememberedTargetRayFx', 'handleRememberedTargetMissileFx', 'showAdrAdminMenu', 'setRememberedTarget', 'clearRememberedTarget', 'clearAdrTurnMemory', 'showAdrStatus', 'undoLastAdrDamage', 'handleUncannyDodge', 'handleDamageReduction', 'rollDamageReduction', 'getAdrOptionValue', 'restoreAdrDamageSnapshot', 'processFireShieldRetaliation', 'getFireShieldRetaliation', 'hasAeEffect', 'getTokenEdgeDistanceFeet', 'applyFireShieldRetaliationDamage', 'getAttackRollMode', 'formatRollMode', 'rollDiceExpression', 'getAeAttackRollModifiers', 'applyCachedDamage', 'extractDamageTitle', 'extractDamageTotal', 'extractDamageType', 'extractDamageParts', 'cleanHtml', 'adrGetAeModifiedDamage', 'adrProcessTokenTriggersBar1Change', 'applyDamageToToken', 'adrReplaceInlineRolls'];
own('AttackDamageResolver1.3.1.js', adrGlobals);
own('SpawnDefaultTokenV1.1.2.js', ['SpawnDefaultToken']); own('Dismiss.js', []); own('AoEBoom1.1.2.js', ['AoEBoom']); own('MapChange.js', ['MapChange']); own('TokenActionBuilder0.4.0.js', ['TokenActionBuilder']); own('Audit.js', ['CachedStateAudit']); own('StateWipe.js', ['PersistentStateManager']); own('BeaconAttributeTester.js', ['BeaconAttributeTester']); own('DoorControl.js', []); own('TokenTriggers1.3.3.js', ['TokenTriggers', 'TokenTriggersAPI']); own('TokenAnimator1.3.js', ['TokenAnimator']); own('HandoutAccess1.1.js', ['HandoutAccess']); own('TargetReport1.0.js', []); own('LootManager1.3.js', ['LootManager']);

const fn = (...names) => Object.fromEntries(names.map((name) => [name, 'function']));
const publicApis = [
  { global: 'GroupInitiative', type: 'object', members: fn('ObserveTurnOrderChange', 'RollForTokenIDs') },
  { global: 'simpleSound', type: 'object', members: fn('CheckInstall', 'RegisterEventHandlers') },
  { global: 'TokenMod', type: 'object', members: fn('ObserveTokenChange') },
  { global: 'ScriptCards', type: 'object', resolve: true, members: fn('ObserveTokenChange') },
  { global: 'MathOps', type: 'object', members: fn('MathProcessor') }, { global: 'Plugger', type: 'object', members: fn('RegisterRule') },
  { global: 'libTable', type: 'object', members: {} }, { global: 'SelectManager', type: 'object', members: fn('GetSelected', 'GetWho', 'GetPlayerID') },
  { global: 'VecMath', type: 'object', members: {} }, { global: 'MatrixMath', type: 'object', members: {} }, { global: 'libInline', type: 'object', members: {} }, { global: 'PathMath', type: 'object', members: {} },
  { global: 'checkLightLevel', type: 'object', members: fn('isLitBy') }, { global: 'libTokenMarkers', type: 'object', members: fn('getStatus', 'getStatuses', 'getOrderedList') }, { global: 'Messenger', type: 'object', members: {} },
  { global: 'SmartAoE', type: 'object', members: fn('ObserveTokenChange') }, { global: 'DoorSounds', type: 'object', members: fn('playSound') },
  { global: 'Fetch', type: 'object', members: { KnownObjectTypes: 'object', PropContainers: 'object', CustomPropsByType: 'object' } },
  { global: 'TurnMarker', type: 'object', members: {} }, { global: 'TurnOrder', type: 'object', members: {} },
  { global: 'ActionEconomyV2API', type: 'object', members: fn('processDamageResult', 'hasEffect', 'getTargetStatus') }, { global: 'ZeroFrame', type: 'object', members: fn('RegisterMetaOp') },
  { global: 'SaveEffectsAPI', type: 'object', members: fn('rollSave') }, { global: 'SpawnDefaultToken', type: 'object', members: fn('spawnAtXY') },
  { global: 'AoEBoom', type: 'object', members: { version: 'string' } }, { global: 'MapChange', type: 'object', members: fn('ConstructMaps', 'RegisterEventHandlers', 'CheckInstall') },
  { global: 'TokenTriggers', type: 'object', members: fn('getHpZeroConfig', 'triggerHpZero', 'restoreToken', 'getBloodiedConfig', 'getRelentlessEnduranceConfig', 'queueBloodied') },
  { global: 'TokenTriggersAPI', type: 'object', members: fn('processBar1Change') },
  { global: 'TokenAnimator', type: 'object', members: {} }, { global: 'HandoutAccess', type: 'object', members: fn('reveal', 'hide', 'revealByReference') }, { global: 'LootManager', type: 'object', members: fn('inspect') }
];

// Exact empty-fixture registration contract after ready and zero-delay timers.
// ScriptCards dynamic trigger-character routes are intentionally absent.
const handlerContracts = Object.fromEntries(files.map((file) => [file, {}]));
Object.assign(handlerContracts, {
  'GroupInitiative.js': { ready: 1, 'chat:message': 1 }, 'SimpleSound.js': { ready: 1, 'chat:message': 1 },
  'TokenMod.js': { ready: 2, 'chat:message': 1, 'change:campaign:_token_markers': 1 }, 'ScriptCards.js': { ready: 1, 'chat:message': 1, 'change:handout': 1 },
  'MathOps.js': { ready: 1, 'chat:message': 1 }, 'Plugger.js': { ready: 2, 'chat:message': 1 }, 'libTable.js': { ready: 1 }, 'Muler.js': { ready: 1, 'chat:message': 3 },
  'SelectManager.js': { ready: 1, 'chat:message': 3 }, 'libInline.js': { ready: 1 }, 'PathMath.js': { 'chat:message': 1 }, 'checkLightLevel.js': { ready: 1, 'chat:message': 1 },
  'libTokenMarkers.js': { ready: 1 }, 'Messenger.js': { ready: 1 }, 'SmartAoE.js': { ready: 1, 'chat:message': 1, 'change:graphic': 1, 'destroy:graphic': 1 },
  'DoorSounds.js': { ready: 1, 'chat:message': 1, 'change:door:isOpen': 1 }, 'Fetch.js': { ready: 1, 'chat:message': 3 },
  'TurnMarker1.js': { ready: 1, 'chat:message': 1, 'change:campaign:initiativepage': 1, 'change:campaign:turnorder': 1, 'change:graphic:lastmove': 1, 'destroy:graphic': 1 },
  'APILogic.js': { ready: 1, 'chat:message': 1 },
  'ActionEconomyV2.8.2.js': { ready: 1, 'chat:message': 1, 'change:campaign:turnorder': 1, 'change:graphic': 1, 'change:graphic:bar1_value': 1, 'change:graphic:bar2_value': 1, 'add:graphic': 1, 'destroy:character': 1, 'destroy:graphic': 1 },
  'ZeroFrame.js': { ready: 1, 'chat:message': 2 }, 'SaveEffects1.3.1.js': { ready: 1, 'chat:message': 1 }, 'MetaScriptToolbox.js': { ready: 1 },
  'Executioner.js': { ready: 1, 'chat:message': 1 }, 'HPManager1.1.1.js': { ready: 1, 'chat:message': 1 }, 'Auras.js': { 'chat:message': 1 },
  'AttackDamageResolver1.3.1.js': { ready: 1, 'chat:message': 1, 'change:campaign:turnorder': 1 },
  'SpawnDefaultTokenV1.1.2.js': { ready: 1, 'chat:message': 1 }, 'Dismiss.js': { 'chat:message': 1 }, 'AoEBoom1.1.2.js': { ready: 1, 'chat:message': 1, 'change:graphic': 1 },
  'MapChange.js': { ready: 1, 'chat:message': 1 }, 'TokenActionBuilder0.4.0.js': { ready: 1, 'chat:message': 1 }, 'Audit.js': { ready: 1, 'chat:message': 1 },
  'StateWipe.js': { ready: 1, 'chat:message': 1 }, 'BeaconAttributeTester.js': { ready: 1, 'chat:message': 1 }, 'DoorControl.js': { ready: 1, 'chat:message': 1 },
  'TokenTriggers1.3.3.js': { ready: 1, 'chat:message': 1, 'change:campaign:turnorder': 1, 'change:graphic:bar1_value': 1, 'destroy:character': 1, 'destroy:graphic': 1 },
  'TokenAnimator1.3.js': { ready: 1, 'chat:message': 1, 'destroy:graphic': 1 }, 'HandoutAccess1.1.js': { ready: 1, 'chat:message': 1 },
  'TargetReport1.0.js': { ready: 1, 'chat:message': 1 }, 'LootManager1.3.js': { ready: 1, 'chat:message': 1 }
});

module.exports = { scripts, publicApis, handlerContracts, sharedMutableGlobals };
