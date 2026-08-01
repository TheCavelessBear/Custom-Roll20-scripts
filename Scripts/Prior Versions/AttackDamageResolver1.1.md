const ADR_LAST_DAMAGE = {};

on('ready', function() {
    state.AttackDamageResolver = state.AttackDamageResolver || {};
    state.AttackDamageResolver.attackTargets = state.AttackDamageResolver.attackTargets || {};
    state.AttackDamageResolver.targetSlots = state.AttackDamageResolver.targetSlots || {};
    state.AttackDamageResolver.lastTurnTokenId = state.AttackDamageResolver.lastTurnTokenId || null;
    log('=== AttackDamageResolver Ready ===');
});

on('change:campaign:turnorder', function() {
    clearAdrTurnMemory();
});

on('chat:message', function(msg) {
    if (msg.type === 'advancedroll') {
        cacheDamageRoll(msg);
        return;
    }

    cacheDefaultTemplateDamageRoll(msg);

    if (msg.type !== 'api') return;
    if (!msg.content.match(/^!adr(\s|$)/)) return;

    const content = replaceInlineRolls(msg);
    const args = content.split(/\s+/);

    if (args[1] === 'apply') {
        handleApplyDamage(msg, args);
        return;
    }

    if (!args[1] || args[1] === 'admin') {
        showAdrAdminMenu();
        return;
    }

    if (args[1] === 'attack') {
        handleAttackRoll(msg, args);
        return;
    }

    if (args[1] === 'setslots') {
        handleSetTargetSlots(args);
        return;
    }

    if (args[1] === 'fx') {
        handleRememberedTargetFx(msg, args);
        return;
    }

    if (args[1] === 'ray') {
        handleRememberedTargetRayFx(msg, args);
        return;
    }

    if (args[1] === 'missile') {
        handleRememberedTargetMissileFx(msg, args);
        return;
    }

    if (args[1] === 'fxtest') {
        sendChat('AttackDamageResolver', '/fx missile-fire ' + args[2] + ' ' + args[3]);
        return;
    }

    if (args[1] === 'targetcmd') {
        handleRememberedTargetCommand(msg, args);
        return;
    }

    if (args[1] === 'applyslot') {
        handleApplySlotDamage(msg, args);
        return;
    }

    if (args[1] === 'targetcmdslot') {
        handleSlotTargetCommand(msg, args);
        return;
    }

    if (args[1] === 'fxslot') {
        handleSlotTargetFx(msg, args);
        return;
    }

    if (args[1] === 'rayslot') {
        handleSlotTargetRayFx(msg, args);
        return;
    }

    if (args[1] === 'missileslot') {
        handleSlotTargetMissileFx(msg, args);
        return;
    }

    if (args[1] === 'slots') {
        showTargetSlots();
        return;
    }

    if (args[1] === 'clearslots') {
        clearTargetSlots();
        return;
    }

    if (args[1] === 'settarget') {
        setRememberedTarget(args);
        return;
    }

    if (args[1] === 'cleartarget') {
        clearRememberedTarget();
        return;
    }

    if (args[1] === 'undo') {
        undoLastAdrDamage();
        return;
    }

    if (args[1] === 'status') {
        showAdrStatus();
        return;
    }

    sendChat('AttackDamageResolver', '/w gm Commands: !adr admin | !adr attack ATTACKER_ID TARGET_ID [--slot SLOT] | !adr apply TARGET_ID [TYPE] [LABEL] [--magic] [--melee] | !adr applyslot SLOT [--magic] [--melee] | !adr targetcmd !command @@target args | !adr targetcmdslot SLOT !command @@target args | !adr fx FX_NAME | !adr fxslot SLOT FX_NAME | !adr ray FX_NAME | !adr rayslot SLOT FX_NAME | !adr slots | !adr clearslots | !adr settarget TARGET_ID | !adr cleartarget | !adr undo | !adr status');
});

function cacheDamageRoll(msg) {
    if (!msg.content) return;
    if (msg.content.indexOf('header__title--damage') === -1) return;

    const title = extractDamageTitle(msg.content);
    const total = extractDamageTotal(msg.content);
    const type = extractDamageType(msg.content);
    const parts = extractDamageParts(msg.content);

    if (!parts.length && total === null) return;

    const cached = {
        total: total,
        type: type || null,
        title: title || 'Damage',
        parts: parts.length ? parts : [{ amount: total, type: type || null }]
    };

    ADR_LAST_DAMAGE[msg.playerid] = cached;
    ADR_LAST_DAMAGE.last = cached;
}

