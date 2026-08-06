# Roll20 Coding Change Log

Last updated: 2026-08-06

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
| HandoutAccess | `HandoutAccess1.1.js` | `HandoutAccess1.0.js` | Load before LootManager when handout loot is used |
| LootManager | `LootManager1.4.js` | `LootManager1.3.1.js` | HandoutAccess 1.1 for handout loot; Experimental Mod sandbox with Beacon `getSheetItem` and `setSheetItem`; optional Jukebox tracks named `grab` and `coins` |
| TokenAnimator | `TokenAnimator1.4.js` | `TokenAnimator1.3.js` | None |
| ActionEconomyV2 | `ActionEconomyV2.8.3.js` | `ActionEconomyV2.8.2.js` | Current installed companions; Dark One’s Blessing uses Beacon async sheet reads |
| TokenTriggers | `TokenTriggers1.3.3.js` | TokenTriggers 1.0.0 through 1.3.2 | `ActionEconomyV2.8.3.js` for PC/Ally-aware turn-order removal; ADR/SaveEffects may call the generic threshold API |
| AttackDamageResolver | `AttackDamageResolver1.3.2.js` | `AttackDamageResolver1.3.1.js` | `ActionEconomyV2.8.3.js`; `TokenTriggers1.3.3.js` when Bloodied, Relentless Endurance, or HP 0 triggers are used |
| SaveEffects | `SaveEffects1.3.1.js` | `SaveEffects1.3.js` | `TokenTriggers1.3.3.js` when TokenTriggers should react to SE damage |
| HPManager | `HPManager1.1.1.js` | `HPManager1.1.js` | No new dependency; healing behavior is unchanged |
| AoEBoom | `AoEBoom1.1.md` | Original AoEBoom source | `ActionEconomyV2.3.2.md` and `SaveEffects1.1.md` for corrected directional-hazard saves and damage |
| Token Action Builder | `TokenActionBuilder0.5.0.js` | `TokenActionBuilder0.4.0.js` | ADR and `!splay` for generated FX and sound commands |
| DoorSounds | `DoorSounds-Registry.md`, version 1.0.0 | Original fixed DoorSounds list | None |
| DoorControl | `DoorControl.md` | New utility | None |
| Persistent State Manager | `StateWipe.md` | New utility | None |
| Beacon attribute reference | `Roll20_2024_Sheet_Attributes_and_Modifiability(2).md` | Prior attribute notes | None |

## Installation and Compatibility Notes

- No build created in this conversation requires a StateWipe unless a future entry expressly says otherwise.
- Load `HandoutAccess1.1.js` before `LootManager1.4.js` when using `handout:` loot entries. LootManager starts safely without the dependency and reports it only when a handout is taken.
- Existing AE, TokenTriggers, ADR, SE, and AoEBoom state is normalized or preserved by the current builds.
- Active Wall of Fire hazards created before installing AE 2.3.2 and AoEBoom 1.1 must be recast. Existing hazard records do not contain the newly stored save configuration.
- Blood Frenzy requires AE 2.3 or later and TokenTriggers 1.2 or later.
- Blood Frenzy sound playback requires TokenTriggers 1.2.2 or later.
- Relentless Endurance requires TokenTriggers 1.3 or later.
- Reliable ADR damage-trigger integration requires ADR 1.3.1 or later and TokenTriggers 1.3.3.
- Reliable SaveEffects damage-trigger integration requires SaveEffects 1.3.1 and TokenTriggers 1.3.3.
- The current `StateWipe.md` predates TokenTriggers and DoorSounds Registry state. Its configured wipe list does not currently include `state.TokenTriggers` or `state.DoorSounds`.

# Change History

## 2026-08-06 - Combined token animations and ordinary-item consumption

### TokenAnimator 1.4 and LootManager 1.4

Files: `TokenAnimator1.4.js` and `LootManager1.4.js`.

Changes:

- TokenAnimator generalizes the existing `animate` command and public method so scale, rotation, page-scaled movement, and opacity can run in any supported combination through one transient animation record, one timer, one duration, and one easing function. The combined command uses `--scale`, `--degrees` or `--rotation`, paired `--direction` and `--distance`, and `--opacity`; `--complete|delete` and `--complete|gmlayer` still run only after final animated values are applied.
- Combined requests validate every supplied property, alias, movement pair, page scale, position, token dimensions, duration, easing, and completion action before storing a new baseline, cancelling an active animation, starting a timer, or mutating the token. Supplying both rotation aliases requires valid, nonconflicting values.
- Dedicated move, rotate, fade, scale, preset, restore, baseline, cancellation, legacy `!tokensize`, and public API workflows remain available. Scale remains relative to the stored baseline, and movement remains relative to the page's configured distance scale.
- LootManager adds `!loot consume --token|TOKEN_ID --name|ITEM NAME [--quantity|N]`, with selected-token fallback and a default quantity of 1. It matches only ordinary `item:` names after case-insensitive trim/internal-whitespace normalization, aggregates duplicates, and decrements or removes matching records in source order.
- Consume requests share the existing per-source take lock and re-read the current LOOT block after acquiring it. Invalid, nonpositive, unsafe, nonexistent, or insufficient requests, locked containers, and unresolved inline gp leave GM Notes unchanged. GP, handouts, keys, invalid preserved lines, and container metadata are never candidates for consumption.
- Successful consumption reuses the existing writer, empty-source deletion policy, item sound, public feedback, and refreshed inspection card, preserving GM Notes outside the edited LOOT block.

Why:

- Complex token effects previously required separate TokenAnimator calls whose per-token cancellation behavior prevented simultaneous property animation.
- Ordinary loot could be taken through generated cards but had no exact-name quantity command for consumable use across duplicate item records.

Compatibility and migration:

- Replace `TokenAnimator1.3.js` with `TokenAnimator1.4.js` and `LootManager1.3.1.js` with `LootManager1.4.js`. The untouched prior builds are archived at `Scripts/Prior Versions/TokenAnimator1.3.js` and `Scripts/Prior Versions/LootManager1.3.1.js`.
- No StateWipe, state migration, re-registration, Beacon inventory change, dependency change, or existing macro replacement is required. Existing TokenAnimator commands/aliases/APIs and LootManager commands/public inspection API remain compatible.

Validation performed:

- `node --check` passed for both active scripts.
- Focused deterministic scenarios cover shared TokenAnimator interpolation, atomic invalid-request behavior, cancellation, completion, duration-zero behavior, aliases, dedicated-command compatibility, normalized duplicate LootManager consumption in source order, exact-match and quantity failures, protected record kinds, locked/unresolved sources, GM Notes preservation, deletion, and take/consume lock contention.
- The full mocked active-script suite passed after updating the active manifest and handler contracts to the new filenames.

Known limitations:

- The local harness does not prove live Roll20 timer/render cadence, token interpolation presentation, chat/template rendering, player permission exposure, Jukebox playback, GM Notes persistence, or real sandbox event scheduling. Confirm those behaviors in the dedicated Test Game after upload.

## 2026-08-04 - Token Action Builder optional attack ability modifier

### TokenActionBuilder 0.5.0

File: `TokenActionBuilder0.5.0.js`.

Changes:

- The attack builder now asks whether to add the selected attack ability modifier and emits `--atkability yes` or `--atkability no`.
- `attackBonusFormula()` includes the selected ability reference only when that option is enabled. Missing or unrecognized `--atkability` values preserve the prior enabled behavior.
- Proficiency and `--atkbonus` remain independent. A no-ability, no-proficiency attack with `--atkbonus 9` generates `1d20 + 9` for normal, advantage, and disadvantage rolls.

Preserved behavior:

- Primary damage still independently honors `--mod1`; `--mod1 no --dmgbonus 4` produces damage dice plus 4, while the critical macro doubles only the dice.
- Existing direct `!tab buildattack` commands without `--atkability` continue to include the selected ability modifier.

Compatibility and migration:

- Replace `TokenActionBuilder0.4.0.js` with `TokenActionBuilder0.5.0.js`. The unchanged prior source is archived at `Scripts/Prior Versions/TokenActionBuilder0.4.0.js`.
- No StateWipe, data migration, re-registration, or macro replacement is required. Re-run the builder only when an existing generated attack should omit its ability modifier.

Validation performed:

- Local syntax and focused regression coverage verify the builder query, default and unknown option compatibility, numeric-only attack formulas, and normal/critical primary-damage formulas.

Known limitations:

- The local harness validates generated macro text but does not render the Roll20 attack or damage templates; confirm generated actions in the dedicated Test Game after upload.

## 2026-08-03 - LootManager successful-unlock side failure visibility

### LootManager 1.3.1

File: `LootManager1.3.1.js`.

Changes:

- After a successful Sleight-of-Hand unlock, LootManager now checks the existing `setContainerSide(..., 'open')` result. If the token cannot change to the configured open side, it keeps the successful unlocked GM Notes state, result card, configured sound behavior, and loot display, while sending the clicking player a concise visible error card.

Why:

- The successful path previously ignored a false side-change result. The GM received its existing warning, but the player received no explanation that the lock was open while the visual side failed.

Compatibility and migration:

- Replace `LootManager1.3.js` with `LootManager1.3.1.js`; the untouched prior file is archived at `Scripts/Prior Versions/LootManager1.3.js`.
- No state migration, key-system change, macro replacement, or StateWipe is required.

Validation performed:

- Local unlock scenarios cover non-GM button generation/routing, skill/DC/d20 result, lock persistence, retry, error paths, GM-notes write failure, and the player-visible side-failure message.

Known limitations:

- The harness does not prove live Roll20 chat-button delivery, player permissions, UI rendering, GM Notes authorization, or Jukebox playback.

## 2026-08-03 - ADR card encoding safety and Dark One’s Blessing Beacon correction

### AttackDamageResolver 1.3.2 and ActionEconomyV2 2.8.3

Files: `AttackDamageResolver1.3.2.js` and `ActionEconomyV2.8.3.js`.

Changes:

- ADR replaces the confirmed committed mojibake that could appear in its attack-guidance, damage, Uncanny Dodge, damage-reduction, Fire Shield, and target-slot cards. It now escapes externally supplied template-field values (names, cached labels/types, and AE-provided notes) before assembling Roll20 template markup; literal card `<br>` separators and buttons remain intentional markup.
- AE now calculates Dark One’s Blessing with asynchronous Beacon `level` plus `charisma_mod` reads, falling back to the current `charisma` score only when the modifier is unavailable. The temp-HP application and lethal death-trigger processing await this result, preserving the existing greater-temp-HP, kill, nearby-death, friendly-death-exclusion, and deduplication behavior.

Why:

- The audit confirmed source-level mojibake and unescaped dynamic ADR card fields.
- The prior blessing calculation used cached `base_level`, which is not total character level and could be unavailable before cache refresh.

Compatibility and migration:

- Archive copies are preserved at `Scripts/Prior Versions/AttackDamageResolver1.3.1.js` and `Scripts/Prior Versions/ActionEconomyV2.8.2.js`. Install the replacement files in their existing upload positions; do not install either archived build.
- No StateWipe, macro replacement, re-registration, or data migration is required. Existing public APIs, TokenTriggers processing, and AE ownership are unchanged.

Validation performed:

- `node --check` passed for both replacements and the new focused scenario.
- The focused local scenario covers escaped ADR fields/no malformed marker sequences and Dark One’s Blessing total-level, modifier, fallback, greater-temp-HP, kill, nearby, and friendly-exclusion behavior.
- Full local and active-load validation is recorded with the task handoff after this entry.

Known limitations:

- The local harness captures raw `sendChat` strings but does not render Roll20 templates. Confirm card rendering and live Beacon synchronization in the dedicated Test Game.

## 2026-08-03 - Final TokenTriggers HP persistence and private-helper isolation

### AttackDamageResolver 1.3.1, SaveEffects 1.3.1, and HPManager 1.1.1

Files: `AttackDamageResolver1.3.1.js`, `SaveEffects1.3.1.js`, and `HPManager1.1.1.js`.

