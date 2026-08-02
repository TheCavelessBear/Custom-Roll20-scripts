# Roll20 Coding Change Log

Last updated: 2026-08-01

## Purpose

This file records the Roll20 Mod script, Beacon integration, automation, and macro work completed in this development conversation. It is intended to remain as the continuing project change log.

For future updates:

1. Update the Current Recommended Versions table when a new build supersedes an older build.
2. Add the newest dated entry at the top of Change History.
3. Record implemented changes separately from reviewed but deferred ideas.
4. State whether a StateWipe, re-registration, macro replacement, or recast of an active effect is required.
5. Preserve prior entries so the development path remains traceable.

## Current Recommended Versions

| Component | Current build | Replaces | Required companions |
| --- | --- | --- | --- |
| LootManager | `LootManager1.1.js` | `LootManager1.0.js` | Experimental Mod sandbox with Beacon `getSheetItem` and `setSheetItem`; optional Jukebox tracks named `grab` and `coins` |
| ActionEconomyV2 | `ActionEconomyV2.3.2.md` | All earlier AE builds in this log | `AoEBoom1.1.md` and `SaveEffects1.1.md` for corrected Wall of Fire recurring damage |
| TokenTriggers | `TokenTriggers1.3.1.md` | TokenTriggers 1.0.0 through 1.3 | `AttackDamageResolver1.1.md` for reliable ADR trigger processing; `SaveEffects1.1.md` for reliable SE trigger processing |
| AttackDamageResolver | `AttackDamageResolver1.1.md` | Original ADR source | `TokenTriggers1.3.1.md` when Bloodied, Relentless Endurance, or HP 0 triggers are used |
| SaveEffects | `SaveEffects1.1.md` | Original SaveEffects source | `TokenTriggers1.3.1.md` when TokenTriggers should react to SE damage |
| AoEBoom | `AoEBoom1.1.md` | Original AoEBoom source | `ActionEconomyV2.3.2.md` and `SaveEffects1.1.md` for corrected directional-hazard saves and damage |
| Token Action Builder | `Token Action Builder0.4.0.md` | Token Action Builder 0.3.1 | ADR and `!splay` for generated FX and sound commands |
| DoorSounds | `DoorSounds-Registry.md`, version 1.0.0 | Original fixed DoorSounds list | None |
| DoorControl | `DoorControl.md` | New utility | None |
| Persistent State Manager | `StateWipe.md` | New utility | None |
| Beacon attribute reference | `Roll20_2024_Sheet_Attributes_and_Modifiability(2).md` | Prior attribute notes | None |

## Installation and Compatibility Notes

- No build created in this conversation requires a StateWipe unless a future entry expressly says otherwise.
- Existing AE, TokenTriggers, ADR, SE, and AoEBoom state is normalized or preserved by the current builds.
- Active Wall of Fire hazards created before installing AE 2.3.2 and AoEBoom 1.1 must be recast. Existing hazard records do not contain the newly stored save configuration.
- Blood Frenzy requires AE 2.3 or later and TokenTriggers 1.2 or later.
- Blood Frenzy sound playback requires TokenTriggers 1.2.2 or later.
- Relentless Endurance requires TokenTriggers 1.3 or later.
- Reliable ADR damage-trigger integration requires ADR 1.1 and TokenTriggers 1.3.1.
- Reliable SaveEffects damage-trigger integration requires SaveEffects 1.1 and TokenTriggers 1.3.1.
- The current `StateWipe.md` predates TokenTriggers and DoorSounds Registry state. Its configured wipe list does not currently include `state.TokenTriggers` or `state.DoorSounds`.

# Change History

## 2026-08-01 - Locked containers and one-time rolled gold

### LootManager 1.1

File: `LootManager1.1.js`

Problem or goal:

- Extend the existing LootManager with locked/unlocked multi-sided containers and one-time inline-roll gold resolution without redesigning its current loot, card, pickup, sound, state, or Beacon systems.

Changes:

- Added the universal player command `!loot LOOTER_TOKEN_ID TARGET_TOKEN_ID`, supporting the macro `!loot @{selected|token_id} @{target|Loot|token_id}` while preserving all existing `!loot inspect`, generated take, configuration, help, and public API behavior.
- Added case-insensitive, trimmed `type`, `locked`, `lock-dc`, `closed-side`, and `open-side` fields stored only in the token's existing `LOOT` block.
- Locked inspection now selects the configured closed side when valid, hides every loot detail, performs no roll, leaves inline gold unresolved, and presents an embedded `Perform Sleight of Hand Check` button.
- Added `!loot unlock-check LOOTER_TOKEN_ID CONTAINER_TOKEN_ID`, using awaited Beacon `getSheetItem(characterId, "sleight_of_hand_bonus")` and Roll20's inline-roll engine for the natural d20.
- Failed checks retain `locked: yes`, keep the closed side, reveal and resolve no loot, store no attempt history, and provide a retry button.
- Successful checks change only the applicable lock field to `locked: no`, select the configured open side when valid, play the configured item/opening sound, resolve rolled gold, and immediately show the existing loot card.
- Added validated one-based side selection for any multi-sided token. Missing, invalid, out-of-range, non-multi-sided, or unusable side images warn the GM without blocking inspection or unlocking.
- Added `gp: [[expression]]` and `[[expression]] gp` parsing. Expressions resolve through Roll20's inline-roll engine only when loot is first revealed, are persisted as fixed `gp: total` lines before card display, and never reroll after successful persistence.
- Extended the existing GM Notes parser and writer with source-order records so lock changes, resolved gold, item quantities, comments, container fields, and unrelated GM Notes remain preserved through every write.
- Resolved gold continues through the single existing fixed-GP transfer path. The take announcement now includes both the amount taken and the receiving character's confirmed new GP total.
- Multiple fixed and inline GP lines retain the existing aggregate currency-card and take workflow; every unresolved line is resolved and persisted individually before display.

