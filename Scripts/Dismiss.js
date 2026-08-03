on('chat:message', function(msg) {
    if (msg.type !== 'api') return;
    if (!msg.content.startsWith('!dismiss')) return;

    const args = msg.content.split(/\s+/);
    const token = getObj('graphic', args[1]);

    if (!token) return;

    token.remove();
});
