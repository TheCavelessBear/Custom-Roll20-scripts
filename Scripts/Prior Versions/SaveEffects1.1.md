on('ready', function() {
    state.SaveEffects = state.SaveEffects || {};
    log('=== SaveEffects 1.1 Ready ===');
});

const AE_CONDITIONS = {
    blinded: {
        display: 'Blinded'
    },

    charmed: {
        display: 'Charmed'
    },

    deafened: {
        display: 'Deafened'
    },

    exhaustion: {
        display: 'Exhaustion'
    },

    frightened: {
        display: 'Frightened'
    },

    grappled: {
        display: 'Grappled'
    },

    incapacitated: {
        display: 'Incapacitated'
    },

    invisible: {
        display: 'Invisible'
    },

    paralyzed: {
        display: 'Paralyzed'
    },

    petrified: {
        display: 'Petrified'
    },

    poisoned: {
        display: 'Poisoned'
    },

    stinkingpoisoned: {
        display: 'Stinking Cloud Poisoned'
    },

    prone: {
        display: 'Prone'
    },

    restrained: {
        display: 'Restrained'
    },

    stunned: {
        display: 'Stunned'
    },

    unconscious: {
        display: 'Unconscious'
    }
};

const SAVE_EFFECTS_REGISTRY = {
    trip: {
        display: 'Trip',
        saveKey: 'dex',
        condition: 'prone',
        duration: null,
        sourceRequired: false,
        failText: 'The target gains the Prone condition.'
    },

    topple: {
        display: 'Topple',
        saveKey: 'con',
        condition: 'prone',
        duration: null,
        sourceRequired: false,
        failText: 'The target gains the Prone condition.'
    },

    poison: {
        display: 'Poison',
        saveKey: 'con',
        condition: 'poisoned',
        duration: 'combat',
        sourceRequired: false,
        failText: 'The target gains the Poisoned condition for 1 minute.'
    },

    grapple: {
        display: 'Grapple',
        saveKey: 'str',
        condition: 'grappled',
        duration: null,
        sourceRequired: false,
        failText: 'The target gains the Grappled condition.'
    },

    gutshot: {
        display: 'Gutshot',
        saveKey: 'con',
        condition: 'paralyzed',
        duration: 'casterNextTurn',
        sourceRequired: true,
        failText: 'The target gains the Paralyzed condition until the end of the source creature’s next turn.'
    },

holdperson: {
    display: 'Hold Person',
    saveKey: 'wis',
    condition: 'paralyzed',
    duration: 'concentration',
    sourceRequired: true,
    repeatSaveTiming: 'endOfTurn',
    repeatSaveSuccess: 'remove',
    failText: 'The target gains the Paralyzed condition.'
},

lifedrain: {
    display: 'Life Drain',
    saveKey: 'con',
    sourceRequired: false,
    failText: 'The target suffers Life Drain.'
}

};

const SAVE_ABILITY_NAMES = {
    str: 'Strength',
    dex: 'Dexterity',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Wisdom',
    cha: 'Charisma'
};

const SAVE_BONUS_ATTRIBUTES = {
    str: 'strength_save_bonus',
    dex: 'dexterity_save_bonus',
    con: 'constitution_save_bonus',
    int: 'intelligence_save_bonus',
    wis: 'wisdom_save_bonus',
    cha: 'charisma_save_bonus'
};

const SKILL_NAMES = {
    acrobatics: 'Acrobatics',
    animalhandling: 'Animal Handling',
    arcana: 'Arcana',
    athletics: 'Athletics',
    deception: 'Deception',
    history: 'History',
    insight: 'WInsight',
    intimidation: 'Intimidation',
    investigation: 'Investigation',
    medicine: 'Medicine',
    nature: 'Nature',
    perception: 'Perception',
    performance: 'Performance',
    persuasion: 'Persuasion',
    religion: 'Religion',
    sleightofhand: 'Sleight of Hand',
    stealth: 'Stealth',
    survival: 'Survival'
};

const SKILL_BONUS_ATTRIBUTES = {
    acrobatics: 'acrobatics_bonus',
    animalhandling: 'animal_handling_bonus',
    arcana: 'arcana_bonus',
    athletics: 'athletics_bonus',
    deception: 'deception_bonus',
    history: 'history_bonus',
    insight: 'insight_bonus',
    intimidation: 'intimidation_bonus',
    investigation: 'investigation_bonus',
    medicine: 'medicine_bonus',
    nature: 'nature_bonus',
    perception: 'perception_bonus',
    performance: 'performance_bonus',
    persuasion: 'persuasion_bonus',
    religion: 'religion_bonus',
    sleightofhand: 'sleight_of_hand_bonus',
    stealth: 'stealth_bonus',
    survival: 'survival_bonus'
};

on('chat:message', function(msg) {
    if (msg.type !== 'api') return;
    if (!msg.content.match(/^!se(\s|$)/)) return;

    const content = replaceInlineRolls(msg);
    const args = content.split(/\s+/);

    const subcommand = args[1];

    if (!subcommand || subcommand === 'menu') {
        showSaveEffectsMenu(msg);
        return;
    }

    if (subcommand === 'conditions') {
        showConditionsMenu(msg);
        return;
    }

    if (subcommand === 'targetmenu') {
        showTargetCountMenu(msg, args[2]);
        return;
    }

    if (subcommand === 'namedmenu') {
        showNamedSaveMenu(msg, args[2]);
        return;
    }

    if (subcommand === 'namedtargetmenu') {
        showNamedTargetCountMenu(msg, args[2]);
        return;
    }

    if (subcommand === 'save') {
        handleGenericSaveEffect(args);
        return;
    }

    if (subcommand === 'selected') {
        handleSelectedSaveEffect(msg, args);
        return;
    }

    if (subcommand === 'damage') {
        handleSelectedDamageSave(msg, args);
        return;
    }

    if (subcommand === 'damagebatch') {
        handleBatchDamageSave(msg, args);
        return;
    }

    if (subcommand === 'damageone') {
        handleSingleDamageSave(args);
        return;
    }

    if (subcommand === 'damagecondition') {
        handleDamageConditionSave(args);
        return;
    }

    if (subcommand === 'check') {
        handleCheckSave(msg, args);
        return;
    }

    if (subcommand === 'ongoing') {
        handleSelectedOngoingDamage(msg, args);
        return;
    }

    if (subcommand === 'ongoingremove') {
        handleSelectedOngoingDamageRemove(msg, args);
        return;
    }

    if (subcommand === 'skill') {
        handleSkillCheck(args);
        return;
    }

if (subcommand === 'source') {
    setSavedSourceToken(msg, args);
    return;
}

if (subcommand === 'lifedrain') {
    handleLifeDrain(args);
    return;
}

handleRegistrySaveEffect(args);
});

async function handleLifeDrain(args) {
    const tokenId = args[2];
    const dc = Number(args[3]);

    const token = getObj('graphic', tokenId);

    if (!token) {
        sendChat('SaveEffects', '/w gm Invalid target token.');
        return;
    }

    const saveBonus = await getSaveBonus(token, 'con');

    if (saveBonus === null) {
        sendChat('SaveEffects', '/w gm Could not find Constitution save bonus.');
        return;
    }

    const roll = randomInteger(20);
    const total = roll + saveBonus;

    if (total >= dc) {
        sendChat(
            'SaveEffects',
            '&{template:default} ' +
            '{{name=Life Drain}} ' +
            '{{Target=' + token.get('name') + '}} ' +
            '{{Constitution Save=' + total + '}} ' +
            '{{DC=' + dc + '}} ' +
            '{{Result=Success}}'
        );
        return;
    }

    const damageRoll = rollDamageFormula('1d8+3');

    if (!damageRoll) {
        return;
    }

    const modifiedDamage = await getAeModifiedDamage(
        token,
        'Necrotic',
        damageRoll.total
    );

    const damageTaken = modifiedDamage.amount;

    const applied = await seApplyDamageToToken(
        token,
        damageTaken
    );

    const currentMaxHp = Number(token.get('bar1_max')) || 0;

    const newMaxHp = Math.max(
        0,
        currentMaxHp - damageTaken
    );

    token.set('bar1_max', newMaxHp);

    const characterId = token.get('represents');

    if (
        characterId &&
        typeof setSheetItem === 'function'
    ) {
        await setSheetItem(
            characterId,
            'hp_max',
            newMaxHp
        );
    }

    sendChat(
        'SaveEffects',
        '&{template:default} ' +
        '{{name=Life Drain}} ' +
        '{{Target=' + token.get('name') + '}} ' +
        '{{Constitution Save=' + total + '}} ' +
        '{{DC=' + dc + '}} ' +
        '{{Result=Failure}} ' +
        '{{Necrotic Damage=' + damageTaken + '}} ' +
        '{{Max HP=' + currentMaxHp + ' → ' + newMaxHp + '}} ' +
        '{{HP=' + applied.hpBefore + ' → ' + applied.hpAfter + '}}'
    );
}