Preserved behavior:

- Loose-item deletion, linked body loot, item syntax and quantities, stale-button validation, pickup buttons, default-template cards, item and coin sounds, delete-when-empty configuration, transient transfer locks, public `LootManager.inspect(tokenId)`, and state configuration remain intact.
- Loot, lock state, rolled amounts, and failed attempts are not stored in Roll20 state or custom attributes.
- No legacy attribute lookup or Beacon inventory access was added.

Compatibility:

- Replace active `LootManager1.0.js` with `LootManager1.1.js`; the unchanged 1.0 build is archived at `Scripts/Prior Versions/LootManager1.0.js`.
- The universal player macro is `!loot @{selected|token_id} @{target|Loot|token_id}`.
- No StateWipe or data migration is required. Existing LOOT blocks, commands, generated buttons, and configuration remain compatible.
- Container opening reuses the existing configured item sound (`grab` by default); no new sound configuration or state field is required.

Validation performed:

- JavaScript syntax validation with the bundled Node.js runtime.
- Three mocked Roll20 runtime harnesses with 73 assertions covered unlocked and locked inspection, success and failure, retries, already-unlocked buttons, valid and invalid multi-sides, one-time canonical and alternate inline GP, atomic multiple-expression failure, multiple rolled GP lines, roll failure, GM Notes write verification failure, fixed and resolved GP transfer, new-total announcement, sounds, item quantities, stale buttons, loose-item deletion, delete-when-empty on/off, linked no-block bodies, the public API, and preservation inside and outside the LOOT block.
- Final read-only Roll20 reviewer pass completed after implementation.

Known limitations:

- Gold remains a non-negative safe whole-number aggregate; multiple GP lines do not become separately takeable slots.
- Items are announced and removed from the source but are not added to Beacon inventory.
- Container side changes require Roll20-compatible multi-sided token image URLs; invalid side configuration warns the GM and the loot action continues.

## 2026-08-01 - Token GM Notes loot management

### LootManager 1.0

File: `LootManager1.0.js`

Problem or goal:

- Add standalone player-facing loot inspection and collection without storing loot contents in Roll20 state or modifying Beacon inventory.

Changes:

- Reads structured `LOOT` through `END LOOT` blocks from linked creature tokens and unlinked containers.
- Supports `gp: amount`, `item: name`, and `item: name | quantity` entries.
- Preserves GM Notes outside the matched loot block verbatim and preserves unrecognized lines inside the block.
- Adds whispered inspect cards, item and currency take buttons, quantity reduction, take-all controls, and stale-button validation against current token GM Notes.
- Adds Beacon currency delivery through awaited `getSheetItem(characterId, "gp")` and `setSheetItem(characterId, "gp", value)` calls.
- Verifies Beacon gp writes with immediate and delayed readback before consuming source currency.
- Does not use legacy attributes and does not modify Beacon inventory.
- Treats an unlinked token without a loot block as one loose item named from the token and deletes it when taken; linked tokens without a block report no loot.
- Adds direct Jukebox playback with default item track `grab` and default currency track `coins`.
- Stores only persistent configuration in `state.LootManager`: delete-when-empty, item sound, and currency sound. Loot, claims, and quantities remain exclusively in token GM Notes.
- Adds GM configuration commands for sound names and delete-when-empty behavior.
- Uses temporary in-memory source-token and recipient-character processing locks so overlapping async currency clicks cannot both pass stale validation or overwrite the same Beacon gp balance; the locks store no loot and are not persisted.

Preserved behavior:

- No ActionEconomyV2, SaveEffects, AttackDamageResolver, HPManager, TokenTriggers, token-bar, or Beacon inventory behavior is changed.
- Loot access does not use ownership checks, player restrictions, claim IDs, or a transaction subsystem.

Compatibility:

- Requires the Experimental Mod sandbox Beacon helpers for gp transfer.
- Optional Jukebox tracks should be named `grab` and `coins`, or configured with `!loot config`.
- No StateWipe, migration, re-registration, macro replacement, or recast is required.

Validation performed:

- JavaScript syntax validation with Node.js.
- A mocked Roll20 runtime harness covered HTML-backed, percent-encoded, and URL-encoded HTML GM Notes; exact outside-block preservation; item quantity reduction; stale and overlapping-button rejection; verified Beacon gp transfer; loose-item deletion; linked no-block handling; configuration; and delete-when-empty behavior.
- Static review of command routing, GM Notes replacement boundaries, Beacon async calls, stale-button checks, linked/unlinked behavior, configuration persistence, sound routing, and token deletion paths.

Known limitations:

