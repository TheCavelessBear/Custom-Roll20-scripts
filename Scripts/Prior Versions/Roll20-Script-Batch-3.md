/*
================================================================
ROLL20 SCRIPT BATCH 3
TABLE OF CONTENTS
Line 19 - DoorSounds
Line 590 - DoorControl
Line 641 - HPManager
Line 970 - Executioner
Line 1064 - Dismiss
Line 1087 - Auras
Line 1153 - BeaconAttributeTester
Line 1647 - Audit
Line 1996 - StateWipe
================================================================
*/

/*
================================================================
BEGIN SCRIPT: DoorSounds
SOURCE FILE: DoorSounds(1).md
================================================================
*/
const DoorSounds = (() => {
    const SCRIPT = 'DoorSounds';
    const VERSION = '1.0.0';

    const DEFAULT_GROUPS = {
        default: {
            display: 'Default',
            open: [],
            close: []
        },
        wood: {
            display: 'Wood',
            open: [],
            close: []
        },
        stone: {
            display: 'Stone',
            open: [],
            close: []
        },
        metal: {
            display: 'Metal',
            open: [],
            close: []
        },
        gate: {
            display: 'Gate',
            open: [],
            close: []
        }
    };

    function checkInstall() {
        state.DoorSounds = state.DoorSounds || {};
        state.DoorSounds.groups = state.DoorSounds.groups || {};
        state.DoorSounds.doors = state.DoorSounds.doors || {};
        state.DoorSounds.config = state.DoorSounds.config || {};

        if (state.DoorSounds.config.playSecretDoors === undefined) {
            state.DoorSounds.config.playSecretDoors = true;
        }

        if (state.DoorSounds.initialized !== true) {
            Object.keys(DEFAULT_GROUPS).forEach(function(groupKey) {
                state.DoorSounds.groups[groupKey] = {
                    display: DEFAULT_GROUPS[groupKey].display,
                    open: DEFAULT_GROUPS[groupKey].open.slice(),
                    close: DEFAULT_GROUPS[groupKey].close.slice()
                };
            });

            state.DoorSounds.initialized = true;
        }

        Object.keys(state.DoorSounds.groups).forEach(function(groupKey) {
            const group = state.DoorSounds.groups[groupKey];

            group.display = group.display || displayGroupName(groupKey);
            group.open = group.open || [];
            group.close = group.close || [];
        });

        state.DoorSounds.version = VERSION;

        log('=== DoorSounds v' + VERSION + ' Ready ===');
    }

    function tokenize(content) {
        const tokens = [];
        const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            tokens.push(match[1] || match[2] || match[3]);
        }

        return tokens;
    }


    function isTrue(value) {
        return value === true || String(value).toLowerCase() === 'true';
    }

    function normalizeGroupKey(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/_/g, '-')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function displayGroupName(value) {
        return String(value || '')
            .replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, function(character) {
                return character.toUpperCase();
            });
    }

    function getGroup(groupInput) {
        const key = normalizeGroupKey(groupInput);
        const group = state.DoorSounds.groups[key];

        if (!key || !group) return null;

        return {
            key: key,
            group: group
        };
    }

    function getRandomTrack(tracks) {
        return tracks[Math.floor(Math.random() * tracks.length)];
    }

    function playSound(trackName) {
        const track = findObjs({
            type: 'jukeboxtrack',
            title: trackName
        })[0];

        if (!track) {
            sendChat(SCRIPT, '/w gm DoorSounds: No Track Found: ' + trackName);
            log('DoorSounds: No track found: ' + trackName);
            return false;
        }

        track.set('playing', false);
        track.set('softstop', false);
        track.set('playing', true);

        return true;
    }

    function handleDoorChange(door, prev) {
        const wasOpen = isTrue(prev.isOpen);
        const isOpen = isTrue(door.get('isOpen'));

        if (wasOpen === isOpen) return;

        if (
            isTrue(door.get('isSecret')) &&
            state.DoorSounds.config.playSecretDoors !== true
        ) {
            return;
        }

        const groupKey = state.DoorSounds.doors[door.id];

        if (!groupKey) return;

        const groupData = getGroup(groupKey);

        if (!groupData) {
            delete state.DoorSounds.doors[door.id];
            return;
        }

        const tracks = isOpen ? groupData.group.open : groupData.group.close;

        if (!tracks || !tracks.length) return;

        playSound(getRandomTrack(tracks));
    }

    function sendHelp() {
        sendChat(
            SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=DoorSounds Commands}} ' +
            '{{Door Assignment=' +
                '!doorsound assign DOOR_ID GROUP<br>' +
                '!doorsound remove DOOR_ID<br>' +
                '!doorsound door DOOR_ID<br>' +
                '!doorsound doors}} ' +
            '{{Group Management=' +
                '!doorsound group create GROUP<br>' +
                '!doorsound group delete GROUP<br>' +
                '!doorsound group addopen GROUP "TRACK NAME"<br>' +
                '!doorsound group addclose GROUP "TRACK NAME"<br>' +
                '!doorsound group removeopen GROUP "TRACK NAME"<br>' +
                '!doorsound group removeclose GROUP "TRACK NAME"<br>' +
                '!doorsound group clearopen GROUP<br>' +
                '!doorsound group clearclose GROUP}} ' +
            '{{Review and Test=' +
                '!doorsound groups<br>' +
                '!doorsound test GROUP open/close<br>' +
                '!doorsound config secret on/off}}'
        );
    }

    function addTrack(groupData, mode, trackName) {
        if (!trackName) {
            sendChat(SCRIPT, '/w gm DoorSounds: Track name is required.');
            return;
        }

        const tracks = groupData.group[mode];
        const duplicate = tracks.some(function(existingTrack) {
            return String(existingTrack).toLowerCase() === String(trackName).toLowerCase();
        });

        if (duplicate) {
            sendChat(
                SCRIPT,
                '/w gm DoorSounds: ' + trackName + ' is already in ' +
                groupData.group.display + ' ' + mode + ' sounds.'
            );
            return;
        }

        tracks.push(trackName);

        sendChat(
            SCRIPT,
            '/w gm DoorSounds: Added ' + trackName + ' to ' +
            groupData.group.display + ' ' + mode + ' sounds.'
        );
    }

    function removeTrack(groupData, mode, trackName) {
        if (!trackName) {
            sendChat(SCRIPT, '/w gm DoorSounds: Track name is required.');
            return;
        }

        const tracks = groupData.group[mode];
        const index = tracks.findIndex(function(existingTrack) {
            return String(existingTrack).toLowerCase() === String(trackName).toLowerCase();
        });

        if (index === -1) {
            sendChat(
                SCRIPT,
                '/w gm DoorSounds: Track not found in ' +
                groupData.group.display + ' ' + mode + ' sounds.'
            );
            return;
        }

        const removedTrack = tracks.splice(index, 1)[0];

        sendChat(
            SCRIPT,
            '/w gm DoorSounds: Removed ' + removedTrack + ' from ' +
            groupData.group.display + ' ' + mode + ' sounds.'
        );
    }

    function handleGroupCommand(args) {
        const action = String(args[2] || '').toLowerCase();
        const groupInput = args[3];
        const trackName = args.slice(4).join(' ');

        if (action === 'create') {
            const groupKey = normalizeGroupKey(groupInput);

            if (!groupKey) {
                sendChat(SCRIPT, '/w gm DoorSounds: Group name is required.');
                return;
            }

            if (state.DoorSounds.groups[groupKey]) {
                sendChat(SCRIPT, '/w gm DoorSounds: Group already exists: ' + groupKey + '.');
                return;
            }

            state.DoorSounds.groups[groupKey] = {
                display: displayGroupName(groupKey),
                open: [],
                close: []
            };

            sendChat(SCRIPT, '/w gm DoorSounds: Created group ' + displayGroupName(groupKey) + '.');
            return;
        }

        const groupData = getGroup(groupInput);

        if (!groupData) {
            sendChat(SCRIPT, '/w gm DoorSounds: Invalid group: ' + (groupInput || 'None') + '.');
            return;
        }

        if (action === 'delete') {
            let removedAssignments = 0;

            Object.keys(state.DoorSounds.doors).forEach(function(doorId) {
                if (state.DoorSounds.doors[doorId] !== groupData.key) return;

                delete state.DoorSounds.doors[doorId];
                removedAssignments++;
            });

            delete state.DoorSounds.groups[groupData.key];

            sendChat(
                SCRIPT,
                '/w gm DoorSounds: Deleted group ' + groupData.group.display +
                ' and removed ' + removedAssignments + ' door assignment(s).'
            );
            return;
        }

        if (action === 'addopen') {
            addTrack(groupData, 'open', trackName);
            return;
        }

        if (action === 'addclose') {
            addTrack(groupData, 'close', trackName);
            return;
        }

        if (action === 'removeopen') {
            removeTrack(groupData, 'open', trackName);
            return;
        }

        if (action === 'removeclose') {
            removeTrack(groupData, 'close', trackName);
            return;
        }

        if (action === 'clearopen') {
            groupData.group.open = [];
            sendChat(SCRIPT, '/w gm DoorSounds: Cleared opening sounds for ' + groupData.group.display + '.');
            return;
        }

        if (action === 'clearclose') {
            groupData.group.close = [];
            sendChat(SCRIPT, '/w gm DoorSounds: Cleared closing sounds for ' + groupData.group.display + '.');
            return;
        }

        sendHelp();
    }

    function assignDoor(args) {
        const doorId = args[2];
        const groupData = getGroup(args[3]);
        const door = getObj('door', doorId);

        if (!door) {
            sendChat(SCRIPT, '/w gm DoorSounds: Invalid door ID.');
            return;
        }

        if (!groupData) {
            sendChat(SCRIPT, '/w gm DoorSounds: Invalid group.');
            return;
        }

        state.DoorSounds.doors[door.id] = groupData.key;

        sendChat(
            SCRIPT,
            '/w gm DoorSounds: Assigned door ' + door.id + ' to ' + groupData.group.display + '.'
        );
    }

    function removeDoorAssignment(args) {
        const doorId = args[2];

        if (!doorId || !state.DoorSounds.doors[doorId]) {
            sendChat(SCRIPT, '/w gm DoorSounds: Door is not assigned to a sound group.');
            return;
        }

        delete state.DoorSounds.doors[doorId];
        sendChat(SCRIPT, '/w gm DoorSounds: Removed sound assignment for door ' + doorId + '.');
    }

    function showDoor(args) {
        const doorId = args[2];
        const door = getObj('door', doorId);

        if (!door) {
            sendChat(SCRIPT, '/w gm DoorSounds: Invalid door ID.');
            return;
        }

        const groupKey = state.DoorSounds.doors[door.id];
        const groupData = groupKey ? getGroup(groupKey) : null;
        const page = getObj('page', door.get('_pageid'));

        sendChat(
            SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=Door Sound Assignment}} ' +
            '{{Door ID=' + door.id + '}} ' +
            '{{Page=' + (page ? page.get('name') : 'Unknown') + '}} ' +
            '{{Group=' + (groupData ? groupData.group.display : 'None') + '}} ' +
            '{{State=' + (door.get('isOpen') ? 'Open' : 'Closed') + '}} ' +
            '{{Secret=' + (door.get('isSecret') ? 'Yes' : 'No') + '}}'
        );
    }

    function showGroups() {
        const groupKeys = Object.keys(state.DoorSounds.groups).sort();

        if (!groupKeys.length) {
            sendChat(SCRIPT, '/w gm DoorSounds: No sound groups exist.');
            return;
        }

        const lines = groupKeys.map(function(groupKey) {
            const group = state.DoorSounds.groups[groupKey];

            return '<b>' + group.display + '</b> (' + groupKey + ')' +
                '<br>Open: ' + (group.open.length ? group.open.join(', ') : 'None') +
                '<br>Close: ' + (group.close.length ? group.close.join(', ') : 'None');
        });

        sendChat(
            SCRIPT,
            '/w gm &{template:default} {{name=Door Sound Groups}} {{Groups=' + lines.join('<hr>') + '}}'
        );
    }

    function showDoors() {
        const doorIds = Object.keys(state.DoorSounds.doors);

        if (!doorIds.length) {
            sendChat(SCRIPT, '/w gm DoorSounds: No doors are assigned.');
            return;
        }

        const lines = doorIds.map(function(doorId) {
            const door = getObj('door', doorId);
            const groupData = getGroup(state.DoorSounds.doors[doorId]);
            const page = door ? getObj('page', door.get('_pageid')) : null;

            return doorId + ' — ' +
                (groupData ? groupData.group.display : 'Missing Group') +
                ' — ' +
                (page ? page.get('name') : 'Missing Door');
        });

        sendChat(
            SCRIPT,
            '/w gm &{template:default} {{name=Assigned Door Sounds}} {{Doors=' + lines.join('<br>') + '}}'
        );
    }

    function testGroup(args) {
        const groupData = getGroup(args[2]);
        const mode = String(args[3] || '').toLowerCase();

        if (!groupData) {
            sendChat(SCRIPT, '/w gm DoorSounds: Invalid group.');
            return;
        }

        if (mode !== 'open' && mode !== 'close') {
            sendChat(SCRIPT, '/w gm DoorSounds: Use !doorsound test GROUP open or close.');
            return;
        }

        const tracks = groupData.group[mode];

        if (!tracks.length) {
            sendChat(
                SCRIPT,
                '/w gm DoorSounds: ' + groupData.group.display + ' has no ' + mode + ' sounds.'
            );
            return;
        }

        playSound(getRandomTrack(tracks));
    }

    function handleConfig(args) {
        const setting = String(args[2] || '').toLowerCase();
        const value = String(args[3] || '').toLowerCase();

        if (setting !== 'secret' || (value !== 'on' && value !== 'off')) {
            sendChat(SCRIPT, '/w gm DoorSounds: Use !doorsound config secret on/off.');
            return;
        }

        state.DoorSounds.config.playSecretDoors = value === 'on';

        sendChat(
            SCRIPT,
            '/w gm DoorSounds: Secret-door sounds are now ' +
            (state.DoorSounds.config.playSecretDoors ? 'enabled.' : 'disabled.')
        );
    }

    function handleInput(msg) {
        if (msg.type !== 'api') return;
        if (!msg.content.match(/^!doorsound(\s|$)/)) return;
        if (!playerIsGM(msg.playerid)) return;

        const args = tokenize(msg.content);
        const command = String(args[1] || 'menu').toLowerCase();

        if (command === 'menu' || command === 'help') {
            sendHelp();
            return;
        }

        if (command === 'group') {
            handleGroupCommand(args);
            return;
        }

        if (command === 'assign') {
            assignDoor(args);
            return;
        }

        if (command === 'remove') {
            removeDoorAssignment(args);
            return;
        }

        if (command === 'door') {
            showDoor(args);
            return;
        }

        if (command === 'groups') {
            showGroups();
            return;
        }

        if (command === 'doors' || command === 'list') {
            showDoors();
            return;
        }

        if (command === 'test') {
            testGroup(args);
            return;
        }

        if (command === 'config') {
            handleConfig(args);
            return;
        }

        sendHelp();
    }

    on('ready', checkInstall);
    on('chat:message', handleInput);
    on('change:door:isOpen', handleDoorChange);

    return {
        playSound: playSound
    };
})();
/*
================================================================
END SCRIPT: DoorSounds
================================================================
*/