async function handleRegistrySaveEffect(args) {
    const effectKey = args[1];
    const sourceTokenId = getOptionValue(args, '--source');
    const positionalArgs = getPositionalArgs(args);
    const data = SAVE_EFFECTS_REGISTRY[effectKey];

    if (!data) {
        sendChat('SaveEffects', '/w gm Invalid SaveEffect option.');
        return;
    }

    if (positionalArgs.length < 4) {
        sendChat('SaveEffects', '/w gm Format: !se ' + effectKey + ' TARGET_ID DC');
        return;
    }

    const dcInput = positionalArgs[positionalArgs.length - 1];
    const targetIds = positionalArgs.slice(2, positionalArgs.length - 1);

    if (data.sourceRequired && !sourceTokenId) {
        sendChat('SaveEffects', '/w gm This SaveEffect requires --source TOKEN_ID.');
        return;
    }

    const dc = await resolveDc(dcInput, sourceTokenId);

    if (dc === null) {
        sendChat('SaveEffects', '/w gm Invalid DC. Use a number, or use spell with --source SOURCE_TOKEN_ID.');
        return;
    }

    const results = [];

    for (const tokenId of targetIds) {
        const token = getObj('graphic', tokenId);

        if (!token) {
            sendChat('SaveEffects', '/w gm Skipping invalid target token: ' + tokenId);
            continue;
        }

        const saveBonus = await getSaveBonus(token, data.saveKey);

        if (saveBonus === null) {
            sendChat('SaveEffects', '/w gm Could not find target save bonus for ' + SAVE_ABILITY_NAMES[data.saveKey] + ' on ' + token.get('name') + '.');
            continue;
        }

        results.push(rollAndApplySaveEffect({
            display: data.display,
            saveKey: data.saveKey,
            save: SAVE_ABILITY_NAMES[data.saveKey],
            condition: data.condition,
            duration: data.duration,
            sourceTokenId: sourceTokenId,
            repeatSaveTiming: data.repeatSaveTiming || null,
            repeatSaveSuccess: data.repeatSaveSuccess || null,
            failText: data.failText,
            token: token,
            dc: dc,
            saveBonus: saveBonus
        }));
    }

    if (results.length === 1) {
        publicSaveResultCard(results[0]);
    } else if (results.length > 1) {
        publicSaveBatchCard(data.display, results);
    }
}

function setSavedSourceToken(msg, args) {
    const tokenId = args[2];
    const token = getObj('graphic', tokenId);

    if (!token) {
        sendChat('SaveEffects', '/w gm Invalid source token.');
        return;
    }

    state.SaveEffects.sources = state.SaveEffects.sources || {};
    state.SaveEffects.sources[msg.playerid] = tokenId;

    sendChat(
        'SaveEffects',
        '&{template:default} {{name=SaveEffects Source}} {{Source=' + token.get('name') + '}}'
    );
}

function getSavedSourceTokenId(msg) {
    state.SaveEffects.sources = state.SaveEffects.sources || {};
    return state.SaveEffects.sources[msg.playerid] || null;
}

function clearSavedSourceToken(msg) {
    state.SaveEffects.sources = state.SaveEffects.sources || {};
    delete state.SaveEffects.sources[msg.playerid];
}

async function handleSelectedOngoingDamage(msg, args) {
    const targetMode = args[2];
    const effectName = args[3];
    const saveKey = args[4];
    const dcInput = args[5];
    const damageFormula = args[6];
    const damageType = args[7];
    const successMode = args[8];
    const timing = getOptionValue(args, '--timing') || 'startOfTurn';
    const duration = getOptionValue(args, '--duration') || 'manual';
    const sourceTokenId = getOptionValue(args, '--source') || getSavedSourceTokenId(msg);
    const adeptType = getOptionValue(args, '--adept');

    if (targetMode !== 'selected') {
        sendChat('SaveEffects', '/w gm Format: !se ongoing selected NAME SAVE DC DAMAGE TYPE half/none --timing startOfTurn/endOfTurn --duration manual/concentration');
        return;
    }

    const selectedTokens = getSelectedTokens(msg);

    if (!selectedTokens.length) {
        sendChat('SaveEffects', '/w gm Select one or more tokens.');
        return;
    }

    const dc = await resolveDc(dcInput, sourceTokenId);

    if (dc === null) {
        sendChat('SaveEffects', '/w gm Invalid DC. Use a number, or use spell after setting Source.');
        return;
    }

    const damageRoll = rollDamageFormula(damageFormula);

    if (!damageRoll) {
        sendChat('SaveEffects', '/w gm Invalid damage formula.');
        return;
    }

    const saveName = SAVE_ABILITY_NAMES[saveKey];

    if (!saveName) {
        sendChat('SaveEffects', '/w gm Invalid save ability.');
        return;
    }

    for (const token of selectedTokens) {
        const saveBonus = await getSaveBonus(token, saveKey);

        if (saveBonus === null) {
            sendChat('SaveEffects', '/w gm Could not find target save bonus for ' + saveName + ' on ' + token.get('name') + '.');
            continue;
        }

        await rollAndApplyDamageSave({
            token: token,
            saveKey: saveKey,
            save: saveName,
            dc: dc,
            saveBonus: saveBonus,
            damageFormula: damageFormula,
            damageType: damageType,
            damageTotal: damageRoll.total,
            damageBreakdown: damageRoll.breakdown,
            successMode: successMode,
            sourceTokenId: sourceTokenId,
            adeptType: getOptionValue(args, '--adept')
        });

        sendChat(
            'SaveEffects',
            '!ae-ongoing add ' + token.id + ' ' + effectName +
            ' --timing ' + timing +
            ' --save ' + saveKey +
            ' --dc ' + dc +
            ' --damage ' + damageFormula +
            ' --type ' + damageType +
            ' --success ' + successMode +
            (sourceTokenId ? ' --source ' + sourceTokenId : '') +
            (adeptType ? ' --adept ' + adeptType : '') +
            ' --duration ' + duration
        );
    }

    clearSavedSourceToken(msg);
}

function handleSelectedOngoingDamageRemove(msg, args) {
    const targetMode = args[2];
    const effectName = args[3] || 'all';

    if (targetMode !== 'selected') {
        sendChat('SaveEffects', '/w gm Format: !se ongoingremove selected NAME/all');
        return;
    }

    const selectedTokens = getSelectedTokens(msg);

    if (!selectedTokens.length) {
        sendChat('SaveEffects', '/w gm Select one or more tokens.');
        return;
    }

    selectedTokens.forEach(function(token) {
        sendChat('SaveEffects', '!ae-ongoing remove ' + token.id + ' ' + effectName);
    });

    sendChat('SaveEffects', '/w gm Removed ongoing damage from selected tokens.');
}

function getOptionWords(args, optionName) {
    const index = args.indexOf(optionName);

    if (index === -1) {
        return null;
    }

    const words = [];

    for (let i = index + 1; i < args.length; i++) {
        if (String(args[i]).indexOf('--') === 0) break;
        words.push(args[i]);
    }

    return words.length ? words.join(' ') : null;
}

function getSaveHooks(args) {
    return {
        onFail: getOptionWords(args, '--onFail'),
        onSuccess: getOptionWords(args, '--onSuccess'),
        onAny: getOptionWords(args, '--onAny')
    };
}

function runSaveHook(command, result, sourceTokenId) {
    if (!command) return;

    const source = sourceTokenId || '';
    const target = result.tokenId || '';
    const outcome = result.failed ? 'failure' : 'success';

    const finalCommand = command
        .replace(/@@source/g, source)
        .replace(/@@target/g, target)
        .replace(/@@result/g, outcome)
        .replace(/@@damage/g, String(result.damageTaken || 0));

    if (!finalCommand.trim()) return;

    sendChat('SaveEffects', finalCommand);
}

function runSaveHooks(result, hooks, sourceTokenId) {
    if (!hooks) return;

    runSaveHook(hooks.onAny, result, sourceTokenId);

    if (result.failed) {
        runSaveHook(hooks.onFail, result, sourceTokenId);
    } else {
        runSaveHook(hooks.onSuccess, result, sourceTokenId);
    }
}

