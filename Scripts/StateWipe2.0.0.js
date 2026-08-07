const PersistentStateManager = (() => {
    'use strict';

    const SCRIPT = 'StateWipe';
    const VERSION = '2.0.0';
    const PROFILES = ['prune', 'combat', 'scene', 'setting', 'campaign', 'all'];
    const STANDARD_CONFIG_IMPACT = {
        prune: 'preserve', combat: 'preserve', scene: 'preserve', setting: 'preserve', campaign: 'preserve', all: 'delete root'
    };
    const INVENTORY = [
        { root: 'GroupInitiative', owner: 'GroupInitiative.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'simpleSound', owner: 'SimpleSound.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'TokenMod', owner: 'TokenMod.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'ScriptCards', owner: 'ScriptCards.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'MathOps', owner: 'MathOps.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'Plugger', owner: 'Plugger.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'libTable', owner: 'libTable.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'Muler', owner: 'Muler.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'SelectManager', owner: 'SelectManager.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'libTokenMarkers', owner: 'libTokenMarkers.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'Messenger', owner: 'Messenger.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'SmartAoE', owner: 'SmartAoE0.31.js', classification: 'mixed', impact: { prune: 'prune stale links', combat: 'prune stale links', scene: 'owner cleanup all links/objects', setting: 'owner cleanup all links/objects', campaign: 'owner cleanup all links/objects', all: 'owner cleanup, then delete root' } },
        { root: 'DoorSounds', owner: 'DoorSounds1.1.0.js', classification: 'framework/config', impact: { prune: 'prune missing doors', combat: 'prune missing doors', scene: 'prune missing doors', setting: 'prune missing doors', campaign: 'prune missing doors', all: 'prune missing doors, then delete root' } },
        { root: 'Fetch', owner: 'Fetch.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'TurnMarker', owner: 'TurnMarker1.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'APILogic', owner: 'APILogic.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'ActionEconomyV2', owner: 'ActionEconomyV2.9.0.js', classification: 'mixed', impact: { prune: 'prune stale references', combat: 'clear combat runtime/timed records', scene: 'combat plus scene-owner cleanup', setting: 'reverse transient mechanics; preserve durable PC/Ally setup', campaign: 'reverse mechanics and reset gameplay/setup', all: 'owner reversal, then delete root' } },
        { root: 'ZeroFrame', owner: 'ZeroFrame.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'SaveEffects', owner: 'SaveEffects1.4.0.js', classification: 'runtime/cache', impact: { prune: 'prune missing sources', combat: 'clear sources', scene: 'clear sources', setting: 'clear sources', campaign: 'clear sources', all: 'clear sources, then delete root' } },
        { root: 'MetaScriptToolbox', owner: 'MetaScriptToolbox.js', classification: 'framework/config', impact: STANDARD_CONFIG_IMPACT },
        { root: 'Executioner', owner: 'Executioner.js', classification: 'durable gameplay', impact: { prune: 'prune missing tokens', combat: 'prune missing tokens', scene: 'prune missing tokens', setting: 'prune missing tokens', campaign: 'reset forms', all: 'delete root' } },
        { root: 'HPManager', owner: 'HPManager1.1.1.js', classification: 'runtime/cache', impact: { prune: 'preserve', combat: 'preserve', scene: 'preserve', setting: 'preserve', campaign: 'reset root', all: 'delete root' } },
        { root: 'AttackDamageResolver', owner: 'AttackDamageResolver1.4.0.js', classification: 'runtime/cache', impact: { prune: 'prune stale targets/undo', combat: 'clear attack runtime/cache', scene: 'clear attack runtime/cache', setting: 'clear attack runtime/cache', campaign: 'clear attack runtime/cache', all: 'clear runtime, then delete root' } },
        { root: 'AoEBoom', owner: 'AoEBoom1.2.0.js', classification: 'runtime/cache', impact: { prune: 'prune stale templates', combat: 'owner cleanup all templates', scene: 'owner cleanup all templates', setting: 'owner cleanup all templates', campaign: 'owner cleanup all templates', all: 'owner cleanup, then delete root' } },
        { root: 'MapChange', owner: 'MapChange.js', classification: 'framework/config', impact: { prune: 'rebuild page indexes', combat: 'rebuild page indexes', scene: 'rebuild page indexes', setting: 'rebuild page indexes', campaign: 'rebuild page indexes', all: 'delete root' } },
        { root: 'BeaconAttributeTester', owner: 'BeaconAttributeTester.js', classification: 'testing', impact: { prune: 'prune stale snapshots', combat: 'prune stale snapshots', scene: 'prune stale snapshots', setting: 'clear snapshots', campaign: 'clear snapshots', all: 'delete root' } },
        { root: 'TokenTriggers', owner: 'TokenTriggers1.4.0.js', classification: 'mixed', impact: { prune: 'prune missing characters/tokens', combat: 'clear Bloodied/RE runtime', scene: 'clear Bloodied/RE runtime', setting: 'restore presentation; clear runtime', campaign: 'restore runtime and reset configuration', all: 'owner restoration, then delete root' } },
        { root: 'TokenAnimator', owner: 'TokenAnimator1.5.js', classification: 'runtime/cache', impact: { prune: 'prune invalid baselines', combat: 'prune invalid baselines', scene: 'prune invalid baselines', setting: 'prune invalid baselines', campaign: 'clear baselines/cancel animations', all: 'clear baselines/cancel animations, then delete root' } },
        { root: 'LootManager', owner: 'LootManager1.5.js', classification: 'mixed', impact: { prune: 'prune malformed/stale keyrings', combat: 'prune malformed/stale keyrings', scene: 'prune malformed/stale keyrings', setting: 'prune malformed/stale keyrings', campaign: 'clear keyrings; preserve config', all: 'clear keyrings, then delete root' } },
        { root: 'torii', owner: 'shared meta-toolchain', classification: 'framework/config', impact: { prune: 'preserve', combat: 'preserve', scene: 'preserve', setting: 'preserve', campaign: 'preserve', all: 'delete shared root' } }
    ];
    const LEGACY_ROOTS = ['TokenSizeAnimator', 'AuraToggle'];
    const OWNER_APIS = [
        ['ActionEconomyV2', function() { return typeof ActionEconomyV2API !== 'undefined' && ActionEconomyV2API; }],
        ['AttackDamageResolver', function() { return typeof AttackDamageResolverAPI !== 'undefined' && AttackDamageResolverAPI; }],
        ['SaveEffects', function() { return typeof SaveEffectsAPI !== 'undefined' && SaveEffectsAPI; }],
        ['AoEBoom', function() { return typeof AoEBoom !== 'undefined' && AoEBoom; }],
        ['SmartAoE', function() { return typeof SmartAoE !== 'undefined' && SmartAoE; }],
        ['TokenTriggers', function() { return typeof TokenTriggers !== 'undefined' && TokenTriggers; }],
        ['TokenAnimator', function() { return typeof TokenAnimator !== 'undefined' && TokenAnimator; }],
        ['LootManager', function() { return typeof LootManager !== 'undefined' && LootManager; }],
        ['DoorSounds', function() { return typeof DoorSounds !== 'undefined' && DoorSounds; }]
    ];

    function hasOwn(object, key) {
        return !!object && Object.prototype.hasOwnProperty.call(object, key);
    }

    function existing(name) {
        return hasOwn(state, name);
    }

    function count(value) {
        if (Array.isArray(value)) return value.length;
        return value && typeof value === 'object' ? Object.keys(value).length : (value === undefined || value === null ? 0 : 1);
    }

    function usefulCount(name, value) {
        if (!value || typeof value !== 'object') return count(value) + ' value(s)';
        if (name === 'ActionEconomyV2') {
            const keys = ['economy', 'effects', 'conditions', 'mounts', 'summons', 'aoeControls', 'aoeHazards', 'directionalHazards', 'visualLinks', 'ongoingDamage'];
            return keys.reduce(function(total, key) { return total + count(value[key]); }, 0) + ' gameplay/runtime record(s); ' +
                count(value.pcCharacterIds) + ' PC and ' + count(value.allyCharacterIds) + ' Ally registration(s)';
        }
        if (name === 'SmartAoE') return count(value.links) + ' link(s)';
        if (name === 'DoorSounds') return count(value.groups) + ' group(s), ' + count(value.doors) + ' door assignment(s)';
        if (name === 'SaveEffects') return count(value.sources) + ' remembered source(s)';
        if (name === 'AttackDamageResolver') return (count(value.attackTargets) + count(value.targetSlots) + (value.lastAttack ? 1 : 0) + (value.lastDamageUndo ? 1 : 0)) + ' runtime record(s)';
        if (name === 'AoEBoom') return count(value.templates) + ' template(s)';
        if (name === 'TokenTriggers') return count(value.characters) + ' character configuration(s), ' + count(value.tokens) + ' token runtime record(s)';
        if (name === 'TokenAnimator') return count(value.tokens) + ' baseline(s)';
        if (name === 'LootManager') return count(value.keys) + ' character keyring(s), ' + count(value.config) + ' config field(s)';
        if (name === 'BeaconAttributeTester') return count(value.snapshots) + ' snapshot(s)';
        return count(value) + ' top-level entr' + (count(value) === 1 ? 'y' : 'ies');
    }

    function makeResult(owner, profile) {
        return { owner: owner, profile: profile, status: 'ok', removed: 0, restored: 0, preserved: 0, actions: [], preservedDetails: [], warnings: [] };
    }

    function normalizeResult(owner, profile, value) {
        const normalized = makeResult(owner, profile);
        if (!value || typeof value !== 'object') {
            normalized.status = 'error';
            normalized.warnings.push('Owner returned no predictable maintenance summary; related state was preserved.');
            return normalized;
        }
        normalized.status = value.status || 'ok';
        normalized.removed = Number(value.removed) || 0;
        normalized.restored = Number(value.restored) || 0;
        normalized.preserved = Number(value.preserved) || 0;
        normalized.actions = Array.isArray(value.actions) ? value.actions : [];
        normalized.preservedDetails = Array.isArray(value.preservedDetails) ? value.preservedDetails : [];
        normalized.warnings = Array.isArray(value.warnings) ? value.warnings : [];
        return normalized;
    }

    function maintainExecutioner(profile, dryRun) {
        const result = makeResult('Executioner', profile);
        const root = state.Executioner || {};
        const ids = Object.keys(root);
        const campaignReset = profile === 'campaign';
        const selected = campaignReset ? ids : ids.filter(function(id) { return !getObj('graphic', id); });
        result.removed = selected.length;
        result.preserved = ids.length - selected.length;
        if (selected.length) result.actions.push((campaignReset ? 'clear ' : 'prune ') + selected.length + ' Executioner form record(s)');
        if (result.preserved) result.preservedDetails.push('valid Executioner token forms');
        if (!dryRun) selected.forEach(function(id) { delete root[id]; });
        return result;
    }

    function maintainHPManager(profile, dryRun) {
        const result = makeResult('HPManager', profile);
        if (profile === 'campaign' && existing('HPManager')) {
            result.removed = count(state.HPManager);
            result.actions.push('reinitialize HPManager gameplay state');
            if (!dryRun) state.HPManager = {};
        } else if (existing('HPManager')) {
            result.preserved = count(state.HPManager);
            result.preservedDetails.push('HPManager has no selective maintenance state');
        }
        return result;
    }

    function maintainBeaconTester(profile, dryRun) {
        const result = makeResult('BeaconAttributeTester', profile);
        const root = state.BeaconAttributeTester || {};
        const snapshots = root.snapshots && typeof root.snapshots === 'object' ? root.snapshots : {};
        const ids = Object.keys(snapshots);
        const clearAll = profile === 'setting' || profile === 'campaign';
        const selected = clearAll ? ids : ids.filter(function(key) {
            const entry = snapshots[key];
            return !entry || !entry.characterId || !getObj('character', entry.characterId);
        });
        result.removed = selected.length;
        result.preserved = ids.length - selected.length;
        if (selected.length) result.actions.push((clearAll ? 'clear ' : 'prune ') + selected.length + ' Beacon test snapshot(s)');
        if (result.preserved) result.preservedDetails.push('snapshots for existing characters');
        if (!dryRun) selected.forEach(function(key) { delete snapshots[key]; });
        return result;
    }

    function maintainMapChange(profile, dryRun) {
        const result = makeResult('MapChange', profile);
        if (!existing('MapChange')) return result;
        result.actions.push('rebuild generated public/private/archive/hidden page indexes');
        result.preserved = count(state.MapChange.config) + count(state.MapChange.blockedPlayers);
        result.preservedDetails.push('MapChange configuration and blocked-player settings');
        if (!dryRun && typeof MapChange !== 'undefined' && MapChange && typeof MapChange.ConstructMaps === 'function') {
            MapChange.ConstructMaps();
        } else if (!dryRun) {
            result.status = 'unavailable';
            result.warnings.push('MapChange.ConstructMaps is unavailable; existing page indexes were preserved.');
        }
        return result;
    }

    function directMaintenance(profile, dryRun) {
        if (profile === 'all') return [];
        return [
            maintainExecutioner(profile, dryRun),
            maintainHPManager(profile, dryRun),
            maintainBeaconTester(profile, dryRun),
            maintainMapChange(profile, dryRun)
        ];
    }

    function preservedConfigurationResult(profile) {
        const result = makeResult('Suite configuration', profile);
        if (profile === 'all') return result;
        const roots = INVENTORY.filter(function(entry) {
            return existing(entry.root) && entry.impact[profile] === 'preserve';
        }).map(function(entry) { return 'state.' + entry.root; });
        result.preserved = roots.length;
        if (roots.length) result.preservedDetails.push('unchanged roots: ' + roots.join(', '));
        return result;
    }

    function factoryResults(profile) {
        if (profile !== 'all') return [];
        const result = makeResult('Factory reset', profile);
        INVENTORY.forEach(function(entry) {
            if (!existing(entry.root)) return;
            result.removed++;
            result.actions.push('delete state.' + entry.root + ' after owner cleanup (currently ' + usefulCount(entry.root, state[entry.root]) + ')');
        });
        LEGACY_ROOTS.forEach(function(root) {
            if (!existing(root)) return;
            result.removed++;
            result.actions.push('delete obsolete state.' + root + ' after owner cleanup (currently ' + usefulCount(root, state[root]) + ')');
        });
        const recognized = INVENTORY.map(function(entry) { return entry.root; }).concat(LEGACY_ROOTS).concat(['TheAaron']);
        const unrecognized = Object.keys(state).filter(function(root) { return recognized.indexOf(root) === -1; });
        if (unrecognized.length) {
            result.preserved += unrecognized.length;
            result.preservedDetails.push('unowned/unrecognized roots preserved: ' + unrecognized.join(', '));
        }
        if (existing('TheAaron')) {
            result.preserved++;
            result.preservedDetails.push('unowned state.TheAaron preserved');
        }
        result.warnings.push('Factory reset is irreversible and requires a Mod sandbox restart afterward.');
        return [result];
    }

    function collect(profile, dryRun) {
        const results = [];
        const plannedFactoryResults = factoryResults(profile);
        OWNER_APIS.forEach(function(entry) {
            const api = entry[1]();
            if (!api || typeof api.maintainState !== 'function') {
                const unavailable = makeResult(entry[0], profile);
                unavailable.status = 'unavailable';
                unavailable.warnings.push(profile === 'all'
                    ? 'Owner cleanup API is unavailable; the factory reset would still delete this recognized root. Verify no live mechanics remain.'
                    : 'Owner maintenance API is unavailable; related mixed state was preserved.');
                results.push(unavailable);
                return;
            }
            try {
                const summary = normalizeResult(entry[0], profile, api.maintainState({ profile: profile, dryRun: dryRun }));
                if (profile === 'all') {
                    summary.preserved = 0;
                    summary.preservedDetails = [];
                    summary.warnings = summary.warnings.map(function(warning) {
                        return warning + ' Factory all will still delete the recognized bookkeeping after owner cleanup.';
                    });
                }
                results.push(summary);
            } catch (error) {
                const failed = makeResult(entry[0], profile);
                failed.status = 'error';
                failed.warnings.push('Maintenance failed: ' + String(error));
                results.push(failed);
            }
        });
        return results
            .concat(directMaintenance(profile, dryRun))
            .concat([preservedConfigurationResult(profile)])
            .concat(plannedFactoryResults);
    }

    function totals(results) {
        return results.reduce(function(total, item) {
            total.removed += item.removed || 0;
            total.restored += item.restored || 0;
            total.preserved += item.preserved || 0;
            total.warnings += (item.warnings || []).length;
            return total;
        }, { removed: 0, restored: 0, preserved: 0, warnings: 0 });
    }

    function escapeTemplate(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;')
            .replace(/\|/g, '&#124;')
            .replace(/@/g, '&#64;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function resultLine(item) {
        const work = item.actions.length ? item.actions.join('; ') : 'no state/action affected';
        const preserved = item.preservedDetails.length ? item.preservedDetails.join('; ') : (item.preserved ? item.preserved + ' record(s)' : 'none');
        return '<b>' + escapeTemplate(item.owner) + '</b>: ' + escapeTemplate(work) + '<br>Preserved: ' + escapeTemplate(preserved);
    }

    function cardForPreview(profile, results) {
        const total = totals(results);
        const warnings = results.reduce(function(all, item) { return all.concat(item.warnings || []); }, []);
        const confirm = profile === 'all' ? '!statewipe all WIPE ALL' : '!statewipe ' + profile + ' WIPE';
        const affected = results.reduce(function(lines, item) {
            item.actions.forEach(function(action) {
                lines.push('<b>' + escapeTemplate(item.owner) + '</b>: ' + escapeTemplate(action));
            });
            return lines;
        }, []);
        const preserved = results.reduce(function(lines, item) {
            item.preservedDetails.forEach(function(detail) {
                lines.push('<b>' + escapeTemplate(item.owner) + '</b>: ' + escapeTemplate(detail));
            });
            return lines;
        }, []);
        const warningLines = results.reduce(function(lines, item) {
            item.warnings.forEach(function(warning) {
                lines.push('<b>' + escapeTemplate(item.owner) + '</b>: ' + escapeTemplate(warning));
            });
            return lines;
        }, []);
        const sendParts = function(label, lines) {
            let part = [];
            let length = 0;
            let partNumber = 1;
            lines.forEach(function(line) {
                if (part.length && length + line.length > 4500) {
                    sendChat(SCRIPT, '/w gm &{template:default} {{name=StateWipe ' + escapeTemplate(profile) + ' preview}} {{' + label + ' ' + partNumber + '=' + part.join('<hr>') + '}}');
                    part = [];
                    length = 0;
                    partNumber++;
                }
                part.push(line);
                length += line.length;
            });
            if (part.length) sendChat(SCRIPT, '/w gm &{template:default} {{name=StateWipe ' + escapeTemplate(profile) + ' preview}} {{' + label + ' ' + partNumber + '=' + part.join('<hr>') + '}}');
        };
        sendParts('Affected state/actions', affected.length ? affected : ['None']);
        sendParts('Preserved', preserved.length ? preserved : ['No preserved records reported']);
        if (warningLines.length) sendParts('Warnings', warningLines);
        sendChat(SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=StateWipe ' + escapeTemplate(profile) + ' preview summary}} ' +
            '{{Counts=Remove ' + total.removed + '; Restore/reverse ' + total.restored + '; Preserve ' + total.preserved + '; Warnings ' + total.warnings + '}} ' +
            '{{Warnings=' + (warnings.length ? 'See warning preview section(s) above.' : 'None') + '}} ' +
            '{{Confirmation=[' + (profile === 'all' ? 'FACTORY WIPE' : 'Run ' + escapeTemplate(profile)) + '](' + confirm + ')}}'
        );
    }

    function applyAll() {
        INVENTORY.forEach(function(entry) {
            if (existing(entry.root)) delete state[entry.root];
        });
        LEGACY_ROOTS.forEach(function(root) {
            if (existing(root)) delete state[root];
        });
    }

    function run(profile) {
        const results = collect(profile, false);
        if (profile === 'all') applyAll();
        const total = totals(results);
        const warnings = results.reduce(function(all, item) { return all.concat(item.warnings || []); }, []);
        sendChat(SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=StateWipe ' + escapeTemplate(profile) + ' complete}} ' +
            '{{Counts=Removed ' + total.removed + '; Restored/reversed ' + total.restored + '; Preserved ' + total.preserved + '; Warnings ' + total.warnings + '}} ' +
            '{{Warnings=' + (warnings.length ? escapeTemplate(warnings.join(' | ')) : 'None') + '}} ' +
            '{{Restart=' + (profile === 'all' ? 'Restart the Mod sandbox now so installed scripts reinitialize clean roots.' : 'No Mod sandbox restart is required.') + '}}'
        );
        return results;
    }

    function showStateList() {
        const rows = INVENTORY.map(function(entry) {
            const presence = existing(entry.root) ? 'present; ' + usefulCount(entry.root, state[entry.root]) : 'absent';
            const impacts = PROFILES.map(function(profile) { return profile + ': ' + entry.impact[profile]; }).join(' / ');
            return '<b>state.' + escapeTemplate(entry.root) + '</b><br>Owner: ' + escapeTemplate(entry.owner) +
                '<br>Class: ' + escapeTemplate(entry.classification) + '<br>Status: ' + escapeTemplate(presence) +
                '<br>Profiles: ' + escapeTemplate(impacts);
        });
        for (let index = 0; index < rows.length; index += 8) {
            sendChat(SCRIPT, '/w gm &{template:default} {{name=State inventory ' + (index / 8 + 1) + '/' + Math.ceil(rows.length / 8) + '}} {{Roots=' + rows.slice(index, index + 8).join('<hr>') + '}}');
        }
        const legacy = LEGACY_ROOTS.filter(existing).map(function(root) { return 'state.' + root + ' (' + usefulCount(root, state[root]) + ')'; });
        const recognized = INVENTORY.map(function(entry) { return entry.root; }).concat(LEGACY_ROOTS).concat(['TheAaron']);
        const unknown = Object.keys(state).filter(function(root) { return recognized.indexOf(root) === -1; });
        sendChat(SCRIPT,
            '/w gm &{template:default} {{name=State inventory exceptions}} ' +
            '{{Legacy=' + escapeTemplate(legacy.length ? legacy.join(', ') : 'none') + '}} ' +
            '{{Unrecognized=' + escapeTemplate(unknown.length ? unknown.join(', ') + ' (preserved by every profile)' : 'none') + '}} ' +
            '{{Protected unowned=' + escapeTemplate(existing('TheAaron') ? 'state.TheAaron present; preserved even by all' : 'state.TheAaron absent; never targeted') + '}}'
        );
    }

    function showHelp() {
        sendChat(SCRIPT,
            '/w gm &{template:default} {{name=StateWipe v' + VERSION + '}} ' +
            '{{Commands=!statewipe prune | combat | scene | setting | campaign | all<br>!statelist}} ' +
            '{{Safety=Every wipe command previews first. Ordinary profiles require WIPE; all requires WIPE ALL.}} ' +
            '{{Profiles=prune removes stale references only; combat clears combat runtime; scene also clears encounter objects; setting reverses transient mechanics but keeps durable PC/Ally setup; campaign resets gameplay/progression but keeps tools; all is a factory/emergency reset.}}'
        );
    }

    on('ready', function() {
        log('=== ' + SCRIPT + ' v' + VERSION + ' Ready ===');
        log('Commands: !statelist | !statewipe prune|combat|scene|setting|campaign|all');
    });

    on('chat:message', function(msg) {
        if (msg.type !== 'api') return;
        if (!/^!(statelist|statewipe)(\s|$)/.test(msg.content)) return;
        if (!playerIsGM(msg.playerid)) {
            sendChat(SCRIPT, '/w "' + escapeTemplate(msg.who) + '" GM only.');
            return;
        }
        const args = msg.content.trim().split(/\s+/);
        if (args[0] === '!statelist') {
            showStateList();
            return;
        }
        const profile = String(args[1] || '').toLowerCase();
        if (PROFILES.indexOf(profile) === -1) {
            showHelp();
            return;
        }
        const confirmed = profile === 'all'
            ? args[2] === 'WIPE' && args[3] === 'ALL'
            : args[2] === 'WIPE';
        if (!confirmed) {
            cardForPreview(profile, collect(profile, true));
            return;
        }
        if (profile === 'all') {
            sendChat(SCRIPT, '/w gm Factory wipe confirmed. Owner cleanup and root deletion will run after this chat event.');
            setTimeout(function() { run(profile); }, 0);
            return;
        }
        run(profile);
    });

    return {
        version: VERSION,
        inventory: INVENTORY,
        preview: function(profile) {
            return PROFILES.indexOf(profile) === -1 ? [] : collect(profile, true);
        }
    };
})();