/*
================================================================
BEGIN SCRIPT: DoorControl
SOURCE FILE: DoorControl(1).md
================================================================
*/
on('ready', function() {
    log('=== DoorControl Ready ===');
});

on('chat:message', function(msg) {
    if (msg.type !== 'api') return;
    if (!msg.content.match(/^!doorctl(\s|$)/)) return;
    if (!playerIsGM(msg.playerid)) return;

    const args = msg.content.split(/\s+/);
    const command = String(args[1] || '').toLowerCase();
    const doorId = args[2];
    const door = getObj('door', doorId);

    if (!door) {
        sendChat('DoorControl', '/w gm DoorControl: Invalid door ID.');
        return;
    }

    if (command === 'open') {
        door.set('isOpen', true);
        return;
    }

    if (command === 'close') {
        door.set('isOpen', false);
        return;
    }

    if (command === 'toggle') {
        door.set('isOpen', !door.get('isOpen'));
        return;
    }

    sendChat(
        'DoorControl',
        '/w gm DoorControl: Use !doorctl open DOOR_ID, !doorctl close DOOR_ID, or !doorctl toggle DOOR_ID.'
    );
});
/*
================================================================
END SCRIPT: DoorControl
================================================================
*/

/*
================================================================
BEGIN SCRIPT: HPManager
SOURCE FILE: HPManager.md
================================================================
*/
on('ready', function() {
    state.HPManager = state.HPManager || {};
    log('=== HPManager Ready ===');
});