function cacheDefaultTemplateDamageRoll(msg) {
    if (!msg.content) return;
    if (msg.type !== 'general') return;
    if (!msg.inlinerolls || !msg.inlinerolls.length) return;
    if (msg.content.indexOf('{{Damage Type=') === -1) return;
    if (msg.content.indexOf('{{Damage=$[[') === -1) return;

    const titleMatch = msg.content.match(/\{\{name=([^}]+)\}\}/);
    const typeMatch = msg.content.match(/\{\{Damage Type=([^}]+)\}\}/);
    const damageMatch = msg.content.match(/\{\{Damage=\$\[\[(\d+)\]\]\}\}/);

    const title = titleMatch ? cleanHtml(titleMatch[1]) : 'Damage';
    const damageType = typeMatch ? cleanHtml(typeMatch[1]) : null;
    const rollIndex = damageMatch ? parseInt(damageMatch[1], 10) : null;

    if (!damageType || rollIndex === null || isNaN(rollIndex)) return;
    if (!msg.inlinerolls[rollIndex]) return;

    const total = Number(msg.inlinerolls[rollIndex].results.total);

    if (isNaN(total)) return;

    const cached = {
        total: total,
        type: damageType,
        title: title,
        parts: [{ amount: total, type: damageType }]
    };

    ADR_LAST_DAMAGE[msg.playerid] = cached;
    ADR_LAST_DAMAGE.last = cached;
}

function handleApplyDamage(msg, args) {
    setTimeout(function() {
        applyCachedDamage(msg, args);
    }, 500);
}

function handleAttackRoll(msg, args) {
    const attackerId = args[2];
    const targetId = args[3];

    const attacker = getObj('graphic', attackerId);
    const target = getObj('graphic', targetId);

    if (!attacker || !target) {
        sendChat('AttackDamageResolver', '/w gm ADR: Invalid attacker or target token.');
        return;
    }

    state.AttackDamageResolver.lastAttack = {
        attackerId: attackerId,
        targetId: targetId
    };

    state.AttackDamageResolver.attackTargets[attackerId] = targetId;

    const slotName = getOptionValue(args, '--slot');

    if (slotName) {
        state.AttackDamageResolver.targetSlots[slotName.toLowerCase()] = {
            attackerId: attackerId,
            targetId: targetId
        };
    }

    const aeMods = getAeAttackRollModifiers(attacker, target);
    const rollMode = getAttackRollMode(aeMods);

    const penaltyNotes = [];

    (aeMods.penaltyDice || []).forEach(penalty => {
        const rolled = rollDiceExpression(penalty.dice);
        penaltyNotes.push(penalty.label + ': subtract ' + rolled);
    });

        const reasons = aeMods.notes || [];
    let card =
        '&{template:default} ' +
        '{{name=Attack Guidance}} ' +
        '{{Attacker=' + attacker.get('name') + '}} ' +
        '{{Target=' + target.get('name') + '}} ' +
        '{{Expected Roll Type=' + formatRollMode(rollMode) + '}}';

    if (penaltyNotes.length) {
        card += ' {{Attack Penalty=' + penaltyNotes.join('<br>') + '}}';
    }

    if (reasons.length) {
        card += ' {{Reason=' + reasons.join('<br>') + '}}';
    }

    sendChat('AttackDamageResolver', '/w gm ' + card);
}

function handleSetTargetSlots(args) {
    const attackerId = args[2];
    const attacker = getObj('graphic', attackerId);

    if (!attacker) {
        sendChat('AttackDamageResolver', '/w gm ADR: Invalid attacker token for setslots.');
        return;
    }

    state.AttackDamageResolver.targetSlots = state.AttackDamageResolver.targetSlots || {};

    const lines = [];

    args.slice(3).forEach(entry => {
        const parts = entry.split('=');
        const slotName = parts[0];
        const targetId = parts[1];

        if (!slotName || !targetId) return;

        const target = getObj('graphic', targetId);

        if (!target) {
            lines.push(slotName + ': invalid target');
            return;
        }

        state.AttackDamageResolver.targetSlots[String(slotName).toLowerCase()] = {
            attackerId: attackerId,
            targetId: target.id
        };

        lines.push(slotName + ': ' + target.get('name'));
    });

    sendChat(
        'AttackDamageResolver',
        '/w gm &{template:default} ' +
        '{{name=ADR Target Slots Set}} ' +
        '{{Attacker=' + attacker.get('name') + '}} ' +
        '{{Slots=' + (lines.length ? lines.join('<br>') : 'None') + '}}'
    );
}