- Items are announced and removed from the loot source but are not added to Beacon inventory.
- GP and quantities must be non-negative whole numbers.
- Currency buttons require the player to select a token linked to the receiving Beacon character.
- Jukebox track names are exact and case-sensitive.

## 2026-07-20 - Wall of Fire recurring damage and SaveEffects trigger integration

### ActionEconomyV2 2.3.2

File: `ActionEconomyV2.3.2.md`

Changes:

- Removed the hardcoded recurring directional-hazard command using `dex 999`.
- Directional-hazard records now retain the configured save ability, DC, success result, source token, and Elemental Adept damage type.
- Recurring directional-hazard damage now calls `!se damagebatch` using the stored configuration.
- Wall of Fire entry and later-turn damage now use the same save ability and DC configuration as the initial application.
- Directional geometry, once-per-turn hit tracking, concentration cleanup, and damage formulas remain unchanged.

### AoEBoom 1.1

File: `AoEBoom1.1.md`

Changes:

- Directional-hazard registration now passes the template save ability, DC, success result, source token, and Elemental Adept type to AE.
- Spawn-line damage and damage-type overrides remain supported.
- Initial damage, geometry, template placement, visual tokens, Apply abilities, and concentration setup remain unchanged.

### SaveEffects 1.1

File: `SaveEffects1.1.md`

Changes:

- Added an optional TokenTriggers hook whenever SaveEffects applies damage to Bar 1.
- SE reports the calculated Bar 1 transition through:

```javascript
TokenTriggersAPI.processBar1Change(token, oldHp, newHp);
```

- SE uses the Bar 1 value resolved after TokenTriggers processing when synchronizing Beacon HP.
- This preserves Relentless Endurance setting Bar 1 to 1 instead of allowing SE to overwrite it with 0.
- Bloodied, Blood Frenzy, Relentless Endurance, and HP 0 presentation triggers now respond reliably to Wall of Fire and other SE damage.
- SE remains functional when TokenTriggers is not installed.

Installation note:

- Replace AE, AoEBoom, and SaveEffects together.
- Recast Wall of Fire after installation.
- No StateWipe is required.

## 2026-07-20 - ADR damage integration with TokenTriggers

### TokenTriggers 1.3.1

File: `TokenTriggers1.3.1.md`

Changes:

- Added the public integration method:

```javascript
TokenTriggersAPI.processBar1Change(token, oldHp, newHp);
```

- Refactored Bar 1 evaluation into a shared transition processor used by both native Roll20 Bar 1 events and external damage scripts.
- Preserved native processing for manual Bar 1 edits, HPManager, SaveEffects, and other scripts.
- Preserved idempotent trigger behavior when both the native event and direct hook occur.

### AttackDamageResolver 1.1

File: `AttackDamageResolver1.1.md`

Changes:

- ADR now reports its exact calculated Bar 1 transition to TokenTriggers after damage application.
- This prevents linked Beacon HP synchronization from masking the Bar 1 event before ADR performs its explicit token write.
- Bloodied, Relentless Endurance, and HP 0 presentation triggers now respond reliably to ADR damage.
- Damage caching, target memory, slots, damage traits, FX, undo, Fire Shield retaliation, and AE damage-source hooks remain unchanged.
- ADR remains functional when TokenTriggers is not installed.

Installation note:

- Install ADR 1.1 with TokenTriggers 1.3.1.
- No StateWipe is required.

## 2026-07-20 - Relentless Endurance Bar 1 trigger

### TokenTriggers 1.3

File: `TokenTriggers1.3.md`

Added a token-specific Relentless Endurance registration.

Behavior:

- Watches only `bar1_value`.
- Does not require the token to represent a character.
- Does not read or write Beacon HP.
- Triggers when Bar 1 changes from a positive value to 0 or lower.
- On the first qualifying drop during a combat, immediately sets only Bar 1 to 1.
- Marks the feature used for that token for the rest of the combat.
- Cancels the normal HP 0 presentation for the intercepted damage event.
- Re-evaluates the resulting 1 HP state for Bloodied triggers, allowing Blood Frenzy to queue normally.
- A second qualifying drop during the same combat proceeds normally to 0 or lower.
- Each token has its own use even when multiple tokens represent the same generic character sheet.
- Clearing the turn order resets the use for the next combat.

Commands:

```roll20
!tokentrigger relentlessenable TOKEN_ID
!tokentrigger relentlessdisable TOKEN_ID
!tokentrigger relentlessreset TOKEN_ID
!tokentrigger relentlessclear TOKEN_ID yes
```

Activation message:

```text
TOKEN NAME - Relentless Endurance
Reduced to 1 HP instead of falling.
```

No StateWipe is required.

## 2026-07-20 - Token Action Builder attack damage, FX, and sound expansion

### Token Action Builder 0.4.0

File: `Token Action Builder0.4.0.md`

Source: Token Action Builder 0.3.1.

Added attack setup field:

```text
Additional Damage Bonus Not Doubled on Crit
```

Behavior:

- Adds a flat value, formula, or attribute reference to primary damage.
- Adds the same value to critical damage without doubling it.
- Primary damage dice still double on the critical macro.
- The field accepts values such as `2` or `@{selected|user.ragedmg}`.
- Use `0` for no additional bonus.

Example:

```text
Normal: 2d8 + @{selected|strength_mod} + 2
Critical: 4d8 + @{selected|strength_mod} + 2
```

