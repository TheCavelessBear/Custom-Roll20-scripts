# Handler and Inter-Script Communication Simplification Audit 1.0.0

**Date:** 2026-08-03  
**Scope:** Current individual `.js` files directly under `Scripts/` only  
**Method:** Read-only active-source trace, comparison with the current Architecture contracts, and execution of the unchanged local test ground

## Evidence Rules

This report treats active scripts as the authoritative record of current implementation, not as proof that the implementation is correct. It does not use archived scripts, Project-upload copies, or prior audits as evidence of current behavior.

Findings use these labels:

- **Confirmed by active code:** directly demonstrated by an active script, current Architecture contract, or unchanged executable test.
- **Requires verification:** source establishes part of the path, but Roll20 timing, Beacon synchronization, campaign configuration, permissions, or dynamic content is needed to establish the result.
- **Unsupported / do not recommend:** the active evidence does not justify the proposal, or it would violate established ownership without a demonstrated benefit.

## 1. Executive Conclusion

The architecture is **generally sound in ownership but moderately over-coupled in communication**. AE, ADR, SaveEffects, HPManager, AoEBoom, and TokenTriggers mostly retain the correct mechanical boundaries. The main risks are not excessive script count; they are missing or inconsistent public contracts, command-string relays where results matter, shared global helper names, and critical transitions observed by both explicit calls and native events.

The three highest-value simplification targets are:

1. **Implement the expected generic TokenTriggers compatibility API and one TokenTriggers-owned transition processor.** ADR and SaveEffects already attempt the feature-agnostic call `TokenTriggersAPI.processBar1Change(token, oldHp, newHp)`, but active TokenTriggers does not expose it. ADR and SaveEffects must not know which threshold features exist; TokenTriggers alone evaluates HP-zero, Bloodied, Relentless Endurance, and future threshold reactions.
2. **Eliminate the four confirmed shared-global helper overwrites among SaveEffects, HPManager, and ADR.** Active load order currently permits HPManager to replace SaveEffects' `replaceInlineRolls`, then ADR to replace `replaceInlineRolls`, `getAeModifiedDamage`, and `processTokenTriggersBar1Change`. Script-prefixed names or private scopes remove hidden load-order coupling without changing ownership.
3. **Replace result-sensitive owner command relays with narrow owner APIs in small phases.** The first candidates are SaveEffects/HPManager calls into AE-owned condition, concentration, and ongoing-effect operations, followed by AoEBoom's structured save/damage calls into SaveEffects. Human-authored macros and deliberately generic engines may continue using chat commands.

The current code does **not** support merging scripts, a central god script, a universal message bus, cross-script state replication, or feature-specific TokenTriggers logic in ADR or SaveEffects.

## 2. Current Integration Map

| Caller | Callee | Trigger | Interface | Data passed | State touched | Owner | Current local coverage |
|---|---|---|---|---|---|---|---|
| ADR | AE | Cached damage / attack | `ActionEconomyV2API.modifyDamageForTraits`, `recordDamageSource`, `processDamageResult`, attack/effect queries | Token objects/IDs, damage type/amount/tags, HP before/after | ADR state plus AE-owned damage-source/concentration/combat state | ADR owns damage; AE owns traits/concentration | Scenarios 02 and 04 cover damage, lethal handoff, and undo; live timing remains required |
| ADR | TokenTriggers | Bar 1 damage transition | Optional `TokenTriggersAPI.processBar1Change(token, oldHp, newHp)` | Token and numeric HP transition | Intended TokenTriggers threshold state | TokenTriggers | Harness currently confirms the API is absent; no explicit-hook behavior coverage yet |
| SaveEffects | AE | Save resolution, failed consequence, lethal save damage | Direct AE queries plus `!ae-effect`, `!ae-con`, `!ae-ongoing` relays and delayed `processDamageResult` | Save context, token/source IDs, condition/duration, HP transition | SaveEffects source state plus AE-owned state | SaveEffects owns saves; AE owns consequences | Scenario 05 covers damage handoff/ownership, not command-relay semantics |
| SaveEffects | TokenTriggers | Save-damage Bar 1 transition | Optional generic API | Token and numeric HP transition | Intended TokenTriggers threshold state | TokenTriggers | API absence is asserted; native TokenTriggers behavior covered separately |
| HPManager | AE | Lay on Hands / presentation | `!ae-con remove poisoned TOKEN`; `ActionEconomyV2API.isFriendlyToken` | Token ID or object | HPManager state; AE condition state through relay | HPManager owns healing; AE owns poisoned | Scenario 04 proves healing does not invoke AE damage processing; live relay still required |
| TokenTriggers | AE | Defeated-token turn-order decision | `ActionEconomyV2API.isFriendlyToken(token)` | Token object | TokenTriggers presentation/runtime; AE state read only | TokenTriggers owns thresholds; AE owns classification | Core TokenTriggers scenarios cover Bar 1 outcomes; live classification/turn order required |
| AE | SaveEffects | Saves, ongoing damage, hazards, AoEs, disarm | `SaveEffectsAPI.rollSave(config)` plus `!se damageone`, `!se damagebatch`, `!se save`, and `!se check` relays | Target token/IDs, save/DC, damage, conditions, source, hooks | AE owner state; SaveEffects save execution | SaveEffects owns save resolution | Direct API load contract only; relay behavior/live feature paths required |
| AoEBoom | SaveEffects | `!boom burst` / template apply | `sendChat('!se damagebatch ...')`, `sendChat('!se save ...')` | Serialized save/DC/damage/targets/hooks | AoEBoom template state, then SaveEffects/AE state | AoEBoom owns geometry; SaveEffects owns saves | Load only; geometry and relay are live-only |
| AoEBoom | AE | Concentration summon / directional hazard | `addPendingSummon`, `addPendingDirectionalHazard` | Caster/spawn IDs/names and structured options | AE pending summon/hazard state | AE | API presence only |
| AoEBoom | SpawnDefaultToken | Apply ability `!Spawn` line | `spawnAtXY(options)` | Name/page/layer/position/size/side | Spawned token; no AoEBoom ownership transfer | SpawnDefaultToken mechanism | API presence only; callback/timing live-only |
| MapChange | SpawnDefaultToken | Return-token creation | `spawnAtXY(options)` | Character/token/page placement options | MapChange page state; spawned token | Separate owners | API presence only; live callback required |
| LootManager | HandoutAccess | Handout loot claim | `revealByReference(...)` | Handout/player/character references | LootManager loot/key state; handout permissions | HandoutAccess owns access | API presence only; journal visibility live-only |
| ScriptCards | TokenMod | TokenMod mutation observer | `TokenMod.ObserveTokenChange(callback)` | Token and previous properties | ScriptCards trigger state | Generic mechanisms | Registration/load only; live observer ordering required |
| TurnMarker | GroupInitiative | External turn-order mutation | `ObserveTurnOrderChange(callback)` | Turn order | TurnMarker and GroupInitiative state | Separate initiative owners | API/load only; live UI/order required |
| Meta scripts | ZeroFrame | Ready-time registration | `ZeroFrame.RegisterMetaOp(handler, contract)` | Handler, priority, handled tags | Individual roots plus shared `state.torii` metadata | ZeroFrame owns ordering | Exact handler/API startup contracts only |
| DoorControl | DoorSounds | Door mutation | Native `change:door:isOpen` | Door object/previous state | DoorSounds registry/audio | Separate door-control and sound owners | Handler registration only; live door/audio required |