function getTargetSlot(slotName) {
    if (!slotName) return null;

    const key = String(slotName).toLowerCase();
    const slot = state.AttackDamageResolver.targetSlots[key];

    if (!slot || !slot.targetId) return null;

    const target = getObj('graphic', slot.targetId);

    if (!target) {
        delete state.AttackDamageResolver.targetSlots[key];
        return null;
    }

    return {
        key: key,
        slot: slot,
        target: target
    };
}

function handleApplySlotDamage(msg, args) {
    const slotName = args[2];
    const slotData = getTargetSlot(slotName);

    if (!slotData) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered target slot named ' + slotName + '.');
        return;
    }

    state.AttackDamageResolver.lastAttack = {
        attackerId: slotData.slot.attackerId,
        targetId: slotData.target.id
    };

    const forwardedArgs = ['!adr', 'apply', slotData.target.id].concat(args.slice(3));

    handleApplyDamage(msg, forwardedArgs);
}

function handleSlotTargetCommand(msg, args) {
    const slotName = args[2];
    const slotData = getTargetSlot(slotName);

    if (!slotData) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered target slot named ' + slotName + '.');
        return;
    }

    state.AttackDamageResolver.lastAttack = {
        attackerId: slotData.slot.attackerId,
        targetId: slotData.target.id
    };

    const command = args.slice(3).join(' ').replace(/@@target/g, slotData.target.id);

    if (!command || command.indexOf('!') !== 0) {
        sendChat('AttackDamageResolver', '/w gm ADR: Usage !adr targetcmdslot SLOT !command @@target args');
        return;
    }

    sendChat('AttackDamageResolver', command);
}

function handleSlotTargetFx(msg, args) {
    const slotName = args[2];
    const fxName = args.slice(3).join(' ');
    const slotData = getTargetSlot(slotName);

    if (!slotData) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered target slot named ' + slotName + '.');
        return;
    }

    if (!fxName) {
        sendChat('AttackDamageResolver', '/w gm ADR: Usage !adr fxslot SLOT FX_NAME');
        return;
    }

    state.AttackDamageResolver.lastAttack = {
        attackerId: slotData.slot.attackerId,
        targetId: slotData.target.id
    };

    const fxId = getCustomFxIdByName(fxName) || fxName;

    spawnFx(
        slotData.target.get('left'),
        slotData.target.get('top'),
        fxId,
        slotData.target.get('_pageid')
    );
}

function handleSlotTargetRayFx(msg, args) {
    const slotName = args[2];
    const fxName = args.slice(3).join(' ');
    const slotData = getTargetSlot(slotName);

    if (!slotData) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered target slot named ' + slotName + '.');
        return;
    }

    if (!fxName) {
        sendChat('AttackDamageResolver', '/w gm ADR: Usage !adr rayslot SLOT FX_NAME');
        return;
    }

    const origin = slotData.slot.attackerId ? getObj('graphic', slotData.slot.attackerId) : getSelectedToken(msg);

    if (!origin) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered attacker or selected origin token for slot ' + slotName + '.');
        return;
    }

    state.AttackDamageResolver.lastAttack = {
        attackerId: origin.id,
        targetId: slotData.target.id
    };

    spawnRayFx(origin, slotData.target, fxName);
}

function handleSlotTargetMissileFx(msg, args) {
    const slotName = args[2];
    const fxName = args.slice(3).join(' ');
    const slotData = getTargetSlot(slotName);

    if (!slotData) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered target slot named ' + slotName + '.');
        return;
    }

    if (!fxName) {
        sendChat('AttackDamageResolver', '/w gm ADR: Usage !adr missileslot SLOT FX_NAME');
        return;
    }

    const origin = slotData.slot.attackerId ? getObj('graphic', slotData.slot.attackerId) : getSelectedToken(msg);

    if (!origin) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered attacker or selected origin token for slot ' + slotName + '.');
        return;
    }

    state.AttackDamageResolver.lastAttack = {
        attackerId: origin.id,
        targetId: slotData.target.id
    };

    spawnMissileFx(origin, slotData.target, fxName);
}

function spawnRayFx(origin, target, fxName) {
    if (!origin || !target) return;

    if (origin.get('_pageid') !== target.get('_pageid')) {
        sendChat('AttackDamageResolver', '/w gm ADR: Origin and target are on different pages.');
        return;
    }

    spawnFxBetweenPoints(
        {
            x: origin.get('left'),
            y: origin.get('top')
        },
        {
            x: target.get('left'),
            y: target.get('top')
        },
        fxName,
        origin.get('_pageid')
    );
}

