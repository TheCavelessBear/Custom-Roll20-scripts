'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startedRuntime } = require('../harness/script-loader');

function ability(runtime, name) {
  return runtime.store.findObjs({ type: 'ability', characterid: 'char-pc', name })[0];
}

async function buildAttack(runtime, command) {
  await runtime.emit('chat:message', { type: 'api', playerid: 'GM', content: command });
}

// Evidence: TokenActionBuilder0.5.0 exposes the ability-modifier choice in its
// builder macro while retaining the pre-0.5.0 default for direct build calls.
test('TAB attack builder exposes ability choice and defaults missing or unknown values to enabled', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  await runtime.emit('chat:message', {
    type: 'api', playerid: 'GM', content: '!tab attack', selected: [{ _type: 'graphic', _id: 'token-pc' }]
  });
  const builder = ability(runtime, 'TAB-Build-Attack');
  assert.ok(builder);
  assert.match(builder.get('action'), /--atkability \?\{Add Attack Ability Modifier\?\|Yes,yes\|No,no\}/);

  await buildAttack(runtime, '!tab buildattack --token token-pc --name Default --ability dex --prof yes --atkbonus 0 --damage1 1d6 --mod1 no --dmgbonus 4 --second no --economy none --melee no --magic no --attackfx none --attacksound None --damagecombo no');
  assert.match(ability(runtime, 'Default').get('action'), /\[\[1d20 \+ @\{selected\|dexterity_mod\} \+ @\{selected\|pb\}\]\]/);

  await buildAttack(runtime, '!tab buildattack --token token-pc --name Unknown --ability wis --atkability unexpected --prof no --atkbonus 0 --damage1 1d6 --mod1 no --dmgbonus 0 --second no --economy none --melee no --magic no --attackfx none --attacksound None --damagecombo no');
  assert.match(ability(runtime, 'Unknown').get('action'), /\[\[1d20 \+ @\{selected\|wisdom_mod\}\]\]/);
});

// Evidence: the attack modifier, primary-damage modifier, and flat primary
// damage bonus are independent inputs in the generated action suite.
test('TAB can build numeric-only attacks while retaining flat non-doubled primary damage', async () => {
  const { runtime } = await startedRuntime({ fixtures: true });
  await buildAttack(runtime, '!tab buildattack --token token-pc --name Numeric --ability dex --atkability no --prof no --atkbonus 9 --damage1 1d6 --type1 Fire --mod1 no --dmgbonus 4 --second no --economy none --melee no --magic no --attackfx none --attacksound None --damagecombo no');

  const attack = ability(runtime, 'Numeric');
  const damage = ability(runtime, 'Numeric-Damage');
  const crit = ability(runtime, 'Numeric-Crit-Damage');
  assert.ok(attack);
  assert.ok(damage);
  assert.ok(crit);
  assert.equal((attack.get('action').match(/\[\[1d20 \+ 9\]\]/g) || []).length, 5);
  assert.doesNotMatch(attack.get('action'), /\[\[1d20 \+ @\{selected\|(dexterity_mod|pb)\}\]\]/);
  assert.match(damage.get('action'), /\{\{dmg1=\[\[1d6 \+ 4\]\]\}\}/);
  assert.match(crit.get('action'), /\{\{dmg1=\[\[2d6 \+ 4\]\]\}\}/);
  assert.doesNotMatch(crit.get('action'), /\[\[2d6 \+ 8\]\]/);

  await buildAttack(runtime, '!tab buildattack --token token-pc --name NoAbilityProf --ability dex --atkability no --prof yes --atkbonus 0 --damage1 1d6 --mod1 no --dmgbonus 0 --second no --economy none --melee no --magic no --attackfx none --attacksound None --damagecombo no');
  const noAbilityProf = ability(runtime, 'NoAbilityProf');
  assert.match(noAbilityProf.get('action'), /\[\[1d20 \+ @\{selected\|pb\}\]\]/);
  assert.doesNotMatch(noAbilityProf.get('action'), /@\{selected\|dexterity_mod\}/);
});