on('chat:message', function(msg) {
    if (msg.type !== 'api') return;
    if (!msg.content.match(/^!hp(\s|$)/)) return;

    const content = replaceInlineRolls(msg);
    const args = content.split(/\s+/);
    const command = args[1];

    if (!command || command === 'admin') {
        showAdminMenu(msg);
        return;
    }

    if (command === 'heal') {
        handleHeal(args);
        return;
    }

    if (command === 'adjust') {
        handleAdjust(args);
        return;
    }

    if (command === 'set') {
        handleSet(args);
        return;
    }

    if (command === 'selected') {
        handleSelected(msg, args);
        return;
    }

    if (command === 'potion') {
        handlePotion(args);
        return;
    }

    if (command === 'layonhands') {
        handleLayOnHands(args);
        return;
    }

    sendChat('HPManager', '/w gm Commands: !hp admin | !hp adjust TOKEN AMOUNT LABEL | !hp set TOKEN full/0/AMOUNT LABEL | !hp selected adjust AMOUNT LABEL | !hp selected set full/0/AMOUNT LABEL | !hp heal TOKEN AMOUNT LABEL | !hp potion action/bonus TYPE TOKEN | !hp layonhands TOKEN AMOUNT');
});

function handleHeal(args) {
    const tokenId = args[2];
    const amount = Number(args[3]);
    const label = args.slice(4).join(' ') || 'Healing';

    const token = getObj('graphic', tokenId);

    if (!token) {
        sendChat('HPManager', '/w gm No valid target token found.');
        return;
    }

    if (isNaN(amount) || amount < 0) {
        sendChat('HPManager', '/w gm Invalid healing amount.');
        return;
    }

    applyHealing(token, amount, label);
}

