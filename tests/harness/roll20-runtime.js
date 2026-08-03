'use strict';

const vm = require('node:vm');
const { EventBus } = require('./event-bus');
const { ObjectStore } = require('./object-store');
const { ChatCapture } = require('./chat-capture');
const { BeaconSheetMock } = require('./beacon-sheet-mock');

function makeUnderscore(runtime) {
  const each = (value, fn) => {
    if (Array.isArray(value)) value.forEach(fn);
    else if (value && typeof value === 'object') Object.keys(value).forEach((key) => fn(value[key], key, value));
    return value;
  };
  const flatten = (items) => items.reduce((all, item) => all.concat(Array.isArray(item) ? flatten(item) : item), []);
  const api = {
    after: (count, fn) => { let calls = 0; return (...args) => (++calls >= count ? fn(...args) : undefined); },
    bind: (fn, context, ...bound) => fn.bind(context, ...bound),
    chain(value) { const wrapped = { value: () => value }; for (const key of Object.keys(api)) if (typeof api[key] === 'function') wrapped[key] = (...args) => { value = api[key](value, ...args); return wrapped; }; return wrapped; },
    clone: (value) => Array.isArray(value) ? [...value] : value && typeof value === 'object' ? { ...value } : value,
    compact: (items) => items.filter(Boolean), contains: (items, value) => (items || []).includes(value),
    // Intentional simplification: underscore deferral uses the controlled fake
    // timer queue so callbacks and failures are deterministic and observable.
    defer: (fn, ...args) => runtime.setTimeout(fn, 0, ...args), difference: (items, ...others) => items.filter((item) => !flatten(others).includes(item)),
    each, escape: (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[c]),
    every: (items, fn = Boolean) => (items || []).every(fn), extend: (target, ...sources) => Object.assign(target, ...sources),
    filter: (items, fn) => (items || []).filter(fn), find: (items, fn) => (items || []).find(fn), first: (items, count) => count === undefined ? (items || [])[0] : (items || []).slice(0, count),
    flatten, has: (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key), indexOf: (items, item) => (items || []).indexOf(item),
    isArray: Array.isArray, isEmpty: (value) => !value || (Array.isArray(value) || typeof value === 'string' ? value.length === 0 : Object.keys(value).length === 0),
    isEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b), isFunction: (value) => typeof value === 'function', isNaN: Number.isNaN,
    isNumber: (value) => typeof value === 'number', isString: (value) => typeof value === 'string', isUndefined: (value) => value === undefined,
    keys: (value) => Object.keys(value || {}), last: (items, count) => count === undefined ? (items || [])[(items || []).length - 1] : (items || []).slice(-count),
    map: (items, fn) => Array.isArray(items) ? items.map(fn) : Object.keys(items || {}).map((key) => fn(items[key], key)), noop: () => {}, now: () => Date.now(),
    pluck: (items, key) => (items || []).map((item) => item[key]), range: (start, stop, step = 1) => { if (stop === undefined) { stop = start; start = 0; } const values = []; for (let i = start; step > 0 ? i < stop : i > stop; i += step) values.push(i); return values; },
    reduce(items, fn, ...initial) { return initial.length ? (items || []).reduce(fn, initial[0]) : (items || []).reduce(fn); }, reject: (items, fn) => (items || []).filter((item) => !fn(item)),
    rest: (items, count = 1) => (items || []).slice(count), sample: (items) => (items || [])[0], sortBy: (items, fn) => [...(items || [])].sort((a, b) => String(typeof fn === 'function' ? fn(a) : a[fn]).localeCompare(String(typeof fn === 'function' ? fn(b) : b[fn]))),
    times: (count, fn) => Array.from({ length: count }, (_, index) => fn(index)), union: (...items) => [...new Set(flatten(items))], without: (items, ...values) => (items || []).filter((item) => !values.includes(item))
  };
  api.forEach = api.each; api.include = api.contains; api.collect = api.map; api.foldl = api.reduce;
  return api;
}

class Roll20Runtime {
  constructor({ beaconValues, campaign = {}, objects = [], randomValues = [1], startTime = 1700000000000 } = {}) {
    this.eventBus = new EventBus();
    this.chat = new ChatCapture();
    this.beacon = new BeaconSheetMock(beaconValues);
    this.store = new ObjectStore(this.eventBus);
    this.logs = [];
    this.effects = [];
    this.exceptions = [];
    this.publicGlobals = new Set();
    this.time = startTime;
    this.randomValues = [...randomValues];
    this.timerId = 1;
    this.timers = new Map();
    objects.forEach(({ type, properties }) => this.store.add(type, properties));
    const campaignData = { turnorder: '[]', initiativepage: false, playerpageid: '', _token_markers: '[]', token_markers: '[{"name":"Test Marker","tag":"test-marker","url":"https://example.invalid/marker.png"}]', playerspecificpages: false, ...campaign };
    this.campaign = this.store.wrap('campaign', campaignData);
    const sandbox = this.makeSandbox();
    this.context = vm.createContext(sandbox, { name: 'roll20-local-harness' });
  }

