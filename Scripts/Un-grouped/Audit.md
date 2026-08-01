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