function showAdminMenu(msg) {
    const card =
        '/w gm &{template:default} ' +
        '{{name=HP Manager Admin}} ' +
        '{{Target Token=[Add HP](!hp adjust &#64;{target&#124;HP Target&#124;token_id} ?{HP Change&#124;5} Admin HP) [Subtract HP](!hp adjust &#64;{target&#124;HP Target&#124;token_id} -?{HP Change&#124;5} Admin HP) [Full HP](!hp set &#64;{target&#124;HP Target&#124;token_id} full Admin Full HP) [0 HP](!hp set &#64;{target&#124;HP Target&#124;token_id} 0 Admin 0 HP)}} ' +
        '{{Selected Tokens=[Add HP](!hp selected adjust ?{HP Change&#124;5} Admin HP) [Subtract HP](!hp selected adjust -?{HP Change&#124;5} Admin HP) [Full HP](!hp selected set full Admin Full HP) [0 HP](!hp selected set 0 Admin 0 HP)}}';

    sendChat('HPManager', card);
}

function handleAdjust(args) {
    const tokenId = args[2];
    const amount = Number(args[3]);
    const label = args.slice(4).join(' ') || 'HP Adjustment';

    const token = getObj('graphic', tokenId);

    if (!token) {
        sendChat('HPManager', '/w gm No valid target token found.');
        return;
    }

    if (isNaN(amount)) {
        sendChat('HPManager', '/w gm Invalid HP adjustment amount.');
        return;
    }

    applyHpAdjustment(token, amount, label);
}