Added centralized attack FX presets:

```javascript
Melee: !adr missile Melee
Arrow: !adr missile Arrow
Throw: !adr missile Throw
None: no command
```

Added a typed attack sound field. The exact supplied track name is placed in the generated attack macro as:

```roll20
!splay TRACK NAME
```

Added the Standard Damage FX and Sound option. Selecting Yes adds the following to both normal and critical damage macros:

```roll20
!adr fx pooling-blood
!adr fx slashx1
!adr fx slashx2
!splay Blood Splatter
```

Selecting No adds nothing.

Preserved:

- Ability modifier selection.
- Proficiency selection.
- Other attack bonus.
- Primary and secondary damage.
- Ability modifier on either damage component.
- Magical and melee ADR tags.
- Action-economy command selection.
- Existing generated attack, damage, and critical-damage ability structure.

Deferred TAB ideas identified during macro review:

- Configurable additional buttons on attack and damage cards.
- ADR remembered-target SaveEffects buttons using `!adr targetcmd`.
- Optional on-hit riders such as Topple, Grapple, poison, smites, Sneak Attack, Divine Favor, or Force of Nature.
- Multi-target ADR slot generation.
- Elemental Adept field using `--adept TYPE`.
- Alternate critical-damage calculation methods.
- Attack description, range, and rules-reminder fields.
- Separate secondary-damage bonus.
- Custom damage FX and sound fields beyond the standard package.
- Separate summon, AoE, hazard, and ScriptCards builders rather than overloading the basic Attack Suite.

No StateWipe is required.

## 2026-07-20 - Out-of-combat mounting and dismounting

### ActionEconomyV2 2.3.1

File: `ActionEconomyV2.3.1.md`

Problem corrected:

- The mount and dismount functions always checked Bar 3 for half-speed movement.
- Outside combat, Bar 3 was empty, so mounting and dismounting silently failed unless the turn order was active and the rider was the active token.

Changes:

- Mounting and dismounting now work while the turn order is empty.
- Outside combat, mounting and dismounting spend no movement.
- Outside combat, mounting does not initialize the mount's Bar 3 movement pool.
- During combat, mounting and dismounting still cost half the rider's speed.
- During combat, only the active rider can mount or dismount.
- AE now whispers the GM when the rider is not active or lacks enough movement.
- When combat later begins, the existing start-of-turn logic initializes the mounted creature's movement.

Preserved:

- Ordinary mounting without a combined side.
- Combined rider-side changes.
- Rider relocation, resizing, and rotation matching.
- Hidden mount movement on the GM layer.
- Rider-driven position synchronization.
- Dismount presentation restoration.
- Existing mount records and macros.

No StateWipe is required.

## 2026-07-20 - Blood Frenzy sound presentation

### TokenTriggers 1.2.2

File: `TokenTriggers1.2.2.md`

Changes:

- Added an independent Jukebox sound field to Bloodied triggers.
- Blood Frenzy plays the configured sound when it activates at the start of the token's next turn.
- Sound activation occurs with the AE command, token-side change, and FX.
- Added sound controls to the setup menu and registry.
- Existing registrations default to no sound until configured.

Preset setup command:

```roll20
!tokentrigger bloodiedpreset @{selected|token_id} bloodfrenzy 2 --fx Blood Frenzy --sound Berserker Roar
```

Manual sound commands:

```roll20
!tokentrigger bloodiedsound TOKEN_ID Exact Jukebox Track Name
!tokentrigger bloodiedsoundclear TOKEN_ID
```

Activation order:

1. Send `!ae-effect bloodfrenzy TOKEN_ID`.
2. Change to the configured token side.
3. Play the configured FX.
4. Start the configured Jukebox track.
5. Display the activation card.

The sound is not automatically stopped at combat end because the track may be shared with the encounter presentation.

No StateWipe is required.

## 2026-07-20 - Bloodied queue announcement, side change, and FX

### TokenTriggers 1.2.1

File: `TokenTriggers1.2.1.md`

Changes:

- Added a chat card when a Bloodied trigger is newly queued.
- Added optional Bloodied token side and FX fields.
- Side and FX occur only when the trigger activates at the start of the token's next turn, not when the token merely becomes Bloodied.
- TokenTriggers stores the original side before activation.
- Reversible triggers restore the original side when the token is no longer Bloodied.
- Nonreversible Blood Frenzy keeps the frenzy side through healing and restores the original side at combat end.

Queue message format:

```text
TOKEN NAME - Bloodied: TRIGGER NAME Ready
```

Blood Frenzy example:

```text
Orc Berserker - Bloodied: Blood Frenzy Ready
```

Generic commands:

```roll20
!tokentrigger bloodiedside TOKEN_ID NUMBER
!tokentrigger bloodiedsideclear TOKEN_ID
!tokentrigger bloodiedfx TOKEN_ID FX_NAME
!tokentrigger bloodiedfxclear TOKEN_ID
```

No StateWipe is required.

## 2026-07-20 - Bloodied trigger infrastructure and Blood Frenzy preset

### TokenTriggers 1.2

File: `TokenTriggers1.2.md`

Added generic Bloodied trigger registration.

Bloodied definition:

```text
Bar 1 current HP is greater than 0 and equal to or less than half of Bar 1 maximum HP.
```