## 3. Required Current-Path Traces

### 3.1 ADR Damage, Temporary HP, Concentration, Undo, and AE

**Confirmed by active code**

1. ADR initializes `state.AttackDamageResolver` in its `ready` handler (`AttackDamageResolver1.3.js:3-9`) and captures attack/damage commands in the chat handler (`:15-139`).
2. `applyCachedDamage` (`:1206-1331`) validates target/cache/type, asks AE to modify each damage part (`:1261-1275`), records the source with AE (`:1278-1289`), and calls `applyDamageToToken` (`:1291-1295`).
3. `applyDamageToToken` (`:1420-1466`) snapshots Bars 1-2 for undo, consumes Bar 2 first, then Bar 1, and mirrors `hp_temp`/`hp` to represented characters with asynchronous `setSheetItem`.
4. ADR stores the undo record in `state.AttackDamageResolver.lastDamageUndo` (`:1297-1303`). `undoLastAdrDamage` (`:741-790`) restores Bars 1-2 and represented Beacon current/max HP/temp HP.
5. ADR explicitly calls `ActionEconomyV2API.processDamageResult` only when the observed post-application HP transition is positive-to-zero and an attacker exists (`:1305-1315`). AE owns concentration and death-related combat processing (`ActionEconomyV2.8.2.js:3002-3018`).
6. ADR attempts the generic TokenTriggers hook through `processTokenTriggersBar1Change` (`AttackDamageResolver1.3.js:1403-1417`), but active TokenTriggers does not publish the named API. ADR currently ignores the wrapper's numeric return at `:1463-1464`.

**Requires verification**

- AE also listens to native Bar 1 decreases (`ActionEconomyV2.8.2.js:9143+`). Live Roll20 ordering determines whether the explicit ADR call, native event fallback, or both observe one transition.
- ADR writes Beacon HP before the intended TokenTriggers hook (`AttackDamageResolver1.3.js:1459-1464`). The effect of a TokenTriggers-resolved final HP on a linked Beacon sheet cannot be established until the generic API is restored and live timing is tested.

### 3.2 SaveEffects Resolution, Damage, and AE Handoff

**Confirmed by active code**

1. SaveEffects initializes `state.SaveEffects.sources` (`SaveEffects1.3.js:1-4`, `:469-485`) and handles `!se` in its chat route (`:198+`).
2. Save roll paths obtain AE-owned modifiers, save-damage features, condition immunity, and damage traits through guarded `ActionEconomyV2API` calls (`:1194-1239`, `:1698-1714`).
3. `seApplyDamageToToken` (`:1267-1322`) consumes Bar 2 before Bar 1 and awaits represented-character Beacon writes. It attempts the same generic TokenTriggers transition and uses the returned numeric HP before writing Beacon (`:1304-1314`).
4. `safelyNotifyAeDamageResult` (`:1134-1150`) schedules a guarded AE damage-result notification only for a supplied positive-to-zero transition.
5. Failed-save AE-owned consequences are delegated through AE commands, including concentration/effects (`:1021-1030`, `:1637-1639`), ongoing removal (`:575-595`), and condition removal (`:2224`). SaveEffects does not write AE state directly.
6. `SaveEffectsAPI.rollSave` validates target, save key, DC, and bonus and returns the save result asynchronously (`:1720-1812`).

**Simplification finding:** ownership is correct, but serialized AE command relays provide no structured return or direct error result. Narrow AE APIs can preserve the owner boundary with fewer parsing and scheduling points.

### 3.3 HPManager Healing and the No-Concentration Boundary

**Confirmed by active code**

- `setTokenHp` writes Bar 1 and calls `setSheetItem(characterId, 'hp', newHp)` for represented characters (`HPManager1.1.js:204-212`).
- `applyHealing` caps healing at Bar 1 maximum and never calls AE damage/concentration processing (`:278-310`).
- AE's `isFriendlyToken` is used only to choose public versus GM-only card detail (`:269-305`).
- Lay on Hands relays `!ae-con remove poisoned TOKEN` when at least five points are spent (`:246-266`); AE retains condition ownership.
- Scenario 04 proves healing caps HP and makes no `ActionEconomyV2API.processDamageResult` call.

**Requires verification:** `setSheetItem` is not awaited in HPManager, and `represents` is used as the only Beacon-write guard. Live linked/unlinked synchronization remains required.

### 3.4 HP Zero, TokenTriggers, PC/Ally Exceptions, and Generic Tokens

**Confirmed by active code**

- TokenTriggers owns the native Bar 1 listener and all threshold state (`TokenTriggers1.3.2.js:1400-1451`, `:2282-2287`).
- Tokens without `represents` are ignored (`:1400-1405`). Configured represented tokens may enter TokenTriggers-owned HP-zero presentation, Bloodied, or Relentless Endurance paths; no caller needs to know which feature caused the resolved result.
- AE classification is consulted only when TokenTriggers decides whether a defeated combatant may be removed from turn order (`:352-359`); it does not transfer threshold ownership to AE.
- TokenTriggers does not call Beacon APIs. It operates on Bar 1 and its own state.
- Scenario 03 separately exercises generic-unrepresented ignore behavior, ordinary represented HP-zero presentation, and Bar-1-only Relentless behavior.

**Requires verification:** player-facing PC/ally classification and actual turn-order changes; explicit-hook/native-event deduplication; represented-but-unlinked NPC expectations.

### 3.5 AoEBoom into SaveEffects and AE

**Confirmed by active code**

- AoEBoom owns template/path geometry and affected-token selection (`AoEBoom1.1.2.js:1131-1173`).
- Burst resolution serializes a SaveEffects batch command with save, DC, damage, type, success mode, target IDs, source, adept type, and hook strings (`:1175-1189`). Template condition application similarly routes to `!se save` (`:1200-1245`).
- Spawn apply lines call `SpawnDefaultToken.spawnAtXY` directly (`:993-1106`). Concentration summons and directional hazards call AE pending APIs directly (`:1033-1068`).
- Arbitrary non-spawn/non-FX ability lines are sent to chat unchanged (`:923-963`). Their destination depends on live character ability content.

**Simplification finding:** the structured AoEBoom-to-SaveEffects inputs are suitable for narrow SaveEffects APIs. Arbitrary GM-authored ability relays are an intentional extensibility surface and should be documented/tested, not replaced globally.

### 3.6 Linked Beacon Versus Unlinked/Generic Tokens

**Confirmed by active code**

- Bar assignments are fixed: Bar 1 HP, Bar 2 temporary HP, Bar 3 AE movement, Bar 4 AC.
- ADR, SaveEffects, and HPManager use nonempty `token.get('represents')` as the guard for Beacon writes; a token with no represented character remains bar-only.
- TokenTriggers ignores a generic token with no represented character.
- TargetReport reads Bars 1/4 and Beacon status values but does not mutate them.
- Scenario 06 proves the current represented fixture causes Beacon calls while an unrepresented NPC remains bar-only.

