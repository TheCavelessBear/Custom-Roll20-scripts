/*
 * HandoutAccess
 * Version 1.1
 *
 * GM-only utility for granting and withdrawing player access to existing
 * Roll20 handouts. The script modifies only the handout's inplayerjournals
 * property. It never changes controlledby, notes, GM notes, or archived state.
 *
 * Commands:
 *   !handout reveal --name|HANDOUT NAME --to|all
 *   !handout reveal --id|HANDOUT_ID --to|PLAYER NAME OR ID
 *   !handout hide --name|HANDOUT NAME --from|all
 *   !handout hide --id|HANDOUT_ID --from|PLAYER NAME OR ID
 *   !handout status --name|HANDOUT NAME
 *   !handout menu
 *   !handout menu --filter|hidden/shared/all --page|1
 *   !handout help
 *
 * Reveal supports:
 *   --announce|yes   Default. Sends the player-facing handout link.
 *   --announce|no    Changes access without sending the link.
 *
 * Handout names and player display names must be exact, but matching is
 * case-insensitive. IDs are recommended when names are duplicated.
 */

const HandoutAccess = (() => {
    'use strict';

    const SCRIPT = 'HandoutAccess';
    const VERSION = '1.1';
    const COMMAND = '!handout';
    const MENU_PAGE_SIZE = 8;
    const JOURNAL_URL = 'https://journal.roll20.net/handout/';

    function checkInstall() {
        log('=== ' + SCRIPT + ' v' + VERSION + ' Ready ===');
        log('Commands: !handout menu | !handout reveal | !handout hide | !handout status | !handout help');
    }

    function escapeTemplate(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\|/g, '&#124;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;');
    }

    function escapeLinkLabel(value) {
        return escapeTemplate(value)
            .replace(/\[/g, '&#91;')
            .replace(/\]/g, '&#93;')
            .replace(/\(/g, '&#40;')
            .replace(/\)/g, '&#41;');
    }

    function whisperTarget(player) {
        if (!player) return '';

        return String(player.get('_displayname') || '')
            .replace(/"/g, '')
            .trim();
    }

    function sendGmMessage(message) {
        sendChat(SCRIPT, '/w gm ' + message);
    }

    function sendGmCard(title, fields) {
        const body = fields.map(function(field) {
            return '{{' + escapeTemplate(field.label) + '=' + field.value + '}}';
        }).join(' ');

        sendGmMessage(
            '&{template:default} {{name=' + escapeTemplate(title) + '}} ' + body
        );
    }

    function sendError(message) {
        sendGmCard('Handout Access Error', [
            {
                label: 'Error',
                value: escapeTemplate(message)
            }
        ]);
    }

    function splitPermissionList(value) {
        const seen = {};

        return String(value || '')
            .split(',')
            .map(function(entry) {
                return entry.trim();
            })
            .filter(function(entry) {
                if (!entry || seen[entry]) return false;
                seen[entry] = true;
                return true;
            });
    }

    function setPermissionList(handout, entries) {
        handout.set('inplayerjournals', entries.join(','));
    }

    function parseCommand(content) {
        const remainder = String(content || '')
            .replace(/^!handout\b/i, '')
            .trim();
        const parts = remainder ? remainder.split(/\s+--/) : [];
        const actionPart = (parts.shift() || 'menu').trim();
        const actionTokens = actionPart.split(/\s+/);
        const action = String(actionTokens.shift() || 'menu').toLowerCase();
        const options = {};

        parts.forEach(function(part) {
            const separator = part.indexOf('|');
            let key;
            let value;

            if (separator === -1) {
                key = part.trim().toLowerCase();
                value = '';
            } else {
                key = part.slice(0, separator).trim().toLowerCase();
                value = part.slice(separator + 1).trim();
            }

            if (key) {
                options[key] = value;
            }
        });

        return {
            action: action,
            options: options
        };
    }

    function allHandouts() {
        return findObjs({
            _type: 'handout'
        }).slice().sort(function(a, b) {
            return String(a.get('name') || '').localeCompare(
                String(b.get('name') || ''),
                undefined,
                { sensitivity: 'base' }
            );
        });
    }

    function resolveHandout(options) {
        const explicitId = String(options.id || '').trim();
        const flexibleReference = String(options.handout || '').trim();
        const requestedName = String(options.name || '').trim();
        let handout;
        let name;
        let matches;

        if (explicitId) {
            handout = getObj('handout', explicitId);

            if (!handout) {
                return {
                    ok: false,
                    error: 'No handout was found with ID ' + explicitId + '.'
                };
            }

            return {
                ok: true,
                handout: handout
            };
        }

        if (flexibleReference) {
            handout = getObj('handout', flexibleReference);

            if (handout) {
                return {
                    ok: true,
                    handout: handout
                };
            }
        }

        name = requestedName || flexibleReference;

        if (!name) {
            return {
                ok: false,
                error: 'Specify the handout with --name|HANDOUT NAME or --id|HANDOUT_ID.'
            };
        }

        matches = allHandouts().filter(function(candidate) {
            return String(candidate.get('name') || '').toLowerCase() === name.toLowerCase();
        });

        if (!matches.length) {
            return {
                ok: false,
                error: 'No handout was found with the exact name "' + name + '".'
            };
        }

        if (matches.length > 1) {
            return {
                ok: false,
                error: 'More than one handout is named "' + name +
                    '". Use --id with one of these IDs: ' +
                    matches.map(function(candidate) {
                        return candidate.id;
                    }).join(', ') + '.'
            };
        }

        return {
            ok: true,
            handout: matches[0]
        };
    }

    function resolveRecipient(reference) {
        const requested = String(reference || 'all').trim();
        const normalized = requested.toLowerCase();
        const players = findObjs({
            _type: 'player'
        });
        let matches;

        if (normalized === 'all' || normalized === 'everyone' || normalized === 'all players') {
            return {
                ok: true,
                type: 'all',
                id: 'all',
                name: 'All Players'
            };
        }

        matches = players.filter(function(player) {
            return player.id === requested || player.get('_id') === requested;
        });

        if (!matches.length) {
            matches = players.filter(function(player) {
                return String(player.get('_displayname') || '').toLowerCase() === normalized;
            });
        }

        if (!matches.length) {
            return {
                ok: false,
                error: 'No player was found with the exact display name or ID "' + requested + '".'
            };
        }

        if (matches.length > 1) {
            return {
                ok: false,
                error: 'More than one player has the display name "' + requested +
                    '". Use the player ID instead.'
            };
        }

        if (playerIsGM(matches[0].id)) {
            return {
                ok: false,
                error: matches[0].get('_displayname') + ' is a GM and already has access to all handouts.'
            };
        }

        return {
            ok: true,
            type: 'player',
            id: matches[0].id,
            name: matches[0].get('_displayname'),
            player: matches[0]
        };
    }

    function isAffirmative(value, defaultValue) {
        const normalized = String(value === undefined ? defaultValue : value)
            .trim()
            .toLowerCase();

        return ![
            'no',
            'n',
            'false',
            'off',
            '0'
        ].includes(normalized);
    }

    function handoutLink(handout, label) {
        return '[' + escapeLinkLabel(label || handout.get('name')) + '](' +
            JOURNAL_URL + handout.id + ')';
    }

    function sendPlayerLink(handout, recipient) {
        const card =
            '&{template:default} ' +
            '{{name=Handout Available}} ' +
            '{{description=' + handoutLink(handout, 'Open ' + handout.get('name')) + '}}';

        if (recipient.type === 'all') {
            sendChat(SCRIPT, card);
            return;
        }

        sendChat(
            SCRIPT,
            '/w "' + whisperTarget(recipient.player) + '" ' + card
        );
    }

    function revealHandoutByObject(handout, recipient, announce) {
        const permissions = splitPermissionList(handout.get('inplayerjournals'));
        const alreadyGranted = permissions.includes(recipient.id);

        if (!alreadyGranted) {
            permissions.push(recipient.id);
            setPermissionList(handout, permissions);
        }

        if (announce) {
            sendPlayerLink(handout, recipient);
        }

        return {
            ok: true,
            changed: !alreadyGranted,
            announced: announce,
            handout: handout,
            recipient: recipient
        };
    }

    function revealHandout(options) {
        const handoutResult = resolveHandout(options);
        const recipientResult = resolveRecipient(options.to || 'all');
        const announce = isAffirmative(options.announce, 'yes');
        let result;

        if (!handoutResult.ok) {
            sendError(handoutResult.error);
            return;
        }

        if (!recipientResult.ok) {
            sendError(recipientResult.error);
            return;
        }

        result = revealHandoutByObject(
            handoutResult.handout,
            recipientResult,
            announce
        );

        sendGmCard('Handout Access Updated', [
            {
                label: 'Handout',
                value: handoutLink(result.handout)
            },
            {
                label: 'Visible To',
                value: escapeTemplate(result.recipient.name)
            },
            {
                label: 'Access',
                value: result.changed ? 'Granted' : 'Already granted'
            },
            {
                label: 'Link',
                value: result.announced ? 'Sent' : 'Not sent'
            },
            {
                label: 'Editing Rights',
                value: 'Unchanged'
            },
            ...(result.handout.get('archived') ? [{
                label: 'Warning',
                value: 'This handout is archived. Its access changed, but it may remain hidden in the Journal until unarchived.'
            }] : [])
        ]);
    }

    function hideHandoutByObject(handout, recipient) {
        const permissions = splitPermissionList(handout.get('inplayerjournals'));

        if (recipient.type === 'player' && permissions.includes('all')) {
            return {
                ok: false,
                changed: false,
                error: 'This handout is visible to All Players. Roll20 cannot exclude only ' +
                    recipient.name + ' while "all" access remains. Remove All Players access first.'
            };
        }

        if (!permissions.includes(recipient.id)) {
            return {
                ok: true,
                changed: false,
                handout: handout,
                recipient: recipient
            };
        }

        setPermissionList(
            handout,
            permissions.filter(function(entry) {
                return entry !== recipient.id;
            })
        );

        return {
            ok: true,
            changed: true,
            handout: handout,
            recipient: recipient
        };
    }

    function hideHandout(options) {
        const handoutResult = resolveHandout(options);
        const recipientResult = resolveRecipient(options.from || options.to || 'all');
        let result;

        if (!handoutResult.ok) {
            sendError(handoutResult.error);
            return;
        }

        if (!recipientResult.ok) {
            sendError(recipientResult.error);
            return;
        }

        result = hideHandoutByObject(
            handoutResult.handout,
            recipientResult
        );

        if (!result.ok) {
            sendError(result.error);
            return;
        }

        sendGmCard('Handout Access Updated', [
            {
                label: 'Handout',
                value: handoutLink(result.handout)
            },
            {
                label: 'Withdrawn From',
                value: escapeTemplate(result.recipient.name)
            },
            {
                label: 'Access',
                value: result.changed ? 'Withdrawn' : 'Was not granted'
            },
            {
                label: 'Other View Permissions',
                value: 'Preserved'
            },
            {
                label: 'Editing Rights',
                value: 'Unchanged'
            }
        ]);
    }

    function playerNameForId(playerId) {
        const player = getObj('player', playerId);

        return player ?
            player.get('_displayname') :
            'Unknown Player (' + playerId + ')';
    }

    function permissionDescription(handout) {
        const permissions = splitPermissionList(handout.get('inplayerjournals'));
        const individualIds = permissions.filter(function(entry) {
            return entry !== 'all';
        });
        const individualNames = individualIds.map(playerNameForId);

        if (!permissions.length) {
            return 'GM Only';
        }

        if (permissions.includes('all')) {
            return individualNames.length ?
                'All Players; preserved individual access: ' + individualNames.join(', ') :
                'All Players';
        }

        return individualNames.join(', ');
    }

    function showStatus(options) {
        const handoutResult = resolveHandout(options);
        const handout = handoutResult.handout;

        if (!handoutResult.ok) {
            sendError(handoutResult.error);
            return;
        }

        sendGmCard('Handout Access Status', [
            {
                label: 'Handout',
                value: handoutLink(handout)
            },
            {
                label: 'View Access',
                value: escapeTemplate(permissionDescription(handout))
            },
            {
                label: 'Archived',
                value: handout.get('archived') ? 'Yes' : 'No'
            },
            {
                label: 'Editing Rights',
                value: 'Unchanged by this script'
            },
            {
                label: 'Handout ID',
                value: escapeTemplate(handout.id)
            }
        ]);
    }

    function handoutMenuEntry(handout) {
        const permissions = splitPermissionList(handout.get('inplayerjournals'));
        const name = handout.get('name') || 'Unnamed Handout';
        const openButton = handoutLink(handout, 'Open');
        let accessButton;

        if (permissions.includes('all')) {
            accessButton = '[Hide from All](!handout hide --id|' + handout.id + ' --from|all)';
        } else {
            accessButton = '[Reveal to All](!handout reveal --id|' + handout.id + ' --to|all)';
        }

        return (
            '<b>' + escapeTemplate(name) + '</b>' +
            '<br>Visible To: ' + escapeTemplate(permissionDescription(handout)) +
            '<br>' + openButton + ' ' + accessButton +
            ' [Status](!handout status --id|' + handout.id + ')'
        );
    }

    function showMenu(options) {
        const requestedFilter = String(options.filter || 'hidden').toLowerCase();
        const filter = ['hidden', 'shared', 'all'].includes(requestedFilter) ?
            requestedFilter :
            'hidden';
        const requestedPage = Math.max(1, parseInt(options.page, 10) || 1);
        const eligible = allHandouts()
            .filter(function(handout) {
                return !handout.get('archived');
            })
            .filter(function(handout) {
                const isShared = splitPermissionList(
                    handout.get('inplayerjournals')
                ).length > 0;

                if (filter === 'hidden') return !isShared;
                if (filter === 'shared') return isShared;
                return true;
            });
        const totalPages = Math.max(1, Math.ceil(eligible.length / MENU_PAGE_SIZE));
        const page = Math.min(requestedPage, totalPages);
        const start = (page - 1) * MENU_PAGE_SIZE;
        const pageHandouts = eligible.slice(start, start + MENU_PAGE_SIZE);
        const fields = [];
        const filterLabel = filter.charAt(0).toUpperCase() + filter.slice(1);
        let navigation = '';

        if (!pageHandouts.length) {
            fields.push({
                label: filterLabel + ' Handouts',
                value: 'None'
            });
        } else {
            pageHandouts.forEach(function(handout, index) {
                fields.push({
                    label: String(start + index + 1),
                    value: handoutMenuEntry(handout)
                });
            });
        }

        if (page > 1) {
            navigation += '[Previous](!handout menu --filter|' + filter +
                ' --page|' + (page - 1) + ') ';
        }

        if (page < totalPages) {
            navigation += '[Next](!handout menu --filter|' + filter +
                ' --page|' + (page + 1) + ')';
        }

        fields.push({
            label: 'Page',
            value: page + ' of ' + totalPages +
                (navigation ? '<br>' + navigation.trim() : '')
        });
        fields.push({
            label: 'Views',
            value:
                '[Hidden](!handout menu --filter|hidden) ' +
                '[Shared](!handout menu --filter|shared) ' +
                '[All](!handout menu --filter|all)'
        });

        sendGmCard('Handout Access - ' + filterLabel, fields);
    }

    function showHelp() {
        sendGmCard('HandoutAccess Commands', [
            {
                label: 'Reveal to Everyone',
                value: '!handout reveal --name|HANDOUT NAME --to|all'
            },
            {
                label: 'Reveal to One Player',
                value: '!handout reveal --name|HANDOUT NAME --to|PLAYER NAME OR ID'
            },
            {
                label: 'Reveal Without Sending Link',
                value: '!handout reveal --name|HANDOUT NAME --to|all --announce|no'
            },
            {
                label: 'Withdraw Everyone Access',
                value: '!handout hide --name|HANDOUT NAME --from|all'
            },
            {
                label: 'Withdraw One Player',
                value: '!handout hide --name|HANDOUT NAME --from|PLAYER NAME OR ID'
            },
            {
                label: 'Review One Handout',
                value: '!handout status --name|HANDOUT NAME'
            },
            {
                label: 'Browse Handouts',
                value: '!handout menu<br>!handout menu --filter|shared<br>!handout menu --filter|all'
            },
            {
                label: 'Name Matching',
                value: 'Handout and player names are exact but case-insensitive. Use IDs if names are duplicated.'
            },
            {
                label: 'Permission Safety',
                value: 'Only view access is changed. Editing rights are never changed.'
            }
        ]);
    }

    function handleInput(msg) {
        const command = parseCommand(msg.content);

        if (msg.type !== 'api' || !/^!handout(?:\s|$)/i.test(msg.content)) {
            return;
        }

        if (!playerIsGM(msg.playerid)) {
            const player = getObj('player', msg.playerid);

            if (player) {
                sendChat(
                    SCRIPT,
                    '/w "' + whisperTarget(player) + '" This command is GM-only.'
                );
            } else {
                sendGmMessage(
                    'Blocked a non-GM or API-generated HandoutAccess command.'
                );
            }

            return;
        }

        switch (command.action) {
            case 'reveal':
            case 'show':
                revealHandout(command.options);
                break;

            case 'hide':
            case 'withdraw':
                hideHandout(command.options);
                break;

            case 'status':
                showStatus(command.options);
                break;

            case 'menu':
            case 'list':
                showMenu(command.options);
                break;

            case 'help':
                showHelp();
                break;

            default:
                sendError(
                    'Unknown command "' + command.action +
                    '". Use !handout help for the command list.'
                );
                break;
        }
    }

    function revealById(handoutId, recipientReference, options) {
        const handout = getObj('handout', handoutId);
        const recipient = resolveRecipient(recipientReference || 'all');
        const settings = options || {};

        if (!handout) {
            return {
                ok: false,
                changed: false,
                error: 'Handout not found.'
            };
        }

        if (!recipient.ok) {
            return {
                ok: false,
                changed: false,
                error: recipient.error
            };
        }

        return revealHandoutByObject(
            handout,
            recipient,
            settings.announce === true
        );
    }

    function revealByReference(handoutReference, recipientReference, options) {
        const handoutResult = resolveHandout({
            handout: handoutReference
        });
        const recipient = resolveRecipient(recipientReference || 'all');
        const settings = options || {};

        if (!handoutResult.ok) {
            return {
                ok: false,
                changed: false,
                error: handoutResult.error
            };
        }

        if (!recipient.ok) {
            return {
                ok: false,
                changed: false,
                error: recipient.error
            };
        }

        return revealHandoutByObject(
            handoutResult.handout,
            recipient,
            settings.announce === true
        );
    }

    function hideById(handoutId, recipientReference) {
        const handout = getObj('handout', handoutId);
        const recipient = resolveRecipient(recipientReference || 'all');

        if (!handout) {
            return {
                ok: false,
                changed: false,
                error: 'Handout not found.'
            };
        }

        if (!recipient.ok) {
            return {
                ok: false,
                changed: false,
                error: recipient.error
            };
        }

        return hideHandoutByObject(handout, recipient);
    }

    on('ready', checkInstall);
    on('chat:message', handleInput);

    return {
        version: VERSION,
        reveal: revealById,
        hide: hideById,
        revealByReference: revealByReference
    };
})();