Workflow:

1. Detect crossing into the Bloodied range.
2. Store the trigger as pending.
3. Do not execute it immediately.
4. Execute it when the token next becomes the active turn-order token.
5. Replace stored command variables such as `@@token`.
6. Mark the trigger used according to its reversible setting.

Stored command replacements:

```text
@@token
@@character
@@name
```

Reversible behavior:

- Healing above half before activation cancels the pending trigger.
- Healing above half after activation runs the reverse command.
- The trigger can queue again after the token becomes Bloodied again.
- Reaching 0 HP cancels or reverses the trigger as applicable.

Nonreversible behavior:

- Healing above half does not cancel a pending trigger.
- Healing above half does not reverse an active trigger.
- The trigger fires once per combat.
- Pending activation is canceled if the token reaches 0 before activation.
- Runtime resets when the turn order is cleared.

Added Blood Frenzy preset:

```text
Name: Blood Frenzy
Command: !ae-effect bloodfrenzy @@token
Reversible: No
Reverse Command: None
Enabled: Yes
```

Commands:

```roll20
!tokentrigger bloodiedenable TOKEN_ID
!tokentrigger bloodieddisable TOKEN_ID
!tokentrigger bloodiedlabel TOKEN_ID TRIGGER_NAME
!tokentrigger bloodiedcommand TOKEN_ID API_COMMAND
!tokentrigger bloodiedcommandclear TOKEN_ID
!tokentrigger bloodiedreverse TOKEN_ID API_COMMAND
!tokentrigger bloodiedreverseclear TOKEN_ID
!tokentrigger bloodiedreversible TOKEN_ID on
!tokentrigger bloodiedreversible TOKEN_ID off
!tokentrigger bloodiedreset TOKEN_ID
!tokentrigger bloodiedclear TOKEN_ID yes
```

No StateWipe is required.

## 2026-07-20 - Blood Frenzy AE effect

### ActionEconomyV2 2.3

File: `ActionEconomyV2.3.md`

Added AE-owned effect:

```roll20
!ae-effect bloodfrenzy TOKEN_ID
!ae-effect remove bloodfrenzy TOKEN_ID
```

Blood Frenzy mechanics:

- Duration is combat.
- Grants advantage on all attack rolls reported through AE's ADR modifier interface.
- Grants advantage on all saving throws reported through AE's SE save-roll interface, including concentration saves.
- Increases the real Beacon `speed` value by 10 feet.
- Updates active movement after the speed change.
- Restores the prior Beacon speed when removed.
- Grants no damage resistance.
- Does not grant advantage to attacks made against the creature.
- Does not consume an Action or Bonus Action.

Reliability revision:

- AE attribute modifiers now fall back to an awaited `getSheetItem()` read when the value is not already cached.
- This permits an automatically triggered start-of-turn speed modifier to apply reliably.

Blood Frenzy remains owned by AE. TokenTriggers only detects the threshold and schedules the AE command.

No StateWipe is required.

## 2026-07-20 - TokenTriggers defeat presentation scaling review

The existing TokenTriggers 1.1.2 behavior was reviewed.

Confirmed behavior:

- HP 0 presentation multiplies the token's current width and height by 1.25.
- A 1 by 1 token becomes 1.25 by 1.25.
- A 2 by 2 token becomes 2.5 by 2.5.
- Size, rotation, layer, and side are restored when the token returns to positive HP.

A possible additive alternative was analyzed:

- Add exactly 0.25 grid units to each dimension.
- 1 by 1 would become 1.25 by 1.25.
- 2 by 2 would become 2.25 by 2.25.

Decision:

- No code change was made.
- The existing 1.25 multiplier behavior was retained.

## 2026-07-20 - ActionEconomyV2 Disarm system

### ActionEconomyV2 2.2 development build

Files:

- `ActionEconomyV2-Disarm.md`
- `ActionEconomyV2.2.md`

Added a generic AE-owned Disarm system that uses SaveEffects for the saving throw.

Architecture:

- SE rolls the save and owns the result card.
- AE creates, tracks, presents, and cleans up the dropped item only after SE failure.
- ADR can supply remembered target routing through `!adr targetcmd`.

Added a required Roll20 character named exactly:

```text
Disarmed Item
```

Its saved default token is multisided in this order:

1. Longsword
2. Greatsword
3. Dagger
4. Bow
5. Crossbow
6. Glaive
7. Warhammer
8. Maul
9. Spear
10. Battleaxe
11. Greataxe
12. Club
13. Staff
14. Shield

Failed-save behavior:

- Clone the Disarmed Item default token.
- Switch to the selected item side.
- Remove represented character, controls, bars, bar links, sight, and emitted light.
- Place the item near the affected creature with randomized position and rotation.
- Apply AE's `disarmed` condition.
- Track the drop by affected token and individual record ID.
- Show pickup buttons on PC and NPC/Ally turn cards.

Pickup command:

```roll20
!ae-disarm pickup TARGET_TOKEN_ID RECORD_ID
```

Manual commands:

```roll20
!ae-disarm apply TARGET_TOKEN_ID ITEM_KEY
!ae-disarm clear TARGET_TOKEN_ID
!ae-con remove disarmed TARGET_TOKEN_ID
```

Cleanup occurs when:

- The item is picked up.
- The condition is removed.
- The affected token is cleared or deleted.
- The dropped token is manually deleted.

Latest Disarm macro using ADR's remembered target:

```roll20
&{template:default} {{name=@{selected|token_name} — Disarm}} {{Description=@{selected|token_name} attempts to wrench an item from the target's grasp.}}

!adr targetcmd !ae-disarm attempt @@target @{selected|token_id} ?{Item|Longsword,longsword|Greatsword,greatsword|Dagger,dagger|Bow,bow|Crossbow,crossbow|Glaive,glaive|Warhammer,warhammer|Maul,maul|Spear,spear|Battleaxe,battleaxe|Greataxe,greataxe|Club,club|Staff,staff|Shield,shield} str 17

!splay Disarm
```

The macro does not spend an AE Action or Attack because it was configured for a Battle Master maneuver.

Known inherited issue not changed in this conversation:

- The current dropped-item layer block checks for `toFront` but calls `toBack`.
- No correction was applied because the issue was not revisited after identification.

No StateWipe is required.

## 2026-07-20 - Combined rider and mount token presentation

### ActionEconomyV2 combined-mount build

File: `ActionEconomyV2-Combined-Mount-Tokens.md`

Added optional combined-token mounting:

```roll20
!ae mount @{target|Mount|token_id} --side 2
```

When `--side` is supplied:

- Store the rider's original side, image, width, height, rotation, and layer.
- Store the mount's original layer.
- Apply Mounted.
- Switch the rider to the selected mounted side.
- Move the rider to the mount's position.
- Match the rider's size and rotation to the mount.
- Move the separate mount token to the GM layer rather than deleting it.
- Continue using the hidden mount's represented character, speed, movement, HP, effects, conditions, and other state.

Mounted movement:

- The player moves the visible rider.
- AE synchronizes the hidden mount to the rider.
- Movement and difficult terrain are calculated against the mount.
- Movement is deducted from the mount's Bar 3.

Dismounting restores both tokens' original presentation data.

Legacy mounting without `--side` remains supported.

No StateWipe is required.

## 2026-07-20 - PC, Ally, and NPC AE turn cards and registry

### ActionEconomyV2 PC, Ally, and NPC turn-card build

File: `ActionEconomyV2-PC-Ally-NPC-Turn-Cards.md`

Changes:

- Added persistent `S.allyCharacterIds` classification.
- Character classifications are PC, Ally, or Unregistered.
- PC and Ally registrations are mutually exclusive.
- Friendly status now means PC or Ally.
- Dark One's Blessing no longer triggers from the defeat of a registered PC or Ally.
- Registered PCs retain the existing full player-facing action card and separate Conditions and Effects card.
- Registered Allies and unregistered NPCs receive a consolidated buttonless turn card.
- The buttonless card includes attacks, movement, effective speed, prone stand-up guidance, mount movement, conditions, effects, defenses, and ongoing damage.
- Every real active token now runs the existing start-turn sequence, not only registered PCs.
- Attack counts of 1 are no longer stored because 1 is the default.
- Added the GM-only character registry command:

```roll20
!ae registry
```

- Added automatic cleanup when a Roll20 character is deleted.
- Added manual stale-entry cleanup:

```roll20
!ae registry clean
```

No StateWipe is required.

## 2026-07-20 - AE character setup menu

### ActionEconomyV2 Character Setup build

File: `ActionEconomyV2-Character-Setup-Menu.md`

Added GM-facing setup command:

```roll20
!ae setup
!ae setup TOKEN_ID
```

The menu manages character-keyed:

- PC registration.
- Attacks per Attack action.
- Eldritch Mind.
- Dark One's Blessing.
- Danger Sense.
- Aura of Protection.
- Clear Character Setup.

Buttons retain the configured token ID so later selection changes do not redirect the setup action.

Rage remains excluded from permanent setup because AE adds and removes the Rage feature automatically.

No StateWipe is required.

## 2026-07-20 - AE custom-attribute reduction and character-state registries

### ActionEconomyV2 Character State build

File: `ActionEconomyV2-Character-State.md`

Removed AE's reliance on these Beacon custom attributes:

```text
user.isPC
user.ae_attacks
user.ae_features
user.ae_auras
```

Replaced them with persistent character-keyed AE state:

```javascript
S.pcCharacterIds
S.attackCounts[characterId]
S.features[characterId]
S.auras[characterId]
```

Preserved macro-facing custom values still used by AE:

```text
user.ragedmg
user.sacredatk
user.exhaustionpenalty
```

Revisions:

- Removed custom-attribute translation and cache requests for the four removed values.
- PC status now uses `S.pcCharacterIds` only.
- Attack count now uses `S.attackCounts` only.
- Permanent features now use `S.features` only.
- Aura of Protection now uses `S.auras` only.
- Removed token-name inference for permanent features.
- Added aura commands:

```roll20
!ae aura add protection
!ae aura remove protection
!ae auras
```

Existing commands retained:

```roll20
!ae pcs
!ae attacks 2
!ae feature add eldritchmind
!ae feature add darkonesblessing
!ae feature add dangersense
!ae feature remove FEATUREKEY
!ae features
```

One-time registration was required only for values that had existed exclusively in removed Beacon custom attributes.

No StateWipe is required.