Problem or goal:

- Ensure ADR and SaveEffects persist TokenTriggers' final resolved Bar 1 value after a threshold reaction such as Relentless Endurance.
- Remove the four audited active-source private-helper collisions without changing public APIs or commands.

Changes:

- ADR now writes its calculated Bar 1 damage value, calls the unchanged generic `TokenTriggersAPI.processBar1Change(token, oldHp, newHp)` wrapper, then writes the returned final numeric HP to Bar 1 and represented Beacon `hp`. Its undo record retains that resolved `bar1After` value while preserving the pre-damage snapshot used by `!adr undo`.
- SaveEffects now writes its TokenTriggers-resolved `hpAfter` back to Bar 1 before writing represented Beacon `hp`.
- Renamed only private helpers and their internal callers: ADR uses `adrReplaceInlineRolls`, `adrGetAeModifiedDamage`, and `adrProcessTokenTriggersBar1Change`; SaveEffects uses `seReplaceInlineRolls`, `seGetAeModifiedDamage`, and `seProcessTokenTriggersBar1Change`; HPManager uses `hpReplaceInlineRolls`.
- Updated the active-script manifest and local regression coverage so all four former helper-overwrite exceptions are removed and collision-free loading is required.

Compatibility and migration:

- Replace the active files with `AttackDamageResolver1.3.1.js`, `SaveEffects1.3.1.js`, and `HPManager1.1.1.js`. Their unchanged prior builds are archived at `Scripts/Prior Versions/AttackDamageResolver1.3.js`, `Scripts/Prior Versions/SaveEffects1.3.js`, and `Scripts/Prior Versions/HPManager1.1.js`.
- Existing commands, public APIs, state namespaces, TokenTriggers deduplication, unlinked-token handling, HPManager healing, and AE ownership are preserved. No StateWipe, migration, re-registration, or macro replacement is required.

Validation performed:

- `node --check` passed for all 43 active `Scripts/*.js` files.
- `node run-tests.js` passed all 22 local tests, including ordinary ADR/temp-HP persistence, ADR Relentless final Bar 1/Beacon/undo data, SaveEffects final Bar 1/Beacon persistence, represented/unlinked behavior, undo, and collision-free loading.
- `node --test scenarios/00-load-all-active-scripts.test.js` passed all 5 startup/global/handler tests.

Known limitations:

- Local tests do not prove Roll20's native-event, Beacon sheet-worker, or UI timing. Run the updated dedicated live Test Game checklist after upload, especially the ADR/SaveEffects Relentless Endurance and undo probes.

## 2026-08-03 - TokenTriggers ADR/SaveEffects compatibility API restoration

### TokenTriggers 1.3.3

File: `TokenTriggers1.3.3.js`

Problem or goal:

- Restore the generic TokenTriggers integration point already called optionally by AttackDamageResolver and SaveEffects, without adding TokenTriggers feature knowledge or duplicate threshold logic to either damage owner.

Changes:

- Added `TokenTriggersAPI.processBar1Change(token, oldHp, newHp)`, which returns the final numeric Bar 1 value after TokenTriggers-owned processing.
- Routed the public API and native `change:graphic:bar1_value` handler through the same existing HP-zero, Bloodied, and Relentless Endurance processing order.
- Added a short-lived, token-scoped transition record so the explicit hook and native event return one resolved result without processing the same transition twice, including either controlled ordering.
- Preserved the existing `TokenTriggers` configuration API, commands, state namespace, Beacon boundaries, and unrepresented-token behavior. No AttackDamageResolver or SaveEffects production file was changed.

Compatibility and migration:

- Replace active `TokenTriggers1.3.2.js` with `TokenTriggers1.3.3.js`; the unchanged prior build is archived at `Scripts/Prior Versions/TokenTriggers1.3.2.js`.
- Existing TokenTriggers registrations and `state.TokenTriggers` data are reused without migration or reconfiguration.
- No StateWipe, macro replacement, ADR revision, SaveEffects revision, or Beacon attribute change is required for this compatibility restoration.