function spawnMissileFx(origin, target, fxName) {
    if (!origin || !target) return;

    if (origin.get('_pageid') !== target.get('_pageid')) {
        sendChat('AttackDamageResolver', '/w gm ADR: Origin and target are on different pages.');
        return;
    }

    const fxId = getCustomFxIdByName(fxName) || fxName;

    spawnFxBetweenPoints(
        {
            x: Number(origin.get('left')),
            y: Number(origin.get('top'))
        },
        {
            x: Number(target.get('left')),
            y: Number(target.get('top'))
        },
        fxId,
        origin.get('_pageid')
    );
}

function getCustomFxIdByName(fxName) {
    const name = String(fxName || '').toLowerCase();

    if (!name) return null;

    const matches = findObjs({
        _type: 'custfx'
    });

    const match = matches.find(fx =>
        String(fx.get('name') || '').toLowerCase() === name
    );

    return match ? match.id : null;
}

function getSelectedToken(msg) {
    if (!msg.selected || !msg.selected.length) return null;

    const selected = msg.selected[0];

    if (!selected || selected._type !== 'graphic') return null;

    return getObj('graphic', selected._id);
}

function showTargetSlots() {
    const slots = state.AttackDamageResolver.targetSlots || {};
    const names = Object.keys(slots);

    if (!names.length) {
        sendChat('AttackDamageResolver', '/w gm ADR: No target slots stored.');
        return;
    }

    const lines = names.map(name => {
        const slot = slots[name];
        const target = slot && slot.targetId ? getObj('graphic', slot.targetId) : null;
        const attacker = slot && slot.attackerId ? getObj('graphic', slot.attackerId) : null;

        return name + ': ' +
            (attacker ? attacker.get('name') : 'Unknown Attacker') +
            ' → ' +
            (target ? target.get('name') : 'Missing Target');
    });

    sendChat(
        'AttackDamageResolver',
        '/w gm &{template:default} ' +
        '{{name=ADR Target Slots}} ' +
        '{{Slots=' + lines.join('<br>') + '}}'
    );
}

function clearTargetSlots() {
    state.AttackDamageResolver.targetSlots = {};
    sendChat('AttackDamageResolver', '/w gm ADR target slots cleared.');
}

function handleRememberedTargetCommand(msg, args) {
    const lastAttack = state.AttackDamageResolver.lastAttack;

    if (!lastAttack || !lastAttack.targetId) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered attack target.');
        return;
    }

    const target = getObj('graphic', lastAttack.targetId);

    if (!target) {
        sendChat('AttackDamageResolver', '/w gm ADR: Remembered target no longer exists.');
        return;
    }

    const command = args.slice(2).join(' ').replace(/@@target/g, target.id);

    if (!command || command.indexOf('!') !== 0) {
        sendChat('AttackDamageResolver', '/w gm ADR: Usage !adr targetcmd !command @@target args');
        return;
    }

    sendChat('AttackDamageResolver', command);
}

function handleRememberedTargetFx(msg, args) {
    const fxName = args.slice(2).join(' ');

    if (!fxName) {
        sendChat('AttackDamageResolver', '/w gm ADR: Usage !adr fx FX_NAME');
        return;
    }

    const lastAttack = state.AttackDamageResolver.lastAttack;

    if (!lastAttack || !lastAttack.targetId) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered attack target.');
        return;
    }

    const target = getObj('graphic', lastAttack.targetId);

    if (!target) {
        sendChat('AttackDamageResolver', '/w gm ADR: Remembered target no longer exists.');
        return;
    }

    const fxId = getCustomFxIdByName(fxName) || fxName;

    spawnFx(
        target.get('left'),
        target.get('top'),
        fxId,
        target.get('_pageid')
    );
}

function handleRememberedTargetRayFx(msg, args) {
    const fxName = args.slice(2).join(' ');
    const lastAttack = state.AttackDamageResolver.lastAttack;

    if (!fxName) {
        sendChat('AttackDamageResolver', '/w gm ADR: Usage !adr ray FX_NAME');
        return;
    }

    if (!lastAttack || !lastAttack.targetId) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered attack target.');
        return;
    }

    const origin = lastAttack.attackerId ? getObj('graphic', lastAttack.attackerId) : getSelectedToken(msg);
    const target = getObj('graphic', lastAttack.targetId);

    if (!origin) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered attacker or selected origin token.');
        return;
    }

    if (!target) {
        sendChat('AttackDamageResolver', '/w gm ADR: Remembered target no longer exists.');
        return;
    }

    spawnRayFx(origin, target, fxName);
}

