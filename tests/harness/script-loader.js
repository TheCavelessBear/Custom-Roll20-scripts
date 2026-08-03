'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function rootScriptInventory(repositoryRoot) {
  return fs.readdirSync(path.join(repositoryRoot, 'Scripts'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => entry.name)
    .sort();
}

function assertManifestInventory(manifest, repositoryRoot) {
  const actual = rootScriptInventory(repositoryRoot);
  const expected = manifest.scripts.map((entry) => entry.file).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    const missing = actual.filter((file) => !expected.includes(file));
    const stale = expected.filter((file) => !actual.includes(file));
    throw new Error(`Active script manifest mismatch; unlisted root files: ${missing.join(', ') || '(none)'}; missing root files: ${stale.join(', ') || '(none)'}`);
  }
}

function snapshotGlobals(context) {
  return new Map(Object.getOwnPropertyNames(context).map((name) => [name, context[name]]));
}

function assertExposureTransition(entry, before, after) {
  const owned = new Set(entry.ownedGlobals || []);
  const allowedOverwrites = new Set(entry.allowedOverwrites || []);
  const additions = [...after.keys()].filter((name) => !before.has(name));
  const overwrites = [...after.keys()].filter((name) => before.has(name) && after.get(name) !== before.get(name));
  const unknownAdditions = additions.filter((name) => !owned.has(name));
  const unknownOverwrites = overwrites.filter((name) => !allowedOverwrites.has(name));
  if (unknownAdditions.length || unknownOverwrites.length) {
    throw new Error(`${entry.file} global contract violation; unexpected additions: ${unknownAdditions.join(', ') || '(none)'}; unexpected overwrites: ${unknownOverwrites.join(', ') || '(none)'}`);
  }
  return { additions, overwrites };
}

function snapshotOwnedBindings(runtime, entry) {
  return new Map((entry.ownedGlobals || []).map((name) => [name, runtime.probeGlobal(name)]));
}

function assertOwnedBindings(entry, before, after, phase = 'load') {
  const allowedPreexisting = new Set(entry.allowedOverwrites || []);
  for (const name of entry.ownedGlobals || []) {
    if ((entry.bindingPhases && entry.bindingPhases[name] || 'load') !== phase) continue;
    const previous = before.get(name) || { exists: false };
    const current = after.get(name) || { exists: false };
    if (!current.exists) throw new Error(`${entry.file} claims ${name} but did not expose that binding`);
    if (previous.exists && !allowedPreexisting.has(name)) throw new Error(`${entry.file} claims ${name}, but it was already defined by an earlier script`);
    if (previous.exists && allowedPreexisting.has(name) && previous.value === current.value) throw new Error(`${entry.file} allows overwrite of ${name}, but did not replace the binding`);
  }
}

function snapshotReadyBindings(runtime, manifest) {
  const snapshot = new Map();
  for (const entry of manifest.scripts) {
    for (const name of entry.ownedGlobals || []) {
      if (entry.bindingPhases && entry.bindingPhases[name] === 'ready') snapshot.set(`${entry.file}:${name}`, runtime.probeGlobal(name));
    }
  }
  return snapshot;
}

function assertReadyOwnedBindings(runtime, manifest, beforeReady) {
  for (const entry of manifest.scripts) {
    const names = (entry.ownedGlobals || []).filter((name) => entry.bindingPhases && entry.bindingPhases[name] === 'ready');
    if (!names.length) continue;
    const before = new Map(names.map((name) => [name, beforeReady.get(`${entry.file}:${name}`)]));
    const after = new Map(names.map((name) => [name, runtime.probeGlobal(name)]));
    assertOwnedBindings(entry, before, after, 'ready');
  }
}

function loadActiveScripts(runtime, manifest, repositoryRoot) {
  assertManifestInventory(manifest, repositoryRoot);
  const outcomes = [];
  for (const entry of manifest.scripts) {
    const file = path.join(repositoryRoot, 'Scripts', entry.file);
    const before = snapshotGlobals(runtime.context);
    const beforeBindings = snapshotOwnedBindings(runtime, entry);
    runtime.eventBus.setRegistrationSource(entry.file);
    try {
      vm.runInContext(fs.readFileSync(file, 'utf8'), runtime.context, { filename: file, displayErrors: true });
      const transition = assertExposureTransition(entry, before, snapshotGlobals(runtime.context));
      assertOwnedBindings(entry, beforeBindings, snapshotOwnedBindings(runtime, entry));
      outcomes.push({ file: entry.file, globalsAdded: transition.additions, globalsOverwritten: transition.overwrites });
    } catch (error) {
      runtime.exceptions.push(error);
      throw new Error(`Startup failure in ${entry.file}: ${error.message}`, { cause: error });
    }
  }
  runtime.eventBus.setRegistrationSource('(harness)');
  return outcomes;
}

async function assertPublicApis(runtime, manifest) {
  for (const contract of manifest.publicApis) {
    const published = runtime.global(contract.global);
    if (typeof published !== contract.type) throw new Error(`Public API ${contract.global} expected ${contract.type}, got ${typeof published}`);
    const object = contract.resolve ? await published : published;
    runtime.publicGlobals.add(contract.global);
    for (const [member, expectedType] of Object.entries(contract.members || {})) {
      const actualType = typeof object[member];
      if (actualType !== expectedType) throw new Error(`Public API ${contract.global}.${member} expected ${expectedType}, got ${actualType}`);
    }
  }
}

function assertHandlerContracts(runtime, manifest) {
  const actual = Object.fromEntries(manifest.scripts.map(({ file }) => [file, {}]));
  for (const registration of runtime.eventBus.registrations) {
    if (!actual[registration.source]) throw new Error(`Handler registered by unknown source ${registration.source}: ${registration.event}`);
    actual[registration.source][registration.event] = (actual[registration.source][registration.event] || 0) + 1;
  }
  for (const entry of manifest.scripts) {
    const expected = manifest.handlerContracts[entry.file] || {};
    const observed = actual[entry.file];
    if (JSON.stringify(Object.entries(observed).sort()) !== JSON.stringify(Object.entries(expected).sort())) {
      throw new Error(`${entry.file} handler contract mismatch; expected ${JSON.stringify(expected)}, observed ${JSON.stringify(observed)}`);
    }
  }
}

async function startedRuntime({ fixtures = false } = {}) {
  const { Roll20Runtime } = require('./roll20-runtime');
  const manifest = require('../fixtures/active-script-manifest');
  const { characters, beaconValues } = require('../fixtures/characters');
  const { tokens } = require('../fixtures/tokens');
  const { campaign, startupObjects } = require('../fixtures/campaign-state');
  const repositoryRoot = path.resolve(__dirname, '..', '..');
  const objects = fixtures ? [...startupObjects, ...characters, ...tokens] : [...startupObjects];
  const runtime = new Roll20Runtime({ campaign, objects, beaconValues: fixtures ? beaconValues : {} });
  const outcomes = loadActiveScripts(runtime, manifest, repositoryRoot);
  await Promise.resolve();
  const beforeReady = snapshotReadyBindings(runtime, manifest);
  for (const [key, probe] of beforeReady) if (probe.exists) throw new Error(`${key} was exposed before its owner ready phase`);
  await runtime.ready();
  assertReadyOwnedBindings(runtime, manifest, beforeReady);
  await assertPublicApis(runtime, manifest);
  assertHandlerContracts(runtime, manifest);
  return { runtime, outcomes };
}

module.exports = { loadActiveScripts, assertPublicApis, assertHandlerContracts, assertManifestInventory, assertExposureTransition, assertOwnedBindings, startedRuntime };