**Requires verification:** `represents` does not itself prove whether a Beacon token bar is linked. The smallest live test is one linked PC, one represented-but-unlinked NPC, and one generic token subjected to identical ADR, SaveEffects, and HPManager operations while recording token bars and sheet values.

### 3.7 Chat-Command Relays

This inventory covers each distinct executable relay class found in active source. Repeated help text, menu buttons, and ordinary chat-card output that merely contain command strings are not runtime dispatches and are not listed as relays.

| Source | Current relay | Destination | Classification | Simplification disposition |
|---|---|---|---|---|
| AE | `!ae-effect concentrate SOURCE` (`ActionEconomyV2.8.2.js:3285`) | AE itself | Confirmed | Replace with an internal function call; no public boundary needed |
| AE | `!token-mod --ids TOKEN --set currentside\|3` (`:3426`) | TokenMod | Confirmed | Later: direct token operation or a typed TokenMod API only if observer semantics are required |
| AE | `!splay Rage End` (`:3427`) | SimpleSound | Confirmed | Later: narrow sound API with explicit success/failure |
| AE | ongoing `!se damageone` (`:3333-3351`) | SaveEffects | Confirmed | Migrate to structured SaveEffects single-damage API with a result/error contract |
| AE | AoE hazard `!se damageone` or `!se save` (`:5036-5064`) | SaveEffects | Confirmed | Migrate both branches to structured SaveEffects APIs |
| AE | directional hazard `!se damagebatch` (`:5370-5386`) | SaveEffects | Confirmed | Migrate to structured SaveEffects batch API |
| AE | AE-owned AoE `!se save` / `!se damagebatch` (`:5754-5792`) | SaveEffects | Confirmed | Migrate to structured condition-save/batch APIs |
| AE | disarm `!se check ... --onFail !ae-disarm apply ...` (`:8177-8185`) | SaveEffects, then optional AE hook relay | Confirmed | Structured check API should retain the owner callback/hook contract explicitly |
| HPManager | `!ae-con remove poisoned TOKEN` (`HPManager1.1.js:265`) | AE | Confirmed | Replace with narrow AE condition-removal API |
| SaveEffects | `!ae-ongoing remove TOKEN EFFECT` (`SaveEffects1.3.js:592`) | AE | Confirmed | Replace with AE ongoing-removal API |
| SaveEffects | `!ae-effect concentrate SOURCE` (`:1022`, `:1638`) | AE | Confirmed | Replace with AE concentration API |
| SaveEffects | built AE condition command (`:1025-1030`) | AE | Confirmed | Replace with structured AE apply-condition API |
| SaveEffects | `!ae-con remove CONDITION TOKEN` (`:2224`) | AE | Confirmed | Replace with AE condition-removal API |
| AoEBoom | `!se damagebatch ...` (`AoEBoom1.1.2.js:1175-1189`) | SaveEffects | Confirmed | Replace after SaveEffects exposes a structured batch API |
| AoEBoom | template `!se save` / `!se damagebatch` (`:1200-1268`) | SaveEffects | Confirmed | Replace after SaveEffects exposes structured condition-save/batch APIs |
| AoEBoom | arbitrary ability action (`:923-963`) | Dynamic | Requires verification | Retain as documented GM-authored extension; do not guess destinations |
| ADR | `!adr targetcmdslot` and `!adr targetcmd` substituted commands (`AttackDamageResolver1.3.js:344-366`, `:564-586`) | Dynamic command chosen by caller | Confirmed generic utility | Retain but document as an intentional dynamic relay; validate leading `!` and target substitution |
| TokenTriggers | configured Bloodied/reverse command after `@@token`/`@@character`/`@@name` substitution (`TokenTriggers1.3.2.js:1087-1109`) | Dynamic configured owner command | Confirmed threshold-owned extension | Retain; test one-shot/reverse dedupe and invalid command handling in TokenTriggers |
| SaveEffects | configured `--onFail`, `--onSuccess`, `--onAny` hook after result substitution (`SaveEffects1.3.js:615-642`) | Dynamic configured command | Confirmed save-owned extension | Retain as an explicit hook surface; document execution count and failure isolation |
| SmartAoE | `!smarttrigger ...` (`SmartAoE.js:4697`) | SmartAoE itself | Confirmed | Internal-call candidate, but geometry/event behavior requires live regression coverage first |
| SelectManager | generated `!<trigger>` command (`SelectManager.js:854`) | Dynamic meta/API command | Confirmed generic mechanism | Retain; command fan-out is its purpose |
| ScriptCards | delayed `!script` resumption (`ScriptCards.js:4040`) | ScriptCards itself | Confirmed generic engine | Retain unless a source-backed defect appears |
| ScriptCards | character ability action (`ScriptCards.js:5388-5401`) | Dynamic ability-defined command | Confirmed generic engine | Retain; destination and permissions require live fixtures |
| SpawnDefaultToken | configured post-spawn character ability action (`SpawnDefaultTokenV1.1.2.js:1648-1667`) | Dynamic ability-defined command | Confirmed spawn extension | Retain; document whether spawn completion precedes the relay |
| ZeroFrame | stored batch command dispatch (`ZeroFrame.js:1138-1147`, `:1247-1256`) | Dynamic API/meta command | Confirmed meta orchestration | Retain; batching and dispatch are its purpose |
| TokenActionBuilder | generated ADR/SE/AE/SimpleSound abilities | User-invoked owner handlers | Confirmed indirect dependency | Retain; generated macro compatibility is the intended boundary |

## 4. Handler Inventory

The local manifest asserts exact source-attributed counts for the empty-fixture startup. The references below identify the active registration sites.

