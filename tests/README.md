# Roll20 Local Test Ground

This dependency-free Node test suite loads the 43 active `Scripts/*.js` files together in their documented Roll20 installation order. It is a regression aid, not a Roll20 emulator and not proof of live-game behavior.

Run it with `npm.cmd test` from this directory on Windows, or `node run-tests.js` on any supported Node runtime. Run the startup contract alone with `npm.cmd run test:load`.

## What It Covers

- one shared VM runtime for the active-script load order, startup exceptions, deliberate global exposure, documented public APIs, and key handler registrations;
- exact agreement between the manifest and the root `Scripts/*.js` inventory;
- per-script global ownership, bounded legacy overwrite exceptions, typed API members, and source-attributed handler counts after empty-fixture ready processing;
- a controlled event bus, chat capture, object store, deterministic timers/random values/time, state, and async Beacon read/write recording;
- ADR temporary-HP-before-HP application and its lethal explicit AE handoff;
- HPManager healing and the no-AE-damage-processing boundary;
- SaveEffects damage application and its lethal AE handoff without SaveEffects taking AE condition ownership;
- TokenTriggers' bar-1 subscription and its confirmed unrepresented-token guard;
- ordinary represented-token HP-zero presentation through `!tokentrigger enable TOKEN_ID`, including dead-side selection, Bar 1 clearing, and restore;
- configured represented-token Relentless Endurance through `!tokentrigger relentlessenable TOKEN_ID`;
- ADR damage undo across owned bars and represented Beacon current/max writes;
- represented Beacon-PC and unlinked-NPC bar behavior; and
- the current `TokenTriggersAPI` mismatch: the active files expose `TokenTriggers`, while ADR and SaveEffects only make an optional call to `TokenTriggersAPI.processBar1Change`.

Every scenario includes a source/registry evidence comment. The active files and the Architecture registry remain the technical source of truth; the manifest makes the test load order, global ownership, allowed legacy overwrites, typed public APIs, and handler owners explicit. ScriptCards is an active-source async IIFE: the local contract awaits its Promise and validates the resolved `ObserveTokenChange` function. Direct synchronous `ScriptCards.ObserveTokenChange` availability remains a current integration limitation that requires live verification; the harness does not replace or alias the global.

## Mock Classification and Limits

The mocks are classified in their source:

- Confirmed subset: `on`, controlled event dispatch, `state`, `getObj`, `findObjs`, `createObj`, `remove`, `get`, `set`, `Campaign`, `sendChat`, and async `getSheetItem`/`setSheetItem` reflect the active scripts' required interfaces.
- Intentional simplifications: events are synchronous and opt-in for object mutations; chat records raw messages but does not expand macros/templates; timers, random values, and `Date.now()` are deterministic; Beacon storage does not synchronize token bars.
- Unsupported platform behavior: Roll20 sandbox scheduling/restarts, Beacon sheet-worker behavior, permissions, selected/target substitution, template/UI rendering, actual FX/audio/pings, default-token callbacks, paths/doors/dynamic lighting, page scaling, and turn-order UI.

Generated local output belongs only in `tests/reports/`. It is ignored by Git except for `.gitkeep`.

## Next-Phase Coverage

The present scenarios verify the current Relentless Endurance command and Bar-1-only outcome, but do not claim a real native-event duplicate-suppression result or full command/UI behavior. The precise missing capabilities are: a scheduler model that can compare explicit ADR/SE hooks with native bar-change dispatch in a documented Roll20 ordering, and Roll20 macro/template substitution.

The next improvement-review task is: add a controlled explicit-hook-versus-native-bar-event schedule matrix for ADR, SaveEffects, AE, and TokenTriggers, with deduplication assertions separated from the live Roll20 event-order result.

See the canonical [Test Strategy](../Guides%20and%20Notes/Architecture/Test-Strategy.md) and the live [Roll20 API Test Ground checklist](../Guides%20and%20Notes/Roll20%20Test%20Game%20Setup%20and%20Checklist.md).