Validation performed:

- `node --check Scripts/TokenTriggers1.3.3.js` passed.
- The complete dependency-free local suite passed 19 of 19 tests, including all 43 active scripts loading together, the public API contract, generic ADR and SaveEffects calls, both controlled explicit/native ordering cases, one-result duplicate suppression, Relentless Endurance, HP-zero presentation and blank-to-positive recovery, rejection of unknown ordinary Bloodied transitions, linked/unlinked token boundaries, healing isolation, undo, and AE handoffs.
- The separate all-active-scripts load command passed 4 of 4 startup/global/handler tests.

Known limitations:

- The local scheduler proves the controlled order matrix, not Roll20's actual native-event or Beacon sheet-worker timing; the dedicated live Test Game checklist remains required.
- SaveEffects consumes the API's returned final HP before its Beacon write. AttackDamageResolver currently writes Beacon HP before calling the API and ignores the returned value, so a TokenTriggers adjustment such as Relentless Endurance may leave a linked Beacon value at ADR's earlier calculated HP until Roll20 synchronization resolves it. Correcting that ordering is a separate ADR revision and is not included here.

## 2026-08-03 - Individual active-script migration and integration registry

### Repository script inventory (43 installed scripts)

Files: the 43 individual `.js` files in `Scripts/`; Architecture registry and governance documentation.

Problem or goal:

- Replace non-installed Project-upload batch artifacts with one authoritative repository file per actually installed Roll20 script, preserving the confirmed live upload order.

Changes:

- Removed batch wrapper lines from 28 newly separated scripts without changing their inner source.
- Replaced the extracted TokenMod documentation placeholder with the supplied working `TokenMod` 0.8.88 source.
- Removed the four combined batch artifacts from the active `Scripts` root and recorded all 43 individual files in installation order.
- Updated repository governance, command/API contracts, state/ownership contracts, live verification, and agent routing around the individual-file workflow.

Compatibility:

- Script behavior and embedded versions are unchanged for the 28 mechanically recovered sources. TokenMod remains version 0.8.88.
- No StateWipe, state migration, macro replacement, FX change, or prior-version reorganization is required.
- The separated files must be installed in the order recorded by `Guides and Notes/Architecture/Command-and-API-Registry.md`. Combined batches must not be installed.

Validation performed:

- All 43 active `.js` files passed Node.js syntax validation.
- The 28 recovered files matched their archived batch interiors line-for-line after removing only the wrapper lines.
- `Scripts/TokenMod.js` matched the supplied source by SHA-256: `41EFA21342BEB4ABE64E77C18810D174405F0B650D63A301EB8386D835B6B71F`.
- Confirmed a one-to-one mapping between the 43 active filenames and the supplied installation order, with no active batch or duplicate root file.

Known limitations:

- Local syntax validation does not prove Roll20 runtime load order, sandbox globals, permissions, Beacon synchronization, FX, audio, paths, doors, dynamic lighting, or UI behavior.
- ADR and SaveEffects call `TokenTriggersAPI.processBar1Change`, while the active TokenTriggers source exposes `TokenTriggers`; the runtime API source still requires verification.

## 2026-08-02 - Persistent character keyrings and container keys

### LootManager 1.3

File: `LootManager1.3.js`

Problem or goal:

- Allow linked characters to collect reusable named keys from token GM Notes and use those keys to open configured locked containers without a Sleight of Hand roll.

Changes:

- Initializes and preserves `state.LootManager.keys`, keyed by represented character ID and normalized key name. Names are trimmed, internal whitespace is collapsed, matching is case-insensitive, and repeated pickup does not create a duplicate.
- Extends the existing LOOT parser, source-order records, cards, stale validation, writer, and delete-when-empty logic with `key-item: Key Name` entries. A linked looter can use `Take Key`; the existing item sound and Loot Taken announcement run only after the source update is verified.
- Extends container fields with `key: Key Name`. A locked-container card retains its Sleight of Hand button and conditionally adds the generic `Use Key` button only for a selected linked character whose keyring has the required key.
- Adds the internal key unlock path, which revalidates the source, required key, and current character keyring; writes only `locked: no`; retains the key and required-key field; opens the configured token side; plays the existing successful-opening sound; and displays normal loot without rolling.
- Adds GM-only `!loot keys` management with pagination, per-character menus, grant, remove, clear-character confirmation, prune, and clear-all confirmation. Missing characters are clearly labeled; prune preserves and normalizes safely migratable key records while removing only missing, empty, or malformed data.

