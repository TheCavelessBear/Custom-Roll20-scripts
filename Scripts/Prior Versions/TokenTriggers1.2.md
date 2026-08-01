const TokenTriggers = (() => {
    'use strict';

    const SCRIPT = 'TokenTriggers';
    const VERSION = '1.2';
    const DEFAULT_DEAD_SIDE = 2;
    const TEST_RESTORE_DELAY = 2000;
    const MAP_LAYER_SCALE_MULTIPLIER = 1.25;

    function checkInstall() {
        state.TokenTriggers = state.TokenTriggers || {};
        state.TokenTriggers.characters = state.TokenTriggers.characters || {};
        state.TokenTriggers.tokens = state.TokenTriggers.tokens || {};
        state.TokenTriggers.version = VERSION;

        Object.keys(state.TokenTriggers.characters).forEach(function(characterId) {
            const characterEntry = state.TokenTriggers.characters[characterId];

            characterEntry.triggers = characterEntry.triggers || {};

            if (characterEntry.triggers.hpZero) {
                normalizeHpZeroConfig(characterEntry.triggers.hpZero);
            }

            if (characterEntry.triggers.bloodied) {
                normalizeBloodiedConfig(characterEntry.triggers.bloodied);
            }
        });

        state.TokenTriggers.lastActiveTokenId = getActiveTokenId();

        log('=== TokenTriggers v' + VERSION + ' Ready ===');
        log('Commands: !tokentrigger setup | !tokentrigger registry | !tokentrigger help');

    }

    function normalizeHpZeroConfig(config) {
        config.enabled = config.enabled === true;
        config.deadSide = Math.max(1, parseInt(config.deadSide, 10) || DEFAULT_DEAD_SIDE);
        config.sound = String(config.sound || '').trim();
        config.fx = String(config.fx || '').trim();

        if (config.restoreOnPositiveHp === undefined) {
            config.restoreOnPositiveHp = true;
        } else {
            config.restoreOnPositiveHp = config.restoreOnPositiveHp === true;
        }

        if (config.moveToMapLayer === undefined) {
            config.moveToMapLayer = false;
        } else {
            config.moveToMapLayer = config.moveToMapLayer === true;
        }

        return config;
    }

    function defaultHpZeroConfig() {
        return {
            enabled: false,
            deadSide: DEFAULT_DEAD_SIDE,
            sound: '',
            fx: '',
            restoreOnPositiveHp: true,
            moveToMapLayer: false
        };
    }

    function normalizeBloodiedConfig(config) {
        config.enabled = config.enabled === true;
        config.label = String(config.label || 'Bloodied Trigger').trim() || 'Bloodied Trigger';
        config.command = String(config.command || '').trim();
        config.reverseCommand = String(config.reverseCommand || '').trim();

        if (config.reversible === undefined) {
            config.reversible = true;
        } else {
            config.reversible = config.reversible === true;
        }

        return config;
    }

    function defaultBloodiedConfig() {
        return {
            enabled: false,
            label: 'Bloodied Trigger',
            command: '',
            reverseCommand: '',
            reversible: true
        };
    }

    function getCharacterEntry(characterId, create) {
        if (!characterId) return null;

        if (!state.TokenTriggers.characters[characterId] && create) {
            state.TokenTriggers.characters[characterId] = {
                triggers: {}
            };
        }

        return state.TokenTriggers.characters[characterId] || null;
    }

    function getHpZeroConfig(characterId, create) {
        const characterEntry = getCharacterEntry(characterId, create);

        if (!characterEntry) return null;

        characterEntry.triggers = characterEntry.triggers || {};

        if (!characterEntry.triggers.hpZero && create) {
            characterEntry.triggers.hpZero = defaultHpZeroConfig();
        }

        if (!characterEntry.triggers.hpZero) return null;

        return normalizeHpZeroConfig(characterEntry.triggers.hpZero);
    }

    function getDisplayHpZeroConfig(characterId) {
        return getHpZeroConfig(characterId, false) || defaultHpZeroConfig();
    }

    function getBloodiedConfig(characterId, create) {
        const characterEntry = getCharacterEntry(characterId, create);

        if (!characterEntry) return null;

        characterEntry.triggers = characterEntry.triggers || {};

        if (!characterEntry.triggers.bloodied && create) {
            characterEntry.triggers.bloodied = defaultBloodiedConfig();
        }

        if (!characterEntry.triggers.bloodied) return null;

        return normalizeBloodiedConfig(characterEntry.triggers.bloodied);
    }

    function getDisplayBloodiedConfig(characterId) {
        return getBloodiedConfig(characterId, false) || defaultBloodiedConfig();
    }

    function removeCharacterRegistration(characterId) {
        if (!characterId) return;

        const bloodiedConfig = getBloodiedConfig(characterId, false);

        Object.keys(state.TokenTriggers.tokens).forEach(function(tokenId) {
            const token = getObj('graphic', tokenId);
            const runtime = state.TokenTriggers.tokens[tokenId];

            if (!token) {
                delete state.TokenTriggers.tokens[tokenId];
                return;
            }

            if (token.get('represents') !== characterId) return;

            if (runtime.hpZero && runtime.hpZero.active) {
                restoreTokenPresentation(token, runtime.hpZero);
            }

            if (
                bloodiedConfig &&
                bloodiedConfig.reversible &&
                runtime.bloodied &&
                runtime.bloodied.active
            ) {
                reverseBloodiedTrigger(token, bloodiedConfig);
            }

            delete state.TokenTriggers.tokens[tokenId];
        });

        delete state.TokenTriggers.characters[characterId];
    }

    function getTokenRuntime(tokenId, create) {
        if (!tokenId) return null;

        if (!state.TokenTriggers.tokens[tokenId] && create) {
            state.TokenTriggers.tokens[tokenId] = {};
        }

        return state.TokenTriggers.tokens[tokenId] || null;
    }

    function cleanTokenRuntime(tokenId) {
        const runtime = state.TokenTriggers.tokens[tokenId];

        if (!runtime) return;

        if (!Object.keys(runtime).length) {
            delete state.TokenTriggers.tokens[tokenId];
        }
    }

    function getSelectedTokens(msg) {
        if (!msg.selected || !msg.selected.length) return [];

        return msg.selected
            .map(function(selected) {
                return getObj('graphic', selected._id);
            })
            .filter(function(token) {
                return token && token.get('subtype') === 'token';
            });
    }

    function getSetupToken(msg, tokenId) {
        if (tokenId) {
            const token = getObj('graphic', tokenId);

            if (token && token.get('subtype') === 'token') {
                return token;
            }

            return null;
        }

        const selected = getSelectedTokens(msg);
        return selected.length ? selected[0] : null;
    }

    function requireSetupToken(msg, tokenId) {
        const token = getSetupToken(msg, tokenId);

        if (!token) {
            sendChat(SCRIPT, '/w gm TokenTriggers: Select a token that represents a character.');
            return null;
        }

        if (!token.get('represents')) {
            sendChat(SCRIPT, '/w gm TokenTriggers: ' + tokenName(token) + ' does not represent a character.');
            return null;
        }

        return token;
    }

    function tokenName(token) {
        if (!token) return 'Unknown Token';

        const tokenValue = String(token.get('name') || '').trim();
        if (tokenValue) return tokenValue;

        const character = getObj('character', token.get('represents'));
        return character ? character.get('name') : 'Unnamed Token';
    }

    function characterName(characterId) {
        const character = getObj('character', characterId);
        return character ? character.get('name') : 'Missing Character';
    }

    function escapeTemplate(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/@/g, '&#64;')
            .replace(/{/g, '&#123;')
            .replace(/}/g, '&#125;')
            .replace(/\|/g, '&#124;');
    }

    function stripWrappingQuotes(value) {
        const text = String(value || '').trim();

        if (
            text.length >= 2 &&
            ((text[0] === '"' && text[text.length - 1] === '"') ||
             (text[0] === "'" && text[text.length - 1] === "'"))
        ) {
            return text.slice(1, -1).trim();
        }

        return text;
    }

    function getTurnOrder() {
        const raw = Campaign().get('turnorder');

        if (!raw) return [];

        try {
            return JSON.parse(raw);
        } catch (error) {
            return [];
        }
    }

    function getActiveTokenId() {
        const turnOrder = getTurnOrder();

        if (!turnOrder.length) return null;
        if (!turnOrder[0] || !turnOrder[0].id || turnOrder[0].id === '-1') return null;

        return turnOrder[0].id;
    }

    function getSideCount(token) {
        const sides = String(token.get('sides') || '');

        if (!sides) return 0;

        return sides
            .split('|')
            .filter(function(side) {
                return side !== '';
            })
            .length;
    }

    function getCurrentSideNumber(token) {
        const currentSide = parseInt(token.get('currentSide'), 10);

        if (isNaN(currentSide)) return 1;

        return currentSide + 1;
    }

    function isValidSide(token, sideNumber) {
        const sideCount = getSideCount(token);
        const cleanSide = parseInt(sideNumber, 10);

        return sideCount > 0 && !isNaN(cleanSide) && cleanSide >= 1 && cleanSide <= sideCount;
    }

    function getCleanImgsrc(imgsrc) {
        const rawSource = String(imgsrc || '');
        let cleanSource = rawSource;

        try {
            cleanSource = decodeURIComponent(rawSource);
        } catch (error) {
            cleanSource = rawSource;
        }

        const match = cleanSource.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);

        if (!match) return null;

        return match[1] + 'thumb' + match[3] + (match[4] || '');
    }

    function getSideImgsrc(token, sideNumber) {
        if (!token || !isValidSide(token, sideNumber)) return null;

        const sides = String(token.get('sides') || '').split('|');
        const encodedSide = sides[parseInt(sideNumber, 10) - 1];

        if (!encodedSide) return null;

        return getCleanImgsrc(encodedSide);
    }

    function setTokenSide(token, sideNumber) {
        if (!token || !isValidSide(token, sideNumber)) return false;

        const cleanSide = parseInt(sideNumber, 10);
        const imgsrc = getSideImgsrc(token, cleanSide);

        if (!imgsrc) {
            sendChat(
                SCRIPT,
                '/w gm TokenTriggers: Could not resolve the image for side ' + cleanSide +
                ' on ' + escapeTemplate(tokenName(token)) + '.'
            );
            return false;
        }

        token.set({
            currentSide: cleanSide - 1,
            imgsrc: imgsrc
        });

        return true;
    }


    function getTokenLayer(token) {
        if (!token) return 'objects';

        return String(token.get('layer') || 'objects');
    }

    function setTokenLayer(token, layerName) {
        if (!token) return false;

        const allowedLayers = ['objects', 'gmlayer', 'map', 'walls'];
        const cleanLayer = String(layerName || '').toLowerCase();

        if (allowedLayers.indexOf(cleanLayer) === -1) return false;

        token.set('layer', cleanLayer);
        return true;
    }

    function getTokenPresentationGeometry(token) {
        if (!token) return null;

        const width = parseFloat(token.get('width'));
        const height = parseFloat(token.get('height'));
        const rotation = parseFloat(token.get('rotation'));

        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) return null;

        return {
            width: width,
            height: height,
            rotation: isNaN(rotation) ? 0 : rotation
        };
    }

    function applyMapLayerPresentation(token, hpZeroRuntime) {
        if (!token || !hpZeroRuntime) return false;

        const originalWidth = parseFloat(hpZeroRuntime.originalWidth);
        const originalHeight = parseFloat(hpZeroRuntime.originalHeight);
        const originalRotation = parseFloat(hpZeroRuntime.originalRotation);

        if (
            isNaN(originalWidth) ||
            isNaN(originalHeight) ||
            originalWidth <= 0 ||
            originalHeight <= 0
        ) return false;

        const baseRotation = isNaN(originalRotation) ? 0 : originalRotation;
        const randomRotation = (baseRotation + randomInteger(360)) % 360;

        token.set({
            width: originalWidth * MAP_LAYER_SCALE_MULTIPLIER,
            height: originalHeight * MAP_LAYER_SCALE_MULTIPLIER,
            rotation: randomRotation
        });

        return setTokenLayer(token, 'map');
    }

    function restoreTokenPresentation(token, hpZeroRuntime) {
        if (!token || !hpZeroRuntime) return {
            sideRestored: false,
            layerRestored: false,
            sizeRestored: false,
            rotationRestored: false
        };

        const sideRestored = setTokenSide(token, hpZeroRuntime.originalSide);
        const layerRestored = setTokenLayer(token, hpZeroRuntime.originalLayer || 'objects');
        const hasStoredSize = hpZeroRuntime.originalWidth !== undefined &&
            hpZeroRuntime.originalWidth !== null &&
            hpZeroRuntime.originalHeight !== undefined &&
            hpZeroRuntime.originalHeight !== null;
        const hasStoredRotation = hpZeroRuntime.originalRotation !== undefined &&
            hpZeroRuntime.originalRotation !== null;
        const originalWidth = parseFloat(hpZeroRuntime.originalWidth);
        const originalHeight = parseFloat(hpZeroRuntime.originalHeight);
        const originalRotation = parseFloat(hpZeroRuntime.originalRotation);
        const validStoredSize = hasStoredSize && !isNaN(originalWidth) &&
            !isNaN(originalHeight) && originalWidth > 0 && originalHeight > 0;
        const validStoredRotation = hasStoredRotation && !isNaN(originalRotation);
        const sizeRestored = !hasStoredSize || validStoredSize;
        const rotationRestored = !hasStoredRotation || validStoredRotation;
        const updates = {};

        if (validStoredSize) {
            updates.width = originalWidth;
            updates.height = originalHeight;
        }

        if (validStoredRotation) {
            updates.rotation = originalRotation;
        }

        if (Object.keys(updates).length) {
            token.set(updates);
        }

        return {
            sideRestored: sideRestored,
            layerRestored: layerRestored,
            sizeRestored: sizeRestored,
            rotationRestored: rotationRestored
        };
    }

    function playSound(trackName) {
        if (!trackName) return true;

        const track = findObjs({
            type: 'jukeboxtrack',
            title: trackName
        })[0];

        if (!track) {
            sendChat(SCRIPT, '/w gm TokenTriggers: No Jukebox track found named ' + escapeTemplate(trackName) + '.');
            log('TokenTriggers: No Jukebox track found: ' + trackName);
            return false;
        }

        track.set('playing', false);
        track.set('softstop', false);
        track.set('playing', true);

        return true;
    }

    function getCustomFxByName(fxName) {
        const cleanName = String(fxName || '').trim().toLowerCase();

        if (!cleanName) return null;

        return findObjs({
            _type: 'custfx'
        }).find(function(fx) {
            return String(fx.get('name') || '').trim().toLowerCase() === cleanName;
        }) || null;
    }

    function playFx(token, fxName) {
        if (!token || !fxName) return true;

        const cleanName = String(fxName || '').trim();
        const customFx = getCustomFxByName(cleanName);
        const left = parseFloat(token.get('left'));
        const top = parseFloat(token.get('top'));
        const pageId = token.get('_pageid');

        if (isNaN(left) || isNaN(top) || !pageId) return false;

        try {
            if (customFx) {
                spawnFxWithDefinition(
                    left,
                    top,
                    customFx.get('definition'),
                    pageId
                );
            } else {
                spawnFx(
                    left,
                    top,
                    cleanName,
                    pageId
                );
            }

            return true;
        } catch (error) {
            log('TokenTriggers: FX failed for ' + cleanName + ': ' + error.message);
            sendChat(
                SCRIPT,
                '/w gm TokenTriggers: Could not play FX ' + escapeTemplate(cleanName) + '.'
            );
            return false;
        }
    }

    function activateHpZeroTrigger(token, config) {
        const runtime = getTokenRuntime(token.id, true);

        if (runtime.hpZero && runtime.hpZero.active) return;

        const originalGeometry = getTokenPresentationGeometry(token);

        runtime.hpZero = {
            active: true,
            originalSide: getCurrentSideNumber(token),
            originalLayer: getTokenLayer(token),
            originalWidth: originalGeometry ? originalGeometry.width : null,
            originalHeight: originalGeometry ? originalGeometry.height : null,
            originalRotation: originalGeometry ? originalGeometry.rotation : null
        };

        if (!setTokenSide(token, config.deadSide)) {
            sendChat(
                SCRIPT,
                '/w gm TokenTriggers: ' + escapeTemplate(tokenName(token)) +
                ' does not have configured dead side ' + config.deadSide + '.'
            );
        }

        playSound(config.sound);
        playFx(token, config.fx);

        if (config.moveToMapLayer && !applyMapLayerPresentation(token, runtime.hpZero)) {
            sendChat(
                SCRIPT,
                '/w gm TokenTriggers: Could not enlarge, rotate, and move ' +
                escapeTemplate(tokenName(token)) + ' to the map layer.'
            );
        }
    }

    function recoverHpZeroTrigger(token, config) {
        const runtime = getTokenRuntime(token.id, false);

        if (!runtime || !runtime.hpZero || !runtime.hpZero.active) return;

        if (config.restoreOnPositiveHp) {
            const result = restoreTokenPresentation(token, runtime.hpZero);

            if (!result.sideRestored) {
                sendChat(
                    SCRIPT,
                    '/w gm TokenTriggers: Could not restore ' + escapeTemplate(tokenName(token)) +
                    ' to side ' + runtime.hpZero.originalSide + '.'
                );
            }

            if (!result.layerRestored) {
                sendChat(
                    SCRIPT,
                    '/w gm TokenTriggers: Could not restore ' + escapeTemplate(tokenName(token)) +
                    ' to layer ' + escapeTemplate(runtime.hpZero.originalLayer || 'objects') + '.'
                );
            }

            if (!result.sizeRestored) {
                sendChat(
                    SCRIPT,
                    '/w gm TokenTriggers: Could not restore the original size of ' +
                    escapeTemplate(tokenName(token)) + '.'
                );
            }

            if (!result.rotationRestored) {
                sendChat(
                    SCRIPT,
                    '/w gm TokenTriggers: Could not restore the original rotation of ' +
                    escapeTemplate(tokenName(token)) + '.'
                );
            }
        }

        delete runtime.hpZero;
        cleanTokenRuntime(token.id);
    }

    function manuallyRestoreToken(token) {
        const runtime = getTokenRuntime(token.id, false);

        if (!runtime || !runtime.hpZero || !runtime.hpZero.active) {
            sendChat(SCRIPT, '/w gm TokenTriggers: No active HP 0 presentation is stored for ' + escapeTemplate(tokenName(token)) + '.');
            return;
        }

        const result = restoreTokenPresentation(token, runtime.hpZero);

        if (!result.sideRestored) {
            sendChat(
                SCRIPT,
                '/w gm TokenTriggers: Could not restore ' + escapeTemplate(tokenName(token)) +
                ' to side ' + runtime.hpZero.originalSide + '.'
            );
        }

        if (!result.layerRestored) {
            sendChat(
                SCRIPT,
                '/w gm TokenTriggers: Could not restore ' + escapeTemplate(tokenName(token)) +
                ' to layer ' + escapeTemplate(runtime.hpZero.originalLayer || 'objects') + '.'
            );
        }

        if (!result.sizeRestored) {
            sendChat(
                SCRIPT,
                '/w gm TokenTriggers: Could not restore the original size of ' +
                escapeTemplate(tokenName(token)) + '.'
            );
        }

        if (!result.rotationRestored) {
            sendChat(
                SCRIPT,
                '/w gm TokenTriggers: Could not restore the original rotation of ' +
                escapeTemplate(tokenName(token)) + '.'
            );
        }

        if (
            !result.sideRestored ||
            !result.layerRestored ||
            !result.sizeRestored ||
            !result.rotationRestored
        ) return;

        delete runtime.hpZero;
        cleanTokenRuntime(token.id);
    }

    function testHpZeroTrigger(token, config) {
        const originalSide = getCurrentSideNumber(token);
        const originalLayer = getTokenLayer(token);
        const originalGeometry = getTokenPresentationGeometry(token);

        if (!setTokenSide(token, config.deadSide)) {
            sendChat(
                SCRIPT,
                '/w gm TokenTriggers: ' + escapeTemplate(tokenName(token)) +
                ' does not have configured dead side ' + config.deadSide + '.'
            );
        }

        playSound(config.sound);
        playFx(token, config.fx);

        if (config.moveToMapLayer) {
            applyMapLayerPresentation(token, {
                originalWidth: originalGeometry ? originalGeometry.width : null,
                originalHeight: originalGeometry ? originalGeometry.height : null,
                originalRotation: originalGeometry ? originalGeometry.rotation : null
            });
        }

        setTimeout(function() {
            const currentToken = getObj('graphic', token.id);

            if (!currentToken) return;

            setTokenSide(currentToken, originalSide);
            setTokenLayer(currentToken, originalLayer);

            if (originalGeometry) {
                currentToken.set({
                    width: originalGeometry.width,
                    height: originalGeometry.height,
                    rotation: originalGeometry.rotation
                });
            }
        }, TEST_RESTORE_DELAY);
    }

    function isBloodiedHp(currentHp, maxHp) {
        return !isNaN(currentHp) &&
            !isNaN(maxHp) &&
            maxHp > 0 &&
            currentHp > 0 &&
            currentHp <= maxHp / 2;
    }

    function getBloodiedRuntime(token, create) {
        const runtime = getTokenRuntime(token.id, create);

        if (!runtime) return null;

        if (!runtime.bloodied && create) {
            runtime.bloodied = {
                pending: false,
                active: false,
                firedThisCombat: false
            };
        }

        return runtime.bloodied || null;
    }

    function expandBloodiedCommand(command, token) {
        return String(command || '')
            .replace(/@@token/g, token.id)
            .replace(/@@character/g, token.get('represents') || '')
            .replace(/@@name/g, tokenName(token));
    }

    function executeBloodiedCommand(command, token) {
        const expanded = expandBloodiedCommand(command, token).trim();

        if (!expanded) return false;

        if (expanded.charAt(0) !== '!') {
            sendChat(
                SCRIPT,
                '/w gm TokenTriggers: Bloodied commands must begin with ! for ' +
                escapeTemplate(tokenName(token)) + '.'
            );
            return false;
        }

        sendChat(SCRIPT, expanded);
        return true;
    }

    function announceBloodiedTrigger(token, config, suffix, detail) {
        sendChat(
            SCRIPT,
            '&{template:default} ' +
            '{{name=' + escapeTemplate(config.label + suffix) + '}} ' +
            '{{Target=' + escapeTemplate(tokenName(token)) + '}} ' +
            '{{Trigger=' + escapeTemplate(detail) + '}}'
        );
    }

    function queueBloodiedTrigger(token) {
        const runtime = getBloodiedRuntime(token, true);

        if (!runtime || runtime.pending || runtime.active || runtime.firedThisCombat) return;

        runtime.pending = true;
        runtime.queuedAt = Date.now();
    }

    function activateBloodiedTrigger(token, config) {
        const runtime = getBloodiedRuntime(token, true);

        if (!runtime || !runtime.pending || runtime.active || runtime.firedThisCombat) return false;

        if (!executeBloodiedCommand(config.command, token)) {
            runtime.pending = false;
            return false;
        }

        runtime.pending = false;
        runtime.active = true;
        runtime.firedThisCombat = true;
        runtime.activatedAt = Date.now();

        announceBloodiedTrigger(
            token,
            config,
            '',
            'Activated at the start of the token’s turn after becoming Bloodied.'
        );

        return true;
    }

    function reverseBloodiedTrigger(token, config) {
        const runtime = getBloodiedRuntime(token, false);

        if (!runtime) return;

        if (runtime.active && config.reverseCommand) {
            executeBloodiedCommand(config.reverseCommand, token);
        }

        if (runtime.active) {
            announceBloodiedTrigger(
                token,
                config,
                ' Ended',
                'The token is no longer Bloodied.'
            );
        }

        runtime.pending = false;
        runtime.active = false;
        runtime.firedThisCombat = false;
        delete runtime.queuedAt;
        delete runtime.activatedAt;
    }

    function clearBloodiedRuntime(token) {
        const runtime = getTokenRuntime(token.id, false);

        if (!runtime || !runtime.bloodied) return;

        delete runtime.bloodied;
        cleanTokenRuntime(token.id);
    }

    function handleBloodiedHpChange(token, oldHp, newHp, config) {
        if (!config) return;

        const maxHp = parseFloat(token.get('bar1_max'));

        if (isNaN(maxHp) || maxHp <= 0) return;

        const oldBloodied = isBloodiedHp(oldHp, maxHp);
        const newBloodied = isBloodiedHp(newHp, maxHp);
        const runtime = getBloodiedRuntime(token, false);

        if (newHp <= 0) {
            if (runtime && runtime.pending) {
                runtime.pending = false;
                delete runtime.queuedAt;
            }

            if (config.reversible && runtime && runtime.active) {
                reverseBloodiedTrigger(token, config);
            }

            return;
        }

        if (oldBloodied && !newBloodied) {
            if (config.reversible && runtime) {
                reverseBloodiedTrigger(token, config);
            }

            return;
        }

        if (!config.enabled) return;

        if (!oldBloodied && newBloodied) {
            queueBloodiedTrigger(token);
        }
    }

    function processBloodiedTurnStart(token) {
        if (!token || token.get('subtype') !== 'token') return;

        const characterId = token.get('represents');
        if (!characterId) return;

        const config = getBloodiedConfig(characterId, false);
        if (!config || !config.enabled) return;

        const currentHp = parseFloat(token.get('bar1_value'));
        const maxHp = parseFloat(token.get('bar1_max'));
        const runtime = getBloodiedRuntime(token, true);
        const isBloodied = isBloodiedHp(currentHp, maxHp);

        if (currentHp <= 0) {
            runtime.pending = false;
            return;
        }

        if (!runtime.pending && !runtime.active && !runtime.firedThisCombat && isBloodied) {
            queueBloodiedTrigger(token);
        }

        if (!runtime.pending) return;

        if (config.reversible && !isBloodied) {
            runtime.pending = false;
            delete runtime.queuedAt;
            return;
        }

        activateBloodiedTrigger(token, config);
    }

    function resetBloodiedCombatRuntime() {
        Object.keys(state.TokenTriggers.tokens).forEach(function(tokenId) {
            const runtime = state.TokenTriggers.tokens[tokenId];

            if (!runtime || !runtime.bloodied) return;

            delete runtime.bloodied;
            cleanTokenRuntime(tokenId);
        });
    }

    function handleTurnOrderChange() {
        const activeTokenId = getActiveTokenId();
        const previousActiveTokenId = state.TokenTriggers.lastActiveTokenId || null;

        if (!activeTokenId) {
            if (previousActiveTokenId) {
                resetBloodiedCombatRuntime();
            }

            state.TokenTriggers.lastActiveTokenId = null;
            return;
        }

        if (activeTokenId === previousActiveTokenId) return;

        state.TokenTriggers.lastActiveTokenId = activeTokenId;

        const activeToken = getObj('graphic', activeTokenId);

        if (activeToken) {
            processBloodiedTurnStart(activeToken);
        }
    }

    function handleBar1Change(token, prev) {
        if (!token || token.get('subtype') !== 'token') return;

        const characterId = token.get('represents');
        if (!characterId) return;

        const hpZeroConfig = getHpZeroConfig(characterId, false);
        const bloodiedConfig = getBloodiedConfig(characterId, false);

        if (!hpZeroConfig && !bloodiedConfig) return;

        const oldHp = parseFloat(prev.bar1_value);
        const newHp = parseFloat(token.get('bar1_value'));

        if (isNaN(oldHp) || isNaN(newHp)) return;

        if (hpZeroConfig) {
            if (oldHp <= 0 && newHp > 0) {
                recoverHpZeroTrigger(token, hpZeroConfig);
            } else if (hpZeroConfig.enabled && oldHp > 0 && newHp <= 0) {
                activateHpZeroTrigger(token, hpZeroConfig);
            }
        }

        handleBloodiedHpChange(token, oldHp, newHp, bloodiedConfig);
    }

    function sideButtons(token, configuredSide) {
        const sideCount = getSideCount(token);

        if (!sideCount) {
            return 'This token is not multisided.';
        }

        const buttons = [];

        for (let side = 1; side <= sideCount; side++) {
            const label = side === configuredSide ? 'Side ' + side + ' ✓' : 'Side ' + side;
            buttons.push('[' + label + '](!tokentrigger side ' + token.id + ' ' + side + ')');
        }

        return buttons.join(' ');
    }

    function setupMenuTemplate(token) {
        const characterId = token.get('represents');
        const config = getDisplayHpZeroConfig(characterId);
        const bloodiedConfig = getDisplayBloodiedConfig(characterId);
        const isRegistered = !!getHpZeroConfig(characterId, false);
        const isBloodiedRegistered = !!getBloodiedConfig(characterId, false);
        const runtime = getTokenRuntime(token.id, false);
        const isActive = !!(runtime && runtime.hpZero && runtime.hpZero.active);
        const bloodiedRuntime = runtime && runtime.bloodied ? runtime.bloodied : null;
        const bloodiedStatus = bloodiedRuntime && bloodiedRuntime.active ? 'Active' :
            bloodiedRuntime && bloodiedRuntime.pending ? 'Pending next turn' :
            bloodiedRuntime && bloodiedRuntime.firedThisCombat ? 'Used this combat' :
            'Inactive';

        return (
            '&{template:default} ' +
            '{{name=Token Trigger Setup}} ' +
            '{{Character=' + escapeTemplate(characterName(characterId)) + '}} ' +
            '{{Token=' + escapeTemplate(tokenName(token)) + '}} ' +
            '{{HP Reaches 0=Registration: ' + (isRegistered ? 'Configured' : 'Not Configured') +
                '<br>Status: ' + (config.enabled ? 'Enabled' : 'Disabled') +
                '<br>[' + (config.enabled ? 'Disable' : 'Enable') + '](!tokentrigger ' +
                (config.enabled ? 'disable ' : 'enable ') + token.id + ')}} ' +
            '{{Dead Side=Current Setting: Side ' + config.deadSide +
                '<br>Token Sides: ' + getSideCount(token) +
                '<br>' + sideButtons(token, config.deadSide) + '}} ' +
            '{{Sound=' + (config.sound ? escapeTemplate(config.sound) : 'None') +
                '<br>[Set Sound](!tokentrigger sound ' + token.id + ' ?{Exact Jukebox Track Name|Enemy Death}) ' +
                '[Clear Sound](!tokentrigger soundclear ' + token.id + ')}} ' +
            '{{FX=' + (config.fx ? escapeTemplate(config.fx) : 'None') +
                '<br>[Set FX](!tokentrigger fx ' + token.id + ' ?{FX Name|burst-death}) ' +
                '[Clear FX](!tokentrigger fxclear ' + token.id + ')}} ' +
            '{{Move to Map Layer at HP 0=' + (config.moveToMapLayer ? 'On' : 'Off') +
                '<br>[On](!tokentrigger maplayer ' + token.id + ' on) ' +
                '[Off](!tokentrigger maplayer ' + token.id + ' off)}} ' +
            '{{Restore When HP Becomes Positive=' + (config.restoreOnPositiveHp ? 'On' : 'Off') +
                '<br>Restores both the original token side and original layer.' +
                '<br>[On](!tokentrigger autorestore ' + token.id + ' on) ' +
                '[Off](!tokentrigger autorestore ' + token.id + ' off)}} ' +
            '{{Token Presentation=Currently: ' + (isActive ? 'Active' : 'Inactive') +
                '<br>[Test](!tokentrigger test ' + token.id + ') ' +
                '[Restore Stored Presentation](!tokentrigger restore ' + token.id + ')}} ' +
            '{{Bloodied Trigger=Registration: ' + (isBloodiedRegistered ? 'Configured' : 'Not Configured') +
                '<br>Status: ' + (bloodiedConfig.enabled ? 'Enabled' : 'Disabled') +
                '<br>Runtime: ' + bloodiedStatus +
                '<br>[' + (bloodiedConfig.enabled ? 'Disable' : 'Enable') + '](!tokentrigger ' +
                (bloodiedConfig.enabled ? 'bloodieddisable ' : 'bloodiedenable ') + token.id + ') ' +
                '[Blood Frenzy Preset](!tokentrigger bloodiedpreset ' + token.id + ' bloodfrenzy)}} ' +
            '{{Bloodied Trigger Command=Name: ' + escapeTemplate(bloodiedConfig.label) +
                '<br>Command: ' + (bloodiedConfig.command ? escapeTemplate(bloodiedConfig.command) : 'None') +
                '<br>[Set Name](!tokentrigger bloodiedlabel ' + token.id + ' ?{Trigger Name|Bloodied Trigger}) ' +
                '[Set Command](!tokentrigger bloodiedcommand ' + token.id + ' ?{API Command|!ae-effect bloodfrenzy &#64;&#64;token}) ' +
                '[Clear Command](!tokentrigger bloodiedcommandclear ' + token.id + ')}} ' +
            '{{Bloodied Reversal=Reversible: ' + (bloodiedConfig.reversible ? 'Yes' : 'No') +
                '<br>Reverse Command: ' + (bloodiedConfig.reverseCommand ? escapeTemplate(bloodiedConfig.reverseCommand) : 'None') +
                '<br>[Yes](!tokentrigger bloodiedreversible ' + token.id + ' on) ' +
                '[No](!tokentrigger bloodiedreversible ' + token.id + ' off) ' +
                '[Set Reverse](!tokentrigger bloodiedreverse ' + token.id + ' ?{Reverse API Command|!ae-effect remove bloodfrenzy &#64;&#64;token}) ' +
                '[Clear Reverse](!tokentrigger bloodiedreverseclear ' + token.id + ')}} ' +
            '{{Bloodied Options=[Reset Runtime](!tokentrigger bloodiedreset ' + token.id + ') ' +
                '[Clear Bloodied Configuration](!tokentrigger bloodiedclear ' + token.id +
                ' ?{Clear this Bloodied trigger?|No,no|Yes,yes})}} ' +
            '{{Options=[Refresh](!tokentrigger setup ' + token.id + ') ' +
                '[Remove Registration](!tokentrigger remove ' + token.id +
                ' ?{Remove this character registration?|No,no|Yes,yes})}} ' +
            '{{Registry=[Review All Registrations](!tokentrigger registry)}}'
        );
    }

    function showSetupMenu(token) {
        sendChat(SCRIPT, '/w gm ' + setupMenuTemplate(token));
    }

    function showHelp() {
        sendChat(
            SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=TokenTriggers Commands}} ' +
            '{{Setup=!tokentrigger setup<br>Select a represented token and open its trigger menu.}} ' +
            '{{Bulk Registration=!tokentrigger register<br>Registers the selected represented tokens with the HP 0 trigger enabled and dead side 2.}} ' +
            '{{Registry=!tokentrigger registry<br>!tokentrigger registry clean}} ' +
            '{{HP 0 Commands=!tokentrigger enable TOKEN_ID<br>' +
                '!tokentrigger disable TOKEN_ID<br>' +
                '!tokentrigger side TOKEN_ID NUMBER<br>' +
                '!tokentrigger sound TOKEN_ID TRACK NAME<br>' +
                '!tokentrigger fx TOKEN_ID FX NAME<br>' +
                '!tokentrigger maplayer TOKEN_ID on/off<br>' +
                '!tokentrigger autorestore TOKEN_ID on/off<br>' +
                '!tokentrigger test TOKEN_ID<br>' +
                '!tokentrigger restore TOKEN_ID}} ' +
            '{{Bloodied Commands=!tokentrigger bloodiedpreset TOKEN_ID bloodfrenzy<br>' +
                '!tokentrigger bloodiedenable TOKEN_ID<br>' +
                '!tokentrigger bloodieddisable TOKEN_ID<br>' +
                '!tokentrigger bloodiedlabel TOKEN_ID NAME<br>' +
                '!tokentrigger bloodiedcommand TOKEN_ID API_COMMAND<br>' +
                '!tokentrigger bloodiedreverse TOKEN_ID API_COMMAND<br>' +
                '!tokentrigger bloodiedreversible TOKEN_ID on/off<br>' +
                '!tokentrigger bloodiedreset TOKEN_ID<br>' +
                'Use @@token in stored commands for the triggering token ID.}}'
        );
    }

    function registerSelectedTokens(msg) {
        const selected = getSelectedTokens(msg);

        if (!selected.length) {
            sendChat(SCRIPT, '/w gm TokenTriggers: Select one or more represented tokens.');
            return;
        }

        let registered = 0;
        const skipped = [];

        selected.forEach(function(token) {
            const characterId = token.get('represents');

            if (!characterId) {
                skipped.push(tokenName(token));
                return;
            }

            const config = getHpZeroConfig(characterId, true);
            config.enabled = true;

            if (isValidSide(token, DEFAULT_DEAD_SIDE)) {
                config.deadSide = DEFAULT_DEAD_SIDE;
            }

            registered++;
        });

        sendChat(
            SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=Token Trigger Registration}} ' +
            '{{Registered=' + registered + ' character(s)}} ' +
            (skipped.length ? '{{Skipped=' + escapeTemplate(skipped.join(', ')) + '}} ' : '') +
            '{{Next=[Review Registry](!tokentrigger registry)}}'
        );
    }

    function findRepresentativeToken(characterId) {
        return findObjs({
            type: 'graphic',
            subtype: 'token',
            represents: characterId
        })[0] || null;
    }

    function showRegistry() {
        const characterIds = Object.keys(state.TokenTriggers.characters).sort(function(a, b) {
            return characterName(a).localeCompare(characterName(b));
        });

        if (!characterIds.length) {
            sendChat(
                SCRIPT,
                '/w gm &{template:default} ' +
                '{{name=Token Trigger Registry}} ' +
                '{{Registered Characters=None}} ' +
                '{{Setup=Select a represented token and use !tokentrigger setup.}}'
            );
            return;
        }

        const lines = characterIds.map(function(characterId) {
            const character = getObj('character', characterId);
            const hpZeroConfig = getHpZeroConfig(characterId, false);
            const bloodiedConfig = getBloodiedConfig(characterId, false);
            const token = findRepresentativeToken(characterId);

            if (!character) {
                return '<b>Missing Character</b> (' + characterId + ')' +
                    '<br>[Remove Stale Entry](!tokentrigger removechar ' + characterId + ' yes)';
            }

            if (!hpZeroConfig && !bloodiedConfig) {
                return '<b>' + escapeTemplate(character.get('name')) + '</b>' +
                    '<br>No configured triggers.';
            }

            let line = '<b>' + escapeTemplate(character.get('name')) + '</b>';

            if (hpZeroConfig) {
                line +=
                    '<br>HP 0: ' + (hpZeroConfig.enabled ? 'Enabled' : 'Disabled') +
                    ' | Dead Side: ' + hpZeroConfig.deadSide +
                    '<br>Sound: ' + (hpZeroConfig.sound ? escapeTemplate(hpZeroConfig.sound) : 'None') +
                    '<br>FX: ' + (hpZeroConfig.fx ? escapeTemplate(hpZeroConfig.fx) : 'None') +
                    '<br>Move to Map: ' + (hpZeroConfig.moveToMapLayer ? 'On' : 'Off') +
                    '<br>Auto Restore Presentation: ' + (hpZeroConfig.restoreOnPositiveHp ? 'On' : 'Off');
            }

            if (bloodiedConfig) {
                line +=
                    '<br>Bloodied: ' + (bloodiedConfig.enabled ? 'Enabled' : 'Disabled') +
                    ' | ' + escapeTemplate(bloodiedConfig.label) +
                    ' | Reversible: ' + (bloodiedConfig.reversible ? 'Yes' : 'No');
            }

            line +=
                (token ? '<br>[Setup](!tokentrigger setup ' + token.id + ')' : '<br>No token currently available.') +
                ' [Remove](!tokentrigger removechar ' + characterId +
                ' ?{Remove this character registration?|No,no|Yes,yes})';

            return line;
        });

        sendChat(
            SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=Token Trigger Registry}} ' +
            '{{Characters=' + lines.join('<hr>') + '}} ' +
            '{{Maintenance=[Clean Stale Entries](!tokentrigger registry clean)}}'
        );
    }

    function cleanRegistry() {
        let removedCharacters = 0;
        let removedTokens = 0;

        Object.keys(state.TokenTriggers.characters).forEach(function(characterId) {
            if (getObj('character', characterId)) return;

            delete state.TokenTriggers.characters[characterId];
            removedCharacters++;
        });

        Object.keys(state.TokenTriggers.tokens).forEach(function(tokenId) {
            if (getObj('graphic', tokenId)) return;

            delete state.TokenTriggers.tokens[tokenId];
            removedTokens++;
        });

        sendChat(
            SCRIPT,
            '/w gm &{template:default} ' +
            '{{name=Token Trigger Registry Cleaned}} ' +
            '{{Removed Character Entries=' + removedCharacters + '}} ' +
            '{{Removed Token Runtime Entries=' + removedTokens + '}} ' +
            '{{Registry=[Review Registrations](!tokentrigger registry)}}'
        );
    }

    function handleSetupCommand(msg, args) {
        const token = requireSetupToken(msg, args[2]);

        if (!token) return;

        showSetupMenu(token);
    }

    function handleTokenConfigCommand(msg, args, command) {
        const token = requireSetupToken(msg, args[2]);

        if (!token) return;

        const characterId = token.get('represents');
        const config = getHpZeroConfig(characterId, true);

        if (command === 'enable') {
            config.enabled = true;
            showSetupMenu(token);
            return;
        }

        if (command === 'disable') {
            config.enabled = false;
            showSetupMenu(token);
            return;
        }

        if (command === 'side') {
            const sideNumber = parseInt(args[3], 10);

            if (!isValidSide(token, sideNumber)) {
                sendChat(
                    SCRIPT,
                    '/w gm TokenTriggers: Side must be between 1 and ' + getSideCount(token) +
                    ' for ' + escapeTemplate(tokenName(token)) + '.'
                );
                return;
            }

            config.deadSide = sideNumber;
            showSetupMenu(token);
            return;
        }

        if (command === 'sound') {
            const trackName = stripWrappingQuotes(args.slice(3).join(' '));

            if (!trackName) {
                sendChat(SCRIPT, '/w gm TokenTriggers: Provide an exact Jukebox track name.');
                return;
            }

            config.sound = trackName;
            showSetupMenu(token);
            return;
        }

        if (command === 'soundclear') {
            config.sound = '';
            showSetupMenu(token);
            return;
        }

        if (command === 'fx') {
            const fxName = stripWrappingQuotes(args.slice(3).join(' '));

            if (!fxName) {
                sendChat(SCRIPT, '/w gm TokenTriggers: Provide an FX name.');
                return;
            }

            config.fx = fxName;
            showSetupMenu(token);
            return;
        }

        if (command === 'fxclear') {
            config.fx = '';
            showSetupMenu(token);
            return;
        }

        if (command === 'maplayer') {
            const value = String(args[3] || '').toLowerCase();

            if (value !== 'on' && value !== 'off') {
                sendChat(SCRIPT, '/w gm TokenTriggers: Move to map layer must be on or off.');
                return;
            }

            config.moveToMapLayer = value === 'on';
            showSetupMenu(token);
            return;
        }

        if (command === 'autorestore') {
            const value = String(args[3] || '').toLowerCase();

            if (value !== 'on' && value !== 'off') {
                sendChat(SCRIPT, '/w gm TokenTriggers: Auto restore must be on or off.');
                return;
            }

            config.restoreOnPositiveHp = value === 'on';
            showSetupMenu(token);
            return;
        }

        if (command === 'test') {
            testHpZeroTrigger(token, config);
            return;
        }

        if (command === 'restore') {
            manuallyRestoreToken(token);
            showSetupMenu(token);
            return;
        }

        if (command === 'remove') {
            const confirmation = String(args[3] || 'no').toLowerCase();

            if (confirmation === 'yes') {
                removeCharacterRegistration(characterId);
            }

            showSetupMenu(token);
        }
    }

    function handleBloodiedConfigCommand(msg, args, command) {
        const token = requireSetupToken(msg, args[2]);

        if (!token) return;

        const characterId = token.get('represents');
        const config = getBloodiedConfig(characterId, true);

        if (command === 'bloodiedenable') {
            config.enabled = true;
            showSetupMenu(token);
            return;
        }

        if (command === 'bloodieddisable') {
            config.enabled = false;
            showSetupMenu(token);
            return;
        }

        if (command === 'bloodiedlabel') {
            const label = stripWrappingQuotes(args.slice(3).join(' '));

            if (!label) {
                sendChat(SCRIPT, '/w gm TokenTriggers: Provide a Bloodied trigger name.');
                return;
            }

            config.label = label;
            showSetupMenu(token);
            return;
        }

        if (command === 'bloodiedcommand') {
            const apiCommand = stripWrappingQuotes(args.slice(3).join(' '));

            if (!apiCommand || apiCommand.charAt(0) !== '!') {
                sendChat(SCRIPT, '/w gm TokenTriggers: Bloodied trigger commands must begin with !.');
                return;
            }

            config.command = apiCommand;
            showSetupMenu(token);
            return;
        }

        if (command === 'bloodiedcommandclear') {
            config.command = '';
            showSetupMenu(token);
            return;
        }

        if (command === 'bloodiedreverse') {
            const reverseCommand = stripWrappingQuotes(args.slice(3).join(' '));

            if (!reverseCommand || reverseCommand.charAt(0) !== '!') {
                sendChat(SCRIPT, '/w gm TokenTriggers: Bloodied reverse commands must begin with !.');
                return;
            }

            config.reverseCommand = reverseCommand;
            showSetupMenu(token);
            return;
        }

        if (command === 'bloodiedreverseclear') {
            config.reverseCommand = '';
            showSetupMenu(token);
            return;
        }

        if (command === 'bloodiedreversible') {
            const value = String(args[3] || '').toLowerCase();

            if (value !== 'on' && value !== 'off') {
                sendChat(SCRIPT, '/w gm TokenTriggers: Bloodied reversibility must be on or off.');
                return;
            }

            config.reversible = value === 'on';
            showSetupMenu(token);
            return;
        }

        if (command === 'bloodiedpreset') {
            const preset = String(args[3] || '').toLowerCase();

            if (preset !== 'bloodfrenzy') {
                sendChat(SCRIPT, '/w gm TokenTriggers: Unknown Bloodied trigger preset.');
                return;
            }

            config.enabled = true;
            config.label = 'Blood Frenzy';
            config.command = '!ae-effect bloodfrenzy @@token';
            config.reverseCommand = '';
            config.reversible = false;
            clearBloodiedRuntime(token);
            showSetupMenu(token);
            return;
        }

        if (command === 'bloodiedreset') {
            const runtime = getBloodiedRuntime(token, false);

            if (runtime && runtime.active && config.reversible) {
                reverseBloodiedTrigger(token, config);
            }

            clearBloodiedRuntime(token);
            showSetupMenu(token);
            return;
        }

        if (command === 'bloodiedclear') {
            const confirmation = String(args[3] || 'no').toLowerCase();

            if (confirmation === 'yes') {
                const runtime = getBloodiedRuntime(token, false);

                if (runtime && runtime.active && config.reversible) {
                    reverseBloodiedTrigger(token, config);
                }

                const characterEntry = getCharacterEntry(characterId, false);

                if (characterEntry && characterEntry.triggers) {
                    delete characterEntry.triggers.bloodied;
                }

                clearBloodiedRuntime(token);
            }

            showSetupMenu(token);
        }
    }

    function handleInput(msg) {
        if (msg.type !== 'api') return;
        if (!msg.content.match(/^!tokentrigger(\s|$)/)) return;
        if (!playerIsGM(msg.playerid)) return;

        const args = msg.content.trim().split(/\s+/);
        const command = String(args[1] || 'help').toLowerCase();

        if (command === 'help' || command === 'menu') {
            showHelp();
            return;
        }

        if (command === 'setup') {
            handleSetupCommand(msg, args);
            return;
        }

        if (command === 'register') {
            registerSelectedTokens(msg);
            return;
        }

        if (command === 'registry') {
            if (String(args[2] || '').toLowerCase() === 'clean') {
                cleanRegistry();
            } else {
                showRegistry();
            }
            return;
        }

        if (
            command === 'enable' ||
            command === 'disable' ||
            command === 'side' ||
            command === 'sound' ||
            command === 'soundclear' ||
            command === 'fx' ||
            command === 'fxclear' ||
            command === 'maplayer' ||
            command === 'autorestore' ||
            command === 'test' ||
            command === 'restore' ||
            command === 'remove'
        ) {
            handleTokenConfigCommand(msg, args, command);
            return;
        }

        if (
            command === 'bloodiedenable' ||
            command === 'bloodieddisable' ||
            command === 'bloodiedlabel' ||
            command === 'bloodiedcommand' ||
            command === 'bloodiedcommandclear' ||
            command === 'bloodiedreverse' ||
            command === 'bloodiedreverseclear' ||
            command === 'bloodiedreversible' ||
            command === 'bloodiedpreset' ||
            command === 'bloodiedreset' ||
            command === 'bloodiedclear'
        ) {
            handleBloodiedConfigCommand(msg, args, command);
            return;
        }

        if (command === 'removechar') {
            const characterId = args[2];
            const confirmation = String(args[3] || 'no').toLowerCase();

            if (confirmation === 'yes') {
                removeCharacterRegistration(characterId);
            }

            showRegistry();
            return;
        }

        showHelp();
    }

    function handleCharacterDeleted(character) {
        if (!character) return;

        removeCharacterRegistration(character.id);
    }

    function handleTokenDeleted(token) {
        if (!token) return;

        delete state.TokenTriggers.tokens[token.id];
    }

    on('ready', checkInstall);
    on('chat:message', handleInput);
    on('change:graphic:bar1_value', handleBar1Change);
    on('change:campaign:turnorder', handleTurnOrderChange);
    on('destroy:character', handleCharacterDeleted);
    on('destroy:graphic', handleTokenDeleted);

    return {
        getHpZeroConfig: function(characterId) {
            return getHpZeroConfig(characterId, false);
        },
        triggerHpZero: function(tokenId) {
            const token = getObj('graphic', tokenId);

            if (!token) return false;

            const config = getHpZeroConfig(token.get('represents'), false);

            if (!config || !config.enabled) return false;

            activateHpZeroTrigger(token, config);
            return true;
        },
        restoreToken: function(tokenId) {
            const token = getObj('graphic', tokenId);

            if (!token) return false;

            manuallyRestoreToken(token);
            return true;
        },
        getBloodiedConfig: function(characterId) {
            return getBloodiedConfig(characterId, false);
        },
        queueBloodied: function(tokenId) {
            const token = getObj('graphic', tokenId);

            if (!token) return false;

            const config = getBloodiedConfig(token.get('represents'), false);

            if (!config || !config.enabled) return false;

            queueBloodiedTrigger(token);
            return true;
        }
    };
})();