| Active script | Ready handlers | Chat handlers | Change/lifecycle handlers | Flag |
|---|---|---|---|---|
| GroupInitiative | ready `2250` | `handleInput` `2247` | Observer API, not native subscription | Retain |
| SimpleSound | ready `156` | `handleInput` `146` | None | Retain |
| TokenMod | `IsComputedAttr.DoReady` `1665`; main ready `4376` | `handleInput` `4372` | token-marker config `4373` | Two ready handlers are intentional but load-sensitive |
| ScriptCards | ready `1153` | static queue chat `1406`; conditional message-trigger chat `1206` | handout `1394`; conditional turn-order/dynamic events `1176-1219` | Dynamic registrations require live fixture coverage |
| MathOps | ready `329` | `handleInput` `328` | None | Registers with ZeroFrame |
| Plugger | ready `340`, plugin-rule ready `666` | `handleInput` `339` | None | Two ready handlers; exact order matters |
| libTable | ready `143` | None | None | Retain |
| Muler | ready `600` | `mulegetter` `598`, `mulesetter` `599`, `handleConfig` `630` | None | Multiple chat listeners intentionally partition meta routes |
| SelectManager | ready `1099` | `handleInput` `1097`, deferred `handleForSelected` `1098`, `handleConfig` `1129` | None | Deferred registration is timing-sensitive |
| VectorMath | None | None | None | Library only |
| MatrixMath | None | None | None | Library only |
| libInline | ready `337` | None | None | Library only |
| PathMath | None | anonymous chat `1583` | None | Geometry utility |
| checkLightLevel | ready `358` | `handleInput` `360` | None | Also registers a Plugger rule |
| libTokenMarkers | `checkInstall` `184` | None | None | Retain |
| Messenger | ready `639` | None | None | Library only |
| SmartAoE | ready `5912` | `smartAoE_handleInput` `5906` | graphic `5907`, graphic destroy `5908` | Overlaps generic graphic events by design |
| DoorSounds | `checkInstall` `552` | `handleInput` `553` | door-open `handleDoorChange` `554` | Native DoorControl handoff |
| Fetch | ready `1995` | `handleInput` `1990`, `handleConfig` `2026`, `handlePropReport` `2027` | None | Three chat listeners; meta order matters |
| TurnMarker | ready `787` | `handleInput` `773` | initiative page `769`, turn order `770`, lastmove `771`, destroy `772` | Also observes GroupInitiative directly |
| APILogic | ready `766` | `handleInput` `765` | None | Registers with ZeroFrame |
| ActionEconomyV2 | outer ready `1` | anonymous chat `9232` | turn order `9120`, graphic `9125`, Bar 1 `9143`, Bar 2 `9159`, add `9171`, destroy graphic `9179`, destroy character `9226` | Broad owner; Bar 1 overlaps TokenTriggers and explicit damage hooks |
| ZeroFrame | ready `1339` | `handleInput` `1337`, `handleBatchInput` `1358` | None | Meta orchestrator |
| SaveEffects | ready `1` | anonymous `!se` handler `198` | None | Critical integrations are explicit, not native bar listeners |
| MetaScriptToolbox | ready `148` | None | None | Library only |
| Executioner | ready `1` | anonymous `!executioner` handler `5` | None | Retain |
| HPManager | ready `1` | anonymous `!hp` handler `6` | None | Healing isolation is preserved |
| Auras | None | anonymous `!aura` handler `13` | None | Retain separate |
| AttackDamageResolver | ready `3` | anonymous template/`!adr` handler `15` | turn order `11` | Explicit damage hooks plus AE native fallback need dedupe review |
| SpawnDefaultToken | ready `1875` | `handleInput` `1872` | None | Callback behavior live-only |
| Dismiss | None | anonymous `!dismiss` handler `1` | None | Retain |
| AoEBoom | `checkInstall` `1378` | `handleInput` `1379` | graphic `handleTokenChange` `1380` | Geometry owner |
| MapChange | ready `1690` | `handleInput` `1680` | None | Retain |
| TokenActionBuilder | ready `111` | anonymous `!tab` handler `115` | None | Indirect command generator |
| Audit | ready `24` | anonymous `!stateaudit` handler `28` | None | Intentionally reads configured roots |
| StateWipe | ready `17` | anonymous admin handler `22` | None | Destructive admin tool; not integration state |
| BeaconAttributeTester | ready `6` | async anonymous `!btest` handler `15` | None | Live Beacon diagnostic only |
| DoorControl | ready `1` | anonymous `!doorctl` handler `5` | DoorSounds observes resulting door change | Keep separate |
| TokenTriggers | `checkInstall` `2282` | `handleInput` `2283` | Bar 1 `2284`, turn order `2285`, character destroy `2286`, graphic destroy `2287` | Missing explicit threshold API; native path must remain fallback |
| TokenAnimator | `checkInstall` `1153` | `handleInput` `1154` | graphic destroy `1155` | Timer behavior live-only |
| HandoutAccess | `checkInstall` `805` | `handleInput` `806` | None | Direct API is preferred for LootManager |
| TargetReport | ready `9` | async anonymous report handler `252` | None | Read-only |
| LootManager | ready `2898` | anonymous `!loot` handler `2890` | None | Uses direct HandoutAccess API |

### Handler Risks

- **Confirmed:** AE and TokenTriggers both listen to Bar 1; ADR/SaveEffects also intend explicit threshold delivery. This is the primary duplicate-processing risk.
- **Confirmed:** four helper globals are overwritten because SE, HPManager, and ADR declare same-named top-level functions. The load test currently allows these known transitions rather than proving they are safe.
- **Confirmed:** ScriptCards, SelectManager, Plugger, TokenMod, Fetch, Muler, and ZeroFrame legitimately register multiple or deferred handlers. Their counts are tested, but dynamic behavior remains only partially covered.
- **Requires verification:** native Roll20 dispatch order, ScriptCards dynamic trigger handlers, TokenMod observer timing, and API-generated chat identity/permissions.

## 5. Active-Script Integration Inventory