## 2026-07-20 - TokenTriggers HP 0 presentation system

### TokenTriggers 1.0.0

File: `TokenTriggers.md`

Created TokenTriggers as a separate presentation and automation script. It does not own HP, damage, healing, AE conditions, AE effects, or action economy.

Initial `hpZero` trigger:

- Watches Bar 1 crossing from positive to 0 or lower.
- Stores character-level configuration and token-specific runtime separately.
- Stores the token's current side before defeat.
- Switches to a configured dead side.
- Plays an exact Jukebox track when configured.
- Plays a configured FX.
- Prevents repeat activation while HP remains at or below 0.
- Restores the exact prior side when Bar 1 returns to positive HP and restoration is enabled.
- Supports represented characters across maps and newly placed tokens.

Commands and menus:

```roll20
!tokentrigger setup
!tokentrigger register
!tokentrigger registry
!tokentrigger registry clean
!tokentrigger restore TOKEN_ID
```

State root:

```javascript
state.TokenTriggers
```

### TokenTriggers 1.1.0

File: `TokenTriggers-Map-Layer.md`

Added optional movement to the Map layer at HP 0.

Commands:

```roll20
!tokentrigger maplayer TOKEN_ID on
!tokentrigger maplayer TOKEN_ID off
```

Restoration now includes original side and original layer.

### TokenTriggers 1.1.1

File: `TokenTriggers-Map-Layer-Fixed.md`

Corrections:

- Replaced TokenMod side switching with direct Roll20 graphic updates to both `currentSide` and `imgsrc`.
- Removed TokenMod as a TokenTriggers dependency.
- Replaced `/fx` chat calls with native `spawnFxWithDefinition()` for custom FX and `spawnFx()` for built-in FX.
- Preserved existing registrations and state.

### TokenTriggers 1.1.2

File: `TokenTriggers-Map-Layer-Scale-Rotate.md`

Added automatic defeat presentation when Move to Map Layer is enabled:

- Multiply width and height by 1.25.
- Add a random rotation.
- Store original width, height, and rotation.
- Restore side, layer, size, and rotation on recovery, manual restore, registration removal, and Test cleanup.

No StateWipe was required for any TokenTriggers 1.0 through 1.1.2 update.

## 2026-07-20 - Door control and sound utilities

### DoorControl

File: `DoorControl.md`

Added GM-only commands for direct Roll20 door control:

```roll20
!doorctl open DOOR_ID
!doorctl close DOOR_ID
!doorctl toggle DOOR_ID
```

### DoorSounds original utility

File: `DoorSounds.md`

Added automatic random Jukebox playback when non-secret doors open or close.

Default tracks:

```text
Door Open 1 through Door Open 4
Door Close 1 through Door Close 3
```

### DoorSounds Registry 1.0.0

File: `DoorSounds-Registry.md`

Expanded DoorSounds into persistent groups and per-door assignment.

Default groups:

```text
default
wood
stone
metal
gate
```

Core commands:

```roll20
!doorsound menu
!doorsound assign DOOR_ID GROUP
!doorsound remove DOOR_ID
!doorsound door DOOR_ID
!doorsound doors
!doorsound groups
!doorsound test GROUP open
!doorsound test GROUP close
!doorsound config secret on
!doorsound config secret off
```

Group management commands:

```roll20
!doorsound group create GROUP
!doorsound group delete GROUP
!doorsound group addopen GROUP "TRACK NAME"
!doorsound group addclose GROUP "TRACK NAME"
!doorsound group removeopen GROUP "TRACK NAME"
!doorsound group removeclose GROUP "TRACK NAME"
!doorsound group clearopen GROUP
!doorsound group clearclose GROUP
```

State root:

```javascript
state.DoorSounds
```

## 2026-07-20 - Persistent custom-state manager

### StateWipe utility

File: `StateWipe.md`

Added GM-only persistent-state inspection and confirmation-protected wipe commands:

```roll20
!statelist
!statewipe
!statewipe WIPE
```

Configured roots:

```text
ActionEconomyV2
AttackDamageResolver
SaveEffects
AoEBoom
Executioner
HPManager
AuraToggle
```

The wipe does not remove tokens, characters, pages, macros, abilities, token bars, or Beacon sheet values.

Current limitation:

- TokenTriggers and DoorSounds Registry were added later and are not yet included in `CUSTOM_STATE_ROOTS`.

## 2026-07-20 - Beacon sheet attribute and modifiability reference

File: `Roll20_2024_Sheet_Attributes_and_Modifiability(2).md`

Created an updated Markdown reference for Roll20 D&D 2024 Beacon sheet attributes and observed API modifiability.

Confirmed read and write behavior for:

```text
hp
hp_max
hp_temp
speed
ac
```

Recorded an important Beacon behavior distinction:

- `getSheetItem()` can return computed proficiency-inclusive values such as PC proficiency bonus, saving throws, and skills even when the visible Attributes tab or `@{selected|...}` displays a different or incomplete backing value.
- NPC and PC attributes can expose different backing values from the styled sheet.
- Beacon values should therefore be read through `getSheetItem()` and written through `setSheetItem()` rather than raw Roll20 attribute lookup.

The reference marks confirmed writable values separately from untested or read-only values and is intended to be updated as more attributes are tested.

# Macro Additions

## Healing macro

