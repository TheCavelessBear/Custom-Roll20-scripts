/*
================================================================
TokenAnimator v1.4

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
!tokenanimator animate --scale|1.5 --degrees|360 --direction|90 --distance|30 --opacity|0.35 --duration|2000 --easing|easeInOut --complete|gmlayer
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
The animate command may combine any supported scale, rotation, movement, and
opacity properties in one shared animation. Use --degrees (or --rotation) for
rotation. Movement requires both --direction and --distance. Opacity ranges
from 0 (invisible) to 1 (fully visible). Fade and animate commands may use
--complete|delete or --complete|gmlayer after the animation finishes.
The former !tokensize command remains available as a compatibility alias.
No external script dependencies.
================================================================
*/

const TokenAnimator = (() => {
    'use strict';

    const SCRIPT = 'TokenAnimator';
    const VERSION = '1.4';
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
    const ANIMATION_FRAME_INTERVAL = 50;
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

    function planAnimation(token, options, requestedTokenId) {
        const config = options || {};
        const hasScale = config.scale !== undefined;
        const hasTargetDimensions = config.targetDimensions !== undefined;
        const hasDegrees = config.degrees !== undefined;
        const hasRotation = config.rotation !== undefined;
        const hasRotationProperty = hasDegrees || hasRotation;
        const hasDirection = config.direction !== undefined;
        const hasDistance = config.distance !== undefined;
        const hasMovement = hasDirection || hasDistance;
        const hasOpacity = config.opacity !== undefined;
        const duration = normalizeDuration(config.duration, DEFAULT_DURATION);
        const easing = normalizeEasing(config.easing, DEFAULT_EASING);
        const completion = normalizeCompletion(config.complete);
        const plan = {
            token: token,
            duration: duration,
            easing: easing,
            completion: completion
        };

        if (!token) return failure(requestedTokenId || '', 'Token not found.');
        if (!hasScale && !hasTargetDimensions && !hasRotationProperty && !hasMovement && !hasOpacity) {
            return failure(token.id, 'Animate requires scale, degrees, direction and distance, or opacity.');
        }
        if (hasScale && hasTargetDimensions) {
            return failure(token.id, 'Scale and target dimensions cannot be animated together.');
        }
        if (hasMovement && (!hasDirection || !hasDistance)) {
            return failure(token.id, 'Movement requires both direction and distance.');
        }
        if (duration === null) {
            return failure(token.id, 'Duration must be between 0 and ' + MAX_DURATION + ' milliseconds.');
        }
        if (!easing) {
            return failure(token.id, 'Easing must be linear, easeIn, easeOut, or easeInOut.');
        }
        if (!completion) {
            return failure(token.id, 'Complete must be none, delete, or gmlayer.');
        }

        if (hasScale || hasTargetDimensions) {
            const startDimensions = getTokenDimensions(token);

            if (!startDimensions) {
                return failure(token.id, 'Token dimensions are invalid.');
            }

            if (hasScale) {
                const scale = normalizeScale(config.scale, null);
                const storedBaseline = getBaseline(token, false);
                const baseline = storedBaseline || startDimensions;

                if (scale === null) {
                    return failure(token.id, 'Scale must be between ' + MIN_SCALE + ' and ' + MAX_SCALE + '.');
                }
                if (!isValidBaseline(baseline)) {
                    return failure(token.id, 'Could not store the token baseline size.');
                }

                plan.dimensions = {
                    startWidth: startDimensions.width,
                    startHeight: startDimensions.height,
                    targetWidth: roundDimension(baseline.width * scale),
                    targetHeight: roundDimension(baseline.height * scale)
                };
                if (!storedBaseline) {
                    plan.baseline = {
                        width: baseline.width,
                        height: baseline.height
                    };
                }
            } else {
                const targetDimensions = config.targetDimensions || {};

                if (!isValidDimension(targetDimensions.width) ||
                    !isValidDimension(targetDimensions.height)) {
                    return failure(token.id, 'Target dimensions are invalid.');
                }

                plan.dimensions = {
                    startWidth: startDimensions.width,
                    startHeight: startDimensions.height,
                    targetWidth: roundDimension(targetDimensions.width),
                    targetHeight: roundDimension(targetDimensions.height)
                };
            }
        }

        if (hasRotationProperty) {
            const degrees = hasDegrees ? normalizeDegrees(config.degrees) : null;
            const rotation = hasRotation ? normalizeDegrees(config.rotation) : null;

            if ((hasDegrees && degrees === null) || (hasRotation && rotation === null)) {
                return failure(
                    token.id,
                    'Degrees must be a number between -' +
                        MAX_ROTATION_DEGREES +
                        ' and ' +
                        MAX_ROTATION_DEGREES +
                        '.'
                );
            }
            if (hasDegrees && hasRotation && degrees !== rotation) {
                return failure(token.id, 'Degrees and rotation must match when both are supplied.');
            }

            plan.rotation = {
                startRotation: parseFloat(token.get('rotation')) || 0,
                degrees: hasDegrees ? degrees : rotation
            };
            plan.rotation.targetRotation = plan.rotation.startRotation + plan.rotation.degrees;
        }

        if (hasMovement) {
            const direction = normalizeDirection(config.direction);
            const distance = normalizeDistance(config.distance);
            const pageScale = getPageScale(token);
            const startLeft = parseFloat(token.get('left'));
            const startTop = parseFloat(token.get('top'));

            if (direction === null) {
                return failure(
                    token.id,
                    'Direction must be compass degrees or a named direction such as north, southeast, or left.'
                );
            }
            if (distance === null) {
                return failure(token.id, 'Distance must be between 0 and ' + MAX_DISTANCE + ' page units.');
            }
            if (!pageScale) {
                return failure(token.id, 'The token page has an invalid distance scale.');
            }
            if (!Number.isFinite(startLeft) || !Number.isFinite(startTop)) {
                return failure(token.id, 'Token position is invalid.');
            }

            const radians = direction * Math.PI / 180;
            const pixelDistance = distance * pageScale.pixelsPerUnit;

            plan.movement = {
                startLeft: startLeft,
                startTop: startTop,
                direction: direction,
                distance: distance,
                scaleNumber: pageScale.scaleNumber,
                targetLeft: startLeft + Math.sin(radians) * pixelDistance,
                targetTop: startTop - Math.cos(radians) * pixelDistance
            };
        }

        if (hasOpacity) {
            const targetOpacity = normalizeOpacity(config.opacity);
            const storedOpacity = parseFloat(token.get('baseOpacity'));

            if (targetOpacity === null) {
                return failure(token.id, 'Opacity must be a number between 0 and 1.');
            }

            plan.opacity = {
                startOpacity: Number.isFinite(storedOpacity)
                    ? Math.max(MIN_OPACITY, Math.min(MAX_OPACITY, storedOpacity))
                    : MAX_OPACITY,
                targetOpacity: roundOpacity(targetOpacity)
            };
        }

        return plan;
    }

    function getAnimationProperties(plan, easedProgress, final) {
        const properties = {};

        if (plan.dimensions) {
            properties.width = final
                ? plan.dimensions.targetWidth
                : roundDimension(
                    plan.dimensions.startWidth +
                    (plan.dimensions.targetWidth - plan.dimensions.startWidth) * easedProgress
                );
            properties.height = final
                ? plan.dimensions.targetHeight
                : roundDimension(
                    plan.dimensions.startHeight +
                    (plan.dimensions.targetHeight - plan.dimensions.startHeight) * easedProgress
                );
        }
        if (plan.rotation) {
            properties.rotation = final
                ? normalizeRotation(plan.rotation.targetRotation)
                : normalizeRotation(
                    plan.rotation.startRotation + plan.rotation.degrees * easedProgress
                );
        }
        if (plan.movement) {
            properties.left = final
                ? plan.movement.targetLeft
                : plan.movement.startLeft +
                    (plan.movement.targetLeft - plan.movement.startLeft) * easedProgress;
            properties.top = final
                ? plan.movement.targetTop
                : plan.movement.startTop +
                    (plan.movement.targetTop - plan.movement.startTop) * easedProgress;
        }
        if (plan.opacity) {
            properties.baseOpacity = final
                ? plan.opacity.targetOpacity
                : roundOpacity(
                    plan.opacity.startOpacity +
                    (plan.opacity.targetOpacity - plan.opacity.startOpacity) * easedProgress
                );
        }

        return properties;
    }

    function animationResult(plan) {
        const details = {
            duration: plan.duration,
            easing: plan.easing
        };

        if (plan.dimensions) {
            details.startWidth = plan.dimensions.startWidth;
            details.startHeight = plan.dimensions.startHeight;
            details.targetWidth = plan.dimensions.targetWidth;
            details.targetHeight = plan.dimensions.targetHeight;
        }
        if (plan.rotation) {
            details.startRotation = normalizeRotation(plan.rotation.startRotation);
            details.degrees = plan.rotation.degrees;
            details.targetRotation = normalizeRotation(plan.rotation.targetRotation);
        }
        if (plan.movement) {
            details.startLeft = plan.movement.startLeft;
            details.startTop = plan.movement.startTop;
            details.direction = plan.movement.direction;
            details.distance = plan.movement.distance;
            details.scaleNumber = plan.movement.scaleNumber;
            details.targetLeft = plan.movement.targetLeft;
            details.targetTop = plan.movement.targetTop;
        }
        if (plan.opacity) {
            details.startOpacity = plan.opacity.startOpacity;
            details.targetOpacity = plan.opacity.targetOpacity;
        }
        if (plan.opacity || plan.completion !== 'none') {
            details.completion = plan.completion;
        }

        return success(plan.token.id, details);
    }

    function animateProperties(token, options, requestedTokenId) {
        const plan = planAnimation(token, options, requestedTokenId);

        if (!plan.token) return plan;

        if (plan.baseline) {
            state.TokenAnimator.tokens[token.id] = {
                width: plan.baseline.width,
                height: plan.baseline.height
            };
        }

        cancelAnimation(token.id);

        const animationId = nextAnimationId++;
        const startedAt = Date.now();

        activeAnimations[token.id] = {
            id: animationId,
            timerId: null
        };

        function finish(currentToken) {
            currentToken.set(getAnimationProperties(plan, 1, true));

            const active = activeAnimations[token.id];

            if (active && active.id === animationId) {
                delete activeAnimations[token.id];
            }

            if (plan.completion === 'delete') {
                currentToken.remove();
            } else if (plan.completion === 'gmlayer') {
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
            const progress = plan.duration === 0 ? 1 : Math.min(1, elapsed / plan.duration);

            if (progress >= 1) {
                finish(currentToken);
                return;
            }

            currentToken.set(getAnimationProperties(plan, applyEasing(progress, plan.easing), false));
            active.timerId = setTimeout(step, ANIMATION_FRAME_INTERVAL);
        }

        step();

        return animationResult(plan);
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

        return animateProperties(token, {
            opacity: opacity,
            duration: duration,
            easing: easing,
            complete: completion
        });
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

        return animateProperties(token, {
            direction: direction,
            distance: distance,
            duration: duration,
            easing: easing
        });
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

        return animateProperties(token, {
            degrees: degrees,
            duration: duration,
            easing: easing
        });
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

        return animateProperties(token, {
            scale: scale,
            duration: duration,
            easing: easing
        });
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

        return animateProperties(token, {
            targetDimensions: baseline,
            duration: duration,
            easing: easing
        });
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
                COMMAND + ' animate --scale|0.25 --degrees|360 --direction|90 --distance|30 ' +
                '--opacity|0.35 --duration|3000 --easing|easeIn<br>' +
                'Combine any properties in one animation. --rotation is an alias for --degrees. ' +
                'Movement requires both --direction and --distance. Optional completion: ' +
                '--complete|delete or --complete|gmlayer.</div>',
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

        if (command === 'animate') {
            results = tokens.map(function(token) {
                return animateProperties(token, {
                    scale: options.scale,
                    degrees: options.degrees,
                    rotation: options.rotation,
                    direction: options.direction,
                    distance: options.distance,
                    opacity: options.opacity,
                    duration: options.duration,
                    easing: options.easing,
                    complete: options.complete
                });
            });
            reportResults('Animate', tokens, results);
            return;
        }

        const defaults = {
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
            const token = getObj('graphic', tokenId);

            return animateProperties(token, options, tokenId);
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