| Script | Commands / API | State, Beacon, bars | Direct/indirect dependencies | Test status |
|---|---|---|---|---|
| GroupInitiative | `!group-init*`; observer/roll API | `state.GroupInitiative`; no Beacon | TurnMarker observer | Load/API/handlers; live turn UI |
| SimpleSound | `!splay`, `!sstop`, `!swhisper`; setup API | `state.simpleSound`; Jukebox | AE/generated commands | Load/API; live audio |
| TokenMod | `!token-mod`; observer API | `state.TokenMod`; generic Bars 1-4/link mutation | ScriptCards observer | Load/API/handlers; live permissions/markers |
| ScriptCards | `!scriptcards`, `!scriptcard`, `!script`, `!sc-*`; async API | `state.ScriptCards`; generic bars/Beacon | TokenMod and dynamic commands | Load/resolved API; live programs/triggers |
| MathOps | meta math; `MathProcessor` | `state.MathOps`, `state.torii` | ZeroFrame | Load/API/handler |
| Plugger | meta plugin; rule API | `state.Plugger`, `state.torii` | ZeroFrame, registered rules | Load/API/handler |
| libTable | table API | `state.libTable`; no bars | Library consumers | Load/API only |
| Muler | `!mulerconfig`, meta get/set | `state.Muler`, `state.torii` | ZeroFrame/meta context | Load/handlers; live abilities |
| SelectManager | `!forselected`, meta routes; selection API | `state.SelectManager`, `state.torii` | ZeroFrame/API chat chains | Load/handlers; live selection |
| VectorMath | `VecMath` | Stateless | Geometry scripts | Load/API only |
| MatrixMath | `MatrixMath` | Stateless | PathMath/geometry | Load/API only |
| libInline | roll parser API | `state.torii`; no ownership | Parser consumers | Load/API only |
| PathMath | path commands/API | Stateless path data | VecMath/MatrixMath | Load/API/handler; live geometry |
| checkLightLevel | `!checklight`; `isLitBy` | Lighting reads only | PathMath, Plugger | Load/API/handler; live UDL |
| libTokenMarkers | marker lookup API | `state.libTokenMarkers` | Campaign marker registry | Load/API; live configuration |
| Messenger | formatting API | `state.Messenger`, `state.torii` | UI consumers | Load/API; live rendering |
| SmartAoE | `!smart*`; observer API | `state.SmartAoE`; paths/tokens | Geometry libraries, self relay | Load/API/handlers; live geometry |
| DoorSounds | `!doorsound`; play API | `state.DoorSounds`; Jukebox | DoorControl native event | Load/API/handlers; live doors/audio |
| Fetch | meta fetch API/data | `state.Fetch`, `state.torii`; legacy attributes, not Beacon API | ZeroFrame/Messenger | Load/API/handlers; live object permissions |
| TurnMarker | `!tm`, `!eot`, etc.; turn APIs | `state.TurnMarker`; dedicated marker bars | GroupInitiative | Load/API/handlers; live order/UI |
| APILogic | meta logic | `state.APILogic`, `state.torii` | ZeroFrame | Load/handlers |
| ActionEconomyV2 | `!ae*`; broad owner API | `state.ActionEconomyV2`; Bar 3 owner; limited Bar 1-2/Beacon | SaveEffects; called by core/AoE/report scripts | Load/API/handlers plus selected HP integrations; broad live matrix |
| ZeroFrame | meta loop; registration API | `state.ZeroFrame`, `state.torii` | Meta-toolchain | Load/API/handlers |
| SaveEffects | `!se`; `rollSave` | `state.SaveEffects.sources`; Bars 1-2/Beacon | AE, TokenTriggers intended; called by AE/AoEBoom | Scenario 05 plus load/API |
| MetaScriptToolbox | utility global | `state.MetaScriptToolbox`, `state.torii` | Meta-toolchain | Load/handler only |
| Executioner | `!executioner` | `state.Executioner` | Character abilities | Load/handlers; live ability routing |
| HPManager | `!hp` | `state.HPManager`; Bar 1/Beacon HP | AE classification/condition relay | Scenario 04 |
| Auras | `!aura` | Aura properties only | None | Load/handler; live presentation |
| AttackDamageResolver | templates/`!adr` | `state.AttackDamageResolver`; Bars 1-2/Beacon | AE and intended TokenTriggers | Scenarios 02/04 |
| SpawnDefaultToken | `!Spawn`; spawn API | token creation/bars 1-3; no state | AoEBoom, MapChange | Load/API; live callback |
| Dismiss | `!dismiss` | Deletes token | Generated commands | Load/handler; live permissions |
| AoEBoom | `!boom`; metadata | `state.AoEBoom.templates`; spell DC read | SE, AE, SpawnDefaultToken | Load/handlers; live geometry |
| MapChange | `!mapchange`, `!mc`; setup APIs | `state.MapChange` | SpawnDefaultToken | Load/API/handlers; live pages |
| TokenActionBuilder | `!tab`; metadata | ability objects | Generates ADR/SE/AE/sound commands | Load/handlers; live abilities |
| Audit | `!stateaudit` | Reads configured roots | All listed state roots | Load/handlers |
| StateWipe | `!statelist`, `!statewipe` | Deletes configured roots | Administrative only | Load/handlers; destructive live test only |
| BeaconAttributeTester | `!btest` | own snapshots; generic Beacon R/W | Beacon platform | Load/handlers; live required |
| DoorControl | `!doorctl` | door state | DoorSounds event | Load/handlers; live doors |
| TokenTriggers | `!tokentrigger`; config helpers | `state.TokenTriggers`; Bar 1 threshold presentation | AE classification; intended callers ADR/SE | Scenario 03; missing API asserted |
| TokenAnimator | `!tokenanimator`, `!tokensize`; animation API | `state.TokenAnimator` | Timers/page scale | Load/API/handlers; live cadence |
| HandoutAccess | `!handout`; reveal/hide API | handout permissions | LootManager | Load/API; live visibility |
| TargetReport | `!targetreport`, `!tr` | read-only Bars 1/4 and Beacon | AE status API | Load/handlers; live values/permissions |
| LootManager | `!loot`; inspect API | `state.LootManager`, token GM notes, Beacon GP/skill | HandoutAccess | Load/API/handlers; live concurrency/access |

## 6. Public API Audit

| Public global | Purpose / callers | Input and output behavior | Validation / error behavior | Disposition |
|---|---|---|---|---|
| `GroupInitiative` | Turn-order observation and token-ID rolls; TurnMarker calls observer | Callback or token IDs; observer registration / roll result | Source guards availability | Retain and document observer callback timing |
| `simpleSound` | Install/event setup; runtime sound is mainly command-driven | Setup functions; no typed playback result | Chat errors for missing tracks | Retain; later add narrow `play/stop` only if replacing AE relay |
| `TokenMod` | Generic mutation observer; ScriptCards caller | Callback receives token and previous properties | Consumer guards API | Retain observer; do not make it a mechanics owner |
| `ScriptCards` | Trigger observer on resolved async IIFE | Promise resolves to object with `ObserveTokenChange` | Direct synchronous global member is not established | Requires verification; document Promise shape before external use |
| `MathOps` | Math meta processor | Meta message/content to rewritten result | Meta-toolchain error cards | Retain |
| `Plugger` | Rule registration/dispatch | Functions/rules to registered handlers | Rule-specific behavior | Retain; document registration order |
| `libTable` | Table/item lookup | Lookup criteria to table/item data | Library-specific empty results | Retain |
| `SelectManager` | Selection/sender/player context | Message/context to selected/who/player ID | Empty context fallbacks | Retain; narrow documentation |
| `VecMath` | Vector operations | Numeric vectors to numeric vectors/scalars | Library semantics | Retain |
| `MatrixMath` | Matrix transforms | Numeric matrices/vectors to transforms | Library semantics | Retain |
| `libInline` | Inline-roll parsing | Roll structures to parsed values | Library fallbacks | Retain |
| `PathMath` | Geometry operations/classes | Paths/points to geometry | Platform path shape dependent | Retain; live geometry verification |
| `checkLightLevel` | Light query | Token/position to light-source result | Depends on page/path state | Retain; live-only correctness |
| `libTokenMarkers` | Marker lookup | marker name/tag to records | Empty/not-found results | Retain |
| `Messenger` | Chat UI construction | Structured style/content to HTML | Rendering is live-only | Retain |
| `SmartAoE` | Token-change observer | Callback registration | Platform geometry/event timing | Retain |
| `DoorSounds` | Programmatic sound group playback | Group/open-state inputs; side-effect output | Missing track/group errors | Retain; document return if externally expanded |
| `Fetch` | Meta object/property registries | Object/property metadata | Legacy attribute helper is not Beacon-safe | Retain; explicitly prohibit Beacon use |
| `TurnMarker` / `TurnOrder` | Marker controls and turn-order get/set/navigation | Campaign order and operations | Live turn-order semantics | Retain |
| `ActionEconomyV2API` | AE-owned saves/effects/traits/attacks/damage/movement/summons/status; core/AoE/report callers | Mixed token objects/IDs/options; mixed booleans, objects, or side effects | Callers generally guard methods; return/error shapes vary | Retain but document by domain, remove duplicate assignments, add narrow mutation APIs instead of chat relays |
| `ZeroFrame` | Meta-op registration | Handler plus priority/handled tags | Startup/order dependent | Retain |
| `SaveEffectsAPI` | `rollSave`; AE caller | Config object to async result; validates target/save/DC/bonus | GM error cards plus result/failure | Retain; later add structured batch/condition-save APIs for AoEBoom |
| `SpawnDefaultToken` | Programmatic default-token spawn; AoEBoom/MapChange callers | Options object to spawn side effect | Missing source/default token and callback errors; exact completion contract unclear | Retain; define Promise/result contract after live callback trace |
| `AoEBoom` | Version metadata, not a mechanical API | Version value | N/A | Retain metadata only; do not invent broad API |
| `MapChange` | Install/map/event setup | Setup calls and map reconstruction | Mostly internal lifecycle | Retain for compatibility; verify external callers before narrowing |
| `TokenActionBuilder` | Version metadata | Version value | N/A | Retain metadata only |
| `TokenTriggers` | Configuration/query/manual trigger helpers | Character/token IDs to config objects/booleans | Invalid IDs generally return null/false | Retain admin/query helpers; do not use as the damage integration contract |
| `TokenTriggersAPI` | Intended generic threshold transition for ADR/SE | Proposed existing signature `(token, oldHp, newHp) -> final numeric HP` | Must validate token/transition and safely return `newHp` on non-applicable input | **Missing; restore as Phase 1** |
| `TokenAnimator` | Animation/baseline methods | Token IDs/options to animation side effects | Timer/platform dependent | Retain; document cancellation/result semantics |
| `HandoutAccess` | Reveal/hide/reference access; LootManager caller | Handout/reference and recipient inputs to structured result/side effect | Rejects invalid/unauthorized inputs and reports ambiguity | Retain; good narrow boundary |
| `LootManager` | Read-only programmatic inspection | Token ID to inspection data/failure | Invalid token/container handling | Retain |