Compatibility:

- Replace active `LootManager1.2.js` with `LootManager1.3.js`; the unchanged prior build is archived at `Scripts/Prior Versions/LootManager1.2.js`.
- Existing loot entries, handout integration, fixed and inline gp, Beacon gp handling, containers, sounds, commands, token GM Notes encoding, and the universal player macro remain compatible.
- No StateWipe, migration, macro replacement, Beacon inventory change, or change to HandoutAccess is required. Existing LootManager configuration is preserved.

Validation performed:

- JavaScript syntax validation with Node.js.
- Mocked Roll20 integration coverage for linked and unlinked key pickup, duplicate and whitespace-normalized keys, character-isolated keyrings, key-card visibility, key unlocks without rolls, key reuse, stale key and container requirements, already-unlocked containers, final-key deletion settings, GM menu pagination and mutations, pruning, clear-all configuration preservation, restart persistence, and GM Notes preservation.

Known limitations:

- Keyring data intentionally lives in `state.LootManager.keys`; deleting Roll20 Mod state outside LootManager removes those keyrings. `!loot keys prune` normalizes safely migratable records and removes only missing-character, empty, and malformed records; it does not remove keys simply because a character has no current token or is inactive.

## 2026-08-02 - Name-based handout loot integration

### HandoutAccess 1.1 and LootManager 1.2

Files: `HandoutAccess1.1.js`, `LootManager1.2.js`

Problem or goal:

- Allow token GM Notes loot blocks to name a handout directly and grant the clicking player access when that handout is taken, without exposing handout IDs or modifying Beacon inventory.

Changes:

- HandoutAccess 1.1 adds the synchronous `HandoutAccess.revealByReference(handoutReference, recipientReference, options)` public API. It reuses the existing exact case-insensitive, trimmed handout resolver, including duplicate-name rejection, and preserves the existing recipient, permission, link, announcement, and `reveal`/`hide` behavior.
- LootManager 1.2 recognizes `handout: Handout Name` records in the existing `LOOT` parser and serializer. Each line has source-order identity for stale-button validation and appears as a separate `Take and Read` card button.
- On a valid click, LootManager re-reads and validates the source record, calls HandoutAccess for `msg.playerid` with `announce: true`, then removes only that line using the existing GM Notes writer. Items, gp, fields, invalid preserved lines, and GM Notes outside the block remain unchanged.
- Locked containers keep handout names hidden. Handouts count as available loot for delete-when-empty and use the existing item pickup sound and Loot Taken announcement after a verified successful source update.
- HandoutAccess failures, missing dependencies, missing names, duplicate names, and stale buttons leave the source entry intact. If permission is granted but the GM Notes rewrite cannot be verified, LootManager reports the partial success without sound or pickup announcement.

Compatibility:

- Replace active `HandoutAccess1.0.js` with `HandoutAccess1.1.js` and active `LootManager1.1.js` with `LootManager1.2.js`. The unchanged prior builds are archived at `Scripts/Prior Versions/HandoutAccess1.0.js` and `Scripts/Prior Versions/LootManager1.1.js`.
- Existing HandoutAccess commands, ID-based API callers, LootManager commands, token classifications, item entries, fixed and inline gp, container settings, sounds, Beacon gp handling, and GM Notes encoding remain compatible.
- Load HandoutAccess before LootManager, or ensure it is available before a player takes a handout. No StateWipe, migration, macro replacement, or Beacon inventory change is required.

Validation performed:

