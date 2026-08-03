# Live Roll20 Verification

## Dedicated Test Game

Use the permanent dedicated **Roll20 API Test Ground** described in the [setup and checklist](../Roll20%20Test%20Game%20Setup%20and%20Checklist.md). It mirrors the production sheet type, installed Mods, API upload order, macros, FX definitions, page settings, and representative permissions. Do not use production as the first verification environment.

Record before each integration test:

- enabled script filenames and upload order;
- active script versions and relevant state schema versions;
- Beacon sheet version and PC/NPC type;
- page scale, grid, dynamic-lighting mode, and relevant token links;
- player/GM identity and token control;
- initial bars, sheet values, state, turn order, paths, doors, handouts, and tracks.

## Core Verification Checklist

### Startup and registration

1. Restart the API sandbox.
2. Confirm each intended script logs one ready message and no redeclaration/runtime error.
3. Exercise each changed command once as GM and, where allowed, as a player.
4. Confirm no duplicate chat cards, state mutations, sounds, FX, or handlers.

Expected: one intended registration and one result per invocation, with no batch, archive, or duplicate upload enabled.

### Beacon and token bars

1. Test a represented Beacon PC, a represented NPC, and an unlinked NPC token.
2. Compare bars 1–4 and relevant `getSheetItem` values before and after the operation.
3. Repeat using direct sheet change, token-bar change, owning-script command, and cross-script API/command where applicable.
4. Observe delayed sheet synchronization and subsequent `token.set()` ordering.

Expected: bar 1 remains HP, bar 2 temporary HP, bar 3 AE movement, and bar 4 AC; represented sheet values synchronize as designed; unlinked NPCs retain bar-only values; no transition processes twice.

### Damage, healing, saves, and thresholds

1. Apply normal damage, temp-HP absorption, prevention/resistance/immunity, save-based damage, and damage undo.
2. Cross HP-zero and bloodied thresholds, including repeated and reversed transitions.
3. Damage a concentrating target, then heal it through HPManager.
4. Exercise both ADR and SaveEffects paths and inspect AE/TokenTriggers results.

Expected: damage hooks and native bar events deduplicate; damage may trigger concentration/threshold mechanics exactly once; healing does not trigger concentration; undo restores the owned values and dependent presentation as documented.

### Roll20-only platform behavior

Verify with representative GM and player accounts:

- selected/target expansion and API-generated chat;
- handout visibility and links;
- FX, path geometry, grid scaling, and SmartAoE/AoEBoom movement;
- dynamic lighting and map transitions;
- doors and secret-door behavior;
- Jukebox track permissions/playback;
- default-token asynchronous callbacks and spawning;
- ScriptCards templates, handout reload, triggers, and UI rendering;
- TokenAnimator timers, page scaling, and cancellation;
- turn-order changes, GroupInitiative, and TurnMarker interaction.

## Current Required Live Investigations

1. Confirm the live API-script panel contains the same 43 individual files in the registry order and contains no combined batch, archive, or obsolete duplicate.
2. Confirm `TokenTriggersAPI.processBar1Change` exists after startup, then exercise ADR and SaveEffects damage with both observed native-event orderings. Expected: each Bar 1 transition produces one TokenTriggers result, and a TokenTriggers-adjusted final HP is the value returned to the caller. Record the actual Roll20 event and Beacon synchronization order.
3. Restart the sandbox and confirm the meta-toolchain globals register in order: MathOps/Plugger/libTable/Muler/SelectManager/VectorMath/MatrixMath/libInline/PathMath/checkLightLevel/libTokenMarkers/Messenger/Fetch/TurnMarker/APILogic/ZeroFrame/MetaScriptToolbox.

Record results as a dated report under `Guides and Notes/Audits/`. Link confirmed durable contracts back into the registries; do not make the audit itself the source of truth.