## 7. Simplification Opportunities

### S1 — Implement Generic TokenTriggers Compatibility Contract

**Value:** High  
**Category:** Confirmed by active code  
**Recommendation:** Address now (Phase 1)

- **Current problem:** ADR and SaveEffects call a missing global API; native Bar 1 timing is not sufficient for critical threshold delivery.
- **Scripts/functions:** ADR `processTokenTriggersBar1Change` (`1403-1417`); SaveEffects equivalent (`1250-1264`); TokenTriggers `handleBar1Change` (`1400-1451`).
- **Simpler contract:** `TokenTriggersAPI.processBar1Change(token, oldHp, newHp) -> finalHp`, implemented as a thin entry into one private TokenTriggers transition processor. The native event handler delegates to the same processor.
- **Remove/consolidate/document:** consolidate native and explicit threshold evaluation; document one numeric fallback/result and duplicate-transition suppression.
- **Ownership impact:** none. TokenTriggers remains the only threshold owner. ADR/SE remain generic and must not name or test individual TokenTriggers features.
- **Compatibility risk:** medium because direct and native delivery may both occur; current callers already guard the missing API.
- **Failure-point reduction:** removes the missing interface and prevents feature-by-feature dependencies in damage scripts.
- **Local tests:** API presence/type; invalid input returns requested HP; explicit/native equivalence inside TokenTriggers; one evaluation when both paths observe one transition; generic ADR/SE call/fallback tests with no threshold-feature knowledge.
- **Live tests:** linked PC, represented unlinked NPC, generic token; direct damage and manual Bar 1 change; verify one TokenTriggers outcome and stable Beacon/bar values.

### S2 — Remove Shared Global Helper Collisions

**Value:** High  
**Category:** Confirmed by active code and current load manifest  
**Recommendation:** Address immediately after S1

- **Current problem:** load order replaces four same-named helpers: HPManager replaces SE `replaceInlineRolls`; ADR replaces `replaceInlineRolls`, `getAeModifiedDamage`, and `processTokenTriggersBar1Change`.
- **Scripts/functions:** `SaveEffects1.3.js`, `HPManager1.1.js`, `AttackDamageResolver1.3.js`; current manifest `allowedOverwrites` records the collisions.
- **Simpler contract:** rename helpers with script prefixes or place each script's private helpers inside its own IIFE. Prefer the smallest mechanical rename first.
- **Remove/consolidate/document:** remove all four allowed-overwrite exceptions from the active-script manifest.
- **Ownership impact:** none.
- **Compatibility risk:** low if only private references are renamed; higher for broad IIFE conversion.
- **Failure-point reduction:** removes hidden dependency on installation order for critical damage parsing and integration wrappers.
- **Local tests:** all-script load with zero allowed helper overwrites; existing 14 scenarios unchanged; parser tests for each owner.
- **Live tests:** one ADR damage, one SE damage save, one HP command after sandbox restart.

### S3 — Add Narrow AE Mutation APIs and Remove Owner Relays

**Value:** High  
**Category:** Confirmed by active code  
**Recommendation:** Later, in small method-by-method revisions

- **Current problem:** SaveEffects and HPManager serialize AE-owned operations into chat commands, losing structured validation, return values, and direct error handling. AE also relays to its own handler.
- **Scripts/functions:** SE ongoing/condition/concentration relays (`592`, `1021-1030`, `1638`, `2224`); HPManager Lay on Hands (`265`); AE self concentration relay (`3285`).
- **Simpler contract:** narrow methods such as `applyCondition(config)`, `removeCondition(tokenId, key)`, `setConcentration(sourceTokenId)`, and `removeOngoing(tokenId, name)` returning `{ok, changed, reason}`.
- **Remove/consolidate/document:** remove only the migrated `sendChat` relays; keep human-facing AE commands as adapters to the same owner functions.
- **Ownership impact:** strengthens AE ownership; callers do not write AE state.
- **Compatibility risk:** medium; command parsing currently supplies normalization and cards that APIs must preserve intentionally.
- **Failure-point reduction:** removes chat scheduling, parsing, speaker, and permission ambiguity from owner-to-owner calls.
- **Local tests:** valid/invalid API inputs, idempotent removal, caller error handling, unchanged chat adapters, no duplicate effect application.
- **Live tests:** failed save consequence/duration cleanup, Lay on Hands poison removal, concentration lifecycle, GM/player cards.

### S4 — Add Structured SaveEffects APIs for AE and AoEBoom

**Value:** High  
**Category:** Confirmed by active code  
**Recommendation:** Later, after S3

- **Current problem:** AE and AoEBoom serialize already-structured saves, ongoing damage, hazards, AoEs, and checks into `!se` commands, adding parsing and chat-order failure points.
- **Scripts/functions:** AE ongoing damage (`3333-3351`), AoE hazards (`5036-5064`), directional hazards (`5370-5386`), AE AoE (`5754-5792`), and disarm (`8177-8185`); AoEBoom `handleBurst` (`1131-1198`) and template apply (`1200-1268`); SaveEffects chat routes.
- **Simpler contract:** `SaveEffectsAPI.resolveDamageBatch(config)` and `resolveConditionSave(config)` returning async `{ok, results, errors}`. Existing `!se` handlers become input adapters.
- **Remove/consolidate/document:** remove fixed AE/AoEBoom-to-SE command construction one route at a time. Retain arbitrary apply-ability and configured save hooks as intentional extensions.
- **Ownership impact:** none; AE/AoEBoom supply owned context/targets, SaveEffects owns save resolution.
- **Compatibility risk:** medium due hooks, source identity, cards, and asynchronous multi-target behavior.
- **Failure-point reduction:** removes quoting/tokenization/API-chat identity issues and exposes per-target errors.
- **Local tests:** target list, partial invalid targets, save/damage outcomes, hooks, API absent/failure behavior.
- **Live tests:** path targeting, selected targets, cards, FX, Beacon damage, AE consequences.

