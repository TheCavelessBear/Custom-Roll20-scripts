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
