/*
================================================================
TokenAnimator v1.3

Animates token width, height, rotation, movement, and opacity. Size animations
preserve the token's center point and aspect ratio. Scale values are
relative to a stored baseline size, not cumulative changes to the
current size.

Commands:
!tokenanimator move --direction|90 --distance|30 --duration|1000 --easing|easeInOut
!tokenanimator rotate --degrees|360 --duration|2000 --easing|easeInOut
!tokenanimator fall --scale|0.25 --duration|3000 --easing|easeIn
!tokenanimator shrink --scale|0.5 --duration|2000
!tokenanimator grow --scale|2 --duration|2000
!tokenanimator animate --scale|1.5 --duration|2000 --easing|easeInOut
!tokenanimator fadeout --duration|2000 --easing|linear
!tokenanimator fadein --duration|2000 --easing|linear
!tokenanimator fade --opacity|0.35 --duration|2000 --easing|linear
!tokenanimator restore --duration|1500
!tokenanimator setbase
!tokenanimator clearbase
!tokenanimator cancel
!tokenanimator help

Use selected tokens or add --token|TOKEN_ID.
Movement direction uses compass degrees: 0 up, 90 right, 180 down, 270 left.
Named cardinal and intercardinal directions are also supported.
Movement distance uses the page's configured scale units.
Positive degrees rotate clockwise. Negative degrees rotate counterclockwise.
Opacity ranges from 0 (invisible) to 1 (fully visible). Fade commands may use
--complete|delete or --complete|gmlayer after the animation finishes.
The former !tokensize command remains available as a compatibility alias.
No external script dependencies.
================================================================
*/