async function handleBatchDamageSave(msg, args) {
    const saveKey = args[2];
    const dcInput = args[3];
    const damageFormula = args[4];
    const damageType = args[5];
    const successMode = args[6];
    const sourceTokenId = getOptionValue(args, '--source') || getSavedSourceTokenId(msg);
    const adeptType = getOptionValue(args, '--adept');
    const hooks = getSaveHooks(args);
    const positionalArgs = getPositionalArgs(args);
    const targetIds = positionalArgs.slice(7);

    const saveName = SAVE_ABILITY_NAMES[saveKey];

    if (!saveName) {
        sendChat('SaveEffects', '/w gm Invalid save ability. Use str, dex, con, int, wis, or cha.');
        return;
    }

    if (successMode !== 'half' && successMode !== 'none') {
        sendChat('SaveEffects', '/w gm Success mode must be half or none.');
        return;
    }

    if (!targetIds.length) {
        sendChat('SaveEffects', '/w gm Format: !se damagebatch SAVE DC DAMAGE TYPE half/none TOKEN_ID...');
        return;
    }

    const dc = await resolveDc(dcInput, sourceTokenId);

    if (dc === null) {
        sendChat('SaveEffects', '/w gm Invalid DC. Use a number, or use spell with --source SOURCE_TOKEN_ID.');
        return;
    }

    const damageRoll = rollDamageFormula(damageFormula);

    if (!damageRoll) {
        sendChat('SaveEffects', '/w gm Invalid damage formula. Use formats like 8d6, 4d10+2, or 2d8-1.');
        return;
    }

    if (!getOptionValue(args, '--source')) {
        clearSavedSourceToken(msg);
    }

    const results = [];

    for (const tokenId of targetIds) {
        const token = getObj('graphic', tokenId);

        if (!token) {
            sendChat('SaveEffects', '/w gm Skipping invalid target token: ' + tokenId);
            continue;
        }

        const saveBonus = await getSaveBonus(token, saveKey);

        if (saveBonus === null) {
            sendChat('SaveEffects', '/w gm Could not find target save bonus for ' + saveName + ' on ' + token.get('name') + '.');
            continue;
        }

        results.push(await rollAndApplyDamageSave({
            token: token,
            saveKey: saveKey,
            save: saveName,
            dc: dc,
            saveBonus: saveBonus,
            damageFormula: damageFormula,
            damageType: damageType,
            damageTotal: damageRoll.total,
            damageBreakdown: damageRoll.breakdown,
            successMode: successMode,
            sourceTokenId: sourceTokenId,
            adeptType: getOptionValue(args, '--adept'),
            hooks: hooks
        }));
    }

    if (results.length === 1) {
        publicDamageResultCard(results[0]);
    } else if (results.length > 1) {
        publicDamageBatchCard('Damage Save', results);
    }
}

async function handleDamageConditionSave(args) {
    const condition = args[2];
    const saveKey = args[3];
    const tokenId = args[4];
    const dcInput = args[5];
    const damageFormula = args[6];
    const damageType = args[7];
    const successMode = args[8];
    const duration = getOptionValue(args, '--duration');
    const sourceTokenId = getOptionValue(args, '--source');

    const conditionData = AE_CONDITIONS[condition];
    const saveName = SAVE_ABILITY_NAMES[saveKey];
    const token = getObj('graphic', tokenId);

    if (!conditionData) {
        sendChat('SaveEffects', '/w gm Invalid AE condition.');
        return;
    }

    if (!saveName) {
        sendChat('SaveEffects', '/w gm Invalid save ability. Use str, dex, con, int, wis, or cha.');
        return;
    }

    if (!token) {
        sendChat('SaveEffects', '/w gm Invalid target token.');
        return;
    }

    if (successMode !== 'half' && successMode !== 'none') {
        sendChat('SaveEffects', '/w gm Success mode must be half or none.');
        return;
    }

    const dc = await resolveDc(dcInput, sourceTokenId);

    if (dc === null) {
        sendChat('SaveEffects', '/w gm Invalid DC. Use a number, or use spell with --source SOURCE_TOKEN_ID.');
        return;
    }

    const damageRoll = rollDamageFormula(damageFormula);

    if (!damageRoll) {
        sendChat('SaveEffects', '/w gm Invalid damage formula. Use formats like 8d6, 4d10+2, or 2d8-1.');
        return;
    }

    const saveBonus = await getSaveBonus(token, saveKey);

    if (saveBonus === null) {
        sendChat('SaveEffects', '/w gm Could not find target save bonus for ' + saveName + ' on ' + token.get('name') + '.');
        return;
    }

    const result = await rollAndApplyDamageConditionSave({
        token: token,
        saveKey: saveKey,
        save: saveName,
        condition: condition,
        conditionDisplay: conditionData.display,
        duration: duration,
        sourceTokenId: sourceTokenId,
        dc: dc,
        saveBonus: saveBonus,
        damageFormula: damageFormula,
        damageType: damageType,
        damageTotal: damageRoll.total,
        damageBreakdown: damageRoll.breakdown,
        successMode: successMode,
        adeptType: getOptionValue(args, '--adept')
    });

    publicDamageResultCard(result);
}

async function handleSingleDamageSave(args) {
    const tokenId = args[2];
    const saveKey = args[3];
    const dcInput = args[4];
    const damageFormula = args[5];
    const damageType = args[6];
    const successMode = args[7];
    const sourceTokenId = getOptionValue(args, '--source');
    const hooks = getSaveHooks(args);

    const token = getObj('graphic', tokenId);

    if (!token) {
        sendChat('SaveEffects', '/w gm Invalid target token.');
        return;
    }

    const saveName = SAVE_ABILITY_NAMES[saveKey];

    if (!saveName) {
        sendChat('SaveEffects', '/w gm Invalid save ability. Use str, dex, con, int, wis, or cha.');
        return;
    }

    if (successMode !== 'half' && successMode !== 'none') {
        sendChat('SaveEffects', '/w gm Success mode must be half or none.');
        return;
    }

    const dc = await resolveDc(dcInput, null);

    if (dc === null) {
        sendChat('SaveEffects', '/w gm Invalid DC.');
        return;
    }

    const damageRoll = rollDamageFormula(damageFormula);

    if (!damageRoll) {
        sendChat('SaveEffects', '/w gm Invalid damage formula. Use formats like 8d6, 4d10+2, or 2d8-1.');
        return;
    }

    const saveBonus = await getSaveBonus(token, saveKey);

    if (saveBonus === null) {
        sendChat('SaveEffects', '/w gm Could not find target save bonus for ' + saveName + ' on ' + token.get('name') + '.');
        return;
    }

    const result = await rollAndApplyDamageSave({
        token: token,
        saveKey: saveKey,
        save: saveName,
        dc: dc,
        saveBonus: saveBonus,
        damageFormula: damageFormula,
        damageType: damageType,
        damageTotal: damageRoll.total,
        damageBreakdown: damageRoll.breakdown,
        successMode: successMode,
        sourceTokenId: sourceTokenId,
        adeptType: getOptionValue(args, '--adept'),
        hooks: hooks
    });

    publicDamageResultCard(result);
}

async function handleSelectedDamageSave(msg, args) {
    const targetMode = args[2];
    const saveKey = args[3];
    const dcInput = args[4];
    const damageFormula = args[5];
    const damageType = args[6];
    const successMode = args[7];
    const sourceTokenId = getOptionValue(args, '--source') || getSavedSourceTokenId(msg);
    const hooks = getSaveHooks(args);

    if (targetMode !== 'selected') {
        sendChat('SaveEffects', '/w gm Format: !se damage selected SAVE DC DAMAGE TYPE half/none');
        return;
    }

    const saveName = SAVE_ABILITY_NAMES[saveKey];

    if (!saveName) {
        sendChat('SaveEffects', '/w gm Invalid save ability. Use str, dex, con, int, wis, or cha.');
        return;
    }

    if (successMode !== 'half' && successMode !== 'none') {
        sendChat('SaveEffects', '/w gm Success mode must be half or none.');
        return;
    }

    const selectedTokens = getSelectedTokens(msg);

    if (!selectedTokens.length) {
        sendChat('SaveEffects', '/w gm Select one or more tokens.');
        return;
    }

    const dc = await resolveDc(dcInput, sourceTokenId);

    if (dc === null) {
        sendChat('SaveEffects', '/w gm Invalid DC. Use a number, or use spell with --source SOURCE_TOKEN_ID.');
        return;
    }

    const damageRoll = rollDamageFormula(damageFormula);

    if (!damageRoll) {
        sendChat('SaveEffects', '/w gm Invalid damage formula. Use formats like 8d6, 4d10+2, or 2d8-1.');
        return;
    }

    if (!getOptionValue(args, '--source')) {
        clearSavedSourceToken(msg);
    }

    const results = [];

    for (const token of selectedTokens) {
        const saveBonus = await getSaveBonus(token, saveKey);

        if (saveBonus === null) {
            sendChat('SaveEffects', '/w gm Could not find target save bonus for ' + saveName + ' on ' + token.get('name') + '.');
            continue;
        }

        results.push(await rollAndApplyDamageSave({
            token: token,
            saveKey: saveKey,
            save: saveName,
            dc: dc,
            saveBonus: saveBonus,
            damageFormula: damageFormula,
            damageType: damageType,
            damageTotal: damageRoll.total,
            damageBreakdown: damageRoll.breakdown,
            successMode: successMode,
            sourceTokenId: sourceTokenId,
            adeptType: getOptionValue(args, '--adept'),
            hooks: hooks
        }));
    }

    if (results.length === 1) {
        publicDamageResultCard(results[0]);
    } else if (results.length > 1) {
        publicDamageBatchCard('Damage Save', results);
    }
}