### S5 — Standardize HP/Bar/Beacon Storage Semantics

**Value:** Medium to High  
**Category:** Requires verification  
**Recommendation:** Investigate after live linked/unlinked matrix; do not implement yet

- **Current problem:** ADR, SaveEffects, and HPManager duplicate storage ordering and differ in awaiting Beacon writes and Bar max handling.
- **Scripts/functions:** ADR `applyDamageToToken`; SE `seApplyDamageToToken`; HPManager `setTokenHp`.
- **Simpler contract:** only after verifying link semantics, consider a narrow mechanics-free health storage helper with explicit `read`/`write` results. It must not own damage, healing, thresholds, or concentration.
- **Remove/consolidate/document:** shared token/Beacon synchronization only; no mechanic transfer.
- **Ownership impact:** potentially sensitive; no existing owner is appropriate for all health mechanics.
- **Compatibility risk:** high until represented-but-unlinked Beacon behavior is proven.
- **Failure-point reduction:** could remove duplicated async ordering and inconsistent max-value behavior.
- **Local tests:** represented/unrepresented fixtures, current/max preservation, rejected Beacon writes, rollback results.
- **Live tests:** mandatory linked PC, linked ally, represented-unlinked NPC, generic token.

### S6 — Normalize Public API Results and Export Sites

**Value:** Medium  
**Category:** Confirmed by active code  
**Recommendation:** Later, opportunistically with owning-script revisions

- **Current problem:** public methods mix booleans, objects, side effects, and chat-only errors. AE assigns `hasEffect` and `hasConditionImmunity` more than once (`ActionEconomyV2.8.2.js:2877-2881`, `2970-2974`).
- **Simpler contract:** one export site per owner and documented input/result/error shapes; mutation APIs return `{ok, changed, reason}`.
- **Remove/consolidate/document:** duplicate assignments and unused public surface only after caller search and compatibility review.
- **Ownership impact:** none.
- **Compatibility risk:** medium if return shapes change; preserve existing callers with adapters.
- **Failure-point reduction:** fewer accidental overwrites and ambiguous failures.
- **Tests:** manifest member/type contracts, invalid input, caller fallback; live smoke for external macros/scripts.

### S7 — Define SpawnDefaultToken Completion Contract

**Value:** Medium  
**Category:** Requires verification  
**Recommendation:** Later

- **Current problem:** AoEBoom and MapChange call `spawnAtXY`, but exact callback completion/error behavior is platform-dependent.
- **Simpler contract:** Promise or callback result `{ok, tokenId, reason}` while preserving existing calls.
- **Ownership impact:** none.
- **Compatibility risk:** medium; Roll20 default-token callback timing is live-only.
- **Failure-point reduction:** lets callers distinguish queued, created, and failed spawns.
- **Tests:** mocked callback success/failure/timeout; live default-token callback and links.

### S8 — Document Generic Relay Surfaces Instead of Centralizing Them

**Value:** Medium  
**Category:** Confirmed plus live-dependent content  
**Recommendation:** Later documentation/test fixtures

- **Current problem:** AoEBoom apply abilities, ScriptCards, SelectManager, SmartAoE, and generated token actions can emit commands whose downstream behavior depends on dynamic content.
- **Simpler contract:** maintain explicit allow/ownership documentation and representative fixtures; do not add a universal bus.
- **Ownership impact:** none.
- **Compatibility risk:** low for documentation; high for restrictions without campaign inventory.
- **Failure-point reduction:** makes dynamic dependencies visible without breaking extensibility.
- **Tests:** representative ability/ScriptCards/meta fixtures; live permissions and target expansion.

### Unsupported Recommendations Removed from Roadmap

- Merge AE, ADR, SaveEffects, HPManager, AoEBoom, or TokenTriggers.
- Add a universal event/message bus or central game-mechanics script.
- Let ADR or SaveEffects understand Relentless Endurance, Bloodied, HP-zero presentation, or future TokenTriggers features.
- Let SaveEffects own AE conditions/durations/cleanup.
- Remove native Bar 1 handlers and rely only on optional APIs.
- Share or duplicate owner state to signal work.
- Auto-synchronize Beacon and token bars in the local harness.

## 8. Recommended Target Architecture

### 8.1 Threshold Delivery

Before:

```text
ADR/SaveEffects -> missing TokenTriggersAPI (optional no-op)
token.set(Bar 1) -> native change event -> private TokenTriggers handler
                                   `-> timing/duplicate uncertainty
```

After:

```text
ADR/SaveEffects -> TokenTriggersAPI.processBar1Change(token, oldHp, newHp)
                                      |
native Bar 1 event -------------------+
                                      v
                  one TokenTriggers-owned transition processor
                       -> final numeric HP + one threshold outcome
