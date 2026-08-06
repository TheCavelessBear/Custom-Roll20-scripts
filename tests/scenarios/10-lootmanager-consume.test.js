'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

const playerMessage = (content, selected) => ({
  type: 'api', playerid: 'player-pc', who: 'Player PC', content, selected
});
const settle = async () => { for (let index = 0; index < 20; index += 1) await Promise.resolve(); };
const cardContents = (runtime) => runtime.chat.messages.map((entry) => entry.content).join('\n');

function addLoot(runtime, id, notes, name = 'Loot Source') {
  return runtime.store.createObj('graphic', {
    id, subtype: 'token', _pageid: 'page-test', pageid: 'page-test', name,
    gmnotes: notes, represents: '', left: 350, top: 350, width: 70, height: 70
  });
}

// Evidence: LootManager1.4.js normalizes consume names with normalizeKeyName,
// aggregates matching ordinary items, and decrements matching records in their
// existing source order through setItemQuantity.
test('LootManager consume defaults to one and aggregates normalized duplicate ordinary items in source order', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const source = addLoot(runtime, 'consume-duplicates', [
    'Notes before LOOT must remain.', 'LOOT', 'item: Potion of Healing | 3',
    'item: potion   of   healing | 2', 'item: Greater Potion of Healing | 4',
    'END LOOT', 'Notes after LOOT must remain.'
  ].join('\n'));

  await runtime.emit('chat:message', playerMessage(
    '!loot consume --name|Potion%20of%20Healing', [{ _type: 'graphic', _id: source.id }]
  ));
  await settle();
  assert.match(source.get('gmnotes'), /item: Potion of Healing \| 2/);
  assert.match(source.get('gmnotes'), /item: potion   of   healing \| 2/);

  await runtime.emit('chat:message', playerMessage(
    '!loot consume --token|consume-duplicates --name|  POTION%20%20OF%20HEALING  --quantity|3'
  ));
  await settle();
  assert.doesNotMatch(source.get('gmnotes'), /item: Potion of Healing/i);
  assert.match(source.get('gmnotes'), /item: potion   of   healing/);
  assert.match(source.get('gmnotes'), /item: Greater Potion of Healing \| 4/);
  assert.match(source.get('gmnotes'), /Notes before LOOT must remain\./);
  assert.match(source.get('gmnotes'), /Notes after LOOT must remain\./);
  assert.match(cardContents(runtime), /Potion of Healing x3 consumed/);
});

// Evidence: LootManager1.4.js rejects non-exact, invalid, non-safe,
// nonpositive, and insufficient requests before calling setItemQuantity.
test('LootManager consume leaves loot atomic on exact-match and quantity failures', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const notes = ['LOOT', 'item: Potion | 2', 'item: Greater Potion | 5', 'END LOOT'].join('\n');
  const source = addLoot(runtime, 'consume-atomic', notes);
  const commands = [
    '!loot consume --token|consume-atomic --name|Potion%20of --quantity|1',
    '!loot consume --token|consume-atomic --name|Potion --quantity|0',
    '!loot consume --token|consume-atomic --name|Potion --quantity|9007199254740992',
    '!loot consume --token|consume-atomic --name|Potion --quantity|3',
    '!loot consume --token|consume-atomic --name|Missing Item --quantity|1'
  ];

  for (const command of commands) {
    await runtime.emit('chat:message', playerMessage(command));
    await settle();
    assert.equal(source.get('gmnotes'), notes);
  }
  assert.match(cardContents(runtime), /No loot was changed/);
});

// Evidence: LootManager1.4.js only selects parsed item records and blocks
// writes for locked containers or unresolved inline gp instead of inspecting.
test('LootManager consume preserves non-item records and refuses locked or unresolved sources without mutation', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const mixed = addLoot(runtime, 'consume-mixed', [
    'Outside note', 'LOOT', 'type: container', 'locked: no', 'key: Brass Key',
    'gp: 12', 'handout: Expedition Diary', 'key-item: Iron Gate Key',
    'item: Potion', 'unknown: preserve me', 'END LOOT', 'Other outside note'
  ].join('\n'));
  const lockedNotes = ['LOOT', 'type: container', 'locked: yes', 'item: Potion', 'END LOOT'].join('\n');
  const unresolvedNotes = ['LOOT', 'gp: [[1d6]]', 'item: Potion', 'END LOOT'].join('\n');
  const locked = addLoot(runtime, 'consume-locked', lockedNotes);
  const unresolved = addLoot(runtime, 'consume-unresolved', unresolvedNotes);

  await runtime.emit('chat:message', playerMessage('!loot consume --token|consume-mixed --name|Potion'));
  await settle();
  assert.doesNotMatch(mixed.get('gmnotes'), /item: Potion/);
  for (const line of ['Outside note', 'type: container', 'locked: no', 'key: Brass Key', 'gp: 12', 'handout: Expedition Diary', 'key-item: Iron Gate Key', 'unknown: preserve me', 'Other outside note']) {
    assert.match(mixed.get('gmnotes'), new RegExp(line));
  }

  await runtime.emit('chat:message', playerMessage('!loot consume --token|consume-locked --name|Potion'));
  await runtime.emit('chat:message', playerMessage('!loot consume --token|consume-unresolved --name|Potion'));
  await settle();
  assert.equal(locked.get('gmnotes'), lockedNotes);
  assert.equal(unresolved.get('gmnotes'), unresolvedNotes);
  assert.match(cardContents(runtime), /container is locked|Unresolved inline gp/);
});

// Evidence: LootManager1.4.js shares activeTakes with take and finalizes a
// successful consume through the existing deletion policy.
test('LootManager consume shares the take lock and honors deleteWhenEmpty', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  const source = addLoot(runtime, 'consume-lock', ['LOOT', 'item: Potion | 2', 'END LOOT'].join('\n'));
  const lootHandler = runtime.eventBus.handlers.get('chat:message').find((entry) => entry.source === 'LootManager1.4.js').handler;
  const originalSet = source.set.bind(source);
  let nested = false;
  source.set = (key, value) => {
    if (key === 'gmnotes' && !nested) {
      nested = true;
      lootHandler(playerMessage(
        '!loot take --token|consume-lock --type|item --index|0 --name|Potion --expected|2 --quantity|1'
      ));
    }
    return originalSet(key, value);
  };

  await runtime.emit('chat:message', playerMessage('!loot consume --token|consume-lock --name|Potion'));
  await settle();
  assert.match(source.get('gmnotes'), /item: Potion/);
  assert.match(cardContents(runtime), /Another take from this source is still processing/);

  runtime.context.state.LootManager.config.deleteWhenEmpty = true;
  const deleteSource = addLoot(runtime, 'consume-delete', ['LOOT', 'item: Last Potion', 'END LOOT'].join('\n'));
  await runtime.emit('chat:message', playerMessage('!loot consume --token|consume-delete --name|Last Potion'));
  await settle();
  assert.equal(runtime.store.getObj('graphic', deleteSource.id), undefined);
});
