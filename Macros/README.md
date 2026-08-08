# Roll20 macro and command reference library

This index represents every active `.js` file directly under `Scripts/`, in the installation order recorded by the current Command-and-API Registry. `Scripts/Prior Versions`, `Scripts/Un-grouped`, historical upload batches, and tests are intentionally excluded. Each linked file was built against the active source parser; embedded help was used only as a secondary check.

## Active-script index

| # | Reference | Active filename / represented version | Primary command prefix | Complexity classification | Audience | Reference style |
|---:|---|---|---|---|---|---|
| 1 | [GroupInitiative](./GroupInitiative0.9.42.md) | `GroupInitiative0.9.42.js` / 0.9.42 | `!group-init`, `!group-init-config` | high-variance command system | player-facing + GM/admin | command-system reference |
| 2 | [SimpleSound](./SimpleSound.md) | `SimpleSound.js` / 0.2.1 | `!splay`, `!sstop`, `!swhisper` | branching command script | player-usable | command list |
| 3 | [TokenMod](./TokenMod.md) | `TokenMod.js` / 0.8.88 | `!token-mod` | high-variance command system | player-facing + GM/admin | command-language reference |
| 4 | [ScriptCards](./ScriptCards.md) | `ScriptCards.js` / 3.0.23d | `!scriptcards`, `!scriptcard`, `!script`, `!sc-*` | embedded command/scripting language | player-facing + administrative/generated | command-language reference |
| 5 | [MathOps](./MathOps.md) | `MathOps.js` / 1.0.8 | `{& math ...}` meta operation | embedded command/scripting language | player-usable meta tool | command-language reference |
| 6 | [Plugger](./Plugger.md) | `Plugger.js` / 1.0.10 | `{& eval ...}`, `{& plug ...}` | embedded command/scripting language | player-usable meta tool | command-language reference |
| 7 | [libTable](./libTable.md) | `libTable.js` / 1.0.0 | none | simple command script (no chat command) | no direct commands | public-API context only |
| 8 | [Muler](./Muler.md) | `Muler.js` / 2.0.3 | `{& mule ...}`, `{& get ...}`, `{& set ...}`; `!mulerconfig` | embedded command/scripting language | player-facing + configuration | command-language reference |
| 9 | [SelectManager](./SelectManager.md) | `SelectManager.js` / 1.1.9 | `!forselected`, `{& selectmanager ...}` | branching command script | player-facing + configuration/generated | command-system reference |
| 10 | [VectorMath](./VectorMath.md) | `VectorMath.js` / version not declared | none | simple command script (no chat command) | no direct commands | public-API context only |
| 11 | [MatrixMath](./MatrixMath.md) | `MatrixMath.js` / version not declared | none | simple command script (no chat command) | no direct commands | public-API context only |
| 12 | [libInline](./libInline.md) | `libInline.js` / 1.0.6 | none | simple command script (no chat command) | no direct commands | public-API context only |
| 13 | [PathMath](./PathMath.md) | `PathMath.js` / 1.7 | `!pathInfo`, `!pathToUDLWindow` | branching command script | player-usable diagnostics/utilities | command list |
| 14 | [checkLightLevel](./checkLightLevel.md) | `checkLightLevel.js` / 0.5.0 | `!checklight` | simple command script | GM diagnostic | command list |
| 15 | [libTokenMarkers](./libTokenMarkers.md) | `libTokenMarkers.js` / 0.1.2 | none | simple command script (no chat command) | no direct commands | public-API context only |
| 16 | [Messenger](./Messenger.md) | `Messenger.js` / 1.0.2 | none | simple command script (no chat command) | no direct commands | public-API context only |
| 17 | [SmartAoE](./SmartAoE0.30.1.md) | `SmartAoE0.30.1.js` / 0.30.1 | `!smartaoe`, `!smartapply`, `!smart*` | high-variance command system | player-facing + generated/admin | command-system reference |
| 18 | [DoorSounds](./DoorSounds1.0.1.md) | `DoorSounds1.0.1.js` / 1.0.1 | `!doorsound` | branching command script | GM/admin | command list |
| 19 | [Fetch](./Fetch.md) | `Fetch.js` / header 2.2.1, runtime 2.2.0 | Fetch object/property substitutions; `!fetchconfig`, `!fetchprops*` | embedded command/scripting language | player-facing meta tool + GM diagnostics | command-language reference |
| 20 | [TurnMarker](./TurnMarker1.md) | `TurnMarker1.js` / 1.3.12 | `!tm`, `!turnmarker`, `!eot`, `!pot` | branching command script | player turn controls + GM config | command-system reference |
| 21 | [APILogic](./APILogic.md) | `APILogic.js` / 2.0.9 | `{& if ...}`, `{& define ...}` | embedded command/scripting language | player-usable meta tool | command-language reference |
| 22 | [ActionEconomyV2](./ActionEconomyV2.9.0.md) | `ActionEconomyV2.9.0.js` / 2.9.0 | `!ae` and specialized `!ae-*` | high-variance command system | player-facing + GM/admin/generated | command-system reference |
| 23 | [ZeroFrame](./ZeroFrame.md) | `ZeroFrame.js` / 1.2.4 | `!0`, meta-operation loop | embedded command/scripting language | player-facing meta tool + configuration | command-language reference |
| 24 | [SaveEffects](./SaveEffects1.3.2.md) | `SaveEffects1.3.2.js` / 1.3.2 | `!se` | high-variance command system | player-usable | command-system reference |
| 25 | [MetaScriptToolbox](./MetaScriptToolbox.md) | `MetaScriptToolbox.js` / 0.0.2 | none | simple command script (no chat command) | no direct commands | dependency/API context only |
| 26 | [Executioner](./Executioner1.0.1.md) | `Executioner1.0.1.js` / 1.0.1 | `!executioner` | branching command script | player-usable | command list |
| 27 | [HPManager](./HPManager1.1.1.md) | `HPManager1.1.1.js` / 1.1.1 | `!hp` | branching command script | player-usable; ungated admin menu | command list |
| 28 | [Auras](./Auras.md) | `Auras.js` / version not declared | `!aura` | simple command script | player-usable | command list |
| 29 | [AttackDamageResolver](./AttackDamageResolver1.3.2.md) | `AttackDamageResolver1.3.2.js` / 1.3.2 | `!adr` | high-variance command system | player-usable + generated/admin-labelled | command-system reference |
| 30 | [SpawnDefaultToken](./SpawnDefaultTokenV1.1.2.md) | `SpawnDefaultTokenV1.1.2.js` / filename 1.1.2, runtime 0.26.2 | case-sensitive `!Spawn` | high-variance command system | player-usable + integration/generated | command-system reference |
| 31 | [Dismiss](./Dismiss.md) | `Dismiss.js` / version not declared | `!dismiss` | simple command script | player-usable | command list |
| 32 | [AoEBoom](./AoEBoom1.1.3.md) | `AoEBoom1.1.3.js` / 1.1.3 | `!boom` | high-variance command system | player-usable + generated | command-system reference |
| 33 | [MapChange](./MapChange1.8.1.md) | `MapChange1.8.1.js` / 1.8.1 | `!mapchange`, `!mc` | branching command script | player-facing + GM/admin | command-system reference |
| 34 | [TokenActionBuilder](./TokenActionBuilder0.4.0.md) | `TokenActionBuilder0.4.0.js` / 0.4.0 | `!tab` | high-variance command system | player-usable builder | command-system reference |
| 35 | [Audit](./Audit.md) | `Audit.js` / version not declared | `!stateaudit` | branching command script | GM diagnostic | command list |
| 36 | [StateWipe](./StateWipe1.1.0.md) | `StateWipe1.1.0.js` / 1.1.0 | `!statelist`, `!statewipe` | branching command script | GM administrative | command list |
| 37 | [BeaconAttributeTester](./BeaconAttributeTester1.0.1.md) | `BeaconAttributeTester1.0.1.js` / 1.0.1 | `!btest` | branching command script | GM diagnostic/testing | command list |
| 38 | [DoorControl](./DoorControl.md) | `DoorControl.js` / version not declared | `!doorctl` | simple command script | GM administrative | command list |
| 39 | [TokenTriggers](./TokenTriggers1.3.4.md) | `TokenTriggers1.3.4.js` / 1.3.4 | `!tokentrigger` | branching command script | GM setup/admin/testing | command-system reference |
| 40 | [TokenAnimator](./TokenAnimator1.3.1.md) | `TokenAnimator1.3.1.js` / 1.3.1 | `!tokenanimator`, legacy `!tokensize` | branching command script | GM utility | command-system reference |
| 41 | [HandoutAccess](./HandoutAccess1.1.md) | `HandoutAccess1.1.js` / 1.1 | `!handout` | branching command script | GM administrative | command list |
| 42 | [TargetReport](./TargetReport1.0.md) | `TargetReport1.0.js` / 1.0 | `!targetreport`, `!tr` | simple command script | player-facing with access checks | command list |
| 43 | [LootManager](./LootManager1.3.1.md) | `LootManager1.3.1.js` / 1.3.1 | `!loot` | branching command script | player-facing + GM configuration/key admin | command-system reference |