  makeSandbox() {
    const runtime = this;
    const deterministicDate = class extends Date { static now() { return runtime.time; } };
    return {
      console, JSON, Promise, RegExp, Error, TypeError, parseInt, parseFloat, isNaN, Number, String, Boolean, Object, Array, Set, Map,
      Date: deterministicDate, Math, encodeURIComponent, decodeURIComponent, escape, unescape,
      // Confirmed Roll20 subset: shared state, API_Meta, global config, event
      // registration, object lookup/storage, Campaign, chat, and Beacon calls.
      state: {}, API_Meta: {}, _: makeUnderscore(runtime), globalconfig: {},
      on: (event, handler) => runtime.eventBus.on(event, handler),
      log: (...args) => runtime.logs.push(args),
      getObj: (type, id) => runtime.store.getObj(type, id), findObjs: (query) => runtime.store.findObjs(query), createObj: (type, props) => runtime.store.createObj(type, props), filterObjs: (predicate) => runtime.store.filterObjs(predicate), getAllObjs: () => runtime.store.getAllObjs(),
      Campaign: () => runtime.campaign,
      sendChat: (...args) => runtime.chat.sendChat(...args),
      // Intentional simplifications: one deterministic GM identity and queued
      // random results. They do not model live permissions or randomness.
      playerIsGM: (playerId) => playerId === 'GM',
      randomInteger: (max) => Math.max(1, Math.min(max, runtime.randomValues.length ? runtime.randomValues.shift() : 1)),
      getSheetItem: (...args) => runtime.beacon.getSheetItem(...args), setSheetItem: (...args) => runtime.beacon.setSheetItem(...args),
      // Intentional simplification: timeout and interval both schedule one
      // controlled callback; repeating interval cadence is live-only here.
      setTimeout: (fn, delay = 0, ...args) => runtime.setTimeout(fn, delay, ...args), clearTimeout: (id) => runtime.timers.delete(id),
      setInterval: (fn, delay = 0, ...args) => runtime.setTimeout(fn, delay, ...args), clearInterval: (id) => runtime.timers.delete(id),
      // Unsupported platform behavior, recorded only: ping/layer ordering, FX,
      // playback/visual rendering, and asynchronous default-token processing.
      sendPing: (...args) => runtime.effects.push({ type: 'sendPing', args }), toFront: (...args) => runtime.effects.push({ type: 'toFront', args }), toBack: (...args) => runtime.effects.push({ type: 'toBack', args }),
      spawnFx: (...args) => runtime.effects.push({ type: 'spawnFx', args }), spawnFxBetweenPoints: (...args) => runtime.effects.push({ type: 'spawnFxBetweenPoints', args }), spawnFxWithDefinition: (...args) => runtime.effects.push({ type: 'spawnFxWithDefinition', args }),
      setDefaultTokenForCharacter: (...args) => runtime.effects.push({ type: 'setDefaultTokenForCharacter', args })
    };
  }

  setTimeout(fn, delay, ...args) { const id = this.timerId++; this.timers.set(id, { id, fn, at: this.time + Number(delay || 0), args, source: this.eventBus.activeSource || this.eventBus.registrationSource }); return id; }
  async flushTimers(through = Infinity) { while (this.timers.size) { const next = [...this.timers.values()].sort((a, b) => a.at - b.at || a.id - b.id)[0]; if (next.at > through) break; this.timers.delete(next.id); this.time = next.at; const previousSource = this.eventBus.activeSource; this.eventBus.activeSource = next.source; try { await next.fn(...next.args); for (let i = 0; i < 6; i += 1) await Promise.resolve(); } catch (error) { this.exceptions.push(error); throw error; } finally { this.eventBus.activeSource = previousSource; } } }
  async advanceBy(milliseconds) { await this.flushTimers(this.time + milliseconds); this.time += milliseconds; }
  async emit(event, ...args) { await this.eventBus.emit(event, ...args); }
  async ready() { await this.flushTimers(this.time); await this.emit('ready'); await Promise.resolve(); await this.flushTimers(this.time); await Promise.resolve(); }
  global(name) {
    const probe = this.probeGlobal(name);
    return probe.exists ? probe.value : undefined;
  }
  probeGlobal(name) {
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) return { exists: false };
    return vm.runInContext(`(() => { try { return { exists: true, value: ${name} }; } catch (error) { if (error && error.name === 'ReferenceError') return { exists: false }; throw error; } })()`, this.context);
  }
}

module.exports = { Roll20Runtime };