- JavaScript syntax validation with Node.js for both revised scripts.
- Mocked Roll20 integration coverage for name and ID resolution, case-insensitive lookup, missing and duplicate names, already-granted access, permission preservation, mixed loot preservation, multiple handouts, stale buttons, locked-container privacy, missing dependency, missing and duplicate handout failures, delete-when-empty, and permission-granted/GM-Notes-write-failure behavior.

Known limitation:

- HandoutAccess grants permission before LootManager writes the consumed source line. If that GM Notes write fails, the player retains access while the physical handout entry remains; the scripts report this partial success and do not claim atomic rollback.

## 2026-08-02 - Defeated-token turn order and Bar 1 presentation

### TokenTriggers 1.3.2

File: `TokenTriggers1.3.2.js`

Problem or goal:

- Remove defeated ordinary enemies from initiative without removing AE-registered PCs or Allies, and hide the numerical HP bar while the HP-zero presentation is active.

Changes:

- Uses the existing read-only `ActionEconomyV2API.isFriendlyToken(token)` method to protect AE-registered PCs and Allies. TokenTriggers does not read AE state or maintain a duplicate classification registry.
- After a valid initial HP-zero activation, removes every turn-order entry matching only the defeated non-friendly token ID while preserving custom entries, all other entry properties, and relative order.
- Leaves turn order unchanged and logs a concise token-specific warning if the AE API is unavailable, throws, or returns a non-boolean result.
- Stores the original Bar 1 value, maximum, and blank-state flags in the existing token-specific HP-zero runtime, then defers clearing `bar1_value` and `bar1_max` to the next task so current damage listeners can finish processing the original numeric transition.
- On sandbox startup, backfills any missing Bar 1 snapshot fields in active pre-1.3.2 HP-zero runtimes and reschedules their corpse Bar 1 clear, covering both in-place upgrades and a reload before the deferred clear executes.
- Repeated non-positive writes while defeated are reblanked without rerunning the HP-zero presentation, classification, or turn-order removal.
- Blank-to-positive Bar 1 transitions now enter the existing recovery path. The current positive value is preserved, a current valid maximum is preserved, and the stored maximum is restored only when TokenTriggers left the current maximum blank.
- Bar 1 restoration occurs even when automatic side/layer restoration is disabled; all existing side, size, rotation, layer, `toBack`, `toFront`, sound, FX, and runtime cleanup behavior remains intact.

ActionEconomyV2 review:

- The active `ActionEconomyV2.8.2.js` already stores PC and Ally registrations by represented character ID and exposes `ActionEconomyV2API.isFriendlyToken(token)`.
- No ActionEconomyV2 source or version change was required.

Preserved behavior:

- The object-layer targetable corpse presentation, dead side, 1.25 scale, randomized rotation, sound, FX, LootManager targeting, original presentation restoration, Bloodied, Relentless Endurance, commands, registrations, public APIs, other token bars, character linkage, and token GM Notes remain unchanged.
- LootManager and Bar 1 link configuration are not modified. TokenTriggers does not call Beacon sheet-write APIs for the Bar 1 presentation.

Compatibility:

- Replace active `TokenTriggers1.3.1.js` with `TokenTriggers1.3.2.js`; the unchanged prior build is archived at `Scripts/Prior Versions/TokenTriggers1.3.1.js`.
- Keep `ActionEconomyV2.8.2.js` installed so TokenTriggers can classify protected combatants. If AE or its API is unavailable, turn-order removal fails safe and the rest of the death presentation continues.
- Existing TokenTriggers and AE registrations are reused without migration or reconfiguration.
- No StateWipe, re-registration, LootManager change, or macro replacement is required.

Validation performed:

- JavaScript syntax validation with Node.js.
- Loaded the complete active ActionEconomyV2 2.8.2 script in a mocked Roll20 runtime and confirmed four PC, Ally, unregistered, and unrepresented `isFriendlyToken` results.
- A 75-assertion mocked TokenTriggers runtime covered ordinary enemies, PCs, Allies, non-friendly AE Features, unrepresented active-path tokens, duplicate and custom turn-order entries, current-turn removal, classification failure, Bar 1 deferral and re-entrancy, blank-maximum and new-maximum recovery, death/recovery/death, Bars 2-4, LootManager invariants, Relentless Endurance, Bloodied, and malformed turn-order data.
- A focused seven-assertion persisted-runtime mock confirmed ready-time rescheduling, 1.3.1 snapshot backfill, full Bar 1 clearing, positive-value preservation, stored-maximum restoration, and runtime cleanup.
- Final read-only Roll20 reviewer pass completed after implementation.

