// Token Action Builder
// Roll20 D&D 2024 Beacon + AE/ADR/SE token action generator
// Command: !tab

var TokenActionBuilder = TokenActionBuilder || (() => {
    'use strict';

    const SCRIPT = 'Token Action Builder';
    const VERSION = '0.5.0';

    const ABILITY_DATA = {
        str: {
            label: 'Strength',
            modAttr: 'strength_mod'
        },
        dex: {
            label: 'Dexterity',
            modAttr: 'dexterity_mod'
        },
        con: {
            label: 'Constitution',
            modAttr: 'constitution_mod'
        },
        int: {
            label: 'Intelligence',
            modAttr: 'intelligence_mod'
        },
        wis: {
            label: 'Wisdom',
            modAttr: 'wisdom_mod'
        },
        cha: {
            label: 'Charisma',
            modAttr: 'charisma_mod'
        }
    };

    const NAMED_SE = {
        trip: {
            display: 'Trip',
            effect: 'Target makes a Dexterity save or falls Prone.',
            sourceRequired: false
        },
        topple: {
            display: 'Topple',
            effect: 'Target makes a Constitution save or falls Prone.',
            sourceRequired: false
        },
        poison: {
            display: 'Poison',
            effect: 'Target makes a Constitution save or gains the Poisoned condition.',
            sourceRequired: false
        },
        grapple: {
            display: 'Grapple',
            effect: 'Target makes a Strength save or gains the Grappled condition.',
            sourceRequired: false
        },
        gutshot: {
            display: 'Gutshot',
            effect: 'Target makes a Constitution save or becomes Paralyzed until the end of the source creature’s next turn.',
            sourceRequired: true
        },
        holdperson: {
            display: 'Hold Person',
            effect: 'Target makes a Wisdom save or becomes Paralyzed while Concentration lasts.',
            sourceRequired: true
        },
        lifedrain: {
            display: 'Life Drain',
            effect: 'Target makes a Constitution save or suffers Life Drain.',
            sourceRequired: false
        }
    };

    const ATTACK_BUTTON_STYLE = '" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)';

    const ATTACK_FX_COMMANDS = {
        melee: '!adr missile Melee',
        arrow: '!adr missile Arrow',
        throw: '!adr missile Throw'
    };

    const STANDARD_DAMAGE_COMMANDS = [
        '!adr fx pooling-blood',
        '!adr fx slashx1',
        '!adr fx slashx2',
        '!splay Blood Splatter'
    ];

    const CONDITION_QUERY =
        '?{Condition|' +
        'Blinded,blinded|' +
        'Charmed,charmed|' +
        'Deafened,deafened|' +
        'Exhaustion,exhaustion|' +
        'Frightened,frightened|' +
        'Grappled,grappled|' +
        'Incapacitated,incapacitated|' +
        'Invisible,invisible|' +
        'Paralyzed,paralyzed|' +
        'Petrified,petrified|' +
        'Poisoned,poisoned|' +
        'Prone,prone|' +
        'Restrained,restrained|' +
        'Stunned,stunned|' +
        'Unconscious,unconscious|' +
        'Stinking Cloud Poisoned,stinkingpoisoned' +
        '}';

    on('ready', function() {
        log('=== ' + SCRIPT + ' v' + VERSION + ' Ready. Use !tab menu ===');
    });

    on('chat:message', function(msg) {
        if (msg.type !== 'api') return;
        if (!msg.content.match(/^!tab(\s|$)/)) return;

        handleInput(msg);
    });

    async function handleInput(msg) {
        const args = tokenize(msg.content);
        const command = String(args[1] || 'menu').toLowerCase();

        if (command === 'menu' || command === 'help') {
            showMainMenu(msg);
            return;
        }

        if (command === 'attack') {
            await showAttackMenu(msg);
            return;
        }

        if (command === 'se') {
            await showSeMenu(msg);
            return;
        }

        if (command === 'buildattack') {
            await buildAttackSuite(msg, parseOptions(args.slice(2)));
            return;
        }

        if (command === 'buildsenamed') {
            await buildNamedSaveEffect(msg, parseOptions(args.slice(2)));
            return;
        }

        if (command === 'buildsecondition') {
            await buildConditionSaveEffect(msg, parseOptions(args.slice(2)));
            return;
        }

        if (command === 'buildsedamage') {
            await buildDamageSaveEffect(msg, parseOptions(args.slice(2)));
            return;
        }

        if (command === 'buildsedamagecondition') {
            await buildDamageConditionSaveEffect(msg, parseOptions(args.slice(2)));
            return;
        }

        showMainMenu(msg);
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

    function parseOptions(parts) {
        const opts = {};

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            if (String(part).indexOf('--') !== 0) continue;

            const key = String(part).slice(2).toLowerCase();
            const next = parts[i + 1];

            if (!next || String(next).indexOf('--') === 0) {
                opts[key] = true;
                continue;
            }

            opts[key] = next;
            i++;
        }

        return opts;
    }

    function getPlayerName(msg) {
        const player = getObj('player', msg.playerid);

        if (!player) return 'gm';

        return '"' + player.get('displayname') + '"';
    }

    function whisper(msg, title, body) {
        sendChat(
            SCRIPT,
            '/w ' + getPlayerName(msg) + ' &{template:default} {{name=' + title + '}} {{=' + body + '}}',
            null,
            { noarchive: true }
        );
    }

    function button(label, command) {
        return '[' + label + '](' + command + ')';
    }

    function styledAbilityButton(label, abilityName) {
        return '[' + label + '](~selected|' + abilityName + ATTACK_BUTTON_STYLE;
    }

    function showMainMenu(msg) {
        const body = [
            button('Attack Suite', '!tab attack'),
            button('SaveEffects Suite', '!tab se')
        ].join(' ');

        whisper(msg, 'Token Action Builder', body);
    }

    async function showAttackMenu(msg) {
        const token = getSelectedToken(msg);
        const character = getCharacterFromToken(token);

        if (!token || !character) {
            whisper(msg, 'Token Action Builder Error', 'Select a token that represents a character.');
            return;
        }

        await createBuilderAbility(
            character.id,
            'TAB-Build-Attack',
            buildAttackBuilderMacro(false)
        );

        await createBuilderAbility(
            character.id,
            'TAB-Build-Attack-Secondary',
            buildAttackBuilderMacro(true)
        );

        const body = [
            '[Create Attack Suite](~selected|TAB-Build-Attack)',
            '[Create Attack Suite + Secondary Damage](~selected|TAB-Build-Attack-Secondary)'
        ].join(' ');

        whisper(msg, 'Build Attack Suite', body);
    }

    function buildAttackBuilderMacro(hasSecondDamage) {
        const lines = [
            '!tab buildattack',
            '--token @{selected|token_id}',
            '--name "?{Attack Name|Slam}"',
            '--ability ?{Attack Ability|Strength,str|Dexterity,dex|Constitution,con|Intelligence,int|Wisdom,wis|Charisma,cha}',
            '--atkability ?{Add Attack Ability Modifier?|Yes,yes|No,no}',
            '--prof ?{Add Proficiency?|Yes,yes|No,no}',
            '--atkbonus "?{Other Attack Bonus|0}"',
            '--damage1 "?{Primary Damage Dice|2d8}"',
            '--type1 "?{Primary Damage Type|Bludgeoning|Piercing|Slashing|Acid|Cold|Fire|Force|Lightning|Necrotic|Poison|Psychic|Radiant|Thunder}"',
            '--mod1 ?{Add Ability Mod to Primary Damage?|Yes,yes|No,no}',
            '--dmgbonus "?{Additional Damage Bonus Not Doubled on Crit|0}"',
            '--second ' + (hasSecondDamage ? 'yes' : 'no')
        ];

        if (hasSecondDamage) {
            lines.push('--damage2 "?{Second Damage Dice|1d8}"');
            lines.push('--type2 "?{Second Damage Type|Necrotic|Acid|Bludgeoning|Cold|Fire|Force|Lightning|Piercing|Poison|Psychic|Radiant|Slashing|Thunder}"');
            lines.push('--mod2 ?{Add Ability Mod to Second Damage?|No,no|Yes,yes}');
        }

        lines.push('--economy "?{Economy Cost|Attack,!ae attack|Action,!ae action|Bonus Action,!ae bonus|Spell,!ae spell|None,none}"');
        lines.push('--melee ?{Melee Attack?|Yes,yes|No,no}');
        lines.push('--magic ?{Magical Damage?|No,no|Yes,yes}');
        lines.push('--attackfx ?{Attack FX|None,none|Melee,melee|Arrow,arrow|Throw,throw}');
        lines.push('--attacksound "?{Attack Sound|None}"');
        lines.push('--damagecombo ?{Standard Damage FX and Sound?|Yes,yes|No,no}');

        return lines.join(' ');
    }

    async function showSeMenu(msg) {
        const token = getSelectedToken(msg);
        const character = getCharacterFromToken(token);

        if (!token || !character) {
            whisper(msg, 'Token Action Builder Error', 'Select a token that represents a character.');
            return;
        }

        await createBuilderAbility(
            character.id,
            'TAB-Build-SE-Named',
            buildNamedSaveBuilderMacro()
        );

        await createBuilderAbility(
            character.id,
            'TAB-Build-SE-Condition',
            buildConditionSaveBuilderMacro()
        );

        await createBuilderAbility(
            character.id,
            'TAB-Build-SE-Damage',
            buildDamageSaveBuilderMacro()
        );

        await createBuilderAbility(
            character.id,
            'TAB-Build-SE-Damage-Condition',
            buildDamageConditionSaveBuilderMacro()
        );

        const body = [
            '[Named SaveEffect](~selected|TAB-Build-SE-Named)',
            '[Condition Save](~selected|TAB-Build-SE-Condition)',
            '[Damage Save](~selected|TAB-Build-SE-Damage)',
            '[Damage + Condition](~selected|TAB-Build-SE-Damage-Condition)'
        ].join(' ');

        whisper(msg, 'Build SaveEffects Token Action', body);
    }

    function buildNamedSaveBuilderMacro() {
        return [
            '!tab buildsenamed',
            '--token @{selected|token_id}',
            '--name "?{Macro Name|Topple}"',
            '--key ?{Named SaveEffect|Trip,trip|Topple,topple|Poison,poison|Grapple,grapple|Gutshot,gutshot|Hold Person,holdperson|Life Drain,lifedrain}',
            '--dc "?{DC|15}"',
            '--source ?{Use Selected as Source?|No,no|Yes,yes}',
            '--economy "?{Economy Cost|None,none|Attack,!ae attack|Action,!ae action|Bonus Action,!ae bonus|Spell,!ae spell}"'
        ].join(' ');
    }

    function buildConditionSaveBuilderMacro() {
        return [
            '!tab buildsecondition',
            '--token @{selected|token_id}',
            '--name "?{Macro Name|Condition Save}"',
            '--condition "' + CONDITION_QUERY + '"',
            '--save ?{Save|Strength,str|Dexterity,dex|Constitution,con|Intelligence,int|Wisdom,wis|Charisma,cha}',
            '--dc "?{DC|15}"',
            '--duration ?{Duration|manual|combat|casterNextTurn|targetNextTurn|concentration}',
            '--source ?{Use Selected as Source?|No,no|Yes,yes}',
            '--economy "?{Economy Cost|None,none|Attack,!ae attack|Action,!ae action|Bonus Action,!ae bonus|Spell,!ae spell}"'
        ].join(' ');
    }

    function buildDamageSaveBuilderMacro() {
        return [
            '!tab buildsedamage',
            '--token @{selected|token_id}',
            '--name "?{Macro Name|Damage Save}"',
            '--save ?{Save|Strength,str|Dexterity,dex|Constitution,con|Intelligence,int|Wisdom,wis|Charisma,cha}',
            '--dc "?{DC|15}"',
            '--damage "?{Damage Dice|3d6}"',
            '--type "?{Damage Type|Fire|Acid|Bludgeoning|Cold|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder}"',
            '--success ?{Success Result|Half Damage,half|No Damage,none}',
            '--source ?{Use Selected as Source?|No,no|Yes,yes}',
            '--economy "?{Economy Cost|None,none|Attack,!ae attack|Action,!ae action|Bonus Action,!ae bonus|Spell,!ae spell}"'
        ].join(' ');
    }

    function buildDamageConditionSaveBuilderMacro() {
        return [
            '!tab buildsedamagecondition',
            '--token @{selected|token_id}',
            '--name "?{Macro Name|Damage Condition Save}"',
            '--condition "' + CONDITION_QUERY + '"',
            '--save ?{Save|Strength,str|Dexterity,dex|Constitution,con|Intelligence,int|Wisdom,wis|Charisma,cha}',
            '--dc "?{DC|15}"',
            '--damage "?{Damage Dice|2d8}"',
            '--type "?{Damage Type|Lightning|Acid|Bludgeoning|Cold|Fire|Force|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder}"',
            '--success ?{Success Result|Half Damage,half|No Damage,none}',
            '--duration ?{Duration|manual|combat|casterNextTurn|targetNextTurn|concentration}',
            '--source ?{Use Selected as Source?|No,no|Yes,yes}',
            '--economy "?{Economy Cost|None,none|Attack,!ae attack|Action,!ae action|Bonus Action,!ae bonus|Spell,!ae spell}"'
        ].join(' ');
    }

    function getSelectedToken(msg) {
        if (!msg.selected || !msg.selected.length) return null;

        const selected = msg.selected[0];

        if (!selected || selected._type !== 'graphic') return null;

        const token = getObj('graphic', selected._id);

        if (!token || token.get('subtype') !== 'token') return null;

        return token;
    }

    function getTokenFromOptions(msg, opts) {
        if (opts.token) {
            const token = getObj('graphic', opts.token);

            if (token && token.get('subtype') === 'token') {
                return token;
            }
        }

        return getSelectedToken(msg);
    }

    function getCharacterFromToken(token) {
        if (!token) return null;

        const characterId = token.get('represents');

        if (!characterId) return null;

        return getObj('character', characterId);
    }

    async function createBuilderAbility(characterId, actionName, macro) {
        if (!characterId || !actionName || !macro) return;

        const existing = findObjs({
            _type: 'ability',
            characterid: characterId,
            name: actionName
        })[0];

        if (existing) {
            existing.set({
                action: macro,
                istokenaction: false
            });
            return;
        }

        createObj('ability', {
            characterid: characterId,
            name: actionName,
            action: macro,
            istokenaction: false
        });
    }

    async function createTokenAction(characterId, actionName, macro, showAsTokenAction) {
        if (!characterId || !actionName || !macro) return;

        const existing = findObjs({
            _type: 'ability',
            characterid: characterId,
            name: actionName
        })[0];

        if (existing) {
            existing.set({
                action: macro,
                istokenaction: showAsTokenAction !== false
            });
            return;
        }

        createObj('ability', {
            characterid: characterId,
            name: actionName,
            action: macro,
            istokenaction: showAsTokenAction !== false
        });
    }

    function cleanActionName(value) {
        return String(value || 'Action')
            .replace(/[^\w\s\-’']/g, '')
            .replace(/\s+/g, '-')
            .replace(/\-+/g, '-')
            .replace(/^\-|\-$/g, '') || 'Action';
    }

    function cleanDisplayName(value) {
        return String(value || 'Action')
            .replace(/_/g, ' ')
            .trim() || 'Action';
    }

    function isYes(value) {
        const clean = String(value || '').toLowerCase().trim();

        return clean === 'yes' || clean === 'true' || clean === '1' || clean === 'on';
    }

    function shouldAddAttackAbility(value) {
        const clean = String(value || '').toLowerCase().trim();

        return clean !== 'no' && clean !== 'false' && clean !== '0' && clean !== 'off';
    }

    function normalizeEconomy(value) {
        const clean = String(value || '').trim();

        if (!clean || clean === 'none') return '';

        if (clean === '!ae attack') return '!ae attack';
        if (clean === '!ae action') return '!ae action';
        if (clean === '!ae bonus') return '!ae bonus';
        if (clean === '!ae spell') return '!ae spell';

        if (clean === 'attack') return '!ae attack';
        if (clean === 'action') return '!ae action';
        if (clean === 'bonus') return '!ae bonus';
        if (clean === 'spell') return '!ae spell';

        return '';
    }

    function abilityModReference(abilityKey) {
        const ability = ABILITY_DATA[String(abilityKey || '').toLowerCase()];

        if (!ability) {
            return '@{selected|strength_mod}';
        }

        return '@{selected|' + ability.modAttr + '}';
    }

    function attackBonusFormula(opts) {
        const parts = [];

        if (shouldAddAttackAbility(opts.atkability)) {
            parts.push(abilityModReference(opts.ability || 'str'));
        }

        if (isYes(opts.prof)) {
            parts.push('@{selected|pb}');
        }

        if (opts.atkbonus && opts.atkbonus !== '0') {
            parts.push(opts.atkbonus);
        }

        return parts.length ? parts.join(' + ') : '0';
    }

    function normalizeDamageDice(value) {
        return String(value || '1d8').replace(/\s+/g, '');
    }

    function critDice(value) {
        const dice = normalizeDamageDice(value);

        return dice.replace(/(\d*)d(\d+)/gi, function(match, count, die) {
            const number = count ? parseInt(count, 10) : 1;

            if (isNaN(number)) return match;

            return (number * 2) + 'd' + die;
        });
    }

    function normalizeDamageBonus(value) {
        const clean = String(value || '').trim();

        if (!clean || clean === '0') return '';

        return clean.replace(/^\+\s*/, '');
    }

    function damageFormula(dice, abilityKey, addMod, damageBonus, crit) {
        const parts = [
            crit ? critDice(dice) : normalizeDamageDice(dice)
        ];

        if (isYes(addMod)) {
            parts.push(abilityModReference(abilityKey || 'str'));
        }

        const bonus = normalizeDamageBonus(damageBonus);

        if (bonus) {
            parts.push(bonus);
        }

        return parts.join(' + ');
    }

    function attackFxCommand(value) {
        const key = String(value || '').toLowerCase().trim();

        return ATTACK_FX_COMMANDS[key] || '';
    }

    function soundCommand(value) {
        const soundName = String(value || '').trim();

        if (!soundName || soundName.toLowerCase() === 'none') return '';

        return '!splay ' + soundName;
    }

    function standardDamageCommands(value) {
        if (!isYes(value)) return [];

        return STANDARD_DAMAGE_COMMANDS.slice();
    }

    function adrApplyLine(opts) {
        const tags = [];

        if (isYes(opts.magic)) {
            tags.push('--magic');
        }

        if (isYes(opts.melee)) {
            tags.push('--melee');
        }

        return '!adr apply' + (tags.length ? ' ' + tags.join(' ') : '');
    }

    function rollTypeQuery(bonusFormula) {
        return '?{Roll Type?' +
            '|Normal,{{normal=1&#125;&#125; {{r1=[[1d20 + ' + bonusFormula + ']]&#125;&#125;' +
            '|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20 + ' + bonusFormula + ']]&#125;&#125; {{r2=[[1d20 + ' + bonusFormula + ']]&#125;&#125;' +
            '|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20 + ' + bonusFormula + ']]&#125;&#125; {{r2=[[1d20 + ' + bonusFormula + ']]&#125;&#125;' +
            '}';
    }

    function buildAttackMacro(shownName, damageName, critName, bonusFormula, economyLine, attackFxLine, attackSoundLine) {
        return [
            '!adr attack @{selected|token_id} @{target|' + shownName + '|token_id}',
            attackFxLine,
            '',
            '&{template:atk} ' +
            '{{mod=' + styledAbilityButton('Damage', damageName) + ' ' + styledAbilityButton('Crit Damage', critName) + '}} ' +
            '{{rname=' + shownName + '}} ' +
            '{{charname=@{selected|token_name}}} ' +
            rollTypeQuery(bonusFormula),
            '',
            attackSoundLine,
            economyLine
        ].filter(Boolean).join('\n');
    }

    function buildDamageMacro(shownName, opts, applyLine, crit) {
        const hasSecond = isYes(opts.second);
        const primaryFormula = damageFormula(
            opts.damage1 || '1d8',
            opts.ability || 'str',
            opts.mod1 || 'yes',
            opts.dmgbonus || '0',
            crit
        );
        const secondaryFormula = damageFormula(
            opts.damage2 || '1d6',
            opts.ability || 'str',
            opts.mod2 || 'no',
            '0',
            crit
        );
        const impactCommands = standardDamageCommands(opts.damagecombo);

        return [
            '&{template:dmg} ' +
            '{{rname=' + shownName + (crit ? ' Critical Damage' : '') + '}} ' +
            '{{damage=1}} ' +
            '{{dmg1flag=1}} ' +
            '{{dmg1=[[' + primaryFormula + ']]}} ' +
            '{{dmg1type=' + (opts.type1 || 'Slashing') + '}} ' +
            (hasSecond ? '{{dmg2flag=1}} ' : '') +
            (hasSecond ? '{{dmg2=[[' + secondaryFormula + ']]}} ' : '') +
            (hasSecond ? '{{dmg2type=' + (opts.type2 || 'Poison') + '}} ' : '') +
            '{{charname=@{selected|token_name}}}',
            '',
            applyLine
        ].concat(impactCommands).join('\n');
    }

    async function buildAttackSuite(msg, opts) {
        const token = getTokenFromOptions(msg, opts);
        const character = getCharacterFromToken(token);

        if (!token || !character) {
            whisper(msg, 'Token Action Builder Error', 'Select a token that represents a character.');
            return;
        }

        const rawName = opts.name || 'Attack';
        const baseName = cleanActionName(rawName);
        const shownName = cleanDisplayName(rawName);

        const attackName = baseName;
        const damageName = baseName + '-Damage';
        const critName = baseName + '-Crit-Damage';

        const bonusFormula = attackBonusFormula(opts);
        const economyLine = normalizeEconomy(opts.economy);
        const applyLine = adrApplyLine(opts);
        const attackFxLine = attackFxCommand(opts.attackfx);
        const attackSoundLine = soundCommand(opts.attacksound);

        const attackMacro = buildAttackMacro(
            shownName,
            damageName,
            critName,
            bonusFormula,
            economyLine,
            attackFxLine,
            attackSoundLine
        );

        const normalDamageMacro = buildDamageMacro(
            shownName,
            opts,
            applyLine,
            false
        );

        const critDamageMacro = buildDamageMacro(
            shownName,
            opts,
            applyLine,
            true
        );

        await createTokenAction(character.id, attackName, attackMacro, true);
        await createTokenAction(character.id, damageName, normalDamageMacro, false);
        await createTokenAction(character.id, critName, critDamageMacro, false);

        whisper(
            msg,
            'Attack Suite Created',
            'Created token actions:<br>' + [
                attackName,
                damageName + ' hidden',
                critName + ' hidden'
            ].join('<br>')
        );
    }

    function shouldUseSource(opts, dc, duration, namedData) {
        if (isYes(opts.source)) return true;
        if (String(dc || '').toLowerCase() === 'spell') return true;
        if (String(duration || '').toLowerCase() === 'concentration') return true;
        if (namedData && namedData.sourceRequired) return true;

        return false;
    }

    async function buildNamedSaveEffect(msg, opts) {
        const token = getTokenFromOptions(msg, opts);
        const character = getCharacterFromToken(token);

        if (!token || !character) {
            whisper(msg, 'Token Action Builder Error', 'Select a token that represents a character.');
            return;
        }

        const key = String(opts.key || '').toLowerCase();
        const data = NAMED_SE[key];

        if (!data) {
            whisper(msg, 'SaveEffects Error', 'Invalid named SaveEffect key.');
            return;
        }

        const rawName = opts.name || data.display;
        const actionName = cleanActionName(rawName);
        const shownName = cleanDisplayName(rawName);
        const dc = opts.dc || '15';
        const economyLine = normalizeEconomy(opts.economy);

        let command = '!se ' + key + ' @{target|Target|token_id} ' + dc;

        if (shouldUseSource(opts, dc, null, data)) {
            command += ' --source @{selected|token_id}';
        }

        const macro = [
            '&{template:default} {{name=' + shownName + '}} {{Effect=' + data.effect + '}}',
            '',
            command,
            economyLine
        ].filter(Boolean).join('\n');

        await createTokenAction(character.id, actionName, macro, true);

        whisper(msg, 'SaveEffects Action Created', 'Created ' + actionName + '.');
    }

    async function buildConditionSaveEffect(msg, opts) {
        const token = getTokenFromOptions(msg, opts);
        const character = getCharacterFromToken(token);

        if (!token || !character) {
            whisper(msg, 'Token Action Builder Error', 'Select a token that represents a character.');
            return;
        }

        const rawName = opts.name || 'Condition Save';
        const actionName = cleanActionName(rawName);
        const shownName = cleanDisplayName(rawName);
        const condition = opts.condition || 'prone';
        const save = opts.save || 'dex';
        const dc = opts.dc || '15';
        const duration = opts.duration || 'manual';
        const economyLine = normalizeEconomy(opts.economy);

        let command =
            '!se save ' +
            condition + ' ' +
            save + ' ' +
            '@{target|Target|token_id} ' +
            dc +
            ' --duration ' + duration;

        if (shouldUseSource(opts, dc, duration, null)) {
            command += ' --source @{selected|token_id}';
        }

        const macro = [
            '&{template:default} {{name=' + shownName + '}} {{Effect=Target makes a ' + save.toUpperCase() + ' save or gains ' + condition + '.}}',
            '',
            command,
            economyLine
        ].filter(Boolean).join('\n');

        await createTokenAction(character.id, actionName, macro, true);

        whisper(msg, 'SaveEffects Action Created', 'Created ' + actionName + '.');
    }

    async function buildDamageSaveEffect(msg, opts) {
        const token = getTokenFromOptions(msg, opts);
        const character = getCharacterFromToken(token);

        if (!token || !character) {
            whisper(msg, 'Token Action Builder Error', 'Select a token that represents a character.');
            return;
        }

        const rawName = opts.name || 'Damage Save';
        const actionName = cleanActionName(rawName);
        const shownName = cleanDisplayName(rawName);
        const save = opts.save || 'dex';
        const dc = opts.dc || '15';
        const damage = opts.damage || '3d6';
        const damageType = opts.type || 'Fire';
        const success = opts.success || 'half';
        const economyLine = normalizeEconomy(opts.economy);

        let command =
            '!se damagebatch ' +
            save + ' ' +
            dc + ' ' +
            damage + ' ' +
            damageType + ' ' +
            success + ' ' +
            '@{target|Target|token_id}';

        if (shouldUseSource(opts, dc, null, null)) {
            command += ' --source @{selected|token_id}';
        }

        const macro = [
            '&{template:default} {{name=' + shownName + '}} {{Effect=Target makes a ' + save.toUpperCase() + ' save against ' + damage + ' ' + damageType + ' damage.}}',
            '',
            command,
            economyLine
        ].filter(Boolean).join('\n');

        await createTokenAction(character.id, actionName, macro, true);

        whisper(msg, 'SaveEffects Action Created', 'Created ' + actionName + '.');
    }

    async function buildDamageConditionSaveEffect(msg, opts) {
        const token = getTokenFromOptions(msg, opts);
        const character = getCharacterFromToken(token);

        if (!token || !character) {
            whisper(msg, 'Token Action Builder Error', 'Select a token that represents a character.');
            return;
        }

        const rawName = opts.name || 'Damage Condition Save';
        const actionName = cleanActionName(rawName);
        const shownName = cleanDisplayName(rawName);
        const condition = opts.condition || 'stunned';
        const save = opts.save || 'con';
        const dc = opts.dc || '15';
        const damage = opts.damage || '2d8';
        const damageType = opts.type || 'Lightning';
        const success = opts.success || 'half';
        const duration = opts.duration || 'manual';
        const economyLine = normalizeEconomy(opts.economy);

        let command =
            '!se damagecondition ' +
            condition + ' ' +
            save + ' ' +
            '@{target|Target|token_id} ' +
            dc + ' ' +
            damage + ' ' +
            damageType + ' ' +
            success +
            ' --duration ' + duration;

        if (shouldUseSource(opts, dc, duration, null)) {
            command += ' --source @{selected|token_id}';
        }

        const macro = [
            '&{template:default} {{name=' + shownName + '}} {{Effect=Target makes a ' + save.toUpperCase() + ' save against ' + damage + ' ' + damageType + ' damage and the ' + condition + ' condition.}}',
            '',
            command,
            economyLine
        ].filter(Boolean).join('\n');

        await createTokenAction(character.id, actionName, macro, true);

        whisper(msg, 'SaveEffects Action Created', 'Created ' + actionName + '.');
    }

    return {
        version: VERSION
    };
})();
