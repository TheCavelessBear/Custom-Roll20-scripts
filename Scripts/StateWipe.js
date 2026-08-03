const PersistentStateManager = (() => {
    'use strict';

    const SCRIPT = 'PersistentStateManager';
    const CONFIRMATION_TEXT = 'WIPE';

    const CUSTOM_STATE_ROOTS = [
        'ActionEconomyV2',
        'AttackDamageResolver',
        'SaveEffects',
        'AoEBoom',
        'Executioner',
        'HPManager',
        'AuraToggle'
    ];

    on('ready', function() {
        log('=== PersistentStateManager Ready ===');
        log('Commands: !statewipe | !statewipe WIPE | !statelist');
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
            '{{Warning=This permanently clears all stored runtime state for AE, ADR, SaveEffects, AoEBoom, Executioner, HPManager, and AuraToggle.}} ' +
            '{{Existing State=' + (existingRoots.join('<br>') || 'None') + '}} ' +
            '{{Does Not Remove=Tokens, characters, pages, macros, abilities, token bars, or Beacon sheet values.}} ' +
            '{{Confirm=[Wipe Custom State](!statewipe WIPE)}}'
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
            '{{Wipe Command=!statewipe}}'
        );
    }

    function getExistingRoots() {
        return CUSTOM_STATE_ROOTS.filter(function(rootName) {
            return Object.prototype.hasOwnProperty.call(state, rootName);
        });
    }

    return {};
})();
