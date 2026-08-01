/*
================================================================
ROLL20 SCRIPT BATCH 1
TABLE OF CONTENTS
Line 18 - libInline
Line 382 - libTable
Line 553 - libTokenMarkers
Line 759 - MathOps
Line 1113 - MatrixMath
Line 1669 - APILogic
Line 2459 - checkLightLevel
Line 2839 - Fetch
================================================================
*/

/*
================================================================
BEGIN SCRIPT: libInline
SOURCE FILE: libInline.md
================================================================
*/
/*
=========================================================
Name            :	libInline
GitHub          :	https://github.com/TimRohr22/Cauldron/tree/master/libInline
Roll20 Contact  :	timmaugh & The Aaron
Version         :	1.0.6
Last Update     :	9/12/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.libInline = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.libInline.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const libInline = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'libInline';
    API_Meta[apiproject].version = '1.0.6';
    const vd = new Date(1663039557109);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        return;
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };
    // ==================================================
    //		MESSAGING / CHAT REPORTING
    // ==================================================
    const HE = (() => {
        const esRE = (s) => s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g, '\\$1');
        const e = (s) => `&${s};`;
        const entities = {
            '<': e('lt'),
            '>': e('gt'),
            "'": e('#39'),
            '@': e('#64'),
            '{': e('#123'),
            '|': e('#124'),
            '}': e('#125'),
            '[': e('#91'),
            ']': e('#93'),
            '"': e('quot'),
            '*': e('#42')
        };
        const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`, 'g');
        return (s) => s.replace(re, (c) => (entities[c] || c));
    })();

    // ==================================================
    //		PARSING OPERATIONS
    // ==================================================

    const conditionalPluck = (array, key, cobj = {}) => {
        // test array of objects to return a given property of each object if all conditions are met
        // cobj properties are functions testing that property (k) in the evaluated object (o)
        // to test if testedproperty equals a given value: { testedProperty: (k,o) => { return o[k] === 'given value'; } }
        // to test if testedproperty exists:               { testedProperty: (k,o) => { return o.hasOwnProperty(k); } }
        return array.map(o => {
            let b = true;
            if (cobj) {
                Object.keys(cobj).forEach(k => {
                    if (b && !cobj[k](k, o)) {
                        b = false;
                    }
                });
            }
            return b ? o[key] : null;
        }).filter(e => e !== null);
    };
    const ops = {
        '==': (v, p) => v === p,
        '>=': (v, p) => v >= p,
        '<=': (v, p) => v <= p
    };

    const getQuantum = (roll) => {
        return (roll.dice.length || roll.total) ? true : false;
    };
    const fatedie = {
        [-2]: '=',
        [-1]: '-',
        [0]: '0',
        [1]: '+'
    };
    const typeLib = {
        all: {},
        included: { type: (k, o) => { return o[k] !== 'drop'; } },
        success: { type: (k, o) => { return o[k] === 'success'; } },
        crit: { type: (k, o) => { return o[k] === 'success'; } },
        fail: { type: (k, o) => { return o[k] === 'fail'; } },
        fumble: { type: (k, o) => { return o[k] === 'fail'; } },
        allcrit: { type: (k, o) => { return ['fail', 'success'].includes(o[k]); } },
        dropped: { type: (k, o) => { return o[k] === 'drop'; } }
    };

    const collectRollData = (r) => {
        const rollspancss1 = `<span class="basicdiceroll`;
        const rollspanend = `</span>`;
        const cssClassLib = {
            dropped: 'drop',
            critfail: 'fail',
            critsuccess: 'success',
            'critsuccess critfail': 'fail'
        };
        let matchFormatObj = {};
        let rollData = {
            parsed: '',
            tableReturns: [],
            display: '',
            dice: [],
        };
        let gRoll,
            cssclass = '',
            type = '';
        switch (r.type) {
            case 'R': // ROLL
                if (r.table) { // table roll
                    rollData.parsed = !r.results ? '{}' : '(' + r.results.map(nr => nr.tableItem ? nr.tableItem.name : nr.v).join('+') + ')';
                    rollData.display = rollData.parsed;
                    rollData.tableReturns.push({ table: r.table, returns: !r.results ? [] : r.results.map(nr => nr.tableItem ? nr.tableItem.name : nr.v) });
                    rollData.customDisplay = () => { return rollData.parsed; };
                } else { // standard roll (might include fate or matched dice)
                    // fate dice should be joined on empty string (no operator); normal rolls on +
                    rollData.parsed = !r.results ? '{}' : '(' + r.results.map(nr => r.fate ? fatedie[nr.v] : nr.v).join(r.fate ? '' : '+') + ')';
                    rollData.dice = !r.results ? [] : r.results.map(nr => {
                        cssclass = '';
                        if (nr.d) cssclass = 'dropped'; //dropped die
                        if (!cssclass) {
                            if (r.mods && r.mods.hasOwnProperty('customCrit')) {
                                if (r.mods.customCrit.reduce((m, o) => ops[o.comp](nr.v, o.point) || m, false)) cssclass = 'critsuccess';
                            } else if (!r.fate && nr.v === r.sides) { // standard success
                                cssclass = 'critsuccess';
                            } // fate has no default success threshold
                            if (r.mods && r.mods.hasOwnProperty('customFumble')) {
                                if (r.mods.customFumble.reduce((m, o) => ops[o.comp](nr.v, o.point) || m, false)) cssclass = cssclass ? cssclass + ' ': 'critfail';
                            } else if (!r.fate && nr.v === 1) { // standard fail
                                cssclass = cssclass ? cssclass + ' critfail' : 'critfail';
                            } // fate has no default fail threshold
                        }

                        type = cssClassLib[cssclass] || '';

                        // match (and drop) dice formatting
                        matchFormatObj = { drop: ` style="color: #888;"` }; // initialize with dropped-die coloration
                        if (r.mods && r.mods.match && r.mods.match.matches) {
                            matchFormatObj = { drop: ` style="color: #888;"` }; // initialize with dropped-die coloration
                            if (Array.isArray(r.mods.match.matches)) {
                                r.mods.match.matches.forEach((m, i) => {
                                    if (m) matchFormatObj[i] = ` style="color: ${m}"`;
                                });
                            } else {
                                Object.keys(r.mods.match.matches).forEach(k => matchFormatObj[k] = ` style="color: ${r.mods.match.matches[k]}"`);
                            }
                        }
                        return {
                            v: nr.v,
                            type: type,
                            display: `${rollspancss1}${cssclass ? ' ' : ''}${cssclass}${/^crit/g.test(cssclass) ? ' ' : ''}"${matchFormatObj[type] || matchFormatObj[nr.v] || ''}>${r.fate ? fatedie[nr.v] : nr.v}${rollspanend}`
                        };
                    });
                    // fate dice should be joined on empty string (no operator); normal rolls on +
                    rollData.display = '(' + conditionalPluck(rollData.dice, 'display').join(r.fate ? '' : '+') + ')';
                }
                break;
            case 'G': // GROUP ROLL
                gRoll = r.rolls.map(nr => {
                    return nr.map(collectRollData);
                });
                rollData.parsed = '{' + gRoll.map(nr => nr.map(nr2 => nr2.parsed).join('')).join(',') + '}';
                rollData.dice = [].concat(...gRoll.map(nr => [].concat(...nr.map(nr2 => nr2.dice))));
                rollData.tableReturns = [].concat(...gRoll.map(nr => [].concat(...nr.map(nr2 => nr2.tableReturns))));
                rollData.display = '{' + gRoll.map(nr => nr.map(nr2 => nr2.display).join('')).join(',') + '}';
                break;
            case 'M': // MODIFIER
                rollData.parsed = r.expr;
                rollData.display = r.expr;
                break;
            case 'L': // LABEL

                break;
            case 'C': // CATCH

                break;
            default: // UNKNOWN

                break;
        }
        return rollData;
    };

    const parseInlineRolls = (inlinerolls) => {
        let labelrx = /(?:\s*(\+|-|\\|\*)\s*)?(?<value>[^\]{}]+)(?<!\d+t)\[(?<key>.*?)]/g;
        const baseInlineCSS = `style="-webkit-tap-highlight-color: rgba(0,0,0,0);font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;color: #404040;line-height: 1.25em;` +
            `box-sizing: content-box; background-color: #FEF68E; padding: 0 3px 0 3px; font-weight: bold; cursor: help; font-size: 1.1em;border: 2px solid `;
        const bordercolors = {
            0: '#FEF68E;',
            1: '#B31515;',
            2: '#3FB315;',
            3: '#4A57ED;'
        };
        return inlinerolls.map(r => {
            let roll = {
                expression: HE(r.expression.replace(/</g, '&#xFF1C;')),
                parsed: '',
                resultType: r.results.resultType,
                total: r.results.total,
                value: r.results.total, // changed later, if necessary
                labels: [],
                tableReturns: [],
                display: '',
                dice: [],
            };
            // LABELS
            let m;
            labelrx.lastIndex = 0;
            while ((m = labelrx.exec(r.expression)) !== null) {
                if (m.index === labelrx.lastIndex) {
                    labelrx.lastIndex++;
                }
                roll.labels.push({ label: m.groups.key, value: m.groups.value });
            };
            let rollData = r.results.rolls.map(collectRollData);
            // PARSED
            roll.parsed = conditionalPluck(rollData, 'parsed').join('');
            // TABLE RETURNS
            roll.tableReturns = [].concat(...conditionalPluck(rollData, 'tableReturns'));
            // ALL DICE
            roll.dice = [].concat(...conditionalPluck(rollData, 'dice'));
            // CHAT VALUE
            roll.value = getQuantum(roll) || !roll.tableReturns.length ? roll.total : roll.tableReturns[0].returns[0];
            // DISPLAY
            roll.display = conditionalPluck(rollData, 'display').join('');

            // LATE EVAL METHODS
            roll.getDice = (type) => { return conditionalPluck(roll.dice, 'v', (typeLib[type] || typeLib.included)) };
            roll.getTableValues = () => {
                return roll.tableReturns.reduce((m, r) => {
                    m.push(...r.returns);
                    return m;
                }, []);
            };
            roll.getRollTip = () => {
                let parts = [];
                parts.push(`<span class="inlinerollresult showtip tipsy-n-right" ${baseInlineCSS}`);
                parts.push(`${bordercolors[(/basicdiceroll(?:\scritsuccess)?\scritfail/.test(roll.display) ? 1 : 0) + (/basicdiceroll\scritsuccess/.test(roll.display) ? 2 : 0)]}" `);
                parts.push(`title="${HE(HE(`Rolling ${roll.expression} = ${roll.display}`))}">${roll.value}</span>`);
                return parts.join('');
            };
            roll.getCustomTip = () => {
                const baseInlineCSS = `style="-webkit-tap-highlight-color: rgba(0,0,0,0);font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;color: #404040;line-height: 1.25em;` +
                    `box-sizing: content-box; background-color: #FEF68E; padding: 0 3px 0 3px; font-weight: bold; cursor: help; font-size: 1.1em;border: 2px solid `;
                const bordercolors = {
                    0: '#FEF68E;',
                    1: '#B31515;',
                    2: '#3FB315;',
                    3: '#4A57ED;'
                };

            };
            return roll;
        });
    };
    const getRollFromInline = (ira) => {
        if (Array.isArray(ira) && ira.length) {
            return parseInlineRolls([ira[0]])[0];
        } else if (Array.isArray(ira) && ira.length) {
            return parseInlineRolls(ira)[0];
        } else if (!Array.isArray(ira) && typeof ira === 'object' && _.every(['expression', 'rollid', 'results'], p => { return ira.hasOwnProperty(p); })) {
            return parseInlineRolls([ira])[0];
        } else return;
    };

    // ==================================================
    //		EXPOSED INTERFACE FUNCTIONS
    // ==================================================
    const getRollData = (ira) => {
        let pir;
        if (typeof ira === 'object' && ira.hasOwnProperty('inlinerolls')) {
            pir = parseInlineRolls(ira.inlinerolls);
        } else if (Array.isArray(ira) && ira.length) {
            pir = parseInlineRolls(ira);
        } else if (!Array.isArray(ira) && typeof ira === 'object' && _.every(['expression', 'rollid', 'results'], p => { return ira.hasOwnProperty(p); })) {
            pir = parseInlineRolls([ira]);
        }
        return pir;
    };
    const getDice = (inlinerolls, type = 'included') => {
        return conditionalPluck((getRollFromInline(inlinerolls) || { dice: [] }).dice, 'v', (typeLib[type] || typeLib.included));
    };
    const getValue = (inlinerolls) => {
        return (getRollFromInline(inlinerolls) || { value: '' }).value;
    };
    const getTables = (inlinerolls, reduce = true) => {
        if (reduce) {
            return (getRollFromInline(inlinerolls) || { getTableValues: () => { return ''; } }).getTableValues();
        } else {
            return (getRollFromInline(inlinerolls) || { tableReturns: [] }).tableReturns;
        }
    };
    const getParsed = (inlinerolls) => {
        return (getRollFromInline(inlinerolls) || { parsed: '' }).parsed;
    };
    const getRollTip = (inlinerolls) => {
        return (getRollFromInline(inlinerolls) || { display: '' }).getRollTip();
    };

    // ==================================================
    //		ON READY
    // ==================================================
    on('ready', () => {
        versionInfo();
        logsig();
    });

    return {
        getRollData: getRollData,
        getDice: getDice,
        getValue: getValue,
        getTables: getTables,
        getParsed: getParsed,
        getRollTip: getRollTip
    };

})();
{ try { throw new Error(''); } catch (e) { API_Meta.libInline.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.libInline.offset); } }
/*
================================================================
END SCRIPT: libInline
================================================================
*/

/*
================================================================
BEGIN SCRIPT: libTable
SOURCE FILE: libTable.md
================================================================
*/
/* eslint-disable no-prototype-builtins */
/*
=========================================================
Name            :   libTable
GitHub          :   
Roll20 Contact  :   timmaugh
Version	        :   1.0.0
Last Update     :   11/15/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.libTable = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.libTable.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (14)); }
}

const libTable = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'libTable';
    const version = '1.0.0';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1668569081210);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };
    // ==================================================
    //		STATE MANAGEMENT
    // ==================================================
    const checkInstall = () => {
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) { // eslint-disable-line no-prototype-builtins
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        settings: {},
                        defaults: {},
                        version: schemaVersion
                    }
                    break;
            }
        }
    };
    let stateReady = false;
    const assureState = () => {
        if (!stateReady) {
            checkInstall();
            stateReady = true;
        }
    };

    // ==================================================
    //		UTILITIES
    // ==================================================
    const simpleObj = (o) => o ? JSON.parse(JSON.stringify(o)) : undefined;

    // ==================================================
    //		LIBRARY OBJECTS
    // ==================================================
    let tables = {};
    let tablesByName = {};

    const flattenTable = (query) => {
        if (!query) return;
        let t = query;
        if (typeof query === 'string') t = findObjs({ type: 'rollabletable', id: query })[0] || findObjs({ type: 'rollabletable', name: query })[0];
        if (!(t && t.get('type') === 'rollabletable')) return;
        tables[t.id] = simpleObj(t);
        tables[t.id].items = { byindex: {}, byweight: {}, byname: {}, byweightedindex: {} };
        let items = findObjs({ type: 'tableitem', rollabletableid: t.id });
        let runningweight = 0;
        items.reduce((m, item, i) => {
            let simpleitem = simpleObj(item);
            simpleitem.image = simpleitem.avatar ? `<img src="${simpleitem.avatar}">` : '';
            m.byindex[i + 1] = simpleitem;
            m.byname[simpleitem.name] = simpleitem;
            let weightkey;
            let weight = parseInt(simpleitem.weight) || 1;
            for (let j = runningweight + 1; j <= runningweight + weight; j++) {
                m.byweightedindex[j] = simpleitem;
            }
            switch (i) {
                case 0:
                    weightkey = `<=${weight}`;
                    break;
                case items.length - 1:
                    weightkey = `>=${runningweight + 1}`;
                    break;
                default:
                    weightkey = weight === 1 ? `${runningweight + 1}` : `${runningweight + 1}-${runningweight + weight}`;
            }
            m.byweight[weightkey] = simpleitem;
            runningweight += weight;
            return m;
        }, tables[t.id].items);
        tablesByName[tables[t.id].name] = tables[t.id];
    };
    const buildTables = () => {
        findObjs({ type: 'rollabletable' }).forEach(t => flattenTable(t));
    };
    const getTable = (query) => {
        if (!query) return;
        let t = typeof query === 'string' ? query : query.id;
        return tables[t] || tablesByName[t];
    };
    const getItemsBy = (t, p) => {
        let tbl = getTable(t);
        return tbl ? tbl.items[p] : undefined;
    };
    on('ready', () => {
        versionInfo();
        assureState();
        logsig();
    });
    return { // public interface
        getTables: () => { buildTables(); return tables; },
        getTable: (t) => { flattenTable(t); return getTable(t); },
        getItems: (t) => { flattenTable(t); return (getTable(t) || {}).items; },
        getItemsByIndex: (t) => { flattenTable(t); return getItemsBy(t, 'byindex') },
        getItemsByName: (t) => { flattenTable(t); return getItemsBy(t, 'byname') },
        getItemsByWeight: (t) => { flattenTable(t); return getItemsBy(t, 'byweight') },
        getItemsByWeightedIndex: (t) => { flattenTable(t); return getItemsBy(t, 'byweightedindex') }
    };
})();

{ try { throw new Error(''); } catch (e) { API_Meta.libTable.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.libTable.offset); } }
/*
================================================================
END SCRIPT: libTable
================================================================
*/

/*
================================================================
BEGIN SCRIPT: libTokenMarkers
SOURCE FILE: libTokenMarkers.md
================================================================
*/
// Github:   https://github.com/shdwjk/Roll20API/blob/master/libTokenMarkers/libTokenMarkers.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{}; // eslint-disable-line no-var
API_Meta.libTokenMarkers={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.libTokenMarkers.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const libTokenMarkers = (() => { // eslint-disable-line no-unused-vars

    const version = '0.1.2';
    API_Meta.libTokenMarkers.version = version;
    const lastUpdate = 1641754038;
    const schemaVersion = 0.1;

    const isString = (s) => 'string' === typeof s || s instanceof String;
	const isArray = (a) => Array.isArray(a);
	const flatten = (a) => isArray(a) ? a.reduce((m,e)=>[...m, ...flatten(e)],[]) : [a];

    class TokenMarker {
        constructor( name, tag, url ) {
            this.name = name;
            this.tag = tag;
            this.url = url;
        }

        getName() {
            return this.name;
        }

        getTag() {
            return this.tag;
        }

        getHTML(scale = 1.4, style=''){
            return `<div style="width: ${scale}em; vertical-align: middle; height: ${scale}em; display:inline-block; margin: 0 3px 0 0; border:0; padding:0;background-image: url('${this.url}');background-repeat:no-repeat; background-size: auto ${scale}em;${style}"></div>`;
        }

		applyWithNumberTo(number, ...a) {
			flatten(a).forEach(t=>t.set(`status_${this.tag}`, (undefined!==number ? number : true)));
		}
		applyTo(...a) {
			this.applyWithNumberTo(undefined,a);
		}

		removeFrom(...a) {
			flatten(a).forEach(t=>t.set(`status_${this.tag}`,false));
		}
    }

    class NullTokenMarker extends TokenMarker {
        getName() {
            return "";
        }
        getTag() {
            return "";
        }
        getHTML() {
            return "";
        }
		applyTo() {
		}
		applyWithNumberTo() {
		}
		removeFrom() {
		}
    }

    class ColorDotTokenMarker extends TokenMarker {
        constructor( name, color ) {
            super(name,name);
            this.color = color;
        }

        getHTML(scale = 1.4, style=''){
            return `<div style="display:inline-block;line-height: 1;margin-right: .12em;${style}"><div style="width: ${scale*.9}em; height: ${scale*.9}em; border-radius:${scale}em; display:inline-block; margin: 0 auto; border:0; background-color: ${this.color};"></div></div>`;
        }
    }

    class ColorTextTokenMarker extends TokenMarker {
        constructor( name, letter, color ) {
            super(name,name);
            this.color = color;
            this.letter = letter;
        }

        getHTML(scale = 1.4, style=''){
            return `<div style="width: 1em; height: 1em; font-size: ${scale}em; line-height: 1em; display:inline-block; margin: 0; border:0; font-weight: bold; color: ${this.color}; text-align: center;${style}">${this.letter}</div>`;
        }
    }

    class TokenMarkerRegistry {

        static init(){
            let tokenMarkers = {};
            let orderedLookup = new Set();
            let reverseLookup = {};

            const insertTokenMarker = (tm) => {
                tokenMarkers[tm.getTag()] = tm;
                orderedLookup.add(tm.getTag());

                let tmName = tm.getName().toLowerCase();

                reverseLookup[tmName] = reverseLookup[tmName]||[];
                reverseLookup[tmName].push(tm.getTag()); 
            };

            const buildStaticMarkers = () => {
                insertTokenMarker(new ColorDotTokenMarker('red', '#C91010'));
                insertTokenMarker(new ColorDotTokenMarker(`blue`, '#1076c9'));
                insertTokenMarker(new ColorDotTokenMarker(`green`, '#2fc910'));
                insertTokenMarker(new ColorDotTokenMarker(`brown`, '#c97310'));
                insertTokenMarker(new ColorDotTokenMarker(`purple`, '#9510c9'));
                insertTokenMarker(new ColorDotTokenMarker(`pink`, '#eb75e1'));
                insertTokenMarker(new ColorDotTokenMarker(`yellow`, '#e5eb75'));

                insertTokenMarker(new ColorTextTokenMarker('dead', 'X', '#cc1010'));
            };


            const readTokenMarkers = () => {
                JSON.parse(Campaign().get('_token_markers')||'[]').forEach( tm => insertTokenMarker(new TokenMarker(tm.name, tm.tag, tm.url)));
            };

            TokenMarkerRegistry.getStatuses = (keyOrName) => {
                if(!isString(keyOrName)){
                    return [];
                }
                if(tokenMarkers.hasOwnProperty(keyOrName)){
                    return [tokenMarkers[keyOrName]];
                }
                let tmName = keyOrName.toLowerCase();
                if(reverseLookup.hasOwnProperty(tmName)){
                    return reverseLookup[tmName].map(t => tokenMarkers[t]); 
                }
                return [];
            };

            TokenMarkerRegistry.getStatus = (keyOrName) => (TokenMarkerRegistry.getStatuses(keyOrName))[0] || new NullTokenMarker();

            TokenMarkerRegistry.getOrderedList = () => {
                return [...orderedLookup].map( key => tokenMarkers[key]);
            };

            buildStaticMarkers();
            readTokenMarkers();
        }
    }

    const tryInit = ()=>{
        if(Campaign()) {
            TokenMarkerRegistry.init();
        } else {
            setTimeout(tryInit,10);
        }
    };
    setTimeout(tryInit,0);


    const checkInstall = () =>  {
        log('-=> libTokenMarkers v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! state.hasOwnProperty('libTokenMarkers') || state.libTokenMarkers.version !== schemaVersion) {
            log(`  > Updating Schema to v${schemaVersion} <`);
            switch(state.libTokenMarkers && state.libTokenMarkers.version) {

                case 0.1:
                    /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state.libTokenMarkers.version = schemaVersion;
                    break;

                default:
                    state.libTokenMarkers = {
                        version: schemaVersion
                    };
                    break;
            }
        }
        log(`  > Loaded ${TokenMarkerRegistry.getOrderedList().length} Token Markers.`);
    };

    on('ready', checkInstall );

    return {
        getStatus: (...a) => TokenMarkerRegistry.getStatus(...a),
        getStatuses: (...a) => TokenMarkerRegistry.getStatuses(...a),
        getOrderedList: (...a) => TokenMarkerRegistry.getOrderedList(...a)
    };

})();

{try{throw new Error('');}catch(e){API_Meta.libTokenMarkers.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.libTokenMarkers.offset);}}
/*
================================================================
END SCRIPT: libTokenMarkers
================================================================
*/