```roll20
&{template:default} {{name=@{selected|token_name} — Healing}} {{Description=@{selected|token_name} restores the target’s vitality.}} {{Healing=1d10 + 11}}

!hp heal @{target|Healing Target|token_id} [[1d10 + 11]] Healing

!ae bonus
```

## Saving throw query with +11

Uses Beacon saving throw bonus attributes and adds 11 to the result.

```roll20
&{template:default} {{name=@{selected|token_name} — Saving Throw}} {{Save=?{Saving Throw|Strength,Strength [[1d20 + @{selected|strength_save_bonus} + 11]]|Dexterity,Dexterity [[1d20 + @{selected|dexterity_save_bonus} + 11]]|Constitution,Constitution [[1d20 + @{selected|constitution_save_bonus} + 11]]|Intelligence,Intelligence [[1d20 + @{selected|intelligence_save_bonus} + 11]]|Wisdom,Wisdom [[1d20 + @{selected|wisdom_save_bonus} + 11]]|Charisma,Charisma [[1d20 + @{selected|charisma_save_bonus} + 11]]}}}
```

## General supply loot

```roll20
&{template:default} {{name=Loot}} {{GP=180 gp}} {{Potion of Healing=1}} {{Potion of Greater Healing=1}} {{Crossbow Bolts=40}} {{Arrows=60}} {{Healer's Kit=2}} {{Rations (5 days)=10}}
```

## Orc Captain loot

```roll20
&{template:default} {{name=Orc Captain Loot}} {{+1 Glaive=1}} {{+1 Half Plate Armor=1}} {{Helm of Comprehending Languages=1}} {{Belt Pouch=75 gp}} {{Potion of Greater Healing=1}}
```

## Orc Mage loot

```roll20
&{template:default} {{name=Orc Mage Loot}} {{Robes=1}} {{Belt Pouch=[[4d6]] gp}} {{Spell Scroll (Misty Step)=1}}
```

## Orc Hunter loot

```roll20
&{template:default} {{name=Orc Hunter Loot}} {{Heavy Crossbow=1}} {{Crossbow Bolts=[[2d10]]}} {{Dagger=1}} {{Studded Leather Armor=1}} {{Belt Pouch=[[2d6]] gp}}
```

## Orc Marauder loot

```roll20
&{template:default} {{name=Orc Marauder Loot}} {{Greataxe=1}} {{Rusted Plate Armor=1}} {{Belt Pouch=[[3d6]] gp}} {{Potion of Healing=1}} {{Weighted Bone Die=1}}
```

## Orc Raider loot

```roll20
&{template:default} {{name=Orc Raider Loot}} {{Battleaxe=2}} {{Handaxes=2}} {{Chain Shirt=1}} {{Belt Pouch=[[2d6]] gp}} {{Throwing Axe Harness=1}}
```

## Crafting materials and scroll loot

```roll20
&{template:default} {{name=Crafting Materials and Loot}} {{Faint Essence=Qty: 1<br>Used to Craft: Any Uncommon magic item}} {{Refined Essence=Qty: 1<br>Used to Craft: Any Rare magic item}} {{Bulette Carapace Plate=Qty: 1<br>Used to Craft: Adamantine Armor or a reinforced magical shield (DM recipe)}} {{Griffon Wing Feathers=Qty: 6<br>Used to Craft: Winged Boots}} {{Spell Scroll of Shatter=Qty: 1}} {{Spell Scroll of Counterspell=Qty: 1}}
```

## Gadget menu

```roll20
&{template:default} {{name=@{selected|token_name} — Gadgets}} {{Options=[Legsnare Launcher](~selected|Legsnare-Launcher) [Stim Injector](~selected|Stim-Injector)}}
```

## Grab sound and target-token deletion

```roll20
!splay grab
!dismiss @{target|Delete Token|token_id}
```

# Deferred or Reviewed Without Implementation

## TokenTriggers additive size increase

Reviewed replacing the 1.25 size multiplier with an additive 0.25 grid-unit increase. The change was declined, and TokenTriggers retains multiplicative scaling.

## Blood Frenzy damage bonuses or defenses

Blood Frenzy was intentionally limited to:

- Advantage on attacks.
- Advantage on saves.
- +10 speed.

It does not currently grant resistance, bonus damage, or advantage to attacks made against the creature.

## Disarm target-name card substitution

ADR remembered-target routing was used for the Disarm command. A separate AE-generated card was not added solely to substitute the target's name into the initial standalone default template.

## Token Action Builder future expansion

The later-edit ideas listed under Token Action Builder 0.4.0 remain unimplemented.

# Append Template for Future Updates

Copy this section above the prior dated entries and complete it for each future build.

```markdown
## YYYY-MM-DD - Short update title

### Component and version

File: `ComponentVersion.md`

Problem or goal:

- Describe the issue or requested feature.

Changes:

- List exact implemented behavior.
- Identify any new commands, state, API hooks, attributes, FX, sounds, or macros.

Preserved behavior:

- Identify architecture and workflows intentionally left unchanged.

Compatibility:

- State required companion versions.
- State whether existing state and registrations are preserved.
- State whether a StateWipe, re-registration, macro replacement, or recast is required.

Tests:

- List the exact tests performed and expected results.

Deferred items:

- Record related ideas that were reviewed but not implemented.
```
