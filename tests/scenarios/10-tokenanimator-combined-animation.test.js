'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const { Roll20Runtime } = require('../harness/roll20-runtime');
const { campaign, startupObjects } = require('../fixtures/campaign-state');

function token(id, properties = {}) {
  return {
    type: 'graphic',
    properties: {
      id,
      subtype: 'token',
      _pageid: 'page-test',
      pageid: 'page-test',
      layer: 'objects',
      left: 350,
      top: 350,
      width: 70,
      height: 70,
      rotation: 0,
      ...properties
    }
  };
}

async function startedTokenAnimator(tokens) {
  const runtime = new Roll20Runtime({
    campaign,
    objects: [...startupObjects, ...tokens]
  });
  const script = path.resolve(__dirname, '..', '..', 'Scripts', 'TokenAnimator1.5.js');

  vm.runInContext(fs.readFileSync(script, 'utf8'), runtime.context, { filename: script });
  await runtime.ready();
  return runtime;
}

test('TokenAnimator combines scale, rotation, page-scaled movement, and opacity in one frame update', async () => {
  const runtime = await startedTokenAnimator([token('animated')]);
  const api = runtime.global('TokenAnimator');
  const graphic = runtime.store.getObj('graphic', 'animated');
  const result = api.animate('animated', {
    scale: 2,
    degrees: 90,
    direction: 90,
    distance: 10,
    opacity: 0.6,
    duration: 100,
    easing: 'linear'
  });

  assert.equal(result.ok, true);
  assert.equal(result.targetLeft, 490);
  assert.equal(result.targetTop, 350);
  await runtime.advanceBy(50);
  assert.deepEqual(
    runtime.store.mutations.at(-1).changes,
    { width: 105, height: 105, rotation: 45, left: 420, top: 350, baseOpacity: 0.8 }
  );
  await runtime.advanceBy(50);
  assert.deepEqual(
    {
      width: graphic.get('width'),
      height: graphic.get('height'),
      rotation: graphic.get('rotation'),
      left: graphic.get('left'),
      top: graphic.get('top'),
      baseOpacity: graphic.get('baseOpacity')
    },
    { width: 140, height: 140, rotation: 90, left: 490, top: 350, baseOpacity: 0.6 }
  );
});

test('TokenAnimator rejects invalid combined requests without changing an active animation or baseline', async () => {
  const runtime = await startedTokenAnimator([token('atomic')]);
  const api = runtime.global('TokenAnimator');
  const graphic = runtime.store.getObj('graphic', 'atomic');
  const started = api.animate('atomic', { scale: 2, duration: 100, easing: 'linear' });
  const baseline = { ...runtime.context.state.TokenAnimator.tokens.atomic };
  const timersBefore = runtime.timers.size;
  const mutationsBefore = runtime.store.mutations.length;
  const incompleteMovement = api.animate('atomic', { scale: 1.5, direction: 'north', duration: 100 });
  const invalidAlias = api.animate('atomic', {
    scale: 1.5,
    degrees: 90,
    rotation: 'not-a-number',
    duration: 100
  });
  const conflictingAliases = api.animate('atomic', {
    scale: 1.5,
    degrees: 90,
    rotation: 45,
    duration: 100
  });

  assert.equal(started.ok, true);
  assert.equal(incompleteMovement.ok, false);
  assert.match(incompleteMovement.error, /Movement requires both direction and distance/);
  assert.equal(invalidAlias.ok, false);
  assert.match(invalidAlias.error, /Degrees must be a number/);
  assert.equal(conflictingAliases.ok, false);
  assert.match(conflictingAliases.error, /Degrees and rotation must match/);
  assert.equal(runtime.context.state.TokenAnimator.tokens.atomic.width, baseline.width);
  assert.equal(runtime.context.state.TokenAnimator.tokens.atomic.height, baseline.height);
  assert.equal(runtime.timers.size, timersBefore);
  assert.equal(runtime.store.mutations.length, mutationsBefore);
  await runtime.advanceBy(100);
  assert.equal(graphic.get('width'), 140);
  assert.equal(graphic.get('height'), 140);
});