function handleSet(args) {
    const tokenId = args[2];
    const value = args[3];
    const label = args.slice(4).join(' ') || 'Set HP';

    const token = getObj('graphic', tokenId);

    if (!token) {
        sendChat('HPManager', '/w gm No valid target token found.');
        return;
    }

    applyHpSet(token, value, label);
}

function handleSelected(msg, args) {
    const mode = args[2];
    const value = args[3];
    const label = args.slice(4).join(' ') || 'Selected HP';

    if (!msg.selected || !msg.selected.length) {
        sendChat('HPManager', '/w gm No tokens selected.');
        return;
    }

    msg.selected.forEach(function(selected) {
        const token = getObj('graphic', selected._id);

        if (!token) return;

        if (mode === 'adjust') {
            const amount = Number(value);

            if (!isNaN(amount)) {
                applyHpAdjustment(token, amount, label);
            }
        }

        if (mode === 'set') {
            applyHpSet(token, value, label);
        }
    });
}

function applyHpAdjustment(token, amount, label) {
    const currentHp = Number(token.get('bar1_value')) || 0;
    const maxHp = Number(token.get('bar1_max')) || 0;

    let newHp = currentHp + amount;

    if (maxHp > 0) {
        newHp = Math.min(newHp, maxHp);
    }

    newHp = Math.max(newHp, 0);

    setTokenHp(token, newHp);

    sendChat(
        'HPManager',
        '&{template:default} ' +
        '{{name=' + label + '}} ' +
        '{{Target=' + token.get('name') + '}} ' +
        '{{HP Change=' + amount + '}} ' +
        '{{HP=' + currentHp + ' → ' + newHp + '}}'
    );
}

function applyHpSet(token, value, label) {
    const currentHp = Number(token.get('bar1_value')) || 0;
    const maxHp = Number(token.get('bar1_max')) || 0;

    let newHp;

    if (value === 'full') {
        newHp = maxHp;
    } else {
        newHp = Number(value);
    }

    if (isNaN(newHp)) {
        sendChat('HPManager', '/w gm Invalid HP value.');
        return;
    }

    if (maxHp > 0) {
        newHp = Math.min(newHp, maxHp);
    }

    newHp = Math.max(newHp, 0);

    setTokenHp(token, newHp);

    sendChat(
        'HPManager',
        '&{template:default} ' +
        '{{name=' + label + '}} ' +
        '{{Target=' + token.get('name') + '}} ' +
        '{{HP=' + currentHp + ' → ' + newHp + '}}'
    );
}

function setTokenHp(token, newHp) {
    token.set('bar1_value', newHp);

    const characterId = token.get('represents');

    if (characterId && typeof setSheetItem === 'function') {
        setSheetItem(characterId, 'hp', newHp);
    }
}

function handlePotion(args) {
    const mode = args[2];
    const potion = args[3];
    const tokenId = args[4];

    const token = getObj('graphic', tokenId);

    if (!token) {
        sendChat('HPManager', '/w gm No valid token found.');
        return;
    }

    const potionData = {
        healing:  { name: 'Potion of Healing', dice: '2d4+2', max: 10 },
        greater:  { name: 'Potion of Greater Healing', dice: '4d4+4', max: 20 },
        superior: { name: 'Potion of Superior Healing', dice: '8d4+8', max: 40 },
        supreme:  { name: 'Potion of Supreme Healing', dice: '10d4+20', max: 60 }
    };

    const data = potionData[potion];

    if (!data) {
        sendChat('HPManager', '/w gm Invalid potion type.');
        return;
    }

    const healingAmount = mode === 'action' ? data.max : rollPotionDice(data.dice);
    const label = data.name + ' — ' + (mode === 'action' ? 'Action' : 'Bonus Action');

    applyHealing(token, healingAmount, label);
}