function handleRememberedTargetMissileFx(msg, args) {
    const fxName = args.slice(2).join(' ');
    const lastAttack = state.AttackDamageResolver.lastAttack;

    if (!fxName) {
        sendChat('AttackDamageResolver', '/w gm ADR: Usage !adr missile FX_NAME');
        return;
    }

    if (!lastAttack || !lastAttack.targetId) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered attack target.');
        return;
    }

    const origin = lastAttack.attackerId ? getObj('graphic', lastAttack.attackerId) : getSelectedToken(msg);
    const target = getObj('graphic', lastAttack.targetId);

    if (!origin) {
        sendChat('AttackDamageResolver', '/w gm ADR: No remembered attacker or selected origin token.');
        return;
    }

    if (!target) {
        sendChat('AttackDamageResolver', '/w gm ADR: Remembered target no longer exists.');
        return;
    }

    spawnMissileFx(origin, target, fxName);
}

function showAdrAdminMenu() {
    sendChat(
        'AttackDamageResolver',
        '/w gm &{template:default} ' +
        '{{name=ADR Admin}} ' +
        '{{Remembered Target=[Set Target](!adr settarget &#64;{target&#124;ADR Target&#124;token_id}) [Clear Target](!adr cleartarget)}} ' +
        '{{Target Slots=[Show Slots](!adr slots) [Clear Slots](!adr clearslots)}} ' +
        '{{Damage=[Undo Last ADR Damage](!adr undo)}} ' +
        '{{Info=[Status](!adr status)}}'
    );
}

function setRememberedTarget(args) {
    const targetId = args[2];
    const target = getObj('graphic', targetId);

    if (!target) {
        sendChat('AttackDamageResolver', '/w gm ADR: Invalid target token.');
        return;
    }

    state.AttackDamageResolver.lastAttack = state.AttackDamageResolver.lastAttack || {};
    state.AttackDamageResolver.lastAttack.targetId = target.id;

    sendChat('AttackDamageResolver', '/w gm ADR remembered target set to ' + target.get('name') + '.');
}

function clearRememberedTarget() {
    delete state.AttackDamageResolver.lastAttack;

    sendChat('AttackDamageResolver', '/w gm ADR remembered target cleared.');
}

function clearAdrTurnMemory() {
    state.AttackDamageResolver.attackTargets = {};
    state.AttackDamageResolver.targetSlots = {};
    delete state.AttackDamageResolver.lastAttack;
}

function showAdrStatus() {
    const lastAttack = state.AttackDamageResolver.lastAttack;
    const undo = state.AttackDamageResolver.lastDamageUndo;
    const cached = ADR_LAST_DAMAGE.last;

    const attacker = lastAttack && lastAttack.attackerId ? getObj('graphic', lastAttack.attackerId) : null;
    const target = lastAttack && lastAttack.targetId ? getObj('graphic', lastAttack.targetId) : null;
    const undoTarget = undo && undo.targetId ? getObj('graphic', undo.targetId) : null;

    sendChat(
        'AttackDamageResolver',
        '/w gm &{template:default} ' +
        '{{name=ADR Status}} ' +
        '{{Remembered Attacker=' + (attacker ? attacker.get('name') : 'None') + '}} ' +
        '{{Remembered Target=' + (target ? target.get('name') : 'None') + '}} ' +
        '{{Cached Damage=' + (cached ? cached.title : 'None') + '}} ' +
        '{{Last Undo Target=' + (undoTarget ? undoTarget.get('name') : 'None') + '}} ' +
        '{{Last Undo Damage=' + (undo ? undo.amount : 'None') + '}}'
    );
}

