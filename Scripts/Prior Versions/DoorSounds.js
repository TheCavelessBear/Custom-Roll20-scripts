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