function handleLayOnHands(args) {
    const tokenId = args[2];
    const amount = Number(args[3]);

    const token = getObj('graphic', tokenId);

    if (!token) {
        sendChat('HPManager', '/w gm No valid target token found.');
        return;
    }

    if (isNaN(amount) || amount < 0) {
        sendChat('HPManager', '/w gm Invalid healing amount.');
        return;
    }

    applyHealing(token, amount, 'Lay on Hands');

    if (amount >= 5) {
        sendChat('HPManager', '!ae-con remove poisoned ' + token.id);
    }
}

function applyHealing(token, amount, label) {
    const currentHp = Number(token.get('bar1_value')) || 0;
    const maxHp = Number(token.get('bar1_max')) || 0;

    const uncappedHp = currentHp + amount;
    const newHp = maxHp > 0 ? Math.min(uncappedHp, maxHp) : uncappedHp;
    const actualHealing = newHp - currentHp;

    setTokenHp(token, newHp);

    sendChat(
        'HPManager',
        '&{template:default} ' +
        '{{name=' + label + '}} ' +
        '{{Target=' + token.get('name') + '}} ' +
        '{{Healing Rolled=' + amount + '}} ' +
        '{{Healing Applied=' + actualHealing + '}} ' +
        '{{HP=' + currentHp + ' → ' + newHp + '}}'
    );
}

function rollPotionDice(formula) {
    const match = formula.match(/^(\d+)d(\d+)\+(\d+)$/);
    if (!match) return 0;

    const diceCount = Number(match[1]);
    const dieSize = Number(match[2]);
    const bonus = Number(match[3]);

    let total = bonus;

    for (let i = 0; i < diceCount; i++) {
        total += randomInteger(dieSize);
    }

    return total;
}

function replaceInlineRolls(msg) {
    let content = msg.content;

    if (msg.inlinerolls) {
        msg.inlinerolls.forEach(function(roll, index) {
            content = content.replace(`$[[${index}]]`, roll.results.total);
        });
    }

    return content;
}
/*
================================================================
END SCRIPT: HPManager
================================================================
*/

/*
================================================================
BEGIN SCRIPT: Executioner
SOURCE FILE: Executioner.md
================================================================
*/
on('ready', function() {
    state.Executioner = state.Executioner || {};
});

on('chat:message', function(msg) {
    if (msg.type !== 'api') return;
    if (!msg.content.startsWith('!executioner')) return;

    const args = msg.content.split(/\s+/);
    const subcommand = args[1];

    if (subcommand === 'form') {
        const form = args[2];
        const tokenId = args[3];

        const token = getObj('graphic', tokenId);
        if (!token) {
            sendChat('Executioner', '/w gm No valid token found.');
            return;
        }

        const validForms = ['Warhammer', 'Battleaxe', 'Spear'];

        if (!validForms.includes(form)) {
            sendChat('Executioner', '/w gm Invalid Executioner form.');
            return;
        }

        state.Executioner[tokenId] = state.Executioner[tokenId] || {};
        state.Executioner[tokenId].form = form;

        sendChat(
            'Executioner',
            `&{template:default} {{name=Executioner Transformed}} {{Form=${form}}} {{Effect=${token.get('name')} changes Executioner into its ${form} form.}}`
        );

        return;
    }

    if (subcommand === 'attack') {
    const tokenId = args[2];

    const token = getObj('graphic', tokenId);
    if (!token) {
        sendChat('Executioner', '/w gm No valid token found.');
        return;
    }

    const form = state.Executioner[tokenId] && state.Executioner[tokenId].form ? state.Executioner[tokenId].form : 'Warhammer';

    const abilityMap = {
        Warhammer: {
            Melee: 'Hammer-Melee-Attack',
            Thrown: 'Hammer-Throw-Attack'
        },
        Battleaxe: {
            Melee: 'Battleaxe-Melee-Attack',
            Thrown: 'Battleaxe-Throw-Attack'
        },
        Spear: {
            Melee: 'Spear-Melee-Attack',
            Thrown: 'Spear-Throw-Attack'
        }
    };

    const characterId = token.get('represents');
    const character = getObj('character', characterId);

    if (!character) {
        sendChat('Executioner', '/w gm Selected token does not represent a character.');
        return;
    }

    const player = getObj('player', msg.playerid);
const whisperTarget = player ? player.get('_displayname') : 'gm';

const card = `&{template:default} {{name=Executioner — ${form}}} {{Attack=[Melee](~${characterId}|${abilityMap[form].Melee}) [Thrown](~${characterId}|${abilityMap[form].Thrown})}}`;

sendChat('Executioner', `/w "${whisperTarget}" ${card}`);
sendChat('Executioner', `/w gm ${card}`);
}
});
/*
================================================================
END SCRIPT: Executioner
================================================================
*/

