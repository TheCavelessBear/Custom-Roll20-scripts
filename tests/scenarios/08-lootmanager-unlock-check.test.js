'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

const lootNotes = (dc = 15, extras = '') => [
  'LOOT', 'type: container', 'locked: yes', `lock-dc: ${dc}`,
  'closed-side: 1', 'open-side: 2', 'key: Brass Key', 'item: Test Gem', extras, 'END LOOT'
].filter(Boolean).join('\n');

function addContainer(runtime, id, notes = lootNotes(), sides = 'https%3A%2F%2Ffiles.d20.io%2Fimages%2F1%2Fthumb.png|https%3A%2F%2Ffiles.d20.io%2Fimages%2F2%2Fthumb.png') {
  return runtime.store.createObj('graphic', {
    id, subtype: 'token', _pageid: 'page-test', pageid: 'page-test', name: 'Locked Chest',
    gmnotes: notes, sides, currentSide: 0, imgsrc: 'https://files.d20.io/images/1/thumb.png', left: 350, top: 350, width: 70, height: 70
  });
}

function installDeterministicD20(runtime, total) {
  const original = runtime.context.sendChat;
  runtime.context.sendChat = (who, content, callback, options) => {
    if (content === '/w gm [[1d20]]' && typeof callback === 'function') {
      runtime.chat.messages.push({ who, content, callback, options });
      callback([{ content, inlinerolls: [{ results: { total } }] }]);
      return;
    }
    return original(who, content, callback, options);
  };
}

const playerMessage = (content) => ({ type: 'api', playerid: 'player-pc', who: 'Player PC', content });
const cardContents = (runtime) => runtime.chat.messages.map((entry) => entry.content).join('\n');
const settle = async () => { for (let index = 0; index < 20; index += 1) await Promise.resolve(); };

// Evidence: LootManager1.4.js generates !loot unlock-check LOOTER CONTAINER,
// parses the same two positional IDs, awaits `sleight_of_hand_bonus`, and
// rewrites only its locked record before applying the configured open side.
test('LootManager locked-card buttons route distinct unlock and key paths for a non-GM looter', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const container = addContainer(runtime, 'container-success');
  await runtime.beacon.setSheetItem('char-pc', 'sleight_of_hand_bonus', 5);
  installDeterministicD20(runtime, 10);

  const inspect = '!loot token-pc container-success';
  await runtime.emit('chat:message', playerMessage(inspect));
  const lockedCard = cardContents(runtime);
  const unlockCommand = '!loot unlock-check token-pc container-success';
  assert.match(lockedCard, new RegExp('Perform Sleight of Hand Check\\]\\(' + unlockCommand + '\\)'));
  assert.doesNotMatch(lockedCard, /!loot use-key/);

  await runtime.emit('chat:message', playerMessage(unlockCommand));
  await settle();
  assert.ok(runtime.eventBus.dispatches.some((entry) => entry.event === 'chat:message' && entry.args[0].content === unlockCommand));
  assert.ok(runtime.beacon.reads.some((read) => read.characterId === 'char-pc' && read.name === 'sleight_of_hand_bonus'));
  assert.match(container.get('gmnotes'), /locked:\s*no/i);
  assert.match(container.get('gmnotes'), /item:\s*Test Gem/i);
  assert.equal(container.get('currentSide'), 1);
  assert.match(cardContents(runtime), /Sleight of Hand Check.*Success/s);

  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: '!loot keys grant --character|char-pc --key|Brass%20Key' });
  await settle();
  container.set('gmnotes', lootNotes());
  await runtime.emit('chat:message', playerMessage(inspect));
  const keyedCard = cardContents(runtime);
  assert.match(keyedCard, /!loot unlock-check token-pc container-success/);
  assert.match(keyedCard, /!loot use-key token-pc container-success --key&#124;brass%20key/);
});

// Evidence: LootManager1.4.js leaves failed checks locked and generates a
// retry button; its guarded failures send a visible Loot Error card.
test('LootManager unlock checks retain lock on failure and report supported error paths', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const failed = addContainer(runtime, 'container-fail', lootNotes(20));
  await runtime.beacon.setSheetItem('char-pc', 'sleight_of_hand_bonus', 2);
  installDeterministicD20(runtime, 1);
  const failureCommand = '!loot unlock-check token-pc container-fail';
  await runtime.emit('chat:message', playerMessage(failureCommand));
  await settle();
  await runtime.emit('chat:message', playerMessage(failureCommand));
  await settle();
  assert.match(failed.get('gmnotes'), /locked:\s*yes/i);
  assert.equal(failed.get('currentSide'), 0);
  assert.match(cardContents(runtime), /Failure/);
  assert.match(cardContents(runtime), /Retry/);

  const noCharacter = runtime.store.getObj('graphic', 'token-npc');
  await runtime.emit('chat:message', playerMessage('!loot unlock-check token-npc container-fail'));
  await runtime.emit('chat:message', playerMessage('!loot unlock-check missing-token container-fail'));
  const invalidDc = addContainer(runtime, 'container-invalid-dc', lootNotes('not-a-number'));
  await runtime.emit('chat:message', playerMessage('!loot unlock-check token-pc container-invalid-dc'));
  await settle();
  assert.equal(noCharacter.get('represents'), '');
  assert.ok(invalidDc);
  assert.match(cardContents(runtime), /must represent a Beacon character|no longer exists/);
  assert.match(cardContents(runtime), /valid lock DC/);
});

test('LootManager reports GM-notes write and side-configuration failures without unlocking silently', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const writeFailure = addContainer(runtime, 'container-write-failure');
  await runtime.beacon.setSheetItem('char-pc', 'sleight_of_hand_bonus', 10);
  installDeterministicD20(runtime, 20);
  const originalSet = writeFailure.set.bind(writeFailure);
  writeFailure.set = (key, value) => {
    if (key === 'gmnotes') throw new Error('simulated GM Notes write failure');
    return originalSet(key, value);
  };
  await runtime.emit('chat:message', playerMessage('!loot unlock-check token-pc container-write-failure'));
  await settle();
  assert.match(writeFailure.get('gmnotes'), /locked:\s*yes/i);
  assert.match(cardContents(runtime), /unlocked state could not be saved/);
  assert.match(cardContents(runtime), /LootManager Warning/);

  const sideFailure = addContainer(runtime, 'container-side-failure', lootNotes(5), 'https%3A%2F%2Ffiles.d20.io%2Fimages%2Fonly%2Fthumb.png');
  await runtime.emit('chat:message', playerMessage('!loot unlock-check token-pc container-side-failure'));
  await settle();
  assert.match(sideFailure.get('gmnotes'), /locked:\s*no/i);
  assert.match(cardContents(runtime), /LootManager Warning/);
  assert.match(cardContents(runtime), /lock was opened, but the container image could not be changed/);
});
