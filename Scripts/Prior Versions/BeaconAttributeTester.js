const BeaconAttributeTester = (() => {
    'use strict';

    const SCRIPT = 'BeaconAttributeTester';

    on('ready', function() {
        state.BeaconAttributeTester = state.BeaconAttributeTester || {};
        state.BeaconAttributeTester.snapshots =
            state.BeaconAttributeTester.snapshots || {};

        log('=== BeaconAttributeTester Ready ===');
        log('Commands: !btest read ATTR | !btest snapshot ATTR | !btest compare ATTR | !btest write ATTR VALUE --confirm');
    });

    on('chat:message', async function(msg) {
        if (msg.type !== 'api') return;
        if (!msg.content.match(/^!btest(\s|$)/)) return;

        if (!playerIsGM(msg.playerid)) {
            sendChat(SCRIPT, '/w "' + msg.who + '" GM only.');
            return;
        }

        const args = msg.content.trim().split(/\s+/);
        const command = String(args[1] || 'help').toLowerCase();

        if (command === 'help') {
            showHelp();
            return;
        }

        const token = getSelectedToken(msg);

        if (!token) {
            whisper('Select one token.');
            return;
        }

        const characterId = token.get('represents');

        if (!characterId) {
            whisper('The selected token does not represent a character.');
            return;
        }

        const character = getObj('character', characterId);

        if (!character) {
            whisper('The selected token represents an invalid character.');
            return;
        }

        const attributeName = args[2];

        if (!attributeName) {
            whisper('Provide an attribute name.');
            return;
        }

        if (command === 'read') {
            await readAttribute(
                character,
                token,
                attributeName
            );
            return;
        }

        if (command === 'snapshot') {
            await snapshotAttribute(
                msg,
                character,
                token,
                attributeName
            );
            return;
        }

        if (command === 'compare') {
            await compareAttribute(
                msg,
                character,
                token,
                attributeName
            );
            return;
        }

        if (command === 'write') {
            await writeAttribute(
                character,
                token,
                attributeName,
                args.slice(3)
            );
            return;
        }

        showHelp();
    });

    function getSelectedToken(msg) {
        if (!msg.selected || !msg.selected.length) {
            return null;
        }

        return getObj(
            'graphic',
            msg.selected[0]._id
        );
    }

    async function readAttribute(
        character,
        token,
        attributeName
    ) {
        if (typeof getSheetItem !== 'function') {
            whisper('getSheetItem is unavailable. Confirm that this game is using the Experimental Mod sandbox.');
            return;
        }

        try {
            const value = await getSheetItem(
                character.id,
                attributeName
            );

            sendResultCard({
                title: 'Beacon Attribute Read',
                tokenName: token.get('name'),
                characterName: character.get('name'),
                attributeName: attributeName,
                value: value
            });
        } catch (error) {
            whisper(
                'Read failed for ' +
                attributeName +
                ': ' +
                error.message
            );
        }
    }

    async function snapshotAttribute(
        msg,
        character,
        token,
        attributeName
    ) {
        if (typeof getSheetItem !== 'function') {
            whisper('getSheetItem is unavailable.');
            return;
        }

        try {
            const value = await getSheetItem(
                character.id,
                attributeName
            );

            const snapshotKey = getSnapshotKey(
                msg.playerid,
                character.id,
                attributeName
            );

            state.BeaconAttributeTester.snapshots[snapshotKey] = {
                characterId: character.id,
                characterName: character.get('name'),
                tokenName: token.get('name'),
                attributeName: attributeName,
                value: normalizeStoredValue(value),
                timestamp: Date.now()
            };

            sendResultCard({
                title: 'Beacon Attribute Snapshot',
                tokenName: token.get('name'),
                characterName: character.get('name'),
                attributeName: attributeName,
                value: value,
                extraLabel: 'Next Step',
                extraValue: 'Change the value through the character sheet, then run !btest compare ' + attributeName
            });
        } catch (error) {
            whisper(
                'Snapshot failed for ' +
                attributeName +
                ': ' +
                error.message
            );
        }
    }

    async function compareAttribute(
        msg,
        character,
        token,
        attributeName
    ) {
        if (typeof getSheetItem !== 'function') {
            whisper('getSheetItem is unavailable.');
            return;
        }

        const snapshotKey = getSnapshotKey(
            msg.playerid,
            character.id,
            attributeName
        );

        const snapshot =
            state.BeaconAttributeTester.snapshots[snapshotKey];

        if (!snapshot) {
            whisper(
                'No snapshot exists for ' +
                attributeName +
                ' on this character. Run !btest snapshot ' +
                attributeName +
                ' first.'
            );
            return;
        }

        try {
            const currentValue = await getSheetItem(
                character.id,
                attributeName
            );

            const normalizedCurrent =
                normalizeStoredValue(currentValue);

            const changed =
                snapshot.value !== normalizedCurrent;

            sendChat(
                SCRIPT,
                '/w gm &{template:default} ' +
                '{{name=Beacon Attribute Comparison}} ' +
                '{{Token=' + escapeChat(token.get('name')) + '}} ' +
                '{{Character=' + escapeChat(character.get('name')) + '}} ' +
                '{{Attribute=' + escapeChat(attributeName) + '}} ' +
                '{{Before=' + escapeChat(formatValue(snapshot.value)) + '}} ' +
                '{{After=' + escapeChat(formatValue(normalizedCurrent)) + '}} ' +
                '{{Changed=' + (changed ? 'Yes' : 'No') + '}}'
            );
        } catch (error) {
            whisper(
                'Comparison failed for ' +
                attributeName +
                ': ' +
                error.message
            );
        }
    }

    async function writeAttribute(
        character,
        token,
        attributeName,
        valueArgs
    ) {
        if (typeof getSheetItem !== 'function') {
            whisper('getSheetItem is unavailable.');
            return;
        }

        if (typeof setSheetItem !== 'function') {
            whisper('setSheetItem is unavailable.');
            return;
        }

        const confirmIndex =
            valueArgs.indexOf('--confirm');

        if (confirmIndex === -1) {
            whisper(
                'Write requires confirmation.<br>' +
                'Format: !btest write ' +
                attributeName +
                ' VALUE --confirm'
            );
            return;
        }

        valueArgs.splice(confirmIndex, 1);

        if (!valueArgs.length) {
            whisper('Provide a value to write.');
            return;
        }

        const rawValue = valueArgs.join(' ');
        const writeValue = parseWriteValue(rawValue);

        try {
            const beforeValue = await getSheetItem(
                character.id,
                attributeName
            );

            await setSheetItem(
                character.id,
                attributeName,
                writeValue
            );

            const immediateValue = await getSheetItem(
                character.id,
                attributeName
            );

            setTimeout(async function() {
                try {
                    const delayedValue = await getSheetItem(
                        character.id,
                        attributeName
                    );

                    sendChat(
                        SCRIPT,
                        '/w gm &{template:default} ' +
                        '{{name=Beacon Attribute Write Test}} ' +
                        '{{Token=' + escapeChat(token.get('name')) + '}} ' +
                        '{{Character=' + escapeChat(character.get('name')) + '}} ' +
                        '{{Attribute=' + escapeChat(attributeName) + '}} ' +
                        '{{Requested Value=' + escapeChat(formatValue(writeValue)) + '}} ' +
                        '{{Before=' + escapeChat(formatValue(beforeValue)) + '}} ' +
                        '{{Immediate Read=' + escapeChat(formatValue(immediateValue)) + '}} ' +
                        '{{Delayed Read=' + escapeChat(formatValue(delayedValue)) + '}} ' +
                        '{{Persisted=' +
                            (
                                normalizeStoredValue(delayedValue) ===
                                normalizeStoredValue(writeValue)
                                    ? 'Yes'
                                    : 'No'
                            ) +
                        '}}'
                    );
                } catch (error) {
                    whisper(
                        'Delayed read failed for ' +
                        attributeName +
                        ': ' +
                        error.message
                    );
                }
            }, 1500);
        } catch (error) {
            whisper(
                'Write failed for ' +
                attributeName +
                ': ' +
                error.message
            );
        }
    }

    function parseWriteValue(rawValue) {
        const trimmed = String(rawValue).trim();

        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            return Number(trimmed);
        }

        if (trimmed === 'true') {
            return true;
        }

        if (trimmed === 'false') {
            return false;
        }

        return trimmed;
    }

    function normalizeStoredValue(value) {
        if (value === undefined) return '__UNDEFINED__';
        if (value === null) return '__NULL__';

        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch (error) {
                return String(value);
            }
        }

        return String(value);
    }

    function formatValue(value) {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (value === '') return '[empty string]';

        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch (error) {
                return String(value);
            }
        }

        if (value === '__UNDEFINED__') return 'undefined';
        if (value === '__NULL__') return 'null';

        return String(value);
    }

    function getSnapshotKey(
        playerId,
        characterId,
        attributeName
    ) {
        return (
            playerId +
            '|' +
            characterId +
            '|' +
            attributeName
        );
    }

    function sendResultCard(data) {
        let card =
            '/w gm &{template:default} ' +
            '{{name=' + escapeChat(data.title) + '}} ' +
            '{{Token=' + escapeChat(data.tokenName) + '}} ' +
            '{{Character=' + escapeChat(data.characterName) + '}} ' +
            '{{Attribute=' + escapeChat(data.attributeName) + '}} ' +
            '{{Value=' + escapeChat(formatValue(data.value)) + '}}';

        if (data.extraLabel) {
            card +=
                '{{' +
                escapeChat(data.extraLabel) +
                '=' +
                escapeChat(data.extraValue) +
                '}}';
        }

        sendChat(SCRIPT, card);
    }

    function showHelp() {
        sendChat(
            SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=Beacon Attribute Tester}} ' +
            '{{Read=!btest read ATTRIBUTE}} ' +
            '{{Snapshot=!btest snapshot ATTRIBUTE}} ' +
            '{{Compare=!btest compare ATTRIBUTE}} ' +
            '{{Write=!btest write ATTRIBUTE VALUE --confirm}}'
        );
    }

    function whisper(message) {
        sendChat(
            SCRIPT,
            '/w gm ' + message
        );
    }

    function escapeChat(value) {
        return String(
            value === undefined || value === null
                ? ''
                : value
        )
            .replace(/&/g, '&amp;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;')
            .replace(/\|/g, '&#124;');
    }

    return {};
})();