const TokenAnimator = (() => {
    'use strict';

    const SCRIPT = 'TokenAnimator';
    const VERSION = '1.3';
    const COMMAND = '!tokenanimator';
    const LEGACY_COMMAND = '!tokensize';
    const DEFAULT_DURATION = 2000;
    const DEFAULT_EASING = 'easeinout';
    const DEFAULT_ROTATION_DURATION = 2000;
    const DEFAULT_ROTATION_EASING = 'easeinout';
    const DEFAULT_MOVE_DURATION = 1000;
    const DEFAULT_MOVE_EASING = 'easeinout';
    const DEFAULT_FADE_DURATION = 2000;
    const DEFAULT_FADE_EASING = 'linear';
    const DEFAULT_SHRINK_SCALE = 0.5;
    const DEFAULT_GROW_SCALE = 2;
    const DEFAULT_FALL_SCALE = 0.25;
    const DEFAULT_FALL_DURATION = 3000;
    const FRAME_INTERVAL = 75;
    const ROTATION_FRAME_INTERVAL = 50;
    const MOVEMENT_FRAME_INTERVAL = 50;
    const OPACITY_FRAME_INTERVAL = 50;
    const MIN_SCALE = 0.01;
    const MAX_SCALE = 20;
    const MAX_ROTATION_DEGREES = 36000;
    const MAX_DISTANCE = 100000;
    const MAX_DURATION = 60000;
    const MIN_DIMENSION = 1;
    const MIN_OPACITY = 0;
    const MAX_OPACITY = 1;

    const activeAnimations = {};
    let nextAnimationId = 1;

    function checkInstall() {
        state.TokenAnimator = state.TokenAnimator || {};
        state.TokenAnimator.tokens = state.TokenAnimator.tokens || {};

        if (state.TokenSizeAnimator && state.TokenSizeAnimator.tokens) {
            Object.keys(state.TokenSizeAnimator.tokens).forEach(function(tokenId) {
                if (!state.TokenAnimator.tokens[tokenId]) {
                    state.TokenAnimator.tokens[tokenId] = state.TokenSizeAnimator.tokens[tokenId];
                }
            });
        }

        state.TokenAnimator.version = VERSION;

        cleanStoredTokens();

        log('=== ' + SCRIPT + ' v' + VERSION + ' Ready ===');
        log('Commands: ' + COMMAND + ' move | rotate | fall | shrink | grow | animate | fade | fadein | fadeout | restore | setbase | clearbase | cancel | help');
        log('Compatibility alias: ' + LEGACY_COMMAND);
    }

    function cleanStoredTokens() {
        Object.keys(state.TokenAnimator.tokens).forEach(function(tokenId) {
            const token = getObj('graphic', tokenId);
            const baseline = state.TokenAnimator.tokens[tokenId];

            if (!token || !isValidBaseline(baseline)) {
                delete state.TokenAnimator.tokens[tokenId];
            }
        });
    }

    function isValidDimension(value) {
        const number = parseFloat(value);

        return Number.isFinite(number) && number > 0;
    }

    function isValidBaseline(baseline) {
        return baseline &&
            isValidDimension(baseline.width) &&
            isValidDimension(baseline.height);
    }

    function getTokenDimensions(token) {
        if (!token) return null;

        const width = parseFloat(token.get('width'));
        const height = parseFloat(token.get('height'));

        if (!isValidDimension(width) || !isValidDimension(height)) return null;

        return {
            width: width,
            height: height
        };
    }

    function setBaseline(token) {
        const dimensions = getTokenDimensions(token);

        if (!token || !dimensions) {
            return failure(token ? token.id : '', 'Token dimensions are invalid.');
        }

        cancelAnimation(token.id);

        state.TokenAnimator.tokens[token.id] = {
            width: dimensions.width,
            height: dimensions.height
        };

        return success(token.id, {
            baselineWidth: dimensions.width,
            baselineHeight: dimensions.height
        });
    }

    function getBaseline(token, create) {
        if (!token) return null;

        const stored = state.TokenAnimator.tokens[token.id];

        if (isValidBaseline(stored)) {
            return {
                width: parseFloat(stored.width),
                height: parseFloat(stored.height)
            };
        }

        if (!create) return null;

        const result = setBaseline(token);

        if (!result.ok) return null;

        return {
            width: result.baselineWidth,
            height: result.baselineHeight
        };
    }

    function clearBaseline(tokenId) {
        if (!tokenId) return failure('', 'A token ID is required.');

        cancelAnimation(tokenId);
        delete state.TokenAnimator.tokens[tokenId];

        return success(tokenId);
    }

    function success(tokenId, details) {
        return Object.assign({
            ok: true,
            tokenId: tokenId || ''
        }, details || {});
    }

    function failure(tokenId, error) {
        return {
            ok: false,
            tokenId: tokenId || '',
            error: String(error || 'Unknown error.')
        };
    }

    function normalizeScale(value, fallback) {
        const scale = value === undefined || value === null || value === ''
            ? fallback
            : parseFloat(value);

        if (!Number.isFinite(scale) || scale < MIN_SCALE || scale > MAX_SCALE) {
            return null;
        }

        return scale;
    }

    function normalizeDuration(value, fallback) {
        const duration = value === undefined || value === null || value === ''
            ? fallback
            : parseInt(value, 10);

        if (!Number.isFinite(duration) || duration < 0 || duration > MAX_DURATION) {
            return null;
        }

        return duration;
    }

    function normalizeDegrees(value) {
        const degrees = parseFloat(value);

        if (!Number.isFinite(degrees) ||
            degrees < -MAX_ROTATION_DEGREES ||
            degrees > MAX_ROTATION_DEGREES) {
            return null;
        }

        return degrees;
    }

    function normalizeDirection(value) {
        const raw = String(value === undefined || value === null ? '' : value)
            .trim()
            .toLowerCase();
        const numericDegrees = raw === '' ? NaN : Number(raw);

        if (Number.isFinite(numericDegrees)) {
            if (numericDegrees < -MAX_ROTATION_DEGREES ||
                numericDegrees > MAX_ROTATION_DEGREES) {
                return null;
            }

            return normalizeRotation(numericDegrees);
        }

        const clean = raw.replace(/[\s_-]/g, '');
        const aliases = {
            n: 0,
            north: 0,
            up: 0,
            ne: 45,
            northeast: 45,
            upright: 45,
            e: 90,
            east: 90,
            right: 90,
            se: 135,
            southeast: 135,
            downright: 135,
            s: 180,
            south: 180,
            down: 180,
            sw: 225,
            southwest: 225,
            downleft: 225,
            w: 270,
            west: 270,
            left: 270,
            nw: 315,
            northwest: 315,
            upleft: 315
        };

        if (Object.prototype.hasOwnProperty.call(aliases, clean)) {
            return aliases[clean];
        }

        return null;
    }

    function normalizeDistance(value) {
        const distance = parseFloat(value);

        if (!Number.isFinite(distance) || distance < 0 || distance > MAX_DISTANCE) {
            return null;
        }

        return distance;
    }

    function normalizeOpacity(value) {
        const opacity = parseFloat(value);

        if (!Number.isFinite(opacity) || opacity < MIN_OPACITY || opacity > MAX_OPACITY) {
            return null;
        }

        return opacity;
    }

    function normalizeCompletion(value) {
        const clean = String(value || 'none')
            .trim()
            .toLowerCase()
            .replace(/[\s_-]/g, '');
        const aliases = {
            none: 'none',
            delete: 'delete',
            remove: 'delete',
            gmlayer: 'gmlayer',
            gm: 'gmlayer'
        };

        return aliases[clean] || null;
    }

    function normalizeEasing(value, fallback) {
        const clean = String(value || fallback || DEFAULT_EASING)
            .toLowerCase()
            .replace(/[\s_-]/g, '');

        const aliases = {
            linear: 'linear',
            easein: 'easein',
            in: 'easein',
            easeout: 'easeout',
            out: 'easeout',
            easeinout: 'easeinout',
            inout: 'easeinout'
        };

        return aliases[clean] || null;
    }

    function applyEasing(progress, easing) {
        switch (easing) {
            case 'easein':
                return progress * progress;
            case 'easeout':
                return 1 - Math.pow(1 - progress, 2);
            case 'easeinout':
                return progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            default:
                return progress;
        }
    }

    function roundDimension(value) {
        return Math.max(MIN_DIMENSION, Math.round(value * 100) / 100);
    }

    function normalizeRotation(value) {
        const normalized = value % 360;
        const rounded = Math.round(
            (normalized < 0 ? normalized + 360 : normalized) * 100
        ) / 100;

        return rounded >= 360 ? 0 : rounded;
    }

    function roundOpacity(value) {
        return Math.max(
            MIN_OPACITY,
            Math.min(MAX_OPACITY, Math.round(value * 10000) / 10000)
        );
    }

    function cancelAnimation(tokenId) {
        const active = activeAnimations[tokenId];

        if (!active) return false;

        if (active.timerId) {
            clearTimeout(active.timerId);
        }

        delete activeAnimations[tokenId];
        return true;
    }

    function animateDimensions(token, targetWidth, targetHeight, duration, easing) {
        const start = getTokenDimensions(token);

        if (!token || !start) {
            return failure(token ? token.id : '', 'Token dimensions are invalid.');
        }

        if (!isValidDimension(targetWidth) || !isValidDimension(targetHeight)) {
            return failure(token.id, 'Target dimensions are invalid.');
        }

        cancelAnimation(token.id);

        const finalWidth = roundDimension(targetWidth);
        const finalHeight = roundDimension(targetHeight);
        const animationId = nextAnimationId++;
        const startedAt = Date.now();

        activeAnimations[token.id] = {
            id: animationId,
            timerId: null
        };

        function finish(currentToken) {
            currentToken.set({
                width: finalWidth,
                height: finalHeight
            });

            const active = activeAnimations[token.id];

            if (active && active.id === animationId) {
                delete activeAnimations[token.id];
            }
        }

        function step() {
            const active = activeAnimations[token.id];

            if (!active || active.id !== animationId) return;

            const currentToken = getObj('graphic', token.id);

            if (!currentToken) {
                delete activeAnimations[token.id];
                return;
            }

            const elapsed = Date.now() - startedAt;
            const progress = duration === 0 ? 1 : Math.min(1, elapsed / duration);
            const easedProgress = applyEasing(progress, easing);

            if (progress >= 1) {
                finish(currentToken);
                return;
            }

            currentToken.set({
                width: roundDimension(start.width + (finalWidth - start.width) * easedProgress),
                height: roundDimension(start.height + (finalHeight - start.height) * easedProgress)
            });

            active.timerId = setTimeout(step, FRAME_INTERVAL);
        }

        step();

        return success(token.id, {
            startWidth: start.width,
            startHeight: start.height,
            targetWidth: finalWidth,
            targetHeight: finalHeight,
            duration: duration,
            easing: easing
        });
    }

    function animateRotation(token, degrees, duration, easing) {
        if (!token) {
            return failure('', 'Token not found.');
        }

        const startRotation = parseFloat(token.get('rotation')) || 0;

        cancelAnimation(token.id);

        const animationId = nextAnimationId++;
        const startedAt = Date.now();
        const targetRotation = startRotation + degrees;

        activeAnimations[token.id] = {
            id: animationId,
            timerId: null
        };

        function finish(currentToken) {
            currentToken.set('rotation', normalizeRotation(targetRotation));

            const active = activeAnimations[token.id];

            if (active && active.id === animationId) {
                delete activeAnimations[token.id];
            }
        }

        function step() {
            const active = activeAnimations[token.id];

            if (!active || active.id !== animationId) return;

            const currentToken = getObj('graphic', token.id);

            if (!currentToken) {
                delete activeAnimations[token.id];
                return;
            }

            const elapsed = Date.now() - startedAt;
            const progress = duration === 0 ? 1 : Math.min(1, elapsed / duration);
            const easedProgress = applyEasing(progress, easing);

            if (progress >= 1) {
                finish(currentToken);
                return;
            }

            currentToken.set(
                'rotation',
                normalizeRotation(startRotation + degrees * easedProgress)
            );

            active.timerId = setTimeout(step, ROTATION_FRAME_INTERVAL);
        }

        step();

        return success(token.id, {
            startRotation: normalizeRotation(startRotation),
            degrees: degrees,
            targetRotation: normalizeRotation(targetRotation),
            duration: duration,
            easing: easing
        });
    }

    function getPageScale(token) {
        if (!token) return null;

        const page = getObj('page', token.get('_pageid'));
        const scaleNumber = page ? parseFloat(page.get('scale_number')) : NaN;

        if (!Number.isFinite(scaleNumber) || scaleNumber <= 0) return null;

        return {
            page: page,
            scaleNumber: scaleNumber,
            pixelsPerUnit: 70 / scaleNumber
        };
    }

    function animateMovement(token, direction, distance, duration, easing) {
        if (!token) {
            return failure('', 'Token not found.');
        }

        const pageScale = getPageScale(token);

        if (!pageScale) {
            return failure(token.id, 'The token page has an invalid distance scale.');
        }

        const startLeft = parseFloat(token.get('left'));
        const startTop = parseFloat(token.get('top'));

        if (!Number.isFinite(startLeft) || !Number.isFinite(startTop)) {
            return failure(token.id, 'Token position is invalid.');
        }

        const radians = direction * Math.PI / 180;
        const pixelDistance = distance * pageScale.pixelsPerUnit;
        const targetLeft = startLeft + Math.sin(radians) * pixelDistance;
        const targetTop = startTop - Math.cos(radians) * pixelDistance;

        cancelAnimation(token.id);

        const animationId = nextAnimationId++;
        const startedAt = Date.now();

        activeAnimations[token.id] = {
            id: animationId,
            timerId: null
        };

        function finish(currentToken) {
            currentToken.set({
                left: targetLeft,
                top: targetTop
            });

            const active = activeAnimations[token.id];

            if (active && active.id === animationId) {
                delete activeAnimations[token.id];
            }
        }

        function step() {
            const active = activeAnimations[token.id];

            if (!active || active.id !== animationId) return;

            const currentToken = getObj('graphic', token.id);

            if (!currentToken) {
                delete activeAnimations[token.id];
                return;
            }

            const elapsed = Date.now() - startedAt;
            const progress = duration === 0 ? 1 : Math.min(1, elapsed / duration);
            const easedProgress = applyEasing(progress, easing);

            if (progress >= 1) {
                finish(currentToken);
                return;
            }

            currentToken.set({
                left: startLeft + (targetLeft - startLeft) * easedProgress,
                top: startTop + (targetTop - startTop) * easedProgress
            });

            active.timerId = setTimeout(step, MOVEMENT_FRAME_INTERVAL);
        }

        step();

        return success(token.id, {
            startLeft: startLeft,
            startTop: startTop,
            direction: direction,
            distance: distance,
            scaleNumber: pageScale.scaleNumber,
            targetLeft: targetLeft,
            targetTop: targetTop,
            duration: duration,
            easing: easing
        });
    }

    function animateOpacity(token, targetOpacity, duration, easing, completion) {
        if (!token) {
            return failure('', 'Token not found.');
        }

        const storedOpacity = parseFloat(token.get('baseOpacity'));
        const startOpacity = Number.isFinite(storedOpacity)
            ? Math.max(MIN_OPACITY, Math.min(MAX_OPACITY, storedOpacity))
            : MAX_OPACITY;
        const finalOpacity = roundOpacity(targetOpacity);

        cancelAnimation(token.id);

        const animationId = nextAnimationId++;
        const startedAt = Date.now();

        activeAnimations[token.id] = {
            id: animationId,
            timerId: null
        };

        function finish(currentToken) {
            currentToken.set('baseOpacity', finalOpacity);

            const active = activeAnimations[token.id];

            if (active && active.id === animationId) {
                delete activeAnimations[token.id];
            }

            if (completion === 'delete') {
                currentToken.remove();
            } else if (completion === 'gmlayer') {
                currentToken.set('layer', 'gmlayer');
            }
        }

        function step() {
            const active = activeAnimations[token.id];

            if (!active || active.id !== animationId) return;

            const currentToken = getObj('graphic', token.id);

            if (!currentToken) {
                delete activeAnimations[token.id];
                return;
            }

            const elapsed = Date.now() - startedAt;
            const progress = duration === 0 ? 1 : Math.min(1, elapsed / duration);
            const easedProgress = applyEasing(progress, easing);

            if (progress >= 1) {
                finish(currentToken);
                return;
            }

            currentToken.set(
                'baseOpacity',
                roundOpacity(startOpacity + (finalOpacity - startOpacity) * easedProgress)
            );

            active.timerId = setTimeout(step, OPACITY_FRAME_INTERVAL);
        }

        step();

        return success(token.id, {
            startOpacity: startOpacity,
            targetOpacity: finalOpacity,
            duration: duration,
            easing: easing,
            completion: completion
        });
    }

    function fadeToken(tokenId, options) {
        const token = getObj('graphic', tokenId);

        if (!token) return failure(tokenId, 'Token not found.');

        const config = options || {};
        const opacity = normalizeOpacity(config.opacity);
        const duration = normalizeDuration(config.duration, DEFAULT_FADE_DURATION);
        const easing = normalizeEasing(config.easing, DEFAULT_FADE_EASING);
        const completion = normalizeCompletion(config.complete);

        if (opacity === null) {
            return failure(tokenId, 'Opacity must be a number between 0 and 1.');
        }

        if (duration === null) {
            return failure(tokenId, 'Duration must be between 0 and ' + MAX_DURATION + ' milliseconds.');
        }

        if (!easing) {
            return failure(tokenId, 'Easing must be linear, easeIn, easeOut, or easeInOut.');
        }

        if (!completion) {
            return failure(tokenId, 'Complete must be none, delete, or gmlayer.');
        }

        return animateOpacity(token, opacity, duration, easing, completion);
    }

    function moveToken(tokenId, options) {
        const token = getObj('graphic', tokenId);

        if (!token) return failure(tokenId, 'Token not found.');

        const config = options || {};
        const direction = normalizeDirection(config.direction);
        const distance = normalizeDistance(config.distance);
        const duration = normalizeDuration(config.duration, DEFAULT_MOVE_DURATION);
        const easing = normalizeEasing(config.easing, DEFAULT_MOVE_EASING);

        if (direction === null) {
            return failure(
                tokenId,
                'Direction must be compass degrees or a named direction such as north, southeast, or left.'
            );
        }

        if (distance === null) {
            return failure(tokenId, 'Distance must be between 0 and ' + MAX_DISTANCE + ' page units.');
        }

        if (duration === null) {
            return failure(tokenId, 'Duration must be between 0 and ' + MAX_DURATION + ' milliseconds.');
        }

        if (!easing) {
            return failure(tokenId, 'Easing must be linear, easeIn, easeOut, or easeInOut.');
        }

        return animateMovement(token, direction, distance, duration, easing);
    }

    function rotateToken(tokenId, options) {
        const token = getObj('graphic', tokenId);

        if (!token) return failure(tokenId, 'Token not found.');

        const config = options || {};
        const degrees = normalizeDegrees(config.degrees);
        const duration = normalizeDuration(config.duration, DEFAULT_ROTATION_DURATION);
        const easing = normalizeEasing(config.easing, DEFAULT_ROTATION_EASING);

        if (degrees === null) {
            return failure(
                tokenId,
                'Degrees must be a number between -' +
                    MAX_ROTATION_DEGREES +
                    ' and ' +
                    MAX_ROTATION_DEGREES +
                    '.'
            );
        }

        if (duration === null) {
            return failure(tokenId, 'Duration must be between 0 and ' + MAX_DURATION + ' milliseconds.');
        }

        if (!easing) {
            return failure(tokenId, 'Easing must be linear, easeIn, easeOut, or easeInOut.');
        }

        return animateRotation(token, degrees, duration, easing);
    }

    function animateToScale(tokenId, options) {
        const token = getObj('graphic', tokenId);

        if (!token) return failure(tokenId, 'Token not found.');

        const config = options || {};
        const scale = normalizeScale(config.scale, null);
        const duration = normalizeDuration(config.duration, DEFAULT_DURATION);
        const easing = normalizeEasing(config.easing, DEFAULT_EASING);

        if (scale === null) {
            return failure(tokenId, 'Scale must be between ' + MIN_SCALE + ' and ' + MAX_SCALE + '.');
        }

        if (duration === null) {
            return failure(tokenId, 'Duration must be between 0 and ' + MAX_DURATION + ' milliseconds.');
        }

        if (!easing) {
            return failure(tokenId, 'Easing must be linear, easeIn, easeOut, or easeInOut.');
        }

        const baseline = getBaseline(token, true);

        if (!baseline) return failure(tokenId, 'Could not store the token baseline size.');

        return animateDimensions(
            token,
            baseline.width * scale,
            baseline.height * scale,
            duration,
            easing
        );
    }

    function restoreToken(tokenId, options) {
        const token = getObj('graphic', tokenId);

        if (!token) return failure(tokenId, 'Token not found.');

        const baseline = getBaseline(token, false);

        if (!baseline) {
            return failure(tokenId, 'No baseline size is stored. Use setbase or animate the token first.');
        }

        const config = options || {};
        const duration = normalizeDuration(config.duration, DEFAULT_DURATION);
        const easing = normalizeEasing(config.easing, 'easeout');

        if (duration === null) {
            return failure(tokenId, 'Duration must be between 0 and ' + MAX_DURATION + ' milliseconds.');
        }

        if (!easing) {
            return failure(tokenId, 'Easing must be linear, easeIn, easeOut, or easeInOut.');
        }

        return animateDimensions(
            token,
            baseline.width,
            baseline.height,
            duration,
            easing
        );
    }

    function parseOptions(content) {
        const options = {};
        const optionPattern = /--([a-z][a-z0-9_-]*)\|([\s\S]*?)(?=\s+--[a-z][a-z0-9_-]*\||$)/gi;
        let match;

        while ((match = optionPattern.exec(content)) !== null) {
            options[match[1].toLowerCase()] = String(match[2] || '').trim();
        }

        return options;
    }

    function getSelectedTokens(msg, options) {
        const explicitIds = String(options.token || options.tokens || options.target || '')
            .split(/[\s,]+/)
            .map(function(tokenId) {
                return tokenId.trim();
            })
            .filter(Boolean);
        const tokenIds = explicitIds.length
            ? explicitIds
            : (msg.selected || [])
                .filter(function(selection) {
                    return selection._type === 'graphic';
                })
                .map(function(selection) {
                    return selection._id;
                });
        const seen = {};

        return tokenIds
            .filter(function(tokenId) {
                if (seen[tokenId]) return false;

                seen[tokenId] = true;
                return true;
            })
            .map(function(tokenId) {
                return getObj('graphic', tokenId);
            })
            .filter(Boolean);
    }

    function tokenName(token) {
        return String(token && token.get('name') || 'Token');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function whisper(message) {
        sendChat(SCRIPT, '/w gm ' + message);
    }

    function reportResults(action, tokens, results) {
        const failures = results.filter(function(result) {
            return !result.ok;
        });

        if (!failures.length) return;

        const details = failures.map(function(result) {
            const token = tokens.find(function(candidate) {
                return candidate.id === result.tokenId;
            });

            return escapeHtml(tokenName(token)) + ': ' + escapeHtml(result.error);
        }).join('<br>');

        whisper(escapeHtml(action) + ' failed for:<br>' + details);
    }

    function showHelp() {
        const body = [
            '<div><b>Move in a direction and distance</b><br>' +
                COMMAND + ' move --direction|90 --distance|30 --duration|1000 --easing|easeInOut<br>' +
                '0 is up, 90 right, 180 down, and 270 left. Named directions also work. ' +
                'Distance uses the page scale.</div>',
            '<div style="margin-top:6px;"><b>Rotate from the current facing</b><br>' +
                COMMAND + ' rotate --degrees|360 --duration|2000 --easing|easeInOut<br>' +
                'Positive is clockwise; negative is counterclockwise.</div>',
            '<div><b>Animate to a baseline-relative scale</b><br>' +
                COMMAND + ' animate --scale|0.25 --duration|3000 --easing|easeIn</div>',
            '<div style="margin-top:6px;"><b>Falling preset</b><br>' +
                COMMAND + ' fall --scale|0.25 --duration|3000</div>',
            '<div style="margin-top:6px;"><b>Shrink or grow</b><br>' +
                COMMAND + ' shrink --scale|0.5 --duration|2000<br>' +
                COMMAND + ' grow --scale|2 --duration|2000</div>',
            '<div style="margin-top:6px;"><b>Fade token opacity</b><br>' +
                COMMAND + ' fadeout --duration|2000 --easing|linear<br>' +
                COMMAND + ' fadein --duration|2000 --easing|linear<br>' +
                COMMAND + ' fade --opacity|0.35 --duration|2000 --easing|linear<br>' +
                'Opacity is 0 (invisible) through 1 (fully visible). Optional completion: ' +
                '--complete|delete or --complete|gmlayer.</div>',
            '<div style="margin-top:6px;"><b>Restore baseline size</b><br>' +
                COMMAND + ' restore --duration|1500</div>',
            '<div style="margin-top:6px;"><b>Baseline and control</b><br>' +
                COMMAND + ' setbase<br>' +
                COMMAND + ' clearbase<br>' +
                COMMAND + ' cancel</div>',
            '<div style="margin-top:6px;">Use selected tokens, or add --token|TOKEN_ID. ' +
                'Easing: linear, easeIn, easeOut, easeInOut. ' +
                LEGACY_COMMAND + ' remains available for existing macros.</div>'
        ].join('');

        sendChat(
            SCRIPT,
            '/w gm &{template:default} {{name=' + SCRIPT + ' v' + VERSION + '}} {{Commands=' + body + '}}'
        );
    }

    function handleInput(msg) {
        if (msg.type !== 'api') return;
        if (!/^!(?:tokenanimator|tokensize)(?:\s|$)/i.test(msg.content)) return;
        if (!playerIsGM(msg.playerid)) return;

        const commandMatch = msg.content.match(/^!(?:tokenanimator|tokensize)(?:\s+([^\s]+))?/i);
        const command = String(commandMatch && commandMatch[1] || 'help').toLowerCase();
        const options = parseOptions(msg.content);

        if (command === 'help') {
            showHelp();
            return;
        }

        const tokens = getSelectedTokens(msg, options);

        if (!tokens.length) {
            whisper('Select at least one token or supply --token|TOKEN_ID.');
            return;
        }

        let results = [];

        if (command === 'setbase') {
            results = tokens.map(setBaseline);
            reportResults('Set baseline', tokens, results);
            return;
        }

        if (command === 'clearbase') {
            results = tokens.map(function(token) {
                return clearBaseline(token.id);
            });
            reportResults('Clear baseline', tokens, results);
            return;
        }

        if (command === 'cancel') {
            tokens.forEach(function(token) {
                cancelAnimation(token.id);
            });
            return;
        }

        if (command === 'restore') {
            results = tokens.map(function(token) {
                return restoreToken(token.id, {
                    duration: options.duration,
                    easing: options.easing
                });
            });
            reportResults('Restore', tokens, results);
            return;
        }

        if (command === 'rotate') {
            const requestedDegrees = options.degrees === undefined
                ? options.rotation
                : options.degrees;

            results = tokens.map(function(token) {
                return rotateToken(token.id, {
                    degrees: requestedDegrees,
                    duration: options.duration,
                    easing: options.easing
                });
            });
            reportResults('Rotate', tokens, results);
            return;
        }

        if (command === 'move') {
            const requestedDirection = options.direction === undefined
                ? options.degrees
                : options.direction;

            results = tokens.map(function(token) {
                return moveToken(token.id, {
                    direction: requestedDirection,
                    distance: options.distance,
                    duration: options.duration,
                    easing: options.easing
                });
            });
            reportResults('Move', tokens, results);
            return;
        }

        if (command === 'fade' || command === 'fadein' || command === 'fadeout') {
            const requestedOpacity = command === 'fadein'
                ? 1
                : command === 'fadeout'
                    ? 0
                    : options.opacity;

            results = tokens.map(function(token) {
                return fadeToken(token.id, {
                    opacity: requestedOpacity,
                    duration: options.duration,
                    easing: options.easing,
                    complete: options.complete
                });
            });
            reportResults(command, tokens, results);
            return;
        }

        const defaults = {
            animate: {
                scale: null,
                duration: DEFAULT_DURATION,
                easing: DEFAULT_EASING
            },
            shrink: {
                scale: DEFAULT_SHRINK_SCALE,
                duration: DEFAULT_DURATION,
                easing: DEFAULT_EASING
            },
            grow: {
                scale: DEFAULT_GROW_SCALE,
                duration: DEFAULT_DURATION,
                easing: DEFAULT_EASING
            },
            fall: {
                scale: DEFAULT_FALL_SCALE,
                duration: DEFAULT_FALL_DURATION,
                easing: 'easein'
            }
        };

        if (!defaults[command]) {
            showHelp();
            return;
        }

        const commandDefaults = defaults[command];
        const requestedScale = options.scale === undefined
            ? commandDefaults.scale
            : options.scale;

        results = tokens.map(function(token) {
            return animateToScale(token.id, {
                scale: requestedScale,
                duration: options.duration === undefined
                    ? commandDefaults.duration
                    : options.duration,
                easing: options.easing || commandDefaults.easing
            });
        });

        reportResults(command, tokens, results);
    }

    function handleTokenDestroyed(token) {
        if (!token) return;

        cancelAnimation(token.id);
        delete state.TokenAnimator.tokens[token.id];
    }

    on('ready', checkInstall);
    on('chat:message', handleInput);
    on('destroy:graphic', handleTokenDestroyed);

    return {
        version: VERSION,
        move: function(tokenId, options) {
            return moveToken(tokenId, options);
        },
        rotate: function(tokenId, options) {
            return rotateToken(tokenId, options);
        },
        fade: function(tokenId, options) {
            return fadeToken(tokenId, options);
        },
        fadeIn: function(tokenId, options) {
            const config = Object.assign({}, options || {}, {
                opacity: 1
            });

            return fadeToken(tokenId, config);
        },
        fadeOut: function(tokenId, options) {
            const config = Object.assign({}, options || {}, {
                opacity: 0
            });

            return fadeToken(tokenId, config);
        },
        animate: function(tokenId, options) {
            return animateToScale(tokenId, options);
        },
        fall: function(tokenId, options) {
            const config = options || {};

            return animateToScale(tokenId, {
                scale: config.scale === undefined ? DEFAULT_FALL_SCALE : config.scale,
                duration: config.duration === undefined ? DEFAULT_FALL_DURATION : config.duration,
                easing: config.easing || 'easein'
            });
        },
        restore: function(tokenId, options) {
            return restoreToken(tokenId, options);
        },
        cancel: function(tokenId) {
            return success(tokenId, {
                cancelled: cancelAnimation(tokenId)
            });
        },
        setBase: function(tokenId) {
            const token = getObj('graphic', tokenId);

            if (!token) return failure(tokenId, 'Token not found.');

            return setBaseline(token);
        },
        clearBase: function(tokenId) {
            return clearBaseline(tokenId);
        },
        getBase: function(tokenId) {
            const token = getObj('graphic', tokenId);
            const baseline = token ? getBaseline(token, false) : null;

            if (!token) return failure(tokenId, 'Token not found.');
            if (!baseline) return failure(tokenId, 'No baseline size is stored.');

            return success(tokenId, {
                baselineWidth: baseline.width,
                baselineHeight: baseline.height
            });
        }
    };
})();
