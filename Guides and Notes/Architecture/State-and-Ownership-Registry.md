# State and Ownership Registry

## Global Rules

Token-bar ownership is fixed: bar 1 HP, bar 2 temporary HP, bar 3 ActionEconomy movement, bar 4 AC. General utilities may read or mutate bars when explicitly commanded, but that capability does not transfer mechanical ownership. Beacon sheet values use asynchronous `getSheetItem(characterId, name)` and `setSheetItem(characterId, name, value)`; unlinked NPC values may exist only in token bars.

Rows follow the installed order in the [Command and API Registry](Command-and-API-Registry.md).

## Active State, Bar, and Beacon Inventory

| # | Active file | State namespace/key structure | Token bars and Beacon access | Ownership notes |
|---:|---|---|---|---|
| 1 | `GroupInitiative0.9.42.js` | Computed `state.GroupInitiative`: schema/config, stat groups, stacks, roller/sorter settings, saved turn orders | No Beacon bar ownership | Owns initiative configuration and saved-order token cleanup; custom turn-order entries remain. |
| 2 | `SimpleSound.js` | `state.simpleSound`: version and whisper setting | None | Owns sound utility configuration. |
| 3 | `TokenMod.js` | `state.TokenMod`: schema/config/help/global-config cache; reads `state.TheAaron` help preference | Can generically mutate bars 1–4, links, and default tokens; no Beacon API use | Mechanism only; does not own HP, temp HP, movement, or AC semantics. |
| 4 | `ScriptCards.js` | Computed `state.ScriptCards`: schema/config, stored variables/settings/strings/snippets, triggers | Generic scripted bars 1–4 and generic `getSheetItem`/`setSheetItem` | General engine; invoked mechanics retain their owners. |
| 5 | `MathOps.js` | `state.MathOps` schema/logging plus shared `state.torii` signature data | None | Owns math meta-operation configuration. |
| 6 | `Plugger.js` | `state.Plugger` schema/logging plus `state.torii` | None | Owns registered meta-script plugin rules. |
| 7 | `libTable.js` | `state.libTable` schema plus `state.torii` | None | Table lookup cache/configuration only. |
| 8 | `Muler.js` | `state.Muler` settings/defaults/schema plus `state.torii` | No fixed bar/Beacon ownership | Owns mule-variable meta settings. |
| 9 | `SelectManager.js` | `state.SelectManager` settings/defaults/schema plus `state.torii` | None | Owns preserved/injected message context. |
| 10 | `VectorMath.js` | No persistent state found | None | Stateless geometry library. |
| 11 | `MatrixMath.js` | No persistent state found | None | Stateless transform library. |
| 12 | `libInline.js` | Shared `state.torii` signature data only | Parses roll data; no ownership | Stateless inline-roll interface apart from shared logging signature. |
| 13 | `PathMath.js` | No persistent state found | No Beacon bars | Stateless path geometry library. |
| 14 | `checkLightLevel.js` | No persistent state found | Reads token/page lighting properties, not Beacon bars | Owns lighting-query logic only. |
| 15 | `libTokenMarkers.js` | `state.libTokenMarkers`: schema/version | Reads campaign token-marker registry | Owns marker lookup metadata. |
| 16 | `Messenger.js` | `state.Messenger` settings/defaults/schema plus `state.torii` | None | Owns shared chat UI configuration. |
| 17 | `SmartAoE0.30.1.js` | Computed `state.SmartAoE`: schema/version and AoE link records | Configured apply actions may alter token properties; no fixed bar ownership or Beacon calls | Owns AoE geometry/link state and local graphic/path/page cleanup. |
| 18 | `DoorSounds1.0.1.js` | `state.DoorSounds`: groups, doors, config, initialized flag, version | None | Owns door-to-sound registry and door-record cleanup. |
| 19 | `Fetch.js` | `state.Fetch` settings/defaults/schema plus `state.torii` | Generic Roll20 object/property access; its local synchronous `getSheetItem` reads legacy attribute objects and is not Beacon `getSheetItem` | Owns fetch configuration, not fetched mechanics. Do not route Beacon values through this helper. |
| 20 | `TurnMarker1.js` | `state.TurnMarker`: schema, announcements, pull/skip, marker/animation/aura settings | Uses bar 1 rotation and bar 2 round count on its dedicated marker token; not character HP/temp HP | Owns marker/turn presentation state. |
| 21 | `APILogic.js` | `state.APILogic` schema/logging plus `state.torii` | None | Owns conditional/loop meta-operation state. |
| 22 | `ActionEconomyV2.8.3.js` | `state.ActionEconomyV2`: economy, movement, attacks, conditions/effects, mounts, modifiers, saves, hazards, summons, visuals, terrain, sizes, damage sources, pending records | Reads/writes bars 1–2 for owned support/fallback paths; owns bar 3; Beacon helpers plus explicit `hp`, `hp_temp`, `spell_save_dc`, `speed`, `initiative_bonus`, and `user.*` values | Owns all AE mechanics and schema-aware token/character orphan cleanup, not general damage application. |
| 23 | `ZeroFrame.js` | `state.ZeroFrame`: schema/config/loop order plus `state.torii` | None | Owns meta-operation orchestration state. |
| 24 | `SaveEffects1.3.2.js` | `state.SaveEffects.sources`, keyed by source/player context | Save damage reads/writes bars 1–2 and HP max; after the TokenTriggers resolution, it writes the returned Bar 1 result and represented Beacon `hp`; Beacon `hp_temp`, HP max, and generic async save/skill reads | Owns saves, save-based damage, and source cleanup, not AE effects. |
| 25 | `MetaScriptToolbox.js` | `state.MetaScriptToolbox` schema plus `state.torii` | None | Owns meta-tool utility configuration only. |
| 26 | `Executioner1.0.1.js` | `state.Executioner[tokenId].form` | No bars/Beacon | Owns weapon-form selection and token-record cleanup. |
| 27 | `HPManager1.1.1.js` | `state.HPManager` | Owns healing/direct bar 1 writes; Beacon `hp` for represented characters | Healing must not trigger concentration saves. |
| 28 | `Auras.js` | No persistent state found | Writes token aura properties; no Beacon | Owns aura controls only. |
| 29 | `AttackDamageResolver1.3.2.js` | `state.AttackDamageResolver`: target memory, slots, last turn/attack, undo; module damage cache | Owns damage/undo bars 1–2, resolves provisional Bar 1 damage through TokenTriggers, and mirrors the returned final `hp`/`hp_temp` values to represented Beacon tokens | Owns attack/damage state and persistent token-reference cleanup; the nonpersistent player damage cache is not pruned as a graphic store. |
| 30 | `SpawnDefaultTokenV1.1.2.js` | No persistent state found | Can copy/override bars 1–3 and links; no Beacon calls | Spawning mechanism; callers own meaning. |
| 31 | `Dismiss.js` | No persistent state found | Deletes addressed token | Token cleanup utility only. |
| 32 | `AoEBoom1.1.3.js` | `state.AoEBoom.templates`, keyed by template/path identity | No bar ownership; reads Beacon `spell_save_dc` | Owns AoE geometry/template state and graphic/path/page cleanup. |
| 33 | `MapChange1.8.1.js` | `state.MapChange`: version/config, blocked players, public/private/archive/hidden maps, rejoin data | No fixed bar/Beacon ownership | Owns page-access and return-location state; pruning preserves configuration. |
| 34 | `TokenActionBuilder0.4.0.js` | No persistent state found | None | Owns generated ability definitions only. |
| 35 | `Audit.js` | No owned state; reads configured roots | Read-only | Historical/current state reporting only. |
| 36 | `StateWipe1.1.0.js` | No owned state; coordinates owner fallback pruning and separately deletes configured whole roots | No bars/Beacon | Destructive whole-root utility and non-destructive orphan coordinator, not a migration mechanism. |
| 37 | `BeaconAttributeTester1.0.1.js` | `state.BeaconAttributeTester.snapshots` | Generic named `getSheetItem`/`setSheetItem`; may compare delayed values | Owns test snapshots and player/character cleanup only. |
| 38 | `DoorControl.js` | No persistent state found | Changes door open state | Door command utility; DoorSounds observes changes. |
| 39 | `TokenTriggers1.3.4.js` | `state.TokenTriggers`: character configurations, token runtime, version, last active token; short-lived transition deduplication is nonpersistent | Owns threshold reactions/presentation on bar 1, including HP-zero restore and Relentless setting HP to 1; no direct Beacon calls | Owns reactions and explicit/native transition deduplication, including last-active-token cleanup, not damage. ADR/SE pass only token and old/new HP through the generic API. |
| 40 | `TokenAnimator1.3.1.js` | `state.TokenAnimator.tokens[tokenId]` baselines/version; safely migrates then removes legacy `state.TokenSizeAnimator` | No bars/Beacon | Owns animation baseline/lifecycle. |
| 41 | `HandoutAccess1.1.js` | No persistent state found | None | Owns handout access only. |
| 42 | `TargetReport1.0.js` | No persistent state found | Reads bar 1 HP/max and bar 4 AC; generic Beacon target attributes | Read-only report; no ownership transfer. |
| 43 | `LootManager1.3.1.js` | `state.LootManager`: config/version/character keyrings; loot serialized in token GM notes | No owned bars; Beacon `gp` read/write and `sleight_of_hand_bonus` read | Owns loot, keys, containers, and currency workflow; character cleanup preserves config. |

