const AoEBoom = (() => {
    const BOOM = 'AoEBoom';

    const DEFAULT_COLOR = '#ff6600';
    const DEFAULT_FILL = 'rgba(255,102,0,0.20)';
    const DEFAULT_STROKE_WIDTH = 3;
    const DEFAULT_SEGMENTS = 24;

    function checkInstall() {
        state.AoEBoom = state.AoEBoom || {};
        state.AoEBoom.templates = state.AoEBoom.templates || {};
        log('=== AoEBoom Ready ===');
    }

    function sendHelp() {
        sendChat(
            BOOM,
            '/w gm &{template:default} ' +
            '{{name=AoEBoom Commands}} ' +
            '{{Cone=!boom cone CASTER_TOKEN_ID RANGE_FT ANGLE_DEG SAVE DC DAMAGE TYPE SUCCESS --source SOURCE_TOKEN_ID --title TITLE}} ' +
            '{{Apply=!boom apply TEMPLATE_ID}} ' +
            '{{Clear=!boom clear TEMPLATE_ID}}'
        );
    }

    function getOptionValue(args, optionName) {
        const index = args.indexOf(optionName);
        if (index === -1) return null;
        return args[index + 1] || null;
    }

    function getOptionWords(args, optionName) {
        const index = args.indexOf(optionName);
        if (index === -1) return null;

        const words = [];
        for (let i = index + 1; i < args.length; i++) {
            if (String(args[i]).indexOf('--') === 0) break;
            words.push(args[i]);
        }

        return words.length ? words.join(' ') : null;
    }

    function getPageScale(token) {
        const page = getObj('page', token.get('_pageid'));
        if (!page) return 5;
        return parseFloat(page.get('scale_number')) || 5;
    }

    function feetToPixels(token, feet) {
        return Number(feet) * 70 / getPageScale(token);
    }

    function parseRangeFeet(value) {
        const match = String(value || '').match(/-?\d+(\.\d+)?/);
        if (!match) return null;

        const numberValue = parseFloat(match[0]);
        return isNaN(numberValue) ? null : numberValue;
    }

    function normalizeTitle(title) {
        return String(title || 'AoE Boom').replace(/_/g, ' ');
    }

    function normalizeDamageType(type) {
        if (!type) return null;

        const clean = String(type).trim();
        return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }

    function rollDamageFormula(formula) {
        const cleanFormula = String(formula || '').replace(/\s+/g, '');
        const parts = cleanFormula.match(/[+-]?[^+-]+/g);

        if (!parts || !parts.length) return null;

        let total = 0;
        const detail = [];

        for (const part of parts) {
            const sign = part.charAt(0) === '-' ? -1 : 1;
            const cleanPart = part.replace(/^[+-]/, '');
            const diceMatch = cleanPart.match(/^(\d*)d(\d+)$/i);

            if (diceMatch) {
                const count = parseInt(diceMatch[1] || '1', 10);
                const sides = parseInt(diceMatch[2], 10);
                const rolls = [];

                if (isNaN(count) || isNaN(sides) || count <= 0 || sides <= 0) return null;

                for (let i = 0; i < count; i++) {
                    rolls.push(randomInteger(sides));
                }

                const subtotal = rolls.reduce((sum, value) => sum + value, 0) * sign;
                total += subtotal;
                detail.push((sign < 0 ? '-' : '') + cleanPart + ' [' + rolls.join(', ') + ']');
                continue;
            }

            const numberValue = parseInt(cleanPart, 10);

            if (isNaN(numberValue)) return null;

            total += numberValue * sign;
            detail.push(part);
        }

        return {
            total: total,
            detail: detail.join(' ')
        };
    }

    function directionFromRotation(rotationDegrees) {
        const radians = (Number(rotationDegrees || 0) + 180) * Math.PI / 180;

        return {
            x: Math.sin(radians),
            y: -Math.cos(radians)
        };
    }

    function rotatePoint(point, radians) {
        return {
            x: point.x * Math.cos(radians) - point.y * Math.sin(radians),
            y: point.x * Math.sin(radians) + point.y * Math.cos(radians)
        };
    }

    function buildWallWorldPoints(origin, lengthPixels, widthPixels, rotationDegrees) {
        const direction = directionFromRotation(rotationDegrees);
        const perpendicular = {
            x: -direction.y,
            y: direction.x
        };

        const halfLength = lengthPixels / 2;
        const halfWidth = widthPixels / 2;

        return [
            {
                x: origin.x - direction.x * halfLength - perpendicular.x * halfWidth,
                y: origin.y - direction.y * halfLength - perpendicular.y * halfWidth
            },
            {
                x: origin.x + direction.x * halfLength - perpendicular.x * halfWidth,
                y: origin.y + direction.y * halfLength - perpendicular.y * halfWidth
            },
            {
                x: origin.x + direction.x * halfLength + perpendicular.x * halfWidth,
                y: origin.y + direction.y * halfLength + perpendicular.y * halfWidth
            },
            {
                x: origin.x - direction.x * halfLength + perpendicular.x * halfWidth,
                y: origin.y - direction.y * halfLength + perpendicular.y * halfWidth
            },
            {
                x: origin.x - direction.x * halfLength - perpendicular.x * halfWidth,
                y: origin.y - direction.y * halfLength - perpendicular.y * halfWidth
            }
        ];
    }

    function createWallPath(caster, lengthFeet, widthFeet, title, color, fill) {
        const lengthPixels = feetToPixels(caster, lengthFeet);
        const widthPixels = feetToPixels(caster, widthFeet);
        const rotation = Number(caster.get('rotation')) || 0;
        const origin = {
            x: caster.get('left'),
            y: caster.get('top')
        };

        const worldPoints = buildWallWorldPoints(origin, lengthPixels, widthPixels, rotation);
        const arrowSegments = buildWallArrowSegments(origin, lengthPixels, widthPixels, rotation);
        const box = getBoundingBox(worldPoints);

        const path = createObj('path', {
            pageid: caster.get('_pageid'),
            layer: 'objects',
            stroke: color || DEFAULT_COLOR,
            fill: fill || DEFAULT_FILL,
            stroke_width: DEFAULT_STROKE_WIDTH,
            width: Math.max(1, box.width),
            height: Math.max(1, box.height),
            left: (box.minX + box.maxX) / 2,
            top: (box.minY + box.maxY) / 2,
            rotation: 0,
            _path: JSON.stringify(buildRoll20PathSegments([worldPoints].concat(arrowSegments), box))
        });

        if (path) {
            path.set('controlledby', caster.get('controlledby') || '');
        }

        return {
            path: path,
            lengthPixels: lengthPixels,
            widthPixels: widthPixels,
            rotation: rotation
        };
    }

    function buildConeWorldPoints(origin, radiusPixels, angleDegrees, rotationDegrees) {
        const halfAngle = Number(angleDegrees) / 2;
        const baseDirection = directionFromRotation(rotationDegrees);
        const points = [{ x: origin.x, y: origin.y }];

        for (let i = 0; i <= DEFAULT_SEGMENTS; i++) {
            const offset = (-halfAngle + (Number(angleDegrees) * i / DEFAULT_SEGMENTS)) * Math.PI / 180;
            const cos = Math.cos(offset);
            const sin = Math.sin(offset);

            const direction = {
                x: baseDirection.x * cos + baseDirection.y * sin,
                y: baseDirection.y * cos - baseDirection.x * sin
            };

            points.push({
                x: origin.x + direction.x * radiusPixels,
                y: origin.y + direction.y * radiusPixels
            });
        }

        points.push({ x: origin.x, y: origin.y });
        return points;
    }

    function getBoundingBox(points) {
        const xs = points.map(point => point.x);
        const ys = points.map(point => point.y);

        const minX = Math.min.apply(null, xs);
        const maxX = Math.max.apply(null, xs);
        const minY = Math.min.apply(null, ys);
        const maxY = Math.max.apply(null, ys);

        return {
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    function buildRoll20Path(points, box) {
        return points.map((point, index) => {
            const command = index === 0 ? 'M' : 'L';

            return [
                command,
                point.x - box.minX,
                point.y - box.minY
            ];
        });
    }

    function buildRoll20PathSegments(segments, box) {
        return segments.reduce(function(commands, points) {
            return commands.concat(points.map(function(point, index) {
                return [
                    index === 0 ? 'M' : 'L',
                    point.x - box.minX,
                    point.y - box.minY
                ];
            }));
        }, []);
    }

    function buildWallArrowSegments(origin, lengthPixels, widthPixels, rotationDegrees) {
        const direction = directionFromRotation(rotationDegrees);
        const perpendicular = {
            x: -direction.y,
            y: direction.x
        };
        const halfWidth = widthPixels / 2;
        const shaftStart = {
            x: origin.x + perpendicular.x * halfWidth * 0.55,
            y: origin.y + perpendicular.y * halfWidth * 0.55
        };
        const arrowTip = {
            x: origin.x - perpendicular.x * halfWidth * 0.78,
            y: origin.y - perpendicular.y * halfWidth * 0.78
        };
        const chevronBase = {
            x: origin.x - perpendicular.x * halfWidth * 0.32,
            y: origin.y - perpendicular.y * halfWidth * 0.32
        };
        const wingLength = Math.min(lengthPixels * 0.08, Math.max(widthPixels * 0.42, 8));

        return [
            [shaftStart, arrowTip],
            [
                arrowTip,
                {
                    x: chevronBase.x + direction.x * wingLength,
                    y: chevronBase.y + direction.y * wingLength
                }
            ],
            [
                arrowTip,
                {
                    x: chevronBase.x - direction.x * wingLength,
                    y: chevronBase.y - direction.y * wingLength
                }
            ]
        ];
    }

    function buildRingWorldPoints(origin, radiusPixels) {
        const points = [];

        for (let i = 0; i <= DEFAULT_SEGMENTS; i++) {
            const angle = (Math.PI * 2 * i) / DEFAULT_SEGMENTS;

            points.push({
                x: origin.x + Math.cos(angle) * radiusPixels,
                y: origin.y + Math.sin(angle) * radiusPixels
            });
        }

        return points;
    }

    function createRingPath(caster, diameterFeet, color, fill) {
        const radiusPixels = feetToPixels(caster, diameterFeet / 2);
        const origin = {
            x: caster.get('left'),
            y: caster.get('top')
        };
        const worldPoints = buildRingWorldPoints(origin, radiusPixels);
        const box = getBoundingBox(worldPoints);

        const path = createObj('path', {
            pageid: caster.get('_pageid'),
            layer: 'objects',
            stroke: color || DEFAULT_COLOR,
            fill: fill || DEFAULT_FILL,
            stroke_width: DEFAULT_STROKE_WIDTH,
            width: Math.max(1, box.width),
            height: Math.max(1, box.height),
            left: (box.minX + box.maxX) / 2,
            top: (box.minY + box.maxY) / 2,
            rotation: 0,
            _path: JSON.stringify(buildRoll20Path(worldPoints, box))
        });

        if (path) {
            path.set('controlledby', caster.get('controlledby') || '');
        }

        return {
            path: path,
            radiusPixels: radiusPixels
        };
    }

    function syncWallMarker(template, path) {
        if (!template || template.type !== 'wall' || !path) return;

        const points = getPathWorldPoints(path);

        if (points.length < 2) return;

        const markerPoints = [points[0], points[1]];
        const box = getBoundingBox(markerPoints);
        let marker = template.markerPathId ? getObj('path', template.markerPathId) : null;

        const properties = {
            pageid: path.get('_pageid'),
            layer: 'objects',
            stroke: '#ffd700',
            fill: '#00000000',
            stroke_width: 8,
            width: Math.max(1, box.width),
            height: Math.max(1, box.height),
            left: (box.minX + box.maxX) / 2,
            top: (box.minY + box.maxY) / 2,
            rotation: 0,
            _path: JSON.stringify(buildRoll20Path(markerPoints, box))
        };

        if (marker) {
            marker.set(properties);
            return;
        }

        marker = createObj('path', properties);

        if (marker) {
            template.markerPathId = marker.id;
        }
    }

    function removeWallMarker(template) {
        if (!template || !template.markerPathId) return;

        const marker = getObj('path', template.markerPathId);

        if (marker) {
            marker.remove();
        }

        delete template.markerPathId;
    }

    function createConePath(caster, radiusFeet, angleDegrees, title, color, fill) {
        const radiusPixels = feetToPixels(caster, radiusFeet);
        const rotation = Number(caster.get('rotation')) || 0;
        const origin = {
            x: caster.get('left'),
            y: caster.get('top')
        };

        const worldPoints = buildConeWorldPoints(origin, radiusPixels, angleDegrees, rotation);
        const box = getBoundingBox(worldPoints);

        const path = createObj('path', {
            pageid: caster.get('_pageid'),
            layer: 'objects',
            stroke: color || DEFAULT_COLOR,
            fill: fill || DEFAULT_FILL,
            stroke_width: DEFAULT_STROKE_WIDTH,
            width: Math.max(1, box.width),
            height: Math.max(1, box.height),
            left: (box.minX + box.maxX) / 2,
            top: (box.minY + box.maxY) / 2,
            rotation: 0,
            _path: JSON.stringify(buildRoll20Path(worldPoints, box))
        });

        if (path) {
            path.set('controlledby', caster.get('controlledby') || '');
        }

        return {
            path: path,
            radiusPixels: radiusPixels,
            rotation: rotation
        };
    }

    function getTokenSamplePoints(token) {
        return [
            {
                x: token.get('left'),
                y: token.get('top')
            }
        ];
    }

    function pointInsideCone(point, origin, direction, radiusPixels, angleDegrees) {
        const dx = point.x - origin.x;
        const dy = point.y - origin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > radiusPixels) return false;
        if (distance === 0) return true;

        const unitX = dx / distance;
        const unitY = dy / distance;
        const dot = unitX * direction.x + unitY * direction.y;
        const threshold = Math.cos((Number(angleDegrees) / 2) * Math.PI / 180);

        return dot >= threshold;
    }

    function tokenInsideCone(token, template) {
        return getTokenSamplePoints(token).some(point => pointInsideCone(
            point,
            template.origin,
            template.direction,
            template.radiusPixels,
            template.angleDegrees
        ));
    }

    function getPathWorldPoints(path) {
        const rawPath = JSON.parse(path.get('_path') || '[]');
        const width = Number(path.get('width')) || 1;
        const height = Number(path.get('height')) || 1;
        const left = Number(path.get('left')) || 0;
        const top = Number(path.get('top')) || 0;
        const rotation = (Number(path.get('rotation')) || 0) * Math.PI / 180;

        return rawPath
            .filter(entry => entry && entry.length >= 3)
            .map(entry => {
                const local = {
                    x: Number(entry[1]) - width / 2,
                    y: Number(entry[2]) - height / 2
                };

                const rotated = rotatePoint(local, rotation);

                return {
                    x: left + rotated.x,
                    y: top + rotated.y
                };
            });
    }

    function pointInsidePolygon(point, polygon) {
        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x;
            const yi = polygon[i].y;
            const xj = polygon[j].x;
            const yj = polygon[j].y;

            const intersects = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / ((yj - yi) || 1) + xi);

            if (intersects) inside = !inside;
        }

        return inside;
    }

    function tokenInsideWall(token, template) {
        const path = getObj('path', template.pathId);

        if (!path) return false;

        const rotation = -(Number(path.get('rotation')) || 0) * Math.PI / 180;
        const dx = token.get('left') - path.get('left');
        const dy = token.get('top') - path.get('top');
        const localX = dx * Math.cos(rotation) - dy * Math.sin(rotation);
        const localY = dx * Math.sin(rotation) + dy * Math.cos(rotation);
        const overlap = Math.max(token.get('width'), token.get('height')) * 0.16;

        return Math.abs(localX) <= path.get('width') / 2 + overlap &&
            Math.abs(localY) <= path.get('height') / 2 + overlap;
    }

    function tokenInsideRing(token, template) {
        const tokenBuffer = Math.max(token.get('width'), token.get('height')) * 0.16;
        const wallThicknessPixels = feetToPixels(token, 1);
        const buffer = Math.max(tokenBuffer, wallThicknessPixels / 2);

        return getTokenSamplePoints(token).some(point => {
            const dx = point.x - template.origin.x;
            const dy = point.y - template.origin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            return distance >= template.radiusPixels - buffer &&
                distance <= template.radiusPixels + buffer;
        });
    }

    function getAffectedTokens(template) {
        return findObjs({
            type: 'graphic',
            subtype: 'token',
            pageid: template.pageId,
            layer: 'objects'
        }).filter(token => {
            if (!token.get('represents')) return false;
            if (token.id === template.casterTokenId) return false;
            if (template.type === 'wall') return tokenInsideWall(token, template);
            if (template.type === 'ring') return tokenInsideRing(token, template);
            return tokenInsideCone(token, template);
        });
    }

    function sendTemplateCard(template, caster, path) {
        const style = '" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)';
        const clearButton = '[Cancel](!boom clear ' + path.id + style;
        let applyButtons;
        let orientation;

        if (template.type === 'wall') {
            applyButtons =
                '[Arrow Side Is Harmful](!boom apply ' + path.id + ' --hazardSide top' + style +
                '[Opposite Arrow Side Is Harmful](!boom apply ' + path.id + ' --hazardSide bottom' + style;
            orientation = 'Move and rotate the wall. The arrow points toward the marked side.';
        } else if (template.type === 'ring') {
            applyButtons =
                '[Inside Is Harmful](!boom apply ' + path.id + ' --hazardSide inside' + style +
                '[Outside Is Harmful](!boom apply ' + path.id + ' --hazardSide outside' + style;
            orientation = 'Move the ring, then choose its harmful side.';
        } else {
            applyButtons = '[Apply ' + template.title + '](!boom apply ' + path.id + style;
            orientation = 'Rotate your token to adjust the casting template.';
        }

        sendChat(
            BOOM,
            '&{template:default} ' +
            '{{name=' + template.title + '}} ' +
            '{{Caster=' + caster.get('name') + '}} ' +
            '{{Area=' + (
                template.type === 'wall' ?
                    template.lengthFeet + ' ft × ' + template.widthFeet + ' ft wall' :
                template.type === 'ring' ?
                    template.diameterFeet + '-foot diameter ring' :
                    template.radiusFeet + ' ft cone'
            ) + '}} ' +
            '{{Save=' + template.saveKey.toUpperCase() + ' DC ' + template.dc + '}} ' +
            '{{Damage=' + template.damageFormula + ' ' + template.damageType + ', ' + template.successMode + ' on success}} ' +
            '{{Orientation=' + orientation + '}} ' +
            '{{Options=' + applyButtons + ' ' + clearButton + '}}'
        );
    }

    function handleWall(msg, args) {
        const casterTokenId = args[2];
        const lengthFeet = parseRangeFeet(args[3]);
        const widthFeet = parseRangeFeet(args[4]);
        const saveKey = args[5];
        const dc = args[6];
        const damageFormula = args[7];
        const damageType = normalizeDamageType(args[8]);
        const successMode = args[9];

        const sourceTokenId = getOptionValue(args, '--source') || casterTokenId;
        const title = normalizeTitle(getOptionWords(args, '--title'));
        const facingMode = getOptionValue(args, '--facing') || 'caster';
        const color = getOptionValue(args, '--color') || DEFAULT_COLOR;
        const fill = getOptionValue(args, '--fill') || DEFAULT_FILL;
        const applyAbility = getOptionValue(args, '--applyAbility');
        const onFail = getOptionWords(args, '--onFail');
        const onSuccess = getOptionWords(args, '--onSuccess');
        const onAny = getOptionWords(args, '--onAny');

        const caster = getObj('graphic', casterTokenId);

        if (!caster || caster.get('subtype') !== 'token') {
            sendChat(BOOM, '/w gm AoEBoom: Invalid caster token.');
            return;
        }

        if (!lengthFeet || !widthFeet || !saveKey || !dc || !damageFormula || !damageType || !successMode) {
            sendHelp();
            return;
        }

        const wall = createWallPath(caster, lengthFeet, widthFeet, title, color, fill);

        if (!wall.path) {
            sendChat(BOOM, '/w gm AoEBoom: Could not create wall template.');
            return;
        }

        const template = {
            type: 'wall',
            pathId: wall.path.id,
            title: title,
            casterTokenId: caster.id,
            sourceTokenId: sourceTokenId,
            pageId: caster.get('_pageid'),
            origin: {
                x: caster.get('left'),
                y: caster.get('top')
            },
            lengthFeet: lengthFeet,
            widthFeet: widthFeet,
            lengthPixels: wall.lengthPixels,
            widthPixels: wall.widthPixels,
            rotation: wall.rotation,
            facingMode: facingMode,
            direction: directionFromRotation(wall.rotation),
            saveKey: saveKey,
            dc: dc,
            damageFormula: damageFormula,
            damageType: damageType,
            successMode: successMode,
            adeptType: getOptionValue(args, '--adept'),
            color: color,
            fill: fill,
            applyAbility: applyAbility,
            hazardShape: 'rect',
            hazardSide: 'top',
            tokenSide: '1',
            spawnSize: '14,3',
            onFail: onFail,
            onSuccess: onSuccess,
            onAny: onAny,
            created: Date.now()
        };

        state.AoEBoom.templates[wall.path.id] = template;

        sendTemplateCard(template, caster, wall.path);
    }

    function handleRing(msg, args) {
        const casterTokenId = args[2];
        const diameterFeet = parseRangeFeet(args[3]);
        const saveKey = args[4];
        const dc = args[5];
        const damageFormula = args[6];
        const damageType = normalizeDamageType(args[7]);
        const successMode = args[8];
        const sourceTokenId = getOptionValue(args, '--source') || casterTokenId;
        const title = normalizeTitle(getOptionWords(args, '--title'));
        const color = getOptionValue(args, '--color') || DEFAULT_COLOR;
        const fill = getOptionValue(args, '--fill') || DEFAULT_FILL;
        const applyAbility = getOptionValue(args, '--applyAbility');
        const caster = getObj('graphic', casterTokenId);

        if (!caster || !diameterFeet || !saveKey || !dc || !damageFormula || !damageType || !successMode) {
            sendHelp();
            return;
        }

        const ring = createRingPath(caster, diameterFeet, color, fill);

        if (!ring.path) {
            sendChat(BOOM, '/w gm AoEBoom: Could not create ring template.');
            return;
        }

        const template = {
            type: 'ring',
            pathId: ring.path.id,
            title: title,
            casterTokenId: caster.id,
            sourceTokenId: sourceTokenId,
            pageId: caster.get('_pageid'),
            origin: { x: ring.path.get('left'), y: ring.path.get('top') },
            diameterFeet: diameterFeet,
            radiusPixels: ring.radiusPixels,
            rotation: 0,
            facingMode: 'template',
            direction: directionFromRotation(0),
            saveKey: saveKey,
            dc: dc,
            damageFormula: damageFormula,
            damageType: damageType,
            successMode: successMode,
            adeptType: getOptionValue(args, '--adept'),
            color: color,
            fill: fill,
            applyAbility: applyAbility,
            hazardShape: 'ring',
            hazardSide: 'inside',
            tokenSide: '2',
            spawnSize: '4,4',
            created: Date.now()
        };

        state.AoEBoom.templates[ring.path.id] = template;
        sendTemplateCard(template, caster, ring.path);
    }

    function handleCone(msg, args) {
        const casterTokenId = args[2];
        const radiusFeet = parseRangeFeet(args[3]);
        const angleDegrees = parseFloat(args[4]);
        const saveKey = args[5];
        const dc = args[6];
        const damageFormula = args[7];
        const damageType = normalizeDamageType(args[8]);
        const successMode = args[9];

        const sourceTokenId = getOptionValue(args, '--source') || casterTokenId;
        const title = normalizeTitle(getOptionWords(args, '--title'));
        const facingMode = getOptionValue(args, '--facing') || 'template';
        const condition = getOptionValue(args, '--condition');
        const duration = getOptionValue(args, '--duration');
        const color = getOptionValue(args, '--color') || DEFAULT_COLOR;
        const fill = getOptionValue(args, '--fill') || DEFAULT_FILL;
        const applyAbility = getOptionValue(args, '--applyAbility');
        const onFail = getOptionWords(args, '--onFail');
        const onSuccess = getOptionWords(args, '--onSuccess');
        const onAny = getOptionWords(args, '--onAny');

        const caster = getObj('graphic', casterTokenId);

        if (!caster || caster.get('subtype') !== 'token') {
            sendChat(BOOM, '/w gm AoEBoom: Invalid caster token.');
            return;
        }

        if (!radiusFeet || isNaN(angleDegrees) || !saveKey || !dc || !damageFormula || !damageType || !successMode) {
            sendHelp();
            return;
        }

        const cone = createConePath(caster, radiusFeet, angleDegrees, title, color, fill);

        if (!cone.path) {
            sendChat(BOOM, '/w gm AoEBoom: Could not create cone template.');
            return;
        }

        const template = {
            type: 'cone',
            pathId: cone.path.id,
            title: title,
            casterTokenId: caster.id,
            sourceTokenId: sourceTokenId,
            pageId: caster.get('_pageid'),
            origin: {
                x: caster.get('left'),
                y: caster.get('top')
            },
            radiusFeet: radiusFeet,
            radiusPixels: cone.radiusPixels,
            angleDegrees: angleDegrees,
            centerLocal: cone.centerLocal,
            rotation: cone.rotation,
            facingMode: facingMode,
            color: color,
            fill: fill,
            direction: directionFromRotation(cone.rotation),
            saveKey: saveKey,
            dc: dc,
            damageFormula: damageFormula,
            damageType: damageType,
            successMode: successMode,
            adeptType: getOptionValue(args, '--adept'),
            condition: condition,
            duration: duration,
            applyAbility: applyAbility,
            onFail: onFail,
            onSuccess: onSuccess,
            onAny: onAny,
            created: Date.now()
        };

        state.AoEBoom.templates[cone.path.id] = template;

        sendTemplateCard(template, caster, cone.path);
    }

    function refreshTemplateFromPath(templateId) {
        const template = state.AoEBoom.templates[templateId];
        const path = template ? getObj('path', template.pathId || templateId) : null;

        if (!template || !path) return null;

        const caster = getObj('graphic', template.casterTokenId);

        if (!caster) return null;

        const rotation = template.facingMode === 'caster' ?
            Number(caster.get('rotation')) || 0 :
            Number(path.get('rotation')) || 0;

        template.origin = (template.type === 'wall' || template.type === 'ring') && template.facingMode === 'template' ? {
            x: path.get('left'),
            y: path.get('top')
        } : {
            x: caster.get('left'),
            y: caster.get('top')
        };
        template.rotation = rotation;
        template.direction = directionFromRotation(rotation);

        if (template.facingMode === 'caster') {
            path.remove();

            if (template.type === 'wall') {
                const wall = createWallPath(caster, template.lengthFeet, template.widthFeet, template.title, template.color, template.fill);

                if (!wall.path) return null;

                template.pathId = wall.path.id;
                template.lengthPixels = wall.lengthPixels;
                template.widthPixels = wall.widthPixels;
            } else {
                const cone = createConePath(caster, template.radiusFeet, template.angleDegrees, template.title, template.color, template.fill);

                if (!cone.path) return null;

                template.pathId = cone.path.id;
                template.radiusPixels = cone.radiusPixels;
            }

            return template;
        }

        return template;
    }

    async function resolveDc(template) {
        if (template.dc !== 'spell') return template.dc;

        const sourceToken = getObj('graphic', template.sourceTokenId || template.casterTokenId);

        if (!sourceToken) return null;

        const characterId = sourceToken.get('represents');

        if (!characterId || typeof getSheetItem !== 'function') return null;

        try {
            const rawValue = await getSheetItem(characterId, 'spell_save_dc');
            const value = Number(rawValue);

            return isNaN(value) ? null : value;
        } catch (e) {
            return null;
        }
    }

    function runApplyAbility(template) {
        if (!template.applyAbility) return;

        const caster = getObj('graphic', template.casterTokenId);

        if (!caster) {
            sendChat(BOOM, '/w gm AoEBoom: Could not find caster for apply ability.');
            return;
        }

        const characterId = caster.get('represents');

        if (!characterId) {
            sendChat(BOOM, '/w gm AoEBoom: Caster does not represent a character.');
            return;
        }

        const ability = findObjs({
            type: 'ability',
            characterid: characterId,
            name: template.applyAbility
        })[0];

        if (!ability) {
            sendChat(BOOM, '/w gm AoEBoom: Could not find ability ' + template.applyAbility + ' on ' + caster.get('name') + '.');
            return;
        }

        const path = getObj('path', template.pathId);
        const action = String(ability.get('action') || '')
            .replace(/@\{selected\|token_id\}/g, caster.id)
            .replace(/@\{selected\|token_name\}/g, caster.get('name'))
            .replace(/\{\{BOOM_LEFT\}\}/g, path ? path.get('left') : caster.get('left'))
            .replace(/\{\{BOOM_TOP\}\}/g, path ? path.get('top') : caster.get('top'))
            .replace(/\{\{BOOM_ROTATION\}\}/g, path ? path.get('rotation') : caster.get('rotation'))
            .replace(/\{\{BOOM_CASTER_TOKEN_ID\}\}/g, caster.id)
            .replace(/\{\{BOOM_HAZARD_SHAPE\}\}/g, template.hazardShape || 'rect')
            .replace(/\{\{BOOM_HAZARD_SIDE\}\}/g, template.hazardSide || 'top')
            .replace(/\{\{BOOM_TOKEN_SIDE\}\}/g, template.tokenSide || '1')
            .replace(/\{\{BOOM_SPAWN_SIZE\}\}/g, template.spawnSize || '1,1');

        action.split(/\n+/).forEach(function(line) {
            const cleanLine = line.trim();

            if (!cleanLine) return;

            if (cleanLine.indexOf('!Spawn') === 0) {
                runSpawnApplyLine(cleanLine, template, path);
                return;
            }

            if (cleanLine.indexOf('/fx ') === 0) {
                runFxApplyLine(cleanLine, caster, template);
                return;
            }

            sendChat(caster.get('name'), cleanLine);
        });
    }

function runFxApplyLine(line, caster, template) {
    const parts = line.split(/\s+/);
    const fxName = parts[1];

    if (!fxName) {
        sendChat(BOOM, '/w gm AoEBoom: FX line is missing an FX name.');
        return;
    }

    const start = {
        x: caster.get('left'),
        y: caster.get('top')
    };

    const direction = template && template.direction ? template.direction : directionFromRotation(caster.get('rotation'));
    const distance = template && template.radiusPixels ? template.radiusPixels : 350;

    const end = {
        x: start.x + direction.x * distance,
        y: start.y + direction.y * distance
    };

    const fxId = getCustomFxIdByName(fxName) || fxName;

    spawnFxBetweenPoints(start, end, fxId, caster.get('_pageid'));
}

    function runSpawnApplyLine(line, template, path) {
        if (
            typeof SpawnDefaultToken === 'undefined' ||
            !SpawnDefaultToken ||
            typeof SpawnDefaultToken.spawnAtXY !== 'function'
        ) {
            sendChat(BOOM, '/w gm AoEBoom: SpawnDefaultToken.spawnAtXY is not available.');
            return;
        }

        const nameMatch = line.match(/--name\|([^}]+?)(?=\s+--|$|\}\})/);
        const sizeMatch = line.match(/--size\|([^}]+?)(?=\s+--|$|\}\})/);
        const layerMatch = line.match(/--layer\|([^}]+?)(?=\s+--|$|\}\})/);
        const hazardMatch = line.match(/--hazard\|([^}]+?)(?=\s+--|$|\}\})/);
        const shapeMatch = line.match(/--shape\|([^}]+?)(?=\s+--|$|\}\})/);
        const hazardSideMatch = line.match(/--hazardSide\|([^}]+?)(?=\s+--|$|\}\})/);
        const tokenSideMatch = line.match(/--tokenSide\|([^}]+?)(?=\s+--|$|\}\})/);
        const rangeMatch = line.match(/--range\|([^}]+?)(?=\s+--|$|\}\})/);
        const radiusMatch = line.match(/--radius\|([^}]+?)(?=\s+--|$|\}\})/);
        const damageMatch = line.match(/--damage\|([^}]+?)(?=\s+--|$|\}\})/);
        const typeMatch = line.match(/--type\|([^}]+?)(?=\s+--|$|\}\})/);
        const triggerMatch = line.match(/--trigger\|([^}]+?)(?=\s+--|$|\}\})/);
        const saveMatch = line.match(/--save\|([^}]+?)(?=\s+--|$|\}\})/);
        const dcMatch = line.match(/--dc\|([^}]+?)(?=\s+--|$|\}\})/);
        const successMatch = line.match(/--success\|([^}]+?)(?=\s+--|$|\}\})/);
        const offsetSideMatch = line.match(/--offsetSide\|([^}]+?)(?=\s+--|$|\}\})/);
        const offsetFeetMatch = line.match(/--offsetFeet\|([^}]+?)(?=\s+--|$|\}\})/);

        if (!nameMatch) {
            sendChat(BOOM, '/w gm AoEBoom: Apply ability Spawn line is missing --name|.');
            return;
        }

        const sizeParts = String(sizeMatch ? sizeMatch[1] : '1,1').trim().split(',');
        const widthSquares = parseFloat(sizeParts[0]) || 1;
        const heightSquares = parseFloat(sizeParts[1]) || widthSquares;

        const spawnName = String(nameMatch[1]).trim();
        const concentration = line.indexOf('--concentration') !== -1;

        if (
            concentration &&
            typeof ActionEconomyV2API !== 'undefined' &&
            ActionEconomyV2API &&
            typeof ActionEconomyV2API.addPendingSummon === 'function'
        ) {
            ActionEconomyV2API.addPendingSummon('AoEBoom', template.casterTokenId, spawnName, true);
        }

        if (
            hazardMatch &&
            String(hazardMatch[1]).trim().toLowerCase() === 'directional' &&
            typeof ActionEconomyV2API !== 'undefined' &&
            ActionEconomyV2API &&
            typeof ActionEconomyV2API.addPendingDirectionalHazard === 'function'
        ) {
            ActionEconomyV2API.addPendingDirectionalHazard(
                'AoEBoom',
                template.casterTokenId,
                spawnName,
                {
                    shape: shapeMatch ? String(shapeMatch[1]).trim() : 'rect',
                    side: hazardSideMatch ? String(hazardSideMatch[1]).trim() : 'top',
                    rangeFeet: rangeMatch ? String(rangeMatch[1]).trim() : '10',
                    radiusFeet: radiusMatch ? String(radiusMatch[1]).trim() : null,
                    damageFormula: damageMatch ? String(damageMatch[1]).trim() : '5d8',
                    damageType: typeMatch ? String(typeMatch[1]).trim() : 'Fire',
                    saveKey: saveMatch ? String(saveMatch[1]).trim() : template.saveKey,
                    dc: dcMatch ? String(dcMatch[1]).trim() : template.dc,
                    successMode: successMatch ? String(successMatch[1]).trim() : template.successMode,
                    sourceTokenId: template.sourceTokenId || template.casterTokenId,
                    adeptType: template.adeptType || null,
                    triggers: triggerMatch ? String(triggerMatch[1]).trim() : 'enter,endTurn',
                    duration: concentration ? 'concentration' : 'manual'
                }
            );
        }

        const caster = getObj('graphic', template.casterTokenId);
        const rotation = path ? (Number(path.get('rotation')) + 90) % 360 : 90;

        let spawnLeft = path ? Number(path.get('left')) || 0 : 0;
        let spawnTop = path ? Number(path.get('top')) || 0 : 0;

        if (path && caster && offsetSideMatch && offsetFeetMatch) {
            const offsetSide = String(offsetSideMatch[1]).trim().toLowerCase();
            const offsetFeet = parseFloat(offsetFeetMatch[1]);

            if (!isNaN(offsetFeet) && offsetFeet !== 0) {
                const offsetPixels = feetToPixels(caster, offsetFeet);
                const radians = rotation * Math.PI / 180;

                if (offsetSide === 'top' || offsetSide === 'gold' || offsetSide === 'marked') {
                    spawnLeft += Math.sin(radians) * offsetPixels;
                    spawnTop -= Math.cos(radians) * offsetPixels;
                } else if (offsetSide === 'bottom' || offsetSide === 'opposite') {
                    spawnLeft -= Math.sin(radians) * offsetPixels;
                    spawnTop += Math.cos(radians) * offsetPixels;
                }
            }
        }

        SpawnDefaultToken.spawnAtXY({
            name: spawnName,
            tokenName: spawnName,
            pageId: template.pageId,
            layer: layerMatch ? String(layerMatch[1]).trim() : 'objects',
            left: spawnLeft,
            top: spawnTop,
            width: widthSquares * 70,
            height: heightSquares * 70,
            rotation: rotation,
            side: tokenSideMatch ? String(tokenSideMatch[1]).trim() : null
        });
    }

    function getTokensInsideBurst(caster, radiusFeet, affectsCaster) {
        const scale = getPageScale(caster);

        return findObjs({
            type: 'graphic',
            subtype: 'token',
            pageid: caster.get('_pageid'),
            layer: 'objects'
        }).filter(function(token) {
            if (!affectsCaster && token.id === caster.id) return false;
            if (!token.get('represents')) return false;

            const dx = token.get('left') - caster.get('left');
            const dy = token.get('top') - caster.get('top');
            const feet = Math.sqrt(dx * dx + dy * dy) / 70 * scale;
            const tokenRadiusFeet = Math.max(token.get('width'), token.get('height')) / 2 / 70 * scale;
            const overlapThresholdFeet = tokenRadiusFeet * 0.33;

            return feet <= radiusFeet + overlapThresholdFeet;
        });
    }

    async function handleBurst(msg, args) {
        const casterTokenId = args[2];
        const radiusFeet = parseRangeFeet(args[3]);
        const saveKey = args[4];
        const dc = args[5];
        const damageFormula = args[6];
        const damageType = normalizeDamageType(args[7]);
        const successMode = args[8];

        const sourceTokenId = getOptionValue(args, '--source') || casterTokenId;
        const title = normalizeTitle(getOptionWords(args, '--title'));
        const onFail = getOptionWords(args, '--onFail');
        const onSuccess = getOptionWords(args, '--onSuccess');
        const onAny = getOptionWords(args, '--onAny');

        const caster = getObj('graphic', casterTokenId);

        if (!caster || caster.get('subtype') !== 'token') {
            sendChat(BOOM, '/w gm AoEBoom: Invalid caster token.');
            return;
        }

        if (!radiusFeet || !saveKey || !dc || !damageFormula || !damageType || !successMode) {
            sendHelp();
            return;
        }

        const affected = getTokensInsideBurst(
            caster,
            radiusFeet,
            String(getOptionValue(args, '--affectsCaster') || '').toLowerCase() === 'true'
        );

        if (!affected.length) {
            sendChat(
                BOOM,
                '/w gm &{template:default} ' +
                '{{name=' + title + '}} ' +
                '{{Area=' + radiusFeet + '-foot sphere}} ' +
                '{{Targets=None}}'
            );
            return;
        }

        sendChat(
            BOOM,
            '!se damagebatch ' +
            saveKey + ' ' +
            dc + ' ' +
            damageFormula + ' ' +
            damageType + ' ' +
            successMode + ' ' +
            affected.map(function(token) { return token.id; }).join(' ') +
            (sourceTokenId ? ' --source ' + sourceTokenId : '') +
            (getOptionValue(args, '--adept') ? ' --adept ' + getOptionValue(args, '--adept') : '') +
            (onFail ? ' --onFail ' + onFail : '') +
            (onSuccess ? ' --onSuccess ' + onSuccess : '') +
            (onAny ? ' --onAny ' + onAny : '')
        );

        sendChat(
            BOOM,
            '/w gm &{template:default} ' +
            '{{name=' + title + '}} ' +
            '{{Area=' + radiusFeet + '-foot sphere}} ' +
            '{{Targets=' + affected.map(function(token) { return token.get('name'); }).join('<br>') + '}}'
        );
    }

    async function handleApply(msg, args) {
        const templateId = args[2];
        const template = refreshTemplateFromPath(templateId);

        const hazardSide = getOptionValue(args, '--hazardSide');

        if (template && hazardSide) {
            template.hazardSide = hazardSide;
        }

        if (!template) {
            sendChat(BOOM, '/w gm AoEBoom: No valid template found.');
            return;
        }

        const dc = await resolveDc(template);

        if (dc === null) {
            sendChat(BOOM, '/w gm AoEBoom: Could not resolve DC.');
            return;
        }

        const affected = getAffectedTokens(template);

        try {
            runApplyAbility(template);
        } catch (e) {
            sendChat(BOOM, '/w gm AoEBoom apply ability error: ' + e.message);
        }

        if (!affected.length) {
            sendChat(
                BOOM,
                '/w gm &{template:default} ' +
                '{{name=' + template.title + '}} ' +
                '{{Result=No affected tokens found.}}'
            );

            handleClear(msg, ['!boom', 'clear', template.pathId || templateId]);
            return;
        }

        if (template.condition) {
            sendChat(
                BOOM,
                '!se save ' +
                template.condition + ' ' +
                template.saveKey + ' ' +
                affected.map(token => token.id).join(' ') + ' ' +
                dc +
                (template.duration ? ' --duration ' + template.duration : '') +
                (template.sourceTokenId ? ' --source ' + template.sourceTokenId : '')
            );
        } else {
            sendChat(
                BOOM,
                '!se damagebatch ' +
                template.saveKey + ' ' +
                dc + ' ' +
                template.damageFormula + ' ' +
                template.damageType + ' ' +
                template.successMode + ' ' +
                affected.map(token => token.id).join(' ') +
                (template.sourceTokenId ? ' --source ' + template.sourceTokenId : '') +
                (template.adeptType ? ' --adept ' + template.adeptType : '') +
                (template.onFail ? ' --onFail ' + template.onFail : '') +
                (template.onSuccess ? ' --onSuccess ' + template.onSuccess : '') +
                (template.onAny ? ' --onAny ' + template.onAny : '')
            );
        }

        sendChat(
            BOOM,
            '/w gm &{template:default} ' +
            '{{name=' + template.title + ' Applied}} ' +
            '{{Targets=' + affected.map(token => token.get('name')).join('<br>') + '}}'
        );

        handleClear(msg, ['!boom', 'clear', template.pathId || templateId]);
    }

    function handleClear(msg, args) {
        const templateId = args[2];
        let template = state.AoEBoom.templates[templateId];

        if (!template) {
            Object.keys(state.AoEBoom.templates).some(function(id) {
                if (state.AoEBoom.templates[id] && state.AoEBoom.templates[id].pathId === templateId) {
                    template = state.AoEBoom.templates[id];
                    delete state.AoEBoom.templates[id];
                    return true;
                }

                return false;
            });
        } else {
            delete state.AoEBoom.templates[templateId];
        }

        if (template) {
            removeWallMarker(template);
        }

        const pathId = template && template.pathId ? template.pathId : templateId;
        const path = getObj('path', pathId);

        if (path) {
            path.remove();
        }
    }

    function replaceInlineRolls(msg) {
        let content = msg.content;

        if (msg.inlinerolls) {
            msg.inlinerolls.forEach(function(roll, index) {
                content = content.replace(new RegExp('\\$\\[\\[' + index + '\\]\\]', 'g'), roll.results.total);
            });
        }

        return content;
    }

    function handleInput(msg) {
        if (msg.type !== 'api') return;
        if (!msg.content.match(/^!boom(\s|$)/)) return;

        const content = replaceInlineRolls(msg);
        const args = content.split(/\s+/);
        const command = args[1];

        if (command === 'cone') {
            handleCone(msg, args);
            return;
        }

        if (command === 'wall') {
            handleWall(msg, args);
            return;
        }

        if (command === 'ring') {
            handleRing(msg, args);
            return;
        }

        if (command === 'burst') {
            handleBurst(msg, args);
            return;
        }

        if (command === 'apply') {
            handleApply(msg, args);
            return;
        }

        if (command === 'clear') {
            handleClear(msg, args);
            return;
        }

        sendHelp();
    }

    function handleTokenChange(token, prev) {
        if (!token || token.get('subtype') !== 'token') return;

        Object.keys(state.AoEBoom.templates).forEach(templateId => {
            const template = state.AoEBoom.templates[templateId];

            if (!template) return;
            if (template.facingMode !== 'caster') return;
            if (template.casterTokenId !== token.id) return;

            refreshTemplateFromPath(templateId);
        });
    }

    on('ready', checkInstall);
    on('chat:message', handleInput);
    on('change:graphic', handleTokenChange);

    return {
        version: '0.1'
    };
})();