function undoLastAdrDamage() {
    const undo = state.AttackDamageResolver.lastDamageUndo;

    if (!undo) {
        sendChat('AttackDamageResolver', '/w gm ADR: No damage to undo.');
        return;
    }

    const target = getObj('graphic', undo.targetId);

    if (!target) {
        sendChat('AttackDamageResolver', '/w gm ADR: Undo target no longer exists.');
        return;
    }

    target.set({
        bar1_value: undo.bar1Value,
        bar1_max: undo.bar1Max,
        bar2_value: undo.bar2Value,
        bar2_max: undo.bar2Max
    });

    const characterId = target.get('represents');

    if (characterId && typeof setSheetItem === 'function') {
        setSheetItem(characterId, 'hp', undo.bar1Value);

        if (undo.bar1Max !== '') {
            setSheetItem(characterId, 'hp', undo.bar1Max, 'max');
        }

        setSheetItem(characterId, 'hp_temp', undo.bar2Value || 0);
        setSheetItem(characterId, 'hp_temp', undo.bar2Max || 0, 'max');
    }

    delete state.AttackDamageResolver.lastDamageUndo;

    sendChat(
        'AttackDamageResolver',
        '/w gm &{template:default} ' +
        '{{name=ADR Damage Undone}} ' +
        '{{Target=' + target.get('name') + '}} ' +
        '{{Restored HP=' + undo.bar1Value + '}} ' +
        '{{Restored Temp HP=' + undo.bar2Value + '}}'
    );
}

function processFireShieldRetaliation(msg, target) {
    const lastAttack = state.AttackDamageResolver.lastAttack;

    if (!lastAttack) return;
    if (lastAttack.targetId !== target.id) return;

    const attacker = getObj('graphic', lastAttack.attackerId);

    if (!attacker) return;

    const retaliation = getFireShieldRetaliation(target);

    if (!retaliation) return;

    const distance = getTokenEdgeDistanceFeet(attacker, target);

    if (distance === null || distance > 5) return;

    applyFireShieldRetaliationDamage(attacker, target, retaliation);
}

function getFireShieldRetaliation(target) {
    if (hasAeEffect(target, 'fireshieldwarm')) {
        return {
            label: 'Fire Shield — Warm',
            damageType: 'Fire'
        };
    }

    if (hasAeEffect(target, 'fireshieldchill')) {
        return {
            label: 'Fire Shield — Chill',
            damageType: 'Cold'
        };
    }

    return null;
}

function hasAeEffect(token, effectName) {
    return (
        typeof ActionEconomyV2API !== 'undefined' &&
        ActionEconomyV2API &&
        typeof ActionEconomyV2API.hasEffect === 'function' &&
        ActionEconomyV2API.hasEffect(token, effectName)
    );
}

function getTokenEdgeDistanceFeet(tokenA, tokenB) {
    if (!tokenA || !tokenB) return null;
    if (tokenA.get('_pageid') !== tokenB.get('_pageid')) return null;

    const page = getObj('page', tokenA.get('_pageid'));
    const scale = page ? parseFloat(page.get('scale_number')) || 5 : 5;

    const dx = tokenA.get('left') - tokenB.get('left');
    const dy = tokenA.get('top') - tokenB.get('top');
    const centerDistanceFeet = Math.sqrt(dx * dx + dy * dy) / 70 * scale;

    const radiusA = Math.max(tokenA.get('width'), tokenA.get('height')) / 2 / 70 * scale;
    const radiusB = Math.max(tokenB.get('width'), tokenB.get('height')) / 2 / 70 * scale;

    return Math.max(0, centerDistanceFeet - radiusA - radiusB);
}

async function applyFireShieldRetaliationDamage(attacker, target, retaliation) {
    const baseDamage = rollDiceExpression('2d8');

    const modified = await getAeModifiedDamage(attacker, retaliation.damageType, baseDamage, {
        magical: false,
        adept: retaliation.damageType === 'Fire' ? 'fire' : null
    });

    applyDamageToToken(attacker, modified.amount);

    sendChat(
        'AttackDamageResolver',
        '&{template:default} ' +
        '{{name=' + retaliation.label + ' Retaliation}} ' +
        '{{Shielded Target=' + target.get('name') + '}} ' +
        '{{Attacker=' + attacker.get('name') + '}} ' +
        '{{Damage Rolled=' + baseDamage + ' ' + retaliation.damageType + '}} ' +
        '{{Damage Traits=' + modified.note + '}} ' +
        '{{Final Damage=' + modified.amount + '}}'
    );
}

function getAttackRollMode(aeMods) {
    if (aeMods.advantage && aeMods.disadvantage) return 'normal';
    if (aeMods.advantage) return 'advantage';
    if (aeMods.disadvantage) return 'disadvantage';
    return 'normal';
}

function formatRollMode(rollMode) {
    if (rollMode === 'advantage') return 'Advantage';
    if (rollMode === 'disadvantage') return 'Disadvantage';
    return 'Normal';
}