/*
================================================================
BEGIN SCRIPT: MathOps
SOURCE FILE: MathOps.md
================================================================
*/
/*
=========================================================
Name			:	MathOps
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/MathOps
Roll20 Contact	:	timmaugh
Version			:	1.0.8
Last Update		:	3/12/2023
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.MathOps = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.MathOps.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const MathOps = (() => {
    const apiproject = 'MathOps';
    const version = '1.0.8';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1678676625022);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                    };
                    break;
            }
        }
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };

    const mathprocessor = (() => {
        const tokenize = code => {
            let results = [];
            let tokenRegExp = /\s*([A-Za-z\s'"`]+|(?:-(?<!(?:\d|[A-Za-z\s'"`]|\))-))?[0-9]+(\.[0-9]+)?|\S)\s*/g;

            let m;
            while ((m = tokenRegExp.exec(code)) !== null)
                results.push(m[1]);
            return results;
        };

        const isNumber = token => {
            return token !== undefined && token.match(/^-?[0-9]*.?[0-9]+$/) !== null;
        };

        const isName = token => {
            return token !== undefined && token.match(/^[A-Za-z\s'"`]+$/) !== null;
        };

        const parse = o => {
            let tokens = tokenize(o.code);
            let position = 0;
            const peek = () => {
                return tokens[position];
            };
            const peek1 = () => {
                if (position < tokens.length - 1) {
                    return tokens[position + 1];
                }
            };

            const consume = token => {
                position++;
            };

            const parsePrimaryExpr = () => {
                let t = peek();

                if (isNumber(t)) {
                    consume(t);
                    return { type: "number", value: t };
                } else if (isName(t)) {
                    if (funcbank.hasOwnProperty(t.toLowerCase()) && peek1() === '(') {
                        let f = t.toLowerCase();
                        let p = [];
                        consume(t);
                        consume('(');
                        while (peek() !== ')') {
                            if (peek() === ',') {
                                consume(',');
                            } else {
                                p.push(parseExpr());
                            }
                        }
                        if (peek() !== ")") throw "Expected )";
                        consume(')');
                        return { type: 'func', func: f, params: p };
                    } else {
                        consume(t);
                        return { type: "name", id: t };
                    }
                } else if (t === "(") {
                    consume(t);
                    let expr = parseExpr();
                    if (peek() !== ")") throw "Expected )";
                    consume(")");
                    return expr;
                } else {
                    throw "Expected a number, a variable, or parentheses";
                }
            };

            const parseMulExpr = () => {
                let expr = parsePrimaryExpr();
                let t = peek();
                while (t === "*" || t === "/" || t === "%") {
                    consume(t);
                    let rhs = parsePrimaryExpr();
                    expr = { type: t, left: expr, right: rhs };
                    t = peek();
                }
                return expr;
            };
            const parseExpr = () => {
                let expr = parseMulExpr();
                let t = peek();
                while (t === "+" || t === "-") {
                    consume(t);
                    let rhs = parseMulExpr();
                    expr = { type: t, left: expr, right: rhs };
                    t = peek();
                }
                return expr;
            };
            let result = parseExpr();
            if (position !== tokens.length) throw "Unexpected '" + peek() + "'";
            return result;
        };
        const formatReturn = (a, d) => {
            switch (d) {
                case 'roll':
                    return `[[${a.join('+')}]]`;
                default:
                    return a.join(d);
            }
        };
        const funcbank = {
            abs: Math.abs,
            min: Math.min,
            max: Math.max,
            maxn: (n, d, ...i) => {
                if (!isNaN(d)) [i, d] = [[d, ...i], ','];
                if (n > i.length) {
                    return formatReturn(i, d);
                }
                return formatReturn(
                    i.slice().sort((a, b) => { return b - a; }).slice(0, n),
                    d);
            },
            minn: (n, d, ...i) => {
                if (!isNaN(d)) [i, d] = [[d, ...i], ','];
                if (n > i.length) {
                    return formatReturn(i, d);
                }
                return formatReturn(
                    i.slice().sort((a, b) => { return a - b; }).slice(0, n),
                    d);
            },
            acos: Math.acos,
            acosh: Math.acosh,
            asin: Math.asin,
            asinh: Math.asinh,
            atan: Math.atan,
            atanh: Math.atanh,
            atantwo: Math.atan2,
            cbrt: Math.cbrt,
            ceiling: Math.ceil,
            cos: Math.cos,
            cosh: Math.cosh,
            exp: Math.exp,
            expmone: Math.expm1,
            floor: Math.floor,
            hypot: Math.hypot,
            log: Math.log,
            logonep: Math.log1p,
            logten: Math.log10,
            logtwo: Math.log2,
            pow: (v, e = 1) => Math.pow(v, e),
            rand: Math.random,
            randb: (v1, v2) => { return Math.random() * (Math.max(v1, v2) - Math.min(v1, v2) + 1) + Math.min(v1, v2) },
            randib: (v1, v2) => {
                let min = Math.ceil(Math.min(v1, v2));
                let max = Math.floor(Math.max(v1, v2));
                return Math.floor(Math.random() * (max - min) + min);
            },
            randa: (...v) => v[Math.floor(Math.random() * v.length)],
            round: (v, d = 0) => Math.round(v * 10 ** d) / 10 ** d,
            sin: Math.sin,
            sinh: Math.sinh,
            sqrt: Math.sqrt,
            tan: Math.tan,
            tanh: Math.tanh,
            trunc: Math.trunc
        };
        const knownbank = {
            e: Math.E,
            pi: Math.PI,
            lntwo: Math.LN2,
            lnten: Math.LN10,
            logtwoe: Math.LOG2E,
            logtene: Math.LOG10E
        };
        const isNum = (v) => +v === +v;
        const typeprocessor = {
            '-': (a, b) => { return isNum(a) && isNum(b) ? Number(a) - Number(b) : `${a}-${b}`; },
            '+': (a, b) => { return isNum(a) && isNum(b) ? Number(a) + Number(b) : `${a}+${b}`; },
            '/': (a, b) => { return isNum(a) && isNum(b) ? Number(a) / Number(b) : `${a}/${b}`; },
            '*': (a, b) => { return isNum(a) && isNum(b) ? Number(a) * Number(b) : `${a}*${b}`; },
            '%': (a, b) => { return isNum(a) && isNum(b) ? Number(a) % Number(b) : `${a}%${b}`; }
        };
        const isString = (s) => 'string' === typeof s || s instanceof String;
        const evalops = o => {
            if (!o.code || !isString(o.code)) return;
            o.known = o.known || {};
            Object.assign(o.known, knownbank);
            try {
                const getVal = t => {
                    switch (t.type) {
                        case 'number':
                            return t.value;
                        case 'name':
                            return o.known.hasOwnProperty(t.id.trim()) ? o.known[t.id.trim()] : t.id;
                        case 'func':
                            return funcbank[t.func](...t.params.map(p => getVal(p)));
                        default:
                            return typeprocessor[t.type](getVal(t.left), getVal(t.right));
                    }
                };
                return getVal(parse(o));
            } catch (error) {
                return { message: error };
            }
        };
        return evalops;
    })();
    const mathrx = /(\()?{&\s*math\s*([^}]+)\s*}((?<=\({&\s*math\s*([^}]+)\s*})\)|\1)/g;

    const testConstructs = c => {
        let result = mathrx.test(c);
        mathrx.lastIndex = 0;
        return result;
    };
    const handleInput = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        msg.content = msg.content.replace(mathrx, (m, padding, g1) => {
            g1 = g1.replace(/\$\[\[(\d+)]]/g, (m1, roll) => {
                let rollval;
                if (msg.parsedinline) {
                    rollval = msg.parsedinline[roll].value;
                } else if (msg.inlinerolls && msg.inlinerolls[roll]) {
                    rollval = msg.inlinerolls[roll].results.total;
                } else {
                    rollval = 0;
                }
                return rollval;
            });
            let result = mathprocessor({ code: g1, known: msg.variables || {} });
            if (result.message) { // error
                status.push('unresolved');
                notes.push(result.message);
                return m;
            } else {
                status.push('changed');
                return result;
            }
        });
        funcret.runloop = (status.includes('changed') || status.includes('unresolved'));
        funcret.status = status.reduce((m, v) => {
            switch (m) {
                case 'unchanged':
                    m = v;
                    break;
                case 'changed':
                    m = v === 'unresolved' ? v : m;
                    break;
                case 'unresolved':
                    break;
            }
            return m;
        });
        funcret.notes = notes.join('<br>');
        return funcret;
    };

    let scriptisplugin = false;
    const mathops = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        logsig();
        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(mathops, { priority: 55, handles: ['math'] });
        }
    });
    return {
        MathProcessor: mathprocessor
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.MathOps.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.MathOps.offset); } }
/* */
/*
================================================================
END SCRIPT: MathOps
================================================================
*/

/*
================================================================
BEGIN SCRIPT: MatrixMath
SOURCE FILE: MatrixMath.md
================================================================
*/
/**
 * This script provides a library for performing affine matrix operations
 * inspired by the [glMatrix library](http://glmatrix.net/) developed by
 * Toji and SinisterChipmunk.
 *
 * Unlike glMatrix, this library does not have operations for vectors.
 * However, my VectorMath script provides a library providing many kinds of
 * common vector operations.
 *
 * This project has no behavior on its own, but its functions are used by
 * other scripts to do some cool things, particular for math involving 2D and
 * 3D geometry.
 */
var MatrixMath = (function() {
  /**
   * An NxN square matrix, represented as a 2D array of numbers in column-major
   * order. For example, mat[3][2] would get the value in column 3 and row 2.
   * order.
   * @typedef {number[][]} Matrix
   */

  /**
   * An N-degree vector.
   * @typedef {number[]} Vector
   */

  /**
   * Gets the adjugate of a matrix, the tranpose of its cofactor matrix.
   * @param  {Matrix} mat
   * @return {Matrix}
   */
  function adjoint(mat) {
    var cofactorMat = MatrixMath.cofactorMatrix(mat);
    return MatrixMath.transpose(cofactorMat);
  }

   /**
    * Produces a clone of an NxN square matrix.
    * @param  {Matrix} mat
    * @return {Matrix}
    */
  function clone(mat) {
    return _.map(mat, function(column) {
      return _.map(column, function(value) {
        return value;
      });
    });
  }

  /**
   * Gets the cofactor of a matrix at a specified column and row.
   * @param  {Matrix} mat
   * @param  {uint} col
   * @param  {uint} row
   * @return {number}
   */
  function cofactor(mat, col, row) {
    return Math.pow(-1, col+row)*MatrixMath.minor(mat, col, row);
  }

  /**
   * Gets the cofactor matrix of a matrix.
   * @param  {Matrix} mat
   * @return {Matrix}
   */
  function cofactorMatrix(mat) {
    var result = [];
    var size = MatrixMath.size(mat);
    for(var col=0; col<size; col++) {
      result[col] = [];
      for(var row=0; row<size; row++) {
        result[col][row] = MatrixMath.cofactor(mat, col, row);
      }
    }
    return result;
  }

  /**
   * Gets the determinant of an NxN matrix.
   * @param  {Matrix} mat
   * @return {number}
   */
  function determinant(mat) {
    var size = MatrixMath.size(mat);

    if(size === 2)
      return mat[0][0]*mat[1][1] - mat[1][0]*mat[0][1];
    else {
      var sum = 0;
      for(var col=0; col<size; col++) {
        sum += mat[col][0] * MatrixMath.cofactor(mat, col, 0);
      }
      return sum;
    }
  }

  /**
   * Tests if two matrices are equal.
   * @param  {Matrix} a
   * @param  {Matrix} b
   * @param {number} [tolerance=0]
   *        If specified, this specifies the amount of tolerance to use for
   *        each value of the matrices when testing for equality.
   * @return {boolean}
   */
  function equal(a, b, tolerance) {
    tolerance = tolerance || 0;
    var sizeA = MatrixMath.size(a);
    var sizeB = MatrixMath.size(b);

    if(sizeA !== sizeB)
      return false;

    for(var col=0; col<sizeA; col++) {
      for(var row=0; row<sizeA; row++) {
        if(Math.abs(a[col][row] - b[col][row]) > tolerance)
          return false;
      }
    }
    return true;
  }

  /**
   * Produces an identity matrix of some size.
   * @param  {uint} size
   * @return {Matrix}
   */
  function identity(size) {
    var mat = [];
    for(var col=0; col<size; col++) {
      mat[col] = [];
      for(var row=0; row<size; row++) {
        if(row === col)
          mat[col][row] = 1;
        else
          mat[col][row] = 0;
      }
    }
    return mat;
  }

  /**
   * Gets the inverse of a matrix.
   * @param  {Matrix} mat
   * @return {Matrix}
   */
  function inverse(mat) {
    var determinant = MatrixMath.determinant(mat);
    if(determinant === 0)
      return undefined;

    var adjoint = MatrixMath.adjoint(mat);
    var result = [];
    var size = MatrixMath.size(mat);
    for(var col=0; col<size; col++) {
      result[col] = [];
      for(var row=0; row<size; row++) {
        result[col][row] = adjoint[col][row]/determinant;
      }
    }
    return result;
  }

  /**
   * Gets the determinant of a matrix omitting some column and row.
   * @param  {Matrix} mat
   * @param  {uint} col
   * @param  {uint} row
   * @return {number}
   */
  function minor(mat, col, row) {
    var reducedMat = MatrixMath.omit(mat, col, row);
    return determinant(reducedMat);
  }


  /**
   * Returns the matrix multiplication of a*b.
   * This function works for non-square matrices (and also for transforming
   * vectors by a matrix).
   * For matrix multiplication to work, the # of columns in A must be equal
   * to the # of rows in B.
   * The resulting matrix will have the same number of rows as A and the
   * same number of columns as B.
   * If b was given as a vector, then the result will also be a vector.
   * @param  {Matrix} a
   * @param  {Matrix|Vector} b
   * @return {Matrix|Vector}
   */
  function multiply(a, b) {
    // If a vector is given for b, convert it to a nx1 matrix, where n
    // is the length of b.
    var bIsVector = _.isNumber(b[0]);
    if(bIsVector)
      b = [b];

    var colsA = a.length;
    var rowsA = a[0].length;
    var colsB = b.length;
    var rowsB = b[0].length;
    if(colsA !== rowsB)
      throw new Error('MatrixMath.multiply ERROR: # columns in A must be ' +
        'the same as the # rows in B. Got A: ' + rowsA + 'x' + colsA +
        ', B: ' + rowsB + 'x' + colsB + '.');

    var result = [];
    for(var col=0; col<colsB; col++) {
      result[col] = [];
      for(var row=0; row<rowsA; row++) {
        result[col][row] = 0;
        for(var i=0; i<colsA; i++) {
          result[col][row] += a[i][row] * b[col][i];
        }
      }
    }

    if(bIsVector)
      result = result[0];
    return result;
  }

  /**
   * Returns a matrix with a column and row omitted.
   * @param  {Matrix} mat
   * @param  {uint} col
   * @param  {uint} row
   * @return {Matrix}
   */
  function omit(mat, col, row) {
    var result = [];

    var size = MatrixMath.size(mat);
    for(var i=0; i<size; i++) {
      if(i === col)
        continue;

      var column = [];
      result.push(column);
      for(var j=0; j<size; j++) {
        if(j !== row)
          column.push(mat[i][j]);
      }
    }
    return result;
  }

  /**
   * Produces a 2D rotation affine transformation. The direction of the
   * rotation depends upon the coordinate system.
   * @param  {number} angle
   *         The angle, in radians.
   * @return {Matrix}
   */
  function rotate(angle) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    return [[cos, sin, 0], [-sin, cos, 0], [0,0,1]];
  }

  /**
   * Produces a 2D scale affine transformation matrix.
   * The matrix is used to transform homogenous coordinates, so it is
   * actually size 3 instead of size 2, despite being used for 2D geometry.
   * @param  {(number|Vector)} amount
   *         If specified as a number, then it is a uniform scale. Otherwise,
   *         it defines a scale by parts.
   * @return {Matrix}
   */
  function scale(amount) {
    if(_.isNumber(amount))
      amount = [amount, amount];
    return [[amount[0], 0, 0], [0, amount[1], 0], [0, 0, 1]];
  }

  /**
   * Gets the size N of a NxN square matrix.
   * @param  {Matrix} mat
   * @return {uint}
   */
  function size(mat) {
    return mat[0].length;
  }

  /**
   * Produces a 2D translation affine transformation matrix.
   * The matrix is used to transform homogenous coordinates, so it is
   * actually size 3 instead of size 2, despite being used for 2D geometry.
   * @param  {Vector} vec
   * @return {Matrix}
   */
  function translate(vec) {
    return [[1,0,0], [0,1,0],[vec[0], vec[1], 1]];
  }

  /**
   * Returns the transpose of a matrix.
   * @param  {Matrix} mat
   * @return {Matrix}
   */
  function transpose(mat) {
    var result = [];

    var size = MatrixMath.size(mat);
    for(var col=0; col<size; col++) {
      result[col] = [];
      for(var row=0; row<size; row++) {
        result[col][row] = mat[row][col];
      }
    }
    return result;
  }


  return {
    adjoint: adjoint,
    clone: clone,
    cofactor: cofactor,
    cofactorMatrix: cofactorMatrix,
    determinant: determinant,
    equal: equal,
    identity: identity,
    inverse: inverse,
    minor: minor,
    multiply: multiply,
    omit: omit,
    rotate: rotate,
    scale: scale,
    size: size,
    translate: translate,
    transpose: transpose
  };
})();