```

Proposed compatibility contract:

```javascript
TokenTriggersAPI.processBar1Change(token, oldHp, newHp) -> number
```

- validates token and numeric transition;
- returns `newHp` when the token is not applicable;
- evaluates all current and future threshold features internally;
- returns the final numeric Bar 1 result;
- suppresses duplicate processing of the matching explicit/native transition;
- exposes no feature-specific flags to ADR or SaveEffects.

### 8.2 AE-Owned Consequences

Before:

```text
SaveEffects/HPManager -> sendChat("!ae-...") -> AE chat parser -> AE owner function
AE internal code      -> sendChat("!ae-...") -> AE chat parser -> AE owner function
```

After:

```text
SaveEffects/HPManager -> narrow ActionEconomyV2API method -> AE owner function
human macro/chat      -> AE chat parser -------------------> same owner function
AE internal code      ------------------------------------> same owner function
```

Example result shape:

```javascript
ActionEconomyV2API.removeCondition({ tokenId, condition, source })
// -> { ok: true, changed: true, reason: "removed" }
```

### 8.3 AoE Save Resolution

Before:

```text
AoEBoom geometry -> serialize !se command -> sendChat -> SE parser -> save/damage owner
```

After:

```text
AoEBoom geometry -> SaveEffectsAPI.resolveDamageBatch(config) -> save/damage owner
human macros      -> !se parser ------------------------------> same owner function
```

The arbitrary AoEBoom apply-ability relay remains separate and explicitly dynamic.

### 8.4 Private Helper Scope

Before:

```text
SE helper globals -> HPManager overwrites one -> ADR overwrites three
```

After:

```text
SE private/prefixed helpers
HPManager private/prefixed helpers
ADR private/prefixed helpers
shared sandbox contains only intentional public APIs
```

## 9. Implementation Roadmap

### Phase 1 — Implement TokenTriggers' Expected Generic Transition API

- **Affected production script:** `TokenTriggers1.3.2.js` only; expected patch revision `TokenTriggers1.3.3.js`.
- **Scope:** one private transition processor, native-handler delegation, `TokenTriggersAPI.processBar1Change`, transition deduplication, stable numeric return. No threshold-feature code in ADR/SaveEffects.
- **Tests:** update the public manifest/API contract; replace API-absence assertions; add TokenTriggers-owned explicit/native equivalence and dedupe tests; retain generic ADR/SE fallback/call compatibility without feature-specific cases.
- **Architecture/changelog:** update command/API and ownership registries, system overview limitation, test/live checklist, and canonical changelog.
- **Archive/version:** archive unchanged `TokenTriggers1.3.2.js`; install only `TokenTriggers1.3.3.js`.
- **Live verification:** direct Bar 1 edit plus ADR and SE damage on linked PC, represented-unlinked NPC, and generic token; verify exactly one threshold outcome.
- **Rollback:** restore 1.3.2 as the sole active TokenTriggers file and revert the matching contract/test/doc changes.

### Phase 2 — Remove Four Shared-Global Helper Overwrites

- **Affected scripts:** SaveEffects, HPManager, ADR; patch revisions under repository version rules.
- **Scope:** private or script-prefixed helper names only; no behavior redesign.
- **Tests:** manifest must reject all four former overwrites; full 14-test regression suite plus owner parser/damage/healing scenarios.
- **Archive/changelog:** archive each replaced active file and add one coordinated changelog entry.
- **Live verification:** restart, one `!se` damage/save, one `!hp` operation, one ADR apply/undo.
- **Rollback:** restore the three archived active versions together.

### Phase 3 — Add Narrow AE Mutation APIs and Migrate One Relay at a Time

- **Affected scripts:** AE first; then SaveEffects and HPManager in separate independently testable patches.
- **Scope order:** AE self-concentration call; HPManager poison removal; SE condition removal; SE concentration/apply-condition; SE ongoing removal.
- **Tests:** API result/error contracts, legacy chat adapter equivalence, caller failure handling, no duplicate effects, healing no-concentration boundary.
- **Versioning:** likely AE minor revision for new public API, caller patch/minor revisions according to compatibility impact; archive/changelog each phase.
- **Live verification:** exact owner commands and direct callers with GM/player cards, duration cleanup, and concentration.
- **Rollback:** each caller may return to its documented chat relay while AE retains backward-compatible commands.

### Phase 4 — Add SaveEffects Structured APIs and Migrate AE/AoEBoom Routes

- **Affected scripts:** SaveEffects, ActionEconomyV2, and AoEBoom, revised one caller route at a time.
- **Scope order:** AE ongoing damage; AE hazard damage/save; AE AoE; AE disarm check; AoEBoom burst/template routes.
- **Tests:** single/multi-target success and partial failure, hook inputs, damage/condition ownership, API unavailable path, no duplicate cards, and legacy command-adapter equivalence.
- **Versioning/archive/changelog:** add the structured API in a SaveEffects minor revision; migrate AE and AoEBoom through separately versioned patch/minor revisions according to compatibility impact. Archive every replaced active `.js` file before installing its replacement and record each coordinated step in the canonical changelog.
- **Live verification:** burst/template geometry, Beacon damage, AE consequence cleanup, FX/path behavior.
- **Rollback:** restore the affected caller's archived version to return that route to its existing `!se` relay; retain backward-compatible SaveEffects commands throughout the phase.

### Phase 5 — Decide HP Storage Consolidation from Live Evidence

- **Affected scripts:** investigation first; ADR/SE/HPManager only if a safe link contract is established.
- **Tests:** linked, represented-unlinked, and generic storage matrix; async failure and max-value preservation.
- **Version/archive/changelog:** none until the evidence supports a concrete narrow helper.
- **Rollback:** not applicable to the investigation phase.

### Phase 6 — Expand Dynamic Relay Fixtures and API Documentation

- **Affected scripts:** AoEBoom, ScriptCards, SelectManager, SmartAoE, TokenActionBuilder as evidence requires.
- **Scope:** documentation and representative tests; no central relay abstraction.
- **Live verification:** actual campaign abilities, selected/target expansion, permissions, templates, geometry.

## 10. Unresolved Questions

| Evidence gap | Relevant source | Smallest resolving test |
|---|---|---|
| Actual Roll20 ordering between explicit threshold API and native Bar 1 event | AE Bar 1 handler `9143+`; TokenTriggers `1400-1451`; ADR/SE setters | Instrument one linked-token damage in the Test Ground and record hook/event order and count |
| Reliable distinction between linked Beacon token and represented-but-unlinked token | ADR `1420-1466`; SE `1267-1322`; HPManager `204-212` | Compare identical operations on one linked PC and one represented-unlinked NPC, recording bars and sheet values |
| PC/ally classification effect on defeated turn order | TokenTriggers `352-359` and defeated-token path | HP-zero a configured PC, ally, hostile NPC, and generic token in turn order |
| Dynamic AoEBoom apply-ability destinations | AoEBoom `923-963` | Inventory one live caster's configured apply ability and execute it in the Test Ground |
| ScriptCards direct global API usability and dynamic handler set | ScriptCards async IIFE and `1176-1219` | Live startup probe plus a `ScriptCards_Triggers` fixture |
| SpawnDefaultToken completion/result timing | `SpawnDefaultToken.spawnAtXY`; AoEBoom/MapChange callers | Spawn one linked default token and record callback, created object, bar links, and caller timing |
| Whether all AE public methods have external callers | AE export sites `1975-2003`, `2970-3028`, `7397-7417` | Repository plus live macro/ability inventory before removing or narrowing any member |
| Meta-toolchain deferred registration/ordering | SelectManager `1097-1129`, ZeroFrame/meta registrations | One live chained MathOps/Plugger/Muler/SelectManager/Fetch command with registration logs |

## 11. Validation Results

The existing tests were run without modification:

- `npm.cmd test` from `tests/`: **14 passed, 0 failed**.
- `npm.cmd run test:load` from `tests/`: **4 passed, 0 failed**.
- All 43 active scripts loaded together in the documented order with no startup exception in the local mock.
- The passing public-contract test intentionally confirms that `TokenTriggersAPI` is absent. That is a detected production integration mismatch, not proof that the missing interface is acceptable.

Harness limitations remain: it does not prove Beacon worker synchronization, Roll20 event scheduling, API-generated chat identity, selected/target expansion, permissions, UI/templates, FX/audio, paths/doors/dynamic lighting, default-token callbacks, handout visibility, or actual turn-order UI behavior.

## 12. Final Recommendation

Proceed with **Phase 1 only** as the next implementation task: implement the expected narrow generic TokenTriggers compatibility API inside TokenTriggers, route both native and explicit delivery through one TokenTriggers-owned processor, and add TokenTriggers-level equivalence/deduplication coverage. Do not add Relentless Endurance or any other threshold-feature knowledge to ADR or SaveEffects.