function rollDiceExpression(expression) {
    const match = String(expression).match(/^(\d+)d(\d+)$/i);
    if (!match) return 0;

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    let total = 0;

    for (let i = 0; i < count; i++) {
        total += randomInteger(sides);
    }

    return total;
}

function getAeAttackRollModifiers(attacker, target) {
    if (
        typeof ActionEconomyV2API !== 'undefined' &&
        ActionEconomyV2API &&
        typeof ActionEconomyV2API.getAttackRollModifiers === 'function'
    ) {
        return ActionEconomyV2API.getAttackRollModifiers(attacker, target);
    }

    return {
        advantage: false,
        disadvantage: false,
        penaltyDice: [],
        notes: []
    };
}

async function applyCachedDamage(msg, args) {
    const magical = args.includes('--magic');
    const melee = args.includes('--melee');
    const adeptType = getOptionValue(args, '--adept');
    const attackerId = getOptionValue(args, '--attacker');
    const filteredArgs = args.filter((arg, index) =>
        arg !== '--magic' &&
        arg !== '--melee' &&
        arg !== '--attacker' &&
        args[index - 1] !== '--attacker' &&
        arg !== '--adept' &&
        args[index - 1] !== '--adept'
    );

    let targetId = filteredArgs[2] || null;

    if (targetId && targetId.indexOf('--') === 0) {
        targetId = null;
    }

    if (!targetId && attackerId && state.AttackDamageResolver.attackTargets[attackerId]) {
        targetId = state.AttackDamageResolver.attackTargets[attackerId];
    }

    if (!targetId && state.AttackDamageResolver.lastAttack) {
        targetId = state.AttackDamageResolver.lastAttack.targetId;
    }

    const overrideType = targetId ? filteredArgs[3] || null : null;
    const overrideLabel = targetId ? filteredArgs.slice(4).join(' ') || null : null;
    const cached = ADR_LAST_DAMAGE[msg.playerid] || ADR_LAST_DAMAGE.last;

    const target = getObj('graphic', targetId);

    if (!target) {
        sendChat('AttackDamageResolver', '/w gm ADR: Invalid target token. Make an attack first or use !adr apply TARGET_ID.');
        return;
    }

    if (!cached) {
        sendChat('AttackDamageResolver', '/w gm ADR: No cached damage roll found. Roll damage first, then call !adr apply.');
        return;
    }

    const label = overrideLabel || cached.title;
    const parts = cached.parts || [];

    if (!parts.length) {
        sendChat('AttackDamageResolver', '/w gm ADR: No damage parts found.');
        return;
    }

    let finalDamage = 0;
    const traitNotes = [];

    for (const part of parts) {
        const damageType = overrideType || part.type;

        if (!damageType) {
            sendChat('AttackDamageResolver', '/w gm ADR: Could not determine damage type. Use !adr apply TARGET_ID TYPE LABEL.');
            return;
        }

        const modified = await getAeModifiedDamage(target, damageType, part.amount, {
            magical: magical,
            adept: adeptType
        });

        finalDamage += modified.amount;
        traitNotes.push(part.amount + ' ' + damageType + ' → ' + modified.amount + ' (' + modified.note + ')');
    }

    const lastAttack = state.AttackDamageResolver.lastAttack;

    if (
        lastAttack &&
        lastAttack.attackerId &&
        lastAttack.targetId === target.id &&
        typeof ActionEconomyV2API !== 'undefined' &&
        ActionEconomyV2API &&
        typeof ActionEconomyV2API.recordDamageSource === 'function'
    ) {
        ActionEconomyV2API.recordDamageSource(lastAttack.attackerId, target.id);
    }

    const hpBefore = parseInt(target.get('bar1_value'), 10) || 0;

    const undo = await applyDamageToToken(target, finalDamage);

    const hpAfter = parseInt(target.get('bar1_value'), 10) || 0;

    if (undo) {
        state.AttackDamageResolver.lastDamageUndo = undo;
    }

    if (
        hpBefore > 0 &&
        hpAfter <= 0 &&
        lastAttack &&
        lastAttack.attackerId &&
        typeof ActionEconomyV2API !== 'undefined' &&
        ActionEconomyV2API &&
        typeof ActionEconomyV2API.processDamageResult === 'function'
    ) {
        ActionEconomyV2API.processDamageResult(lastAttack.attackerId, target.id, hpBefore, hpAfter);
    }

    if (melee && finalDamage > 0) {
        processFireShieldRetaliation(msg, target);
    }

    sendChat(
        'AttackDamageResolver',
        '/w gm &{template:default} ' +
        '{{name=Damage Applied}} ' +
        '{{Source=' + label + '}} ' +
        '{{Target=' + target.get('name') + '}} ' +
        '{{Base Damage=' + parts.map(p => p.amount + ' ' + p.type).join(' + ') + '}} ' +
        '{{Damage Traits=' + traitNotes.join('<br>') + '}} ' +
        '{{Final Damage=' + finalDamage + '}}'
    );
}

