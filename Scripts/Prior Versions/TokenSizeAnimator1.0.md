/*
================================================================
TokenSizeAnimator v1.0

Animates token width and height while preserving the token's
center point and aspect ratio. Scale values are relative to a
stored baseline size, not cumulative changes to the current size.

Commands:
!tokensize fall --scale|0.25 --duration|3000 --easing|easeIn
!tokensize shrink --scale|0.5 --duration|2000
!tokensize grow --scale|2 --duration|2000
!tokensize animate --scale|1.5 --duration|2000 --easing|easeInOut
!tokensize restore --duration|1500
!tokensize setbase
!tokensize clearbase
!tokensize cancel
!tokensize help

Use selected tokens or add --token|TOKEN_ID.
No external script dependencies.
================================================================
*/

const TokenSizeAnimator = (() => {
    'use strict';

    const SCRIPT = 'TokenSizeAnimator';
    const VERSION = '1.0';
    const COMMAND = '!tokensize';
    const DEFAULT_DURATION = 2000;
    const DEFAULT_EASING = 'easeinout';
    const DEFAULT_SHRINK_SCALE = 0.5;
    const DEFAULT_GROW_SCALE = 2;
    const DEFAULT_FALL_SCALE = 0.25;
    const DEFAULT_FALL_DURATION = 3000;
    const FRAME_INTERVAL = 75;
    const MIN_SCALE = 0.01;
    const MAX_SCALE = 20;
    const MAX_DURATION = 60000;
    const MIN_DIMENSION = 1;

    const activeAnimations = {};
    let nextAnimationId = 1;

    function checkInstall() {
        state.TokenSizeAnimator = state.TokenSizeAnimator || {};
        state.TokenSizeAnimator.tokens = state.TokenSizeAnimator.tokens || {};
        state.TokenSizeAnimator.version = VERSION;

        cleanStoredTokens();

        log('=== ' + SCRIPT + ' v' + VERSION + ' Ready ===');
        log('Commands: ' + COMMAND + ' fall | shrink | grow | animate | restore | setbase | clearbase | cancel | help');
    }

    function cleanStoredTokens() {
        Object.keys(state.TokenSizeAnimator.tokens).forEach(function(tokenId) {
            const token = getObj('graphic', tokenId);
            const baseline = state.TokenSizeAnimator.tokens[tokenId];

            if (!token || !isValidBaseline(baseline)) {
                delete state.TokenSizeAnimator.tokens[tokenId];
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

        state.TokenSizeAnimator.tokens[token.id] = {
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

        const stored = state.TokenSizeAnimator.tokens[token.id];

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
        delete state.TokenSizeAnimator.tokens[tokenId];

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
            '<div><b>Animate to a baseline-relative scale</b><br>' +
                COMMAND + ' animate --scale|0.25 --duration|3000 --easing|easeIn</div>',
            '<div style="margin-top:6px;"><b>Falling preset</b><br>' +
                COMMAND + ' fall --scale|0.25 --duration|3000</div>',
            '<div style="margin-top:6px;"><b>Shrink or grow</b><br>' +
                COMMAND + ' shrink --scale|0.5 --duration|2000<br>' +
                COMMAND + ' grow --scale|2 --duration|2000</div>',
            '<div style="margin-top:6px;"><b>Restore baseline size</b><br>' +
                COMMAND + ' restore --duration|1500</div>',
            '<div style="margin-top:6px;"><b>Baseline and control</b><br>' +
                COMMAND + ' setbase<br>' +
                COMMAND + ' clearbase<br>' +
                COMMAND + ' cancel</div>',
            '<div style="margin-top:6px;">Use selected tokens, or add --token|TOKEN_ID. ' +
                'Easing: linear, easeIn, easeOut, easeInOut.</div>'
        ].join('');

        sendChat(
            SCRIPT,
            '/w gm &{template:default} {{name=' + SCRIPT + ' v' + VERSION + '}} {{Commands=' + body + '}}'
        );
    }

    function handleInput(msg) {
        if (msg.type !== 'api') return;
        if (!new RegExp('^' + COMMAND + '(?:\\s|$)', 'i').test(msg.content)) return;
        if (!playerIsGM(msg.playerid)) return;

        const commandMatch = msg.content.match(/^!tokensize(?:\s+([^\s]+))?/i);
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
        delete state.TokenSizeAnimator.tokens[token.id];
    }

    on('ready', checkInstall);
    on('chat:message', handleInput);
    on('destroy:graphic', handleTokenDestroyed);

    return {
        version: VERSION,
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