Known limitations:

- Existing TokenTriggers setup and registration remain character-scoped, so a token with no represented character cannot be registered through the current setup menu. The new classification/removal path nevertheless treats an unrepresented token as non-friendly when a valid HP-zero activation reaches it.
- Turn-order removal naturally fires Roll20's campaign turn-order change event; ActionEconomyV2 then processes the newly exposed turn using its existing behavior.
- Bar 1 link configuration is intentionally preserved as requested. Roll20 may propagate direct token Bar 1 value/maximum writes through a linked bar; this cannot be verified in the mocked API runtime and should be checked with the campaign's linked Beacon-token configuration before rollout.
- `HPManager1.1.js` derives its `full` set amount from the token's current `bar1_max`; while the defeated presentation intentionally blanks that maximum, its `full` shortcut resolves to zero. Numeric positive healing, Beacon synchronization, and direct positive Bar 1 updates still enter TokenTriggers restoration normally.

## 2026-08-01 - Targetable background corpse presentation

### TokenTriggers 1.3.1

File: `TokenTriggers1.3.1.js`

Problem or goal:

- The existing `moveToMapLayer` HP-zero presentation moved dead enemies to Roll20's Map & Background layer, preventing players from supplying the corpse token ID through LootManager's `@{target|...}` workflow.

Changes:

- Reinterpreted the existing enabled `moveToMapLayer` option without renaming its command or stored field: the dead token is enlarged and rotated as before, placed on the `objects` layer, and sent behind other object-layer tokens with `toBack(token)`.
- Added guarded `toBack(token)` failure handling so the dead-side, size, rotation, and targetable Objects-layer placement remain applied while the GM receives a concise warning.
- Restoration still returns the original side, width, height, rotation, and layer. Restored object-layer tokens are then brought to the front with guarded `toFront(token)` handling; non-object original layers are restored without being forced to `objects`.
- Updated setup, registry, and validation wording to describe the option as `Background Corpse Presentation` while preserving `!tokentrigger maplayer TOKEN_ID on/off` and `moveToMapLayer` state compatibility.
- Updated the built-in HP-zero presentation test to use the same restoration helper as live and manual restoration.

Preserved behavior:

- HP-zero detection, duplicate prevention, dead-side selection, sound, FX, the 1.25 corpse scale, randomized rotation, runtime cleanup, Bloodied, Relentless Endurance, commands, public APIs, token bars, character linkage, token GM Notes, and all cross-script ownership remain unchanged.
- LootManager and its universal macro were not modified.

Compatibility:

- Replace active `TokenTriggers1.3.js` with `TokenTriggers1.3.1.js`; the unchanged prior build is archived at `Scripts/Prior Versions/TokenTriggers1.3.js`.
- Existing registrations and `state.TokenTriggers` data are reused without migration or reconfiguration.
- No StateWipe, LootManager change, macro replacement, or registration migration is required.

Validation performed:

- JavaScript syntax validation with Node.js.
- Mocked Roll20 runtime tests covered HP-zero activation, dead side, sound and FX calls, 1.25 scaling, randomized rotation, Objects-layer placement, `toBack`, targetability prerequisites, positive-HP restoration, non-object original-layer restoration, duplicate zero transitions, healing and death again, `toBack` and `toFront` failures, and Bloodied/Relentless Endurance regression behavior.
- Final read-only Roll20 reviewer pass completed after implementation.

Known limitations:

- Roll20 does not expose a stable arbitrary Z-order index, so revived object-layer tokens are intentionally brought to the front rather than restored to an exact former stack position.
- A corpse sent behind other tokens may require clicking an exposed portion or using Roll20's target-selection behavior.

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
