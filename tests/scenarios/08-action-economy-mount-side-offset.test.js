'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

// Evidence: ActionEconomyV2.9.0.js resolves `!ae mount` options before it
// delegates the combined-mount state, movement, validation, and restoration
// work to the existing mountCreature path.
const riderSides = [1, 2, 3, 4]
  .map((side) => 'https%3A%2F%2Fs3.amazonaws.com%2Ffiles.d20.io%2Fimages%2F' + side + '%2Fthumb.png%3F' + side)
  .join('|');
const riderImages = [1, 2, 3, 4]
  .map((side) => 'https://s3.amazonaws.com/files.d20.io/images/' + side + '/thumb.png?' + side);

function mountSetup(runtime, mountCurrentSide) {
  const rider = runtime.store.getObj('graphic', 'token-rider');
  const mount = runtime.store.getObj('graphic', 'token-mount');
  runtime.campaign.set('turnorder', '[]');
  rider.set({
    currentSide: 0,
    sides: riderSides,
    imgsrc: riderImages[0],
    width: 70,
    height: 70,
    rotation: 15,
    layer: 'objects',
    left: 700,
    top: 350,
    bar3_value: 30,
    bar3_max: 30
  });
  mount.set({
    currentSide: mountCurrentSide,
    left: 630,
    top: 420,
    width: 140,
    height: 140,
    rotation: 45,
    layer: 'objects'
  });
  runtime.store.mutations.length = 0;
  runtime.chat.messages.length = 0;
  return { rider, mount };
}

async function mount(runtime, content) {
  await runtime.emit('chat:message', {
    type: 'api',
    playerid: 'GM',
    who: 'Test GM',
    content,
    selected: [{ _id: 'token-rider' }]
  });
}

function combinedRecord(runtime) {
  return runtime.context.state.ActionEconomyV2.mounts['token-rider'];
}

function makeRiderActiveInCombat(runtime, rider) {
  runtime.campaign.set('turnorder', JSON.stringify([{ id: rider.id, pr: 20 }]));
}

function assertNoMountMutation(runtime, rider, mountToken, riderBefore, mountBefore) {
  const ae = runtime.context.state.ActionEconomyV2;
  assert.equal(ae.mounts[rider.id], undefined);
  assert.equal(ae.effects[rider.id] && ae.effects[rider.id].mounted, undefined);
  assert.equal(rider.get('bar3_value'), riderBefore.bar3_value);
  assert.equal(rider.get('bar3_max'), riderBefore.bar3_max);
  assert.deepEqual(rider.toJSON(), riderBefore);
  assert.deepEqual(mountToken.toJSON(), mountBefore);
}

test('combined mounting derives positive, negative, and zero rider-side offsets from the mount current side', async () => {
  const cases = [
    { mountCurrentSide: 1, offset: '+1', expectedSide: 3 },
    { mountCurrentSide: 2, offset: '-1', expectedSide: 2 },
    { mountCurrentSide: 3, offset: '0', expectedSide: 4 }
  ];

  for (const scenario of cases) {
    const { runtime } = await startedRuntime({ fixtures: true });
    const { rider, mount: mountToken } = mountSetup(runtime, scenario.mountCurrentSide);
    await mount(runtime, '!ae mount token-mount --side-offset ' + scenario.offset);

    const record = combinedRecord(runtime);
    assert.equal(record.combined, true);
    assert.equal(record.mountId, mountToken.id);
    assert.equal(record.mountedSide, scenario.expectedSide);
    assert.equal(rider.get('currentSide'), scenario.expectedSide - 1);
    assert.equal(rider.get('imgsrc'), riderImages[scenario.expectedSide - 1]);
    assert.equal(rider.get('left'), mountToken.get('left'));
    assert.equal(rider.get('top'), mountToken.get('top'));
    assert.equal(mountToken.get('layer'), 'gmlayer');
  }
});