// Perform unit tests. Inform us in the log if any test fails. Otherwise,
// succeed silently.
(function() {
  /**
   * Asserts that some boolean expression is true. Otherwise, it throws
   * an error.
   * @param {boolean} test    Some expression to test.
   * @param {string} failMsg  A message displayed if the test fails.
   */
  function assert(test, failMsg) {
    if(!test)
      throw new Error(failMsg);
  }

  function assertEqual(actual, expected, tolerance) {
    assert(MatrixMath.equal(actual, expected, tolerance),
      'Expected: ' + JSON.stringify(expected) +
      '\nActual: ' + JSON.stringify(actual));
  }

  /**
   * Performs a unit test.
   * If it fails, then the test's name and the error is displayed.
   * It is silent if the test passes.
   * @param  {string} testName
   * @param  {function} testFn
   */
  function unitTest(testName, testFn) {
    try {
      testFn();
    }
    catch(err) {
      log('TEST ' + testName);
      log('ERROR: ');
      var messageLines = err.message.split('\n');
      _.each(messageLines, function(line) {
        log(line);
      });
    }
  }


  unitTest('MatrixMath.equal()', function() {
    var a = [[1,2,3], [4,5,6], [7,8,9]];
    var b = [[1,2,3], [4,5,6], [7,8,9]];
    var c = [[0,0,0], [1,1,1], [2,2,2]];
    assert(MatrixMath.equal(a,b));
    assert(!MatrixMath.equal(a,c));
  });

  unitTest('MatrixMath.adjoint()', function() {
    // Example taken from http://www.mathwords.com/a/adjoint.htm
    var a = [[1,0,1], [2,4,0], [3,5,6]];

    var actual = MatrixMath.adjoint(a);
    var expected = [[24, 5, -4], [-12,3,2], [-2,-5,4]];

    assertEqual(actual, expected);
  });

  unitTest('MatrixMath.clone()', function() {
    var a = [[1,2,3], [4,5,6], [7,8,9]];
    var clone = MatrixMath.clone(a);
    assertEqual(a, clone);
    assert(a !== clone, 'should not be equal by reference.');
  });

  unitTest('MatrixMath.cofactor()', function() {
    // Example taken from http://www.mathwords.com/c/cofactor_matrix.htm.
    var a = [[1,0,1], [2,4,0], [3,5,6]];

    var actual = MatrixMath.cofactor(a,0,0);
    var expected = 24;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);

    var actual = MatrixMath.cofactor(a,1,0);
    var expected = 5;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);

    var actual = MatrixMath.cofactor(a,2,0);
    var expected = -4;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);

    var actual = MatrixMath.cofactor(a,0,1);
    var expected = -12;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);

    var actual = MatrixMath.cofactor(a,1,1);
    var expected = 3;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);

    var actual = MatrixMath.cofactor(a,2,1);
    var expected = 2;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);

    var actual = MatrixMath.cofactor(a,0,2);
    var expected = -2;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);

    var actual = MatrixMath.cofactor(a,1,2);
    var expected = -5;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);

    var actual = MatrixMath.cofactor(a,2,2);
    var expected = 4;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);
  });

  unitTest('MatrixMath.cofactorMatrix()', function() {
    // Example taken from http://www.mathwords.com/c/cofactor_matrix.htm.
    var a = [[1,0,1], [2,4,0], [3,5,6]];
    var actual = MatrixMath.cofactorMatrix(a);
    var expected = [[24, -12, -2], [5, 3, -5], [-4, 2, 4]];
    assertEqual(actual, expected);
  });

  unitTest('MatrixMath.determinant()', function() {
    var a = [[1,2], [3,4]];
    var actual = MatrixMath.determinant(a);
    var expected = -2;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);

    var a = [[1,5,0,2], [3,1,1,-1], [-2,0,0,0], [1,-1,-2,3]];
    var actual = MatrixMath.determinant(a);
    var expected = -6;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);
  });

  unitTest('MatrixMath.identity()', function() {
    var actual = MatrixMath.identity(3);
    var expected = [[1,0,0], [0,1,0], [0,0,1]];
    assertEqual(actual, expected);

    var actual = MatrixMath.identity(2);
    var expected = [[1,0], [0,1]];
    assertEqual(actual, expected);
  });

  unitTest('MatrixMath.inverse()', function() {
    // Example taken from http://www.mathwords.com/i/inverse_of_a_matrix.htm
    var a = [[1,0,1], [2,4,0], [3,5,6]];
    var actual = MatrixMath.inverse(a);
    var expected = [[12/11, 5/22, -2/11],
                    [-6/11, 3/22, 1/11],
                    [-1/11, -5/22, 2/11]];
    assertEqual(actual, expected);

    var inverse = MatrixMath.multiply(a, actual);
    var expected = MatrixMath.identity(3);
    assertEqual(inverse, expected, 0.001);
  });

  unitTest('MatrixMath.minor()', function() {
    var a = [[1,2,3], [4,5,6], [7,8,9]];
    var actual = MatrixMath.minor(a, 1, 1);
    var expected = -12;
    assert(actual === expected, 'Got ' + actual + '\nExpected ' + expected);
  });

  unitTest('MatrixMath.multiply()', function() {
    var a = [[1,2,3], [4,5,6], [7,8,9]];
    var b = [[9,8,7], [6,5,4], [3,2,1]];
    var actual = MatrixMath.multiply(a,b);
    var expected = [[90, 114, 138], [54,69,84], [18,24,30]];
    assertEqual(actual, expected);
  });

  unitTest('Matrix.multiply() to transform a vector', function() {
    // A 2D point in homogenous coordinates.
    var pt = [1,2,1];

    var scale = MatrixMath.scale([10,20]);
    var rotate = MatrixMath.rotate(Math.PI/2);
    var translate = MatrixMath.translate([2,-8]);

    var m = MatrixMath.multiply(scale, rotate);
    m = MatrixMath.multiply(m, translate);

    // Transform the point.
    var actual = MatrixMath.multiply(m, pt);
    var expected = [60, 60, 1];
    assertEqual(actual, expected, 0.01);
  });

  unitTest('MatrixMath.omit()', function() {
    var a = [[1,2,3], [4,5,6], [7,8,9]];
    var actual = MatrixMath.omit(a, 1, 2);
    var expected = [[1,2], [7,8]];
    assertEqual(actual, expected);
  });

  unitTest('MatrixMath.size()', function() {
    var a = [[1,2,3], [4,5,6], [7,8,9]];
    assert(MatrixMath.size(a) === 3);

    var b = [[1,2],[3,4]];
    assert(MatrixMath.size(b) === 2);
  });

  unitTest('MatrixMath.transpose()', function() {
    var a = [[1,2,3], [4,5,6], [7,8,9]];
    var expected = [[1,4,7], [2,5,8], [3,6,9]];
    var transpose = MatrixMath.transpose(a);
    assertEqual(transpose, expected);
  });



})();
/*
================================================================
END SCRIPT: MatrixMath
================================================================
*/