test('TokenAnimator cancellation stops the shared combined animation', async () => {
  const runtime = await startedTokenAnimator([token('cancelled')]);
  const api = runtime.global('TokenAnimator');
  const graphic = runtime.store.getObj('graphic', 'cancelled');

  assert.equal(api.animate('cancelled', {
    degrees: 180,
    direction: 'right',
    distance: 10,
    duration: 100,
    easing: 'linear'
  }).ok, true);
  await runtime.advanceBy(50);
  const stoppedAt = {
    rotation: graphic.get('rotation'),
    left: graphic.get('left'),
    top: graphic.get('top')
  };

  const cancelled = api.cancel('cancelled');
  assert.equal(cancelled.ok, true);
  assert.equal(cancelled.tokenId, 'cancelled');
  assert.equal(cancelled.cancelled, true);
  await runtime.advanceBy(100);
  assert.deepEqual(
    { rotation: graphic.get('rotation'), left: graphic.get('left'), top: graphic.get('top') },
    stoppedAt
  );
  assert.equal(api.cancel('cancelled').cancelled, false);
});

test('TokenAnimator preserves the requested missing token ID in public API failures', async () => {
  const runtime = await startedTokenAnimator([]);
  const result = runtime.global('TokenAnimator').animate('missing-token', { scale: 2 });

  assert.equal(result.ok, false);
  assert.equal(result.tokenId, 'missing-token');
  assert.equal(result.error, 'Token not found.');
});

test('TokenAnimator completes duration-zero combined animations and retains dedicated command compatibility', async () => {
  const runtime = await startedTokenAnimator([
    token('complete'),
    token('delete'),
    token('nonopacity'),
    token('legacy')
  ]);
  const api = runtime.global('TokenAnimator');
  const complete = runtime.store.getObj('graphic', 'complete');
  const legacy = runtime.store.getObj('graphic', 'legacy');

  assert.equal(api.animate('complete', {
    scale: 0.5,
    opacity: 0,
    duration: 0,
    complete: 'gmlayer'
  }).ok, true);
  assert.deepEqual(
    {
      width: complete.get('width'),
      height: complete.get('height'),
      baseOpacity: complete.get('baseOpacity'),
      layer: complete.get('layer')
    },
    { width: 35, height: 35, baseOpacity: 0, layer: 'gmlayer' }
  );
  assert.equal(api.animate('delete', {
    opacity: 0,
    duration: 0,
    complete: 'delete'
  }).ok, true);
  assert.equal(runtime.store.getObj('graphic', 'delete'), undefined);
  const nonOpacity = api.animate('nonopacity', {
    degrees: 90,
    duration: 0,
    complete: 'gmlayer'
  });
  assert.equal(nonOpacity.ok, true);
  assert.equal(nonOpacity.completion, 'gmlayer');
  assert.equal(runtime.store.getObj('graphic', 'nonopacity').get('layer'), 'gmlayer');

  await runtime.emit('chat:message', {
    type: 'api',
    playerid: 'GM',
    content: '!tokensize grow --duration|0',
    selected: [{ _type: 'graphic', _id: 'legacy' }]
  });
  await runtime.emit('chat:message', {
    type: 'api',
    playerid: 'GM',
    content: '!tokenanimator move --degrees|90 --distance|10 --duration|0',
    selected: [{ _type: 'graphic', _id: 'legacy' }]
  });
  await runtime.emit('chat:message', {
    type: 'api',
    playerid: 'GM',
    content: '!tokenanimator rotate --rotation|-90 --duration|0',
    selected: [{ _type: 'graphic', _id: 'legacy' }]
  });

  assert.equal(legacy.get('width'), 140);
  assert.equal(legacy.get('left'), 490);
  assert.equal(legacy.get('rotation'), 270);
});