## Common Roll20 references

### Actual selection versus a selected-token substitution

These are different mechanisms:

- “Actual selection required” means the script reads `msg.selected`; select one or more tokens in the Roll20 UI before running the macro. Typing `@{selected|token_id}` does not manufacture `msg.selected`.
- `@{selected|token_id}` resolves to the ID of one selected token and is useful only when the command parser accepts an explicit token-ID argument.
- `@{target|Target|token_id}` opens a targeting prompt and resolves to one target token ID. Change `Target` to a helpful prompt label.
- A literal `TOKEN_ID` is the Roll20 object ID copied from an appropriate source or generated command.

```text
@{selected|token_id}
@{target|Target|token_id}
TOKEN_ID
```

### Character and display references

`@{selected|character_id}` resolves the represented character ID, not the graphic token ID. Use it only where a command explicitly requests `CHARACTER_ID`. `@{selected|token_name}` resolves the selected token’s displayed name and is useful only in a text/name field; it cannot replace a token ID.

```text
@{selected|character_id}
@{selected|token_name}
```

An unrepresented token has no usable selected `character_id`. Beacon sheet commands generally require a represented character, while some token-bar utilities explicitly support unlinked NPC tokens.

### Escaping nested macros and menu buttons

Roll20 parses queries, attribute references, templates, and API buttons in layers. When one is nested inside a query, ability, or generated button, escape structural characters at the layer that would otherwise consume them:

```text
@ = &#64;
{ = &#123;
} = &#125;
| = &#124;
```

Do not escape ordinary top-level commands mechanically. ScriptCards, the meta-script toolchain, SmartAoE, TokenMod, and other command languages have additional separator/escaping rules documented in their own references.

## Maintenance and verification status

Update this library whenever an active script’s command parser, aliases, permission gate, selection model, option grammar, generated command, public integration contract, or filename/version changes. Update the Command-and-API Registry in the same revision when its contract changes.

The source reconciliation found several intentional or actionable differences that should not be hidden by the embedded help:

- `Fetch.js` declares header version 2.2.1 but runtime/API metadata 2.2.0.
- `SpawnDefaultTokenV1.1.2.js` has filename version 1.1.2 but runtime version 0.26.2; several header/help options are blocked or misspelled by the active whitelist and are marked in its reference.
- SaveEffects `damageone` reads `--source` but cannot resolve literal `spell` DC because that branch passes no source to its DC resolver; its `selected` condition route parses an unused `--adept`.
- ActionEconomy’s admin-labelled menus are mostly not permission gates; only `setup` and `registry` enforce GM status. Several explicit-ID core routes also require an otherwise-unused actual selection because of their shared parser guard.
- ADR and AoEBoom implement pathways omitted by their embedded help; those source-only pathways are included in their references.
- PathMath `!pathInfo` is not purely read-only: it creates a red path clone while logging geometry.
- Some current custom utilities intentionally have no GM/controller check, including destructive or state-changing operations; each file records the source-authoritative permission behavior.

The following cannot be proved from static source and requires live Roll20 verification: currently installed marker/track/default-token assets; Beacon attribute availability and async synchronization; current campaign pages, handouts, rollable tables, and configured abilities; token/path/door formats; meta-operation ordering with equal priorities; dynamic-lighting behavior; turn-order UI effects; and cross-script event deduplication under real campaign timing.