/*
================================================================
BEGIN SCRIPT: Dismiss
SOURCE FILE: Dismiss(1).md
================================================================
*/
on('chat:message', function(msg) {
    if (msg.type !== 'api') return;
    if (!msg.content.startsWith('!dismiss')) return;

    const args = msg.content.split(/\s+/);
    const token = getObj('graphic', args[1]);

    if (!token) return;

    token.remove();
});
/*
================================================================
END SCRIPT: Dismiss
================================================================
*/

/*
================================================================
BEGIN SCRIPT: Auras
SOURCE FILE: Auras.md
================================================================
*/
const AURA_TOGGLES = {
    protection: {
        radius: '10',
        color: '#f5d76e'
    },

    wolf: {
        radius: '2',
        color: '#8fce00'
    }
};

on('chat:message', function(msg) {
    if (msg.type !== 'api') return;
    if (!msg.content.match(/^!aura(\s|$)/)) return;

    const args = msg.content.split(/\s+/);
    const action = args[1];
    const auraKey = args[2];
    const tokenId = args[3];

    if (action !== 'toggle') {
        sendChat('AuraToggle', '/w gm Format: !aura toggle AURAKEY TOKEN_ID');
        return;
    }

    const aura = AURA_TOGGLES[auraKey];

    if (!aura) {
        sendChat('AuraToggle', '/w gm Unknown aura. Options: protection, wolf');
        return;
    }

    const token = getObj('graphic', tokenId);

    if (!token) {
        sendChat('AuraToggle', '/w gm Invalid token.');
        return;
    }

    const currentAura = token.get('aura1_radius');

    if (currentAura && currentAura !== '' && currentAura !== '0') {
        token.set({
            aura1_radius: ''
        });
    } else {
        token.set({
            aura1_radius: aura.radius,
            aura1_color: aura.color,
            showplayers_aura1: true
        });
    }
});
/*
================================================================
END SCRIPT: Auras
================================================================
*/

/*
================================================================
BEGIN SCRIPT: BeaconAttributeTester
SOURCE FILE: BeaconAttributeTester.md
================================================================
*/
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
/*
================================================================
END SCRIPT: BeaconAttributeTester
================================================================
*/

