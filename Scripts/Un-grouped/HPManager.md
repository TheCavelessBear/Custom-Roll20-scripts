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