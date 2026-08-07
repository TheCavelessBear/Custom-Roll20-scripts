const PersistentStateManager = (() => {
    'use strict';

    const SCRIPT = 'PersistentStateManager';
    const VERSION = '1.1.0';
    const CONFIRMATION_TEXT = 'WIPE';
    const ownerPruners = {};
    const EXPECTED_PRUNERS = [
        'ActionEconomyV2', 'AttackDamageResolver', 'AoEBoom',
        'BeaconAttributeTester', 'DoorSounds', 'Executioner',
        'GroupInitiative', 'LootManager', 'MapChange', 'SaveEffects',
        'SmartAoE', 'TokenAnimator', 'TokenTriggers'
    ];

    function registerPruner(owner, pruner) {
        if (!owner || typeof pruner !== 'function') {
            throw new Error('PersistentStateManager.registerPruner requires an owner name and function.');
        }
        ownerPruners[owner] = pruner;
    }

    function runPruners(dryRun, context) {
        return EXPECTED_PRUNERS.map(function(owner) {
            if (typeof ownerPruners[owner] !== 'function') {
                return { owner: owner, removed: [], error: 'Unavailable (owner did not register a coordinator pruner).' };
            }
            try {
                const result = ownerPruners[owner]({ dryRun: dryRun, context: context || {} }) || {};
                return { owner: owner, removed: Array.isArray(result.removed) ? result.removed : [], error: result.error || '' };
            } catch (error) {
                return { owner: owner, removed: [], error: error && error.message ? error.message : String(error) };
            }
        });
    }

    function prune(dryRun) {
        const action = dryRun ? 'Will Remove' : 'Removed';
        const reports = runPruners(dryRun);
        const lines = reports.map(function(report) {
            return report.owner + ': ' + (report.error ? report.error : action + ' ' + (report.removed.length ? report.removed.join(', ') : 'None'));
        });
        sendChat(SCRIPT, '/w gm &{template:default} {{name=Persistent State Orphan Prune ' + (dryRun ? 'Preview' : 'Complete') + '}} {{Results=' + (lines.join('<br>') || 'No registered owner pruners.') + '}} {{Mode=' + (dryRun ? 'Dry run; state was not changed.' : 'Applied; rerunning is safe.') + '}}');
        return reports;
    }

    function pruneOwner(owner, context) {
        if (typeof ownerPruners[owner] !== 'function') return { removed: [], error: 'No registered pruner.' };
        return ownerPruners[owner]({ dryRun: false, context: context || {} }) || { removed: [] };
    }

    const CUSTOM_STATE_ROOTS = [
        'ActionEconomyV2',
        'AttackDamageResolver',
        'SaveEffects',
        'AoEBoom',
        'SmartAoE',
        'DoorSounds',
        'Executioner',
        'GroupInitiative',
        'LootManager',
        'MapChange',
        'BeaconAttributeTester',
        'TokenTriggers',
        'TokenAnimator',
        'TokenSizeAnimator',
        'HPManager',
        'AuraToggle'
    ];

    on('ready', function() {
        log('=== PersistentStateManager ' + VERSION + ' Ready ===');
        log('Commands: !statewipe | !statewipe WIPE | !statewipe prune [preview] | !statelist');
    });

    on('chat:message', function(msg) {
        if (msg.type !== 'api') return;

        if (msg.content.match(/^!statelist(\s|$)/)) {
            if (!playerIsGM(msg.playerid)) {
                sendChat(SCRIPT, '/w "' + msg.who + '" GM only.');
                return;
            }

            showStateList();
            return;
        }

        if (!msg.content.match(/^!statewipe(\s|$)/)) return;

        if (!playerIsGM(msg.playerid)) {
            sendChat(SCRIPT, '/w "' + msg.who + '" GM only.');
            return;
        }

        const args = msg.content.trim().split(/\s+/);
        if (args[1] === 'prune') {
            prune(args[2] === 'preview');
            return;
        }

        const confirmation = args[1] || '';

        if (confirmation !== CONFIRMATION_TEXT) {
            showConfirmation();
            return;
        }

        wipeCustomState();
    });

    function showConfirmation() {
        const existingRoots = getExistingRoots();

        sendChat(
            SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=Persistent State Wipe}} ' +
            '{{Warning=This permanently clears every listed custom-state root. Orphan prune is separate and only removes invalid owner records.}} ' +
            '{{Existing State=' + (existingRoots.join('<br>') || 'None') + '}} ' +
            '{{Does Not Remove=Tokens, characters, pages, macros, abilities, token bars, or Beacon sheet values.}} ' +
            '{{Confirm=[Wipe Custom State](!statewipe WIPE)}} ' +
            '{{Orphan Cleanup=[Preview](!statewipe prune preview) [Apply](!statewipe prune)}}'
        );
    }

    function wipeCustomState() {
        const removed = [];
        const missing = [];

        CUSTOM_STATE_ROOTS.forEach(function(rootName) {
            if (Object.prototype.hasOwnProperty.call(state, rootName)) {
                delete state[rootName];
                removed.push(rootName);
                return;
            }

            missing.push(rootName);
        });

        log('==================================================');
        log('PERSISTENT CUSTOM STATE WIPE');
        log('Removed: ' + (removed.join(', ') || 'None'));
        log('Not present: ' + (missing.join(', ') || 'None'));
        log('==================================================');

        sendChat(
            SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=Persistent State Cleared}} ' +
            '{{Removed=' + (removed.join('<br>') || 'None') + '}} ' +
            '{{Not Present=' + (missing.join('<br>') || 'None') + '}} ' +
            '{{Next Step=Restart the Mod sandbox so each script creates fresh state.}}'
        );
    }

    function showStateList() {
        const existingRoots = getExistingRoots();
        const missingRoots = CUSTOM_STATE_ROOTS.filter(function(rootName) {
            return !Object.prototype.hasOwnProperty.call(state, rootName);
        });

        sendChat(
            SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=Custom Persistent State}} ' +
            '{{Existing=' + (existingRoots.join('<br>') || 'None') + '}} ' +
            '{{Not Present=' + (missingRoots.join('<br>') || 'None') + '}} ' +
            '{{Prune=!statewipe prune preview | !statewipe prune}} ' +
            '{{Wipe Command=!statewipe}}'
        );
    }

    function getExistingRoots() {
        return CUSTOM_STATE_ROOTS.filter(function(rootName) {
            return Object.prototype.hasOwnProperty.call(state, rootName);
        });
    }

    return {
        version: VERSION,
        registerPruner: registerPruner,
        prune: prune,
        pruneOwner: pruneOwner,
        expectedPruners: EXPECTED_PRUNERS.slice()
    };
})();