function extractDamageTitle(content) {
    const match = content.match(/header__title header__title--damage">([\s\S]*?)<\/div>/);
    return match ? cleanHtml(match[1]) : null;
}

function extractDamageTotal(content) {
    let match = content.match(/data-result="(-?\d+)"/);

    if (match) return Number(match[1]);

    match = content.match(/damage-breakdown__total">\s*(-?\d+)\s*<\/div>/);

    if (match) return Number(match[1]);

    match = content.match(/total__value">\s*(-?\d+)\s*<\/span>/);

    if (match) return Number(match[1]);

    return null;
}

function extractDamageType(content) {
    const match = content.match(/damage-breakdown__icon[\s\S]*?<\/div>\s*([^<]+?)\s*<div class="damage-breakdown__total/);
    return match ? cleanHtml(match[1]) : null;
}

function extractDamageParts(content) {
    const parts = [];
    const pattern = /damage-breakdown__icon[\s\S]*?<\/div>\s*([^<]+?)\s*<div class="damage-breakdown__total">\s*(-?\d+)\s*<\/div>/g;
    let match;

    while ((match = pattern.exec(content)) !== null) {
        const type = cleanHtml(match[1]);
        const amount = Number(match[2]);

        if (!type || isNaN(amount)) continue;

        parts.push({
            amount: amount,
            type: type
        });
    }

    return parts;
}

function cleanHtml(value) {
    return String(value || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#x3D;/g, '=')
        .replace(/&amp;/g, '&')
        .trim();
}

async function getAeModifiedDamage(token, damageType, amount, tags) {
    if (
        typeof ActionEconomyV2API !== 'undefined' &&
        ActionEconomyV2API &&
        typeof ActionEconomyV2API.modifyDamageForTraits === 'function'
    ) {
        return await ActionEconomyV2API.modifyDamageForTraits(token, damageType, amount, tags || {});
    }

    return {
        amount: amount,
        note: 'None'
    };
}

function processTokenTriggersBar1Change(token, oldHp, newHp) {
    if (
        typeof TokenTriggersAPI !== 'undefined' &&
        TokenTriggersAPI &&
        typeof TokenTriggersAPI.processBar1Change === 'function'
    ) {
        const resolvedHp = TokenTriggersAPI.processBar1Change(token, oldHp, newHp);
        const numericHp = parseFloat(resolvedHp);

        if (!isNaN(numericHp)) {
            return numericHp;
        }
    }

    return newHp;
}

async function applyDamageToToken(token, amount) {
    if (!amount || amount <= 0) return null;

    const undo = {
        targetId: token.id,
        amount: amount,
        bar1Value: token.get('bar1_value'),
        bar1Max: token.get('bar1_max'),
        bar2Value: token.get('bar2_value'),
        bar2Max: token.get('bar2_max')
    };

    let remaining = amount;
    const characterId = token.get('represents');

    const tempHp = parseInt(token.get('bar2_value'), 10);

    if (!isNaN(tempHp) && tempHp > 0) {
        const tempDamage = Math.min(tempHp, remaining);
        const newTempHp = tempHp - tempDamage;

        if (characterId && typeof setSheetItem === 'function') {
            await setSheetItem(characterId, 'hp_temp', newTempHp);
        }

        token.set('bar2_value', newTempHp);
        token.set('bar2_max', newTempHp);

        remaining -= tempDamage;
    }

    if (remaining <= 0) return undo;

    const hp = parseInt(token.get('bar1_value'), 10);

    if (isNaN(hp)) return undo;

    const newHp = Math.max(0, hp - remaining);

    if (characterId && typeof setSheetItem === 'function') {
        await setSheetItem(characterId, 'hp', newHp);
    }

    token.set('bar1_value', newHp);
    processTokenTriggersBar1Change(token, hp, newHp);

    return undo;
}

function replaceInlineRolls(msg) {
    let content = msg.content;

    if (!msg.inlinerolls) return content;

    msg.inlinerolls.forEach(function(roll, index) {
        content = content.replace('$[[' + index + ']]', roll.results.total);
    });

    return content;
}