/*
================================================================
BEGIN SCRIPT: Audit
SOURCE FILE: Audit.md
================================================================
*/
const CachedStateAudit = (() => {
    'use strict';

    const SCRIPT = 'CachedStateAudit';
    const ENTRIES_PER_PAGE = 20;

    const OBJECT_TYPES = [
        'graphic',
        'character',
        'page',
        'path',
        'text',
        'player',
        'ability',
        'attribute',
        'handout',
        'macro',
        'rollabletable',
        'tableitem',
        'custfx',
        'jukeboxtrack'
    ];

    on('ready', function() {
        log('=== CachedStateAudit Ready: !stateaudit ae | adr | all ===');
    });

    on('chat:message', function(msg) {
        if (msg.type !== 'api') return;
        if (!msg.content.match(/^!stateaudit(\s|$)/)) return;

        if (!playerIsGM(msg.playerid)) {
            sendChat(SCRIPT, '/w "' + msg.who + '" GM only.');
            return;
        }

        const args = msg.content.trim().split(/\s+/);
        const scope = String(args[1] || 'all').toLowerCase();
        const requestedPage = Math.max(1, parseInt(args[2], 10) || 1);

        if (scope === 'ae') {
            auditStateRoot('ActionEconomyV2', 'ae', requestedPage);
            return;
        }

        if (scope === 'adr') {
            auditStateRoot('AttackDamageResolver', 'adr', requestedPage);
            return;
        }

        if (scope === 'se') {
            auditStateRoot('SaveEffects', 'se', requestedPage);
            return;
        }

        if (scope === 'aoe') {
            auditStateRoot('AoEBoom', 'aoe', requestedPage);
            return;
        }

        if (scope === 'executioner') {
            auditStateRoot('Executioner', 'executioner', requestedPage);
            return;
        }

        if (scope === 'all') {
            auditStateRoot('ActionEconomyV2', 'ae', requestedPage);
            auditStateRoot('AttackDamageResolver', 'adr', requestedPage);
            auditStateRoot('SaveEffects', 'se', requestedPage);
            auditStateRoot('AoEBoom', 'aoe', requestedPage);
            auditStateRoot('Executioner', 'executioner', requestedPage);
            return;
        }

        sendChat(
            SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=Cached State Audit}} ' +
            '{{Commands=!stateaudit ae PAGE<br>' +
            '!stateaudit adr PAGE<br>' +
            '!stateaudit se PAGE<br>' +
            '!stateaudit aoe PAGE<br>' +
            '!stateaudit executioner PAGE<br>' +
            '!stateaudit all PAGE}}'
        );
    });

    function auditStateRoot(rootName, scope, requestedPage) {
        const root = state[rootName];

        if (!root) {
            sendChat(
                SCRIPT,
                '/w gm &{template:default} ' +
                '{{name=State Audit — ' + escapeChat(rootName) + '}} ' +
                '{{Result=No saved state exists.}}'
            );
            return;
        }

        const references = [];
        const visited = [];

        scanValue(
            root,
            'state.' + rootName,
            references,
            visited
        );

        const resolved = [];
        const unresolved = [];

        references.forEach(function(reference) {
            const result = resolveObjectId(reference.id);

            if (result) {
                resolved.push({
                    path: reference.path,
                    id: reference.id,
                    objectType: result.objectType,
                    objectName: getObjectName(result.object)
                });
                return;
            }

            unresolved.push(reference);
        });

        sendAuditCard(
            rootName,
            scope,
            references,
            resolved,
            unresolved,
            requestedPage
        );
    }

    function scanValue(value, path, references, visited) {
        if (value === null || value === undefined) return;

        if (typeof value === 'string') {
            if (looksLikeRoll20Id(value)) {
                addReference(references, path, value);
            }

            return;
        }

        if (typeof value !== 'object') return;

        if (visited.indexOf(value) !== -1) return;
        visited.push(value);

        if (Array.isArray(value)) {
            value.forEach(function(item, index) {
                scanValue(
                    item,
                    path + '[' + index + ']',
                    references,
                    visited
                );
            });

            return;
        }

        Object.keys(value).forEach(function(key) {
            const childPath = path + '.' + key;

            if (looksLikeRoll20Id(key)) {
                addReference(
                    references,
                    childPath + ' [object key]',
                    key
                );
            }

            scanValue(
                value[key],
                childPath,
                references,
                visited
            );
        });
    }

    function addReference(references, path, id) {
        const duplicate = references.some(function(reference) {
            return (
                reference.path === path &&
                reference.id === id
            );
        });

        if (duplicate) return;

        references.push({
            path: path,
            id: id
        });
    }

    function looksLikeRoll20Id(value) {
        const text = String(value || '').trim();

        if (!text) return false;

        return /^-[A-Za-z0-9_-]{15,}$/.test(text);
    }

    function resolveObjectId(id) {
        for (let i = 0; i < OBJECT_TYPES.length; i++) {
            const objectType = OBJECT_TYPES[i];
            const object = getObj(objectType, id);

            if (object) {
                return {
                    objectType: objectType,
                    object: object
                };
            }
        }

        return null;
    }

    function getObjectName(object) {
        if (!object || typeof object.get !== 'function') return '';

        return (
            object.get('name') ||
            object.get('_displayname') ||
            object.get('displayname') ||
            ''
        );
    }

    function sendAuditCard(
        rootName,
        scope,
        references,
        resolved,
        unresolved,
        requestedPage
    ) {
        const totalPages = Math.max(
            1,
            Math.ceil(unresolved.length / ENTRIES_PER_PAGE)
        );

        const page = Math.min(requestedPage, totalPages);
        const startIndex = (page - 1) * ENTRIES_PER_PAGE;
        const endIndex = startIndex + ENTRIES_PER_PAGE;
        const pageEntries = unresolved.slice(startIndex, endIndex);

        let card =
            '/w gm &{template:default} ' +
            '{{name=State Audit — ' + escapeChat(rootName) + '}} ' +
            '{{Cached ID References=' + references.length + '}} ' +
            '{{Resolved=' + resolved.length + '}} ' +
            '{{Unresolved=' + unresolved.length + '}} ' +
            '{{Page=' + page + ' of ' + totalPages + '}}';

        if (pageEntries.length) {
            const rows = pageEntries.map(function(entry, index) {
                return (
                    '<b>' + (startIndex + index + 1) + '.</b> ' +
                    escapeChat(entry.path) +
                    '<br>' +
                    escapeChat(entry.id)
                );
            });

            card +=
                '{{Unresolved Paths=' +
                rows.join('<br><br>') +
                '}}';
        } else {
            card +=
                '{{Result=No unresolved object IDs detected.}}';
        }

        const navigation = [];

        if (page > 1) {
            navigation.push(
                '[Previous](!stateaudit ' +
                scope +
                ' ' +
                (page - 1) +
                ')'
            );
        }

        if (page < totalPages) {
            navigation.push(
                '[Next](!stateaudit ' +
                scope +
                ' ' +
                (page + 1) +
                ')'
            );
        }

        navigation.push(
            '[Refresh](!stateaudit ' +
            scope +
            ' ' +
            page +
            ')'
        );

        card +=
            '{{Navigation=' +
            navigation.join(' ') +
            '}}';

        sendChat(
            SCRIPT,
            card,
            null,
            { noarchive: true }
        );
    }

    function escapeChat(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;')
            .replace(/\|/g, '&#124;');
    }

    return {};
})();
/*
================================================================
END SCRIPT: Audit
================================================================
*/

/*
================================================================
BEGIN SCRIPT: StateWipe
SOURCE FILE: StateWipe(1).md
================================================================
*/
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
/*
================================================================
END SCRIPT: StateWipe
================================================================
*/