test('explicit --side takes precedence over an offset, including a bare --side validation failure', async () => {
  const explicit = await startedRuntime({ fixtures: true });
  const explicitSetup = mountSetup(explicit.runtime, 3);
  await mount(explicit.runtime, '!ae mount token-mount --side-offset -2 --side 2');
  assert.equal(combinedRecord(explicit.runtime).mountedSide, 2);
  assert.equal(explicitSetup.rider.get('currentSide'), 1);

  const bare = await startedRuntime({ fixtures: true });
  const bareSetup = mountSetup(bare.runtime, 3);
  const riderBefore = bareSetup.rider.toJSON();
  const mountBefore = bareSetup.mount.toJSON();
  await mount(bare.runtime, '!ae mount token-mount --side --side-offset -2');
  assertNoMountMutation(bare.runtime, bareSetup.rider, bareSetup.mount, riderBefore, mountBefore);
  assert.match(bare.runtime.chat.messages.at(-1).content, /does not have a valid mounted side --side-offset\./);

  const terminalBare = await startedRuntime({ fixtures: true });
  const terminalBareSetup = mountSetup(terminalBare.runtime, 3);
  const terminalBareRiderBefore = terminalBareSetup.rider.toJSON();
  const terminalBareMountBefore = terminalBareSetup.mount.toJSON();
  await mount(terminalBare.runtime, '!ae mount token-mount --side');
  assertNoMountMutation(terminalBare.runtime, terminalBareSetup.rider, terminalBareSetup.mount, terminalBareRiderBefore, terminalBareMountBefore);
  assert.match(terminalBare.runtime.chat.messages.at(-1).content, /does not have a valid mounted side \./);

  const invalid = await startedRuntime({ fixtures: true });
  const invalidSetup = mountSetup(invalid.runtime, 3);
  const invalidRiderBefore = invalidSetup.rider.toJSON();
  const invalidMountBefore = invalidSetup.mount.toJSON();
  await mount(invalid.runtime, '!ae mount token-mount --side not-a-side --side-offset -2');
  assertNoMountMutation(invalid.runtime, invalidSetup.rider, invalidSetup.mount, invalidRiderBefore, invalidMountBefore);
  assert.match(invalid.runtime.chat.messages.at(-1).content, /does not have a valid mounted side not-a-side\./);

  const invalidAfterOffset = await startedRuntime({ fixtures: true });
  const invalidAfterOffsetSetup = mountSetup(invalidAfterOffset.runtime, 3);
  const invalidAfterOffsetRiderBefore = invalidAfterOffsetSetup.rider.toJSON();
  const invalidAfterOffsetMountBefore = invalidAfterOffsetSetup.mount.toJSON();
  await mount(invalidAfterOffset.runtime, '!ae mount token-mount --side-offset -2 --side not-a-side');
  assertNoMountMutation(invalidAfterOffset.runtime, invalidAfterOffsetSetup.rider, invalidAfterOffsetSetup.mount, invalidAfterOffsetRiderBefore, invalidAfterOffsetMountBefore);
  assert.match(invalidAfterOffset.runtime.chat.messages.at(-1).content, /does not have a valid mounted side not-a-side\./);
});

test('missing, decimal, malformed, and option-token offsets warn the GM without mount mutation', async () => {
  const invalidCommands = [
    '!ae mount token-mount --side-offset',
    '!ae mount token-mount --side-offset 1.5',
    '!ae mount token-mount --side-offset side-two',
    '!ae mount token-mount --side-offset --another-option',
    '!ae mount token-mount --side-offset 9007199254740992',
    '!ae mount token-mount --side-offset 999999999999999999999999999999999999999999999999999999999999999999999999'
  ];

  for (const content of invalidCommands) {
    const { runtime } = await startedRuntime({ fixtures: true });
    const { rider, mount: mountToken } = mountSetup(runtime, 1);
    const riderBefore = rider.toJSON();
    const mountBefore = mountToken.toJSON();
    makeRiderActiveInCombat(runtime, rider);
    await mount(runtime, content);

    assertNoMountMutation(runtime, rider, mountToken, riderBefore, mountBefore);
    assert.match(runtime.chat.messages.at(-1).content, /Invalid mount side offset\. Use --side-offset N with a signed whole number\./);
  }
});

test('out-of-range offset results use the existing combined-side warning before movement or presentation changes', async () => {
  const cases = [
    { mountCurrentSide: 3, offset: '+1', expectedSide: 5 },
    { mountCurrentSide: 0, offset: '-1', expectedSide: 0 }
  ];

  for (const scenario of cases) {
    const { runtime } = await startedRuntime({ fixtures: true });
    const { rider, mount: mountToken } = mountSetup(runtime, scenario.mountCurrentSide);
    const riderBefore = rider.toJSON();
    const mountBefore = mountToken.toJSON();
    makeRiderActiveInCombat(runtime, rider);
    await mount(runtime, '!ae mount token-mount --side-offset ' + scenario.offset);

    assertNoMountMutation(runtime, rider, mountToken, riderBefore, mountBefore);
    assert.match(runtime.chat.messages.at(-1).content, new RegExp('does not have a valid mounted side ' + scenario.expectedSide + '\\.'));
  }
});

test('mounting without either side option retains the legacy non-combined relationship', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const { rider, mount: mountToken } = mountSetup(runtime, 2);
  const riderBefore = rider.toJSON();
  const mountBefore = mountToken.toJSON();
  await mount(runtime, '!ae mount token-mount');

  assert.equal(combinedRecord(runtime), mountToken.id);
  assert.equal(rider.get('currentSide'), riderBefore.currentSide);
  assert.equal(rider.get('imgsrc'), riderBefore.imgsrc);
  assert.equal(rider.get('left'), riderBefore.left);
  assert.equal(rider.get('top'), riderBefore.top);
  assert.equal(mountToken.get('layer'), mountBefore.layer);
});

test('combined dismount restores the original rider presentation and cleans up the mount relationship', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const { rider, mount: mountToken } = mountSetup(runtime, 1);
  await mount(runtime, '!ae mount token-mount --side-offset +1');
  rider.set({ left: 700, top: 490, rotation: 90 });
  runtime.store.mutations.length = 0;
  await mount(runtime, '!ae dismount');

  assert.equal(combinedRecord(runtime), undefined);
  assert.equal(runtime.context.state.ActionEconomyV2.effects[rider.id].mounted, undefined);
  assert.equal(rider.get('currentSide'), 0);
  assert.equal(rider.get('imgsrc'), riderImages[0]);
  assert.equal(rider.get('width'), 70);
  assert.equal(rider.get('height'), 70);
  assert.equal(rider.get('rotation'), 15);
  assert.equal(rider.get('layer'), 'objects');
  assert.equal(mountToken.get('left'), 700);
  assert.equal(mountToken.get('top'), 490);
  assert.equal(mountToken.get('rotation'), 90);
  assert.equal(mountToken.get('layer'), 'objects');
});