async function rollAndApplyDamageConditionSave(config) {
    const rollMode = getAeSaveRollMode(config.token, config.saveKey, config.condition);
    const first = randomInteger(20);
    const second = rollMode === 'normal' ? null : randomInteger(20);

    let d20 = first;
    let rollFormula = first + ' + ' + config.saveBonus;

    if (rollMode === 'advantage') {
        d20 = Math.max(first, second);
        rollFormula = '{' + first + ',' + second + '}kh1 + ' + config.saveBonus;
    }

    if (rollMode === 'disadvantage') {
        d20 = Math.min(first, second);
        rollFormula = '{' + first + ',' + second + '}kl1 + ' + config.saveBonus;
    }

    const auraBonus = getAeSaveBonusModifier(config.token, config.saveKey);
    const total = d20 + config.saveBonus + auraBonus;
    const failed = total < config.dc;
    const immune = failed && getAeConditionImmunity(config.token, config.condition);
    const damageAfterSave = failed ? config.damageTotal : getSuccessDamage(config.damageTotal, config.successMode);
    const modifiedDamage = await getAeModifiedDamage(config.token, config.damageType, damageAfterSave, {
        adept: config.adeptType
    });
    const damageTaken = modifiedDamage.amount;

    const hpBefore = parseInt(config.token.get('bar1_value'), 10) || 0;

    const applied = await seApplyDamageToToken(config.token, damageTaken);

    const hpAfter = parseInt(config.token.get('bar1_value'), 10) || 0;

    let effectText = damageTaken + ' ' + config.damageType + ' damage applied.';

    if (failed && immune) {
        effectText += ' Target is immune to the ' + config.conditionDisplay + ' condition.';
    }

    if (failed && !immune) {
        if (config.duration === 'concentration' && config.sourceTokenId) {
            sendChat('SaveEffects', '!ae-effect concentrate ' + config.sourceTokenId);
        }

        sendChat('SaveEffects', buildAeConditionCommand(
            config.condition,
            config.token.id,
            config.duration,
            config.sourceTokenId
        ));

        effectText += ' Target gains the ' + config.conditionDisplay + ' condition.';
    }

    sendChat(
        'SaveEffects',
        `/w gm &{template:default} {{name=Damage Condition Save: ${config.conditionDisplay}}} {{Target=${config.token.get('name')}}} {{${config.save} Save=[[${rollFormula}${auraBonus ? ' + ' + auraBonus : ''}]]}} {{DC=${config.dc}}} {{Result=${failed ? 'Failure' : 'Success'}}} {{Damage Roll=${config.damageBreakdown} = ${config.damageTotal} ${config.damageType}}} {{After Save=${damageAfterSave} ${config.damageType}}} {{Damage Traits=${modifiedDamage.note}}} {{Damage Taken=${damageTaken} ${config.damageType}}} {{HP=${applied.hpBefore} → ${applied.hpAfter}}} {{Temp HP=${applied.tempBefore} → ${applied.tempAfter}}} {{Condition=${failed ? (immune ? 'Immune' : config.conditionDisplay) : 'None'}}}`
    );

    safelyNotifyAeDamageResult(config.sourceTokenId, config.token.id, hpBefore, hpAfter);

    return {
        targetName: config.token.get('name'),
        display: config.conditionDisplay,
        save: config.save,
        failed: failed,
        damageBreakdown: config.damageBreakdown,
        damageTotal: config.damageTotal,
        damageType: config.damageType,
        damageAfterSave: damageAfterSave,
        damageTaken: damageTaken,
        damageTraits: modifiedDamage.note,
        hpBefore: applied.hpBefore,
        hpAfter: applied.hpAfter,
        tempBefore: applied.tempBefore,
        tempAfter: applied.tempAfter,
        effect: effectText
    };
}

async function rollAndApplyDamageSave(config) {
    const rollMode = getAeSaveRollMode(config.token, config.saveKey);
    const first = randomInteger(20);
    const second = rollMode === 'normal' ? null : randomInteger(20);

    let d20 = first;
    let rollFormula = first + ' + ' + config.saveBonus;

    if (rollMode === 'advantage') {
        d20 = Math.max(first, second);
        rollFormula = '{' + first + ',' + second + '}kh1 + ' + config.saveBonus;
    }

    if (rollMode === 'disadvantage') {
        d20 = Math.min(first, second);
        rollFormula = '{' + first + ',' + second + '}kl1 + ' + config.saveBonus;
    }

    const auraBonus = getAeSaveBonusModifier(config.token, config.saveKey);
    const total = d20 + config.saveBonus + auraBonus;
    const failed = total < config.dc;
    const damageAfterSave = failed ? config.damageTotal : getSuccessDamage(config.damageTotal, config.successMode);
    const modifiedDamage = await getAeModifiedDamage(config.token, config.damageType, damageAfterSave, {
        adept: config.adeptType
    });
    const damageTaken = modifiedDamage.amount;

    const hpBefore = parseInt(config.token.get('bar1_value'), 10) || 0;

    const applied = await seApplyDamageToToken(config.token, damageTaken);

    const hpAfter = parseInt(config.token.get('bar1_value'), 10) || 0;

    sendChat(
        'SaveEffects',
        `/w gm &{template:default} {{name=${config.display || 'Damage Save'}}} {{Target=${config.token.get('name')}}} {{${config.save} Save=[[${rollFormula}${auraBonus ? ' + ' + auraBonus : ''}]]}} {{DC=${config.dc}}} {{Result=${failed ? 'Failure' : 'Success'}}} {{Damage Roll=${config.damageBreakdown} = ${config.damageTotal} ${config.damageType}}} {{After Save=${damageAfterSave} ${config.damageType}}} {{Damage Traits=${modifiedDamage.note}}} {{Damage Taken=${damageTaken} ${config.damageType}}} {{HP=${applied.hpBefore} → ${applied.hpAfter}}} {{Temp HP=${applied.tempBefore} → ${applied.tempAfter}}}`
    );

    safelyNotifyAeDamageResult(config.sourceTokenId, config.token.id, hpBefore, hpAfter);

    const result = {
        tokenId: config.token.id,
        targetName: config.token.get('name'),
        display: config.display || 'Damage Save',
        save: config.save,
        failed: failed,
        damageBreakdown: config.damageBreakdown,
        damageTotal: config.damageTotal,
        damageType: config.damageType,
        damageAfterSave: damageAfterSave,
        damageTaken: damageTaken,
        damageTraits: modifiedDamage.note,
        hpBefore: applied.hpBefore,
        hpAfter: applied.hpAfter,
        tempBefore: applied.tempBefore,
        tempAfter: applied.tempAfter,
        effect: damageTaken + ' ' + config.damageType + ' damage applied.'
    };

    runSaveHooks(result, config.hooks, config.sourceTokenId);

    return result;
}

function safelyNotifyAeDamageResult(sourceTokenId, targetTokenId, hpBefore, hpAfter) {
    if (!sourceTokenId) return;
    if (hpBefore <= 0 || hpAfter > 0) return;

    setTimeout(function() {
        try {
            if (
                typeof ActionEconomyV2API !== 'undefined' &&
                ActionEconomyV2API &&
                typeof ActionEconomyV2API.processDamageResult === 'function'
            ) {
                ActionEconomyV2API.processDamageResult(sourceTokenId, targetTokenId, hpBefore, hpAfter);
            }
        } catch (e) {
            sendChat('SaveEffects', '/w gm SE: AE damage result notification failed, but SaveEffects completed.');
        }
    }, 0);
}

function publicDamageResultCard(result) {
    sendChat(
        'SaveEffects',
        '&{template:default} ' +
        '{{name=' + result.display + '}} ' +
        '{{Result=' + result.targetName + ' ' + (result.failed ? 'failed' : 'saved') + ' on their ' + result.save + ' Saving Throw.}} ' +
        '{{Damage Roll=' + result.damageBreakdown + ' = ' + result.damageTotal + ' ' + result.damageType + '}} ' +
        '{{Damage Taken=' + result.damageTaken + ' ' + result.damageType + '}} ' +
        '{{Effect=' + result.effect + '}}'
    );
}