/*
================================================================
BEGIN SCRIPT: APILogic
SOURCE FILE: APILogic.md
================================================================
*/
/*
=========================================================
Name			:	APILogic
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/APILogic
Roll20 Contact	:	timmaugh
Version			:	2.0.9
Last Update		:	5 SEP 2024
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.APILogic = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.APILogic.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const APILogic = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'APILogic';
    API_Meta[apiproject].version = '2.0.9';
    const schemaVersion = 0.1;
    const vd = new Date(1725559091022);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {
                case 0.1:
                /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                    };
                    break;
            }
        }
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };

    // REGEXES ==============================================
    const defblockrx = /(\$?){&\s*define\s*/i,
        definitionrx = /\(\s*\[\s*(?<term>.+?)\s*]\s*('|"|`?)(?<definition>.*?)\2\)\s*/i,
        ifrx = /(\()?{&\s*if(?=\(|\s+|!)\s*/i,
        elseifrx = /(\()?{&\s*elseif(?=\(|\s+|!)\s*/i,
        elserx = /(\()?{&\s*else\s*(?=})/i,
        endrx = /(\()?{&\s*end\s*}((?<=\({&\s*end\s*})\)|\1)/i;
    // FORMERLY in IFTREEPARSER =============================
    const groupopenrx = /^\s*(?<negation>!?)\s*\((?!{&\d+}\))\s*/,
        namerx = /^\[(?<groupname>[^\s]+?)]\s*/i,
        comprx = /^(?<operator>(?:>=|<=|~|!~|=|!=|<|>))\s*/,
        operatorrx = /^(?<operator>(?:&&|\|\|))\s*/,
        groupendrx = /^\)\s*/,
        ifendrx = /^\s*}/,
        ifendparenrx = /^\s*}\)/,
        textrx = /^(?<negation>!?)\s*(`|'|"?)(?<argtext>\({&\d+}\)|.+?)\2\s*(?=!=|!~|>=|<=|[=~><]|&&|\|\||\)|})/;
    // TOKEN MARKERS ========================================
    const iftm = { rx: ifrx, type: 'if' },
        elseiftm = { rx: elseifrx, type: 'elseif' },
        elsetm = { rx: elserx, type: 'else' },
        endtm = { rx: endrx, type: 'end' },
        eostm = { rx: /$/, type: 'eos' },
        groupendtm = { rx: groupendrx, type: 'groupend' },
        ifendtm = { rx: ifendrx, type: 'mainconditions' },
        operatortm = { rx: operatorrx, type: 'operator' },
        texttm = { rx: textrx, type: 'text' },
        defblocktm = { rx: defblockrx, type: 'defblock' },
        comptm = { rx: comprx, type: 'comp' };

    // END TOKEN REGISTRY ===================================
    const endtokenregistry = {
        main: [eostm],
        if: [elseiftm, elsetm, endtm],
        elseif: [elseiftm, elsetm, endtm],
        else: [endtm],
        mainconditions: [ifendtm],
        group: [groupendtm],
    };

    const nestlog = (stmt, ilvl = 0, logcolor = '', boolog = false) => {
        if (isNaN(ilvl)) {
            ilvl = 0;
            log(`Next statement fed a NaN value for the indentation.`);
        }
        if ((state[apiproject] && state[apiproject].logging === true) || boolog) {
            let l = `${Array(ilvl + 1).join("==")}${stmt}`;
            if (logcolor) {
                // l = /:/.test(l) ? `<span style="color:${logcolor};">${l.replace(/:/, ':</span>')}` : `<span style="color:${logcolor};">${l}</span>`;
            }
            log(l);
        }
    };

    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const assertstart = rx => new RegExp(`^${rx.source}`, rx.flags);
    const getfirst = (cmd, ...args) => {
        // pass in objects of form: {type: 'text', rx: /regex/}
        // return object of form  : {regex exec object with property 'type': 'text'}

        let ret = {};
        let r;
        args.find(a => {
            r = a.rx.exec(cmd);
            if (r && (!ret.length || r.index < ret.index)) {
                ret = Object.assign(r, { type: a.type });
            }
            a.lastIndex = 0;
        }, ret);
        return ret;
    };
    const internalTestLib = {
        'int': (v) => +v === +v && parseInt(parseFloat(v, 10), 10) == v,
        'num': (v) => +v === +v,
        'tru': (v) => v == true
    };

    // ==================================================
    //		PARSER PROCESSING
    // ==================================================
    const ifTreeParser = (msg, msgstate, status, notes) => {

        class TextToken {
            constructor() {
                this.type = 'text';
                this.value = '';
            }
        }
        class IfToken {
            constructor() {
                this.type = 'if';
                this.conditions = [];
                this.contents = [];
                this.else = {};
            }
        }
        class GroupToken {
            constructor() {
                this.type = 'group';
                this.name = '';
                this.contents = [];
                this.next = '';
                this.negate = false;
            }
        }
        class ConditionToken {
            constructor() {
                this.type = 'condition';
                this.contents = [];
                this.next = '';
                this.negate = false;
            }
        }

        const val = c => {
            // expects an object in the form of:
            // { cmd: text, indent: #, type: main/if/elseif/else, overallindex: #}
            let tokens = [];				// main output array
            let logcolor = 'aqua';
            let loopstop = false;
            let tokenres = {};
            let index = 0;
            let loopindex = 0;
            nestlog(`VAL BEGINS`, c.indent, logcolor, msgstate.logging);
            while (!loopstop) {
                loopindex = index;
                if (assertstart(ifrx).test(c.cmd.slice(index))) {
                    status.push('changed');
                    tokenres = getIfToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index });
                } else {
                    tokenres = getTextToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index });
                }
                if (tokenres) {
                    if (tokenres.error) { return tokenres; }
                    tokens.push(tokenres.token);
                    index += tokenres.index;
                }
                if (loopindex === index) {				// nothing detected, loop never ends
                    return { error: `Unexpected token at ${c.overallindex + index}.` };
                }
                loopstop = (getfirst(c.cmd.slice(index), ...endtokenregistry[c.type]).index === 0);
            }
            nestlog(`VAL ENDS`, c.indent, logcolor, msgstate.logging);
            return { tokens: tokens, index: index };
        };
        const getTextToken = (c) => {
            let logcolor = 'lawngreen';
            nestlog(`TEXT INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
            let markers = [];
            c.looptype = c.looptype || '';
            switch (c.looptype) {
                case 'def':
                    markers = [defblocktm, eostm];
                    break;
                case 'eval':
                    markers = [evaltm, evalendtm, eostm];
                    break;
                case 'eval1':
                    markers = [eval1tm, eval1endtm, eostm];
                    break;
                default:
                    markers = [iftm, elseiftm, elsetm, endtm, eostm];
                    break;
            }
            let res = getfirst(c.cmd, ...markers);
            let index = res.index;
            let token = new TextToken();
            token.value = c.cmd.slice(0, index);
            nestlog(`TEXT KEEPS: ${token.value}`, c.indent, logcolor, msgstate.logging);
            //log(`<pre>${syntaxHighlight(token)}</pre>`);
            return { token: token, index: index };
        };
        const getIfToken = (c) => {

            // receives object in the form of:
            // {cmd: command line slice, indent: #, type: if/else}
            let logcolor = 'yellow';
            let res = getfirst(c.cmd, iftm, elseiftm, elsetm);
            // one of these should be at the 0 index position
            if (res && res.index === 0) {
                nestlog(`IF INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
                let token = new IfToken();
                let index = res[0].length;

                // groups and conditions
                if (['if', 'elseif'].includes(res.type)) {
                    let condres = getConditions({ cmd: c.cmd.slice(index), indent: c.indent + 1, type: 'mainconditions', overallindex: c.overallindex + index });
                    if (condres.error) { return condres; }
                    token.conditions = condres.tokens;
                    index += condres.index;
                }

                // closing bracket of if/elseif/else tag
                let ifendres = (res[1] ? ifendparenrx : ifendrx).exec(c.cmd.slice(index));
                if (!ifendres) { // no end brace or the parens do not match
                    return { error: `Unexpected token at ${c.overallindex + index}. Expected end of logic structure ('}'), but saw: ${c.cmd.slice(index, index + 10)}` };
                }
                index += ifendres[0].length;

                // text content and nested ifs
                nestlog(`BUILDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);
                let contentres = val({ cmd: c.cmd.slice(index), indent: c.indent + 2, type: res.type, overallindex: c.overallindex + index });
                if (contentres.error) return contentres;
                token.contents = contentres.tokens;
                index += contentres.index;
                nestlog(`ENDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);

                // else cases
                let firstelseres = getfirst(c.cmd.slice(index), ...endtokenregistry[res.type]);
                if (firstelseres && firstelseres.type !== 'end' && firstelseres.index === 0) {
                    nestlog(`BUILDING ELSE: ${c.cmd.slice(index)}`, c.indent + 1, 'lightsalmon', msgstate.logging);
                    let elseres = getIfToken({ cmd: c.cmd.slice(index), indent: c.indent + 2, type: firstelseres.type, overallindex: c.overallindex + index });
                    token.else = elseres.token || [];
                    index += elseres.index;
                    nestlog(`ENDING ELSE: ${c.cmd.slice(index)}`, c.indent + 1, 'lightsalmon', msgstate.logging);
                }
                // end token (only for full IF blocks)
                if (res.type === 'if') {
                    let endres = assertstart(endrx).exec(c.cmd.slice(index));
                    if (!endres) {
                        return { error: `Unexpected token at ${c.overallindex + index}. Expected logical structure (END), but saw: ${c.cmd.slice(index, index + 10)}` };
                    }
                    index += endres[0].length;
                }
                nestlog(`IF OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor, msgstate.logging);
                //log(`<pre>${syntaxHighlight(token)}</pre>`);
                return { token: token, index: index };
            } else {
                return { error: `Unexpected token at ${c.overallindex + index}. Expected a logic structure (IF, ELSEIF, or ELSE), but saw: ${c.cmd.slice(index, index + 10)}` };
            }
        };
        const getConditions = (c) => {
            // expects object in the form {cmd: text, indent: #, type: mainconditions/group, overallindex: #}
            let tokens = [];				// main output array
            let logcolor = 'darkorange';
            let loopstop = false;
            let tokenres = {};
            let index = 0;
            let loopindex = 0;
            nestlog(`GETCONDITIONS BEGINS`, c.indent, logcolor, msgstate.logging);
            while (!loopstop) {
                loopindex = index;
                if (groupopenrx.test(c.cmd.slice(index))) {
                    tokenres = getGroupToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index });
                } else {
                    tokenres = getConditionToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index });
                }
                if (tokenres) {
                    if (tokenres.error) return tokenres;
                    tokens.push(tokenres.token);
                    index += tokenres.index;

                }
                if (loopindex === index) {		// no token found, loop won't end
                    return { error: `Unexpected token at ${c.overallindex + index}.` };
                }
                loopstop = (getfirst(c.cmd.slice(index), ...endtokenregistry[c.type]).index === 0);
            }
            nestlog(`GETCONDITIONS ENDS`, c.indent, logcolor, msgstate.logging);
            return { tokens: tokens, index: index };
        };
        const getGroupToken = (c) => {
            let logcolor = 'violet';
            let index = 0;
            let groupres = groupopenrx.exec(c.cmd);
            if (groupres) {
                nestlog(`GROUP INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
                index += groupres[0].length;
                let token = new GroupToken();
                // negation
                token.negate = !!groupres.groups.negation;
                // name
                let nameres = namerx.exec(c.cmd.slice(index));
                if (nameres) {
                    token.name = nameres.groups.groupname;
                    index += nameres[0].length;
                }

                // text content and nested groups
                nestlog(`BUILDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);
                let contentres = getConditions({ cmd: c.cmd.slice(index), indent: c.indent + 2, type: 'group', overallindex: c.overallindex + index });
                if (contentres) {
                    if (contentres.error) { return contentres; }
                    token.contents = contentres.tokens;
                    index += contentres.index;
                }
                nestlog(`ENDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);

                // closing paren of group
                let groupendres = groupendrx.exec(c.cmd.slice(index));
                if (!groupendres) {
                    return { error: `Unexpected token at ${c.overallindex + index}. Expected the end of a group but saw: ${c.cmd.slice(index, index + 10)}` };
                }
                index += groupendres[0].length;

                // connecting operator
                let operatorres = operatorrx.exec(c.cmd.slice(index));
                if (operatorres) {
                    token.next = operatorres.groups.operator;
                    index += operatorres[0].length;
                }

                nestlog(`GROUP OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor, msgstate.logging);
                //log(`<pre>${syntaxHighlight(token)}</pre>`);
                return { token: token, index: index };
            }
        };
        const getConditionToken = (c) => {
            let logcolor = 'white';
            let index = 0;
            let firstargres = getfirst(c.cmd, comptm, texttm);
            if (firstargres) {
                nestlog(`CONDITION INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
                let token = new ConditionToken();
                if (firstargres.type === 'comp') {
                    firstargres = getfirst(' =', texttm);
                } else {
                    index += firstargres[0].length;
                }
                token.contents.push(firstargres);

                let compres = comprx.exec(c.cmd.slice(index));
                if (compres) {
                    index += compres[0].length;
                    let secondargres = getfirst(c.cmd.slice(index), groupendtm, ifendtm, operatortm, texttm);
                    if (secondargres && ![groupendtm.type, ifendtm.type, operatortm.type].includes(secondargres.type)) {
                        index += secondargres[0].length;
                    } else {					// comparison operator with no second arg
                        secondargres = getfirst(' =', texttm);
                    }
                    token.contents.push(secondargres);
                    token.type = compres.groups.operator;
                }
                // connecting operator
                let operatorres = operatorrx.exec(c.cmd.slice(index));
                if (operatorres) {
                    token.next = operatorres.groups.operator;
                    index += operatorres[0].length;
                }
                nestlog(`CONDITION OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor, msgstate.logging);
                //log(`<pre>${syntaxHighlight(token)}</pre>`);
                return { token: token, index: index };

            } else {					// no first arg found, return an error
                return { error: `Unexpected token at ${c.overallindex + index}. Expected a condition argument but saw: {c.cmd.slice(index, index+10)}` };
            }
        };

        const getTermToken = (c) => {
            // receives object in the form of:
            // {cmd: command line slice, indent: #}
            let logcolor = 'yellow';
            let index = 0;
            let res = assertstart(definitionrx).exec(c.cmd);
            if (res) {
                nestlog(`TERM INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
                let tokens = [];
                let loopstop = false;
                while (!loopstop) {
                    tokens.push({ term: res.groups.term, definition: res.groups.definition });
                    nestlog(`TERM DEFINED: ${res.groups.term} = ${res.groups.definition}`, c.indent + 1, logcolor, msgstate.logging);
                    index += res[0].length;
                    res = assertstart(definitionrx).exec(c.cmd.slice(index));
                    if (!res) loopstop = true;
                }

                nestlog(`TERM OUTPUT: ${JSON.stringify(tokens)}`, c.indent, logcolor, msgstate.logging);
                return { token: tokens, index: index };
            } else {
                return { error: `Unexpected token at ${c.overallindex + index}. Expected a term and definition, but saw: ${c.cmd.slice(index, index + 10)}` };
            }
        };
        const defval = c => {
            // expects an object in the form of:
            // { cmd: text, indent: #, defs: [] }
            let tokens = [];				// main text output array
            let defs = c.defs;					// main definition array
            let logcolor = 'aqua';
            let loopstop = false;
            let defendres = {};
            let tokenres = {};
            let index = 0;
            let loopindex = 0;
            let res;
            nestlog(`DEFVAL BEGINS`, c.indent, logcolor, msgstate.logging);
            while (!loopstop) {
                loopindex = index;
                if (assertstart(defblockrx).test(c.cmd.slice(index))) {
                    status.push('changed');
                    res = assertstart(defblockrx).exec(c.cmd.slice(index));
                    index += res[0].length;
                    tokenres = getTermToken({ cmd: c.cmd.slice(index), indent: c.indent + 1 });
                } else {
                    tokenres = getTextToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, looptype: 'def' });
                }
                if (tokenres) {
                    if (tokenres.error) {
                        return tokenres;
                    }
                    index += tokenres.index;
                    if (tokenres.token.type === 'text') {
                        tokens.push(tokenres.token);
                    } else {
                        defendres = (res[1] ? ifendparenrx : ifendrx).exec(c.cmd.slice(index));
                        if (!defendres) { // no end brace or the parens do not match
                            return { error: `Unexpected token at ${c.overallindex + index}. Expected end of definition ('}'), but saw: ${c.cmd.slice(index, index + 10)}` };
                        }
                        index += defendres[0].length;
                        defs = [...defs, ...tokenres.token];
                    }
                }
                if (loopindex === index) {				// nothing detected, loop never ends
                    return { error: `Unexpected token at ${c.overallindex + index}.` };
                }
                loopstop = (getfirst(c.cmd.slice(index), ...endtokenregistry[c.type]).index === 0);
            }

            // get non-definitional text back into a string
            let nondeftext = [];
            tokens.forEach(t => nondeftext.push(t.value));
            let newcmd = nondeftext.join('');
            // replace all term/defs
            defs.forEach(d => {
                newcmd = newcmd.replace(new RegExp(escapeRegExp(d.term), 'g'), d.definition);
            });
            nestlog(`DEFVAL ENDS`, c.indent, logcolor, msgstate.logging);
            return { cmd: newcmd, defs: defs };
        };

        const checkWellFormed = (cmd) => {
            let ifarray = [],
                index = 0,
                nextstructure = getfirst(cmd, iftm, elseiftm, elsetm, endtm, eostm),
                retObj = { wellformed: true, error: '', position: 0 };
            while (index < cmd.length && retObj.wellformed) {
                index += nextstructure.index;
                switch (nextstructure.type) {
                    case 'if':
                        ifarray.push(true);
                        break;
                    case 'elseif':
                    case 'else':
                        if (!ifarray.length) {
                            retObj = { wellformed: false, error: `${nextstructure.type.toUpperCase()} without IF at position ${index}` };
                        } else {
                            if (!ifarray[ifarray.length - 1]) {
                                retObj = { wellformed: false, error: `${nextstructure.type.toUpperCase()} after ELSE at position ${index}` };
                            } else {
                                if (nextstructure.type === 'else') {
                                    ifarray[ifarray.length - 1] = false;
                                }
                            }
                        }
                        break;
                    case 'end':
                        if (!ifarray.length) {
                            retObj = { wellformed: false, error: `END without IF at position ${index}` };
                        } else {
                            ifarray.pop();
                        }
                        break;
                    case 'eos':

                        break;
                }
                if (retObj.wellformed && nextstructure.type !== 'eos') {
                    index += nextstructure[0].length;
                    nextstructure = getfirst(cmd.slice(index), iftm, elseiftm, elsetm, endtm, eostm);
                }

            }
            return retObj;
        };

        const main = (msg) => {
            let retObj = {};

            // DEFINITION BLOCK DETECTION
            let defcmd = defval({ cmd: msg.content, indent: 0, type: 'main', overallindex: 0, defs: [...(msg.definitions || [])] });
            if (!defcmd.cmd) return { tokens: [], error: defcmd.error };
            if (defcmd.defs.length) msg.definitions = defcmd.defs;
            // WELL-FORMED CHECK
            let wf = checkWellFormed(defcmd.cmd);
            if (!wf.wellformed) return { tokens: [], error: wf.error };
            // LOGIC PARSING
            retObj = val({ cmd: defcmd.cmd, indent: 0, type: 'main', overallindex: 0 });

            return retObj;
        }
        return main(msg);
    };
    const reconstructCommandLine = (o, msgstate, status, notes) => {
        const grouplib = {};
        const typeProcessor = {
            '=': (t) => t.contents[0].value == t.contents[1].value,
            '!=': (t) => t.contents[0].value != t.contents[1].value,
            '~': (t) => t.contents[0].value.includes(t.contents[1].value),
            '!~': (t) => !t.contents[0].value.includes(t.contents[1].value),
            '>': (t) => (internalTestLib.num(t.contents[0].value) ? Number(t.contents[0].value) : t.contents[0].value) > (internalTestLib.num(t.contents[1].value) ? Number(t.contents[1].value) : t.contents[1].value),
            '>=': (t) => (internalTestLib.num(t.contents[0].value) ? Number(t.contents[0].value) : t.contents[0].value) >= (internalTestLib.num(t.contents[1].value) ? Number(t.contents[1].value) : t.contents[1].value),
            '<': (t) => (internalTestLib.num(t.contents[0].value) ? Number(t.contents[0].value) : t.contents[0].value) < (internalTestLib.num(t.contents[1].value) ? Number(t.contents[1].value) : t.contents[1].value),
            '<=': (t) => (internalTestLib.num(t.contents[0].value) ? Number(t.contents[0].value) : t.contents[0].value) <= (internalTestLib.num(t.contents[1].value) ? Number(t.contents[1].value) : t.contents[1].value)
        }

        const resolveCondition = (t) => {
            // expects condition token
            // each item in t.contents should be a regex result also with a property type: 'sheetitem', 'rptgitem', 'text' 
            // t.type :: 'condition', '=', '!=', etc.
            // negation is at t.contents[#].groups.negation
            // comparable or usable text is different for text vs sheet item vs rpt item
            // internalTestLib moved to outer scope

            t.contents.forEach(item => {
                item.metavalue = true;
                switch (item.type) {
                    case 'text':
                        item.groups.argtext = item.groups.argtext
                            .replace(/\$\[\[(\d+)]]/g, ((r, g1) => o.parsedinline[g1].value || 0))
                            .replace(/\({&(\d+)}\)/, ((r, g1) => o.parsedinline[g1].value || 0));
                        if (grouplib.hasOwnProperty(item.groups.argtext)) {
                            if (grouplib[item.groups.argtext]) item.value = true;
                            else {
                                item.value = false;
                                item.metavalue = false;
                            }
                        } else {
                            item.value = item.groups.argtext;
                        }
                        break;
                    default:
                        log('Unknown token type in reconstruction');
                        break;
                }
                if (item.groups.negation === '!') {
                    item.value = !item.value;
                    item.metavalue = !item.metavalue;
                }
            })
            if (t.type === 'condition') {
                // single arg tests: exists, is integer, named condition, etc.
                t.value = t.contents[0].metavalue && t.contents[0].value;
                return t;
            } else {
                // two arg tests: =, !=, >, etc.
                t.value = t.contents[0].metavalue && typeProcessor[t.type](t);
            }
            return t;
        };

        const areConditionsTruthy = c => {
            // expects conditions array
            let logcolor = 'lightseagreen';
            let groupname = '';
            let negate = false;
            let res;
            c.memo = c.hasOwnProperty("memo") ? c.memo : { value: false, next: '||' };
            nestlog(`CONDITIONS TEST BEGINS`, c.indent, logcolor, msgstate.logging);
            let o = c.tokens.reduce((m, v, i) => {
                if ((!m.value && m.next === '&&') || (m.value && m.next === '||')) {
                    nestlog(`==TEST SKIPPED`, c.indent, logcolor, msgstate.logging);
                } else {
                    if (v.type === 'group') {
                        nestlog(`==AND-GROUP DETECTED: ${v.name || 'no name'}`, c.indent, logcolor, msgstate.logging);
                        groupname = v.name;
                        negate = v.negate;
                        res = areConditionsTruthy({ tokens: v.contents, indent: c.indent + 1, memo: { ...m } });
                        v.value = res.value;
                        if (groupname) {
                            grouplib[groupname] = v.value;
                        }
                        if (negate) v.value = !v.value;
                    } else {
                        nestlog(`==AND-CONDITION DETECTED: lhs>${v.contents[0]} type>${v.type} rhs>${v.contents[1] || ''}`, c.indent, logcolor, msgstate.logging);
                        ret = resolveCondition(v);
                        v.value = ret.value;
                    }
                    nestlog(`==VALUE: ${v.value}`, c.indent, logcolor, msgstate.logging);
                    m.value = m.next === '&&' ? m.value && v.value : m.value || v.value;
                }
                m.next = v.next;
                nestlog(`==LOOP END MEMO VALUE: ${m.value}, ${m.next}`, c.indent, logcolor, msgstate.logging);
                return m;
            }, c.memo);

            nestlog(`CONDITIONS TEST ENDS: Conditions are ${o.value}, ${o.next}`, c.indent, logcolor, msgstate.logging);
            return o;
        };

        const processContents = c => {
            // expects contents array
            let logcolor = 'aqua';
            nestlog(`PROCESS CONTENT BEGINS`, c.indent, logcolor, msgstate.logging);
            let tokens = c.tokens.reduce((m, v, i) => {
                nestlog(`==TOKEN ${i}: ${JSON.stringify(v)}`, c.indent, 'violet', msgstate.logging);
                if (v.type === 'text') {
                    nestlog(`====DETECTED TEXT: ${v.value}`, c.indent, 'lawngreen', msgstate.logging);
                    m.push(v.value);
                } else if (v.type === 'if') {
                    nestlog(`====DETECTED IF`, c.indent, 'yellow', msgstate.logging);
                    if (!v.conditions.length || areConditionsTruthy({ tokens: v.conditions, indent: c.indent + 1 }).value) {
                        nestlog(`======TRUE CASE`, c.indent, 'darkorange', msgstate.logging);
                        m.push(processContents({ tokens: v.contents, indent: c.indent + 1 }).join(''));
                    } else if (v.else) {
                        nestlog(`======TESTING ELSE CASE`, c.indent, 'darkorange', msgstate.logging);
                        m.push(processContents({ tokens: [v.else], indent: c.indent + 1 }).join(''));
                    }
                }
                nestlog(`==END OF TOKEN`, c.indent, 'violet', msgstate.logging);
                return m;
            }, []);
            nestlog(`PROCESS CONTENT ENDS`, c.indent, logcolor, msgstate.logging);
            return tokens;
        };
        let content = processContents({ tokens: o.tokens, indent: 0 }).join('');
        return { content: content, logicgroups: grouplib };
    };

    const condensereturn = (funcret, status, notes) => {
        funcret.runloop = (status.includes('changed') || status.includes('unresolved'));
        if (status.length) {
            funcret.status = status.reduce((m, v) => {
                switch (m) {
                    case 'unchanged':
                        m = v;
                        break;
                    case 'changed':
                        m = v === 'unresolved' ? v : m;
                        break;
                    case 'unresolved':
                        break;
                }
                return m;
            });
        }
        funcret.notes = notes.join('<br>');
        return funcret;
    };

    // ==================================================
    //      TEST CONSTRUCTS
    // ==================================================
    const testConstructs = (c) => {
        let result = ifrx.test(c) || defblockrx.test(c);
        ifrx.lastIndex = 0;
        defblockrx.lastIndex = 0;

        return result;
    };

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) {
            if (!msg.definitions || !msg.definitions.length) return funcret;
            let termrx = new RegExp(msg.definitions.map(d => escapeRegExp(d.term)).join('|'), 'gm');
            if (!termrx.test(msg.content)) return funcret;
        }
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        const linebreak = '({&br-al})';
        msg.content = msg.content.replace(/<br\/>\n/g, linebreak);

        msg.logicgroups = msg.logicgroups || {};
        msg.definitions = msg.definitions || [];
        let o = ifTreeParser(msg, msgstate, status, notes);
        if (o.error) {
            status.push('unresolved');
            notes.push(o.error);
            log(o.error);
            log(msg.content);
            return condensereturn(funcret, status, notes);
        }
        if (o.tokens) {
            // reconstruct command line
            o.playerid = msg.playerid;
            o.logicgroups = msg.logicgroups;
            o.parsedinline = msg.parsedinline || [];
            let reconstruct = reconstructCommandLine(o, msgstate, status, notes);
            if (msg.content !== reconstruct.content) status.push('chnaged');
            msg.content = reconstruct.content;
            msg.content = msg.content.replace(new RegExp(escapeRegExp(linebreak), 'g'), '<br/>\n');
            msg.logicgroups = reconstruct.logicgroups;
        } else {
            status.push('unresolved');
            notes.push('Unexpected error encountered. Unable to reconstruct command line.');
            return condensereturn(funcret, status, notes);
        }
        return condensereturn(funcret, status, notes);
    };

    let scriptisplugin = false;
    const apilogic = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        logsig();
        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(apilogic, { priority: 70, handles: ['apil', 'logic'] });
        }
    });

    return {
    }
})();
{ try { throw new Error(''); } catch (e) { API_Meta.APILogic.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.APILogic.offset); } }
/*
================================================================
END SCRIPT: APILogic
================================================================
*/

/*
================================================================
BEGIN SCRIPT: checkLightLevel
SOURCE FILE: checkLightLevel.md
================================================================
*/
/* globals on findObjs getObj playerIsGM log sendChat PathMath Plugger */
var API_Meta = API_Meta || {};
API_Meta.checkLightLevel = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.checkLightLevel.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); } }

const checkLightLevel = (() => { //eslint-disable-line no-unused-vars

  const scriptName = 'checkLightLevel',
    scriptVersion = '0.5.0',
    debugLogging = false,
    consolePassthrough = true;  // set to false if you want debug logs sent to the Roll20 API console (yuck)

  const debug = (() => {
    const send = (logLevel, ...msgs) => {
      if (!debugLogging) return;
      if (consolePassthrough) {
        console[logLevel](...msgs);
      }
      else {
        msgs.forEach(msg => log(msg));
      }
    }
    return {
      log: (...msgs) => send('log', ...msgs),
      info: (...msgs) => send('info', ...msgs),
      warn: (...msgs) => send('warn', ...msgs),
      error: (...msgs) => send('error', ...msgs)
    }
  })();

  /**
   * @param {object[]} selected array of simple token objects
   * @returns {object[] | null} array of actual token objects
   */
  const getSelectedTokens = (selected) => {
    const selectedIds = selected && selected.length ? selected.map(sel => sel._id) : null
    return selectedIds ? selectedIds.map(id => getObj('graphic', id)) : null;
  }

  /**
   * @param {object} token token object
   * @returns {object|null} page object
   */
  const getPageOfToken = (token) => token && token.id ? getObj('page', token.get('_pageid')) : null;

  /**
   * @param {object} point1 { x: number, y: number }
   * @param {object} point2 { x: number, y: number }
   * @returns 
   */
  const getSeparation = (point1, point2) => {
    const delta = { x: point1.x - point2.x, y: point1.y - point2.y },
    distance = Math.sqrt(delta.x**2 + delta.y**2);
    return distance;
  }

  /**
   * @param {object} token1 token object
   * @param {object} token2 token object
   * @returns {number} separation in pixels
   */
  const getTokenSeparation = (token1, token2) => {
    if (!token1 || !token2) return;
    const pos1 = { x: parseInt(token1.get('left')), y: parseInt(token1.get('top')) },
      pos2 = { x: parseInt(token2.get('left')), y: parseInt(token2.get('top')) };
    if (![pos1.x, pos1.y, pos2.x, pos2.y].reduce((valid, val) => (valid === true && Number.isSafeInteger(val)) ? true : false, true)) return null;
    return getSeparation(pos1, pos2);
  }

  /**
   * @param {number} feetValue distance in feet
   * @param {object} page map page object
   * @returns {number|null} pixel distance
   */
  const feetToPixels = (feetValue, page) => {
    if (!page) return null;
    const gridPixelMultiplier = page.get('snapping_increment'),
      gridUnitScale = page.get('scale_number');
    const pixelValue = feetValue/gridUnitScale*(gridPixelMultiplier*70);
    debug.info(`Pixel distance: ${pixelValue}`);
    return pixelValue;
  }

  /**
   * @param {object} page map page object
   * @returns {boolean}
   */
  const checkGlobalIllumination = (page) => {
    if (!page || !page.id) return false;
    return page.get('daylight_mode_enabled') ? parseFloat(page.get('daylightModeOpacity')) : false;
  }

  /**
   * Check if a one way wall is allowing light through in the correct direction
   * @param {object} segment path segment
   * @param {number} lightFlowAngle 
   * @param {boolean} oneWayReversed 
   * @returns {boolean}
   */
  const isOneWayAndTransparent = (segment, lightFlowAngle, oneWayReversed) => {
    if (!segment || segment.length < 2) return;
    const delta = { x: segment[1][0] - segment[0][0], y: segment[0][1] - segment[1][1] }
    const segmentAngle = getAngleFromX(delta.x, delta.y);
    debug.info(`Segment angle is ${segmentAngle}`);
    const transparencyAngle = oneWayReversed
      ? segmentAngle - 90
      : segmentAngle + 90;
    const angleDifference = Math.abs(transparencyAngle - lightFlowAngle);
    debug.warn(`Transparency diff ${angleDifference}`);
    return angleDifference < 90 ? true : false;
  }

  /**
   * @param {number} rads radians
   * @returns {number} degrees
   */
  const toDegrees = (rads) => rads*180/Math.PI;

  /**
   * Get the angle from the x axis to the line drawn to (x,y) from origin
   * @param {number} x 
   * @param {number} y 
   * @returns {number} radians
   */
  const getAngleFromX = (x, y) => toDegrees(Math.atan2(y, x));

  /**
   * Check for LOS blocking walls between token and light source
   * @param {object} token1 token object
   * @param {object} token2 token object
   * @param {number} range pixel range
   * @param {object} page map page object
   * @returns {null|object} returns null if no LOS block, or first path object which blocks the light source
   */
  const checkLineOfSight = (token1, token2, range, page) => {
    const pos1 = { x: parseInt(token1.get('left')), y: parseInt(token1.get('top')) },
      pos2 = { x: parseInt(token2.get('left')), y: parseInt(token2.get('top')) },
      blockingPaths = findObjs({ type: 'path', pageid: page.id, layer: 'walls' }).filter(path => path.get('barrierType') !== 'transparent');
    const losPath = new PathMath.Path([[pos1.x, pos1.y, 0], [pos2.x, pos2.y, 0]]);
    let losBlocked = null;
    for (let i=0; i<blockingPaths.length; i++) {
      let pathData;
      const isOneWayWall = blockingPaths[i].get('barrierType') === 'oneWay',
        oneWayReversed = isOneWayWall ? blockingPaths[i].get('oneWayReversed') : null,
        lightFlowAngle = isOneWayWall ? getAngleFromX(pos1.x - pos2.x, pos2.y - pos1.y) : null;
      try { pathData = JSON.parse(blockingPaths[i].get('path')); } catch(e) { debug.error(e) }
      if (!pathData) continue;
      const pathTop = blockingPaths[i].get('top') - (blockingPaths[i].get('height')/2),
        pathLeft = blockingPaths[i].get('left') - (blockingPaths[i].get('width')/2);
      const pathVertices = pathData.map(vertex => [ vertex[1] + pathLeft, vertex[2] + pathTop, 0 ]);
      const wallPath = new PathMath.Path(pathVertices);
      const wallSegments = wallPath.toSegments(),
        losSegments = losPath.toSegments();
      for (let w=0; w<wallSegments.length; w++) {
        if (losBlocked) break;
        const skipOneWaySegment = isOneWayWall ? isOneWayAndTransparent(wallSegments[w], lightFlowAngle, oneWayReversed) : false;
        if (skipOneWaySegment) {
          debug.info('Skipping segment due to one-way transparency');
          continue;
        }
        for (let l=0; l<losSegments.length; l++) {
          const intersect = PathMath.segmentIntersection(wallSegments[w], losSegments[l]);//wallPath.intersects(losPath);
          if (intersect) {
            debug.info(`Found intersect, skipping light source`, blockingPaths[i]);
            losBlocked = blockingPaths[i];
            break;
          }
        }
      }
      if (losBlocked) break;
    }
    return losBlocked;
  }

  /**
   * Use cubic fade out to approximate the light level in dim light at different ranges
   * @param {number} tokenSeparation - pixel distance, center to center
   * @param {number} dimLightRadius - pixel radius of dim light from the emitter
   * @param {number} brightLightRadius - pixel radius of bright light from the emitter
   * @returns {number} - light level multiplier, 0 - 1
   */
  const getDimLightFalloff = (tokenSeparation, dimLightRadius, brightLightRadius, gridPixelSize) => {
    const dimLightOnlyRadius = (dimLightRadius - brightLightRadius) + gridPixelSize/2,
      tokenDimLightDistance = tokenSeparation - brightLightRadius;
    const lightLevelWithFalloff = (1-(tokenDimLightDistance/dimLightOnlyRadius)**3) * 0.5;
    return lightLevelWithFalloff;
  }

  /**
   * @param {object} token token object
   * @returns {number} average radius in pixels
   */
  const getTokenAverageRadius = (token) => {
    return (parseInt(token.get('height'))||0 + parseInt(token.get('width'))||0)*0.66;
  }

  /**
   * @param {object} token token object
   * @returns {LitBy}
   */
  const checkLightLevelOfToken = (token) => {
    if (typeof(PathMath) !== 'object') return { err: `Aborted - This script requires PathMath.` };
    const tokenPage = getPageOfToken(token),
      litBy = { bright: false, dim: [], daylight: false, total: 0, partial: true };
    const gridPixelSize = tokenPage.get('snapping_increment') * 70;
    const tokenAverageRadius = getTokenAverageRadius(token);
    if (!tokenPage || !tokenPage.id) return { err: `Couldn't find token or token page.` };
    litBy.daylight = checkGlobalIllumination(tokenPage);
    if (litBy.daylight) litBy.total += litBy.daylight;
    const allTokens = findObjs({ type: 'graphic', _pageid: tokenPage.id }),
      allLightTokens = allTokens.filter(token => (token.get('emits_bright_light') || token.get('emits_low_light')) && token.get('layer') !== 'gmlayer');
    for (let i=0; i<allLightTokens.length; i++) {
      if (litBy.bright || litBy.total >= 1) break;
      const tokenSeparation = getTokenSeparation(token, allLightTokens[i]),
        losBlocked = checkLineOfSight(token, allLightTokens[i], tokenSeparation, tokenPage);
      if (losBlocked) {
        continue;
      }
      const brightRangeFeet = allLightTokens[i].get('emits_bright_light')
        ? allLightTokens[i].get('bright_light_distance')
        : 0;
      const dimRangeFeet = allLightTokens[i].get('emits_low_light')
          ? allLightTokens[i].get('low_light_distance')
          : 0;
      const brightRange = feetToPixels(brightRangeFeet, tokenPage),
        dimRange = feetToPixels(dimRangeFeet, tokenPage),
        brightRangePartial = brightRange + tokenAverageRadius,
        dimRangePartial = dimRange + tokenAverageRadius;
      if (brightRange == null && dimRange == null) continue;
      if (brightRange && tokenSeparation <= brightRangePartial) {
        litBy.bright = true;
        litBy.total = 1;
        if (tokenSeparation <= brightRange) litBy.partial = false;
        break;
      }
      else if (dimRange && tokenSeparation <= dimRangePartial) {
        litBy.dim.push(allLightTokens[i]);
        litBy.total += getDimLightFalloff(tokenSeparation, dimRangePartial, brightRangePartial, gridPixelSize);
        if (tokenSeparation <= dimRange) litBy.partial = false;
      }
    }
    litBy.total = Math.min(litBy.total, 1);
    return { litBy };
  }
    
  const handleInput = (msg) => {
    if (msg.type === 'api' && /!checklight/i.test(msg.content) && playerIsGM(msg.playerid)) {
      const tokens = getSelectedTokens(msg.selected || []);
      if (!tokens || !tokens.length) return postChat(`Nothing selected.`);
      if (!tokenPageHasDynamicLighting) return postChat(`Token's page does not have dynamic lighting.`);
      tokens.forEach(token => {
        const { litBy, err } = checkLightLevelOfToken(token),
          tokenName = token.get('name') || 'Nameless Token';
        if (err) {
          postChat(err);
          return;
        }
        let messages = [];
        const partialString = litBy.daylight || !litBy.partial
          ? ''
          : 'partially ';
        if (litBy.daylight) messages.push(`${tokenName} is in ${(litBy.daylight*100).toFixed(0)}% global light.`);
        if (litBy.bright) messages.push(`${tokenName} is ${partialString}in direct bright light.`);
        else if (litBy.dim.length) messages.push(`${tokenName} is ${partialString}in ${litBy.total >= 1 ? `at least ` : ''}${litBy.dim.length} sources of dim light.`);
        else if (!litBy.daylight) messages.push(`${tokenName} is in darkness.`);
        if (!litBy.bright && litBy.total > 0) messages.push(`${tokenName} is ${partialString}in ${parseInt(litBy.total*100)}% total light level.`)
        if (messages.length) {
          let opacity = litBy.bright ? 1
            : litBy.total > 0.2 ? litBy.total
            : 0.2;
          if (typeof(litBy.daylight) === 'number') opacity = Math.max(litBy.daylight.toFixed(2), opacity);
          const chatMessage = createChatTemplate(token, messages, opacity);
          postChat(chatMessage);
        }
      });
    }
  }

  /**
   * @param {object[]} tokens array of token objects
   * @returns {boolean}
   */
  const tokenPageHasDynamicLighting = (tokens) => {
    const page = getPageOfToken(tokens[0]);
    return page.get('dynamic_lighting_enabled');
  }

  const createChatTemplate = (token, messages, opacity) => {
    return `
      <div class="light-outer" style="background: black; border-radius: 1rem; border: 2px solid #4c4c4c; white-space: nowrap; padding: 0.5rem 0.2rem">
        <div class="light-avatar" style="	display: inline-block!important; width: 20%; padding: 0.5rem;">
          <img src="${token.get('imgsrc')}" style="opacity: ${opacity};"/>
        </div>
        <div class="light-text" style="display: inline-block; color: whitesmoke; vertical-align: middle; width: 75%; white-space: normal;">
          ${messages.reduce((out, msg) => out += `<p>${msg}</p>`, '')}
        </div>
      </div>
      `.replace(/\n/g, '');
  }

  const postChat = (chatText, whisper = 'gm') => {
    const whisperText = whisper ? `/w "${whisper}" ` : '';
    sendChat(scriptName, `${whisperText}${chatText}`, null, { noarchive: true });
  }

  /**
   * @typedef {object} LitBy
   * @property {?boolean} bright - token is lit by bright light, null on error
   * @property {?array} dim - dim light emitters found to be illuminating selected token, null on error
   * @property {?float} daylight - token is in <float between 0 and 1> daylight, false on no daylight, null on error
   * @property {?float} total - total light multiplier from adding all sources, max 1, null on error
   * @property {boolean} partial - token's grid square is not fully lit by any light source
   * @property {?string} err - error message, only on error
   * 
   * @param {string | object} tokenOrTokenId - Roll20 Token object, or token UID string
   * @returns {LitBy}
   */
  const isLitBy = (tokenOrTokenId) => {
    const output = { bright: null, dim: null, daylight: null, total: null }
    const token = tokenOrTokenId && typeof(tokenOrTokenId) === 'object' && tokenOrTokenId.id ? tokenOrTokenId
      : typeof(tokenOrTokenId) === 'string' ? getObj('graphic', tokenOrTokenId)
      : null;
    const { litBy, err } = token && token.id
      ? checkLightLevelOfToken(token)
      : { err: `Could not find token from supplied ID.` };
    Object.assign(output,
      litBy || err
    );
    return output;
  }

  // Meta toolbox plugin
  const checklight = (msg) => {
    const errors = [];
    const tokens = getSelectedTokens(msg.selected),
      token = tokens ? tokens[0] : null;
    if (!token || !token.id) errors.push(`Checklight plugin: No selected token`);
    else {
      const { litBy, err } = checkLightLevelOfToken(token);
      if (litBy) {
        return typeof(litBy.total) === 'number'
          ? parseFloat(litBy.total).toFixed(4)
          : 0;
      }
      else errors.push(err);
    }
    if (errors.length) errors.forEach(e => log(e));
    return '';
  }
  const registerWithMetaToolbox = () => {
    try {
      Plugger.RegisterRule(checklight);
      debug.info(`Registered with Plugger`);
    }
    catch (e) { log(`ERROR Registering ${scriptName} with PlugEval: ${e.message}`); }
  }

  on('ready', () => {
    if (typeof(Plugger) === 'object') registerWithMetaToolbox();
    on('chat:message', handleInput);
    log(`${scriptName} v${scriptVersion}`);
  });

  return { isLitBy }

})();
{ try { throw new Error(''); } catch (e) { API_Meta.checkLightLevel.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.checkLightLevel.offset); } }
/* */
/*
================================================================
END SCRIPT: checkLightLevel
================================================================
*/

/*
================================================================
BEGIN SCRIPT: Fetch
SOURCE FILE: Fetch.md
================================================================
*/
/*
=========================================================
Name            :   Fetch
GitHub          :   https://github.com/TimRohr22/Cauldron/tree/master/Fetch
Roll20 Contact  :   timmaugh
Version         :   2.2.1
Last Update	    :   19 MAY 2026
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Fetch = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.Fetch.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const Fetch = (() => { //eslint-disable-line no-unused-vars
    const apiproject = 'Fetch';
    const version = '2.2.0';
    const apilogo = 'https://i.imgur.com/jeIkjvS.png';
    const apilogoalt = 'https://i.imgur.com/boYO3cf.png';
    const schemaVersion = 0.2;
    API_Meta[apiproject].version = version;
    const vd = new Date(1770641544905);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) { //eslint-disable-line no-prototype-builtins
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* falls through */
                case 0.2:
                    state[apiproject].settings = {
                        playerscanids: false
                    };
                    state[apiproject].defaults = {
                        playerscanids: false
                    }
                /* falls through */
                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                        settings: {
                            playerscanids: false
                        },
                        defaults: {
                            playerscanids: false
                        }
                    };
                    break;
            }
        }
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };
    // ==================================================
    //		STATE MANAGEMENT
    // ==================================================
    const manageState = { // eslint-disable-line no-unused-vars
        reset: () => state[apiproject].settings = _.clone(state[apiproject].defaults),
        set: (p, v) => state[apiproject].settings[p] = v,
        get: (p) => { return state[apiproject].settings[p]; }
    };

    // ==================================================
    //		UTILTIES
    // ==================================================
    const generateUUID = (() => {
        let a = 0;
        let b = [];

        return () => {
            let c = (new Date()).getTime() + 0;
            let f = 7;
            let e = new Array(8);
            let d = c === a;
            a = c;
            for (; 0 <= f; f--) {
                e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
                c = Math.floor(c / 64);
            }
            c = e.join("");
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--) {
                    b[f] = 0;
                }
                b[f]++;
            } else {
                for (f = 0; 12 > f; f++) {
                    b[f] = Math.floor(64 * Math.random());
                }
            }
            for (f = 0; 12 > f; f++) {
                c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    })();

    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const getfirst = (cmd, ...args) => {
        // pass in objects of form: {type: 'text', rx: /regex/}
        // return object of form  : {regex exec object with property 'type': 'text'}

        let ret = {};
        let r;
        args.find(a => {
            r = a.rx.exec(cmd);
            if (r && (!ret.length || r.index < ret.index)) {
                ret = Object.assign(r, { type: a.type });
            }
            a.lastIndex = 0;
        }, ret);
        return ret;
    };
    const simpleObj = (o) => {
        if (typeof o === 'undefined') { return o; }
        let obj = JSON.parse(JSON.stringify(o));
        if (!Object.keys(obj).length) { return obj; }
        return Object.keys(obj).reduce((m, k) => {
            if (/^_/.test(k) && !m.hasOwnProperty(k.slice(1))) { m[k.slice(1)] = m[k]; }
            return m;
        }, obj);
    };

    // ==================================================
    //		PRESENTATION
    // ==================================================

    let html = {};
    let css = {}; // eslint-disable-line no-unused-vars
    let HE = () => { }; // eslint-disable-line no-unused-vars
    const theme = {
        primaryColor: '#5E0099',
        primaryTextColor: '#232323',
        primaryTextBackground: '#ededed'
    }
    const localCSS = {
        msgheader: {
            'background-color': theme.primaryColor,
            'color': 'white',
            'font-size': '1.2em',
            'padding-left': '4px',
            'font-weight': 'bold'
        },
        msgbody: {
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        msgfooter: {
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        msgheadercontent: {
            'display': 'table-cell',
            'vertical-align': 'middle',
            'padding': '4px 8px 4px 6px'
        },
        msgheaderlogodiv: {
            'display': 'table-cell',
            'max-height': '30px',
            'margin-right': '8px',
            'margin-top': '4px',
            'vertical-align': 'middle'
        },
        logoimg: {
            'background-color': 'transparent',
            'float': 'left',
            'border': 'none',
            'max-height': '30px'
        },
        boundingcss: {
            'background-color': theme.primaryTextBackground
        },
        inlineEmphasis: {
            'font-weight': 'bold'
        },
        tblOddRow: {
            'background-color': '#d3d3d3'
        },
        button: {
            'background-color': '#3c3c3c',
            'color': '#ededed',
            'border-radius': '5px',
            'border-width': '0px',
            'margin': '0px 2px',
            'line-height': '12px',
            'font-size': '12px',
            'text-align': 'center',
            'width': '54px',
            'height': '12px',
            'vertical-align': 'middle',
            'text-decoration': 'none'
        },
        textright: {
            'text-align': 'right'
        }
    }
    const msgbox = ({
        msg: msg = '',
        title: title = '',
        headercss: headercss = localCSS.msgheader,
        bodycss: bodycss = localCSS.msgbody,
        footercss: footercss = localCSS.msgfooter,
        sendas: sendas = 'Fetch',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = '',
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogoalt, 'SelectManager Logo', localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, footercss: footercss, boundingcss: localCSS.boundingcss, noarchive: true });
    };

    const getWhisperTo = (who) => who.toLowerCase() === 'api' ? 'gm' : who.replace(/\s\(gm\)$/i, '');

    // ==================================================
    //		PROCESS
    // ==================================================
    class StatusBlock {
        constructor({ token: token = {}, msgId: msgId = generateUUID() } = {}) {
            this.token = token;
            this.msgId = msgId;
            this.statuses = (decomposeStatuses(token.statusmarkers) || []).reduce((m, s) => {
                m[s.name] = m[s.name] || [];
                m[s.name].push(Object.assign({}, s, { is: 'yes' }));
                let shortTag = (s.tag || '').split(/::/)[0];
                if (shortTag !== s.name) {
                    m[shortTag] = m[shortTag] || [];
                    m[shortTag].push(Object.assign({}, s, { is: 'yes' }));
                }
                return m;
            }, {});
        }
    }
    class nullObj {
        constructor() {
            this.get = function () { return undefined; }
        }
    }
    class AggAttr {
        constructor() {
            this.get = function (r) { return this[r]; }
        }
    }

    const tokenStatuses = {};

    const repeatingOrdinal = (character_id, section = '', attr_name = '') => {
        if (!section && !attr_name) return;
        let ordrx, match;
        if (attr_name) {
            ordrx = /^repeating_([^_]+)_([^_]+)_.*$/;
            if (!ordrx.test(attr_name)) return; // the supplied attribute name isn't a repeating attribute at all
            match = ordrx.exec(attr_name);
            section = match[1];
        }
        let sectionrx = new RegExp(`repeating_${section}_([^_]+)_.*$`);
        let createOrderKeys = [...new Set(findObjs({ type: 'attribute', characterid: character_id })
            .filter(a => sectionrx.test(a.get('name')))
            .map(a => sectionrx.exec(a.get('name'))[1]))];
        let sortOrderKeys = (findObjs({ type: 'attribute', characterid: character_id, name: `_reporder_repeating_${section}` })[0] || { get: () => { return ''; } })
            .get('current')
            .split(/\s*,\s*/)
            .filter(a => createOrderKeys.includes(a));
        sortOrderKeys.push(...createOrderKeys.filter(a => !sortOrderKeys.includes(a)));
        return attr_name ? sortOrderKeys.indexOf(match[2]) : sortOrderKeys;
    };
    const parsePattern = (cmd) => {
        const fieldcomprx = /^((?<retrieve>m)\s*\|)?\s*(?<field>[^\s]+?)\s*(?<operator>>=|<=|~|!~|=|!=|<|>)\s*((`|'|")(?<value>.*?)\6|(?<altvalue>.*?)(?=\s|$))\s*/i;
        const fieldrx = /^((?<retrieve>m)\s*\|)?\s*(?<field>[^\s]+)\s*/i;
        const fieldcomptm = { rx: fieldcomprx, type: 'fieldcomp' },
            fieldtm = { rx: fieldrx, type: 'field' };
        let index = 0;
        let p = {};
        let tokens = [];
        while (!/^$/.test(cmd.slice(index))) {
            p = getfirst(cmd.slice(index), fieldcomptm, fieldtm);
            if (p) {
                if (p.type === 'field') tokens.push({ type: '=', contents: [p.groups.field, true], retrieve: p.groups.retrieve ? 'max' : 'current' });
                else tokens.push({ type: p.groups.operator, contents: [p.groups.field, p.groups.value || p.groups.altvalue], retrieve: p.groups.retrieve ? 'max' : 'current' });
                index += p[0].length;
            } else {
                return { tokens: [], error: `Unexpected token encountered in repeating pattern: ${cmd}` };
            }
        }
        return { tokens: tokens };
    };
    let campMarkers = (prop = '') => JSON.parse(Campaign().get('token_markers')).map(m => m[prop]); // array of markers on campaign (as name or tag)
    const decomposeStatuses = (list = '') => {
        return list.split(/\s*,\s*/g).filter(s => s.length)
            .reduce((m, s) => {
                let origst = libTokenMarkers.getStatus(s.slice(0, /(@\d+$|:)/.test(s) ? /(@\d+$|:)/.exec(s).index : s.length));
                let st = _.clone(origst);
                if (!st) return m;
                st.id = origst.getTag();
                st.type = 'marker';
                st.num = /^.+@0*(\d+)/.test(s) ? /^.+@0*(\d+)/.exec(s)[1] : '';
                st.html = origst.getHTML();
                st.url = st.url || '';
                m.push(st);
                return m;
            }, [])
            .filter(st => st);
    };
    const isMarker = prop => (getMarker({ query: /(?<marker>.+?)(?:\?(?<index>\d+|all\+?))?$/.exec(prop)[1] }) || {}).hasOwnProperty('name');
    const getFirstGM = () => simpleObj(findObjs({ type: 'player' }).filter(p => playerIsGM(p.id))[0]);

    // ===== DATA RETRIEVAL =============================
    const getSheetItem = (searchObj, notes) => {
        const itemTypeLib = {
            '@': 'attribute',
            '*': 'attribute',
            '%': 'ability'
        };
        const internalTestLib = {
            'int': (v) => +v === +v && parseInt(parseFloat(v, 10), 10) == v,
            'num': (v) => +v === +v,
            'tru': (v) => v == true
        };
        let filterLib = {
            '=': (a) => a.contents[0] == a.contents[1], // eslint-disable-line eqeqeq
            '!=': (a) => a.contents[0] != a.contents[1],// eslint-disable-line eqeqeq
            '~': (a) => a.contents[0].includes(a.contents[1]),
            '!~': (a) => !a.contents[0].includes(a.contents[1]),
            '>': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) > (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '>=': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) >= (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '<': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) < (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '<=': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) <= (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1])
        }

        let c = searchObj.source; // || getChar({ query: res.groups.character, msg: searchObj.msg });
        // if (!c) return;

        // standard sheet items
        if (['@', '%'].includes(searchObj.symbol)) {
            return findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
                .filter(a => a.get('name') === searchObj.item)[0];
        }

        // if we're still here, we're looking for a repeating item
        if (searchObj.symbol === '*') {
            let rowid;
            let entries = repeatingOrdinal(c.id, searchObj.section);
            let retrieve = 'current';

            if (searchObj.pattern && searchObj.pattern.length) {
                let p = parsePattern(searchObj.pattern);
                if (!p.tokens.length) {
                    notes.push(p.error || 'No pattern detected for repeating sheet item.');
                    return;
                }

                p.tests = [];
                let reprx = new RegExp(`^repeating_${searchObj.section}_(?<repID>[^_]*?)_(?<suffix>.+)$`);
                let repres;
                let o = findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
                    .filter(a => reprx.test(a.get('name')));
                o.forEach(a => {
                    reprx.lastIndex = 0;
                    repres = reprx.exec(a.get('name'));
                    a.name = a.get('name');
                    a.repID = repres.groups.repID;
                    a.suffix = repres.groups.suffix;
                });

                let viable = [];
                p.tokens.forEach(s => {
                    viable = [];
                    o.forEach(a => {
                        if (a.suffix.toLowerCase() === s.contents[0].toLowerCase()) {
                            if (filterLib[s.type]({ contents: [a.get(s.retrieve), s.contents[1]] })) viable.push(a.repID);
                        }
                    });
                    p.tests.push(viable);
                });
                // we should have the same number of tests as we do testable conditions
                if (p.tests.length !== p.tokens.length) {
                    notes.push(`EXITING: TEST COUNTS DON'T MATCH`);
                    return;
                }
                viable = p.tests.reduce((m, v) => m.filter(repID => v.includes(repID)));
                if (viable.length) {
                    let retObj = findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
                        .filter(a => a.get('name') === `repeating_${searchObj.section}_${viable[0]}_${searchObj.valuesuffix}`)[0];
                    return retObj;
                }
            } else if (searchObj.reference && searchObj.reference.length) {
                if (/\$\d+/.test(searchObj.reference) ||
                    /\$[nN]/.test(searchObj.reference) ||
                    /1[dD][wW](?:[eE][iI][gG][hH][tT])?(?:\?(?<weightattr>.+?))?/.test(searchObj.reference)) {

                    if (/\$\d+/.test(searchObj.reference)) {
                        rowid = entries[/\$(\d+)/.exec(searchObj.reference)[1]];
                    } else if (/\$[nN]/.test(searchObj.reference)) {
                        rowid = entries[entries.length - 1];
                    } else if (/1[dD][wW](?:[eE][iI][gG][hH][tT])?(?:\?(?<weightattr>.+))?/.test(searchObj.reference)) {
                        let weightAttr = /1[dD][wW](?:[eE][iI][gG][hH][tT])?(?:\?(?<weightattr>.+))?/.exec(searchObj.reference).groups.weightattr;
                        retrieve = 'current';
                        if (weightAttr && /\?/i.test(weightAttr)) {
                            let weightedParts = /([^\?]*)\?(.*)$/.exec(weightAttr);
                            retrieve = weightedParts[2] && weightedParts[2].toLowerCase() === 'max' ? 'max' : 'current';
                            weightAttr = weightedParts[1];
                        }
                        let weightrx = new RegExp(`^repeating_${escapeRegExp(searchObj.section || '')}_[^_]+_${escapeRegExp(weightAttr || '')}$`);
                        if (weightAttr && !findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
                            .filter(a => weightrx.test(a.get('name'))).length) {
                            notes.push(`Weight attribute provided doesn't exist on this repeating list.`);
                        } else if (weightAttr) {
                            entries = entries.map(e => {
                                let objWeightAttr = (findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
                                    .filter(a => a.get('name') === `repeating_${searchObj.section}_${e}_${weightAttr}`)[0] ||
                                    { get: () => '0' });

                                return {
                                    rowid: e,
                                    weight: Math.max(0, parseInt(objWeightAttr.get(retrieve)) || 0)
                                }
                            }).reduce((m, v) => {
                                m = [...m, ...new Array(v.weight).fill().map(e => v.rowid)];
                                return m;
                            }, []);
                        }
                        rowid = entries[randomInteger(entries.length) - 1];
                    }
                } else {
                    rowid = searchObj.reference;
                }
                return rowid
                    ? findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
                        .filter(a => a.get('name') === `repeating_${searchObj.section}_${rowid}_${searchObj.valuesuffix}`)[0]
                    : rowid;
            } else if (searchObj.aggregate && searchObj.aggregate.length) {
                let aggParts = searchObj.aggregate.split('?');
                let aggAttrs;
                let aggrx;
                let initialAttr;
                let tgtName = '';
                let delim = ',';
                let data = '';

                switch (aggParts[0].toLowerCase()) {
                    case 'avg':
                        aggrx = new RegExp(`^repeating_${searchObj.section}_(${entries.join('|')})_${searchObj.valuesuffix}$`);
                        aggAttrs = findObjs({ type: 'attribute', characterid: c.id })
                            .filter(a => aggrx.test(a.get('name')));

                        return aggAttrs.reduce((m, a, i, attrs) => {
                            m.current = (m.current || 0) + parseInt(a.get('current') || 0);
                            m.max = (m.max || 0) + parseInt(a.get('max') || 0);
                            if (i === attrs.length - 1) {
                                m.current = parseInt((m.current / i) * 100) / 100;
                                m.max = parseInt((m.max / i) * 100) / 100;
                            }
                            return m;
                        }, new AggAttr());
                    // break;
                    case 'sum':
                        aggrx = new RegExp(`^repeating_${searchObj.section}_(${entries.join('|')})_${searchObj.valuesuffix}$`);
                        aggAttrs = findObjs({ type: 'attribute', characterid: c.id })
                            .filter(a => aggrx.test(a.get('name')));

                        return aggAttrs.reduce((m, a, i, attrs) => {
                            m.current = (m.current || 0) + parseInt(a.get('current') || 0);
                            m.max = (m.max || 0) + parseInt(a.get('max') || 0);
                            return m;
                        }, new AggAttr());
                    // break;
                    case 'min':
                    case 'max':
                        if (aggParts.length === 1) { return; } // no attr provided to aggregate on
                        aggrx = new RegExp(`^repeating_${searchObj.section}_(${entries.join('|')})_${aggParts[1]}$`);
                        aggAttrs = findObjs({ type: 'attribute', characterid: c.id })
                            .filter(a => aggrx.test(a.get('name')));
                        if (!aggAttrs.length) { return; }
                        retrieve = aggParts.length === 3 && aggParts[2].toLowerCase() === 'max' ? 'max' : 'current';
                        initialAttr = aggAttrs.reduce((m, a, i, attrs) => {
                            return (
                                (aggParts[0].toLowerCase() === 'min' && parseFloat(m.get(retrieve)) <= parseFloat(a.get(retrieve)))
                                || (aggParts[0].toLowerCase() === 'max' && parseFloat(m.get(retrieve)) >= parseFloat(a.get(retrieve)))
                            )
                                ? m
                                : a;
                        });

                        tgtName = initialAttr.get('name').replace(/^(repeating_[^_]+_[^_]+_).+$/i, (m, g1) => `${g1}${searchObj.valuesuffix}`);
                        return findObjs({ type: 'attribute', characterid: c.id })
                            .filter(a => a.get('name') === tgtName)[0];
                    // break;
                    case 'vals':
                    case 'uniq':
                    case 'ids':
                        // *(char.list.vals?delim.subAttr.max)
                        // *(char.list.uniq?delim.subAttr.max)
                        // *(char.list.ids?delim.subAttr.max)
                        if (aggParts.length > 1) {
                            delim = aggParts[1];
                        }
                        aggrx = new RegExp(`^repeating_${searchObj.section}_(${entries.join('|')})_${searchObj.valuesuffix}$`);
                        aggAttrs = findObjs({ type: 'attribute', characterid: c.id })
                            .filter(a => aggrx.test(a.get('name')));
                        initialAttr = new AggAttr();
                        data = aggParts[0].toLowerCase() === 'ids'
                            ? aggAttrs.map(a => a.id)
                            : aggAttrs.map(a => `${a.get(searchObj.valtype || 'current')}`);

                        if (aggParts[0].toLowerCase() === 'uniq') { data = [...new Set(data)]; }
                        initialAttr.current = data.join(delim);
                        return initialAttr;
                    // break;
                    case 'rowids':
                        if (aggParts.length > 1) {
                            delim = aggParts[1];
                        }
                        initialAttr = new AggAttr();
                        initialAttr.current = entries.join(delim);
                        return initialAttr;
                    // break;
                }
            }
        }
    };
    const getSheetItemVal = (searchObj, notes) => {
        let val = '',
            retrieve = '',
            o = {};
        // determine what to test; also what to retrieve if another value isn't specified
        if (['@', '*'].includes(searchObj.symbol) && (searchObj.valtype || '').toLowerCase() !== 'max') {
            retrieve = 'current';
        } else if (['@', '*'].includes(searchObj.symbol)) {
            retrieve = 'max';
        } else {
            retrieve = 'action';
        }
        // determine if a different retrievable info is requested
        if (searchObj.symbol === '*') {
            switch ((searchObj.valtype || '').toLowerCase()) {
                case 'name$':
                    retrieve = 'name$';
                    break;
                case 'row$':
                    retrieve = 'row$';
                    break;
                case 'rowid':
                    retrieve = 'rowid';
                    break;
                case 'name':
                    retrieve = 'name';
                    break;
                case 'id':
                    retrieve = 'id';
                    break;
                default:
            }
        }
        // go get the item
        o = getSheetItem(searchObj, notes);
        if (!o) {
            notes.push(`No sheet object found.`);
            return;
        } else {
            if (['name', 'action', 'current', 'max', 'id'].includes(retrieve)) {
                val = o.get(retrieve);
            } else {
                val = o.get('name');
                let row;
                let rptrx = /^repeating_([^_]+)_([^_]+)_(.*)$/i;
                let rptres = rptrx.exec(val) || [undefined, undefined, '', ''];
                switch (retrieve) {
                    case 'row$':
                        val = `$${repeatingOrdinal(o.get('characterid'), undefined, val)}`;
                        break;
                    case 'name$':
                        row = `$${repeatingOrdinal(o.get('characterid'), undefined, val)}`;
                        val = `repeating_${rptres[1]}_${row}_${rptres[3]}`;
                        break;
                    case 'rowid':
                        val = rptres[2];
                        break;
                    default:
                }
            }
        }
        return val;
    };
    const getPageForPlayer = (playerid) => {
        let player = getObj('player', playerid);
        if (playerIsGM(playerid)) {
            return player.get('lastpage') || Campaign().get('playerpageid');
        }

        let psp = Campaign().get('playerspecificpages');
        if (psp[playerid]) {
            return psp[playerid];
        }

        return Campaign().get('playerpageid');
    };
    const getPagesForAllPlayers = () => findObjs({ type: 'player', online: true })
        .reduce((m, p) => {
            m[p.id] = getPageForPlayer(p.id)
            return m;
        }, {});
    const getPageIDForPlayer = (pid) => {
        return (pid && playerIsGM(pid))
            ? (getObj('player', pid).get('_lastpage') || Campaign().get('playerpageid'))
            : Campaign().get('playerpageid');
    };
    const getTrackerVal = (token) => {
        let retval = {};
        let to = JSON.parse(Campaign().get('turnorder') || '[]');
        let mto = to.map(t => t.id);
        if (mto.includes(token.id)) {
            retval.tracker = to.filter(t => t.id === token.id)[0].pr;
            retval.tracker_offset = mto.indexOf(token.id);
        }
        return retval;
    };
    const getObjName = (key, type) => {
        let o;
        switch (type) {
            case 'playerlist':
                o = key.split(/\s*,\s*/)
                    .map(k => k === 'all' ? k : getObj('player', k))
                    .filter(c => c)
                    .map(c => c === 'all' ? c : c.get('displayname'))
                    .join(', ');
                return o.length ? o : undefined;
            case 'player':
                o = getObjOrNull(type, key);
                return o ? o.displayname : undefined;
            case 'deck':
                o = getObjOrNull(type, getObjOrNull('card', key).id);
                return o ? o.name : undefined;
            case 'unknown':
                o = getObjOrNull(type, key);
                return getObjName(o.id, o.type);
            case 'attribute':
            case 'card':
            case 'character':
            case 'handout':
            case 'page':
            default:
                o = getObjOrNull(type, key);
                return o ? o.name : undefined;
        }
    };
    const getControlledByList = (o) => {
        if (!o.represents || !o.represents.length) return o.controlledby;
        let c = getObj('character', o.represents);
        if (c) return c.get('controlledby');
    };

    // ===== OBJECT RETRIEVAL ===========================
    const getCard = ({ query: query = '' } = {}) => {
        let card = findObjs({ type: 'card', id: query })[0] ||
            findObjs({ type: 'card', name: query })[0] ||
            findObjs({ id: (findObjs({ type: 'graphic', subtype: 'card', id: query })[0] || { get: () => '' }).get('cardid') })[0];
        return simpleObj(card);
    };
    const getChar = ({ query: query = '', msg: msg } = {}) => {
        let character;
        if (typeof query !== 'string') return character;
        let qrx = new RegExp(escapeRegExp(query), 'i');
        let charsIControl = findObjs({ type: 'character' });
        charsIControl = playerIsGM(msg.playerid) || manageState.get('playerscanids') ? charsIControl : charsIControl.filter(c => {
            return c.get('controlledby').split(',').reduce((m, p) => {
                return m || p === 'all' || p === msg.playerid;
            }, false)
        });
        character = charsIControl.filter(c => c.id === query)[0] ||
            charsIControl.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0] ||
            charsIControl.filter(c => c.get('name') === query)[0] ||
            charsIControl.filter(c => {
                qrx.lastIndex = 0;
                return qrx.test(c.get('name'));
            })[0];
        return simpleObj(character);
    };
    const getCustFx = ({ query: query = '' } = {}) => {
        let cfx = findObjs({ type: 'custfx', id: query })[0] ||
            findObjs({ type: 'custfx' }).filter(p => { return p.get('name') === query; })[0];

        if (!cfx) { return; }
        return { ...simpleObj(cfx), ...cfx.get('definition') };

    };
    const getDeck = ({ query: query = '' } = {}) => {
        let deck = findObjs({ type: 'deck', id: query })[0] ||
            findObjs({ type: 'deck' }).filter(p => { return p.get('name') === query; })[0];
        return simpleObj(deck);
    };
    const getHandout = ({ query: query = '', msg: msg } = {}) => {
        let handout;
        if (typeof query !== 'string') return handout;
        let qrx = new RegExp(escapeRegExp(query), 'i');

        let handoutsIControl = findObjs({ type: 'handout' });

        handoutsIControl = playerIsGM(msg.playerid) || manageState.get('playerscanids') ? handoutsIControl : handoutsIControl.filter(ho => {
            return [...ho.get('inplayerjournals').split(','), ...ho.get('controlledby').split(',')].reduce((m, p) => {
                return m || p === 'all' || p === msg.playerid;
            }, false)
        });
        handout = handoutsIControl.filter(ho => ho.id === query)[0] ||
            handoutsIControl.filter(ho => ho.get('name') === query)[0] ||
            handoutsIControl.filter(ho => {
                qrx.lastIndex = 0;
                return qrx.test(ho.get('name'));
            })[0];
        return simpleObj(handout);
    };
    const getMacro = ({ query: query = '' } = {}) => {
        let macro = findObjs({ type: 'macro', id: query })[0] ||
            findObjs({ type: 'macro' })
                .filter(p => { return query === p.get('name'); })[0];

        if (macro && macro.id) {
            macro = simpleObj(macro);
        }
        return macro;
    }
    const getMarker = ({ query: query = '' } = {}) => {
        if (libTokenMarkers.getStatus(query).getTag().length) return decomposeStatuses(query)[0];
    };
    const getPage = ({ query: query = '' } = {}) => {
        if (query.toLowerCase() === 'ribbon') {
            return simpleObj(findObjs({ type: 'page', id: Campaign().get('playerspecificpages') })[0]);
        }
        return simpleObj(findObjs({ type: 'page', id: query })[0] ||
            findObjs({ type: 'page' }).filter(p => { return p.get('name') === query; })[0]);
    };
    const getPin = ({ query: query = '', msg: msg } = {}) => {
        if (typeof query !== 'string') return;
        let pinsICanSee = playerIsGM(msg.playerid) || manageState.get('playerscanids')
            ? findObjs({ type: 'pin' })
            : findObjs({ type: 'pin' }).filter(p => p.get('visibleTo') === 'all');
        return simpleObj(pinsICanSee.filter(p => p.id === query)[0] ||
            pinsICanSee.filter(p => p.get('title').length
                ? p.get('title')
                : p.get('subLink').length
                    ? p.get('subLink')
                    : getObjName(p.get('link'), p.get('linkType')) || getObjName(p.get('link'), 'unknown') === query
            )[0]);

    };
    const getPlayer = ({ query: query = '' } = {}) => {
        let player = findObjs({ type: 'player', id: query })[0] ||
            findObjs({ type: 'player' })
                .filter(p => { return [query.toLowerCase(), query.replace(/\s\(gm\)$/i, '').toLowerCase()].includes(p.get('_displayname').toLowerCase()); })[0];

        if (player && player.id) {
            player = simpleObj(player);
        }
        return player;
    };
    const getStatus = ({ source: source = '', query: query = '', msg: msg = {}, msgId: msgId = generateUUID() } = {}) => {
        let token, rxret, status, index, modindex, statusblock;
        token = typeof source === 'string' ? getGraphic({ query: source, msg: msg/*, pageid: getPageForPlayer(msg.playerid) */ }) : source;
        if (!token) return;
        token = simpleObj(token);
        if (!tokenStatuses.hasOwnProperty(token.id) || tokenStatuses[token.id].msgId !== msgId) {
            tokenStatuses[token.id] = new StatusBlock({ token: token, msgId: msgId });
        }
        rxret = /(?<marker>.+?)(?:\?(?<index>\d+|all\+?))?$/.exec(query);
        [status, index] = [rxret.groups.marker, rxret.groups.index];
        if (!index) {
            modindex = 1;
        } else if (['all', 'all+'].includes(index.toLowerCase())) {
            modindex = index.toLowerCase();
        } else {
            modindex = Number(index);
        }
        statusblock = tokenStatuses[token.id].statuses[status];
        let retval = { type: 'status', is: 'no', count: '0' };
        if (!statusblock || !statusblock.length) {
            return retval;
        };
        switch (index) {
            case 'all':
                return statusblock.reduce((m, sm) => {
                    m.num = `${m.num || ''}${sm.num}`;
                    m.tag = m.tag || sm.tag;
                    m.url = m.url || sm.url;
                    m.html = m.html || sm.html;
                    m.is = 'yes';
                    m.count = m.count || statusblock.length;
                    return m;
                }, retval);
            case 'all+':
                return statusblock.reduce((m, sm) => {
                    m.num = `${Number(m.num || 0) + Number(sm.num)}`;
                    m.tag = m.tag || sm.tag;
                    m.url = m.url || sm.url;
                    m.html = m.html || sm.html;
                    m.is = 'yes';
                    m.count = m.count || statusblock.length;
                    return m;
                }, retval);
            default:
                if (statusblock.length >= modindex) {
                    return Object.assign(retval, statusblock[modindex - 1], { count: index ? '1' : statusblock.length, type: 'status' });
                } else {
                    return retval;
                }
        }
    };
    const getRollableTable = ({ query: query = '', msg: msg } = {}) => {
        let table;
        if (typeof query !== 'string') return table;
        let qrx = new RegExp(escapeRegExp(query), 'i');

        let tablesIControl = findObjs({ type: 'rollabletable' });

        tablesIControl = playerIsGM(msg.playerid) || manageState.get('playerscanids') ? tablesIControl : tablesIControl.filter(tbl => tbl.get('showplayers'));
        table = tablesIControl.filter(tbl => tbl.id === query)[0] ||
            tablesIControl.filter(tbl => tbl.get('name') === query)[0] ||
            tablesIControl.filter(tbl => {
                qrx.lastIndex = 0;
                return qrx.test(tbl.get('name'));
            })[0];
        if (table && table.id) {
            table = simpleObj(table);
        }
        return simpleObj(table);
    };
    const getTableItems = ({ query: query = '', tbl: tbl = '', msg: msg } = {}) => {
        let item = getObjOrNull('tableitem', query);
        let table;
        if (tbl) {
            table = typeof tbl === 'string'
                ? getRollableTable({ query: tbl, msg: msg })
                : tbl;
        } else {
            if (item) {
                table = getRollableTable({ query: item.rollabletableid, msg: msg });
            }
        }
        if (item && item.id) {
            if (item.rollabletableid === table.id) {
                return item;
            }
        } else if (table && table.id) {
            let allitems = findObjs({ type: 'tableitem', rollabletableid: table.id })
                .map(item => simpleObj(item));
            item = allitems.filter(ti => ti.id === query)[0] ||
                allitems.filter(ti => ti.name === query)[0];

            if (item && item.id) { return item; }

            let weightedItems = allitems.reduce((m, v) => {
                m = [...m, ...new Array(v.weight).fill().map(e => v)];
                return m;
            }, []);
            let index;
            if (['1dw', '1dweight'].includes(query.toLowerCase())) {
                index = randomInteger(weightedItems.length) - 1;
                return weightedItems[index];
            } else if (!isNaN(parseInt(query))) {

                index = parseInt(query);
                if (index < 1) {
                    index = 1;
                } else if (index > weightedItems.length) {
                    index = weightedItems.length;
                }
                return weightedItems[index - 1];
            }
        }

    };
    const getTag = ({ oid: oid = '', otype: otype = '', query: query = '', pid: pid = '' } = {}) => {
        let obj = getObjOrNull(otype, oid);
        if (!obj.id) {
            if (otype === 'character') {
                obj = getChar({ query: oid, msg: { playerid: pid } });
            } else if (otype === 'handout') {
                obj = getHandout({ query: oid, msg: { playerid: pid } });
            }
        }
        let tags = JSON.parse(obj.tags || JSON.stringify([]));
        if (!tags.length || !tags.map(t => t.toLowerCase()).includes(query.toLowerCase())) {
            return { type: 'tag', is: 'no', count: 0 };
        } else {
            return { type: 'tag', is: 'yes', count: tags.filter(t => t === query).length };
        }
    };
    const getGraphic = ({ query: query = '', msg: msg, pageid: pgid = '' } = {}) => {
        let lightvals = {
            base: {},
            assign: {}
        };
        if (!pgid.length && msg) {
            pgid = getPageForPlayer(msg.playerid);
        }
        let token = findObjs({ type: 'graphic', subtype: 'token', id: query })[0] ||
            findObjs({ type: 'graphic', subtype: 'card', id: query })[0] ||
            findObjs({ type: 'graphic', subtype: 'token', name: query, pageid: pgid })[0] ||
            findObjs({ type: 'graphic', subtype: 'token', pageid: pgid })
                .filter(t => t.get('represents').length && findObjs({ type: 'character', id: t.get('represents') })[0].get('name') === query)[0];
        if (!token) {
            let tokensOfName = findObjs({ type: 'graphic', subtype: 'token', name: query });
            if (tokensOfName.length === 1) {
                token = tokensOfName[0];
            }
        }
        if (token && token.id) {
            if (typeof checkLightLevel !== 'undefined' && checkLightLevel.hasOwnProperty('isLitBy') && typeof checkLightLevel.isLitBy === 'function') {
                lightvals.base = checkLightLevel.isLitBy(token);
                lightvals.assign.checklight_isbright = lightvals.base.bright ? 'true' : 'false';
                lightvals.assign.checklight_total = lightvals.base.total
            }
            token = Object.assign(
                simpleObj(token),
                getTrackerVal(token),
                lightvals.assign,
                {
                    centerx: Math.round(token.get('left') + (token.get('width') / 2)),
                    centery: Math.round(token.get('top') + (token.get('height') / 2))
                }
            );
        }
        return simpleObj(token);
    };
    const getObjOrNull = (type, id) => {
        return simpleObj(getObj(type, id) || new nullObj());
    };
    const getFirstOrNull = (type) => {
        return simpleObj(findObjs({ type: type })[0] || new nullObj());
    };

    const getFetchObject = (options = {}) => {
        let lib = {
            campaign: () => simpleObj(Campaign()),
            card: () => getCard(options),
            character: () => getChar(options),
            custfx: () => getCustFx(options),
            deck: () => getDeck(options),
            // door
            handout: () => getHandout(options),
            graphic: () => getGraphic(options),
            macro: () => getMacro(options),
            marker: () => getMarker(options),
            page: () => getPage(options),
            // path
            // pathv2
            pin: () => getPin(options),
            player: () => getPlayer(options),
            rollabletable: () => getRollableTable(options),
            //status: () => getStatus(options),
            tableitem: () => getTableItems(options),
            //tag: () => getTag(options),
            //text
            //window
            default: () => simpleObj(findObjs({ id: options.query })[0])
        };
        return (lib[options.type] || lib.default)();
    };

    const getFirstObjectOfType = (type = '') => {
        let o = getFirstOrNull(type);
        let lib = {
            campaign: () => Campaign(),
            // card
            character: () => getChar({ query: o.id, msg: { playerid: getFirstGM().id } }),
            custfx: () => getCustFx({ query: o.id }),
            // deck
            // door
            handout: () => getHandout({ query: o.id, msg: { playerid: getFirstGM().id } }),
            graphic: () => getGraphic({ query: o.id, pageid: o.pageid }),
            // macro
            marker: () => getMarker({ query: JSON.parse(Campaign().get('token_markers'))[0].tag }),
            page: () => getPage({ query: o.id }),
            // path
            // pathv2
            pin: () => getPin({ query: o.id, msg: { playerid: getFirstGM().id } }),
            // player
            rollabletable: () => getRollableTable({ query: o.id, msg: { playerid: getFirstGM().id } }),
            status: () => {
                let cmarkers = campMarkers('tag');
                let source = findObjs({ type: 'graphic' }).filter(g => g.get('statusmarkers').length && g.get('statusmarkers').split(/\s*,\s*/).every(s => cmarkers.includes(s)))[0];
                if (!source || !source.id) { return; }
                let query = source.get('statusmarkers').split(/\s*,\s*/)[0].split(/::/)[0];
                let m = { playerid: getFirstGM().id };
                return getStatus({ source, query, msg: m });
            },
            tableitem: () => {
                return getTableItems({ query: o.id,/* tbl: o.rollabletableid,*/ msg: { playerid: getFirstGM().id } })
            },
            tag: () => {
                let o = findObjs({ type: 'character' }).filter(c => c.get('tags').length)[0] ||
                    findObjs({ type: 'handout' }).filter(h => h.get('tags').length)[0];
                return o
                    ? getTag({ oid: o.id, otype: o.get('type'), query: o.get('tags')[0], pid: getFirstGM().id })
                    : { is: 'no', count: 0 };

            },
            // text
            //window
            default: () => getFirstOrNull(type)
        };
        return (lib[type] || lib.default)();
    };

    // ===== PROP CONTAINERS ============================
    const abilityProps = {
        nicks: {
        },
        compProps: {}
    }
    const attributeProps = {
        nicks: {
            istokenaction: ['tokenaction']
        },
        compProps: {}
    }
    const campaignProps = { // @(campaign.<prop>)
        nicks: {
            id: ['campaign_id'],
            type: ['campaign_type'],
            playerpageid: ['pageid', 'page_id', 'playerpageid', 'playerpage_id'],
            token_markers: ['markers']
        },
        compProps: {
            currentpages: { nicks: [], val: (o) => ((p = getPagesForAllPlayers()) => Object.keys(p).map(k => `${k}:${p[k]}`).join(','))() },
            currentpagesname: { nicks: [], val: (o) => ((p = getPagesForAllPlayers()) => Object.keys(p).map(k => `${getObjName(k, 'player')}:${getObjName(p[k], 'page')}`).join(','))() },
            pagename: { nicks: ['page_name', 'playerpagename', 'playerpage_name'], val: o => getObjName(o.playerpageid, 'page') },
            playerspecificpages: { nicks: [], val: (o) => Object.keys(o.playerspecificpages).map(k => `${k}:${o.playerspecificpages[k]}`).join(',') },
            playerspecificpagesname: { nicks: ['playerspecificpages_name'], val: (o) => Object.keys(o.playerspecificpages).map(k => `${getObjName(k, 'player')}:${getObjName(o.playerspecificpages[k], 'page')}`).join(',') },
        }
    }
    const cardProps = {
        nicks: {
            avatar: ['imgsrc']
        },
        compProps: {
            img: { nicks: [], val: (o) => `<img src="${o.avatar}">` },
            imgsrc_short: { nicks: [], val: (o) => ((d = o.avatar) => d.slice(0, Math.max(d.indexOf(`?`), 0) || d.length))() }
        }
    }
    const charProps = (() => {
        let nicks = {
            id: ['char_id', 'character_id'],
            type: ['char_type', 'character_type'],
            name: ['char_name', 'character_name'],

            controlledby: ['character_controlledby', 'character_cby', 'char_cby', 'char_controlledby', 'cby'],
        };
        let ccbyNicks = ['controlledby_names', 'controlledby_name', 'cby_name', 'cby_names', 'character_controlledby_names', 'character_cby_name', 'character_cby_names', 'char_cby_name', 'char_cby_names', 'char_controlledby_name', 'char_controlledby_names'];
        let compProps = {
            character_img: { nicks: ['char_img', 'character_image', 'char_image'], val: (o) => `<img src="${(o.avatar)}">` },
            character_controlledby_name: { nicks: ccbyNicks, val: (o) => getObjName(o.controlledby, 'playerlist') },
            inplayerjournals_name: { nicks: ['inplayerjournals_names'], val: (o) => getObjName(o.inplayerjournals, 'playerlist') },
            player: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
            tags: { nicks: [], val: (o) => JSON.parse(o.tags).join(',') }
        };
        return { nicks, compProps };
    })();
    const custfxProps = {
        nicks: {
            definition: ['def'],
            startcolour: ['startcolor'],
            endcolour: ['endcolor'],
            startcolourrandom: ['startcolorrandom'],
            endcolourrandom: ['endcolorrandom']
        },
        compProps: {}
    }
    const deckProps = {
        nicks: {
            avatar: ['imgsrc']
        },
        compProps: {
            img: { nicks: [], val: (o) => `<img src="${o.avatar}">` },
            imgsrc_short: { nicks: [], val: (o) => ((d = o.avatar) => d.slice(0, Math.max(d.indexOf(`?`), 0) || d.length))() }
        }
    }
    const doorProps = {
        nicks: {
            color: ['colour']
        },
        compProps: {
            path: { nicks: [], val: (o) => JSON.stringify(o.path) }
        }
    }
    const graphicProps = {
        nicks: {
            id: ['tid', 'token_id'],
            name: ['token_name'],
            type: ['token_type'],
            aura1_color: ['aura1'],
            aura1_radius: ['radius1'],
            aura1_square: ['square1'],
            aura2_color: ['aura2'],
            aura2_radius: ['radius2'],
            aura2_square: ['square2'],
            bar_location: ['bar_loc'],
            bar1_link: ['link1'],
            bar1_max: ['max1'],
            bar1_value: ['bar1', 'bar1_current'],
            bar2_link: ['link2'],
            bar2_max: ['max2'],
            bar2_value: ['bar2', 'bar2_current'],
            bar3_link: ['link3'],
            bar3_max: ['max3'],
            bar3_value: ['bar3', 'bar3_current'],
            bar4_link: ['link4'],
            bar4_max: ['max4'],
            bar4_value: ['bar4', 'bar4_current'],
            cardid: ['cid'],
            currentside: ['curside', 'side'],
            emits_bright_light: ['emits_bright'],
            emits_low_light: ['emits_low'],
            has_night_vision: ['nv_has', 'has_nv'],
            isdrawing: ['drawing'],
            light_sensitivity_multiplier: ['light_sensitivity_mult'],
            night_vision_distance: ['nv_dist', 'nv_distance'],
            night_vision_effect: ['nv_effect'],
            night_vision_tint: ['nv_tint'],
            pageid: ['page_id', 'pid', 'token_page_id', 'token_pageid', 'token_pid'],
            represents: ['reps'],
            statusmarkers: ['markers'],
            subtype: ['sub'],
            tint_color: ['tint'],
        },
        compProps: {
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') },
            bar1_name: { nicks: ['name1'], val: (o) => ((d = o.bar1_link) => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute'))() },
            bar2_name: { nicks: ['name2'], val: (o) => ((d = o.bar2_link) => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute'))() },
            bar3_name: { nicks: ['name3'], val: (o) => ((d = o.bar3_link) => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute'))() },
            bar4_name: { nicks: ['name4'], val: (o) => ((d = o.bar4_link) => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute'))() },
            cardback: { nicks: ['card_back'], val: (o) => getObjOrNull('card', o.cardid).card_back },
            cardname: { nicks: ['card_name'], val: (o) => getObjName(o.cardid, 'card') },
            deckid: { nicks: [], val: (o) => getObjOrNull('card', o.cardid).deckid },
            deckname: { nicks: [], val: (o) => getObjName('deck', getObjOrNull('card', o.cardid).deckid) },

            gmnotes: { nicks: [], val: (o) => unescape(o.gmnotes) },
            img: { nicks: [], val: (o) => `<img src="${o.imgsrc}">` },
            imgsrc_short: { nicks: [], val: (o) => ((d = o.imgsrc) => d.slice(0, Math.max(d.indexOf(`?`), 0) || d.length))() },
            lastx: { nicks: [], val: (o) => o.lastmove.split(/\s*,\s*/)[0] || '' },
            lasty: { nicks: [], val: (o) => o.lastmove.split(/\s*,\s*/)[1] || '' },
            player: { nicks: [], val: (o) => getControlledByList(o).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => getControlledByList(o).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
            represents_name: { nicks: ['reps_name'], val: (o) => getObjName(o.represents, 'character') },

            controlledby: { nicks: ['cby', 'token_cby', 'token_controlledby'], val: (o) => getControlledByList(o) },
            token_cby_names: { nicks: ['controlledby_names', 'controlledby_name', 'cby_names', 'cby_name', 'token_controlledby_names', 'token_cby_name', 'token_controlledby_name'], val: (o) => getObjName(getControlledByList(o), 'playerlist') },

            sides_short: { nicks: [], val: (o) => (o.sides || '').split(`|`).map(side => decodeURIComponent(side).slice(0, Math.max(side.indexOf(`?`), 0) || side.length)).join(`|`) },
            sidecount: { nicks: ['sidescount'], val: (o) => (o.sides || '').split(`|`).length }
        },

    }
    const handoutProps = {
        nicks: {
            avatar: ['imgsrc']
        },
        compProps: {
            controlledby_name: { nicks: ['controlledby_name', 'cby_name'], val: (o) => getObjName(o.controlledby, 'playerlist') },
            img: { nicks: [], val: (o) => `<img src="${o.avatar}">` },
            imgsrc_short: { nicks: [], val: (o) => ((d = o.avatar) => d.slice(0, Math.max(d.indexOf(`?`), 0) || d.length))() },
            inplayerjournals_name: { nicks: ['inplayerjournals_names'], val: (o) => getObjName(o.inplayerjournals, 'playerlist') },
            player: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
            tags: { nicks: [], val: (o) => JSON.parse(o.tags).join(',') }
        }
    }
    const macroProps = {
        nicks: {
            istokenaction: ['tokenaction']
        },
        compProps: {}
    }
    const markerProps = { // derived from the Campaign object
        nicks: {
            tag: ['marker_id'],
            name: ['marker_name']
        },
        compProps: {}
    }
    const pageProps = { // @(page.<page ref>.<prop>)
        nicks: {
            id: ['page_id'],
            name: ['page_name'],
            type: ['page_type'],
            background_color: ['bg_color'],
            daylightmodeopacity: ['daylight_mode_opacity'],
            diagonaltype: ['diagonal_type', 'diagonal'],
            fog_opacity: ['fogopacity'],
            gridcolor: ['grid_color'],
            gridlabel: ['grid_label'],
            grid_opacity: ['gridopacity'],
            grid_type: ['gridtype'],
            jukebox_trigger: ['jukeboxtrigger'],
            showdarkness: ['show_darkness'],
            showgrid: ['show_grid'],
            showlighting: ['show_lighting'],
            snapping_increment: ['snappingincrement']
        },
        compProps: {}
    }
    const pathProps = {
        nicks: {
            pageid: ['page_id', 'pid'],
            stroke_width: ['strokewidth']
        },
        compProps: {
            controlledby: { nicks: ['cby'], val: (o) => getControlledByList(o) },
            controlledby_names: { nicks: ['controlledby_name', 'cby_name', 'cby_names'], val: (o) => getObjName(getControlledByList(o), 'playerlist') },
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') },
            player: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => getControlledByList(o).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] }
        }
    }
    const pathv2Props = {
        nicks: {
            pageid: ['page_id', 'pid'],
            stroke_width: ['strokewidth']
        },
        compProps: {
            controlledby: { nicks: ['cby'], val: (o) => getControlledByList(o) },
            controlledby_names: { nicks: ['controlledby_name', 'cby_name', 'cby_names'], val: (o) => getObjName(getControlledByList(o), 'playerlist') },
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') },
            player: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => getControlledByList(o).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] }
        }
    }
    const pinProps = (() => {
        const nicks = {
            title: ['name']
        };
        const permission = (obj, prop, msg) => {
            if (playerIsGM(msg.playerid)) return true;
            if (obj.tooltipVisibleTo !== 'all') return false;
            switch (prop.toLowerCase()) {
                case 'image':
                    return true;
                case 'notes':
                    return obj.notesVisibleTo === 'all';
                case 'gmnotes':
                    return obj.gmNotesVisibleTo === 'all';
                case 'title':
                case 'name':
                    return obj.nameplateVisibleTo === 'all';
            }
        };
        const compProps = {
            gmnotes: {
                nicks: [],
                val: (o, msg) => permission(o, 'gmnotes', msg)
                    ? o.gmnotes
                    : undefined
            },
            image: {
                nicks: ['img'],
                val: (o, msg) => permission(o, 'image', msg)
                    ? ((u = o.tooltipImage.length ? o.tooltipImage : getObjOrNull(o.linkType, o.link).avatar || '') => u.length ? `<img src="${u}">` : undefined)()
                    : undefined
            },
            linkname: { nicks: [], val: (o) => getObjName(o.link, o.linkType) || getObjName(o.link, 'unknown') },
            name: {
                nicks: ['title'],
                val: (o, msg) => permission(o, 'name', msg)
                    ? o.title.length
                        ? o.title
                        : o.subLink.length
                            ? o.subLink
                            : getObjName(o.link, o.linkType) || getObjName(o.link, 'unknown')
                    : undefined
            },
            notes: {
                nicks: [],
                val: (o, msg) => permission(o, 'notes', msg)
                    ? o.notes
                    : undefined
            },
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') }
        };
        return { nicks, compProps };
    })();
    const playerProps = { // @(player.<player ref>.<prop>)
        nicks: {
            id: ['player_id'],
            displayname: ['name', 'player_name', 'display_name'],
            type: ['player_type'],
            d20userid: ['roll20id', 'roll20_id', 'r20id', 'r20_id', 'userid', 'user_id'],
            lastpage: ['last_page'],
            showmacrobar: ['show_macrobar'],
            speakingas: ['speaking_as']
        },
        compProps: {
            currentpage: { nicks: ['current_page'], val: (o) => getPageForPlayer(o.id) },
            currentpagename: { nicks: ['current_page_name', 'page_name'], val: (o) => getObjName(getPageForPlayer(o.id), 'page') },
            isgm: { nicks: [], val: (o) => playerIsGM(o) },
            lastpagename: { nicks: ['last_page_name'], val: (o) => getObjName(o.lastpage, 'page') }
        }
    }
    const rollabletableProps = {
        nicks: {},
        compProps: {
            totalweight: { nicks: [], val: (o) => findObjs({ type: 'tableitem', rollabletableid: o.id }).reduce((m, v) => m += v.get('weight'), 0) }
        }
    }
    const statusProps = { // derived from a token object
        nicks: {
            id: ['status_id'],
            name: ['status_name'],
            num: ['number', 'value', 'val']
        },
        compProps: {

        }
    }
    const tableitemProps = {
        nicks: {
            avatar: ['imgsrc']
        },
        compProps: {
            img: { nicks: [], val: (o) => `<img src="${o.avatar}">` },
            imgsrc_short: { nicks: [], val: (o) => o.avatar.slice(0, Math.max(o.avatar.indexOf(`?`), 0) || o.avatar.length) }
        }
    }
    const tagProps = {
        nicks: {

        },
        compProps: {

        }
    }
    const textProps = {
        nicks: {
            controlledby: ['cby'],
            pageid: ['page_id', 'pid']

        },
        compProps: {
            controlledby_names: { nicks: ['cby_names', 'cby_name', 'controlledby_name'], val: (o) => getObjName(o.controlledby, 'playerlist') },
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') },
            player: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => getControlledByList(o).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
        },

    }
    const windowProps = {
        nicks: {
            pageid: ['pid', 'page_id']
        },
        compProps: {
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') }
        }
    }

    const customPropsByType = {
        ability: abilityProps,
        attribute: attributeProps,
        campaign: campaignProps,
        card: cardProps,
        character: charProps,
        custfx: custfxProps,
        deck: deckProps,
        door: doorProps,
        graphic: graphicProps,
        handout: handoutProps,
        marker: markerProps,
        macro: macroProps,
        page: pageProps,
        path: pathProps,
        pathv2: pathv2Props,
        pin: pinProps,
        player: playerProps,
        rollabletable: rollabletableProps,
        status: statusProps,
        tableitem: tableitemProps,
        tag: tagProps,
        text: textProps,
        window: windowProps
    };
    const buildPropsForType = (query) => {
        let o = getFirstObjectOfType(query.toLowerCase());
        if (!o || !o.id) { return; }
        let nicks = customPropsByType[query.toLowerCase()]?.nicks || {};
        let compProps = customPropsByType[query.toLowerCase()]?.compProps || {};
        let props = Object.keys(o).reduce((m, p) => { // roll20 object props
            m[p.toLowerCase()] = (o) => o[p];
            return m;
        }, {});
        Object.keys(nicks || {}).forEach(p => { // aliases for roll20 object props
            nicks[p].forEach(n => {
                props[n] = (o) => o[p];
            });
        });
        Object.keys(compProps || {}).forEach(p => { // custom props
            [p, ...compProps[p].nicks].forEach(n => {
                props[n] = compProps[p].val;
            });
        });
        return props;
    };
    let knownObjectTypes = [];
    let propContainers = {};
    const commitProps = t => {
        knownObjectTypes.push(t);
        propContainers[t] = buildPropsForType(t);
    };
    const buildPropContainers = () => {
        [...new Set(getAllObjs().map(o => o.get('type')))]
            .filter(t => !knownObjectTypes.includes(t))
            .forEach(t => {
                commitProps(t);
            });
        Object.keys(customPropsByType) // props for non-R20 objects like tags, status, and markers
            .filter(k => !knownObjectTypes.includes(k))
            .forEach(k => {
                propContainers[k] = buildPropsForType(k);
            });
    };

    // ==================================================
    //		EVENT HANDLERS
    // ==================================================
    const handleInput = (msg, msgstate = {}) => {
        const trackerrx = /^tracker(\[(?<filter>[^\]]+)]){0,1}((?<operator>\+|-)(?<offset>\d+)){0,1}$/i;
        const rptgitemrx = /(?<type>(?:\*))\((?<character>[^|.]+?)[|.](?<section>[^\s.|]+?)[|.](?:\[\s*(?<pattern>.+?)\s*]|(?<reference>\$(?:\d+|[nN])|1[dD][wW](?:[eE][iI][gG][hH][tT])?(?:\?.+?)?|[a-zA-Z0-9_-]{20})|(?<aggregate>(?:min|max|avg|sum|vals|uniq|rowids|ids)(?:\?.+?)?))\s*[|.](?<valuesuffix>[^[\s).]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
        // const rptgitemrx = /(?<type>(?:\*))\((?<character>[^|.]+?)[|.](?<section>[^\s.|]+?)[|.](?:\[\s*(?<pattern>.+?)\s*]|(?<reference>\$\d+|[a-zA-Z0-9_-]{20}))\s*[|.](?<valuesuffix>[^[\s).]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;

        const macrorx = /#\((?<item>[^\s.[)]+?)(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
        const multirx = /(?<type>(?:@|%))\((?<obj>tracker(?:\[[^\]]+]){0,1}(?:(?:\+|-)\d+){0,1}|[^@*%#|.]+?)[|.](?<prop>[^@*%#.[|]+?)(?:[|.](?<identikey>[^@*%#.|[]+?)(?:[|.](?<subprop>[^[@*%#]+?)){0,1}){0,1}(?:\[(?<default>[^@*%#\]]*?)]){0,1}\s*\)/gi;
        const testConstructs = c => {
            return [multirx, rptgitemrx, macrorx].reduce((m, r) => {
                m = m || r.test(c);
                r.lastIndex = 0;
                return m;
            }, false);
        };
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        let msgId = generateUUID();

        const filterObj = {
            'page': (t) => t._pageid === getPageForPlayer(msg.playerid),
            'ribbon': (t) => t._pageid === Campaign().get('playerpageid'),
            'gm': () => true
        };
        const getPropertyValue = (searchObj, typeList = []) => {
            let retval;
            let propObj;
            let newSource;

            if (!Object.keys(propContainers[searchObj.source.type] || {}).length) { commitProps(searchObj.source.type); }

            if (typeList.includes(searchObj.source.type)) { return searchObj.retval; }

            typeList.push(searchObj.source.type);
            let newProp1;

            switch (searchObj.source.type) {
                case 'character':
                    if (searchObj.prop1.toLowerCase() === 'status' || // token status
                        (searchObj.prop1.toLowerCase() === 'is' && searchObj.prop2 && isMarker(searchObj.prop2)) || // token status
                        (Object.keys(propContainers.graphic || {}).includes(searchObj.prop1)
                            && searchObj.type !== 'speaker'
                            && !Object.keys(propContainers.character).includes(searchObj.prop1)
                        ) // token property
                    ) { // any of these cases means we should get a token, if possible
                        newSource = getGraphic({ query: searchObj.source.name, msg: searchObj.msg, /*pid: getPageIDForPlayer(searchObj.msg.playerid) */ });
                        if (!newSource) {
                            notes.push(`No token can be found for that character. Using default value.`);
                        } else {
                            retval = getPropertyValue({ ...searchObj, ...{ source: newSource } }, typeList);
                        }
                    } else if (searchObj.prop1.toLowerCase() === 'is') { // looking for tag (status would have been already caught)
                        if (searchObj.prop2) {
                            newSource = getTag({ oid: searchObj.source.id, otype: 'character', query: searchObj.prop2, pid: searchObj.msg.playerid });
                            retval = propContainers.tag.is(newSource, searchObj.msg);
                        }
                        // } else if (Object.keys(propContainers.graphic).includes(searchObj.prop1)) { // token property taken care of, above
                    } else if (Object.keys(propContainers.character || {}).includes(searchObj.prop1)) { // character property
                        retval = propContainers.character[searchObj.prop1](searchObj.source, searchObj.msg);
                    } else { // potentially character attribute
                        retval = getCharacterAttribute(searchObj);
                    }
                    break;
                case 'graphic':
                    if (searchObj.prop1.toLowerCase() === 'status' || // token status
                        (searchObj.prop1.toLowerCase() === 'is' && searchObj.prop2 && isMarker(searchObj.prop2))) {
                        newSource = getStatus({ source: searchObj.source, query: searchObj.prop2, msg: searchObj.msg });
                        newProp1 = 'val';
                        if (searchObj.prop3 === 'is' || searchObj.prop1 === 'is') {
                            newProp1 = 'is';
                        } else if (searchObj.prop3 && searchObj.prop3.length) {
                            newProp1 = searchObj.prop3;
                        }
                        retval = getPropertyValue({ ...searchObj, ...{ source: newSource, prop1: newProp1 } }, typeList);
                    } else if (Object.keys(propContainers.graphic || {}).includes(searchObj.prop1)) {
                        retval = propContainers.graphic[searchObj.prop1](searchObj.source, searchObj.msg);
                    } else {
                        if (searchObj.source.subtype === 'card') { // card subtype, could be type:card
                            if (!searchObj.source.cardid || !searchObj.source.cardid.length) {
                                notes.push(`Not a recongized token property, but no card object can be found for that card graphic. Using default value.`);
                            } else {
                                newSource = getCard({ query: searchObj.source.cardid });
                                if (!newSource) {
                                    notes.push(`No card object can be found for that card graphic. Using default value.`);
                                } else {
                                    retval = getPropertyValue({ ...searchObj, ...{ source: newSource } }, typeList);
                                }
                            }
                        } else { // token subtype, could be character
                            if (!searchObj.source.represents || !searchObj.source.represents.length) {
                                notes.push(`Not a recongized token property, and no character is associated with that token. Using default value.`);
                            } else {
                                newSource = getChar({ query: searchObj.source.represents, msg: searchObj.msg });
                                if (!newSource) {
                                    notes.push(`Not a recongized token property, but the associated character cannot be found. Using default value.`);
                                } else {
                                    retval = getPropertyValue({ ...searchObj, ...{ source: newSource } }, typeList);
                                }
                            }
                        }
                    }
                    break;
                case 'rollabletable':
                    if (Object.keys(propContainers.rollabletable || {}).includes(searchObj.prop1)) {
                        retval = propContainers.rollabletable[searchObj.prop1](searchObj.source, searchObj.msg);
                    } else {
                        newSource = getTableItems({ query: searchObj.prop1, tbl: searchObj.source, msg: searchObj.msg });
                        if (!newSource) {
                            notes.push(`Not a recognized item in that table. Using default value.`);
                        } else {
                            retval = propContainers.tableitem[!(searchObj.prop2 && searchObj.prop2.length) ? 'name' : searchObj.prop2](newSource, searchObj.msg);
                        }
                    }
                    break;
                case 'handout':
                    if (searchObj.prop1.toLowerCase() === 'is') { // looking for tag
                        if (searchObj.prop2) {
                            newSource = getTag({ oid: searchObj.source.id, otype: 'handout', query: searchObj.prop2, pid: searchObj.msg.playerid });
                            retval = propContainers.tag.is(newSource, searchObj.msg);
                        }
                    } else if (Object.keys(propContainers.character || {}).includes(searchObj.prop1)) { // handout property
                        retval = propContainers.character[searchObj.prop1](searchObj.source, searchObj.msg);
                    }
                    break;
                default:
                    propObj = propContainers[searchObj.source.type];
                    if (!Object.keys(propObj || {}).includes(searchObj.prop1.toLowerCase())) {
                        notes.push(`Unable to find a ${searchObj.type.toLowerCase()} property named ${searchObj.prop1}. Using default value.`);
                    } else {
                        retval = propObj[searchObj.prop1.toLowerCase()](searchObj.source, searchObj.msg);
                        if (typeof retval === 'undefined') {
                            notes.push(`Unable to find ${searchObj.type.toLowerCase()} value for ${searchObj.prop1}. Using default value.`);
                            retval = searchObj.retval;
                        }
                    }

            }

            return typeof retval !== 'undefined' ? retval : searchObj.retval;
        };

        const getCharacterAttribute = (searchObj) => {
            let retval = getSheetItemVal({ ...searchObj, ...{ item: searchObj.prop1, valtype: searchObj.prop2 } }, notes);
            if (typeof retval === 'undefined') {
                notes.push(`Unable to find ${searchObj.symbol === '@' ? 'attribute' : 'ability'} named ${searchObj.prop1} for ${searchObj.source.name}. Using default value.`);
                retval = searchObj.retval;
            }
            return retval;
        };

        const assignFromSpecialIdentifier = (searchObj) => {
            let offset = 0,
                trackres,
                pgfilter = 'page',
                presource,
                reverse = false;
            if (trackerrx.test(searchObj.init.obj)) { // if it is a tracker call, it could have an offset, so we detect that first
                trackres = trackerrx.exec(searchObj.init.obj);
                offset = parseInt(trackres.groups.offset || '0');
                if (trackres.groups.operator === '-') reverse = true;
                if (playerIsGM(searchObj.msg.playerid)) pgfilter = trackres.groups.filter || 'page';
                searchObj.type = `tracker`;
                let to = JSON.parse(Campaign().get('turnorder') || '[]').filter(filterObj[pgfilter] || filterObj['page']);
                if (!to.length || to[0].id === '-1') {
                    notes.push(`No tracker token for ${searchObj.m}. Using default value.`);
                } else {
                    presource = to[(reverse ? to.length - (offset % to.length) : offset % to.length) % to.length];
                    searchObj.source = getGraphic({ query: presource.id, pageid: presource._pageid });
                }
            } else if (searchObj.init.obj.toLowerCase() === 'speaker') { // if it's a speaker call, determine if player or character, and adjust appropriately
                presource = getChar({ query: msg.who, msg: searchObj.msg });
                if (presource && presource.name) {
                    searchObj.type = 'speaker';
                    searchObj.source = presource;
                } else {
                    presource = getPlayer({ query: msg.who, msg: searchObj.msg });
                    if (presource && presource.displayname) {
                        searchObj.type = 'speaker';
                        searchObj.source = presource;
                    } else {
                        notes.push(`Unable to find the speaker`);
                    }
                }
            } else if (searchObj.init.obj.toLowerCase() === 'selected') {
                if (!searchObj.msg.selected || !searchObj.msg.selected.length) { // selected but no token => default
                    notes.push(`No token selected for ${searchObj.m}. Using default value.`);
                } else {
                    presource = simpleObj(findObjs({ id: searchObj.msg.selected[0]._id })[0]);
                    if (!Object.keys(propContainers || {}).includes(presource.type.toLowerCase())) {
                        commitProps(presource.type);
                    }
                    searchObj.source = getFetchObject({ type: presource.type, query: presource.id, msg: searchObj.msg });
                    searchObj.type = 'selected';
                }
            }
        };

        while (testConstructs(msg.content)) {
            msg.content = msg.content.replace(multirx, (m, symbol, obj, prop, identikey, subprop, def = '') => {
                let presource,
                    retval = def,
                    searchObj = {
                        source: {},
                        type: '',
                        symbol: symbol,
                        prop1: prop,
                        prop2: identikey,
                        prop3: subprop,
                        retval: def,
                        init: {
                            m: m,
                            obj: obj,
                            prop: prop,
                            identikey: identikey,
                            subprop: subprop,
                            def: def
                        },
                        msg: msg
                    };
                if (obj.toLowerCase() === 'table') { searchObj.type = 'rollabletable'; obj = 'rollabletable'; }
                if (trackerrx.test(obj) || ['selected', 'speaker'].includes(obj.toLowerCase())) {
                    assignFromSpecialIdentifier(searchObj);
                } else if ([...knownObjectTypes, 'marker'].includes(obj.toLowerCase()) || (findObjs({ type: obj.toLowerCase() })[0] || {}).hasOwnProperty('id')) { // fetch call using object type
                    searchObj.source = getFetchObject({ type: obj.toLowerCase(), query: prop, msg: msg });
                    searchObj.type = obj.toLowerCase();
                    if (!['campaign', 'root'].includes(obj.toLowerCase())) {
                        searchObj.prop1 = searchObj.type === 'marker' ? identikey || 'html' : identikey;
                        searchObj.prop2 = subprop;
                        searchObj.prop3 = undefined;
                    }
                    //retval = getPropertyValue(source, obj, identikey, def);
                } else if (((presource = findObjs({ id: obj })[0]) || {}).hasOwnProperty('id')) { // object ID
                    searchObj.source = getFetchObject({ type: presource.get('type'), query: presource.id, msg: msg });
                    searchObj.type = 'id';
                } else { // all others (names, etc.)
                    if (/([^[]+)\[([^\]]+)\]/.test(obj)) {
                        let pageData = /([^[]+)\[([^\]]+)\]/.exec(obj);
                        presource = getGraphic({ query: pageData[1], msg: searchObj.msg, pageid: (getPage({ query: pageData[2] }) || {}).id }); //getGraphic
                    } else {
                        presource = getGraphic({ query: obj, msg: searchObj.msg/*, pageid: getPageIDForPlayer(msg.playerid) */ }); //getGraphic
                    }
                    if (presource && presource.name) {
                        searchObj.type = 'name';
                        searchObj.source = presource;
                    } else {
                        presource = getChar({ query: obj, msg: searchObj.msg }); //getChar
                        if (presource && presource.name) {
                            searchObj.type = 'name';
                            searchObj.source = presource;
                        } else {
                            notes.push(`Unable to find a game object named ${obj}. Using default value.`);
                        }
                    }
                }

                if (!searchObj.source || !Object.keys(searchObj.source || {}).length) {
                    retval = searchObj.retval;
                } else {
                    retval = getPropertyValue(searchObj);
                }

                if (retval) status.push('changed');
                return retval;
            });

            // REPEATING SHEET ITEMS
            msg.content = msg.content.replace(rptgitemrx, (m, symbol, obj, section, pattern, reference, aggregate, valuesuffix, valtype, def = '') => {
                let retval,
                    searchObj = {
                        source: {},
                        type: '',
                        symbol: symbol,
                        obj: obj,
                        section: section,
                        pattern: pattern,
                        reference: reference,
                        aggregate: aggregate,
                        valuesuffix: valuesuffix,
                        valtype: valtype,
                        retval: def,
                        init: {
                            m: m,
                            type: symbol,
                            obj: obj,
                            section: section,
                            pattern: pattern,
                            reference: reference,
                            valuesuffix: valuesuffix,
                            valtype: valtype,
                            def: def
                        },
                        msg: msg
                    };
                if (trackerrx.test(obj) || ['selected', 'speaker'].includes(obj.toLowerCase())) {
                    assignFromSpecialIdentifier(searchObj);
                    if (searchObj.source && searchObj.source.type === 'graphic') {
                        searchObj.source = getChar({ query: searchObj.source.represents, msg });
                    }
                } else {
                    searchObj.source = getChar({ query: obj, msg: searchObj.msg });
                    if ((findObjs({ id: obj })[0] || {}).hasOwnProperty('id')) { // object ID
                        searchObj.type = 'id';
                    } else { // all others (names, etc.)
                        searchObj.type = 'name'
                    }
                }

                if (!searchObj.source || !Object.keys(searchObj.source || {}).length) {
                    retval = searchObj.retval;
                    notes.push(`Unable to find character for ${m}. Using default value.`); //track note only if we haven't already tracked no selected
                } else {
                    if (!Object.keys(propContainers[searchObj.source.type] || {}).length) { commitProps(searchObj.source.type); }
                    if (!Object.keys(propContainers.attribute || {}).length) { commitProps('attribute'); }

                    retval = getSheetItemVal(searchObj, notes);
                    if (typeof retval === 'undefined') {
                        notes.push(`Unable to find repeating item for ${m}. Using default value.`);
                        retval = searchObj.retval;
                    }
                }
                if (retval) status.push('changed');
                return retval;
            });

            // MACROS
            msg.content = msg.content.replace(macrorx, (m, item, def = '') => {
                let retval = def;
                let locobj = findObjs({ type: 'macro', name: item })[0];
                const validator = e => ['all', msg.playerid].includes(e);
                if (!locobj || !(msg.playerid === locobj.get('_playerid') || locobj.get('visibleto').split(',').some(validator))) {
                    status.push('unresolved');
                    notes.push(`Unable to find macro named ${item}. Using default value.`);
                    return retval;
                }
                retval = locobj.get('action') || '';
                status.push('changed');
                return retval;
            });
        }
        return condensereturn(funcret, status, notes);
    };

    const handleConfig = msg => {
        if (msg.type !== 'api' || !/^!fetchconfig/.test(msg.content)) return;
        let recipient = getWhisperTo(msg.who);
        if (!playerIsGM(msg.playerid)) {
            msgbox({ title: 'GM Rights Required', msg: 'You must be a GM to perform that operation', whisperto: recipient });
            return;
        }
        let cfgrx = /^(\+|-)(playerscanids)$/i;
        let res;
        let cfgTrack = {};
        let message;
        if (/^!fetchconfig\s+[^\s]/.test(msg.content)) {
            msg.content.split(/\s+/).slice(1).forEach(a => {
                res = cfgrx.exec(a);
                if (!res) return;
                if (res[2].toLowerCase() === 'playerscanids') {
                    manageState.set('playerscanids', (res[1] === '+'));
                    cfgTrack[res[2]] = res[1];
                }
            });
            let changes = Object.keys(cfgTrack).map(k => `${html.span(k, localCSS.inlineEmphasis)}: ${cfgTrack[k] === '+' ? 'enabled' : 'disabled'}`).join('<br>');
            msgbox({ title: `Fetch Config Changed`, msg: `You have made the following changes to the Fetch configuration:<br>${changes}`, whisperto: recipient });
        } else {
            cfgTrack.playerscanids = `${html.span('playerscanids', localCSS.inlineEmphasis)}: ${manageState.get('playerscanids') ? 'enabled' : 'disabled'}`;
            message = `Fetch is currently configured as follows:<br>${cfgTrack.playerscanids}`;
            msgbox({ title: 'Fetch Configuration', msg: message, whisperto: recipient });
        }
    };

    const handlePropReport = msg => {
        /*
        !fetchprops
        !fetchprops --type=<type>        
        */
        if (!(msg.type === "api" && /^!fetchprops/i.test(msg.content))) return;
        if (/^!fetchprops-rebuild/i.test(msg.content)) {
            buildPropContainers();
        }
        let contents = [];
        let rptArgs = {
            type: '',
            ref: '',
            object: undefined
        };
        const propNicks = (type) => {
            let nicks = [...Object.entries(customPropsByType[type]?.compProps || {}).map(e => [e[0], ...e[1].nicks]),
            ...Object.entries(customPropsByType[type]?.nicks || {}).map(e => [e[0], ...e[1]])];
            let filterProps = nicks.reduce((m, p) => {
                m = [...m, ...p];
                return m;
            }, []);
            let remainingProps = Object.keys(propContainers[type] || {}).filter(p => !filterProps.includes(p));
            remainingProps.filter(k => !/^_/.test(k)).forEach(k => { nicks.push([k]); });
            remainingProps.filter(k => /^_/.test(k)).forEach(k => { nicks.find(n => n.includes(k.slice(1))).unshift(k); });
            return nicks.map(props => props.sort()).sort((a, b) => a[0] > b[0] ? 1 : -1);
        }

        let [handle, args] = ((apriori = msg.content.split(/\s+--/)) => { return [apriori[0], apriori.slice(1)]; })();

        let typesWithProps = Object.keys(propContainers || {});
        let tbl = '';

        args.filter(a => /^([^#\|=:]+)(?:#|\||=|:)(.+)$/.test(a)).forEach(a => {
            let argParts = a.split(/^([^#\|=:]+)(?:#|\||=|:)(.+)$/).slice(1, 3);
            if (argParts[0].toLowerCase() === 'type' && typesWithProps.includes(argParts[1].toLowerCase())) {
                rptArgs.type = argParts[1].toLowerCase();
            } else if (argParts[0].toLowerCase() === 'for') {
                rptArgs.ref = argParts[1];
            }
        });
        let btnRebuild = Messenger.Button({ type: '!', label: 'Rebuild', elem: `!fetchprops-rebuild${rptArgs.type && rptArgs.type.length ? ' --type=' + rptArgs.type : ''}`, css: localCSS.button });
        let tblFooter = html.table(html.tr(html.td(btnRebuild, localCSS.textright)));
        if (!args.length || !rptArgs.type) { // handle only
            tbl = html.table(
                typesWithProps.filter(t => propContainers[t]).sort().map((k, i) => html.tr(
                    html.td(k) +
                    html.td(Object.keys(propContainers[k] || {}).length) +
                    html.td(Messenger.Button({ type: '!', label: 'Props', elem: `!fetchprops --type=${k}`, css: localCSS.button }), localCSS.textright),
                    i % 2 === 1 ? localCSS.tblOddRow : {}
                )).join('')
            );
            msgbox({ title: `Fetch Props for Each Type`, whisperto: getWhisperTo(msg.who), msg: tbl, headercss: localCSS.msgheader, btn: tblFooter });
        } else { // handle with type
            let nicks = propNicks(rptArgs.type);
            tbl = html.table(
                nicks.map((props, i) => html.tr(
                    html.td(props.join('<br>')),
                    i % 2 === 1 ? localCSS.tblOddRow : {}
                )).join('')
            );
            msgbox({ title: `Fetch Props for ${rptArgs.type}`, whisperto: getWhisperTo(msg.who), msg: tbl, headercss: localCSS.msgheader, btn: tblFooter });
            /*
            nicks.forEach(props => {
                contents.push(`${props.join('%NEWLINE%')}= `); // ${Messenger.HE(propContainers[rptArgs.type][props[0]](rptArgs.object))}`);
            });
            defaultReport(rptArgs.type, contents);
            /* */
        }
    };

    // ==================================================
    //		DEPENDENCIES
    // ==================================================
    const checkDependencies = (deps) => {
        /* pass array of objects like
            { name: 'ModName', version: '#.#.#' || '', mod: ModName || undefined, checks: [ [ExposedItem, type], [ExposedItem, type] ] }
        */
        const dependencyEngine = (deps) => {
            const versionCheck = (mv, rv) => {
                let modv = [...mv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                let reqv = [...rv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                return reqv.reduce((m, v, i) => {
                    if (m.pass || m.fail) return m;
                    if (i < 3) {
                        if (parseInt(modv[i]) > parseInt(reqv[i])) m.pass = true;
                        else if (parseInt(modv[i]) < parseInt(reqv[i])) m.fail = true;
                    } else {
                        // all betas are considered below the release they are attached to
                        if (reqv[i] === 0 && modv[i] === 0) m.pass = true;
                        else if (modv[i] === 0) m.pass = true;
                        else if (reqv[i] === 0) m.fail = true;
                        else if (parseInt(modv[i].slice(1)) >= parseInt(reqv[i].slice(1))) m.pass = true;
                    }
                    return m;
                }, { pass: false, fail: false }).pass;
            };

            let result = { passed: true, failures: {}, optfailures: {} };
            deps.forEach(d => {
                let failObj = d.optional ? result.optfailures : result.failures;
                if (!d.mod) {
                    if (!d.optional) result.passed = false;
                    failObj[d.name] = 'Not found';
                    return;
                }
                if (d.version && d.version.length) {
                    if (!(API_Meta[d.name].version && API_Meta[d.name].version.length && versionCheck(API_Meta[d.name].version, d.version))) {
                        if (!d.optional) result.passed = false;
                        failObj[d.name] = `Incorrect version. Required v${d.version}. ${API_Meta[d.name].version && API_Meta[d.name].version.length ? `Found v${API_Meta[d.name].version}` : 'Unable to tell version of current.'}`;
                        return;
                    }
                }
                d.checks.reduce((m, c) => {
                    if (!m.passed) return m;
                    let [pname, ptype] = c;
                    if (!d.mod.hasOwnProperty(pname) || typeof d.mod[pname] !== ptype) {
                        if (!d.optional) m.passed = false;
                        failObj[d.name] = `Incorrect version.`;
                    }
                    return m;
                }, result);
            });
            return result;
        };
        let depCheck = dependencyEngine(deps);
        let failures = '', contents = '', msg = '';
        if (Object.keys(depCheck.optfailures).length) { // optional components were missing
            failures = Object.keys(depCheck.optfailures).map(k => `&bull; <code>${k}</code> : ${depCheck.optfailures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> utilizies one or more other scripts for optional features, and works best with those scripts installed. You can typically find these optional scripts in the 1-click Mod Library:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
        }
        if (!depCheck.passed) {
            failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
            return false;
        }
        return true;
    };

    // ==================================================
    //		METASCRIPT FUNCTIONALITY
    // ==================================================
    const condensereturn = (funcret, status, notes) => {
        funcret.runloop = (status.includes('changed') || status.includes('unresolved'));
        if (status.length) {
            funcret.status = status.reduce((m, v) => {
                switch (m) {
                    case 'unchanged':
                        m = v;
                        break;
                    case 'changed':
                        m = v === 'unresolved' ? v : m;
                        break;
                    case 'unresolved':
                        break;
                }
                return m;
            });
        }
        funcret.notes = notes.join('<br>');
        return funcret;
    };
    let scriptisplugin = false;
    // const fetch = async (m, s) => await handleInput(m, s);
    const fetch = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);

    // ==================================================
    //		INITIALIZATION
    // ==================================================
    on('ready', () => {
        versionInfo();
        logsig();

        let reqs = [
            {
                name: 'checkLightLevel',
                //                version: `1.0.0.b3`,
                mod: typeof checkLightLevel !== 'undefined' ? checkLightLevel : undefined,
                checks: [['isLitBy', 'function']],
                optional: true
            },
            {
                name: 'libTokenMarkers',
                version: `0.1.2`,
                mod: typeof libTokenMarkers !== 'undefined' ? libTokenMarkers : undefined,
                checks: [['getStatus', 'function'], ['getStatuses', 'function'], ['getOrderedList', 'function']]
            },
            {
                name: 'Messenger',
                version: `1.0.0`,
                mod: typeof Messenger !== 'undefined' ? Messenger : undefined,
                checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'function'], ['Css', 'function']]
            }
        ];
        if (!checkDependencies(reqs)) return;
        html = Messenger.Html();
        css = Messenger.Css();
        HE = Messenger.HE;
        buildPropContainers();

        on('chat:message', handleConfig);
        on('chat:message', handlePropReport);

        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(fetch);
        }
    });
    return {
        KnownObjectTypes: knownObjectTypes,
        PropContainers: propContainers,
        CustomPropsByType: customPropsByType
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Fetch.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Fetch.offset); } }
/* */
/*
================================================================
END SCRIPT: Fetch
================================================================
*/