## Cross-Script State Rules

## 2026-08-07 Orphan-state lifecycle contract

`PersistentStateManager` (`StateWipe1.1.0.js`) owns registered fallback pruning: `!statewipe prune preview` reports `Will Remove` without mutation and `!statewipe prune` applies idempotent removal. Owner pruners return `{ removed: [path] }`; unavailable expected owners are visibly reported rather than causing root deletion. Owners call their local pruners immediately on matching Roll20 destroy events, so lifecycle cleanup does not depend on the coordinator. Live campaign configuration, AE character registrations, and keyrings remain unless their owning Roll20 object is absent.

Revised active files: `GroupInitiative0.9.42.js`, `SmartAoE0.30.1.js`, `DoorSounds1.0.1.js`, `ActionEconomyV2.8.3.js`, `SaveEffects1.3.2.js`, `Executioner1.0.1.js`, `AttackDamageResolver1.3.2.js`, `AoEBoom1.1.3.js`, `MapChange1.8.1.js`, `StateWipe1.1.0.js`, `BeaconAttributeTester1.0.1.js`, `TokenTriggers1.3.4.js`, `TokenAnimator1.3.1.js`, and `LootManager1.3.1.js`.

- Never write another script's state namespace to reproduce its mechanics; call its documented API or command.
- Record pending cross-script work in the owning script only. AE owns pending summons/hazards and effect state; ADR owns damage undo/cache state; SE owns save-source state.
- Treat native Roll20 change handlers and explicit hooks as potentially concurrent. Record and test deduplication when both can process the same transition.
- A StateWipe operation is administrative and destructive. It is not a migration strategy unless explicitly authorized because safe migration is impossible.