function publicDamageBatchCard(display, results) {
    const saved = results.filter(result => !result.failed).length;
    const failed = results.filter(result => result.failed).length;
    const firstResult = results[0];
    const effects = results.map(function(result) {
        return result.targetName + ': ' + result.damageTaken + ' ' + result.damageType + ' damage';
    });

    sendChat(
        'SaveEffects',
        '&{template:default} ' +
        '{{name=' + display + '}} ' +
        '{{Damage Roll=' + firstResult.damageBreakdown + ' = ' + firstResult.damageTotal + ' ' + firstResult.damageType + '}} ' +
        '{{Targets=' + results.length + '}} ' +
        '{{Saved=' + saved + '}} ' +
        '{{Failed=' + failed + '}} ' +
        '{{Damage Taken=' + effects.join('<br>') + '}}'
    );
}

function getAeSaveBonusModifier(token, saveKey) {
    if (
        typeof ActionEconomyV2API !== 'undefined' &&
        ActionEconomyV2API &&
        typeof ActionEconomyV2API.getSaveBonusModifier === 'function'
    ) {
        return ActionEconomyV2API.getSaveBonusModifier(token, saveKey);
    }

    return 0;
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

function getSuccessDamage(total, successMode) {
    if (successMode === 'none') {
        return 0;
    }

    return Math.floor(total / 2);
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

async function seApplyDamageToToken(token, amount) {
    const hpBefore = parseInt(token.get('bar1_value'), 10);
    const tempBefore = parseInt(token.get('bar2_value'), 10);
    let hpAfter = isNaN(hpBefore) ? 0 : hpBefore;
    let tempAfter = isNaN(tempBefore) ? 0 : tempBefore;

    if (!amount || amount <= 0) {
        return {
            hpBefore: hpAfter,
            hpAfter: hpAfter,
            tempBefore: tempAfter,
            tempAfter: tempAfter
        };
    }

    let remaining = amount;

    if (tempAfter > 0) {
        const tempDamage = Math.min(tempAfter, remaining);
        tempAfter = tempAfter - tempDamage;

        token.set({
            bar2_value: tempAfter
        });

        const characterId = token.get('represents');

        if (characterId && typeof setSheetItem === 'function') {
            await setSheetItem(characterId, 'hp_temp', tempAfter);
        }

        remaining -= tempDamage;
    }

    if (remaining > 0 && !isNaN(hpBefore)) {
        hpAfter = Math.max(0, hpBefore - remaining);

        token.set({
            bar1_value: hpAfter
        });

        hpAfter = processTokenTriggersBar1Change(token, hpBefore, hpAfter);

        const characterId = token.get('represents');

        if (characterId && typeof setSheetItem === 'function') {
            await setSheetItem(characterId, 'hp', hpAfter);
        }
    }

    return {
        hpBefore: isNaN(hpBefore) ? 0 : hpBefore,
        hpAfter: hpAfter,
        tempBefore: isNaN(tempBefore) ? 0 : tempBefore,
        tempAfter: tempAfter
    };
}

function rollDamageFormula(formula) {
    const cleanFormula = String(formula || '').replace(/\s+/g, '').toLowerCase();
    const match = cleanFormula.match(/^(\d+)d(\d+)([+-]\d+)?$/);

    if (!match) {
        return null;
    }

    const count = parseInt(match[1], 10);
    const die = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;

    if (count < 1 || die < 1) {
        return null;
    }

    let total = 0;
    const rolls = [];

    for (let i = 0; i < count; i++) {
        const roll = randomInteger(die);
        rolls.push(roll);
        total += roll;
    }

    total += modifier;

    return {
        total: Math.max(0, total),
        breakdown: rolls.join(' + ') + (modifier ? ' ' + (modifier > 0 ? '+ ' : '- ') + Math.abs(modifier) : '')
    };
}

async function handleSelectedSaveEffect(msg, args) {
    const condition = args[2];
    const saveKey = args[3];
    const duration = getOptionValue(args, '--duration');
    const sourceTokenId = getOptionValue(args, '--source') || getSavedSourceTokenId(msg);
    const adeptType = getOptionValue(args, '--adept');
    const positionalArgs = getPositionalArgs(args);

    const conditionData = AE_CONDITIONS[condition];
    const saveName = SAVE_ABILITY_NAMES[saveKey];

    if (!conditionData) {
        sendChat('SaveEffects', '/w gm Invalid AE condition.');
        return;
    }

    if (!saveName) {
        sendChat('SaveEffects', '/w gm Invalid save ability. Use str, dex, con, int, wis, or cha.');
        return;
    }

    if (positionalArgs.length < 5) {
        sendChat('SaveEffects', '/w gm Format: !se selected CONDITION SAVE DC');
        return;
    }

    const selectedTokens = getSelectedTokens(msg);

    if (!selectedTokens.length) {
        sendChat('SaveEffects', '/w gm Select one or more tokens.');
        return;
    }

    const dcInput = positionalArgs[4];
    const dc = await resolveDc(dcInput, sourceTokenId);

    if (dc === null) {
        sendChat('SaveEffects', '/w gm Invalid DC. Use a number, or use spell with --source SOURCE_TOKEN_ID.');
        return;
    }

    if (!getOptionValue(args, '--source')) {
        clearSavedSourceToken(msg);
    }

    const results = [];

    for (const token of selectedTokens) {
        const saveBonus = await getSaveBonus(token, saveKey);

        if (saveBonus === null) {
            sendChat('SaveEffects', '/w gm Could not find target save bonus for ' + saveName + ' on ' + token.get('name') + '.');
            continue;
        }

        results.push(rollAndApplySaveEffect({
            display: conditionData.display,
            saveKey: saveKey,
            save: saveName,
            condition: condition,
            duration: duration,
            sourceTokenId: sourceTokenId,
            failText: 'The target gains the ' + conditionData.display + ' condition.',
            token: token,
            dc: dc,
            saveBonus: saveBonus
        }));
    }

    if (results.length === 1) {
        publicSaveResultCard(results[0]);
    } else if (results.length > 1) {
        publicSaveBatchCard(conditionData.display, results);
    }
}

async function handleGenericSaveEffect(args) {
    const condition = args[2];
    const saveKey = args[3];
    const duration = getOptionValue(args, '--duration');
    const sourceTokenId = getOptionValue(args, '--source');
    const positionalArgs = getPositionalArgs(args);

    const conditionData = AE_CONDITIONS[condition];
    const saveName = SAVE_ABILITY_NAMES[saveKey];

    if (!conditionData) {
        sendChat('SaveEffects', '/w gm Invalid AE condition.');
        return;
    }

    if (!saveName) {
        sendChat('SaveEffects', '/w gm Invalid save ability. Use str, dex, con, int, wis, or cha.');
        return;
    }

    if (positionalArgs.length < 6) {
        sendChat('SaveEffects', '/w gm Format: !se save CONDITION SAVE TARGET_ID DC');
        return;
    }

    const dcInput = positionalArgs[positionalArgs.length - 1];
    const targetIds = positionalArgs.slice(4, positionalArgs.length - 1);
    const dc = await resolveDc(dcInput, sourceTokenId);

    if (dc === null) {
        sendChat('SaveEffects', '/w gm Invalid DC. Use a number, or use spell with --source SOURCE_TOKEN_ID.');
        return;
    }

    const results = [];

    for (const tokenId of targetIds) {
        const token = getObj('graphic', tokenId);

        if (!token) {
            sendChat('SaveEffects', '/w gm Skipping invalid target token: ' + tokenId);
            continue;
        }

        const saveBonus = await getSaveBonus(token, saveKey);

        if (saveBonus === null) {
            sendChat('SaveEffects', '/w gm Could not find target save bonus for ' + saveName + ' on ' + token.get('name') + '.');
            continue;
        }

        results.push(rollAndApplySaveEffect({
            display: conditionData.display,
            saveKey: saveKey,
            save: saveName,
            condition: condition,
            duration: duration,
            sourceTokenId: sourceTokenId,
            failText: 'The target gains the ' + conditionData.display + ' condition.',
            token: token,
            dc: dc,
            saveBonus: saveBonus
        }));
    }

    if (results.length === 1) {
        publicSaveResultCard(results[0]);
    } else if (results.length > 1) {
        publicSaveBatchCard(conditionData.display, results);
    }
}

function rollAndApplySaveEffect(config) {
    const rollMode = getAeSaveRollMode(config.token, config.saveKey, config.condition);
    const first = randomInteger(20);
    const second = rollMode === 'normal' ? null : randomInteger(20);

    let d20 = first;
    let rollFormula = first + ' + ' + config.saveBonus;

    if (rollMode === 'advantage') {
        d20 = Math.max(first, second);
        rollFormula = '{' + first + ',' + second + '}kh1 + ' + config.saveBonus;
    }

    if (rollMode === 'disadvantage') {
        d20 = Math.min(first, second);
        rollFormula = '{' + first + ',' + second + '}kl1 + ' + config.saveBonus;
    }

    const auraBonus = getAeSaveBonusModifier(config.token, config.saveKey);
    const total = d20 + config.saveBonus + auraBonus;
    const failed = total < config.dc;
    const immune = failed && getAeConditionImmunity(config.token, config.condition);
    const effectText = failed ? (immune ? 'Target is immune to the ' + config.display + ' condition.' : config.failText) : 'No additional effect.';

    if (failed && !immune) {
        if (config.duration === 'concentration' && config.sourceTokenId) {
            sendChat('SaveEffects', '!ae-effect concentrate ' + config.sourceTokenId);
        }

        sendChat('SaveEffects', buildAeConditionCommand(
            config.condition,
            config.token.id,
            config.duration,
            config.sourceTokenId,
            config.repeatSaveTiming,
            config.saveKey,
            config.dc,
            config.repeatSaveSuccess
        ));
    }

    sendChat(
        'SaveEffects',
        `/w gm &{template:default} {{name=Save Effect: ${config.display}}} {{Target=${config.token.get('name')}}} {{${config.save} Save=[[${rollFormula}${auraBonus ? ' + ' + auraBonus : ''}]]}} {{DC=${config.dc}}} {{Result=${failed ? 'Failure' : 'Success'}}} {{Effect=${effectText}}}`
    );

    return {
        targetName: config.token.get('name'),
        display: config.display,
        save: config.save,
        failed: failed,
        immune: immune,
        effect: failed && !immune ? effectText : 'No effect.'
    };
}

function publicSaveResultCard(result) {
    sendChat(
        'SaveEffects',
        '&{template:default} ' +
        '{{name=' + result.display + '}} ' +
        '{{Result=' + result.targetName + ' ' + (result.failed ? 'failed' : 'saved') + ' on their ' + result.save + ' Saving Throw.}} ' +
        '{{Effect=' + result.effect + '}}'
    );
}

function publicSaveBatchCard(display, results) {
    const saved = results.filter(result => !result.failed).length;
    const failed = results.filter(result => result.failed).length;
    const effects = results
        .filter(result => result.failed && result.effect && result.effect !== 'No effect.')
        .map(result => result.targetName + ': ' + result.effect);

    sendChat(
        'SaveEffects',
        '&{template:default} ' +
        '{{name=' + display + '}} ' +
        '{{Targets=' + results.length + '}} ' +
        '{{Saved=' + saved + '}} ' +
        '{{Failed=' + failed + '}} ' +
        '{{Effect=' + (effects.length ? effects.join('<br>') : 'No effect.') + '}}'
    );
}

function getAeSaveRollMode(token, saveKey, conditionKey) {
    if (
        typeof ActionEconomyV2API !== 'undefined' &&
        ActionEconomyV2API &&
        typeof ActionEconomyV2API.getSaveRollMode === 'function'
    ) {
        return ActionEconomyV2API.getSaveRollMode(token, saveKey, conditionKey);
    }

    return 'normal';
}

function getAeConditionImmunity(token, conditionName) {
    if (
        typeof ActionEconomyV2API !== 'undefined' &&
        ActionEconomyV2API &&
        typeof ActionEconomyV2API.hasConditionImmunity === 'function'
    ) {
        return ActionEconomyV2API.hasConditionImmunity(token, conditionName);
    }

    return false;
}

async function rollSimpleSave(config) {
    config = config || {};

    const token = getObj('graphic', config.targetTokenId);
    const saveKey = config.saveKey;
    const saveName = SAVE_ABILITY_NAMES[saveKey];

    if (!token) {
        sendChat('SaveEffects', '/w gm SaveEffectsAPI.rollSave: invalid target token.');
        return null;
    }

    if (!saveName) {
        sendChat('SaveEffects', '/w gm SaveEffectsAPI.rollSave: invalid save key.');
        return null;
    }

    const dc = await resolveDc(config.dc, config.sourceTokenId);

    if (dc === null) {
        sendChat('SaveEffects', '/w gm SaveEffectsAPI.rollSave: invalid DC.');
        return null;
    }

    const saveBonus = await getSaveBonus(token, saveKey);

    if (saveBonus === null) {
        sendChat('SaveEffects', '/w gm SaveEffectsAPI.rollSave: could not find ' + saveName + ' save bonus for ' + token.get('name') + '.');
        return null;
    }

    let rollMode = config.mode || getAeSaveRollMode(token, saveKey, config.conditionKey);

    if (rollMode !== 'advantage' && rollMode !== 'disadvantage') {
        rollMode = 'normal';
    }

    const first = randomInteger(20);
    const second = rollMode === 'normal' ? null : randomInteger(20);

    let d20 = first;
    let rollFormula = first + ' + ' + saveBonus;

    if (rollMode === 'advantage') {
        d20 = Math.max(first, second);
        rollFormula = '{' + first + ',' + second + '}kh1 + ' + saveBonus;
    }

    if (rollMode === 'disadvantage') {
        d20 = Math.min(first, second);
        rollFormula = '{' + first + ',' + second + '}kl1 + ' + saveBonus;
    }

    const auraBonus = getAeSaveBonusModifier(token, saveKey);
    const total = d20 + saveBonus + auraBonus;
    const success = total >= dc;
    const title = config.title || 'Saving Throw';
    const effectText = success ?
        (config.successText || 'Save succeeds.') :
        (config.failureText || 'Save fails.');

    sendChat(
        'SaveEffects',
        '/w gm &{template:default} ' +
        '{{name=' + title + '}} ' +
        '{{Target=' + token.get('name') + '}} ' +
        '{{' + saveName + ' Save=[[' + rollFormula + (auraBonus ? ' + ' + auraBonus : '') + ']]}} ' +
        '{{DC=' + dc + '}} ' +
        '{{Result=' + (success ? 'Success' : 'Failure') + '}} ' +
        '{{Effect=' + effectText + '}}'
    );

    return {
        tokenId: token.id,
        targetName: token.get('name'),
        saveKey: saveKey,
        save: saveName,
        dc: dc,
        total: total,
        success: success,
        failed: !success,
        rollMode: rollMode,
        rollFormula: rollFormula,
        auraBonus: auraBonus
    };
}

if (typeof SaveEffectsAPI === 'undefined') {
    SaveEffectsAPI = {};
}

SaveEffectsAPI.rollSave = function(config) {
    return rollSimpleSave(config || {});
};


function buildAeConditionCommand(condition, tokenId, duration, sourceTokenId, repeatSaveTiming, repeatSaveKey, repeatSaveDc, repeatSaveSuccess) {
    let command = '!ae-con ' + condition + ' ' + tokenId;

    if (duration) {
        command += ' --duration ' + duration;
    }

    if (sourceTokenId) {
        command += ' --source ' + sourceTokenId;
    }

    if (repeatSaveTiming && repeatSaveKey && repeatSaveDc) {
        command += ' --repeatSave ' + repeatSaveTiming;
        command += ' --repeatSaveKey ' + repeatSaveKey;
        command += ' --repeatSaveDc ' + repeatSaveDc;
        command += ' --repeatSaveSuccess ' + (repeatSaveSuccess || 'remove');
    }

    return command;
}

function showSaveEffectsMenu(msg) {
    const namedSaveQuery =
        '?&#123;Named Save&#124;' +
        'Trip,trip&#124;' +
        'Topple,topple&#124;' +
        'Poison,poison&#124;' +
        'Grapple,grapple&#124;' +
        'Gutshot,gutshot&#124;' +
        'Hold Person,holdperson' +
        '&#125;';

    const menu =
        '&{template:default} ' +
        '{{name=SaveEffects Menu}} ' +
        '{{Precise Saves=' +
            '[Named Saves](!se namedmenu ' + namedSaveQuery + ') ' +
            '[Manual Saves](!se targetmenu manual) ' +
            '[Spell Saves](!se targetmenu spell)' +
        '}} ' +
        '{{AoE Saves=' +
            '[Source](!se source &#64;&#123;selected&#124;token_id&#125;) ' +
            '[Selected Spell Save](!se selected ?&#123;Condition&#124;Blinded,blinded&#124;Charmed,charmed&#124;Deafened,deafened&#124;Frightened,frightened&#124;Grappled,grappled&#124;Incapacitated,incapacitated&#124;Paralyzed,paralyzed&#124;Poisoned,poisoned&#124;Prone,prone&#124;Restrained,restrained&#124;Stunned,stunned&#125; ?&#123;Save&#124;Strength,str&#124;Dexterity,dex&#124;Constitution,con&#124;Intelligence,int&#124;Wisdom,wis&#124;Charisma,cha&#125; spell --duration ?&#123;Duration&#124;Manual,manual&#124;Combat,combat&#124;Concentration,concentration&#124;Target Next Turn,targetNextTurn&#124;Caster Next Turn,casterNextTurn&#125;) ' +
            '[Damage Save](!se damage selected ?&#123;Save&#124;Strength,str&#124;Dexterity,dex&#124;Constitution,con&#124;Intelligence,int&#124;Wisdom,wis&#124;Charisma,cha&#125; ?&#123;DC&#124;spell&#125; ?&#123;Damage&#124;8d6&#125; ?&#123;Type&#124;Fire&#125; ?&#123;Success&#124;Half,half&#124;None,none&#125;)' +
        '}} ' +
        '{{Ongoing Damage=' +
            '[Apply to Selected](!se ongoing selected ?&#123;Effect Name&#124;ongoingdamage&#125; ?&#123;Save&#124;Strength,str&#124;Dexterity,dex&#124;Constitution,con&#124;Intelligence,int&#124;Wisdom,wis&#124;Charisma,cha&#125; ?&#123;DC&#124;spell&#125; ?&#123;Damage&#124;3d8&#125; ?&#123;Type&#124;Radiant&#125; ?&#123;Success&#124;Half,half&#124;None,none&#125; --timing ?&#123;Timing&#124;Start of Turn,startOfTurn&#124;End of Turn,endOfTurn&#125; --duration ?&#123;Duration&#124;Manual,manual&#124;Concentration,concentration&#125;) ' +
            '[Remove from Selected](!se ongoingremove selected ?&#123;Effect Name to Remove&#124;ongoingdamage&#124;all&#125;)' +
        '}} ' +
        '{{Other Commands=' +
            '[Conditions](!ae-con menu) ' +
            '[Effects](!ae-effect menu)' +
        '}}';

    sendChat('SaveEffects', '/w gm ' + menu);
}

function showTargetCountMenu(msg, mode) {
    const player = getObj('player', msg.playerid);
    const whisperTarget = player ? player.get('_displayname') : 'gm';

    if (mode !== 'manual' && mode !== 'spell') {
        sendChat('SaveEffects', '/w gm Invalid target menu mode.');
        return;
    }

    const conditionQuery =
        '?&#123;Condition&#124;' +
        'Blinded,blinded&#124;' +
        'Charmed,charmed&#124;' +
        'Deafened,deafened&#124;' +
        'Exhaustion,exhaustion&#124;' +
        'Frightened,frightened&#124;' +
        'Grappled,grappled&#124;' +
        'Incapacitated,incapacitated&#124;' +
        'Invisible,invisible&#124;' +
        'Paralyzed,paralyzed&#124;' +
        'Petrified,petrified&#124;' +
        'Poisoned,poisoned&#124;' +
        'Prone,prone&#124;' +
        'Restrained,restrained&#124;' +
        'Stunned,stunned&#124;' +
        'Unconscious,unconscious' +
        '&#125;';

    const saveQuery =
        '?&#123;Save&#124;' +
        'Strength,str&#124;' +
        'Dexterity,dex&#124;' +
        'Constitution,con&#124;' +
        'Intelligence,int&#124;' +
        'Wisdom,wis&#124;' +
        'Charisma,cha' +
        '&#125;';

    const manualDcQuery =
        '?&#123;DC&#124;15&#125;';

    const durationQuery =
        '?&#123;Duration&#124;' +
        'Manual,manual&#124;' +
        'Combat,combat&#124;' +
        'Target Next Turn,targetNextTurn&#124;' +
        'Caster Next Turn,casterNextTurn&#124;' +
        'End of Turn,endOfTurn' +
        '&#125;';

    const target1 =
        '&#64;&#123;target&#124;Target 1&#124;token_id&#125;';

    const target2 =
        target1 + ' ' +
        '&#64;&#123;target&#124;Target 2&#124;token_id&#125;';

    const target3 =
        target2 + ' ' +
        '&#64;&#123;target&#124;Target 3&#124;token_id&#125;';

    const target4 =
        target3 + ' ' +
        '&#64;&#123;target&#124;Target 4&#124;token_id&#125;';

    const target5 =
        target4 + ' ' +
        '&#64;&#123;target&#124;Target 5&#124;token_id&#125;';

    const dcInput = mode === 'spell' ? 'spell' : manualDcQuery;
    const title = mode === 'spell' ? 'Spell Save DC Targets' : 'Manual DC Targets';

    const commandBase =
        '!se save ' + conditionQuery + ' ' + saveQuery + ' ';

    const commandEnd =
        ' ' + dcInput + ' --duration ' + durationQuery + ' --source &#64;&#123;selected&#124;token_id&#125;';

    const menu =
        '&{template:default} ' +
        '{{name=' + title + '}} ' +
        '{{Choose Targets=' +
            '[1](' + commandBase + target1 + commandEnd + ') ' +
            '[2](' + commandBase + target2 + commandEnd + ') ' +
            '[3](' + commandBase + target3 + commandEnd + ') ' +
            '[4](' + commandBase + target4 + commandEnd + ') ' +
            '[5](' + commandBase + target5 + commandEnd + ')' +
        '}}';

    sendChat('SaveEffects', '/w gm ' + menu);
}

function showNamedSaveMenu(msg, effectKey) {
    const data = SAVE_EFFECTS_REGISTRY[effectKey];

    if (!data) {
        sendChat('SaveEffects', '/w gm Invalid named save.');
        return;
    }

    if (effectKey === 'holdperson') {
        showNamedTargetCountMenu(msg, effectKey);
        return;
    }

    const sourceText = data.sourceRequired ? ' --source &#64;&#123;selected&#124;token_id&#125;' : '';

    const menu =
        '&{template:default} ' +
        '{{name=' + data.display + ' Save}} ' +
        '{{Command=' +
            '[Use ' + data.display + '](!se ' + effectKey + ' &#64;&#123;target&#124;Target&#124;token_id&#125; ?&#123;DC&#124;15&#125;' + sourceText + ')' +
        '}}';

    sendChat('SaveEffects', '/w gm ' + menu);
}

function showNamedTargetCountMenu(msg, effectKey) {
    const data = SAVE_EFFECTS_REGISTRY[effectKey];

    if (!data) {
        sendChat('SaveEffects', '/w gm Invalid named save.');
        return;
    }

    const target1 =
        '&#64;&#123;target&#124;Target 1&#124;token_id&#125;';

    const target2 =
        target1 + ' ' +
        '&#64;&#123;target&#124;Target 2&#124;token_id&#125;';

    const target3 =
        target2 + ' ' +
        '&#64;&#123;target&#124;Target 3&#124;token_id&#125;';

    const target4 =
        target3 + ' ' +
        '&#64;&#123;target&#124;Target 4&#124;token_id&#125;';

    const target5 =
        target4 + ' ' +
        '&#64;&#123;target&#124;Target 5&#124;token_id&#125;';

    const menu =
        '&{template:default} ' +
        '{{name=' + data.display + ' Targets}} ' +
        '{{Choose Targets=' +
            '[1](!se ' + effectKey + ' ' + target1 + ' spell --source &#64;&#123;selected&#124;token_id&#125;) ' +
            '[2](!se ' + effectKey + ' ' + target2 + ' spell --source &#64;&#123;selected&#124;token_id&#125;) ' +
            '[3](!se ' + effectKey + ' ' + target3 + ' spell --source &#64;&#123;selected&#124;token_id&#125;) ' +
            '[4](!se ' + effectKey + ' ' + target4 + ' spell --source &#64;&#123;selected&#124;token_id&#125;) ' +
            '[5](!se ' + effectKey + ' ' + target5 + ' spell --source &#64;&#123;selected&#124;token_id&#125;)' +
        '}}';

    sendChat('SaveEffects', '/w gm ' + menu);
}


function showConditionsMenu(msg) {
    const player = getObj('player', msg.playerid);
    const whisperTarget = player ? player.get('_displayname') : 'gm';

    const conditionList = Object.keys(AE_CONDITIONS)
        .map(function(conditionKey) {
            return conditionKey + ' = ' + AE_CONDITIONS[conditionKey].display;
        })
        .join('<br>');

    const menu =
        '&{template:default} ' +
        '{{name=AE Conditions Available to SaveEffects}} ' +
        '{{Conditions=' + conditionList + '}} ' +
        '{{Manual DC Format=!se save CONDITION SAVE TOKEN_ID DC --duration DURATION --source SOURCE_ID}} ' +
        '{{Spell DC Format=!se save CONDITION SAVE TOKEN_ID spell --duration DURATION --source SOURCE_ID}}';

    sendChat('SaveEffects', '/w gm ' + menu);
}

function cleanSkillKey(skillKey) {
    return String(skillKey || '')
        .toLowerCase()
        .replace(/[^a-z]/g, '');
}

function cleanCheckTitle(rawTitle) {
    if (!rawTitle) {
        return 'Skill Check';
    }

    return String(rawTitle).replace(/_/g, ' ');
}

async function getSkillBonus(token, skillKey) {
    const characterId = token.get('represents');

    if (!characterId) {
        return null;
    }

    const cleanKey = cleanSkillKey(skillKey);
    const attrName = SKILL_BONUS_ATTRIBUTES[cleanKey];

    if (!attrName) {
        return null;
    }

    return await getBeaconSheetValue(characterId, attrName);
}

function spendAeAction(token) {
    if (
        typeof ActionEconomyV2API !== 'undefined' &&
        ActionEconomyV2API &&
        typeof ActionEconomyV2API.spendAction === 'function'
    ) {
        ActionEconomyV2API.spendAction(token);
    }
}

async function handleCheckSave(msg, args) {
    const tokenId = args[2];
    const saveKey = args[3];
    const dcInput = args[4];
    const sourceTokenId = getOptionValue(args, '--source') || getSavedSourceTokenId(msg);
    const title = cleanCheckTitle(getOptionWords(args, '--title') || 'Saving Throw');
    const successText = getOptionWords(args, '--success') || 'No effect.';
    const failureText = getOptionWords(args, '--failure') || 'Effect applied.';
    const hooks = getSaveHooks(args);

    const token = getObj('graphic', tokenId);

    if (!token) {
        sendChat('SaveEffects', '/w gm Invalid target token.');
        return;
    }

    const saveName = SAVE_ABILITY_NAMES[saveKey];

    if (!saveName) {
        sendChat('SaveEffects', '/w gm Invalid save ability. Use str, dex, con, int, wis, or cha.');
        return;
    }

    const dc = await resolveDc(dcInput, sourceTokenId);

    if (dc === null) {
        sendChat('SaveEffects', '/w gm Invalid DC. Use a number, or use spell with --source SOURCE_TOKEN_ID.');
        return;
    }

    const saveBonus = await getSaveBonus(token, saveKey);

    if (saveBonus === null) {
        sendChat('SaveEffects', '/w gm Could not find target save bonus for ' + saveName + ' on ' + token.get('name') + '.');
        return;
    }

    const rollMode = getAeSaveRollMode(token, saveKey);
    const first = randomInteger(20);
    const second = rollMode === 'normal' ? null : randomInteger(20);

    let d20 = first;
    let rollFormula = first + ' + ' + saveBonus;

    if (rollMode === 'advantage') {
        d20 = Math.max(first, second);
        rollFormula = '{' + first + ',' + second + '}kh1 + ' + saveBonus;
    }

    if (rollMode === 'disadvantage') {
        d20 = Math.min(first, second);
        rollFormula = '{' + first + ',' + second + '}kl1 + ' + saveBonus;
    }

    const auraBonus = getAeSaveBonusModifier(token, saveKey);
    const total = d20 + saveBonus + auraBonus;
    const failed = total < dc;
    const effectText = failed ? failureText : successText;

    const result = {
        tokenId: token.id,
        targetName: token.get('name'),
        display: title,
        save: saveName,
        failed: failed,
        damageTaken: 0,
        effect: effectText
    };

    sendChat(
        'SaveEffects',
        '/w gm &{template:default} ' +
        '{{name=' + title + '}} ' +
        '{{Target=' + token.get('name') + '}} ' +
        '{{' + saveName + ' Save=[[' + rollFormula + (auraBonus ? ' + ' + auraBonus : '') + ']]}} ' +
        '{{DC=' + dc + '}} ' +
        '{{Result=' + (failed ? 'Failure' : 'Success') + '}} ' +
        '{{Effect=' + effectText + '}}'
    );

    publicSaveResultCard(result);
    runSaveHooks(result, hooks, sourceTokenId);

    if (!getOptionValue(args, '--source')) {
        clearSavedSourceToken(msg);
    }
}

async function handleSkillCheck(args) {
    const tokenId = args[2];
    const skillKey = cleanSkillKey(args[3]);
    const dc = Number(args[4]);
    const removeCondition = getOptionValue(args, '--remove');
    const spendAction = args.includes('--action');
    const title = cleanCheckTitle(getOptionValue(args, '--title'));

    const token = getObj('graphic', tokenId);

    if (!token) {
        sendChat('SaveEffects', '/w gm Invalid target token.');
        return;
    }

    if (!SKILL_NAMES[skillKey]) {
        sendChat('SaveEffects', '/w gm Invalid skill key.');
        return;
    }

    if (isNaN(dc)) {
        sendChat('SaveEffects', '/w gm Format: !se skill TOKEN_ID SKILL DC --remove CONDITION --action --title TITLE');
        return;
    }

    const skillBonus = await getSkillBonus(token, skillKey);

    if (skillBonus === null) {
        sendChat('SaveEffects', '/w gm Could not find ' + SKILL_NAMES[skillKey] + ' bonus for ' + token.get('name') + '.');
        return;
    }

    if (spendAction) {
        spendAeAction(token);
    }

    const roll = randomInteger(20);
    const total = roll + skillBonus;
    const success = total >= dc;
    let effectText = success ? 'Success.' : 'Failure.';

    if (success && removeCondition) {
        sendChat('SaveEffects', '!ae-con remove ' + removeCondition + ' ' + token.id);
        effectText = removeCondition + ' ends.';
    }

    if (!success && removeCondition) {
        effectText = removeCondition + ' remains.';
    }

    sendChat(
        'SaveEffects',
        '&{template:default} ' +
        '{{name=' + title + '}} ' +
        '{{Target=' + token.get('name') + '}} ' +
        '{{Check=' + SKILL_NAMES[skillKey] + '}} ' +
        '{{Roll=[[' + roll + ' + ' + skillBonus + ']]}} ' +
        '{{DC=' + dc + '}} ' +
        '{{Result=' + (success ? 'Success' : 'Failure') + '}} ' +
        '{{Effect=' + effectText + '}}'
    );
}

async function getSaveBonus(token, saveKey) {
    const characterId = token.get('represents');

    if (!characterId) {
        return null;
    }

    const attrName = SAVE_BONUS_ATTRIBUTES[saveKey];

    if (!attrName) {
        return null;
    }

    return await getBeaconSheetValue(characterId, attrName);
}

async function resolveDc(dcInput, sourceTokenId) {
    if (dcInput === 'spell') {
        return await getSpellSaveDc(sourceTokenId);
    }

    const dc = Number(dcInput);

    if (isNaN(dc)) {
        return null;
    }

    return dc;
}

async function getSpellSaveDc(sourceTokenId) {
    if (!sourceTokenId) {
        return null;
    }

    const sourceToken = getObj('graphic', sourceTokenId);

    if (!sourceToken) {
        return null;
    }

    const characterId = sourceToken.get('represents');

    if (!characterId) {
        return null;
    }

    return await getBeaconSheetValue(characterId, 'spell_save_dc');
}

async function getBeaconSheetValue(characterId, attrName) {
    if (!characterId || !attrName) {
        return null;
    }

    if (typeof getSheetItem !== 'function') {
        sendChat('SaveEffects', '/w gm getSheetItem is not available.');
        return null;
    }

    try {
        const rawValue = await getSheetItem(characterId, attrName);
        const value = Number(rawValue);

        if (isNaN(value)) {
            return null;
        }

        return value;
    } catch (e) {
        return null;
    }
}

function getOptionValue(args, optionName) {
    const index = args.indexOf(optionName);

    if (index === -1) {
        return null;
    }

    return args[index + 1] || null;
}

function getSelectedTokens(msg) {
    if (!msg.selected || !msg.selected.length) {
        return [];
    }

    return msg.selected
        .map(function(selected) {
            return getObj('graphic', selected._id);
        })
        .filter(function(token) {
            return token;
        });
}

function getPositionalArgs(args) {
    const firstOptionIndex = args.findIndex(function(arg) {
        return arg && arg.indexOf('--') === 0;
    });

    if (firstOptionIndex === -1) {
        return args;
    }

    return args.slice(0, firstOptionIndex);
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