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